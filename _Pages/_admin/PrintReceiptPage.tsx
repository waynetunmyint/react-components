import { IonContent, IonPage } from "@ionic/react";
import { useParams } from "react-router-dom";
import PageBillPrint from "../../PrintComps/PageBillPrint";

/**
 * Print Receipt Page
 * Uses the existing PageBillPrint component with type="receipt"
 */
export default function PrintReceiptPage() {
    const { id } = useParams<{ id: string }>();

    return (
        <IonPage>
            <IonContent>
                <PageBillPrint billId={id} type="receipt" />
            </IonContent>
        </IonPage>
    );
}
