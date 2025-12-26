import React, { memo } from "react";
import { X, ArrowLeft, MessageCircle, Shield, Maximize2, Minimize2 } from "lucide-react";

interface ChatHeaderProps {
    isAdmin: boolean;
    hasSelectedGuest: boolean;
    onBack?: () => void;
    onClose: () => void;
    isMaximized?: boolean;
    onToggleMaximize?: () => void;
}

const ChatHeader = memo(function ChatHeader({
    isAdmin,
    hasSelectedGuest,
    onBack,
    onClose,
    isMaximized,
    onToggleMaximize
}: ChatHeaderProps) {
    return (
        <header
            className="px-4 py-3 bg-[var(--theme-secondary-bg)]/95 backdrop-blur-md border-b border-[var(--theme-border-primary)]/10 flex items-center justify-between shrink-0"
            role="banner"
        >
            <div className="flex items-center gap-2.5">
                {isAdmin && hasSelectedGuest && (
                    <button
                        onClick={onBack}
                        className="p-1.5 hover:bg-[var(--theme-text-secondary)]/10 rounded-lg text-[var(--theme-text-muted)] hover:text-[var(--theme-text-primary)] transition-all active:scale-95"
                        aria-label="Go back to chat list"
                    >
                        <ArrowLeft size={16} />
                    </button>
                )}
                <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden group"
                    style={{ backgroundColor: 'var(--theme-primary-bg)' }}
                >
                    <MessageCircle className="w-4 h-4 text-[var(--theme-primary-text)] relative z-10" />
                    <div className="absolute inset-0 bg-[var(--theme-text-primary)]/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div>
                    <h3 className="text-[13px] font-bold text-[var(--theme-text-primary)] leading-tight flex items-center gap-1.5">
                        {isAdmin ? "Customer Chats" : "Customer Support"}
                        {isAdmin && <Shield size={10} className="text-[var(--theme-accent)]" />}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--scolor)] animate-pulse shadow-lg shadow-[var(--scolor)]/50" />
                        <span className="text-[9px] text-[var(--theme-text-muted)] font-bold tracking-tight uppercase">
                            {isAdmin ? "Live Dashboard" : "Online • Typically replies instantly"}
                        </span>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-1">
                {onToggleMaximize && (
                    <button
                        onClick={onToggleMaximize}
                        className="p-2 hover:bg-[var(--theme-text-secondary)]/10 rounded-xl transition-all active:scale-90"
                        aria-label={isMaximized ? "Minimize chat" : "Maximize chat"}
                    >
                        {isMaximized ? <Minimize2 size={18} className="text-[var(--theme-text-muted)]" /> : <Maximize2 size={18} className="text-[var(--theme-text-muted)]" />}
                    </button>
                )}
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-[var(--theme-text-secondary)]/10 rounded-xl transition-all hover:rotate-90 active:scale-90"
                    aria-label="Close chat"
                >
                    <X size={18} className="text-[var(--theme-text-muted)]" />
                </button>
            </div>
        </header>
    );
});

export default ChatHeader;
