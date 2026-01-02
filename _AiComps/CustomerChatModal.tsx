"use client";
import React, { useEffect } from "react";
import { ENABLE_CUSTOMER_CHAT } from "@/config";
import { useChatLogic } from "./CustomerChatParts/useChatLogic";
import { WifiOff, AlertCircle } from "lucide-react";

// Sub-components
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
    const [showExitConfirm, setShowExitConfirm] = React.useState(false);

    // Close on Escape key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!ENABLE_CUSTOMER_CHAT && !chat.isAdmin) return null;
    if (!isOpen) return null;

    const toggleMaximize = () => setIsMaximized(!isMaximized);

    return (
        <>
            {/* Backdrop for closing */}
            <div
                className={`fixed inset-0 z-[65] transition-opacity duration-500 bg-black/40 backdrop-blur-[2px] ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={onClose}
            />

            <div
                className={`fixed z-[100] transition-all duration-500 ease-in-out bg-[var(--bg2)] shadow-2xl border border-[var(--bg3)] flex flex-col overflow-hidden animate-widgetUp
                    ${isMaximized
                        ? 'inset-0 w-full h-full rounded-none'
                        : 'right-0 bottom-0 sm:right-8 sm:bottom-[100px] w-full sm:w-[420px] h-full sm:h-[680px] sm:max-h-[calc(100vh-140px)] sm:rounded-[2rem]'
                    }`}
                role="dialog"
                aria-label="Customer Support Chat"
                aria-modal="true"
            >

                {/* AI Status / Connection Banner */}
                {chat.connectionStatus === "error" && (
                    <div className="px-3 py-2 bg-[var(--r2)] text-white flex items-center justify-between gap-2 overflow-hidden z-30 relative shadow-sm">
                        <div className="flex items-center gap-2 min-w-0">
                            <WifiOff size={14} className="shrink-0 animate-pulse" />
                            <span className="text-[11px] font-bold uppercase tracking-tight truncate">Connection Interrupted</span>
                        </div>
                        <button onClick={() => window.location.reload()} className="px-3 py-1 bg-white/20 hover:bg-white/30 transition-colors rounded-full text-[10px] font-black uppercase tracking-wider backdrop-blur-sm">Refresh</button>
                    </div>
                )}

                {/* Content Area */}
                <div className="flex-1 overflow-hidden flex flex-col relative z-20">
                    {/* Decorative Background Elements */}
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none opacity-50 z-0">
                        <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-gradient-to-br from-[var(--a1)]/5 to-[var(--a2)]/5 rounded-full blur-3xl animate-pulse"></div>
                        <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-gradient-to-tr from-[var(--a3)]/5 to-[var(--a2)]/5 rounded-full blur-3xl animate-pulse delay-700"></div>
                    </div>

                    <div className="flex-1 flex flex-col relative z-10 overflow-hidden">
                        {!chat.isRegistered && !chat.isAdmin ? (
                            <RegistrationForm
                                guestName={chat.guestName} setGuestName={chat.setGuestName}
                                guestPhone={chat.guestPhone} setGuestPhone={chat.setGuestPhone}
                                guestEmail={chat.guestEmail} setGuestEmail={chat.setGuestEmail}
                                guestCompany={chat.guestCompany} setGuestCompany={chat.setGuestCompany}
                                onRegister={chat.handleRegister}
                                onClose={onClose}
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
                                    onEndChat={() => setShowExitConfirm(true)}
                                    hasSelectedGuest={!!chat.adminSelectedGuest}
                                    isAiEnabled={chat.isAiEnabled}
                                    onToggleAi={chat.handleToggleAi}
                                    isMaximized={isMaximized}
                                    onToggleMaximize={toggleMaximize}
                                />
                                <div className="flex-1 overflow-hidden flex flex-col">
                                    <MessageList
                                        messages={chat.messages}
                                        isLoading={chat.isLoading}
                                        isAdmin={chat.isAdmin}
                                        onDeleteMessage={chat.deleteMessage}
                                        onFeedback={chat.handleFeedback}
                                        messagesEndRef={chat.messagesEndRef}
                                        waitingMessages={chat.waitingMessages}
                                        waitingMessageIndex={chat.waitingMessageIndex}
                                        isAiThinking={chat.isAiThinking}
                                    />
                                </div>
                                {!chat.isAdmin && (
                                    <QuickReplies
                                        onSelect={(text) => chat.sendMessage(text)}
                                    />
                                )}
                                <div className="bg-[var(--bg1)] border-t border-[var(--bg3)] z-50">
                                    <MessageInput
                                        inputMessage={chat.inputMessage}
                                        setInputMessage={chat.setInputMessage}
                                        onSendMessage={chat.sendMessage}
                                        isSending={chat.isSending}
                                    />
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Exit Confirmation Modal */}
                {showExitConfirm && (
                    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn">
                        <div className="bg-[var(--bg1)] w-full max-w-[280px] rounded-[1.5rem] p-6 shadow-2xl border border-[var(--bg3)] transform scale-100 animate-messageIn">
                            <div className="flex flex-col items-center text-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-[var(--r1)] flex items-center justify-center mb-1">
                                    <AlertCircle size={24} className="text-[var(--r2)]" />
                                </div>
                                <div>
                                    <h3 className="text-[var(--t3)] font-black text-lg">End Session?</h3>
                                    <p className="text-[var(--t2)] text-xs mt-1 leading-relaxed">
                                        This will clear your chat history. Are you sure you want to exit?
                                    </p>
                                </div>
                                <div className="flex items-center gap-3 w-full mt-2">
                                    <button
                                        onClick={() => setShowExitConfirm(false)}
                                        className="flex-1 py-3 rounded-xl bg-[var(--bg2)] text-[var(--t3)] text-xs font-bold hover:bg-[var(--bg3)] transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={() => {
                                            chat.handleEndChat();
                                            setShowExitConfirm(false);
                                        }}
                                        className="flex-1 py-3 rounded-xl bg-[var(--t3)] text-[var(--t1)] text-xs font-bold hover:bg-[var(--a3)] transition-colors shadow-lg"
                                    >
                                        End Chat
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <style>{`
                @keyframes widgetUp { 
                    0% { opacity: 0; transform: translateY(60px) scale(0.95); filter: blur(5px); } 
                    100% { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); } 
                }
                @keyframes messageIn { 
                    0% { opacity: 0; transform: translateY(20px) scale(0.95); } 
                    100% { opacity: 1; transform: translateY(0) scale(1); } 
                }
                @keyframes fadeIn { 
                    0% { opacity: 0; } 
                    100% { opacity: 1; } 
                }
                @keyframes float { 
                    0%, 100% { transform: translateY(0); } 
                    50% { transform: translateY(-8px); } 
                }
                @keyframes slideDown {
                    0% { opacity: 0; transform: translateY(-20px); }
                    100% { opacity: 1; transform: translateY(0); }
                }
                @keyframes shimmer {
                    0% { background-position: -200% 0; }
                    100% { background-position: 200% 0; }
                }
                @keyframes pulse-glow {
                    0%, 100% { opacity: 0.3; transform: translate(-50%, 0) scale(1); }
                    50% { opacity: 0.6; transform: translate(-50%, -10%) scale(1.1); }
                }
                .animate-widgetUp { animation: widgetUp 0.5s cubic-bezier(0.16, 1, 0.3, 1); }
                .animate-messageIn { animation: messageIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) both; }
                .animate-fadeIn { animation: fadeIn 0.4s ease-out; }
                .animate-float { animation: float 4s ease-in-out infinite; }
                .animate-slideDown { animation: slideDown 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
                .animate-shimmer { animation: shimmer 2s infinite linear; }
                .animate-pulse-glow { animation: pulse-glow 4s infinite ease-in-out; }
                
                .scrollbar-hide::-webkit-scrollbar { display: none; }
                
                /* Custom ultra-thin scrollbar for other areas if needed */
                .custom-scrollbar::-webkit-scrollbar {
                    width: 3px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: var(--a2);
                    border-radius: 10px;
                }
            `}</style>
            </div>
        </>
    );
}
