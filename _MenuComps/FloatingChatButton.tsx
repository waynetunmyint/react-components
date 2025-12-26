import React, { useState, useEffect } from "react";
import { MessageCircle, X } from "lucide-react";
import CustomerChatModal from "./CustomerChatModal";

const FloatingChatButton: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const [showTeaser, setShowTeaser] = useState(false);

    useEffect(() => {
        const checkVisibility = () => {
            const path = window.location.pathname;
            const isExcluded = path.startsWith('/admin') || path === '/login' || path === '/register';
            setIsVisible(!isExcluded);
        };

        checkVisibility();
        const interval = setInterval(checkVisibility, 500);

        // Show teaser after a delay
        const teaserDelay = setTimeout(() => setShowTeaser(true), 3000);

        return () => {
            clearInterval(interval);
            clearTimeout(teaserDelay);
        };
    }, []);

    if (!isVisible) return null;

    return (
        <>
            <div className="fixed right-6 bottom-[74px] z-[60] flex flex-col items-end gap-3 pointer-events-none">
                {/* Teaser Bubble */}
                {showTeaser && !isOpen && (
                    <div className="bg-white text-slate-900 px-4 py-3 rounded-2xl shadow-2xl border border-slate-100 mb-2 animate-bounceIn pointer-events-auto relative mr-2 max-w-[200px]">
                        <p className="text-xs font-semibold leading-snug">👋 How can we help you today?</p>
                        <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-white border-r border-b border-slate-100 rotate-45" />
                        <button
                            onClick={(e) => { e.stopPropagation(); setShowTeaser(false); }}
                            className="absolute -top-1 -right-1 w-4 h-4 bg-slate-200 rounded-full flex items-center justify-center text-[10px] hover:bg-slate-300 transition-colors"
                        >
                            <X size={10} />
                        </button>
                    </div>
                )}

                {/* Main Button */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="w-14 h-14 bg-[#004D25] rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all group overflow-hidden pointer-events-auto"
                >
                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {isOpen ? (
                        <X className="w-7 h-7 text-white" />
                    ) : (
                        <MessageCircle className="w-7 h-7 text-white" />
                    )}

                    {/* Notification Badge */}
                    {!isOpen && (
                        <div className="absolute top-3 right-3 w-3 h-3 bg-red-500 rounded-full border-2 border-[#004D25] animate-pulse" />
                    )}
                </button>
            </div>

            <CustomerChatModal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
            />

            <style>{`
                @keyframes bounceIn {
                    0% { opacity: 0; transform: scale(0.3) translateY(20px); }
                    50% { opacity: 1; transform: scale(1.05) translateY(-5px); }
                    70% { transform: scale(0.9) translateY(2px); }
                    100% { transform: scale(1) translateY(0); }
                }
                .animate-bounceIn {
                    animation: bounceIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                }
            `}</style>
        </>
    );
};

export default FloatingChatButton;
