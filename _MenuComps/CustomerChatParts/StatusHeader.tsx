import React, { memo } from "react";
import { Trash2, Bot, BotOff, LogOut, User } from "lucide-react";

interface StatusHeaderProps {
    isAdmin: boolean;
    guestName: string;
    onDeleteRecord: () => void;
    onEndChat: () => void;
    hasSelectedGuest: boolean;
    isAiEnabled?: boolean;
    onToggleAi?: () => void;
}

const StatusHeader = memo(function StatusHeader({
    isAdmin,
    guestName,
    onDeleteRecord,
    onEndChat,
    hasSelectedGuest,
    isAiEnabled,
    onToggleAi
}: StatusHeaderProps) {
    // Get initials for avatar
    const getInitials = (name: string) => {
        if (!name) return '?';
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    return (
        <div
            className="px-4 py-3 flex items-center justify-between border-b border-[var(--theme-text-primary)]/5 bg-gradient-to-r from-[var(--theme-secondary-bg)]/30 to-[var(--theme-secondary-bg)]/10 backdrop-blur-sm shrink-0"
            role="region"
            aria-label="Chat status"
        >
            <div className="flex items-center gap-3">
                {/* Avatar */}
                <div
                    className="w-10 h-10 rounded-[1.25rem] flex items-center justify-center text-white font-black text-xs shadow-lg border-2 border-white/20 transform hover:rotate-3 transition-transform"
                    style={{ background: 'var(--theme-accent-gradient)' }}
                    aria-hidden="true"
                >
                    {getInitials(guestName)}
                </div>

                {/* Name & Status */}
                <div className="min-w-0">
                    <span className="text-[9px] text-[var(--theme-text-muted)] font-medium block leading-none mb-0.5">
                        {isAdmin ? "Chatting with" : "Chatting as"}
                    </span>
                    <span className="text-[12px] text-[var(--theme-text-primary)] font-bold leading-tight block truncate max-w-[120px]">
                        {guestName || (isAdmin ? "Customer" : "Support Guest")}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-2">
                {/* AI Toggle (Admin Only) */}
                {isAdmin && onToggleAi && (
                    <button
                        onClick={onToggleAi}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-all duration-300 hover:scale-105 active:scale-95 ${isAiEnabled
                            ? 'bg-gradient-to-r from-[var(--theme-accent)]/20 to-[var(--scolor-contrast)]/20 border-[var(--theme-accent)]/40 text-[var(--theme-accent)] shadow-lg shadow-[var(--theme-accent)]/10'
                            : 'bg-[var(--theme-text-secondary)]/10 border-[var(--theme-text-secondary)]/20 text-[var(--theme-text-muted)] hover:border-[var(--theme-text-secondary)]/30'
                            }`}
                        title={isAiEnabled ? "AI Auto-Reply: ON (Click to disable)" : "AI Auto-Reply: OFF (Click to enable)"}
                        aria-label={isAiEnabled ? "Disable AI auto-reply" : "Enable AI auto-reply"}
                        aria-pressed={isAiEnabled}
                    >
                        {isAiEnabled ? (
                            <Bot size={13} className="animate-pulse" />
                        ) : (
                            <BotOff size={13} />
                        )}
                        <span className="text-[9px] font-black uppercase tracking-wider">
                            {isAiEnabled ? 'AI On' : 'AI Off'}
                        </span>
                    </button>
                )}

                {/* Delete Button (Admin with selected guest) */}
                {isAdmin && hasSelectedGuest && (
                    <button
                        onClick={onDeleteRecord}
                        className="p-2 hover:bg-[var(--theme-accent)]/15 rounded-xl text-[var(--theme-accent)]/50 hover:text-[var(--theme-accent)] transition-all hover:scale-105 active:scale-95"
                        title="Delete entire conversation"
                        aria-label="Delete conversation"
                    >
                        <Trash2 size={14} />
                    </button>
                )}

                {/* Admin Badge or End Chat Button */}
                {isAdmin ? (
                    <div className="flex items-center gap-1.5 bg-gradient-to-r from-[var(--theme-text-secondary)]/10 to-[var(--theme-text-secondary)]/5 text-[var(--theme-text-muted)] text-[9px] font-bold px-2.5 py-1.5 rounded-xl border border-[var(--theme-text-secondary)]/20 uppercase tracking-wider shadow-inner">
                        <User size={10} />
                        Admin
                    </div>
                ) : (
                    <button
                        onClick={onEndChat}
                        className="flex items-center gap-1.5 text-[10px] font-bold text-white bg-[var(--accent-500)] hover:bg-[var(--accent-600)] transition-all px-3 py-1.5 rounded-xl uppercase tracking-wider shadow-md hover:shadow-lg active:scale-95"
                        aria-label="End chat session"
                    >
                        <LogOut size={12} />
                        End Chat
                    </button>
                )}
            </div>
        </div>
    );
});

export default StatusHeader;
