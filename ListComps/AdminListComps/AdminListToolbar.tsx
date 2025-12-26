import React from 'react';
import { RefreshCw, Filter, Plus } from 'lucide-react';
import Search from "../../FormComps/Search";

interface AdminListToolbarProps {
    dataSource: string;
    search: string;
    refreshing: boolean;
    showFilters: boolean;
    statusFilter: number | null;
    IsBill?: boolean;
    searchInputId: string;
    setSearch: (val: string) => void;
    fetchSearchData: (val: string) => void;
    fetchData: (page: number) => void;
    handleRefresh: () => void;
    setShowFilters: (val: boolean | ((prev: boolean) => boolean)) => void;
    setStatusFilter: (val: number | null) => void;
    setShowModal: (val: 'create' | 'edit' | 'view' | null) => void;
}

export const AdminListToolbar: React.FC<AdminListToolbarProps> = ({
    dataSource,
    search,
    refreshing,
    showFilters,
    statusFilter,
    IsBill,
    searchInputId,
    setSearch,
    fetchSearchData,
    fetchData,
    handleRefresh,
    setShowFilters,
    setStatusFilter,
    setShowModal
}) => {
    return (
        <div className="sticky top-0 z-100 bg-white/80 backdrop-blur-xl pb-4 pt-4 border-b border-slate-100 mb-4 px-1">
            <div className="mx-auto w-full space-y-4">
                <div className="flex items-center gap-3">
                    <Search
                        id={searchInputId}
                        initialValue={search}
                        placeholder={`Search ${dataSource}...`}
                        onSearch={(val: string) => {
                            setSearch(val);
                            fetchSearchData(val);
                        }}
                        onClear={() => {
                            setSearch("");
                            fetchData(1);
                        }}
                        className="flex-1 h-11"
                    />

                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="p-2.5 text-slate-400 hover:text-slate-900 bg-slate-50 border border-slate-100 rounded-xl transition-all active:scale-95"
                        >
                            <RefreshCw size={20} className={refreshing ? "animate-spin" : ""} />
                        </button>

                        <button
                            onClick={() => setShowFilters((prev) => !prev)}
                            style={{
                                backgroundColor: showFilters ? 'var(--theme-primary-bg)' : 'rgb(248 250 252)',
                                color: showFilters ? 'var(--theme-primary-text)' : 'rgb(100 116 139)',
                            }}
                            className="p-2.5 rounded-xl transition-all active:scale-95 border border-slate-100"
                        >
                            <Filter size={20} strokeWidth={showFilters ? 2.5 : 2} />
                        </button>

                        {!IsBill && (
                            <button
                                onClick={() => setShowModal('create')}
                                style={{
                                    backgroundColor: 'var(--theme-primary-bg)',
                                    color: 'var(--theme-primary-text)'
                                }}
                                className="p-2.5 rounded-xl shadow-lg active:scale-95 transition-all"
                            >
                                <Plus size={22} strokeWidth={3} />
                            </button>
                        )}
                    </div>
                </div>

                {showFilters && (
                    <div className="p-2 bg-slate-50 rounded-2xl border border-slate-200/50 flex flex-wrap gap-2 animate-in slide-in-from-top-2 duration-200">
                        {[
                            { id: null, label: "All", bg: 'bg-white', text: 'text-slate-600', activeBg: 'var(--theme-secondary-bg)', activeText: 'var(--theme-secondary-text)' },
                            { id: 1, label: "Active", bg: 'bg-white', text: 'text-slate-600', activeBg: 'var(--theme-primary-bg)', activeText: 'var(--theme-primary-text)' },
                            { id: 0, label: "Inactive", bg: 'bg-white', text: 'text-slate-600', activeBg: '#ef4444', activeText: '#ffffff' },
                            { id: 2, label: "Sold Out", bg: 'bg-white', text: 'text-slate-600', activeBg: '#f59e0b', activeText: '#ffffff' },
                        ].map((f) => (
                            <button
                                key={String(f.id)}
                                onClick={() => setStatusFilter(f.id as any)}
                                style={{
                                    backgroundColor: statusFilter === f.id ? f.activeBg : 'transparent',
                                    color: statusFilter === f.id ? f.activeText : 'var(--theme-text-secondary)',
                                }}
                                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 ${statusFilter !== f.id && 'hover:bg-white'} border border-transparent`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
