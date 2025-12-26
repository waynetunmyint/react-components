import React from "react";
import { ArrowLeft, User, MessageCircle, X } from "lucide-react";

interface ChatHeaderProps {
    isSupportPage: boolean;
    selectedThreadId: number | null;
    selectedThreadName?: string;
    connectionStatus: "connected" | "connecting" | "error";
    onBack: () => void;
    onClose: () => void;
}

export default function ChatHeader({
    isSupportPage,
    selectedThreadId,
    selectedThreadName,
    connectionStatus,
    onBack,
    onClose
}: ChatHeaderProps) {
    return (
        <div className="flex items-center gap-3 px-4 py-4 bg-[var(--scolor-contrast)] border-b border-white/10 backdrop-blur-md">
            {isSupportPage && selectedThreadId !== null && (
                <button
                    onClick={onBack}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-white/70 hover:text-white mr-1"
                >
                    <ArrowLeft size={18} />
                </button>
            )}
            <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 overflow-hidden shadow-lg border border-white/20 bg-white/10"
            >
                {selectedThreadId !== null ? (
                    <User className="w-5 h-5 text-white" />
                ) : (
                    <MessageCircle className="w-5 h-5 text-white" />
                )}
            </div>
            <div className="flex-1 min-w-0">
                <h3 className="font-bold text-white text-sm truncate uppercase tracking-tight">
                    {isSupportPage
                        ? (selectedThreadId !== null
                            ? (selectedThreadName || "Loading Page...")
                            : "Support Dashboard")
                        : "Support Chat"
                    }
                </h3>
                <div className="flex items-center gap-1.5">
                    <span
                        className={`w-2 h-2 rounded-full ${connectionStatus === "connected" ? "bg-[var(--scolor)]" :
                            connectionStatus === "connecting" ? "bg-yellow-500 animate-pulse" :
                                "bg-[var(--theme-accent)]"
                            }`}
                    />
                    <span className="text-[10px] text-white/60 font-medium tracking-tight">
                        {connectionStatus === "connected" ? "Live Connected" :
                            connectionStatus === "connecting" ? "Connecting..." :
                                "Connection error"}
                    </span>
                </div>
            </div>
            <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/10 text-white/70 hover:text-white transition-colors"
            >
                <X className="w-5 h-5" />
            </button>
        </div>
    );
}
