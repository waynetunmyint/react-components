"use client";
import React, { useEffect, useRef, useState } from "react";
import { BASE_URL, IMAGE_URL } from "../../config";
import {
  ChevronRight,
  Phone,
  Mail,
  ExternalLink,
  Info,
  Search,
  MapPin,
  Globe,
  Building2,
  Loader2,
} from "lucide-react";
import { isValidValue } from "./Formatter_Comp";

interface Props {
  dataSource: string;
  imageField?: string;
  headingField?: string;
  subHeadingField?: string;
  subHeadingField1?: string;
  subHeadingField2?: string;
  subHeadingField3?: string;
  idField?: string;
  defaultImage?: string;
  customAPI?: string;
  dataFields?: string[];
  badgeImage?: string;
}


export default function DirectoryCardComp({
  dataSource,
  imageField,
  headingField,
  subHeadingField,
  subHeadingField1,
  subHeadingField2,
  subHeadingField3,
  idField,
  defaultImage = "logo.png",
  customAPI,
  dataFields = [],
  badgeImage,
}: Props) {
  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [isFetching, setIsFetching] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const observerRef = useRef<HTMLDivElement | null>(null);
  const touchStartY = useRef(0);
  const touchMoveY = useRef(0);

  useEffect(() => {
    resetAndFetch();
  }, [dataSource]);

  useEffect(() => {
    if (!observerRef.current || !hasMore || isFetching) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isFetching && hasMore) {
          fetchData(page + 1);
        }
      },
      { threshold: 1 }
    );
    observer.observe(observerRef.current);
    return () => {
      if (observerRef.current) observer.unobserve(observerRef.current);
      observer.disconnect();
    };
  }, [observerRef.current, isFetching, page, hasMore]);

  async function fetchData(pageNo: number, replace = false) {
    try {
      setIsFetching(true);
      if (pageNo === 1) setIsInitialLoading(true);

      const endpoint = customAPI
        ? `${BASE_URL}${customAPI}`
        : `${BASE_URL}/${dataSource}/api/byPage/${pageNo}`;

      const res = await fetch(endpoint);
      if (!res.ok) throw new Error("Failed to fetch data");

      const newData = await res.json();
      if (!Array.isArray(newData)) throw new Error("Data is not iterable");

      setData((prev) =>
        pageNo === 1 || replace ? newData : [...prev, ...newData]
      );
      setPage(pageNo);
      if (newData.length === 0) setHasMore(false);
    } catch (err) {
      console.error(err);
      setHasMore(false);
    } finally {
      setIsFetching(false);
      if (pageNo === 1) {
        setIsInitialLoading(false);
        setIsRefreshing(false);
      }
    }
  }

  function resetAndFetch() {
    setData([]);
    setPage(1);
    setHasMore(true);
    fetchData(1, true);
  }

  function handleView(item: any) {
    localStorage.setItem("StoredItem", JSON.stringify(item));
    window.location.href = `/${dataSource}/view/${item?.Id}`;
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
      setIsRefreshing(true);
      resetAndFetch();
    }
    touchStartY.current = 0;
    touchMoveY.current = 0;
  }

  const renderFieldAction = (val: string, fieldName?: string) => {
    const type = fieldName === "PhoneOne" ? "phone" : detectFieldType(val);
    if (type === "text") return null;

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.stopPropagation();
      if (type === "phone") window.location.href = `tel:${val}`;
      else if (type === "email") window.location.href = `mailto:${val}`;
      else if (type === "url") window.open(val, "_blank");
    };

    const buttonStyles = {
      phone: "bg-blue-50 hover:bg-blue-100  border-blue-200",
      email: "bg-red-50 hover:bg-red-100 text-red-600 border-red-200",
      url: "bg-green-50 hover:bg-green-100 text-green-600 border-green-200",
    };

    const icon =
      type === "phone" ? (
        <Phone className="w-4 h-4" />
      ) : type === "email" ? (
        <Mail className="w-4 h-4" />
      ) : type === "url" ? (
        <ExternalLink className="w-4 h-4" />
      ) : (
        <Info className="w-4 h-4" />
      );

    return (
      <button
        key={val + fieldName}
        onClick={handleClick}
        className={`p-2.5 rounded-lg border transition-all duration-200 flex items-center justify-center shadow-sm hover:shadow ${
          buttonStyles[type as keyof typeof buttonStyles] || "bg-gray-50 hover:bg-gray-100 text-gray-600"
        }`}
        title={val}
      >
        {icon}
      </button>
    );
  };

  const renderFieldWithIcon = (
    fieldName: string | undefined,
    value: any,
    icon: React.ReactNode
  ) =>
    fieldName &&
    isValidValue(value) && (
      <div className="flex items-start gap-2 text-sm text-gray-600">
        <div className="mt-0.5 flex-shrink-0">{icon}</div>
        <span className="line-clamp-2 leading-relaxed">{value}</span>
      </div>
    );

  return (
    <div
      className="min-h-screen "
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {isRefreshing && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200 shadow-sm">
          <div className="flex justify-center items-center py-4 text-sm font-medium text-gray-700">
            <Loader2 className="animate-spin h-5 w-5 mr-2 " />
            Refreshing...
          </div>
        </div>
      )}

      {isInitialLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col bg-white rounded-2xl shadow-md overflow-hidden animate-pulse"
            >
              <div className="w-full h-48 bg-gradient-to-br from-gray-200 to-gray-300" />
              <div className="p-5 space-y-3">
                <div className="h-5 bg-gray-200 rounded-lg w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-full" />
                <div className="h-4 bg-gray-200 rounded w-5/6" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
                <div className="flex gap-2 pt-2">
                  <div className="h-10 w-10 bg-gray-200 rounded-lg" />
                  <div className="h-10 w-10 bg-gray-200 rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[70vh] py-12 px-4">
          <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-full p-8 mb-6">
            <Search className="w-16 h-16 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-800 mb-2">No Results Found</h3>
          <p className="text-gray-500 text-center max-w-md">
            We couldn't find any items matching your criteria. Try adjusting your search or filters.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
            {data.map((item, index) => {
              const imageSrc =
                imageField && item?.[imageField]
                  ? `${IMAGE_URL}/uploads/${item[imageField]}`
                  : `${IMAGE_URL}/uploads/${defaultImage}`;

              return (
                <div
                  key={index}
                  onClick={() => handleView(item)}
                  className="group flex flex-col bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden transform hover:-translate-y-1 border border-gray-100"
                >
                  {imageField && (
                    <div className="relative overflow-hidden">
                      <img
                        src={imageSrc}
                        alt={headingField ? item?.[headingField] : "Image"}
                        className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      {badgeImage && (
                        <div className="absolute top-3 right-3 bg-white rounded-full p-1 shadow-lg">
                          <img
                            src={`${IMAGE_URL}/uploads/${item?.[badgeImage]}`}
                            alt="badge"
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        </div>
                      )}
                      {idField && (
                        <div className="absolute top-3 left-3 bg-black/50 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-full">
                          #{item?.[idField]}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="p-5 flex flex-col flex-1 space-y-3">
                    {headingField && (
                      <h2 className="text-lg font-bold text-gray-900 line-clamp-2 leading-tight group-hover: transition-colors">
                        {item?.[headingField]}
                      </h2>
                    )}

                    <div className="space-y-2 flex-1">
                      {renderFieldWithIcon(
                        subHeadingField,
                        item[subHeadingField!],
                        <Building2 className="w-4 h-4 text-blue-500" />
                      )}
                      {renderFieldWithIcon(
                        subHeadingField1,
                        item[subHeadingField1!],
                        <MapPin className="w-4 h-4 text-red-500" />
                      )}
                      {renderFieldWithIcon(
                        subHeadingField2,
                        item[subHeadingField2!],
                        <Phone className="w-4 h-4 text-green-500" />
                      )}
                      {renderFieldWithIcon(
                        subHeadingField3,
                        item[subHeadingField3!],
                        <Globe className="w-4 h-4 text-purple-500" />
                      )}
                    </div>

                    {dataFields.length > 0 && (
                      <div className="pt-3 border-t border-gray-100 flex gap-2">
                        {dataFields.map(
                          (field) =>
                            isValidValue(item[field]) &&
                            renderFieldAction(item[field], field)
                        )}
                        <button
                          className="ml-auto p-2.5 rounded-lg bg-blue-50 hover:bg-blue-100  border border-blue-200 transition-all duration-200 shadow-sm hover:shadow"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleView(item);
                          }}
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div ref={observerRef} className="h-10" />

          {isFetching && data.length > 0 && (
            <div className="flex justify-center py-8">
              <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-full shadow-lg border border-gray-200">
                <Loader2 className="animate-spin h-5 w-5 " />
                <span className="text-sm font-medium text-gray-700">Loading more...</span>
              </div>
            </div>
          )}

          {!hasMore && data.length > 0 && (
            <div className="flex justify-center py-8">
              <div className="text-sm text-gray-500 bg-white px-6 py-3 rounded-full border border-gray-200">
                You've reached the end
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}