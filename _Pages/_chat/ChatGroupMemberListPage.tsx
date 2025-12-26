

import { useParams } from 'react-router';
import AboutDeveloperComp from '../_appComponents/AboutDeveloperComp';
import ChatGroupViewHeaderComp from '../_components/Chat_GroupViewHeaderComp';
import ChatMemberListComp from '../_components/Chat_MemberListComp';

import { IonPage, IonHeader, IonToolbar, IonContent,IonFooter } from '@ionic/react';


const Page: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <IonPage id="main-content">
      <IonHeader>
        <IonToolbar >
          <ChatGroupViewHeaderComp chatGroupId={id!} />
        </IonToolbar>
      </IonHeader>
      <IonContent>
         <ChatMemberListComp />
      </IonContent>
      <IonFooter>
        <AboutDeveloperComp />
      </IonFooter>
    </IonPage>
  );
};

export default Page;