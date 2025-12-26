import { IonContent, IonPage } from "@ionic/react";
import { useParams } from "react-router-dom";
import PageBillPrint from "../../PrintComps/PageBillPrint";

/**
 * Print Invoice Page
 * Uses the existing PageBillPrint component with type="invoice"
 */
export default function PrintInvoicePage() {
    const { id } = useParams<{ id: string }>();

    return (
        <IonPage>
            <IonContent>
                <PageBillPrint billId={id} type="invoice" />
            </IonContent>
        </IonPage>
    );
}
