

import { useParams } from 'react-router';

import { IonPage, IonHeader, IonToolbar, IonContent, IonFooter } from '@ionic/react';


const Page: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <IonPage id="main-content">
      <IonHeader>
        <IonToolbar >
          {/* Header removed */}
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {/* Member list removed */}
      </IonContent>
      <IonFooter>
        {/* Footer removed */}
      </IonFooter>
    </IonPage>
  );
};

export default Page;