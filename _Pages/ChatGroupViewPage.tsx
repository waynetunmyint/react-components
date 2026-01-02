"use client";
import React from "react";
import { useParams } from "react-router-dom";
import { IonPage } from "@ionic/react";
import { ChatRoom } from "../ChatComps/ChatRoom";

const ChatGroupViewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <IonPage>
      <ChatRoom chatGroupId={id!} />
    </IonPage>
  );
};

export default ChatGroupViewPage;
