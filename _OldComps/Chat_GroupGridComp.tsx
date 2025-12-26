"use client";
import React, { useEffect, useRef, useState } from "react";
import { IonToast } from "@ionic/react";
import { BASE_URL, IMAGE_URL } from "../../config";
import { ShoppingBag, User } from "lucide-react";
import {
  UniversalGetStoredJWT,
  UniversalGetStoredProfile,
} from "./UniversalStoredInformationComp";
import { formatNumberShort } from "./Universal_FormatterComp";
import { checkChatMembership } from "./Stored_InformationComp";

interface Props {
  dataSource: string;
  imageField?: string;
  categoryNameField: string;
  headingField?: string;
  subHeadingField?: string;
  subHeadingField1?: string;
  idField?: string;
  defaultImage?: string;
  customAPI?: string;
}

export function ChatGroupGridComp({
  dataSource,
  imageField,
  headingField,
  defaultImage = "logo.png",
  customAPI,
}: Props) {
  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [isFetching, setIsFetching] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState<string>("");
  const [loadingItems, setLoadingItems] = useState<{ [key: string]: boolean }>({});

  const observerRef = useRef<HTMLDivElement | null>(null);
  const touchStartY = useRef(0);
  const touchMoveY = useRef(0);

  useEffect(() => {
    setData([]);
    setPage(1);
    setHasMore(true);
    fetchData(1);
  }, [dataSource, customAPI]);

  useEffect(() => {
    if (!observerRef.current || !hasMore || isFetching) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetching && hasMore) {
          fetchData(page + 1);
        }
      },
      { threshold: 0.5 }
    );

    observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [isFetching, page, hasMore]);

  async function fetchData(pageNo: number, isRefresh = false) {
    try {
      if (isRefresh) setIsRefreshing(true);
      else setIsFetching(true);

      const res = customAPI
        ? await fetch(`${BASE_URL}${customAPI}`)
        : await fetch(`${BASE_URL}/${dataSource}/api/byPage/${pageNo}`);

      if (!res.ok) throw new Error("Failed to fetch data");
      const newData = await res.json();

      if (!Array.isArray(newData)) throw new Error("Data is not iterable");

      setData((prev) => (pageNo === 1 ? newData : [...prev, ...newData]));
      setPage(pageNo);
      if (newData.length === 0) setHasMore(false);
    } catch (err) {
      console.error(err);
      setHasMore(false);
      setToastMessage("Error fetching data.");
    } finally {
      setIsFetching(false);
      setIsRefreshing(false);
    }
  }


  async function handleView(item: any) {
    await checkChatMembership(item?.Id); //only neeed check group id
    await localStorage.setItem("StoredGroupItem", JSON.stringify(item));
    window.location.href = `/${dataSource}/view/${item?.chatGroupId || item?.Id}`;
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartY.current = e.touches[0].clientY;
  }
  function handleTouchMove(e: React.TouchEvent) {
    touchMoveY.current = e.touches[0].clientY;
  }
  function handleTouchEnd() {
    const distance = touchMoveY.current - touchStartY.current;
    if (distance > 60 && !isRefreshing && window.scrollY === 0) {
      fetchData(1, true);
    }
    touchStartY.current = 0;
    touchMoveY.current = 0;
  }

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="min-h-screen"
    >
      {/* Toast */}
      <IonToast
        isOpen={!!toastMessage}
        onDidDismiss={() => setToastMessage(null)}
        message={toastMessage || ""}
        duration={4000}
        position="top"
        color="dark"
      />

      {/* Membership Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50 px-4">
          <div className="bg-white/95 w-full max-w-sm rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full mx-auto mb-4 flex items-center justify-center">
                <ShoppingBag className="text-white" size={28} strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">
                Membership Required
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {modalMessage}
              </p>
            </div>
            <div className="flex border-t border-gray-200">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-3.5 text-blue-500 font-medium text-base"
              >
                Cancel
              </button>
              <div className="w-px bg-gray-200" />
              <button
                onClick={() => (window.location.href = "/purchase")}
                className="flex-1 py-3.5 text-blue-500 font-semibold text-base"
              >
                Purchase
              </button>
            </div>
          </div>
        </div>
      )}

    

      {/* Refresh Indicator */}
      {isRefreshing && (
        <div className="flex justify-center items-center">
          <div className="flex items-center bg-white/80  rounded-full shadow-sm">
            <div className="w-4 h-4 border-2 border-gray-400 border-t-blue-500 rounded-full animate-spin" />
            <span className="text-sm font-medium text-gray-600">Refreshing</span>
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="px-0 pb-6 pt-2">
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {data.map((item, index) => {
            const imageSrc =
              imageField && item?.[imageField]
                ? `${IMAGE_URL}/uploads/${item[imageField]}`
                : `${IMAGE_URL}/uploads/${defaultImage}`;
            const chatGroupId = item?.chatGroupId || item?.Id;
            const isLoading = !!loadingItems[chatGroupId];

            return (
              <div
                key={index}
                onClick={() => handleView(item)}
                className={`group hover:scale-105 relative rounded-2xl overflow-hidden shadow-sm active:scale-95 transition-all duration-200 ${
                  !chatGroupId ? "opacity-50 pointer-events-none" : ""
                }`}
              >
                {/* Image */}
                {imageField && (
                  <div className="relative w-full aspect-square bg-gray-100">
                    <img
                      src={imageSrc}
                      alt={headingField ? item?.[headingField] : "Image"}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/40" />
                  </div>
                )}

                {/* Top Stats */}
                <div className="absolute top-2 left-2 right-2 flex justify-between items-start">
                  <div className="flex items-center gap-1 bg-white/90 px-2 py-1 rounded-full shadow-sm">
                    <User size={12} className="text-gray-700" strokeWidth={2.5} />
                    <span className="text-xs font-semibold text-gray-700">
                      {formatNumberShort(item?.MemberCount)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 bg-gradient-to-r from-amber-400 to-yellow-500 px-2 py-1 rounded-full shadow-sm">
                    <ShoppingBag size={12} className="text-white" strokeWidth={2.5} />
                    <span className="text-xs font-semibold text-white">
                      {formatNumberShort(item?.Price)}
                    </span>
                  </div>
                </div>

            {/* Loading Overlay */}
            {isLoading && (
              <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex flex-col justify-center items-center z-50">
                {/* Pretty Bouncing Dots Spinner */}
                <div className="flex space-x-2 mb-3">
                  <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce delay-150" />
                  <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce delay-300" />
                  <div className="w-4 h-4 bg-blue-500 rounded-full animate-bounce delay-450" />
                </div>
                <span className="text-xs font-medium text-gray-700">Loading..</span>
              </div>
            )}

              </div>
            );
          })}
        </div>
      </div>

      {/* Intersection Target */}
      <div ref={observerRef} className="w-full h-1" />

      {/* Skeleton */}
      {isFetching && data.length === 0 && (
        <div className="">
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {Array.from({ length: 20 }).map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse"
              >
                <div className="w-full aspect-square bg-gradient-to-br from-gray-100 to-gray-200" />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
