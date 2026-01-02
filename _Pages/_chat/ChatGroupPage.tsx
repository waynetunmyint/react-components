

import { IonPage, IonHeader, IonToolbar, IonContent, IonRefresher, IonRefresherContent, IonFooter } from '@ionic/react';

const Page: React.FC = () => {
  return (
    <IonPage id="main-content">
      <IonHeader>
        <IonToolbar>
          {/* DirectoryHeaderComp removed */}
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonRefresher slot="fixed" onIonRefresh={() => window.location.reload()}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>

        <div className={`min-h-screen  px-4 py-5`}>
          {/* ChatGroupGridComp removed */}
        </div>
      </IonContent>
      <IonFooter>
        {/* AboutDeveloperComp removed */}
      </IonFooter>
    </IonPage>
  );
};

export default Page;