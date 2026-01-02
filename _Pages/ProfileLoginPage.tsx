import React from 'react';
import { IonPage, IonContent } from '@ionic/react';
import ProfileLoginComp from '../_AuthComps/ProfileLoginComp';

const Page: React.FC = () => {
    return (
        <IonPage>
            <IonContent fullscreen>
                <ProfileLoginComp />
            </IonContent>
        </IonPage>
    );
};

export default Page;
