

import { IonPage, IonHeader, IonToolbar, IonContent, IonRefresher, IonRefresherContent } from '@ionic/react';
import HeaderSwitcher from "../_SwitcherComps/HeaderSwitcher";
import { CONTACT_VIEW_STYLE, FOOTER_STYLE } from '@/config';
import FooterSwitchComp from '../_SwitcherComps/FooterSwitcher';
import ContactViewSwitcher from '../_SwitcherComps/ContactViewSwiter';


const Page: React.FC = () => {
  return (
    <IonPage>
      <IonContent fullscreen>
        <HeaderSwitcher headingField="Contact" />
        <IonRefresher slot="fixed" onIonRefresh={() => window.location.reload()}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>
        <ContactViewSwitcher styleNo={CONTACT_VIEW_STYLE} />
        <FooterSwitchComp styleNo={FOOTER_STYLE} />
      </IonContent>
    </IonPage>
  );
};

export default Page;