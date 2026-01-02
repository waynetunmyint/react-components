import React from "react";
import { X } from "lucide-react";

interface Props {
    isOpen: boolean;
    step: number;
    onClose: () => void;
    children: React.ReactNode;
}

export const TopUpModal: React.FC<Props> = ({ isOpen, step, onClose, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
            <div className="bg-[#121417] border border-white/10 w-full max-w-sm rounded-[40px] overflow-hidden shadow-2xl relative">
                {/* Header */}
                <div className="p-8 pb-0 flex justify-between items-center">
                    <div>
                        <h3 className="text-2xl font-black text-white tracking-tight">KPay Top Up</h3>
                        <p className="text-[10px] text-white/30 uppercase font-black tracking-[0.2em]">Step {step <= 4 ? step : 4} of 4</p>
                    </div>
                    <button onClick={onClose} className="p-2.5 bg-white/5 hover:bg-white/10 rounded-full text-white/20 hover:text-white transition-all">
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8">
                    {children}
                </div>
            </div>

            <style>{`
                @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
                @keyframes slide-up { from { opacity: 0; transform: translateY(30px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
                .animate-fade-in { animation: fade-in 0.4s ease-out forwards; }
                .animate-slide-up { animation: slide-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
            `}</style>
        </div>
    );
};
