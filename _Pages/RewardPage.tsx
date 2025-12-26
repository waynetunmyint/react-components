import { IonContent,  IonPage } from '@ionic/react';
import React from 'react';
import HeaderSwitcher from "../_SwitcherComps/HeaderSwitcher";


const Page: React.FC = () => {
  return (
    <IonPage>

      <IonContent className="bg-gray-50">
        <HeaderSwitcher styleNo={8} title="Reward & Store" showRightButtons />
        <div className={`min-h-screen px-4 py-5`}>
          {/* Reward Component */}
          {/* <UniversalRewardComp /> */}

          {/* Slider Section */}
          <div className="pt-8 pb-5 text-center">
            <h2 className="text-blue-900 text-2xl sm:text-3xl font-semibold mb-4">
              Apps for Reward
            </h2>
            {/* <UniversalSliderComp
              dataSource="application"
              iconMode
              customAPI="/application/api"
              imageField="Thumbnail"
              headingField="Name"
              badgeImage=""
            /> */}
          </div>

          {/* Store Section */}
          <div>
            <h1 className="text-blue-900 text-center text-3xl font-bold mb-5">
              Store
            </h1>
            {/* <UniversalStoreGridComp dataSource="digitalProduct" /> */}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Page;
