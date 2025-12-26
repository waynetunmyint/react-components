import {
  IonContent,
  IonPage,
  IonRefresher,
  IonRefresherContent,
} from "@ionic/react";
import ListAdminActionComp from "../../ListComps/ListAdminAction";
import AdminMenu from "../../_MenuComps/AdminMenu";




export default function HomePage() {
  // Define fields for the article form
  const fields = [
    { fieldName: "Thumbnail", type: "image" },
    {fieldName : "YoutubeVideoLink", type: "text"},
    { fieldName: "Title", type: "text" },
    { fieldName: "Description", type: "textarea" },
  ];

  return (
    <IonPage>
      <IonContent fullscreen>
        <IonRefresher slot="fixed" onIonRefresh={() => window.location.reload()}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>
          <AdminMenu/>
          <div className="p-4 sm:ml-64">
            <ListAdminActionComp
              dataSource="article"
              idField="Id"
              imageField="Thumbnail"
              headingField="Title"
              subHeadingFields={["Description"]}
              gridFields={["PageTitle"]}
              activeInActiveToggle
              fields={fields}
              imageSize="large"
            />
          </div>
      </IonContent>
    </IonPage>
  );
}
