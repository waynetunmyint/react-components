import React from 'react';
import { IonContent, IonPage } from '@ionic/react';
import PlacementTest from '../PlacementTestComps/PlacementTest';
import HeaderSwitcher from '../_SwitcherComps/HeaderSwitcher';
import FooterSwitchComp from '../_SwitcherComps/FooterSwitcher';
import { FOOTER_STYLE } from '../../../config';

const PlacementTestPage: React.FC = () => {
    return (
        <IonPage>
            <HeaderSwitcher headingField="Placement Test" />
            <IonContent fullscreen>
                <PlacementTest />
                <FooterSwitchComp styleNo={FOOTER_STYLE} />
            </IonContent>
        </IonPage>
    );
};

export default PlacementTestPage;
