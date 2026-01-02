"use client";
import React from "react";
import {
    IonToolbar,
    IonButtons,
    IonButton,
    IonAvatar,
    IonTitle,
} from "@ionic/react";
import { Gift, MessageCircleHeart, User, Home } from "lucide-react";
import { IMAGE_URL } from "@/config";

interface Props {
    headingField?: string;
    showRightButtons?: boolean;
}

export const ChatRoomHeader: React.FC<Props> = ({
    headingField,
    showRightButtons = true,
}) => {
    return (
        <IonToolbar className="px-2">
            {/* Left: Logo */}
            <IonButtons slot="start">
                <IonButton onClick={() => (window.location.href = "/")}>
                    <IonAvatar className="w-10 h-10 flex items-center justify-center overflow-hidden border border-gray-100 shadow-sm">
                        <img
                            src={`${IMAGE_URL}/uploads/logo.png`}
                            className="w-full h-full object-contain"
                            alt="logo"
                        />
                    </IonAvatar>
                </IonButton>
            </IonButtons>

            {/* Center: Title */}
            {headingField && (
                <IonTitle className="text-center font-bold text-gray-800 tracking-tight">
                    {headingField}
                </IonTitle>
            )}

            {/* Right: Actions */}
            {showRightButtons && (
                <IonButtons slot="end">
                    <div className="flex items-center gap-2 pr-1">
                        <button
                            onClick={() => (window.location.href = "/reward")}
                            className="p-2 hover:bg-gray-50 rounded-full transition-colors text-red-500"
                            title="Rewards"
                        >
                            <Gift size={20} strokeWidth={2.2} />
                        </button>
                        <button
                            onClick={() => (window.location.href = "/chatGroup")}
                            className="p-2 hover:bg-gray-50 rounded-full transition-colors text-blue-500"
                            title="Chat Groups"
                        >
                            <MessageCircleHeart size={20} strokeWidth={2.2} />
                        </button>
                        <button
                            onClick={() => (window.location.href = "/profile")}
                            className="p-2 hover:bg-gray-50 rounded-full transition-colors text-orange-600"
                            title="Profile"
                        >
                            <User size={20} strokeWidth={2.2} />
                        </button>
                    </div>
                </IonButtons>
            )}
        </IonToolbar>
    );
};
