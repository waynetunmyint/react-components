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
            className="px-4 py-4 bg-[var(--a3)]  border-b border-[var(--bg1)] flex items-center justify-between shrink-0"
            role="banner"
        >
            <div className="flex items-center gap-2.5">
                {isAdmin && hasSelectedGuest && (
                    <button
                        onClick={onBack}
                        className="p-1.5 hover:bg-[var(--bg1)] rounded-lg text-[var(--t1)] hover:text-[var(--t1)] transition-all active:scale-95"
                        aria-label="Go back to chat list"
                    >
                        <ArrowLeft size={16} />
                    </button>
                )}
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden group bg-[var(--bg1)] border border-[var(--bg1)]"
                >
                    <MessageCircle className="w-5 h-5 text-[var(--t1)] relative z-10" />
                    <div className="absolute inset-0 bg-[var(--bg1)] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div>
                    <h3 className="text-sm font-black text-[var(--t1)] leading-tight flex items-center gap-1.5 uppercase tracking-tight">
                        {isAdmin ? "Admin Panel" : "Customer Support"}
                        {isAdmin && <Shield size={10} className="text-[var(--a2)]" />}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--a2)] animate-pulse shadow-lg shadow-[var(--a2)]/50" />
                        <span className="text-[10px] text-[var(--t1)] font-medium tracking-tight">
                            {isAdmin ? "Support Live" : "Typically replies instantly"}
                        </span>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-1">
                {onToggleMaximize && (
                    <button
                        onClick={onToggleMaximize}
                        className="p-2 hover:bg-[var(--bg1)] rounded-xl transition-all active:scale-90 text-[var(--t1)] hover:text-[var(--t1)]"
                        aria-label={isMaximized ? "Minimize chat" : "Maximize chat"}
                    >
                        {isMaximized ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                    </button>
                )}
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-[var(--bg1)] rounded-xl transition-all hover:rotate-90 active:scale-90 text-[var(--t1)] hover:text-[var(--t1)]"
                    aria-label="Close chat"
                >
                    <X size={20} />
                </button>
            </div>
        </header>
    );
});

export default ChatHeader;
