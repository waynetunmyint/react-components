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
} from "lucide-react";

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

const isValidValue = (val: any) =>
  val !== null && val !== undefined && val !== "-" && val !== "null";

const detectFieldType = (val: string) => {
  if (!val || !isValidValue(val)) return "text";
  if (/^\+?[0-9\s\-]{5,20}$/.test(val)) return "phone";
  if (/^[\w.-]+@[\w.-]+\.[A-Za-z]{2,}$/.test(val)) return "email";
  if (/^https?:\/\//.test(val)) return "url";
  return "text";
};

export default function UniversalListComp({
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

      let res;
      if (customAPI) {
        res = await fetch(`${BASE_URL}${customAPI}`);
      } else {
        res = await fetch(`${BASE_URL}/${dataSource}/api/byPage/${pageNo}`);
      }

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

  async function handleView(item: any) {
    await localStorage.setItem("StoredItem", JSON.stringify(item));
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

    let icon: React.ReactNode;
    let bgColor: string;
    switch (type) {
      case "phone":
        icon = <Phone className="w-3.5 h-3.5 text-white" />;
        bgColor = "bg-blue-500";
        break;
      case "email":
        icon = <Mail className="w-3.5 h-3.5 text-white" />;
        bgColor = "bg-red-500";
        break;
      case "url":
        icon = <ExternalLink className="w-3.5 h-3.5 text-white" />;
        bgColor = "bg-green-500";
        break;
      default:
        icon = <Info className="w-3.5 h-3.5 text-white" />;
        bgColor = "bg-gray-400";
    }

    return (
      <button
        onClick={handleClick}
        className={`ml-2 p-1.5 ${bgColor} rounded-full transition-all duration-200 active:scale-95 shadow-sm`}
      >
        {icon}
      </button>
    );
  };

  const renderSubField = (item: any, field?: string) => {
    if (!field || !isValidValue(item[field])) return null;
    const val = item[field];
    return (
      <div className="flex items-center text-sm text-gray-600 truncate">
        <span className="truncate">{val}</span>
        {renderFieldAction(val, field)}
      </div>
    );
  };

  return (
    <div
      className="pb-4"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {isRefreshing && (
        <div className="flex justify-center items-center py-4 text-sm text-gray-500 bg-gray-50">
          <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full mr-2"></div>
          <span className="font-medium">Refreshing...</span>
        </div>
      )}

      {isInitialLoading ? (
        <div className="px-4 space-y-3 py-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl shadow-sm p-4 animate-pulse"
            >
              <div className="flex items-center space-x-3">
                <div className="w-20 h-20 bg-gray-200 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2.5">
                  <div className="h-4 bg-gray-200 rounded-lg w-3/4" />
                  <div className="h-3 bg-gray-200 rounded-lg w-1/2" />
                  <div className="h-3 bg-gray-200 rounded-lg w-2/3" />
                </div>
                <div className="w-6 h-6 bg-gray-200 rounded-full flex-shrink-0" />
              </div>
            </div>
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="bg-gray-50 min-h-[60vh] flex items-center justify-center px-4">
          <div className="bg-white rounded-3xl shadow-lg p-10 text-center max-w-sm">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <p className="text-gray-900 text-lg font-semibold mb-2">
              No Results Found
            </p>
            <p className="text-gray-500 text-sm">
              Try adjusting your search or filters
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-gray-50 px-4 space-y-3 py-4">
            {data.map((item, index) => {
              const imageSrc =
                imageField && item?.[imageField]
                  ? `${IMAGE_URL}/uploads/${item[imageField]}`
                  : `${IMAGE_URL}/uploads/${defaultImage}`;

              return (
                <div
                  key={index}
                  onClick={() => handleView(item)}
                  className="bg-white rounded-2xl shadow-sm hover:shadow-md active:scale-[0.98] transition-all duration-200 cursor-pointer overflow-hidden"
                >
                  <div className="p-4">
                    <div className="flex items-center">
                      {imageField && (
                        <div className="relative flex-shrink-0">
                          <img
                            src={imageSrc}
                            alt={headingField ? item?.[headingField] : "Image"}
                            className="w-20 h-20 object-cover rounded-xl"
                          />
                          {badgeImage && (
                            <img
                              src={`${IMAGE_URL}/uploads/${item?.[badgeImage]}`}
                              alt="badge"
                              className="absolute -top-1 -right-1 w-7 h-7 rounded-full border-2 border-white shadow-md"
                            />
                          )}
                        </div>
                      )}

                      <div className="ml-3 flex-1 min-w-0">
                        {idField && (
                          <p className="text-xs font-medium text-gray-400 mb-1 tracking-wide">
                            ID: {item?.[idField]}
                          </p>
                        )}
                        {headingField && (
                          <h2 className="text-base font-semibold text-gray-900 line-clamp-2 leading-snug mb-1">
                            {item?.[headingField]}
                          </h2>
                        )}

                        <div className="space-y-0.5">
                          {renderSubField(item, subHeadingField)}
                          {renderSubField(item, subHeadingField1)}
                          {renderSubField(item, subHeadingField2)}
                          {renderSubField(item, subHeadingField3)}
                        </div>
                      </div>

                      <ChevronRight className="h-5 w-5 text-gray-400 ml-2 flex-shrink-0" />
                    </div>

                    {dataFields.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-2">
                        {dataFields.map(
                          (field) =>
                            isValidValue(item[field]) && (
                              <div
                                key={field}
                                className="flex items-center text-xs text-gray-600 bg-gray-50 rounded-full px-3 py-1.5"
                              >
                                <span className="truncate max-w-[150px]">
                                  {item[field]}
                                </span>
                                {renderFieldAction(item[field], field)}
                              </div>
                            )
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div ref={observerRef} className="h-8" />
          {isFetching && data.length > 0 && (
            <div className="flex justify-center py-6">
              <div className="flex items-center space-x-2 bg-white rounded-full px-4 py-2 shadow-sm">
                <svg
                  className="animate-spin h-5 w-5 text-blue-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  />
                </svg>
                <span className="text-sm font-medium text-gray-600">
                  Loading...
                </span>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}