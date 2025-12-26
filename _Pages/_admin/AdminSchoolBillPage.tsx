import React, { useState } from "react";
import {
    IonContent,
    IonPage,
    IonRefresher,
    IonRefresherContent,
} from "@ionic/react";

import AdminMenu from "../../_MenuComps/AdminMenu";
import ListAdminSchoolBillAction from "../../ListComps/ListAdminSchoolBillAction";
import SchoolBillModal from "../../SchoolBillComps/SchoolBillModal";

// OrderItem moved into ManualOrderModal component


export default function Page() {
    // Define fields for the article form
    const [showManualModal, setShowManualModal] = useState(false);
    const [editingOrder, setEditingOrder] = useState<any>(null);

    const handleEdit = (order: any) => {
        setEditingOrder(order);
        setShowManualModal(true);
    };

    const handleCloseModal = () => {
        setShowManualModal(false);
        setEditingOrder(null);
    };

    return (
        <IonPage>
            <IonContent fullscreen>
                <IonRefresher slot="fixed" onIonRefresh={() => window.location.reload()}>
                    <IonRefresherContent></IonRefresherContent>
                </IonRefresher>
                <AdminMenu />
                <div className="p-4 sm:ml-64">
                    <ListAdminSchoolBillAction
                        dataSource="schoolBill"
                        onEdit={handleEdit}
                        onAddNew={() => { setEditingOrder(null); setShowManualModal(true); }}
                    />
                </div>
                <SchoolBillModal
                    isOpen={showManualModal}
                    onClose={handleCloseModal}
                    onCreated={() => window.location.reload()}
                    billData={editingOrder}
                />
            </IonContent>
        </IonPage>
    );
}