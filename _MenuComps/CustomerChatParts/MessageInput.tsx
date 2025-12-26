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
    const [showHint, setShowHint] = useState(true);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSendMessage();
        }

        // Hide hint after first interaction
        if (showHint) setShowHint(false);
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
        <div className="p-3 bg-slate-900/50 backdrop-blur-md border-t border-[var(--theme-border-primary)]/10 shrink-0">
            {/* Keyboard Hint */}
            {showHint && inputMessage.length === 0 && (
                <div className="mb-2 px-2 py-1.5 bg-slate-800/50 rounded-lg flex items-center gap-2 animate-fadeIn">
                    <Keyboard size={12} className="text-slate-500" />
                    <p className="text-[9px] text-slate-500 italic">
                        Press <kbd className="px-1 py-0.5 bg-slate-700 rounded text-[8px] font-mono">Enter</kbd> to send,
                        <kbd className="px-1 py-0.5 bg-slate-700 rounded text-[8px] font-mono ml-1">Shift+Enter</kbd> for new line
                    </p>
                </div>
            )}

            <div className="flex items-end gap-2">
                <div className="flex-1 bg-slate-800 rounded-2xl px-4 py-2 border border-white/5 focus-within:border-[var(--theme-border-accent)]/50 transition-all shadow-inner">
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
                        className="w-full bg-transparent text-white text-[13px] outline-none resize-none max-h-24 min-h-[24px] placeholder:text-slate-500"
                        rows={1}
                        aria-label="Message input"
                        aria-describedby="char-counter"
                    />

                    {/* Character Counter */}
                    {isNearLimit && (
                        <div
                            id="char-counter"
                            className="mt-1 text-right animate-fadeIn"
                            role="status"
                            aria-live="polite"
                        >
                            <span className={`text-[9px] font-medium ${isOverLimit ? 'text-red-400' : 'text-yellow-400'}`}>
                                {charCount}/{MAX_MESSAGE_LENGTH}
                            </span>
                        </div>
                    )}
                </div>

                <button
                    onClick={onSendMessage}
                    disabled={!inputMessage.trim() || isSending || isOverLimit}
                    className="w-10 h-10 text-white rounded-xl flex items-center justify-center shadow-md active:scale-90 disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed transition-all shrink-0 hover:shadow-lg"
                    style={{ backgroundColor: 'var(--theme-primary-bg)' }}
                    aria-label="Send message"
                    title={isSending ? "Sending..." : "Send message (Enter)"}
                >
                    {isSending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
            </div>
        </div>
    );
}
