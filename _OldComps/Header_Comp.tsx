"use client";
import React, { useRef } from "react";
import {
  IonToolbar,
  IonButtons,
  IonButton,
  IonAvatar,
  IonTitle,
} from "@ionic/react";
import { Gift,  MessageCircleHeart, User } from "lucide-react";
import { IMAGE_URL, LOGO_NAME } from "../../config";

interface Props {
  headingField?: string;
  showRightButtons?: boolean; // control visibility
}

export default function HeaderComp({
  headingField,
  showRightButtons = true,
}: Props) {
  const menuButtonRef = useRef<HTMLIonButtonElement>(null);

  const handleLogoClick = () => {
    menuButtonRef.current?.click();
  };

  return (
    <IonToolbar className="flex justify-between px-2">

      {/* Left */}
      <IonButtons slot="start">
        <IonButton onClick={handleLogoClick}>
          <IonAvatar className="w-12 h-12 flex items-center justify-center overflow-hidden">
            <img
              src={`${IMAGE_URL}/uploads/${LOGO_NAME}.png`}
              className="w-full h-full object-contain"
              onClick={() => (window.location.href = "/")}
              alt="logo"
            />
          </IonAvatar>
        </IonButton>
      </IonButtons>

      {/* Center */}
      {headingField && (
        <IonTitle className="text-center text-lg font-semibold line-clamp-1">
          {headingField}
        </IonTitle>
      )}

      {/* Right */}
      {showRightButtons && (
        <IonButtons slot="end">
          <div className="flex items-center ml-2">
            <Gift
              className="m-2 cursor-pointer transition-transform transform hover:scale-110 text-red-500"
              size={20}
              onClick={() => (window.location.href = "/reward")}
            />
            <MessageCircleHeart
              className="m-2 cursor-pointer transition-transform transform hover:scale-110 text-yellow-500"
              size={20}
              onClick={() => (window.location.href = "/chatGroup")}
            />
            <User
              className="m-2 cursor-pointer transition-transform transform hover:scale-110 text-orange-800"
              size={20}
              onClick={() => (window.location.href = "/profile")}
            />
          </div>
        </IonButtons>
      )}
    </IonToolbar>
  );
}
