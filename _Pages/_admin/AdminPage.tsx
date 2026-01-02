import {
  IonContent,
  IonPage,
  IonRefresher,
  IonRefresherContent,
} from "@ionic/react";
import ListAdminActionComp from "../../ListComps/ListAdminAction";
import AdminMenu from "../../_MenuComps/AdminMenu";




export default function HomePage(props: any) {
  // Use props or default fields if not provided (though props should be provided by ProtectedRoutes)
  const {
    dataSource,
    idField = "Id",
    imageField = "Thumbnail",
    headingField = "Title",
    subHeadingFields = ["Description"],
    gridFields = ["PageTitle"],
    activeInActiveToggle,
    fields,
    imageSize = "large",
    ...rest
  } = props;

  return (
    <IonPage>
      <IonContent fullscreen>
        <IonRefresher slot="fixed" onIonRefresh={() => window.location.reload()}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>
        <AdminMenu />
        <div className="p-4 sm:ml-64">
          <ListAdminActionComp
            dataSource={dataSource || "article"} // Fallback or required
            idField={idField}
            imageField={imageField}
            headingField={headingField}
            subHeadingFields={subHeadingFields}
            gridFields={gridFields}
            activeInActiveToggle={activeInActiveToggle}
            fields={fields || []}
            imageSize={imageSize}
            {...rest}
          />
        </div>
      </IonContent>
    </IonPage>
  );
}
