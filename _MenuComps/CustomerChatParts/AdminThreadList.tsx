import React, { memo, useMemo } from "react";
import { Search, ChevronRight, User, Bot, BotOff, Trash2, MessageSquare, Clock } from "lucide-react";
import { AdminThread } from "./types";

interface AdminThreadListProps {
    threads: AdminThread[];
    searchQuery: string;
    setSearchQuery: (val: string) => void;
    onSelectThread: (guestId: string, guestName: string) => void;
    onDeleteThread: (recordId: number) => void;
    isAiEnabled?: boolean;
    onToggleAi?: () => void;
}

const AdminThreadList = memo(function AdminThreadList({
    threads,
    searchQuery,
    setSearchQuery,
    onSelectThread,
    onDeleteThread,
    isAiEnabled,
    onToggleAi
}: AdminThreadListProps) {
    const filteredThreads = useMemo(() =>
        threads.filter(t =>
            t.GuestName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.GuestPhone?.toLowerCase().includes(searchQuery.toLowerCase())
        ),
        [threads, searchQuery]
    );

    // Get initials for avatar
    const getInitials = (name: string) => {
        if (!name) return '?';
        const parts = name.trim().split(' ');
        if (parts.length >= 2) {
            return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
        }
        return name.substring(0, 2).toUpperCase();
    };

    // Format relative time
    const getRelativeTime = (dateStr?: string) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <div
            className="flex-1 flex flex-col bg-gradient-to-b from-slate-900 to-slate-950 overflow-hidden"
            role="region"
            aria-label="Customer chat threads"
        >
            {/* Header */}
            <div className="p-4 border-b border-slate-800/50 space-y-3 bg-slate-800/20">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <MessageSquare size={14} className="text-slate-500" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                            Customer Threads
                        </span>
                        <span className="px-1.5 py-0.5 bg-slate-800 rounded-md text-[9px] font-bold text-slate-400">
                            {filteredThreads.length}
                        </span>
                    </div>
                    <button
                        onClick={onToggleAi}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-all duration-300 hover:scale-105 active:scale-95 ${isAiEnabled
                                ? 'bg-gradient-to-r from-blue-500/20 to-indigo-500/20 border-blue-500/40 text-blue-400 shadow-lg shadow-blue-500/10'
                                : 'bg-slate-800/60 border-slate-700/50 text-slate-500'
                            }`}
                        title={isAiEnabled ? "Global AI Auto-Reply: ON" : "Global AI Auto-Reply: OFF"}
                        aria-label={isAiEnabled ? "Disable global AI auto-reply" : "Enable global AI auto-reply"}
                        aria-pressed={isAiEnabled}
                    >
                        {isAiEnabled ? <Bot size={14} className="animate-pulse" /> : <BotOff size={14} />}
                        <span className="text-[10px] font-black uppercase tracking-wider">
                            {isAiEnabled ? 'AI On' : 'AI Off'}
                        </span>
                    </button>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search by name or phone..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-800/60 border border-slate-700/50 text-white rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500/50 transition-all placeholder:text-slate-600"
                        aria-label="Search customer threads"
                    />
                </div>
            </div>

            {/* Thread List */}
            <div
                className="flex-1 overflow-y-auto px-4 py-3 space-y-2 scrollbar-hide"
                role="list"
            >
                {filteredThreads.map((thread, idx) => (
                    <div
                        key={idx}
                        className="relative group animate-fadeIn"
                        role="listitem"
                        style={{ animationDelay: `${idx * 50}ms` }}
                    >
                        <button
                            onClick={() => onSelectThread(thread.GuestId, thread.GuestName)}
                            className="w-full flex items-center justify-between p-3 bg-slate-800/40 hover:bg-slate-800/70 border border-slate-700/30 hover:border-slate-600/50 rounded-2xl transition-all duration-200 group-hover:shadow-lg"
                            aria-label={`Open chat with ${thread.GuestName}`}
                        >
                            <div className="flex items-center gap-3">
                                {/* Avatar */}
                                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[var(--theme-primary-bg)] to-[var(--theme-primary-bg)]/70 flex items-center justify-center text-white font-bold text-[11px] border border-white/10 shadow-lg group-hover:scale-105 transition-transform">
                                    {getInitials(thread.GuestName)}
                                </div>

                                {/* Info */}
                                <div className="text-left min-w-0">
                                    <p className="text-[13px] font-bold text-white mb-0.5 truncate max-w-[140px]">
                                        {thread.GuestName || 'Unknown'}
                                    </p>
                                    <p className="text-[10px] text-slate-500 flex items-center gap-1.5">
                                        <span className="truncate max-w-[80px]">{thread.GuestPhone || 'No phone'}</span>
                                        {thread.UpdatedAt && (
                                            <>
                                                <span className="text-slate-600">•</span>
                                                <span className="flex items-center gap-0.5 text-slate-600">
                                                    <Clock size={9} />
                                                    {getRelativeTime(thread.UpdatedAt)}
                                                </span>
                                            </>
                                        )}
                                    </p>
                                </div>
                            </div>

                            {/* Arrow */}
                            <ChevronRight className="w-5 h-5 text-slate-600 group-hover:text-white group-hover:translate-x-1 transition-all mr-10" />
                        </button>

                        {/* Delete Button */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDeleteThread(thread.Id);
                            }}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 text-slate-600 hover:text-red-400 hover:bg-red-500/15 rounded-xl transition-all opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95"
                            title="Delete this conversation"
                            aria-label={`Delete conversation with ${thread.GuestName}`}
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                ))}

                {/* Empty State */}
                {filteredThreads.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-500 animate-fadeIn">
                        <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center mb-4 border border-slate-700/50">
                            <User size={32} className="opacity-30" />
                        </div>
                        <p className="text-sm font-medium text-slate-400 mb-1">
                            {searchQuery ? 'No matches found' : 'No chats yet'}
                        </p>
                        <p className="text-[11px] text-slate-600">
                            {searchQuery
                                ? 'Try a different search term'
                                : 'Customer conversations will appear here'
                            }
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
});

export default AdminThreadList;
