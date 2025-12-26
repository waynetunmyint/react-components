import React from "react";
import { Loader2, MessageCircle, ChevronDown } from "lucide-react";
import { IMAGE_URL } from "../../../../config";
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
                        className="text-[10px] text-slate-500 hover:text-[var(--theme-primary-bg)] bg-slate-800/50 px-3 py-1 rounded-full transition-colors border border-slate-800"
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
                        <Loader2 className="w-8 h-8 text-slate-400 animate-spin" />
                        <span className="text-sm text-slate-400">Loading messages...</span>
                    </div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-8">
                        <div
                            className="w-16 h-16 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: 'var(--theme-primary-bg)' }}
                        >
                            <MessageCircle className="w-8 h-8" style={{ color: 'var(--theme-primary-text)' }} />
                        </div>
                        <h4 className="font-semibold text-white">Start a Conversation</h4>
                        <p className="text-sm text-slate-400">
                            {isSupportPage ? "Send a message to the user." : "Send a message to our support team. We're here to help!"}
                        </p>
                    </div>
                ) : (
                    Object.entries(groupedMessages).map(([date, msgs]) => (
                        <div key={date}>
                            {/* Date Separator */}
                            <div className="flex justify-center my-3">
                                <span className="text-xs text-slate-500 bg-slate-800 px-3 py-1 rounded-full">
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
                                                className={`max-w-[85%] px-4 py-2.5 rounded-2xl shadow-xl ${isMine
                                                    ? "rounded-br-sm"
                                                    : "bg-slate-800 text-slate-100 border border-slate-700/50 rounded-bl-sm"
                                                    }`}
                                                style={isMine ? {
                                                    backgroundColor: 'var(--theme-primary-bg)',
                                                    color: 'white',
                                                    background: 'linear-gradient(to bottom right, var(--theme-primary-bg), #1e40af)',
                                                    border: '1px solid rgba(255,255,255,0.2)'
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
                                                <div className={`flex items-center gap-1 justify-end mt-1.5 ${isMine ? "text-white/70" : "text-slate-500"}`}>
                                                    <p className="text-[9px]">
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
                    className="absolute right-4 bottom-24 p-2 bg-slate-700 hover:bg-slate-600 rounded-full shadow-lg transition-all"
                >
                    <ChevronDown className="w-5 h-5 text-white" />
                </button>
            )}
        </>
    );
}
