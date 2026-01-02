"use client";
import React, { useState, memo } from "react";
import { Trash2, Reply, MoreVertical, X } from "lucide-react";
import { BASE_URL, IMAGE_URL } from "@/config";
import { GetStoredJWT } from "../StorageComps/StorageCompOne";

interface Message {
    Id: string | number;
    ProfileEmail: string;
    ProfileName: string;
    ProfileThumbnail: string;
    Message: string;
    Thumbnail?: string;
    CreatedAt: string;
    MessageToReply?: string;
    ChatGroupMemberStatus?: string;
}

interface Props {
    messages: Message[];
    currentUserEmail: string;
    isOwner: boolean;
    onDeleteMessage: (id: string | number) => void;
}

const MessageBubble = memo(({
    msg,
    isMine,
    canDelete,
    showSenderInfo,
    isGroupStart,
    isGroupEnd,
    onDelete,
    onReply
}: {
    msg: Message,
    isMine: boolean,
    canDelete: boolean,
    showSenderInfo: boolean,
    isGroupStart: boolean,
    isGroupEnd: boolean,
    onDelete: (id: string | number) => void,
    onReply: (m: Message) => void
}) => {
    const [viewImage, setViewImage] = useState<string | null>(null);

    const bubbleRadius = isMine
        ? `${isGroupStart ? '24px' : '8px'} 24px ${isGroupEnd ? '24px' : '8px'} ${isGroupEnd ? '24px' : '8px'}`
        : `24px ${isGroupStart ? '24px' : '8px'} ${isGroupEnd ? '24px' : '8px'} ${isGroupEnd ? '24px' : '8px'}`;


    return (
        <div className={`flex flex-col ${isGroupStart ? 'mt-6' : 'mt-1'} ${isMine ? "items-end" : "items-start"} w-full select-text`}>
            {showSenderInfo && !isMine && (
                <div className="flex items-center gap-3 mb-2 px-2 group cursor-pointer animate-in fade-in slide-in-from-left-4 duration-700 select-none">

                    <div className="relative">
                        <img
                            src={`${IMAGE_URL}/uploads/${msg.ProfileThumbnail}`}
                            className="w-8 h-8 rounded-full object-cover shadow-lg border-2 border-white ring-4 ring-blue-500/5 group-hover:ring-blue-500/20 transition-all"
                            alt=""
                        />
                        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full shadow-[0_0_8px_rgba(34,197,94,0.5)]" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[12px] font-black text-gray-900 tracking-tight group-hover:text-blue-600 transition-colors uppercase">
                            {msg.ProfileName}
                        </span>
                    </div>
                </div>
            )}

            <div className={`flex items-center gap-3 group max-w-[85%] ${isMine ? "flex-row-reverse" : ""}`}>
                <div
                    style={{ borderRadius: bubbleRadius }}
                    className={`relative px-5 py-3.5 transition-all duration-500 shadow-[0_2px_12px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.08)] animate-in ${isMine ? 'slide-in-from-right-4' : 'slide-in-from-left-4'} ${isMine
                        ? "bg-blue-600 text-white border border-blue-700"
                        : "bg-white border border-gray-100 text-gray-900"
                        }`}
                >
                    {msg.MessageToReply && (
                        <div className={`text-[11px] border-l-3 pl-3 py-1.5 mb-3 opacity-90 italic bg-black/5 rounded-r-lg font-medium leading-normal ${isMine ? "border-white" : "border-blue-500"}`}>
                            {msg.MessageToReply}
                        </div>
                    )}

                    {msg.Message && <p className="text-[16px] leading-[1.6] font-medium tracking-normal select-text whitespace-pre-wrap break-words">{msg.Message}</p>}

                    {msg.Thumbnail && msg.Thumbnail !== "logo.png" && (
                        <div className="mt-3 relative overflow-hidden rounded-[18px] shadow-sm border border-gray-100 select-none">
                            <img
                                src={`${IMAGE_URL}/uploads/${msg.Thumbnail}`}
                                className="w-full max-h-[300px] object-cover cursor-pointer hover:scale-105 transition-transform duration-700"
                                alt=""
                                onClick={() => setViewImage(`${IMAGE_URL}/uploads/${msg.Thumbnail}`)}
                            />
                        </div>
                    )}

                    <div className={`flex items-center gap-2 mt-2 opacity-50 select-none ${isMine ? "justify-end" : "justify-start"}`}>
                        <span className="text-[10px] font-bold uppercase tracking-wider">
                            {new Date(msg.CreatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    </div>
                </div>

                <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0 select-none">
                    <button
                        onClick={() => onReply(msg)}
                        className="p-2.5 bg-white shadow-lg border border-gray-100 rounded-2xl text-gray-500 hover:text-blue-600 hover:scale-110 active:scale-90 transition-all"
                    >
                        <Reply size={16} strokeWidth={2.5} />
                    </button>
                    {canDelete && (
                        <button
                            onClick={() => onDelete(msg.Id)}
                            className="p-2.5 bg-white shadow-lg border border-gray-100 rounded-2xl text-gray-500 hover:text-red-600 hover:scale-110 active:scale-90 transition-all"
                        >
                            <Trash2 size={16} strokeWidth={2.5} />
                        </button>
                    )}
                </div>
            </div>

            {viewImage && (
                <div
                    className="fixed inset-0 z-[1000] bg-black/98 backdrop-blur-3xl flex items-center justify-center p-6 animate-in fade-in duration-500 select-none"
                    onClick={() => setViewImage(null)}
                >
                    <button className="absolute top-10 right-10 text-white/50 bg-white/5 p-4 rounded-full hover:bg-white/10 hover:text-white transition-all">
                        <X size={32} />
                    </button>
                    <img src={viewImage} className="max-w-full max-h-full object-contain shadow-2xl animate-in zoom-in-95 duration-500" alt="View" />
                </div>
            )}
        </div>
    );
});

export const ChatList: React.FC<Props> = ({ messages, currentUserEmail, isOwner, onDeleteMessage }) => {
    const handleReply = (m: Message) => {
        window.dispatchEvent(new CustomEvent("set-reply-message", { detail: m }));
    };

    return (
        <div className="flex flex-col px-4 pt-4 pb-24">
            {messages.map((m, idx) => {
                const prev = messages[idx - 1];
                const next = messages[idx + 1];
                const isMine = m.ProfileEmail === currentUserEmail;

                const isGroupStart = !prev || prev.ProfileEmail !== m.ProfileEmail;
                const isGroupEnd = !next || next.ProfileEmail !== m.ProfileEmail;
                const showSenderInfo = isGroupStart;

                return (
                    <MessageBubble
                        key={m.Id}
                        msg={m}
                        isMine={isMine}
                        canDelete={isOwner || isMine}
                        showSenderInfo={showSenderInfo}
                        isGroupStart={isGroupStart}
                        isGroupEnd={isGroupEnd}
                        onDelete={onDeleteMessage}
                        onReply={handleReply}
                    />
                );
            })}
        </div>
    );
};
