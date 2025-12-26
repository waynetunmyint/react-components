import { IonContent, IonPage } from '@ionic/react';
import UserLoginComp from '../AuthComps/User_Login_Comp';


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
