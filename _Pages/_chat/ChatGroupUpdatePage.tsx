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




import { APP_CUSTOM_CSS } from '@/config';
import { IonPage, IonHeader, IonToolbar, IonContent, IonRefresher, IonRefresherContent, IonFooter } from '@ionic/react';

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
          {/* DirectoryHeaderComp removed */}
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {/* UniversalUpdateForm removed */}
      </IonContent>
      <IonFooter>
        {/* AboutDeveloperComp removed */}
      </IonFooter>
    </IonPage>
  );
};

export default Page;