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
            className="px-4 py-3 flex items-center justify-between border-b border-slate-800/50 bg-gradient-to-r from-slate-800/30 to-slate-800/10 backdrop-blur-sm shrink-0"
            role="region"
            aria-label="Chat status"
        >
            <div className="flex items-center gap-3">
                {/* Avatar */}
                <div
                    className="w-8 h-8 rounded-xl bg-gradient-to-br from-[var(--theme-primary-bg)] to-[var(--theme-primary-bg)]/70 flex items-center justify-center text-white font-bold text-[10px] shadow-lg border border-white/10"
                    aria-hidden="true"
                >
                    {getInitials(guestName)}
                </div>

                {/* Name & Status */}
                <div className="min-w-0">
                    <span className="text-[9px] text-slate-500 font-medium block leading-none mb-0.5">
                        {isAdmin ? "Chatting with" : "Chatting as"}
                    </span>
                    <span className="text-[12px] text-white font-bold leading-tight block truncate max-w-[120px]">
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
                                ? 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border-blue-500/40 text-blue-400 shadow-lg shadow-blue-500/10'
                                : 'bg-slate-800/60 border-slate-700/50 text-slate-500 hover:border-slate-600'
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
                        className="p-2 hover:bg-red-500/15 rounded-xl text-red-500/50 hover:text-red-400 transition-all hover:scale-105 active:scale-95"
                        title="Delete entire conversation"
                        aria-label="Delete conversation"
                    >
                        <Trash2 size={14} />
                    </button>
                )}

                {/* Admin Badge or End Chat Button */}
                {isAdmin ? (
                    <div className="flex items-center gap-1.5 bg-gradient-to-r from-slate-800 to-slate-800/80 text-slate-400 text-[9px] font-bold px-2.5 py-1.5 rounded-xl border border-slate-700/50 uppercase tracking-wider shadow-inner">
                        <User size={10} />
                        Admin
                    </div>
                ) : (
                    <button
                        onClick={onEndChat}
                        className="flex items-center gap-1.5 text-[9px] font-bold text-red-400/80 hover:text-red-400 transition-all px-2.5 py-1.5 hover:bg-red-500/10 rounded-xl uppercase tracking-wider"
                        aria-label="End chat session"
                    >
                        <LogOut size={11} />
                        End
                    </button>
                )}
            </div>
        </div>
    );
});

export default StatusHeader;
