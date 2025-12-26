"use client";
import React, { useEffect, useState } from "react";
import { BASE_URL, IMAGE_URL } from "../../config";
import { Worker, Viewer } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin, ToolbarProps } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { UniversalGetStoredJWT, UniversalGetStoredProfile } from "./UniversalStoredInformationComp";
import { ShoppingCart } from "lucide-react";

const SkeletonLoader = () => (
  <div className="animate-pulse flex flex-col w-full min-h-screen bg-[var(--theme-secondary-bg)] p-4">
    <div className="w-full h-64 bg-[var(--theme-text-secondary)]/10 rounded-3xl"></div>
    <div className="mt-6 space-y-3">
      <div className="h-6 bg-[var(--theme-text-secondary)]/10 rounded-lg w-1/2"></div>
      <div className="h-4 bg-[var(--theme-text-secondary)]/10 rounded-lg w-2/3"></div>
      <div className="h-4 bg-[var(--theme-text-secondary)]/10 rounded-lg w-1/3"></div>
    </div>
  </div>
);

interface Props {
  customAPI: string;
}

const DigitalProductViewComp: React.FC<Props> = ({ customAPI }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [owner, setOwner] = useState<boolean>(false);
  const [modalContent, setModalContent] = useState<any>(null);

  const storedProfile = UniversalGetStoredProfile();
  const storedJWT = UniversalGetStoredJWT();



  useEffect(() => {
    fetchData();
  }, [customAPI]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}${customAPI}`);
      const result = await response.json();
      const firstItem = result?.[0] || null;
      setData(firstItem);

      if (firstItem && storedProfile?.Email && storedJWT) {
        const formData = new FormData();
        formData.append("profileEmail", storedProfile.Email);
        formData.append("digitalProductId", firstItem.Id.toString());

        const purchaseResponse = await fetch(`${BASE_URL}/digitalPurchases/api/byEmail`, {
          method: "POST",
          body: formData,
          headers: { Authorization: `Bearer ${storedJWT}` },
        });

        const purchasedOwnerResponse = await purchaseResponse.json();
        setOwner(purchasedOwnerResponse.owner === true);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setData(null);
      setOwner(false);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (item: any) => {
    if (!storedProfile?.Email || !item?.Id) {
      setModalContent({ status: "error", message: "Missing profile email or product ID" });
      return;
    }

    try {
      const formData = new FormData();
      formData.append("profileEmail", storedProfile.Email);
      formData.append("digitalProductId", item.Id.toString());

      const response = await fetch(`${BASE_URL}/digitalPurchases/api/purchase`, {
        method: "POST",
        body: formData,
        headers: { Authorization: `Bearer ${storedJWT}` },
      });

      const result = await response.json();
      setOwner(result.owner === true);
      setModalContent(result);
    } catch (error) {
      setOwner(false);
      setModalContent({ status: "error", message: "Error during purchase. Please try again.", error });
    }
  };

  if (loading) return <SkeletonLoader />;

  if (!data)
    return (
      <div className="flex justify-center items-center h-full text-[var(--theme-text-muted)]">
        No data found
      </div>
    );

  return (
    <>
      <div className="min-h-screen flex flex-col gap-6">
        {!owner && (
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <img
              src={`${IMAGE_URL}/uploads/${data.Thumbnail}`}
              alt={data.Title}
              className="w-full sm:w-40 h-auto object-cover rounded-2xl flex-shrink-0"
            />
            <div className="flex-1 space-y-2">
              <h2 className="text-2xl font-bold text-[var(--theme-text-primary)]">{data.Title}</h2>
              {data.Price && (
                <p className="text-xl font-semibold text-[var(--scolor)]">
                  Price: {data.Price} Token
                </p>
              )}
              {data.Description && (
                <p className="text-[var(--theme-text-muted)] text-base leading-relaxed whitespace-pre-wrap">
                  {data.Description}
                </p>
              )}
            </div>
          </div>
        )}



        {owner && data.FileURL && data.FileURL !== "null" && data.FileURL !== "-" ? (
          <div className="w-full h-screen">
            <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
              <Viewer
                fileUrl={`${IMAGE_URL}/uploads/${data.FileURL}`}
                plugins={[]}
              />
            </Worker>
          </div>
        ) : (
          <button
            onClick={() => handlePurchase(data)}
            className="flex items-center justify-center gap-2 text-[var(--theme-primary-text)] rounded-xl bg-[var(--theme-accent)] p-4 w-full font-medium mt-4 hover:opacity-90 transition-all shadow-md"
          >
            <ShoppingCart className="w-5 h-5" />
            Purchase to View
          </button>
        )}





      </div>

      {/* Modal */}
      {modalContent?.message && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50">
          <div className="bg-[var(--theme-secondary-bg)] border border-[var(--theme-text-primary)]/10 rounded-2xl p-6 max-w-sm w-full text-center shadow-lg">
            <p className="text-[var(--theme-text-primary)] text-base">{modalContent.message}</p>
            <button
              onClick={() => setModalContent(null)}
              className="bg-[var(--theme-accent)] text-[var(--theme-primary-text)] px-4 py-2 rounded-lg font-medium mt-4 w-full hover:opacity-90 transition-colors"
            >
              OK
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default DigitalProductViewComp;
