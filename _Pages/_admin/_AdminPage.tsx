import {
    IonContent,
    IonPage,
    IonRefresher,
    IonRefresherContent,
} from "@ionic/react";
import AdminMenu from "../../_MenuComps/AdminMenu";
import ListAdminActionComp from "../../ListComps/ListAdminAction";
import { AdminPageConfig } from "../../RouteComps/adminConfigs";

interface Props extends AdminPageConfig { }

/**
 * Generic Admin Page Component
 * 
 * Usage:
 * <GenericAdminPage {...ADMIN_PAGE_CONFIGS.book} />
 */
export default function GenericAdminPage({
    dataSource,
    fields,
    gridFields,
    subHeadingFields = ["Description"],
    imageField = "Thumbnail",
    headingField = "Title",
    imageSize = "large",
    activeInActiveToggle = true,
    IsBill,
}: Props) {
    return (
        <IonPage>
            <IonContent fullscreen>
                <IonRefresher slot="fixed" onIonRefresh={() => window.location.reload()}>
                    <IonRefresherContent></IonRefresherContent>
                </IonRefresher>
                <AdminMenu />
                <div className="p-4 sm:ml-64">
                    <ListAdminActionComp
                        dataSource={dataSource}
                        idField="Id"
                        imageField={imageField}
                        headingField={headingField}
                        subHeadingFields={subHeadingFields}
                        gridFields={gridFields}
                        activeInActiveToggle={activeInActiveToggle}
                        fields={fields}
                        imageSize={imageSize}
                        IsBill={IsBill}
                    />
                </div>
            </IonContent>
        </IonPage>
    );
}
