import {
  IonContent,
  IonHeader,
  IonPage,
  IonToolbar,
} from "@ionic/react";
import HeaderSwitcher from "../_SwitcherComps/HeaderSwitcher";
import TopUpComp from "../RewardComps/TopUp_Comp";

// import DirectoryHeaderComp from "../DirectoryHeaderComp";
// import TopUpComp from "../TopUp_Comp";

export default function Page() {


  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          {/* <DirectoryHeaderComp headingField="TopUp Tokens" /> */}
          <HeaderSwitcher styleNo={8} headingField="TopUp Tokens" />
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <div className="bg-white min-h-full">
          <TopUpComp />
        </div>
      </IonContent>

    </IonPage>
  );
}
