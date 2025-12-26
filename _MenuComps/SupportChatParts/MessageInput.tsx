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
        <div className="border-t border-slate-700 bg-slate-800 p-3">
            <div className="flex items-end gap-2">
                <textarea
                    ref={inputRef}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a message..."
                    rows={1}
                    className="flex-1 bg-slate-700 text-white placeholder-slate-400 rounded-xl px-4 py-2.5 text-xs resize-none focus:outline-none focus:ring-1 focus:ring-[var(--theme-primary-bg)] max-h-24 min-h-[40px]"
                    style={{
                        height: 'auto',
                        overflow: value.split('\n').length > 3 ? 'auto' : 'hidden'
                    }}
                />
                <button
                    onClick={onSend}
                    disabled={!value.trim() || isSending}
                    className={`p-2.5 rounded-xl transition-all shrink-0 ${value.trim() && !isSending
                        ? "bg-[var(--theme-primary-bg)] text-[var(--theme-primary-text)] hover:opacity-90"
                        : "bg-slate-700 text-slate-500 cursor-not-allowed"
                        }`}
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
