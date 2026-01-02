import React from "react";
import { Loader2, MessageCircle, ChevronDown } from "lucide-react";
import { IMAGE_URL } from "@/config";
import { Message } from "./types";

interface MessageListProps {
    messages: Message[];
    isLoading: boolean;
    hasMoreMsgs: boolean;
    isSupportPage: boolean;
    currentUserPageId: number;
    supportPageId: number;
    onLoadMore: () => void;
    scrollToBottom: (smooth: boolean) => void;
    showScrollButton: boolean;
    messagesContainerRef: React.RefObject<HTMLDivElement | null>;
    messagesEndRef: React.RefObject<HTMLDivElement | null>;
    onScroll: () => void;
}

export default function MessageList({
    messages,
    isLoading,
    hasMoreMsgs,
    isSupportPage,
    currentUserPageId,
    supportPageId,
    onLoadMore,
    scrollToBottom,
    showScrollButton,
    messagesContainerRef,
    messagesEndRef,
    onScroll
}: MessageListProps) {
    const formatTime = (dateStr: string) => {
        return new Date(dateStr).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return "Today";
        } else if (date.toDateString() === yesterday.toDateString()) {
            return "Yesterday";
        }
        return date.toLocaleDateString();
    };

    const groupedMessages = messages.reduce((groups: { [key: string]: Message[] }, msg) => {
        const date = formatDate(msg.CreatedAt);
        if (!groups[date]) groups[date] = [];
        groups[date].push(msg);
        return groups;
    }, {});

    return (
        <>
            {/* Load More Button */}
            {hasMoreMsgs && messages.length > 0 && (
                <div className="flex justify-center pb-4 pt-2 shrink-0">
                    <button
                        onClick={onLoadMore}
                        className="text-[10px] text-[var(--theme-text-muted)] hover:text-[var(--scolor)] bg-[var(--bg-200)] px-4 py-1.5 rounded-full transition-all border border-[var(--theme-border-primary)] shadow-sm"
                    >
                        Load previous messages
                    </button>
                </div>
            )}

            <div
                ref={messagesContainerRef}
                onScroll={onScroll}
                className="flex-1 overflow-y-auto px-4 pb-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent"
            >
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-full gap-3">
                        <Loader2 className="w-8 h-8 text-[var(--scolor)] animate-spin" />
                        <span className="text-sm text-[var(--theme-text-muted)]">Loading messages...</span>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-8">
                        <div
                            className="w-20 h-20 rounded-[2rem] flex items-center justify-center shadow-xl rotate-3"
                            style={{ background: 'var(--theme-accent-gradient)' }}
                        >
                            <MessageCircle className="w-10 h-10 text-white" />
                        </div>
                        <h4 className="font-black text-[var(--theme-text-primary)] text-xl uppercase tracking-tight">Start Typing</h4>
                        <p className="text-sm text-[var(--theme-text-muted)] font-medium">
                            {isSupportPage ? "No messages yet. Send a message to start helping your customers." : "Hello! Send us a message and we'll help you right away."}
                        </p>
                    </div>
                ) : (
                    Object.entries(groupedMessages).map(([date, msgs]) => (
                        <div key={date}>
                            {/* Date Separator */}
                            <div className="flex justify-center my-6">
                                <span className="text-[10px] font-black uppercase tracking-widest text-[var(--theme-text-muted)] bg-[var(--bg-200)] px-4 py-1 rounded-full border border-[var(--theme-border-primary)] shadow-sm">
                                    {date}
                                </span>
                            </div>

                            {/* Messages */}
                            <div className="space-y-2">
                                {msgs.map((msg) => {
                                    const isMine = isSupportPage
                                        ? msg.SenderPageId === supportPageId
                                        : msg.SenderPageId === currentUserPageId;

                                    return (
                                        <div
                                            key={msg.Id}
                                            className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                                        >
                                            <div
                                                className={`max-w-[85%] px-4 py-3 rounded-2xl shadow-md ${isMine
                                                    ? "rounded-br-sm text-white"
                                                    : "bg-white text-[var(--theme-text-primary)] border border-[var(--theme-border-accent)]/10 rounded-bl-sm"
                                                    }`}
                                                style={isMine ? {
                                                    background: 'var(--theme-accent-gradient)',
                                                } : {}}
                                            >
                                                {/* User Icon for incoming messages */}
                                                {!isMine && (
                                                    <p className="text-[10px] font-bold text-[var(--theme-primary-bg)] mb-1 opacity-90">
                                                        {msg.SenderPageTitle || "Support"}
                                                    </p>
                                                )}
                                                {/* Message Image */}
                                                {msg.Thumbnail && (
                                                    <img
                                                        src={`${IMAGE_URL}/${msg.Thumbnail}`}
                                                        alt="Attachment"
                                                        className="max-w-full rounded-lg mb-2"
                                                    />
                                                )}

                                                {/* Message Text */}
                                                <p className="text-xs whitespace-pre-wrap break-words leading-relaxed">
                                                    {msg.Description}
                                                </p>

                                                {/* Timestamp */}
                                                <div className={`flex items-center gap-1 justify-end mt-2 ${isMine ? "text-white/60" : "text-[var(--theme-text-muted)]"}`}>
                                                    <p className="text-[9px] font-medium">
                                                        {formatTime(msg.CreatedAt)}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Scroll to bottom button */}
            {showScrollButton && (
                <button
                    onClick={() => scrollToBottom(true)}
                    className="absolute right-4 bottom-28 p-2.5 bg-white text-[var(--scolor-contrast)] hover:scale-110 rounded-full shadow-2xl transition-all border border-[var(--theme-border-primary)]"
                >
                    <ChevronDown className="w-5 h-5" />
                </button>
            )}
        </>
    );
}
