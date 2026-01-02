import React, { useRef, useEffect, useState } from "react";
import { Loader2, Send, Keyboard } from "lucide-react";

interface MessageInputProps {
    inputMessage: string;
    setInputMessage: (val: string) => void;
    onSendMessage: () => void;
    isSending: boolean;
}

const MAX_MESSAGE_LENGTH = 2000;

export default function MessageInput({
    inputMessage,
    setInputMessage,
    onSendMessage,
    isSending
}: MessageInputProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSendMessage();
        }
    };

    // Auto-resize textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 96)}px`;
        }
    }, [inputMessage]);

    const charCount = inputMessage.length;
    const isNearLimit = charCount > MAX_MESSAGE_LENGTH * 0.8;
    const isOverLimit = charCount > MAX_MESSAGE_LENGTH;

    return (
        <div className="p-4 bg-[var(--bg1)] border-t border-black shrink-0 z-30 relative">
            <div className="flex items-end gap-3.5 relative">
                <div className="flex-1 bg-[var(--bg1)] rounded-[2rem] px-5 py-3.5 border border-black focus-within:border-black focus-within:shadow-[0_4px_16px_rgba(0,0,0,0.06)] transition-all duration-300">
                    <textarea
                        ref={textareaRef}
                        value={inputMessage}
                        onChange={(e) => {
                            if (e.target.value.length <= MAX_MESSAGE_LENGTH) {
                                setInputMessage(e.target.value);
                            }
                        }}
                        onKeyDown={handleKeyDown}
                        placeholder="Type your message..."
                        className="w-full bg-transparent text-black text-[13px] outline-none resize-none max-h-32 min-h-[24px] placeholder:text-black font-semibold"
                        rows={1}
                        aria-label="Message input"
                        aria-describedby="char-counter"
                    />

                    {/* Character Counter */}
                    {isNearLimit && (
                        <div
                            id="char-counter"
                            className="absolute -top-7 right-2 px-2.5 py-1 bg-black text-[9px] font-black text-[var(--t1)] rounded-lg animate-fadeIn  uppercase tracking-widest"
                            role="status"
                            aria-live="polite"
                        >
                            <span className={isOverLimit ? 'text-red-400' : 'text-[var(--a2)]'}>
                                {charCount}/{MAX_MESSAGE_LENGTH}
                            </span>
                        </div>
                    )}
                </div>

                <button
                    onClick={() => onSendMessage()}
                    disabled={!inputMessage.trim() || isSending || isOverLimit}
                    className="w-14 h-14 text-[var(--a2)] rounded-[1.8rem] flex items-center justify-center shadow-2xl active:scale-90 disabled:opacity-20 disabled:grayscale disabled:cursor-not-allowed transition-all duration-300 shrink-0 hover:shadow-[0_12px_24px_rgba(0,0,0,0.2)] hover:-translate-y-1 bg-black group"
                    aria-label="Send message"
                    title={isSending ? "Sending..." : "Send (Enter)"}
                >
                    {isSending ? (
                        <Loader2 className="w-6 h-6 animate-spin" strokeWidth={3} />
                    ) : (
                        <Send className="w-6 h-6 ml-0.5 group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300" strokeWidth={3} />
                    )}
                </button>
            </div>
        </div>
    );
}
