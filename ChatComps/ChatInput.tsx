"use client";
import React, { useState, useRef, useEffect } from "react";
import { Loader, X, Image as ImageIcon, Send, Paperclip, Smile } from "lucide-react";
import { IMAGE_URL, BASE_URL, APP_NAME } from "@/config";
import { GetChatGroupMemberInfo, GetStoredJWT, GetStoredProfile } from "../StorageComps/StorageCompOne";

interface Props {
    chatGroupId: string;
    onMessageSent: () => void;
}

export const ChatInput: React.FC<Props> = ({ chatGroupId, onMessageSent }) => {
    const [message, setMessage] = useState("");
    const [imagePreview, setImagePreview] = useState("");
    const [saving, setSaving] = useState(false);
    const [chatMember, setChatMember] = useState<any>(null);
    const [messageToReply, setMessageToReply] = useState<string>("");
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const storedProfile = GetStoredProfile();
    const token = GetStoredJWT();

    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const emojiPickerRef = useRef<HTMLDivElement>(null);

    // Resize Textarea
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = "auto";
            textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
        }
    }, [message]);

    // Reply Logic
    useEffect(() => {
        const handleReplyEvent = (e: any) => {
            const item = e.detail;
            if (item?.Message) {
                const short = item.Message.length > 50 ? item.Message.slice(0, 50) + "..." : item.Message;
                setMessageToReply(`"@${item.ProfileName}:${short}"`);
            }
        };

        window.addEventListener("set-reply-message", handleReplyEvent);
        return () => window.removeEventListener("set-reply-message", handleReplyEvent);
    }, []);

    // Member Info
    useEffect(() => {
        GetChatGroupMemberInfo(chatGroupId).then(setChatMember).catch(console.error);
    }, [chatGroupId]);

    // Close emoji picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
                setShowEmojiPicker(false);
            }
        };

        if (showEmojiPicker) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showEmojiPicker]);

    const handleSend = async () => {
        if (saving || (!message.trim() && !imagePreview)) return;

        setSaving(true);
        const sentMsg = message;
        const sentImg = imagePreview;

        setMessage("");
        setImagePreview("");
        setMessageToReply("");

        try {
            const formData = new FormData();
            formData.append("chatGroupId", chatGroupId);
            formData.append("senderEmail", storedProfile?.Email || "");
            formData.append("appName", APP_NAME);
            formData.append("message", sentMsg.trim());
            formData.append("messageToReply", messageToReply);
            if (sentImg) formData.append("thumbnail", sentImg);

            const res = await fetch(`${BASE_URL}/chatGroupChat/api`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
                body: formData,
            });

            if (!res.ok) throw new Error("Failed to send");
            onMessageSent();
        } catch (err) {
            console.error(err);
            setMessage(sentMsg);
            setImagePreview(sentImg);
        } finally {
            setSaving(false);
        }
    };

    const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
            const img = new Image();
            img.src = ev.target?.result as string;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const scale = 800 / img.width;
                canvas.width = 800;
                canvas.height = img.height * scale;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
                setImagePreview(canvas.toDataURL('image/jpeg', 0.8));
            };
        };
        reader.readAsDataURL(file);
    };

    const isDisabled = chatMember?.Status === "0";

    const emojis = [
        '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃', '😉', '😊',
        '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙', '😋', '😛', '😜', '🤪',
        '😝', '🤑', '🤗', '🤭', '🤫', '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏',
        '😒', '🙄', '😬', '🤥', '😌', '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕',
        '🤢', '🤮', '🤧', '🥵', '🥶', '😶‍🌫️', '🥴', '😵', '🤯', '🤠', '🥳', '😎',
        '🤓', '🧐', '😕', '😟', '🙁', '☹️', '😮', '😯', '😲', '😳', '🥺', '😦',
        '😧', '😨', '😰', '😥', '😢', '😭', '😱', '😖', '😣', '😞', '😓', '😩',
        '😫', '🥱', '😤', '😡', '😠', '🤬', '👍', '👎', '👌', '✌️', '🤞', '🤟',
        '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '👏', '🙌', '👐', '🤲', '🤝',
        '🙏', '✍️', '💪', '🦾', '🦿', '🦵', '🦶', '👂', '🦻', '👃', '🧠', '🦷',
        '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕',
        '💞', '💓', '💗', '💖', '💘', '💝', '💟', '☮️', '✝️', '☪️', '🕉️', '☸️',
        '✡️', '🔯', '🕎', '☯️', '☦️', '🛐', '⛎', '♈', '♉', '♊', '♋', '♌',
        '🔥', '💧', '🌊', '🎉', '🎊', '🎈', '🎁', '🏆', '🥇', '🥈', '🥉', '⚽',
        '🏀', '🏈', '⚾', '🥎', '🎾', '🏐', '🏉', '🥏', '🎱', '🪀', '🏓', '🏸'
    ];

    const insertEmoji = (emoji: string) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newMessage = message.substring(0, start) + emoji + message.substring(end);

        setMessage(newMessage);
        setShowEmojiPicker(false);

        // Set cursor position after emoji
        setTimeout(() => {
            textarea.focus();
            const newPosition = start + emoji.length;
            textarea.setSelectionRange(newPosition, newPosition);
        }, 0);
    };

    return (
        <div className="relative flex flex-col w-full py-4 px-4 safe-bottom bg-white">
            {/* Context Layers (Reply/Image) */}
            <div className="flex flex-col gap-2 mb-2">
                {messageToReply && (
                    <div className="flex items-center gap-3 bg-gray-50 px-4 py-2.5 rounded-2xl border border-gray-100 animate-in slide-in-from-bottom-2">
                        <div className="w-1 h-6 bg-blue-500/80 rounded-full" />
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Replying to</p>
                            <p className="text-xs text-gray-600 truncate">{messageToReply}</p>
                        </div>
                        <button onClick={() => setMessageToReply("")} className="p-1 hover:bg-gray-200 rounded-full transition-colors text-gray-400">
                            <X size={14} />
                        </button>
                    </div>
                )}

                {imagePreview && (
                    <div className="relative inline-block self-start p-1 bg-gray-50 rounded-2xl border border-gray-100 animate-in zoom-in-95">
                        <img src={imagePreview} className="w-20 h-20 object-cover rounded-xl shadow-sm" alt="preview" />
                        <button
                            onClick={() => setImagePreview("")}
                            className="absolute -top-2 -right-2 bg-gray-800 text-white rounded-full p-1.5 shadow-lg hover:bg-black transition-colors"
                        >
                            <X size={12} strokeWidth={3} />
                        </button>
                    </div>
                )}
            </div>

            <div className="flex items-end gap-2">
                {/* Input Container */}
                <div className="flex-1 flex items-end bg-gray-50/80 rounded-[28px] border border-gray-100 p-1.5 transition-all focus-within:bg-white focus-within:border-blue-100 focus-within:shadow-sm">
                    {/* Left Icon: Paperclip */}
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={saving || isDisabled}
                        className="p-2.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50/50 rounded-full transition-all disabled:opacity-30"
                    >
                        <Paperclip size={20} strokeWidth={2} />
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />

                    {/* Textarea */}
                    <textarea
                        ref={textareaRef}
                        rows={1}
                        placeholder={isDisabled ? "Chat muted" : "Message..."}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        disabled={saving || isDisabled}
                        className={`flex-1 bg-transparent border-none py-2 px-1 text-[16px] text-gray-800 focus:outline-none focus:ring-0 resize-none max-h-32 placeholder:text-gray-400 font-normal leading-relaxed ${isDisabled ? "cursor-not-allowed italic" : "cursor-text"}`}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSend();
                            }
                        }}
                    />

                    {/* Emoji Trigger */}
                    {!isDisabled && (
                        <div className="relative" ref={emojiPickerRef}>
                            <button
                                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                className="p-2.5 text-gray-400 hover:text-blue-500 hover:bg-blue-50/50 rounded-full transition-all"
                            >
                                <Smile size={20} strokeWidth={2} />
                            </button>

                            {showEmojiPicker && (
                                <div className="absolute bottom-full right-0 mb-4 bg-white rounded-3xl shadow-2xl border border-gray-100 p-4 w-[320px] max-h-[320px] overflow-y-auto z-50 animate-in slide-in-from-bottom-2">
                                    <div className="grid grid-cols-7 gap-1">
                                        {emojis.map((emoji, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => insertEmoji(emoji)}
                                                className="text-2xl p-2 hover:bg-gray-50 rounded-xl transition-all active:scale-90"
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Send Button */}
                <button
                    onClick={handleSend}
                    disabled={saving || isDisabled || (!message.trim() && !imagePreview)}
                    className={`h-[52px] w-[52px] rounded-full transition-all flex items-center justify-center shrink-0 shadow-sm ${(message.trim() || imagePreview) && !saving
                        ? "bg-blue-500 text-white hover:bg-blue-600 active:scale-95"
                        : "bg-gray-100 text-gray-300"
                        }`}
                >
                    {saving ? (
                        <Loader className="animate-spin" size={20} strokeWidth={2.5} />
                    ) : (
                        <Send size={20} className={(message.trim() || imagePreview) ? "ml-0.5" : ""} strokeWidth={2.5} />
                    )}
                </button>
            </div>
        </div>
    );
};
