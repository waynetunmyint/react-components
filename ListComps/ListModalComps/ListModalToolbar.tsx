"use client";
import React from "react";
import {
    Search,
    RefreshCw,
    X,
    Filter,
    Plus,
    ChevronDown,
    Sparkles,
    SlidersHorizontal,
} from "lucide-react";

interface ListModalToolbarProps {
    dataSource: string;
    search: string;
    refreshing: boolean;
    showFilters: boolean;
    statusFilter: number | null;
    pageTitleFilter: string | null;
    uniquePageTitles: string[];
    totalResultsLabel: string;
    filteredDataLength: number;
    searchInputId: string;
    setSearch: (val: string) => void;
    setShowFilters: (val: boolean) => void;
    setStatusFilter: (val: number | null) => void;
    setPageTitleFilter: (val: string | null) => void;
    fetchSearchData: (keyword: string) => void;
    fetchData: (page: number) => void;
    handleRefresh: () => void;
    onCreateClick: () => void;
}

export function ListModalToolbar({
    dataSource,
    search,
    refreshing,
    showFilters,
    statusFilter,
    pageTitleFilter,
    uniquePageTitles,
    totalResultsLabel,
    filteredDataLength,
    searchInputId,
    setSearch,
    setShowFilters,
    setStatusFilter,
    setPageTitleFilter,
    fetchSearchData,
    fetchData,
    handleRefresh,
    onCreateClick,
}: ListModalToolbarProps) {
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            fetchSearchData(search);
        }
    };

    const hasActiveFilters = statusFilter !== null || pageTitleFilter !== null || search.trim() !== "";

    return (
        <div className="sticky top-0 z-20 bg-[var(--bg1)]/80 backdrop-blur-xl border-b border-[var(--bg3)]/50 -mx-5 px-5 pb-3 pt-5 mb-2 shadow-sm">
            <div className="mx-auto w-full space-y-4">
                {/* Header Row - Premium styling */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl font-black text-[var(--t3)] capitalize tracking-tight">
                            {dataSource}
                        </h1>
                        {filteredDataLength > 0 && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-[var(--bg2)] to-[var(--bg1)] text-[var(--t2)] border border-[var(--bg3)] shadow-sm">
                                <Sparkles size={12} className="text-amber-500" />
                                {totalResultsLabel}
                            </span>
                        )}
                    </div>

                    {/* Premium Create Button */}
                    <button
                        onClick={onCreateClick}
                        className="group relative inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white overflow-hidden transition-all duration-300 active:scale-95 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5"
                        aria-label={`Create ${dataSource}`}
                    >
                        {/* Animated gradient background */}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 bg-[length:200%_100%] group-hover:animate-gradient-x transition-all" />

                        {/* Content */}
                        <span className="relative flex items-center gap-2">
                            <Plus size={18} strokeWidth={2.5} className="group-hover:rotate-90 transition-transform duration-300" />
                            <span className="hidden sm:inline">Create New</span>
                        </span>
                    </button>
                </div>

                {/* Search & Filter Row */}
                <div className="flex flex-col sm:flex-row gap-3">
                    {/* Page Title Filter - Minimalist dropdown */}
                    {uniquePageTitles.length > 0 && (
                        <div className="relative min-w-[180px] group">
                            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--t2)] pointer-events-none z-10 group-focus-within:text-[var(--a2)] transition-colors">
                                <SlidersHorizontal size={14} />
                            </div>
                            <select
                                value={pageTitleFilter || ""}
                                onChange={(e) => {
                                    const val = e.target.value || null;
                                    setPageTitleFilter(val);
                                    setTimeout(() => fetchData(1), 50);
                                }}
                                className="w-full pl-10 pr-10 py-3 bg-[var(--bg1)] border border-[var(--bg3)] rounded-xl text-[13px] font-semibold text-[var(--t3)] appearance-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer"
                            >
                                <option value="">All Pages</option>
                                {uniquePageTitles.map((title) => (
                                    <option key={title} value={title}>
                                        {title}
                                    </option>
                                ))}
                            </select>
                            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--t2)] pointer-events-none">
                                <ChevronDown size={14} />
                            </div>
                        </div>
                    )}

                    {/* Search Bar - Ultra premium style */}
                    <div className="relative group flex-1">
                        <label htmlFor={searchInputId} className="sr-only">
                            Search {dataSource}
                        </label>

                        {/* Glow effect on focus */}
                        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-pink-500/30 opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 blur-md" />

                        <div className="relative">
                            <Search
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--t2)] group-focus-within:text-[var(--a2)] transition-colors duration-200 pointer-events-none"
                                size={18}
                            />
                            <input
                                id={searchInputId}
                                type="text"
                                placeholder={`Search ${dataSource}...`}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="w-full pl-12 pr-32 py-3.5 bg-[var(--bg1)] border border-[var(--bg3)] rounded-xl text-[14px] font-medium text-[var(--t3)] placeholder:text-[var(--t2)]/60 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-all duration-200 shadow-sm hover:shadow-md"
                            />

                            {/* Action buttons */}
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                {search && (
                                    <button
                                        onClick={() => {
                                            setSearch("");
                                            fetchData(1);
                                        }}
                                        className="p-2 hover:bg-[var(--bg2)] text-[var(--t2)] hover:text-[var(--r2)] rounded-lg transition-all duration-150 active:scale-90"
                                        aria-label="Clear search"
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                                <button
                                    onClick={() => fetchSearchData(search)}
                                    className="p-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white rounded-lg transition-all duration-150 active:scale-90 shadow-sm hover:shadow-md"
                                    aria-label="Search"
                                >
                                    <Search size={14} strokeWidth={2.5} />
                                </button>
                                <button
                                    onClick={handleRefresh}
                                    disabled={refreshing}
                                    className="p-2 hover:bg-[var(--bg2)] text-[var(--t2)] rounded-lg transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed active:scale-90"
                                    aria-label="Refresh list"
                                >
                                    <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
                                </button>
                                <button
                                    onClick={() => setShowFilters(!showFilters)}
                                    className={`relative p-2 rounded-lg transition-all duration-200 active:scale-90 ${showFilters
                                        ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md"
                                        : "hover:bg-[var(--bg2)] text-[var(--t2)]"
                                        }`}
                                    aria-pressed={showFilters}
                                    aria-label="Toggle filters"
                                >
                                    <Filter size={16} />
                                    {hasActiveFilters && !showFilters && (
                                        <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-[var(--bg1)]" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Expandable Filter Panel - Premium glass effect */}
                {showFilters && (
                    <div className="animate-in slide-in-from-top-2 duration-300 p-4 bg-[var(--bg1)]/80 backdrop-blur-md rounded-2xl border border-[var(--bg3)] shadow-lg">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-black text-[var(--t3)] uppercase tracking-widest">
                                Filter by Status
                            </span>
                            {statusFilter !== null && (
                                <button
                                    onClick={() => setStatusFilter(null)}
                                    className="inline-flex items-center gap-1 text-xs text-[var(--a2)] hover:text-blue-700 font-bold transition-colors"
                                >
                                    <X size={12} />
                                    Clear
                                </button>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {[
                                { value: 1, label: "Active", emoji: "✓", bgClass: "bg-emerald-50 border-emerald-200 text-emerald-700", activeBg: "bg-emerald-500 text-white border-emerald-600 shadow-lg shadow-emerald-500/30" },
                                { value: 0, label: "Inactive", emoji: "⏸", bgClass: "bg-red-50 border-red-200 text-red-600", activeBg: "bg-red-500 text-white border-red-600 shadow-lg shadow-red-500/30" },
                                { value: 2, label: "Sold", emoji: "🛍", bgClass: "bg-amber-50 border-amber-200 text-amber-700", activeBg: "bg-amber-500 text-white border-amber-600 shadow-lg shadow-amber-500/30" },
                                { value: 9, label: "Verified", emoji: "✨", bgClass: "bg-violet-50 border-violet-200 text-violet-700", activeBg: "bg-violet-500 text-white border-violet-600 shadow-lg shadow-violet-500/30" },
                            ].map((filter) => (
                                <button
                                    key={filter.value}
                                    onClick={() => setStatusFilter(statusFilter === filter.value ? null : filter.value)}
                                    className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl border transition-all duration-200 active:scale-95 ${statusFilter === filter.value ? filter.activeBg : `${filter.bgClass} hover:shadow-md`
                                        }`}
                                >
                                    <span>{filter.emoji}</span>
                                    {filter.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* CSS for gradient animation */}
            <style>{`
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .group-hover\\:animate-gradient-x:hover {
          animation: gradient-x 2s ease infinite;
        }
      `}</style>
        </div>
    );
}
