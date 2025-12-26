"use client";
import { IonPage, IonHeader, IonToolbar } from "@ionic/react";
import { useParams } from "react-router";
import ChatGroupViewHeaderComp from "../_components/Chat_GroupViewHeaderComp";
import ChatListAndInputComp from "../_components/Chat_ListAndInputComp";
import { useEffect, useState } from "react";
import { StoredChatGroupInfo } from "../_components/Stored_InformationComp";


export default function Page() {
  const { id } = useParams<{ id: string }>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
 const [chatGroupData, setChatGroupData] = useState<any>(null);

    useEffect(() => { 
      getChatGroupData();
     },[id]);

     const getChatGroupData =async ()=>{
      const chatGroup = await StoredChatGroupInfo(id);
      setChatGroupData(chatGroup);
     }


  return (
    <IonPage>
      <IonHeader className="backdrop-blur-md bg-white/80 border-b">
        <IonToolbar >
          <ChatGroupViewHeaderComp chatGroupId={id!} />
        </IonToolbar>
      </IonHeader>
      <ChatListAndInputComp chatGroupId={id!} chatGroupData={chatGroupData}/>
    </IonPage>
  );
}
