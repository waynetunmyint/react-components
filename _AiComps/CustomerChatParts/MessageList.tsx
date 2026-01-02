import React, { memo, useCallback } from "react";
import { Loader2, MessageCircle, Trash2, Sparkles } from "lucide-react";
import { Message } from "./types";
import { getPlatform } from "./chatUtils";
import { ENABLE_CUSTOMER_CHAT, IMAGE_URL } from "@/config";

// Sub-components
import MessageBubble from "./MessageParts/MessageBubble";
import MessageSingleImage from "./MessageParts/MessageSingleImage";
import MessageVerticalList from "./MessageParts/MessageVerticalList";
import MessageCarousel from "./MessageParts/MessageCarousel";

interface MessageListProps {
    messages: Message[];
    isLoading: boolean;
    isAdmin: boolean;
    onDeleteMessage: (id: string | number) => void;
    onFeedback?: (messageId: string | number, isPositive: boolean) => void;
    messagesEndRef: React.RefObject<HTMLDivElement | null>;
    waitingMessages: string[];
    waitingMessageIndex: number;
    isAiThinking?: boolean;
}

const MessageList = memo(function MessageList({
    messages,
    isLoading,
    isAdmin,
    onDeleteMessage,
    onFeedback,
    messagesEndRef,
    waitingMessages,
    waitingMessageIndex,
    isAiThinking
}: MessageListProps) {
    const platform = getPlatform();

    // Improved image URL resolver
    const resolveImg = useCallback((src?: any): string | undefined => {
        if (!src || typeof src !== 'string') return undefined;

        const cleanSrc = src.trim();
        if (!cleanSrc) return undefined;

        // 1. Full URL matching
        if (cleanSrc.startsWith('http://') || cleanSrc.startsWith('https://')) {
            return cleanSrc;
        }

        // 2. Protocol relative
        if (cleanSrc.startsWith('//')) {
            return `https:${cleanSrc}`;
        }

        // 3. Handle path formats
        const pathOnly = cleanSrc.replace(/^\/+/, ''); // Remove leading slashes

        // 4. Check if it already has 'uploads/' prefix
        if (pathOnly.startsWith('uploads/')) {
            return `${IMAGE_URL}/${pathOnly}`;
        }

        // 5. Default: add uploads prefix
        return `${IMAGE_URL}/uploads/${pathOnly}`;
    }, []);

    const getOptimalLink = useCallback((item: any) => {
        if (item.links) {
            return item.links[platform as keyof typeof item.links] || item.links.web || item.link || item.Link;
        }
        const directLink = item.Link || item.link;
        if (directLink) return directLink;

        const type = item.Type || item.type;
        const id = item.Id || item.id;
        if (type && id) return `/${type}/view/${id}`;

        return undefined;
    }, [platform]);

    return (
        <div
            className="flex-1 overflow-y-auto px-5 py-6 space-y-6 custom-scrollbar"
            role="log"
            aria-label="Chat messages"
            aria-live="polite"
            aria-atomic="false"
        >
            {isLoading ? (
                <div
                    className="flex flex-col items-center justify-center h-full gap-4 text-black"
                    role="status"
                    aria-label="Loading chat"
                >
                    <div className="relative w-10 h-10">
                        <Loader2 className="animate-spin text-[var(--a2)] w-full h-full" strokeWidth={3} />
                        <div className="absolute inset-0 bg-[var(--a2)] blur-lg opacity-20"></div>
                    </div>
                    <span className="text-[11px] font-black uppercase tracking-[0.2em] animate-pulse">Initializing Secure Chat</span>
                </div>
            ) : messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center px-10 gap-6">
                    <div className="w-20 h-20 bg-[var(--accent-200)]/30 rounded-[2rem] flex items-center justify-center text-black border border-black shadow-inner animate-float">
                        <MessageCircle size={40} strokeWidth={1.5} />
                    </div>
                    <div className="max-w-[240px]">
                        <h4 className="text-[16px] font-black text-black mb-1.5 uppercase tracking-tight">Need Assistance?</h4>
                        <p className="text-[11px] text-black font-medium leading-relaxed">Our support team is here to help. Send a message to get started.</p>
                    </div>
                </div>
            ) : (
                messages.map((msg, i) => {
                    const isMyMessage = msg.sender === (isAdmin ? 'page' : 'guest');
                    const hasItems = msg.items && msg.items.length > 0;

                    if (hasItems) {
                        console.log(`[MessageList] Rendering message ${i} with items:`, {
                            type: msg.displayType,
                            itemCount: msg.items?.length,
                            items: msg.items,
                            fullMsg: msg
                        });
                    }

                    return (
                        <div key={i} className={`flex flex-col ${isMyMessage ? 'items-end' : 'items-start'} space-y-2.5 animate-messageIn group/msg w-full`}>
                            {/* 1. Main Text Bubble */}
                            <MessageBubble
                                msg={msg}
                                isMyMessage={isMyMessage}
                                hasItems={hasItems || false}
                                isAdmin={isAdmin}
                                onFeedback={onFeedback}
                            />

                            {/* 2. Rich Content: Single Image */}
                            <MessageSingleImage
                                msg={msg}
                                hasItems={hasItems || false}
                                resolveImg={resolveImg}
                            />

                            {/* 3. Vertical List View */}
                            <MessageVerticalList
                                msg={msg}
                                resolveImg={resolveImg}
                                getOptimalLink={getOptimalLink}
                            />

                            {/* 4. Horizontal Carousel */}
                            <MessageCarousel
                                msg={msg}
                                index={i}
                                resolveImg={resolveImg}
                                getOptimalLink={getOptimalLink}
                            />

                            {/* Meta info below items if items exist */}
                            {hasItems && (
                                <div className="flex items-center gap-2 px-1 opacity-30">
                                    <span className="text-[9px] font-bold tracking-tight">
                                        {new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    {isAdmin || msg.sender === 'guest' ? (
                                        <button
                                            onClick={() => onDeleteMessage(msg.id)}
                                            className="opacity-0 group-hover/msg:opacity-100 p-1.5 hover:bg-black rounded-xl transition-all"
                                        >
                                            <Trash2 size={12} className="text-black" />
                                        </button>
                                    ) : (
                                        <span className="text-[8px] font-black uppercase tracking-widest text-black">AI Assistant</span>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })
            )}

            {/* Engagement / Thinking Indicator */}
            {
                !isAdmin && messages.length > 0 && messages[messages.length - 1].sender === 'guest' && !isLoading && (
                    <div className="flex flex-col gap-4 animate-fadeIn mt-4">
                        <div className="flex justify-start">
                            <div className={`px-5 py-4 rounded-3xl rounded-bl-md flex items-center gap-4 shadow-xl border-2 transition-all duration-700 ${isAiThinking ? 'border-[var(--a2)] bg-[var(--bg1)] scale-105 shadow-[0_10px_30px_rgba(255,207,17,0.2)]' : 'bg-[var(--bg1)] border-black'}`}>
                                {isAiThinking ? (
                                    <>
                                        <div className="relative w-6 h-6 flex items-center justify-center">
                                            <Sparkles size={20} className="animate-spin absolute text-[var(--a2)]" style={{ animationDuration: '4s' }} />
                                            <div className="w-2 h-2 rounded-full bg-black animate-ping absolute" />
                                        </div>
                                        <span className="text-[11px] font-black uppercase tracking-[0.15em] text-black animate-pulse">
                                            Ai is thinking...
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex gap-2">
                                            <span className="w-2 h-2 rounded-full bg-[var(--a2)] animate-bounce [animation-delay:-0.3s]" />
                                            <span className="w-2 h-2 rounded-full bg-[var(--a2)] animate-bounce [animation-delay:-0.15s] opacity-60" />
                                            <span className="w-2 h-2 rounded-full bg-[var(--a2)] animate-bounce opacity-30" />
                                        </div>
                                        <span className="text-[11px] font-black uppercase tracking-widest text-black">
                                            AI Assistant active
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>

                        {!isAiThinking && (
                            <div className="flex items-center gap-2.5 px-4 py-2 rounded-full border border-black bg-[var(--bg1)] self-center animate-pulse shadow-sm">
                                <Sparkles size={14} className="text-[var(--a2)]" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-black">
                                    {waitingMessages[waitingMessageIndex]}
                                </span>
                            </div>
                        )}
                    </div>
                )
            }

            <div ref={messagesEndRef} />
        </div>
    );
});

export default MessageList;
