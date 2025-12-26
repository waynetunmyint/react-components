"use client";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { BASE_URL, PAGE_ID } from "../../../config";
import { Message, Thread } from "./SupportChatParts/types";
import ChatHeader from "./SupportChatParts/ChatHeader";
import ThreadList from "./SupportChatParts/ThreadList";
import MessageList from "./SupportChatParts/MessageList";
import MessageInput from "./SupportChatParts/MessageInput";

// Support page is always PAGE_ID = 0
const SUPPORT_PAGE_ID = 0;

interface SupportChatModalProps {
    isOpen: boolean;
    onClose: () => void;
}

// Get stored JWT token
const getStoredJWT = (): string | null => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(`StoredJWT_${PAGE_ID}`);
};

// Get stored user profile
const getStoredUser = () => {
    if (typeof window === "undefined") return null;
    try {
        const stored = localStorage.getItem(`StoredUser_${PAGE_ID}`);
        return stored ? JSON.parse(stored) : null;
    } catch {
        return null;
    }
};

export default function SupportChatModal({ isOpen, onClose }: SupportChatModalProps) {
    const currentPageId = PAGE_ID as number;
    const isSupportPage = currentPageId === SUPPORT_PAGE_ID;

    const token = getStoredJWT();
    const user = getStoredUser();

    const [messages, setMessages] = useState<Message[]>([]);
    const [threads, setThreads] = useState<Thread[]>([]);
    const [selectedThreadId, setSelectedThreadId] = useState<number | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [msgPage, setMsgPage] = useState(1);
    const [hasMoreMsgs, setHasMoreMsgs] = useState(true);

    const [inputMessage, setInputMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSending, setIsSending] = useState(false);
    const [showScrollButton, setShowScrollButton] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState<"connected" | "connecting" | "error">("connecting");

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const pollingRef = useRef<NodeJS.Timeout | null>(null);

    // Scroll to bottom
    const scrollToBottom = useCallback((smooth = true) => {
        messagesEndRef.current?.scrollIntoView({
            behavior: smooth ? "smooth" : "auto"
        });
    }, []);

    // Load threads (for support page)
    const loadThreads = useCallback(async () => {
        if (!token || !isSupportPage) return;

        try {
            // Fetch all logic for threads
            const res = await fetch(`${BASE_URL}/pageChat/api/byPageId/byPage/${SUPPORT_PAGE_ID}/1`, {
                method: "GET",
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const data = await res.json();
            const allMessages = Array.isArray(data) ? data : data.rows || [];

            // Group messages to create threads
            const threadMap: { [key: number]: Thread } = {};
            allMessages.forEach((msg: Message) => {
                const otherPageId = msg.SenderPageId === SUPPORT_PAGE_ID ? msg.ReceiverPageId : msg.SenderPageId;
                const otherPageTitle = msg.SenderPageId === SUPPORT_PAGE_ID ? msg.ReceiverPageTitle : msg.SenderPageTitle;

                if (otherPageId === SUPPORT_PAGE_ID) return; // Skip messages with self

                if (!threadMap[otherPageId] || new Date(msg.CreatedAt) > new Date(threadMap[otherPageId].LastMessageAt!)) {
                    threadMap[otherPageId] = {
                        PageId: otherPageId,
                        PageName: otherPageTitle || msg.ProfileName || `Page ${otherPageId}`,
                        LastMessage: msg.Description,
                        LastMessageAt: msg.CreatedAt,
                        UnreadCount: 0
                    };
                }
            });

            setThreads(Object.values(threadMap).sort((a, b) =>
                new Date(b.LastMessageAt!).getTime() - new Date(a.LastMessageAt!).getTime()
            ));
            setConnectionStatus("connected");
        } catch (err) {
            console.error("Failed to load threads:", err);
            setConnectionStatus("error");
        }
    }, [token, isSupportPage]);

    // Load messages from API
    const loadMessages = useCallback(async (isInitial = false, pageNo = 1) => {
        if (!token) return;

        const targetFetchId = isSupportPage ? selectedThreadId : currentPageId;

        if (isSupportPage && targetFetchId === null) return;

        try {
            if (isInitial && pageNo === 1) {
                setIsLoading(true);
                setConnectionStatus("connecting");
            }

            const res = await fetch(`${BASE_URL}/pageChat/api/byPageId/byPage/${targetFetchId}/${pageNo}`, {
                method: "GET",
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            const data = await res.json();
            const messageList = Array.isArray(data) ? data : data.rows || [];

            if (messageList.length === 0) {
                setHasMoreMsgs(false);
            }

            if (pageNo === 1) {
                setMessages(messageList.reverse());
                if (isInitial) setTimeout(() => scrollToBottom(false), 100);
            } else {
                setMessages(prev => [...messageList.reverse(), ...prev]);
            }

            setMsgPage(pageNo);
            setConnectionStatus("connected");
        } catch (err) {
            console.error("Failed to load messages:", err);
            setConnectionStatus("error");
        } finally {
            setIsLoading(false);
        }
    }, [token, scrollToBottom, isSupportPage, selectedThreadId, currentPageId]);

    // Send message
    const sendMessage = async () => {
        if (!inputMessage.trim() || !token || isSending) return;

        const senderId = isSupportPage ? SUPPORT_PAGE_ID : currentPageId;
        const receiverId = isSupportPage ? selectedThreadId : SUPPORT_PAGE_ID;

        if (isSupportPage && receiverId === null) return;

        const messageText = inputMessage.trim();
        setInputMessage("");
        setIsSending(true);

        // Optimistic update
        const tempMessage: Message = {
            Id: `temp-${Date.now()}`,
            Description: messageText,
            CreatedAt: new Date().toISOString(),
            SenderPageId: senderId,
            ReceiverPageId: receiverId!,
            ProfileEmail: user?.Email || user?.email,
            ProfileName: user?.Name || user?.name || "You",
        };

        setMessages(prev => [...prev, tempMessage]);
        setTimeout(() => scrollToBottom(true), 50);

        try {
            const formData = new FormData();
            formData.append("description", messageText);
            formData.append("senderPageId", senderId.toString());
            formData.append("receiverPageId", receiverId!.toString());

            const res = await fetch(`${BASE_URL}/pageChat/api`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });

            if (!res.ok) throw new Error(`HTTP ${res.status}`);

            // Reload messages to get the actual message from server
            await loadMessages(false, 1);
            if (isSupportPage) loadThreads();
        } catch (err) {
            console.error("Failed to send message:", err);
            // Remove optimistic message on failure
            setMessages(prev => prev.filter(m => m.Id !== tempMessage.Id));
            setInputMessage(messageText); // Restore input
        } finally {
            setIsSending(false);
        }
    };

    // Handle scroll to detect if user scrolled up
    const handleScroll = () => {
        if (!messagesContainerRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = messagesContainerRef.current;
        const isNearBottom = scrollHeight - scrollTop - clientHeight < 100;
        setShowScrollButton(!isNearBottom);
    };

    // Initialize and setup polling
    useEffect(() => {
        if (!isOpen) return;

        if (isSupportPage && selectedThreadId === null) {
            loadThreads();
            pollingRef.current = setInterval(loadThreads, 10000);
        } else if (selectedThreadId !== null || !isSupportPage) {
            loadMessages(true, 1);
            pollingRef.current = setInterval(() => loadMessages(false, 1), 5000);
        }

        return () => {
            if (pollingRef.current) {
                clearInterval(pollingRef.current);
            }
        };
    }, [isOpen, loadMessages, loadThreads, isSupportPage, selectedThreadId]);

    // Focus input when modal opens or thread is selected
    useEffect(() => {
        if (isOpen && (!isSupportPage || selectedThreadId !== null)) {
            setTimeout(() => inputRef.current?.focus(), 300);
        }
    }, [isOpen, isSupportPage, selectedThreadId]);

    if (!isOpen) return null;

    const selectedThreadName = threads.find(t => t.PageId === selectedThreadId)?.PageName;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/60 z-50 animate-fadeIn"
                onClick={onClose}
            />

            {/* Modal Container */}
            <div className="fixed inset-4 sm:inset-auto sm:right-4 sm:bottom-4 sm:w-[420px] sm:h-[650px] z-50 flex flex-col bg-[var(--theme-secondary-bg)] rounded-[2rem] shadow-2xl border border-[var(--theme-border-primary)] overflow-hidden animate-slideUp">

                <ChatHeader
                    isSupportPage={isSupportPage}
                    selectedThreadId={selectedThreadId}
                    selectedThreadName={selectedThreadName}
                    connectionStatus={connectionStatus}
                    onBack={() => setSelectedThreadId(null)}
                    onClose={onClose}
                />

                {isSupportPage && selectedThreadId === null ? (
                    <ThreadList
                        threads={threads}
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                        onSelectThread={setSelectedThreadId}
                    />
                ) : (
                    <>
                        <MessageList
                            messages={messages}
                            isLoading={isLoading}
                            hasMoreMsgs={hasMoreMsgs}
                            isSupportPage={isSupportPage}
                            currentUserPageId={currentPageId}
                            supportPageId={SUPPORT_PAGE_ID}
                            onLoadMore={() => loadMessages(false, msgPage + 1)}
                            scrollToBottom={scrollToBottom}
                            showScrollButton={showScrollButton}
                            messagesContainerRef={messagesContainerRef}
                            messagesEndRef={messagesEndRef}
                            onScroll={handleScroll}
                        />

                        <MessageInput
                            value={inputMessage}
                            onChange={setInputMessage}
                            onSend={sendMessage}
                            isSending={isSending}
                            inputRef={inputRef}
                        />
                    </>
                )}
            </div>

            <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.15s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .scrollbar-thin::-webkit-scrollbar {
          width: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: transparent;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: var(--theme-text-primary)/20;
          border-radius: 10px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb:hover {
          background: var(--theme-text-primary)/30;
        }
      `}</style>
        </>
    );
}
