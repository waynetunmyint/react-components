
import { APP_CUSTOM_CSS } from '@/config';
import { IonPage, IonHeader, IonToolbar, IonContent, IonRefresher, IonRefresherContent, IonFooter } from '@ionic/react';
import { ChatGroupGrid } from '../ChatComps/ChatGroupGrid';
import HeaderSwitcher from '../_SwitcherComps/HeaderSwitcher';
import ProfileInfo from '../ProfileComps/ProfileInfo';

const Page: React.FC = () => {
  return (
    <IonPage id="main-content">
      <IonContent fullscreen className="ion-padding-top">
        <IonRefresher slot="fixed" onIonRefresh={() => window.location.reload()}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>

        <div className={`min-h-screen px-4 py-4`} style={{ backgroundColor: 'var(--bg1)' }}>
          <HeaderSwitcher />
          <ProfileInfo />
          <ChatGroupGrid
            dataSource={'chatGroup'}
            imageField='Thumbnail'
            headingField='Title'
            customAPI={'/chatGroup/api'}
          />
        </div>
      </IonContent>

    </IonPage>
  );
};

export default Page;