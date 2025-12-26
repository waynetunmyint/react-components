"use client";
import React, { useEffect, useState, useCallback } from "react";
import { IonToolbar, IonButtons, IonButton, IonAvatar} from "@ionic/react";
import { BASE_URL, IMAGE_URL} from "../../config";
import { Bell, BellOff, Edit, List } from "lucide-react";
import {
  checkChatMembership,
  StoredChatGroupInfo,
  StoredChatGroupMemberInfo,
  UniversalGetStoredJWT,
} from "./Stored_InformationComp";

interface Props { chatGroupId: string; }

export default function ChatGroupViewHeaderComp({ chatGroupId }: Props) {
  const [chatGroupData, setChatGroupData] = useState<any>(null);
  const [memberInfo, setMemberInfo] = useState<any>(null);
  const [notificationStatus, setNotificationStatus] = useState<"0" | "1">("1");
  const [isOwner, setIsOwner] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const token = UniversalGetStoredJWT();


  /** Load chat group & member info */
  const getData = useCallback(async () => {
    if (!chatGroupId) return console.error("No chatGroupId provided");
    setIsLoading(true);
    try {
      const chatGroup = await StoredChatGroupInfo(chatGroupId);
      const member = await StoredChatGroupMemberInfo(chatGroupId);


      if (!chatGroup) return console.error("Chat group not found");
      if (!member) return console.warn("Member info not found");

      setChatGroupData(chatGroup);
      setMemberInfo(member);

      setNotificationStatus(member?.NotificationStatus === "1" ? "1" : "0");
      setIsOwner(chatGroup.OwnerEmail === member.ProfileEmail);

      localStorage.setItem("StoredChatGroupMemberInfo", JSON.stringify(member));
     // console.log("Chat Group Data:", chatGroup);
    } catch (err) {
      console.error("Failed to fetch chat group data:", err);
    } finally {
      setIsLoading(false);
    }
  }, [chatGroupId]);



  /** Toggle notification */
  const handleToggleNotification = async () => {
    if (isUpdating || !memberInfo?.Id || !token) return;
    const prevStatus = notificationStatus;
    const newStatus = prevStatus === "1" ? "0" : "1";
    setIsUpdating(true);
    setNotificationStatus(newStatus);
    try {
      const formData = new FormData();
      formData.append("notificationStatus", newStatus);
      formData.append("id", memberInfo.Id.toString());
      const res = await fetch(`${BASE_URL}/chatGroupMember/api`, {
        method: "PATCH",
        body: formData,
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to update notification");
      const updatedMember = await StoredChatGroupMemberInfo(chatGroupId);

      setMemberInfo(updatedMember);
      setNotificationStatus(updatedMember?.NotificationStatus === "1" ? "1" : "0");
      localStorage.setItem("StoredChatGroupMemberInfo", JSON.stringify(updatedMember));
      console.log(`Notifications ${newStatus === "1" ? "enabled" : "disabled"}`);
    } catch (err) {
      console.error("Notification toggle failed:", err);
      setNotificationStatus(prevStatus);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleChatGroupUpdate = () => {
    if (!chatGroupData) return console.error("No chat group data to edit");
    localStorage.setItem("StoredItem", JSON.stringify(chatGroupData));
    window.location.href = "/chatGroup/update";
  };

  const handleMemberList = () => {
    window.location.href = `/chatGroupMember/${chatGroupId}`;
  }

  useEffect(() => { 
    getData();
    checkChatMembership(chatGroupId);
    fetchMembers();
   }, [chatGroupId]);

     const fetchMembers = async () => {
       try {
         const res = await fetch(`${BASE_URL}/chatGroupMember/api/byChatGroupId/`+ chatGroupId);
         const data = await res.json();
         localStorage.setItem("StoredChatGroupMembers", JSON.stringify(data || []));
       //  console.log("Fetched members:", data);
         if (res.ok && data.success) {
           console.log("Members set:", data.data || []);
           localStorage.setItem("StoredChatGroupMembers", data);
         } else {
          // setError(data.message || "Failed to load members.");
         }
       } catch (err) {
         console.log("Fetch members error:", err);
        // setError("Unable to fetch members.");
       } finally {
        // setLoading(false);
       }
     };

  return (
    <>
    <IonToolbar className="px-1 flex items-center justify-between">
      <IonButtons slot="start">
        <IonButton onClick={() => (window.location.href = "/")} className="m-0">
          <IonAvatar className="w-9 h-9">
            <img src={`${IMAGE_URL}/uploads/logo.png`} alt="Logo" className="w-full h-full object-contain" />
          </IonAvatar>
        </IonButton>
      </IonButtons>

      {/* ✅ Fast-reacting title */}
      <div className="flex-1 text-center text-base font-semibold line-clamp-1">
        {isLoading ? "Loading..." : chatGroupData?.Title || "Chat Group"}
      </div>

      <IonButtons slot="end" className="gap-1">
        <IonButton onClick={handleToggleNotification} disabled={isUpdating || !memberInfo?.Id || isLoading} fill="clear">
          {notificationStatus === "1" ? (
            <Bell className="w-5 h-5 text-blue-500" />
          ) : (
            <BellOff className="w-5 h-5 text-gray-400" />
          )}
        </IonButton>

        {isOwner && (
          <>
          <IonButton onClick={(handleMemberList)} disabled={isLoading} fill="clear">
            <List className="w-5 h-5 text-blue-500" />
          </IonButton>
          <IonButton onClick={handleChatGroupUpdate} disabled={isLoading} fill="clear">
            <Edit className="w-5 h-5 text-blue-500" />
          </IonButton>
          </>
        )}
      </IonButtons>
    </IonToolbar>
    </>
  );
}
