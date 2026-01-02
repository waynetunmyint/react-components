import React, { memo } from "react";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { Message } from "../types";

interface MessageBubbleProps {
    msg: Message;
    isMyMessage: boolean;
    hasItems: boolean;
    isAdmin: boolean;
    onFeedback?: (messageId: string | number, isPositive: boolean) => void;
}

const MessageBubble = memo(function MessageBubble({
    msg,
    isMyMessage,
    hasItems,
    isAdmin,
    onFeedback
}: MessageBubbleProps) {
    if (!msg.text) return null;

    return (
        <div
            className={`relative max-w-[85%] rounded-3xl px-5 py-3.5 shadow-[0_2px_8px_rgba(0,0,0,0.04)] transition-all duration-300 ${isMyMessage
                ? 'rounded-tr-md bg-black text-[var(--t1)]'
                : 'rounded-tl-md bg-[var(--bg1)] border border-black text-black'
                }`}
        >
            <p className="text-[13px] leading-relaxed font-medium break-words whitespace-pre-wrap">
                {msg.text}
            </p>

            {/* Meta info inside text bubble if no items */}
            {!hasItems && (
                <div className="flex items-center gap-2 mt-1.5 px-0.5 opacity-40">
                    <span className="text-[9px] font-bold">
                        {new Date(msg.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {!isAdmin && msg.sender === 'page' && (
                        <div className="flex items-center gap-1">
                            <div className="w-1 h-1 rounded-full bg-current"></div>
                            <span className="text-[8px] font-black uppercase tracking-widest text-[var(--a2)]">Support</span>
                        </div>
                    )}
                </div>
            )}

            {/* AI Feedback Buttons - Show for AI messages with answerId */}
            {!isAdmin && msg.sender === 'page' && msg.answerId && onFeedback && (
                <div className={`flex items-center gap-1.5 mt-2 pt-2 border-t border-[var(--t3)]/10 ${msg.feedbackGiven ? 'opacity-100' : 'opacity-0 group-hover/msg:opacity-100'} transition-opacity duration-200`}>
                    {msg.feedbackGiven ? (
                        <span className="text-[9px] text-[var(--t2)] flex items-center gap-1">
                            {msg.feedbackGiven === 'positive' ? (
                                <><ThumbsUp size={10} className="text-[var(--g2)]" /> Thanks for feedback!</>
                            ) : (
                                <><ThumbsDown size={10} className="text-orange-400" /> We'll improve!</>
                            )}
                        </span>
                    ) : (
                        <>
                            <span className="text-[8px] text-[var(--t2)] mr-1">Was this helpful?</span>
                            <button
                                onClick={(e) => { e.stopPropagation(); onFeedback(msg.id, true); }}
                                className="p-1 rounded-full hover:bg-[var(--g2)] text-[var(--t2)] hover:text-[var(--g2)] transition-colors"
                                title="Helpful"
                            >
                                <ThumbsUp size={12} />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); onFeedback(msg.id, false); }}
                                className="p-1 rounded-full hover:bg-orange-400 text-[var(--t2)] hover:text-orange-400 transition-colors"
                                title="Not helpful"
                            >
                                <ThumbsDown size={12} />
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
});

export default MessageBubble;
