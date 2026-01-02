"use client";
import { IonPage, IonHeader, IonToolbar } from "@ionic/react";
import { useParams } from "react-router";
import { useEffect, useState } from "react";
import { GetChatGroupInfo } from "../../StorageComps/StorageCompOne";


export default function Page() {
  const { id } = useParams<{ id: string }>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [chatGroupData, setChatGroupData] = useState<any>(null);

  useEffect(() => {
    getChatGroupData();
  }, [id]);

  const getChatGroupData = async () => {
    const chatGroup = await GetChatGroupInfo(id);
    setChatGroupData(chatGroup);
  }


  return (
    <IonPage>
      <IonHeader className="backdrop-blur-md bg-white/80 border-b">
        <IonToolbar >
          {/* ChatGroupViewHeaderComp removed */}
        </IonToolbar>
      </IonHeader>
      {/* ChatListAndInputComp removed */}
    </IonPage>
  );
}
