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
            className="px-4 py-4 bg-[var(--scolor-contrast)] backdrop-blur-md border-b border-white/10 flex items-center justify-between shrink-0"
            role="banner"
        >
            <div className="flex items-center gap-2.5">
                {isAdmin && hasSelectedGuest && (
                    <button
                        onClick={onBack}
                        className="p-1.5 hover:bg-white/10 rounded-lg text-white/70 hover:text-white transition-all active:scale-95"
                        aria-label="Go back to chat list"
                    >
                        <ArrowLeft size={16} />
                    </button>
                )}
                <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg relative overflow-hidden group bg-white/10 border border-white/20"
                >
                    <MessageCircle className="w-5 h-5 text-white relative z-10" />
                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div>
                    <h3 className="text-sm font-black text-white leading-tight flex items-center gap-1.5 uppercase tracking-tight">
                        {isAdmin ? "Admin Panel" : "Customer Support"}
                        {isAdmin && <Shield size={10} className="text-[var(--theme-accent)]" />}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--scolor)] animate-pulse shadow-lg shadow-[var(--scolor)]/50" />
                        <span className="text-[10px] text-white/60 font-medium tracking-tight">
                            {isAdmin ? "Support Live" : "Typically replies instantly"}
                        </span>
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-1">
                {onToggleMaximize && (
                    <button
                        onClick={onToggleMaximize}
                        className="p-2 hover:bg-white/10 rounded-xl transition-all active:scale-90 text-white/70 hover:text-white"
                        aria-label={isMaximized ? "Minimize chat" : "Maximize chat"}
                    >
                        {isMaximized ? <Minimize2 size={18} /> : <Maximize2 size size={18} />}
                    </button>
                )}
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-white/10 rounded-xl transition-all hover:rotate-90 active:scale-90 text-white/70 hover:text-white"
                    aria-label="Close chat"
                >
                    <X size={20} />
                </button>
            </div>
        </header>
    );
});

export default ChatHeader;
