import { IonContent, IonPage } from '@ionic/react';
import UserLoginComp from '../_AuthComps/UserLoginComp';


const LoginPage: React.FC = () => {
  return (
    <IonPage>
      <IonContent fullscreen>
        <UserLoginComp />
      </IonContent>
    </IonPage>
  );
};

export default LoginPage;
