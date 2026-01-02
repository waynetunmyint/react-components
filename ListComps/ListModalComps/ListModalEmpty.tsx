"use client";
import React from "react";
import { Search, Filter, Plus, RefreshCw, X, Inbox, Sparkles } from "lucide-react";

interface ListModalEmptyProps {
    dataSource: string;
    hasFiltersApplied: boolean;
    onRefresh: () => void;
    onClearFilters: () => void;
    onCreateClick: () => void;
}

export function ListModalEmpty({
    dataSource,
    hasFiltersApplied,
    onRefresh,
    onClearFilters,
    onCreateClick,
}: ListModalEmptyProps) {
    const emptyTitle = hasFiltersApplied ? "No matches found" : `No ${dataSource} yet`;
    const emptyDescription = hasFiltersApplied
        ? "Try adjusting your search or filters to find what you're looking for."
        : "Get started by creating your first entry. It only takes a moment!";

    return (
        <div className="flex flex-col items-center justify-center py-24 text-center px-6">
            {/* Premium animated icon container */}
            <div className="relative mb-8 group">
                {/* Animated rings */}
                <div className="absolute inset-0 -m-4">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 animate-ping" style={{ animationDuration: '3s' }} />
                    <div className="absolute inset-2 rounded-full bg-gradient-to-r from-indigo-500/10 to-pink-500/10 animate-pulse" style={{ animationDuration: '2s' }} />
                </div>

                {/* Main icon container */}
                <div className="relative w-28 h-28 rounded-3xl bg-gradient-to-br from-[var(--bg1)] to-[var(--bg2)] shadow-2xl shadow-black/10 flex items-center justify-center border border-[var(--bg3)] group-hover:scale-105 transition-transform duration-500">
                    {hasFiltersApplied ? (
                        <Search size={48} className="text-[var(--t2)]" strokeWidth={1.5} />
                    ) : (
                        <Inbox size={48} className="text-[var(--t2)]" strokeWidth={1.5} />
                    )}
                </div>

                {/* Floating badge */}
                <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/40 animate-bounce" style={{ animationDuration: '2s' }}>
                    {hasFiltersApplied ? (
                        <Filter size={18} className="text-white" strokeWidth={2.5} />
                    ) : (
                        <Plus size={22} className="text-white" strokeWidth={2.5} />
                    )}
                </div>
            </div>

            {/* Text Content with better typography */}
            <div className="space-y-3 max-w-sm mb-10">
                <h3 className="text-2xl font-black text-[var(--t3)] tracking-tight">{emptyTitle}</h3>
                <p className="text-base text-[var(--t2)] leading-relaxed">{emptyDescription}</p>
            </div>

            {/* Premium Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-3">
                {hasFiltersApplied && (
                    <button
                        onClick={onClearFilters}
                        className="group inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-[var(--bg1)] text-[var(--t2)] text-sm font-bold border-2 border-[var(--bg3)] hover:border-[var(--t2)] hover:text-[var(--t3)] transition-all duration-300 hover:shadow-lg active:scale-95"
                    >
                        <X size={18} className="group-hover:rotate-90 transition-transform duration-300" />
                        Clear All Filters
                    </button>
                )}

                <button
                    onClick={onCreateClick}
                    className="group relative inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl text-white text-sm font-bold overflow-hidden transition-all duration-300 active:scale-95 shadow-xl shadow-blue-500/30 hover:shadow-2xl hover:shadow-blue-500/40 hover:-translate-y-0.5"
                >
                    {/* Animated gradient background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 bg-[length:200%_100%] animate-gradient-x" />

                    {/* Content */}
                    <span className="relative flex items-center gap-2.5">
                        <Sparkles size={18} className="animate-pulse" />
                        Create Your First {dataSource}
                    </span>
                </button>
            </div>

            {/* Optional refresh hint */}
            <button
                onClick={onRefresh}
                className="mt-8 inline-flex items-center gap-2 text-xs text-[var(--t2)]/60 hover:text-[var(--t2)] transition-colors"
            >
                <RefreshCw size={12} />
                Refresh to check for updates
            </button>

            {/* CSS for gradient animation */}
            <style>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-x {
          animation: gradient-x 3s ease infinite;
        }
      `}</style>
        </div>
    );
}
