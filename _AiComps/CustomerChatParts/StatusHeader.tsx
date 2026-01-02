import React, { memo } from "react";
import { Trash2, Bot, BotOff, LogOut, User, Maximize2, Minimize2 } from "lucide-react";

interface StatusHeaderProps {
    isAdmin: boolean;
    guestName: string;
    onDeleteRecord: () => void;
    onEndChat: () => void;
    hasSelectedGuest: boolean;
    isAiEnabled?: boolean;
    onToggleAi?: () => void;
    isMaximized?: boolean;
    onToggleMaximize?: () => void;
}

const StatusHeader = memo(function StatusHeader({
    isAdmin,
    guestName,
    onDeleteRecord,
    onEndChat,
    hasSelectedGuest,
    isAiEnabled,
    onToggleAi,
    isMaximized,
    onToggleMaximize
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
            className="px-5 py-4 flex items-center justify-between border-b border-[var(--bg3)] bg-[var(--bg1)] shrink-0 z-30 relative shadow-sm"
            role="region"
            aria-label="Chat status"
        >
            <div className="flex items-center gap-3.5">
                {/* Avatar with Premium Ring */}
                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-tr from-[var(--a1)] to-[var(--a2)] rounded-[1.25rem] blur opacity-30 group-hover:opacity-60 transition duration-500"></div>
                    <div
                        className="relative w-11 h-11 rounded-[1.25rem] flex items-center justify-center text-[var(--t1)] font-black text-sm shadow-xl border-2 border-[var(--bg1)] transform hover:scale-105 transition-all duration-300"
                        style={{ background: 'linear-gradient(135deg, var(--a2) 0%, var(--a3) 100%)' }}
                        aria-hidden="true"
                    >
                        {getInitials(guestName)}
                    </div>
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-[var(--g2)] border-2 border-[var(--bg1)] rounded-full animate-pulse shadow-sm"></div>
                </div>

                {/* Name & Status */}
                <div className="min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="text-[10px] text-[var(--t2)] font-bold uppercase tracking-widest">
                            {isAdmin ? "Support" : "Support"}
                        </span>
                        <div className="w-1 h-1 rounded-full bg-[var(--bg3)]"></div>
                        <span className="text-[10px] text-[var(--a2)] font-black uppercase tracking-widest">Online</span>
                    </div>
                    <span className="text-[14px] text-[var(--t3)] font-black leading-none block truncate max-w-[140px]">
                        {guestName || (isAdmin ? "Support" : "Support Guest")}
                    </span>
                </div>
            </div>

            <div className="flex items-center gap-3">
                {/* AI Toggle (Admin Only) */}
                {isAdmin && onToggleAi && (
                    <button
                        onClick={onToggleAi}
                        className={`flex items-center gap-1.5 px-3 py-2 rounded-2xl border transition-all duration-300 transform active:scale-95 ${isAiEnabled
                            ? 'bg-[var(--bg2)] text-[var(--a2)] border-[var(--a2)] shadow-sm'
                            : 'bg-[var(--bg1)] border-[var(--bg3)] text-[var(--t2)] hover:border-[var(--a2)] hover:text-[var(--a2)]'
                            }`}
                        title={isAiEnabled ? "AI Auto-Reply: ON" : "AI Auto-Reply: OFF"}
                    >
                        {isAiEnabled ? <Bot size={14} className="animate-float" /> : <BotOff size={14} />}
                        <span className="text-[10px] font-black uppercase tracking-wider">AI</span>
                    </button>
                )}

                {/* Maximize/Minimize Button */}
                {onToggleMaximize && (
                    <button
                        onClick={onToggleMaximize}
                        className="p-2.5 bg-[var(--bg1)] border border-[var(--bg3)] hover:bg-[var(--bg2)] rounded-2xl text-[var(--t2)] hover:text-[var(--a2)] transition-all transform active:scale-90 shadow-sm"
                        title={isMaximized ? "Exit Fullscreen" : "Maximize Chat"}
                    >
                        {isMaximized ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                    </button>
                )}

                {/* Admin Badge or End Chat Button */}
                {isAdmin ? (
                    <div className="flex items-center gap-2 bg-[var(--bg2)] text-[var(--a3)] text-[10px] font-black px-3 py-2 rounded-2xl border border-[var(--bg3)] uppercase tracking-widest shadow-sm">
                        <User size={12} strokeWidth={3} />
                        Admin
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        {isAdmin && hasSelectedGuest && (
                            <button
                                onClick={onDeleteRecord}
                                className="p-2.5 bg-[var(--bg1)] border border-[var(--r1)] hover:bg-[var(--r1)] rounded-2xl text-[var(--r2)] hover:text-[var(--r3)] transition-all transform active:scale-90"
                                title="Delete entire conversation"
                            >
                                <Trash2 size={16} />
                            </button>
                        )}
                        <button
                            onClick={onEndChat}
                            className="flex items-center gap-2 text-[10px] font-black text-[var(--t1)] bg-[var(--t3)] hover:bg-[var(--a3)] transition-all px-4 py-2.5 rounded-2xl uppercase tracking-widest shadow-lg transform active:scale-95"
                        >
                            <LogOut size={14} strokeWidth={3} />
                            Exit
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
});

export default StatusHeader;
