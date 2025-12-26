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
        <div className="flex-1 flex flex-col bg-slate-900 overflow-hidden">
            {/* Search Bar */}
            <div className="p-3 border-b border-slate-800">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder="Search conversations..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full bg-slate-800 text-white text-xs pl-9 pr-4 py-2 rounded-xl border border-slate-700 focus:outline-none focus:ring-1 focus:ring-[var(--theme-primary-bg)]"
                    />
                </div>
            </div>

            {/* Thread List */}
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
                {filteredThreads.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-48 gap-3 text-slate-500">
                        <MessageCircle size={32} opacity={0.2} />
                        <p className="text-xs">No conversations found</p>
                    </div>
                ) : (
                    filteredThreads.map(thread => (
                        <button
                            key={thread.PageId}
                            onClick={() => onSelectThread(thread.PageId)}
                            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-800/50 transition-colors border-b border-slate-800/50 group"
                        >
                            <div
                                className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border shadow-sm transition-all group-hover:scale-105"
                                style={{
                                    backgroundColor: 'var(--theme-primary-bg)',
                                    color: 'var(--theme-primary-text)',
                                    borderColor: 'rgba(255,255,255,0.1)'
                                }}
                            >
                                {thread.PageName?.charAt(0).toUpperCase() || "?"}
                            </div>
                            <div className="flex-1 text-left min-w-0">
                                <div className="flex justify-between items-center mb-0.5">
                                    <span className="text-sm font-medium text-white truncate">{thread.PageName}</span>
                                    <span className="text-[10px] text-slate-500">
                                        {thread.LastMessageAt ? formatDate(thread.LastMessageAt) : ""}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-400 truncate pr-4">
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
