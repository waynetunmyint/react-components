import React from "react";
import { Wallet } from "lucide-react";

interface Props {
    onClick: () => void;
}

export const TopUpTrigger: React.FC<Props> = ({ onClick }) => {
    return (
        <button
            onClick={onClick}
            className="fixed right-6 bottom-[160px] z-[55] w-12 h-12 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 shadow-xl border border-white/20 flex items-center justify-center hover:scale-110 active:scale-95 transition-all text-white group"
        >
            <Wallet size={24} className="group-hover:rotate-12 transition-transform" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full border-2 border-emerald-600 text-[8px] font-bold text-emerald-900 flex items-center justify-center animate-pulse">
                +
            </div>
        </button>
    );
};
