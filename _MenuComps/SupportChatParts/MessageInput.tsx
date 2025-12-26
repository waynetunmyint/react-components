import React from "react";
import { Send, Loader2 } from "lucide-react";

interface MessageInputProps {
    value: string;
    onChange: (value: string) => void;
    onSend: () => void;
    isSending: boolean;
    inputRef: React.RefObject<HTMLTextAreaElement | null>;
}

export default function MessageInput({
    value,
    onChange,
    onSend,
    isSending,
    inputRef
}: MessageInputProps) {
    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            onSend();
        }
    };

    return (
        <div className="border-t border-[var(--theme-border-primary)] bg-[var(--theme-secondary-bg)] p-4">
            <div className="flex items-end gap-2">
                <textarea
                    ref={inputRef}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    rows={1}
                    className="flex-1 bg-[var(--bg-200)] text-[var(--theme-text-primary)] placeholder-[var(--theme-text-muted)] rounded-2xl px-4 py-3 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-[var(--scolor)] max-h-32 min-h-[44px] transition-all border border-transparent focus:border-[var(--scolor)]/20"
                    style={{
                        height: 'auto',
                        overflow: value.split('\n').length > 4 ? 'auto' : 'hidden'
                    }}
                />
                <button
                    onClick={onSend}
                    disabled={!value.trim() || isSending}
                    className={`p-3 rounded-2xl transition-all shrink-0 shadow-lg active:scale-90 ${value.trim() && !isSending
                        ? "text-white shadow-[var(--scolor)]/20"
                        : "bg-[var(--bg-300)] text-[var(--theme-text-muted)] cursor-not-allowed shadow-none"
                        }`}
                    style={value.trim() && !isSending ? { background: 'var(--theme-accent-gradient)' } : {}}
                >
                    {isSending ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <Send className="w-5 h-5" />
                    )}
                </button>
            </div>
        </div>
    );
}
