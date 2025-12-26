import {
  IonContent,
  IonPage,
  IonRefresher,
  IonRefresherContent,
} from "@ionic/react";
import AdminMenu from "../../_MenuComps/AdminMenu";;
import { BASE_URL, PAGE_ID } from "../../../../config";
import { useEffect, useState } from "react";
import FormUpdateContactInfo from "../../FormComps/FormUpdateContactInfo";



export default function Page() {
  const [contactInfoData, setContactInfoData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getData();
  }, []);

  const getData = async () => {
    try {
      const response = await fetch(`${BASE_URL}/contactInfo/api/byPageId/${PAGE_ID}`);
      const responseJson = await response.json();
      if (responseJson && responseJson[0]) {
        setContactInfoData(responseJson[0]);
        // Store with the key expected by FormUpdateContactInfo
        localStorage.setItem(`StoredItem_${PAGE_ID}`, JSON.stringify(responseJson[0]));
      }
    } catch (error) {
      console.error("Failed to fetch contact info:", error);
    } finally {
      setLoading(false);
    }
  }

  const fields = [
    { fieldName: "Thumbnail", type: "image", required: false },
    { fieldName: "Title", type: "text", required: true },
    { fieldName: "GoogleMapCode", type: "textarea" },
    { fieldName: "Description", type: "textarea" },
    { fieldName: "SpecialMessage", type: "textarea" },


    { fieldName: "PhoneOne", type: "text" },
    { fieldName: "Email", type: "text" },
    { fieldName: "OpenTime", type: "text" },
    { fieldName: "Address", type: "text" },


    { fieldName: "WebsiteURL", type: "text" },
    { fieldName: "InstagramURL", type: "text" },
    { fieldName: "LinkedInURL", type: "text" },
    { fieldName: "YoutubeURL", type: "text" },
    { fieldName: "TwitterURL", type: "text" },
    { fieldName: "TikTokURL", type: "text" },

    { fieldName: "VoucherHeaderImage", type: "image" },
  ];
  return (
    <IonPage>
      <IonContent fullscreen>
        <IonRefresher slot="fixed" onIonRefresh={(e) => { getData().then(() => e.detail.complete()) }}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>
        <AdminMenu />
        <div className="p-4 sm:ml-72 min-h-screen bg-gray-50">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-500">Loading contact details...</p>
            </div>
          ) : contactInfoData ? (
            <FormUpdateContactInfo dataSource="contactInfo" fields={fields} imageSize={"large"} />
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-center">
              <p className="text-gray-500 mb-4">No contact information found.</p>
              <button onClick={() => window.location.reload()} className="px-4 py-2 bg-blue-600 text-white rounded-lg">Retry</button>
            </div>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
}
