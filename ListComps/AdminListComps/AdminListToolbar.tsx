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
        <div className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl pb-5 pt-6 border-b border-slate-200/50 mb-6 px-2 -mx-2 sm:mx-0">
            <div className="mx-auto w-full space-y-5">
                <div className="flex items-center gap-4">
                    <div className="flex-1 relative group">
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
                            className="w-full h-12 bg-white/50 border-slate-200 group-focus-within:border-brand-green group-focus-within:ring-4 group-focus-within:ring-brand-green/5 transition-all rounded-2xl"
                        />
                    </div>

                    <div className="flex items-center gap-2.5">
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="p-3 text-slate-500 hover:text-brand-green bg-white border border-slate-200 rounded-2xl transition-all active:scale-90 shadow-sm hover:shadow-md disabled:opacity-50 group"
                        >
                            <RefreshCw size={22} strokeWidth={2.5} className={refreshing ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"} />
                        </button>

                        <button
                            onClick={() => setShowFilters((prev) => !prev)}
                            className={`p-3 rounded-2xl transition-all active:scale-90 border shadow-sm hover:shadow-md ${showFilters
                                ? 'bg-brand-green text-white border-brand-green'
                                : 'bg-white text-slate-500 border-slate-200 hover:text-brand-green'
                                }`}
                        >
                            <Filter size={22} strokeWidth={showFilters ? 3 : 2.5} />
                        </button>

                        {!IsBill && (
                            <button
                                onClick={() => setShowModal('create')}
                                className="p-3 bg-gradient-to-br from-brand-green to-[#00381b] text-white rounded-2xl shadow-lg shadow-brand-green/30 active:scale-90 transition-all border border-brand-green group"
                            >
                                <Plus size={24} strokeWidth={3} className="group-hover:rotate-90 transition-transform duration-300 text-gray-900" />
                            </button>
                        )}
                    </div>
                </div>

                {showFilters && (
                    <div className="p-1.5 bg-slate-100/50 backdrop-blur-sm rounded-[1.25rem] border border-slate-200/50 flex flex-wrap gap-1 animate-in slide-in-from-top-4 fade-in duration-300">
                        {[
                            { id: null, label: "All Items", activeClass: 'bg-white text-slate-900 shadow-sm border-slate-200' },
                            { id: 1, label: "Active", activeClass: 'bg-brand-green text-white shadow-brand-green/20' },
                            { id: 0, label: "Inactive", activeClass: 'bg-red-500 text-white shadow-red-500/20' },
                            { id: 2, label: "Sold Out", activeClass: 'bg-amber-500 text-white shadow-amber-500/20' },
                        ].map((f) => (
                            <button
                                key={String(f.id)}
                                onClick={() => setStatusFilter(f.id as any)}
                                className={`flex-1 px-4 py-2.5 rounded-[1rem] text-[11px] font-black uppercase tracking-widest transition-all duration-300 border border-transparent ${statusFilter === f.id
                                    ? `${f.activeClass} scale-[1.02] shadow-md`
                                    : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
                                    }`}
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
