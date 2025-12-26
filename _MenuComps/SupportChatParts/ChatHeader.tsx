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
        <div className="flex items-center gap-3 px-4 py-3 bg-slate-800 border-b border-slate-700">
            {isSupportPage && selectedThreadId !== null && (
                <button
                    onClick={onBack}
                    className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-400 mr-1"
                >
                    <ArrowLeft size={18} />
                </button>
            )}
            <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 overflow-hidden shadow-lg border border-white/20"
                style={{
                    backgroundColor: 'var(--theme-primary-bg)',
                    background: 'linear-gradient(135deg, var(--theme-primary-bg) 0%, #1e40af 100%)'
                }}
            >
                {selectedThreadId !== null ? (
                    <User className="w-5 h-5 text-white" />
                ) : (
                    <MessageCircle className="w-5 h-5 text-white" />
                )}
            </div>
            <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-white text-sm truncate">
                    {isSupportPage
                        ? (selectedThreadId !== null
                            ? (selectedThreadName || "Loading Page...")
                            : "Support Dashboard")
                        : "Support Chat"
                    }
                </h3>
                <div className="flex items-center gap-1.5">
                    <span
                        className={`w-2 h-2 rounded-full ${connectionStatus === "connected" ? "bg-green-500" :
                            connectionStatus === "connecting" ? "bg-yellow-500 animate-pulse" :
                                "bg-red-500"
                            }`}
                    />
                    <span className="text-[10px] text-slate-400">
                        {connectionStatus === "connected" ? "Connected" :
                            connectionStatus === "connecting" ? "Connecting..." :
                                "Connection error"}
                    </span>
                </div>
            </div>
            <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-slate-700 transition-colors"
            >
                <X className="w-5 h-5 text-slate-400" />
            </button>
        </div>
    );
}
