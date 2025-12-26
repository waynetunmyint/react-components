"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  IonContent,
  IonRefresher,
  IonRefresherContent,
  IonSpinner,
} from "@ionic/react";
import { BASE_URL } from "../../config";
import {
  joinGroup,
  UniversalGetStoredJWT,
  UniversalGetStoredProfile,
} from "./UniversalStoredInformationComp";
import { ChatSkeleton } from "./Universal_SkeletonComp";
import ChatInputComp from "./Chat_InputComp";
import ChatListComp from "./Chat_ListComp";

interface Props {
  chatGroupId: string;
  chatGroupData: any;
}

const POLLING_CONFIG = {
  ACTIVE: 5000,
  INACTIVE: 15000,
  SLOW_MODE: 30000,
  INACTIVITY_DELAY: 60000,
};

export default function ChatListAndInputComp({ chatGroupId, chatGroupData }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [chats, setChats] = useState<any[]>([]);
  const [autoScroll, setAutoScroll] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [isLoadingOlder, setIsLoadingOlder] = useState(false);
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  
  const bottomRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLIonContentElement>(null);
  const storedProfile = UniversalGetStoredProfile();
  const token = UniversalGetStoredJWT();
  
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const lastScrollY = useRef(0);
  const isPollingPaused = useRef(false);
  const isMountedRef = useRef(true);

  // Optimized scroll to bottom
  const scrollToBottom = useCallback(async (smooth = false) => {
    if (!contentRef.current || !isMountedRef.current) return;

    try {
      const scrollElement = await contentRef.current.getScrollElement();
      const targetPosition = scrollElement.scrollHeight;

      scrollElement.scrollTo({
        top: targetPosition,
        behavior: smooth ? "smooth" : "auto",
      });
    } catch (e) {
      console.error("Scroll error:", e);
    }
  }, []);

  // Load latest messages with optimized diffing
  const loadLatestChats = useCallback(async (isInitialLoad = false, forceScroll = false) => {
    if ((isPollingPaused.current && !isInitialLoad && !forceScroll) || !isMountedRef.current) return;

    try {
      const formData = new FormData();
      formData.append("chatGroupId", chatGroupId);
      formData.append("pageNo", "1");

      const res = await fetch(`${BASE_URL}/chatGroupChat/api/byPage`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!isMountedRef.current) return;

      const data = await res.json();
      
      if (!data || !data.length) {
        if (isInitialLoad) setChats([]);
        return;
      }

      setChats((prev) => {
        // Quick reference check
        if (prev.length === data.length && 
            prev[prev.length - 1]?.Id === data[data.length - 1]?.Id) {
          return prev;
        }

        const serverIds = new Set(data.map((m: any) => m.Id));
        const currentIds = new Set(prev.map((m: any) => m.Id));
        
        const existingMessages = prev.filter((m: any) => serverIds.has(m.Id));
        const newMessages = data.filter((m: any) => !currentIds.has(m.Id));
        
        if (newMessages.length === 0 && existingMessages.length === prev.length) {
          return prev;
        }

        return [...existingMessages, ...newMessages];
      });

      // Smooth scroll only if conditions are met
      if ((forceScroll || (!isInitialLoad && autoScroll && !isUserScrolling && !isLoadingOlder)) && isMountedRef.current) {
        requestAnimationFrame(() => {
          setTimeout(() => scrollToBottom(true), 50);
        });
      }
    } catch (e) {
      console.error("Load chats error:", e);
    }
  }, [chatGroupId, token, autoScroll, isUserScrolling, isLoadingOlder, scrollToBottom]);

  // Initialize chat group
  const initChatGroup = useCallback(async () => {
    if (!isMountedRef.current) return;
    
    setIsLoading(true);
    setCurrentPage(1);
    setHasMoreMessages(true);
    setChats([]);
    
    try {
      await joinGroup(chatGroupId?.toString(), storedProfile?.Email);
      await loadLatestChats(true);
    } catch (e) {
      console.error("Init error:", e);
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
        requestAnimationFrame(() => {
          setTimeout(() => scrollToBottom(false), 100);
        });
      }
    }
  }, [chatGroupId, storedProfile?.Email, loadLatestChats, scrollToBottom]);

  // Load older messages with proper scroll restoration
  const loadOlderMessages = useCallback(async () => {
    if (isLoadingOlder || !hasMoreMessages || !isMountedRef.current) return;

    setIsLoadingOlder(true);
    isPollingPaused.current = true;
    const nextPage = currentPage + 1;

    try {
      const scrollElement = contentRef.current ? 
        await contentRef.current.getScrollElement() : null;
      
      const scrollTopBefore = scrollElement?.scrollTop || 0;
      const scrollHeightBefore = scrollElement?.scrollHeight || 0;

      const formData = new FormData();
      formData.append("chatGroupId", chatGroupId);
      formData.append("pageNo", nextPage.toString());

      const res = await fetch(`${BASE_URL}/chatGroupChat/api/byPage`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      if (!isMountedRef.current) return;

      const data = await res.json();
      
      if (!data || data.length === 0) {
        setHasMoreMessages(false);
        setIsLoadingOlder(false);
        isPollingPaused.current = false;
        return;
      }

      setChats((prev) => {
        const newOlderMessages = data.filter(
          (newMsg: any) => !prev.some((existingMsg) => existingMsg.Id === newMsg.Id)
        );
        return [...newOlderMessages, ...prev];
      });

      setCurrentPage(nextPage);

      // Restore scroll position after render
      requestAnimationFrame(() => {
        setTimeout(() => {
          if (scrollElement && isMountedRef.current) {
            const scrollHeightAfter = scrollElement.scrollHeight;
            const addedHeight = scrollHeightAfter - scrollHeightBefore;
            scrollElement.scrollTop = scrollTopBefore + addedHeight;
          }
        }, 50);
      });

    } catch (e) {
      console.error("Load older error:", e);
    } finally {
      if (isMountedRef.current) {
        setTimeout(() => {
          setIsLoadingOlder(false);
          isPollingPaused.current = false;
        }, 300);
      }
    }
  }, [isLoadingOlder, hasMoreMessages, currentPage, chatGroupId, token]);

  // Enhanced scroll handler with debouncing
  const handleUserScroll = useCallback(async (event: CustomEvent) => {
    if (!isMountedRef.current) return;

    const el = event.detail;
    const scrollTop = el.scrollTop;
    const scrollHeight = el.scrollHeight;
    const clientHeight = el.clientHeight;
    
    const nearBottom = scrollHeight - scrollTop - clientHeight < 150;
    const nearTop = scrollTop < 200;
    
    // Detect actual user scrolling
    const scrollDiff = Math.abs(scrollTop - lastScrollY.current);
    if (scrollDiff > 5) {
      setIsUserScrolling(true);
      
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
      
      scrollTimeout.current = setTimeout(() => {
        if (isMountedRef.current) {
          setIsUserScrolling(false);
        }
      }, 1500);
    }
    
    lastScrollY.current = scrollTop;
    setAutoScroll(nearBottom);

    // Load older messages when near top
    if (nearTop && hasMoreMessages && !isLoadingOlder) {
      loadOlderMessages();
    }
  }, [hasMoreMessages, isLoadingOlder, loadOlderMessages]);

  // Initialize on mount
  useEffect(() => {
    isMountedRef.current = true;
    initChatGroup();
    
    return () => {
      isMountedRef.current = false;
    };
  }, [chatGroupId]);

  // Optimized polling with better pause logic
  useEffect(() => {
    if (!chatGroupId || !isMountedRef.current) return;

    let pollInterval = POLLING_CONFIG.ACTIVE;
    let intervalId: NodeJS.Timeout;
    let inactivityTimeout: NodeJS.Timeout;

    const poll = () => {
      if (isMountedRef.current && !isLoading && !isLoadingOlder && !isUserScrolling && !isPollingPaused.current) {
        loadLatestChats(false);
      }
    };

    const startPolling = (intervalTime: number) => {
      if (intervalId) clearInterval(intervalId);
      pollInterval = intervalTime;
      intervalId = setInterval(poll, intervalTime);
      pollingRef.current = intervalId;
    };

    const handleVisibilityChange = () => {
      if (document.hidden) {
        startPolling(POLLING_CONFIG.INACTIVE);
        if (inactivityTimeout) clearTimeout(inactivityTimeout);
      } else {
        startPolling(POLLING_CONFIG.ACTIVE);
        resetInactivityTimer();
      }
    };

    const resetInactivityTimer = () => {
      if (inactivityTimeout) clearTimeout(inactivityTimeout);
      
      if (pollInterval === POLLING_CONFIG.SLOW_MODE && !document.hidden) {
        startPolling(POLLING_CONFIG.ACTIVE);
      }

      inactivityTimeout = setTimeout(() => {
        if (!document.hidden && isMountedRef.current) {
          startPolling(POLLING_CONFIG.SLOW_MODE);
        }
      }, POLLING_CONFIG.INACTIVITY_DELAY);
    };

    const activityEvents = ['keydown', 'click', 'touchstart'];
    activityEvents.forEach(event => {
      window.addEventListener(event, resetInactivityTimer, { passive: true });
    });

    document.addEventListener('visibilitychange', handleVisibilityChange);
    startPolling(POLLING_CONFIG.ACTIVE);
    resetInactivityTimer();

    return () => {
      if (intervalId) clearInterval(intervalId);
      if (inactivityTimeout) clearTimeout(inactivityTimeout);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      activityEvents.forEach(event => {
        window.removeEventListener(event, resetInactivityTimer);
      });
    };
  }, [chatGroupId, isLoading, isLoadingOlder, isUserScrolling, loadLatestChats]);

  // Cleanup scroll timeout
  useEffect(() => {
    return () => {
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
    };
  }, []);

  // Group messages by date
  const messageGroups: { [key: string]: any[] } = chats.reduce((groups: { [key: string]: any[] }, msg: any) => {
    const date = new Date(msg.CreatedAt).toLocaleDateString();
    if (!groups[date]) groups[date] = [];
    groups[date].push(msg);
    return groups;
  }, {});

  return (
    <>
      <IonContent
        ref={contentRef}
        scrollEvents={true}
        onIonScroll={handleUserScroll}
      >
        <IonRefresher
          slot="fixed"
          onIonRefresh={async (event) => {
            isPollingPaused.current = true;
            await loadLatestChats(false);
            setTimeout(() => {
              event.detail.complete();
              isPollingPaused.current = false;
            }, 500);
          }}
        >
          <IonRefresherContent />
        </IonRefresher>

        <div className={`${APP_BG_COLOR} min-h-screen flex flex-col`}>
          {isLoading && chats.length === 0 ? (
            <ChatSkeleton />
          ) : (
            <div className="px-4 space-y-6">
              <div ref={topRef} />

              {isLoadingOlder && (
                <div className="flex justify-center py-4">
                  <IonSpinner name="crescent" />
                </div>
              )}

              {!hasMoreMessages && chats.length > 0 && (
                <div className="flex justify-center py-4">
                  <span className="text-xs text-gray-400">No more messages</span>
                </div>
              )}

              {Object.entries(messageGroups).map(([date, messages]) => (
                <div key={date}>
                  <div className="flex justify-center my-4">
                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                      {date === new Date().toLocaleDateString() ? "Today" : date}
                    </span>
                  </div>

                  <ChatListComp
                    chatGroupId={chatGroupId}
                    chatGroupData={chatGroupData}
                    messageData={messages}
                    storedProfile={storedProfile}
                    formatTime={(date) => new Date(date).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                    onMessageDeleted={(deletedId) => {
                      setChats((prev) => prev.filter((msg) => msg.Id !== deletedId));
                      setTimeout(() => loadLatestChats(false), 500);
                    }}
                  />
                </div>
              ))}
              
              <div ref={bottomRef} />
            </div>
          )}
        </div>
      </IonContent>

      <ChatInputComp
        chatGroupId={chatGroupId}
        onMessageSent={async () => {
          setAutoScroll(true);
          // Load immediately without pausing polling
          await loadLatestChats(false, true);
        }}
      />
    </>
  );
}