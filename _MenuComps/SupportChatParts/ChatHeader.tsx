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
        <div className="flex items-center gap-3 px-4 py-3 bg-[var(--theme-secondary-bg)] border-b border-[var(--theme-text-primary)]/5">
            {isSupportPage && selectedThreadId !== null && (
                <button
                    onClick={onBack}
                    className="p-1.5 rounded-lg hover:bg-[var(--theme-text-secondary)]/10 text-[var(--theme-text-muted)] mr-1"
                >
                    <ArrowLeft size={18} />
                </button>
            )}
            <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 overflow-hidden shadow-lg border border-[var(--theme-text-primary)]/10"
                style={{
                    backgroundColor: 'var(--theme-accent)',
                    background: 'linear-gradient(135deg, var(--theme-accent) 0%, var(--scolor-contrast) 100%)'
                }}
            >
                {selectedThreadId !== null ? (
                    <User className="w-5 h-5 text-[var(--theme-primary-text)]" />
                ) : (
                    <MessageCircle className="w-5 h-5 text-[var(--theme-primary-text)]" />
                )}
            </div>
            <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-[var(--theme-text-primary)] text-sm truncate">
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
                    <span className="text-[10px] text-[var(--theme-text-muted)]">
                        {connectionStatus === "connected" ? "Connected" :
                            connectionStatus === "connecting" ? "Connecting..." :
                                "Connection error"}
                    </span>
                </div>
            </div>
            <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-[var(--theme-text-secondary)]/10 transition-colors"
            >
                <X className="w-5 h-5 text-[var(--theme-text-muted)]" />
            </button>
        </div>
    );
}
