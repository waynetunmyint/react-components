"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import {
    IonContent,
    IonHeader,
    IonToolbar,
    IonButtons,
    IonBackButton,
    IonTitle,
    IonSpinner,
    IonRefresher,
    IonRefresherContent,
    IonButton,
    IonIcon,
    IonFooter
} from "@ionic/react";
import { Users, Info, ArrowLeft } from "lucide-react";
import { ChatList } from "./ChatList";
import { ChatInput } from "./ChatInput";
import { ChatMemberList } from "./ChatMemberList";
import { IonModal } from "@ionic/react";
import { BASE_URL } from "@/config";
import { GetStoredJWT, GetStoredProfile } from "../StorageComps/StorageCompOne";

interface Props {
    chatGroupId: string;
}

export const ChatRoom: React.FC<Props> = ({ chatGroupId }) => {
    const [chats, setChats] = useState<any[]>([]);
    const [groupData, setGroupData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showMembers, setShowMembers] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const contentRef = useRef<HTMLIonContentElement>(null);
    const pollingRef = useRef<NodeJS.Timeout | null>(null);
    const storedProfile = GetStoredProfile();
    const token = GetStoredJWT();
    const isJoinedRef = useRef(false);

    const fetchGroup = useCallback(async () => {
        try {
            const url = `${BASE_URL}/chatGroup/api/${chatGroupId}`;
            console.log("fetch group url", url);

            const res = await fetch(url);
            const data = await res.json();
            setGroupData(data?.[0]);
        } catch (e) {
            console.error("Fetch group error:", e);
        }
    }, [chatGroupId]);

    const fetchMessages = useCallback(async (isInitial = false) => {
        try {
            const formData = new FormData();
            formData.append("chatGroupId", chatGroupId);
            formData.append("pageNo", "1");

            const res = await fetch(`${BASE_URL}/chatGroupChat/api/byPage`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });

            if (!res.ok) {
                const errorText = await res.text();
                console.error(`Fetch messages failed (${res.status}):`, errorText);
                return;
            }

            const text = await res.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch (err) {
                console.error("Failed to parse messages JSON:", text);
                throw err;
            }

            if (!Array.isArray(data)) return;

            setChats(prev => {
                // If this is initial load, just set data
                if (isInitial) return data;

                // Better diffing: only update if we have new messages or count changed
                if (data.length === prev.length && data[data.length - 1]?.Id === prev[prev.length - 1]?.Id) {
                    return prev;
                }

                // If it's a completely different set (e.g. first few messages), just set it
                return data;
            });

            if (isInitial) {
                setTimeout(() => contentRef.current?.scrollToBottom(500), 300);
            }
        } catch (e) {
            console.error("Fetch messages error:", e);
        } finally {
            if (isInitial) setLoading(false);
        }
    }, [chatGroupId, token]);

    useEffect(() => {
        const init = async () => {
            await fetchGroup();
            if (storedProfile?.Email && !isJoinedRef.current) {
                try {
                    const { joinGroup } = await import("../StorageComps/StorageCompOne");
                    await joinGroup(chatGroupId, storedProfile.Email);
                    isJoinedRef.current = true;
                } catch (e) {
                    console.error("Join group error:", e);
                }
            }
            await fetchMessages(true);
        };

        init();

        pollingRef.current = setInterval(() => {
            if (isJoinedRef.current) fetchMessages();
        }, 5000);

        return () => {
            if (pollingRef.current) clearInterval(pollingRef.current);
        };
    }, [chatGroupId, fetchGroup, fetchMessages, storedProfile?.Email]);

    const handleDelete = async (id: string | number) => {
        if (!window.confirm("Delete this message?")) return;

        // Optimistic update
        const previousChats = [...chats];
        setChats(prev => prev.filter(m => m.Id !== id));

        try {
            const formData = new FormData();
            formData.append("id", id.toString());
            const res = await fetch(`${BASE_URL}/chatGroupChat/api`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });
            if (!res.ok) throw new Error("Delete failed");
        } catch (e) {
            console.error("Delete error:", e);
            setChats(previousChats); // Rollback
            alert("Failed to delete message. Please try again.");
        }
    };

    const handleRefresh = async (event: CustomEvent) => {
        await Promise.all([fetchGroup(), fetchMessages()]);
        event.detail.complete();
    };

    const isOwner = groupData?.OwnerEmail === storedProfile?.Email;

    return (
        <div className="flex flex-col h-full bg-[#f8fafc] overflow-hidden relative">
            {/* Immersive Background Elements */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-400/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
                <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] bg-purple-400/5 rounded-full blur-[100px]" />
            </div>

            <IonHeader className="ion-no-border z-50">
                <div className="absolute inset-0 bg-white/60 backdrop-blur-2xl border-b border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.04)]" />
                <IonToolbar className="--background: transparent; --border-style: none; px-4 py-2">
                    <IonButtons slot="start">
                        <IonButton
                            onClick={() => window.history.back()}
                            className="bg-white/50 backdrop-blur-md rounded-2xl shadow-sm border border-white/50 hover:bg-white transition-all active:scale-90"
                        >
                            <ArrowLeft size={20} className="text-gray-900" strokeWidth={2.5} />
                        </IonButton>
                    </IonButtons>
                    <IonTitle>
                        <div className="flex flex-col items-center group cursor-pointer" onClick={() => setShowMembers(true)}>
                            <span className="text-[15px] font-black text-gray-900 leading-tight tracking-tight group-hover:text-blue-600 transition-colors">
                                {groupData?.Title || "Atmosphere"}
                            </span>
                            <div className="flex items-center gap-2 mt-1">
                                <div className="flex items-center gap-1 bg-blue-500/10 px-2 py-0.5 rounded-full border border-blue-200/50">
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping" />
                                    <span className="text-[9px] text-blue-600 font-black uppercase tracking-widest">
                                        {groupData?.MemberCount || 0} Members
                                    </span>
                                </div>
                            </div>
                        </div>
                    </IonTitle>
                    <IonButtons slot="end">
                        <IonButton
                            onClick={() => setShowMembers(true)}
                            className="bg-blue-500/10 backdrop-blur-md rounded-2xl border border-blue-200/50 hover:bg-blue-500 hover:text-white transition-all active:scale-95"
                        >
                            <Info size={20} className="text-blue-600 group-hover:text-white" strokeWidth={2.5} />
                        </IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>

            <IonContent ref={contentRef} className="--background: transparent; z-10" scrollEvents={true}>
                <IonRefresher slot="fixed" onIonRefresh={handleRefresh} className="z-50">
                    <IonRefresherContent pullingIcon="chevron-down" refreshingSpinner="crescent" />
                </IonRefresher>

                {loading ? (
                    <div className="flex flex-col items-center justify-center h-full gap-4">
                        <div className="relative">
                            <div className="w-16 h-16 border-4 border-blue-500/20 rounded-full" />
                            <div className="absolute inset-0 w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-600/50 animate-pulse">Syncing Atmosphere...</span>
                    </div>
                ) : (
                    <div className="pb-32">
                        <ChatList
                            messages={chats}
                            currentUserEmail={storedProfile?.Email || ""}
                            isOwner={isOwner}
                            onDeleteMessage={handleDelete}
                        />
                    </div>
                )}
            </IonContent>

            <IonFooter className="ion-no-border z-50 fixed bottom-0 left-0 right-0">
                <div className="absolute inset-x-0 bottom-0 h-40  pointer-events-none" />
                <div className="relative px-4 pb-6 pt-2">
                    <div>
                        <ChatInput chatGroupId={chatGroupId} onMessageSent={() => fetchMessages()} />
                    </div>
                </div>
            </IonFooter>

            <IonModal
                isOpen={showMembers}
                onDidDismiss={() => setShowMembers(false)}
                initialBreakpoint={0.75}
                breakpoints={[0, 0.5, 0.75, 0.9]}
                handle={true}
                className="atmosphere-modal"
            >
                <div className="h-full bg-white/80 backdrop-blur-2xl">
                    <ChatMemberList chatGroupId={chatGroupId} isOwner={isOwner} />
                </div>
            </IonModal>
        </div>
    );
};
