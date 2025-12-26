import { IonContent, IonHeader, IonPage, IonSpinner, IonTitle, IonToolbar } from '@ionic/react'
import React, { useEffect, useState } from 'react'
import { BASE_URL, PAGE_ID } from '../../../config';
import HeaderSwitcher from '../_SwitcherComps/HeaderSwitcher';

export default function PrivacyPolicyPage() {
    const [setting, setSetting] = useState<any>(null);

    useEffect(() => {
        fetchSetting();
    }, []);

    const fetchSetting = async () => {
        try {
            const response = await fetch(`${BASE_URL}/page/api/${PAGE_ID}`);
            if (!response.ok) {
                throw new Error("Network response was not ok");
            }
            const data = await response.json();
            console.log("Setting Data", data);
            setSetting(data[0]);
        } catch (error) {
            console.error("Error fetching setting:", error);
        }
    };


    return (
        <IonPage>
            <IonContent className="p-4">
                <HeaderSwitcher headingField="Privacy Policy" />
                <div className='bg-white p-5 mt-[100px] min-h-screen'>
                    {setting?.PrivacyPolicy ? (
                        <div className="overflow-y-auto">
                            <pre style={{ whiteSpace: "pre-wrap" }} className='text-gray-700'>
                                {setting?.PrivacyPolicy}
                            </pre>
                        </div>
                    ) : (
                        <div className="flex justify-center items-center h-full">
                            <IonSpinner name="crescent" />
                        </div>
                    )}
                </div>
            </IonContent>
        </IonPage>
    )
}
