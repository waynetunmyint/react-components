

import AboutDeveloperComp from '../_appComponents/AboutDeveloperComp';
import DirectoryHeaderComp from '../_components/DirectoryHeaderComp';
import { IonPage, IonHeader, IonToolbar, IonContent, IonRefresher, IonRefresherContent, IonFooter } from '@ionic/react';
import { ChatGroupGridComp } from '../_components/Chat_GroupGridComp';

const Page: React.FC = () => {
  return (
    <IonPage id="main-content">
      <IonHeader>
        <IonToolbar>
           <DirectoryHeaderComp headingField='Chat Groups'/>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonRefresher slot="fixed" onIonRefresh={() => window.location.reload()}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>

        <div className={`min-h-screen  px-4 py-5`}>
          <ChatGroupGridComp
            dataSource={'chatGroup'}
            imageField='Thumbnail'
            headingField='Title'
            customAPI={'/chatGroup/api'}
            subHeadingField='LastMessage' categoryNameField={''}         />
        </div>
      </IonContent>
      <IonFooter>
        <AboutDeveloperComp />
      </IonFooter>
    </IonPage>
  );
};

export default Page;