import React, { useState } from "react";
import {
    IonContent,
    IonPage,
    IonRefresher,
    IonRefresherContent,
} from "@ionic/react";

import AdminMenu from "../../_MenuComps/AdminMenu";
import ListAdminBookOrderAction from "../../ListComps/ListAdminBookOrderAction";
import BookManualOrderModal from "../../ShoppingBookComps/BookManualOrderModal";

// OrderItem moved into ManualOrderModal component


export default function HomePage() {
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
                    <ListAdminBookOrderAction 
                        dataSource="bookOrder" 
                        onEdit={handleEdit}
                        onAddNew={() => { setEditingOrder(null); setShowManualModal(true); }}
                    />
                </div>

                <BookManualOrderModal 
                    isOpen={showManualModal} 
                    onClose={handleCloseModal} 
                    onCreated={() => window.location.reload()}
                    orderData={editingOrder}
                />
            </IonContent>
        </IonPage>
    );
}