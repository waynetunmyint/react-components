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
        <div className="p-3 bg-[var(--theme-secondary-bg)]/80 backdrop-blur-md border-t border-[var(--theme-border-primary)]/20 shrink-0">
            <div className="flex items-end gap-3 relative">
                <div className="flex-1 bg-white dark:bg-black/20 rounded-2xl px-4 py-3 border border-gray-200 dark:border-white/10 focus-within:border-[var(--accent-500)] focus-within:ring-2 focus-within:ring-[var(--accent-500)]/20 transition-all shadow-sm">
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
                        className="w-full bg-transparent text-[var(--theme-text-primary)] text-sm outline-none resize-none max-h-32 min-h-[24px] placeholder:text-[var(--theme-text-muted)]/70 font-medium"
                        rows={1}
                        aria-label="Message input"
                        aria-describedby="char-counter"
                    />

                    {/* Character Counter */}
                    {isNearLimit && (
                        <div
                            id="char-counter"
                            className="absolute -top-6 right-0 px-2 py-1 bg-black/70 text-white text-[10px] rounded-md animate-fadeIn backdrop-blur-sm"
                            role="status"
                            aria-live="polite"
                        >
                            <span className={`font-bold ${isOverLimit ? 'text-red-400' : 'text-white'}`}>
                                {charCount}/{MAX_MESSAGE_LENGTH}
                            </span>
                        </div>
                    )}
                </div>

                <button
                    onClick={onSendMessage}
                    disabled={!inputMessage.trim() || isSending || isOverLimit}
                    className="w-12 h-12 text-white rounded-2xl flex items-center justify-center shadow-md active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all shrink-0 hover:shadow-lg hover:shadow-[var(--accent-500)]/30 hover:-translate-y-0.5 group"
                    style={{ backgroundColor: 'var(--accent-500)' }}
                    aria-label="Send message"
                    title={isSending ? "Sending..." : "Send message (Enter)"}
                >
                    {isSending ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <Send className="w-5 h-5 ml-0.5 group-hover:scale-110 transition-transform" />
                    )}
                </button>
            </div>
        </div>
    );
}
