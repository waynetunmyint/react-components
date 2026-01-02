import React from 'react';
import { IonContent, IonPage } from '@ionic/react';
import CertificateSearch from '../CertificateComps/CertificateSearch';
import HeaderSwitcher from '../_SwitcherComps/HeaderSwitcher';
import FooterSwitchComp from '../_SwitcherComps/FooterSwitcher';
import { FOOTER_STYLE } from '@/config';

const CertificateSearchPage: React.FC = () => {
    return (
        <IonPage>
            <HeaderSwitcher headingField="Certificates" />
            <IonContent>
                <CertificateSearch />
                <FooterSwitchComp styleNo={FOOTER_STYLE} />
            </IonContent>
        </IonPage>
    );
};

export default CertificateSearchPage;
