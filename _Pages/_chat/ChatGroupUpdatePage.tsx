// "use client";
// import React from "react";
// import UniversalUpdateForm from "../_components/UniversalUpdateForm";
// import { IonPage } from "@ionic/react";



// export default function Page() {

//   const fields = [
//     { fieldName: "Thumbnail", type: "image" },
//     { fieldName: "Title", type: "text" },
//     { fieldName: "Description", type: "textarea" },
//      { fieldName: "OwnerEmail", type: "text" },
//      { fieldName: "Price", type: "number" },
//   ];

//   return (
//     <IonPage>
//         <
//         <UniversalUpdateForm dataSource="chatGroup" fields={fields} />
//       </div>
//     </IonPage>
//   );
// }



import AboutDeveloperComp from '../_appComponents/AboutDeveloperComp';
import { APP_CUSTOM_CSS } from '../../config';
import DirectoryHeaderComp from '../_components/DirectoryHeaderComp';
import { IonPage, IonHeader, IonToolbar, IonContent, IonRefresher, IonRefresherContent, IonFooter } from '@ionic/react';
import { ChatGroupGridComp } from '../_components/Chat_GroupGridComp';
import UniversalUpdateForm from '../_components/UniversalUpdateForm';

const Page: React.FC = () => {

    const fields = [
    // { fieldName: "Thumbnail", type: "image" },
    { fieldName: "Title", type: "text" },
    { fieldName: "Description", type: "textarea" },
     { fieldName: "Price", type: "number" },
  ];

  return (
    <IonPage id="main-content">
      <IonHeader>
        <IonToolbar>
           <DirectoryHeaderComp headingField='Chat Groups'/>
        </IonToolbar>
      </IonHeader>
      <IonContent>
         <UniversalUpdateForm dataSource="chatGroup" fields={fields} />
      </IonContent>
      <IonFooter>
        <AboutDeveloperComp />
      </IonFooter>
    </IonPage>
  );
};

export default Page;