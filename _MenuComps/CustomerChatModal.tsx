"use client";
import React, { useEffect } from "react";
import { ENABLE_CUSTOMER_CHAT } from "../../../config";
import { useChatLogic } from "./CustomerChatParts/useChatLogic";
import { WifiOff, RefreshCw, AlertCircle } from "lucide-react";

// Sub-components
import ChatHeader from "./CustomerChatParts/ChatHeader";
import RegistrationForm from "./CustomerChatParts/RegistrationForm";
import StatusHeader from "./CustomerChatParts/StatusHeader";
import MessageList from "./CustomerChatParts/MessageList";
import MessageInput from "./CustomerChatParts/MessageInput";
import AdminThreadList from "./CustomerChatParts/AdminThreadList";
import QuickReplies from "./CustomerChatParts/QuickReplies";

interface CustomerChatModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function CustomerChatModal({ isOpen, onClose }: CustomerChatModalProps) {
    const chat = useChatLogic(isOpen, onClose);
    const [isMaximized, setIsMaximized] = React.useState(false); // Default to widget mode

    // Auto-maximize on mobile screens
    useEffect(() => {
        if (typeof window !== 'undefined' && window.innerWidth < 640) {
            setIsMaximized(true);
        }
    }, [isOpen]);

    if (!ENABLE_CUSTOMER_CHAT && !chat.isAdmin) return null;
    if (!isOpen) return null;

    const toggleMaximize = () => setIsMaximized(!isMaximized);

    return (
        <div
            className={`fixed z-[70] transition-all duration-500 ease-in-out bg-slate-950 shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-white/5 flex flex-col overflow-hidden animate-widgetUp
                ${isMaximized
                    ? 'inset-0 w-full h-full rounded-none'
                    : 'right-0 bottom-0 sm:right-6 sm:bottom-[100px] w-full sm:w-[420px] h-full sm:h-[650px] sm:max-h-[calc(100vh-140px)] sm:rounded-[2rem]'
                }`}
            role="dialog"
            aria-label="Customer Support Chat"
            aria-modal="true"
        >
            <ChatHeader
                isAdmin={chat.isAdmin}
                hasSelectedGuest={!!chat.adminSelectedGuest}
                onBack={() => chat.setAdminSelectedGuest(null)}
                onClose={onClose}
                isMaximized={isMaximized}
                onToggleMaximize={toggleMaximize}
            />

            {/* AI Status / Connection Banner */}
            {chat.connectionStatus === "error" && (
                <div className="px-3 py-1.5 bg-red-500/10 border-b border-red-500/20 flex items-center justify-between gap-2 overflow-hidden">
                    <div className="flex items-center gap-2 min-w-0">
                        <WifiOff size={12} className="text-red-400 shrink-0" />
                        <span className="text-[10px] text-red-400 font-medium truncate">Connection Interrupted</span>
                    </div>
                    <button onClick={() => window.location.reload()} className="px-2 py-0.5 bg-red-500/20 rounded text-[9px] text-red-300 font-black uppercase">Refresh</button>
                </div>
            )}

            <div className="flex-1 overflow-hidden flex flex-col relative">
                {/* Background Glow */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1/2 bg-blue-600/5 blur-[100px] pointer-events-none" />

                {!chat.isRegistered && !chat.isAdmin ? (
                    <RegistrationForm
                        guestName={chat.guestName} setGuestName={chat.setGuestName}
                        guestPhone={chat.guestPhone} setGuestPhone={chat.setGuestPhone}
                        guestEmail={chat.guestEmail} setGuestEmail={chat.setGuestEmail}
                        guestCompany={chat.guestCompany} setGuestCompany={chat.setGuestCompany}
                        onRegister={chat.handleRegister}
                    />
                ) : chat.isAdmin && !chat.adminSelectedGuest ? (
                    <AdminThreadList
                        threads={chat.adminThreads}
                        searchQuery={chat.searchQuery}
                        setSearchQuery={chat.setSearchQuery}
                        onSelectThread={(id, name) => chat.setAdminSelectedGuest({ id, name })}
                        onDeleteThread={chat.handleDeleteRecord}
                        isAiEnabled={chat.isAiEnabled}
                        onToggleAi={chat.handleToggleAi}
                    />
                ) : (
                    <>
                        <StatusHeader
                            isAdmin={chat.isAdmin}
                            guestName={chat.isAdmin ? (chat.adminSelectedGuest?.name || "Customer") : (chat.guestName || "Support Guest")}
                            onDeleteRecord={chat.handleDeleteRecord}
                            onEndChat={chat.handleEndChat}
                            hasSelectedGuest={!!chat.adminSelectedGuest}
                            isAiEnabled={chat.isAiEnabled}
                            onToggleAi={chat.handleToggleAi}
                        />
                        <MessageList
                            messages={chat.messages}
                            isLoading={chat.isLoading}
                            isAdmin={chat.isAdmin}
                            onDeleteMessage={chat.deleteMessage}
                            messagesEndRef={chat.messagesEndRef}
                            waitingMessages={chat.waitingMessages}
                            waitingMessageIndex={chat.waitingMessageIndex}
                            isAiThinking={chat.isAiThinking}
                        />
                        {!chat.isAdmin && (
                            <QuickReplies
                                onSelect={(text) => chat.sendMessage(text)}
                            />
                        )}
                        <MessageInput
                            inputMessage={chat.inputMessage}
                            setInputMessage={chat.setInputMessage}
                            onSendMessage={chat.sendMessage}
                            isSending={chat.isSending}
                        />
                    </>
                )}
            </div>

            <style>{`
                @keyframes widgetUp { 
                    0% { opacity: 0; transform: translateY(40px) scale(0.95); } 
                    100% { opacity: 1; transform: translateY(0) scale(1); } 
                }
                @keyframes messageIn { 
                    0% { opacity: 0; transform: translateY(10px); } 
                    100% { opacity: 1; transform: translateY(0); } 
                }
                @keyframes fadeIn { 
                    0% { opacity: 0; } 
                    100% { opacity: 1; } 
                }
                @keyframes float { 
                    0%, 100% { transform: translateY(0); } 
                    50% { transform: translateY(-5px); } 
                }
                @keyframes slideDown {
                    0% { opacity: 0; transform: translateY(-10px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                @keyframes shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
                @keyframes pulse-glow {
                    0%, 100% { opacity: 0.4; }
                    50% { opacity: 0.8; }
                }
                .animate-widgetUp { animation: widgetUp 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
                .animate-messageIn { animation: messageIn 0.3s ease-out; }
                .animate-fadeIn { animation: fadeIn 0.3s ease-out; }
                .animate-float { animation: float 3s ease-in-out infinite; }
                .animate-slideDown { animation: slideDown 0.3s ease-out; }
                .animate-shimmer { animation: shimmer 1.5s infinite linear; }
                .animate-pulse-glow { animation: pulse-glow 2s infinite ease-in-out; }
                .scrollbar-hide::-webkit-scrollbar { display: none; }
            `}</style>
        </div>
    );
}
