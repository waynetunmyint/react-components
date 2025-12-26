// app/_services/ChatGroupNotificationService.ts
import { initFirebaseAdmin } from "@/app/_firebase/firebaseAdmin";
import { query } from "@/db";

export interface ChatGroupNotificationParams {
  chatGroupId: string;
  senderEmail: string;
  message: string;
  appName?: string;
  chunkSize?: number;
}

export interface MemberTokenStats {
  email: string;
  tokens: string[];
  sent: number;
  failed: number;
  tokensFailed: string[];
}

export interface ChatGroupNotificationResult {
  status: "success" | "no_tokens" | "no_sender_email" | "invalid_chat_group_id" | "error";
  profile?: string;
  totalSent: number;
  totalFailed: number;
  removedTokens: number;
  timestamp: string;
  chatGroupMembers?: any[];
  memberTokenStats: MemberTokenStats[];
  error?: string;
  details?: string;
}

export class ChatGroupNotificationServiceComp {
  /**
   * Send notification to chat group members when a new message is created
   * Handles all data fetching, token collection, and notification sending
   */
  static async sendChatGroupNotification(
    params: ChatGroupNotificationParams
  ): Promise<ChatGroupNotificationResult> {
    try {
      const {
        chatGroupId,
        senderEmail,
        message,
        appName = "ConnexBiz",
        chunkSize = 500,
      } = params;

      // Validate sender email
      if (!senderEmail) {
        return {
          status: "no_sender_email",
          totalSent: 0,
          totalFailed: 0,
          removedTokens: 0,
          timestamp: new Date().toISOString(),
          memberTokenStats: [],
        };
      }

      // --- Fetch Chat Group Information ---
      const chatGroupResult: any[] = await query(
        "SELECT * FROM ChatGroups WHERE Id=? LIMIT 1",
        [chatGroupId]
      );
      
      if (chatGroupResult.length === 0) {
        return {
          status: "invalid_chat_group_id",
          totalSent: 0,
          totalFailed: 0,
          removedTokens: 0,
          timestamp: new Date().toISOString(),
          memberTokenStats: [],
          error: "invalid_chat_group_id",
        };
      }
      
      const chatGroup = chatGroupResult[0];

      // --- Fetch sender profile ---
      const profileResult: any[] = await query(
        "SELECT Name FROM Profiles WHERE Email=? LIMIT 1",
        [senderEmail]
      );
      const profileName = profileResult?.[0]?.Name?.toString() ?? "New Message";

      // --- Fetch group members ---
      const groupMembers: any[] = await query(
        "SELECT ProfileEmail FROM ChatGroupMembers WHERE ChatGroupId = ? AND NotificationStatus != '0'",
        [chatGroupId]
      );

      // --- Collect Firebase tokens for all members except sender ---
      const memberTokens = await this.collectTokensForMembers(
        groupMembers,
        senderEmail,
        appName
      );

      // Initialize result object
      const result: ChatGroupNotificationResult = {
        status: memberTokens.length > 0 ? "success" : "no_tokens",
        profile: profileName,
        totalSent: 0,
        totalFailed: 0,
        removedTokens: 0,
        timestamp: new Date().toISOString(),
        chatGroupMembers: groupMembers,
        memberTokenStats: [],
      };

      // If no tokens, return early
      if (memberTokens.length === 0) {
        return result;
      }

      // --- Prepare notification content ---
      const title = chatGroup?.Title + "-" + profileName;
      const description =
        message.length > 100 ? message.slice(0, 100) + "…" : message;
      const url = `/chatGroup/view/${chatGroupId}`;

      // --- Send notifications ---
      const notificationResult = await this.sendNotifications(
        memberTokens,
        { title, body: description, url },
        appName,
        chunkSize
      );

      return {
        ...result,
        ...notificationResult,
      };
    } catch (err: any) {
      return {
        status: "error",
        totalSent: 0,
        totalFailed: 0,
        removedTokens: 0,
        timestamp: new Date().toISOString(),
        memberTokenStats: [],
        error: "notification_failed",
        details: err.message ?? String(err),
      };
    }
  }

  /**
   * Collect Firebase tokens for group members
   */
  private static async collectTokensForMembers(
    groupMembers: any[],
    senderEmail: string,
    appName: string
  ): Promise<{ email: string; tokens: string[] }[]> {
    const memberTokens: { email: string; tokens: string[] }[] = [];

    for (const member of groupMembers) {
      const email = member.ProfileEmail;
      
      // Skip sender
      if (email === senderEmail) continue;

      const tokenResult: any[] = await query(
        "SELECT Token FROM FirebaseTokens WHERE AppName=? AND ProfileEmail=?",
        [appName, email]
      );
      
      const tokens = tokenResult.map((r) => r.Token).filter(Boolean);
      
      if (tokens.length > 0) {
        memberTokens.push({ email, tokens });
      }
    }

    return memberTokens;
  }

  /**
   * Send notifications to collected tokens
   */
  private static async sendNotifications(
    memberTokens: { email: string; tokens: string[] }[],
    notification: { title: string; body: string; url: string },
    appName: string,
    chunkSize: number
  ): Promise<{
    totalSent: number;
    totalFailed: number;
    removedTokens: number;
    memberTokenStats: MemberTokenStats[];
  }> {
    const firebaseAdmin = initFirebaseAdmin(appName);
    const removedTokensAll: string[] = [];
    const memberTokenStats: MemberTokenStats[] = [];

    let totalSent = 0;
    let totalFailed = 0;

    // Send notifications per member
    for (const member of memberTokens) {
      const memberStats: MemberTokenStats = {
        email: member.email,
        tokens: member.tokens,
        sent: 0,
        failed: 0,
        tokensFailed: [],
      };

      // Process tokens in chunks
      for (let i = 0; i < member.tokens.length; i += chunkSize) {
        const chunk = member.tokens.slice(i, i + chunkSize);

        const response = await firebaseAdmin
          .messaging()
          .sendEachForMulticast({
            notification: {
              title: notification.title,
              body: notification.body,
            },
            data: { url: notification.url },
            tokens: chunk,
          });

        memberStats.sent += response.successCount;
        memberStats.failed += response.failureCount;
        totalSent += response.successCount;
        totalFailed += response.failureCount;

        // Collect failed tokens
        response.responses.forEach((res, idx) => {
          if (
            !res.success &&
            res.error?.code === "messaging/registration-token-not-registered"
          ) {
            removedTokensAll.push(chunk[idx]);
            memberStats.tokensFailed.push(chunk[idx]);
          }
        });
      }

      memberTokenStats.push(memberStats);
    }

    // Remove invalid tokens from database
    let removedTokens = 0;
    if (removedTokensAll.length > 0) {
      const placeholders = removedTokensAll.map(() => "?").join(",");
      await query(
        `DELETE FROM FirebaseTokens WHERE Token IN (${placeholders}) AND AppName=?`,
        [...removedTokensAll, appName]
      );
      removedTokens = removedTokensAll.length;
    }

    return {
      totalSent,
      totalFailed,
      removedTokens,
      memberTokenStats,
    };
  }
}