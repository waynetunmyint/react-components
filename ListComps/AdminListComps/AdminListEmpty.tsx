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
        <div className="flex flex-col items-center justify-center py-20 px-8 text-center animate-in fade-in zoom-in-95 duration-1000">
            <div className="relative mb-10 group">
                {/* Floating animated background elements */}
                <div className="absolute inset-0 bg-brand-gold/10 rounded-full blur-3xl group-hover:bg-brand-gold/20 transition-all duration-700 -z-10" />

                <div className="w-28 h-28 rounded-[2.5rem] bg-white flex items-center justify-center border border-slate-100 shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-700">
                    <SearchIcon size={40} className="text-slate-200 group-hover:text-brand-gold/40 transition-colors" />
                </div>

                <div
                    className="absolute -bottom-2 -right-2 w-11 h-11 bg-gradient-to-br from-brand-gold to-brand-green text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:-rotate-12 transition-all duration-700"
                >
                    <Plus size={22} strokeWidth={3} />
                </div>
            </div>

            <div className="space-y-3 mb-10 max-w-sm">
                <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none uppercase">{emptyTitle}</h3>
                <p className="text-base text-slate-500 font-medium leading-relaxed">{emptyDescription}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
                <button
                    onClick={onCreate}
                    className="flex-[1.5] px-8 py-4 bg-brand-gold text-slate-900 rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-xl shadow-brand-gold/20 hover:shadow-2xl hover:brightness-110 transition-all active:scale-95"
                >
                    Get Started
                </button>
                <button
                    onClick={onRefresh}
                    className="flex-1 px-8 py-4 bg-white border border-slate-200 text-slate-600 font-bold rounded-2xl hover:bg-slate-50 hover:text-brand-green active:scale-95 transition-all shadow-sm"
                >
                    Try Again
                </button>
            </div>
        </div>
    );
};
