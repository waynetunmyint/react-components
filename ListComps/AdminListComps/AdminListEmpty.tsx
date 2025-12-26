import React from 'react';
import { Search as SearchIcon, Plus } from 'lucide-react';

interface AdminListEmptyProps {
    emptyTitle: string;
    emptyDescription: string;
    onRefresh: () => void;
    onCreate: () => void;
}

export const AdminListEmpty: React.FC<AdminListEmptyProps> = ({
    emptyTitle,
    emptyDescription,
    onRefresh,
    onCreate
}) => {
    return (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center animate-in fade-in zoom-in-95 duration-700">
            <div className="relative mb-8">
                <div className="w-24 h-24 rounded-[2rem] bg-slate-50 flex items-center justify-center border border-white shadow-soft">
                    <SearchIcon size={36} className="text-slate-200" />
                </div>
                <div
                    style={{ backgroundColor: 'var(--theme-primary-bg)', color: 'var(--theme-primary-text)' }}
                    className="absolute -bottom-1 -right-1 w-9 h-9 rounded-xl flex items-center justify-center shadow-lg"
                >
                    <Plus size={18} strokeWidth={3} />
                </div>
            </div>

            <div className="space-y-2 mb-10 max-w-xs">
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">{emptyTitle}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{emptyDescription}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full max-w-xs">
                <button
                    onClick={onCreate}
                    style={{ backgroundColor: 'var(--theme-primary-bg)', color: 'var(--theme-primary-text)' }}
                    className="flex-1 px-6 py-3.5 rounded-2xl font-bold shadow-theme transition-all active:scale-95"
                >
                    Create New
                </button>
                <button
                    onClick={onRefresh}
                    className="flex-1 px-6 py-3.5 rounded-2xl bg-white border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 active:scale-95 transition-all"
                >
                    Refresh
                </button>
            </div>
        </div>
    );
};
