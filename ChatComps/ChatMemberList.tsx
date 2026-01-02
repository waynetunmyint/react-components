"use client";
import React, { useEffect, useState, useCallback } from "react";
import { IonSpinner, IonToast, IonAvatar, IonButton, IonIcon } from "@ionic/react";
import { IMAGE_URL, BASE_URL } from "@/config";
import { Users, Shield, ShieldAlert, ShieldCheck, X } from "lucide-react";
import { GetStoredJWT, GetStoredProfile } from "../StorageComps/StorageCompOne";

interface Member {
    Id: number;
    id?: number;
    ProfileName: string;
    ProfileEmail: string;
    ProfileThumbnail: string;
    Status: string; // "1" for active, "0" for banned
    CreatedAt: string;
}

interface Props {
    chatGroupId: string;
    isOwner: boolean;
}

export const ChatMemberList: React.FC<Props> = ({ chatGroupId, isOwner }) => {
    const [members, setMembers] = useState<Member[]>([]);
    const [loading, setLoading] = useState(true);
    const [toast, setToast] = useState<{ show: boolean; message: string; color: string }>({
        show: false,
        message: "",
        color: "success",
    });

    const token = GetStoredJWT();
    const storedProfile = GetStoredProfile();

    const fetchMembers = useCallback(async () => {
        setLoading(true);
        try {
            const res = await fetch(`${BASE_URL}/chatGroupMember/api/byChatGroupId/${chatGroupId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            if (Array.isArray(data)) {
                setMembers(data);
            }
        } catch (err) {
            console.error("Failed to fetch members:", err);
            setToast({ show: true, message: "Failed to load members", color: "danger" });
        } finally {
            setLoading(false);
        }
    }, [chatGroupId, token]);

    useEffect(() => {
        fetchMembers();
    }, [fetchMembers]);

    const handleStatusUpdate = async (member: Member) => {
        if (!isOwner) return;

        const id = member.Id || member.id;
        if (!id) return;

        const currentStatus = member.Status;
        const newStatus = currentStatus === "1" ? "0" : "1";

        // Optimistic Update
        setMembers(prev => prev.map(m => (m.Id === id || m.id === id) ? { ...m, Status: newStatus } : m));

        try {
            const formData = new FormData();
            formData.append("id", id.toString());
            formData.append("status", newStatus);

            const res = await fetch(`${BASE_URL}/chatGroupMember/api`, {
                method: "PATCH",
                body: formData,
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) throw new Error("Update failed");

            setToast({
                show: true,
                message: newStatus === "1" ? "Member Activated" : "Member Banned",
                color: newStatus === "1" ? "success" : "warning",
            });
        } catch (err) {
            console.error("Error updating status:", err);
            // Revert
            setMembers(prev => prev.map(m => (m.Id === id || m.id === id) ? { ...m, Status: currentStatus } : m));
            setToast({ show: true, message: "Update failed", color: "danger" });
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 gap-3">
                <IonSpinner name="crescent" color="primary" />
                <span className="text-sm text-gray-400 font-medium">Loading members...</span>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-white/40 backdrop-blur-3xl">
            {/* Header */}
            <div className="sticky top-0 z-10 px-8 py-6 bg-white/60 backdrop-blur-2xl border-b border-white/20 flex items-center justify-between shadow-[0_4px_32px_rgba(0,0,0,0.02)]">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-500/10 rounded-[20px] shadow-sm border border-blue-500/10">
                        <Users size={22} className="text-blue-600" strokeWidth={2.5} />
                    </div>
                    <div>
                        <h2 className="text-[19px] font-black text-gray-900 tracking-tight">Circle Members</h2>
                        <div className="flex items-center gap-2 mt-0.5">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                            <span className="text-[10px] text-blue-600 font-black uppercase tracking-[0.1em]">
                                {members.length} Spirits Present
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto px-6 py-6 pb-20 space-y-3">
                {members.map((m) => {
                    const isCurrentUser = m.ProfileEmail === storedProfile?.Email;
                    const isActive = m.Status === "1";

                    return (
                        <div
                            key={m.Id || m.id || Math.random()}
                            className={`flex items-center justify-between p-4 rounded-[28px] transition-all duration-500 border ${isCurrentUser
                                ? "bg-white/80 border-blue-200/50 shadow-[0_8px_32px_rgba(59,130,246,0.06)] scale-[1.02]"
                                : "bg-white/40 border-white/50 hover:bg-white/60 hover:border-white/80"
                                }`}
                        >
                            <div className="flex items-center gap-4">
                                <div className="relative group">
                                    <div className={`p-0.5 rounded-full transition-transform duration-500 group-hover:scale-105 ${isActive ? "bg-gradient-to-tr from-green-400 to-emerald-500 shadow-lg shadow-green-500/20" : "bg-gray-200"}`}>
                                        <img
                                            src={m.ProfileThumbnail ? `${IMAGE_URL}/uploads/${m.ProfileThumbnail}` : "/assets/default-avatar.png"}
                                            alt={m.ProfileName}
                                            className={`w-12 h-12 rounded-full object-cover border-2 border-white ${isActive ? "" : "grayscale opacity-50"}`}
                                        />
                                    </div>
                                    <div className={`absolute bottom-0.5 right-0.5 w-3.5 h-3.5 border-2 border-white rounded-full shadow-sm ${isActive ? "bg-green-500" : "bg-gray-400"} `} />
                                </div>
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-2">
                                        <span className={`text-[15px] font-bold tracking-tight ${isActive ? "text-gray-900" : "text-gray-400"}`}>
                                            {m.ProfileName}
                                        </span>
                                        {isCurrentUser && (
                                            <span className="text-[9px] bg-gradient-to-tr from-blue-600 to-blue-500 text-white font-black px-2 py-0.5 rounded-lg uppercase tracking-wider shadow-lg shadow-blue-500/20">
                                                Self
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-tighter">
                                        Joined {new Date(m.CreatedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </span>
                                </div>
                            </div>

                            {isOwner && !isCurrentUser && (
                                <button
                                    onClick={() => handleStatusUpdate(m)}
                                    className={`flex items-center gap-2 px-5 py-2.5 rounded-[18px] text-[11px] font-black uppercase tracking-widest transition-all shadow-xl active:scale-[0.85] ${isActive
                                        ? "bg-red-500/10 text-red-600 border border-red-500/10 hover:bg-red-500 hover:text-white"
                                        : "bg-green-500/10 text-green-600 border border-green-500/10 hover:bg-green-500 hover:text-white"
                                        }`}
                                >
                                    {isActive ? (
                                        <>
                                            <ShieldAlert size={14} strokeWidth={2.5} /> Ban
                                        </>
                                    ) : (
                                        <>
                                            <ShieldCheck size={14} strokeWidth={2.5} /> Active
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    );
                })}
            </div>
            <IonToast
                isOpen={toast.show}
                message={toast.message}
                duration={2000}
                onDidDismiss={() => setToast({ ...toast, show: false })}
                position="top"
                color={toast.color}
            />
        </div>
    );
};
