import React from "react";
import { Search, MessageCircle } from "lucide-react";
import { Thread } from "./types";

interface ThreadListProps {
    threads: Thread[];
    searchQuery: string;
    onSearchChange: (value: string) => void;
    onSelectThread: (pageId: number) => void;
}

export default function ThreadList({
    threads,
    searchQuery,
    onSearchChange,
    onSelectThread
}: ThreadListProps) {
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return "Today";
        } else if (date.toDateString() === yesterday.toDateString()) {
            return "Yesterday";
        }
        return date.toLocaleDateString();
    };

    const filteredThreads = threads.filter(t =>
        t.PageName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.PageId.toString().includes(searchQuery)
    );

    return (
        <div className="flex-1 flex flex-col bg-[var(--theme-secondary-bg)] overflow-hidden">
            {/* Search Bar */}
            <div className="p-4 border-b border-[var(--theme-border-primary)]">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--theme-text-muted)]" />
                    <input
                        type="text"
                        placeholder="Search conversations..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full bg-[var(--bg-200)] text-[var(--theme-text-primary)] text-sm pl-9 pr-4 py-2.5 rounded-xl border border-transparent focus:outline-none focus:ring-1 focus:ring-[var(--scolor)] transition-all"
                    />
                </div>
            </div>

            {/* Thread List */}
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[var(--bg-300)] scrollbar-track-transparent">
                {filteredThreads.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 gap-3 text-[var(--theme-text-muted)]">
                        <MessageCircle size={32} opacity={0.3} />
                        <p className="text-xs font-medium">No conversations found</p>
                    </div>
                ) : (
                    filteredThreads.map(thread => (
                        <button
                            key={thread.PageId}
                            onClick={() => onSelectThread(thread.PageId)}
                            className="w-full flex items-center gap-3 px-4 py-4 hover:bg-[var(--bg-200)] transition-all border-b border-[var(--theme-border-primary)] group"
                        >
                            <div
                                className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg border-2 shadow-md transition-all group-hover:scale-110 group-hover:rotate-3"
                                style={{
                                    background: 'var(--theme-accent-gradient)',
                                    color: 'white',
                                    borderColor: 'white'
                                }}
                            >
                                {thread.PageName?.charAt(0).toUpperCase() || "?"}
                            </div>
                            <div className="flex-1 text-left min-w-0">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm font-bold text-[var(--theme-text-primary)] truncate uppercase tracking-tight">{thread.PageName}</span>
                                    <span className="text-[10px] font-bold text-[var(--theme-text-muted)]">
                                        {thread.LastMessageAt ? formatDate(thread.LastMessageAt) : ""}
                                    </span>
                                </div>
                                <p className="text-xs text-[var(--theme-text-muted)] truncate pr-4 font-medium italic">
                                    {thread.LastMessage || "No messages yet"}
                                </p>
                            </div>
                        </button>
                    ))
                )}
            </div>
        </div>
    );
}
