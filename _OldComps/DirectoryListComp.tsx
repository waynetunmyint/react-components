"use client";
import React, { useEffect, useRef, useState } from "react";
import { BASE_URL, IMAGE_URL } from "../../config";
import { ChevronRight, Phone, Mail, ExternalLink, Info, Search } from "lucide-react";

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

export default function DirectoryListComp({
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

  // Touch tracking for pull-to-refresh
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

  function handleView(item: any) {
    window.location.href = `/${dataSource}/view/${item?.Id}`;
  }

  // ✅ Pull-to-refresh handlers
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

  // Render icon actions
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
    switch (type) {
      case "phone":
        icon = <Phone className="w-5 h-5 text-blue-500" />;
        break;
      case "email":
        icon = <Mail className="w-5 h-5 text-red-500" />;
        break;
      case "url":
        icon = <ExternalLink className="w-5 h-5 text-green-500" />;
        break;
      default:
        icon = <Info className="w-5 h-5 text-gray-400" />;
    }

    return (
      <button
        key={val + fieldName}
        onClick={handleClick}
        className="p-2 hover:bg-gray-100 rounded flex items-center justify-center"
      >
        {icon}
      </button>
    );
  };

  return (
    <div
      className="mt-4"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Refresh spinner */}
      {isRefreshing && (
        <div className="flex justify-center items-center py-3 text-sm text-gray-500">
          <div className="animate-spin h-5 w-5 border-2 border-gray-400 border-t-transparent rounded-full mr-2"></div>
          Refreshing...
        </div>
      )}

      {/* Loading skeleton */}
      {isInitialLoading ? (
        <div className="bg-white">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center px-4 py-3 animate-pulse space-x-4"
            >
              <div className="w-[100px] h-[100px] bg-gray-200 rounded-xl" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-3 bg-gray-200 rounded w-2/3" />
              </div>
              <div className="w-5 h-5 bg-gray-200 rounded-full" />
            </div>
          ))}
        </div>
      ) : data.length === 0 ? (
        // ✅ No results message
        <div className="bg-white flex flex-col items-center m-5 rounded-lg border py-10">
          <Search className="w-12 h-12 text-gray-300 mb-4" />
          <p className="text-gray-500 text-base font-medium">
            No results found
          </p>
        </div>


      ) : (
        <>
          <div className="bg-white">
            {data.map((item, index) => {
              const imageSrc =
                imageField && item?.[imageField]
                  ? `${IMAGE_URL}/uploads/${item[imageField]}`
                  : `${IMAGE_URL}/uploads/${defaultImage}`;

              return (
                <div
                  key={index}
                  onClick={() => handleView(item)}
                  className="flex flex-col border-b px-4 py-3 hover:bg-gray-50 active:bg-gray-100 cursor-pointer transition"
                >
                  <div className="flex items-center">
                    {imageField && (
                      <div className="relative">
                        <img
                          src={imageSrc}
                          alt={headingField ? item?.[headingField] : "Image"}
                          className="w-[75px] h-auto object-cover rounded-xl border border-gray-200"
                        />
                        {badgeImage && (
                          <img
                            src={`${IMAGE_URL}/uploads/${item?.[badgeImage]}`}
                            alt="badge"
                            className="absolute -top-2 -right-2 w-6 h-6 rounded-full border border-white shadow-md"
                          />
                        )}
                      </div>
                    )}

                    <div className="ml-4 flex-1 min-w-0">
                      {idField && (
                        <p className="text-xs text-gray-400 mb-0.5">
                          ID: {item?.[idField]}
                        </p>
                      )}
                      {headingField && (
                        <h2 className="text-base font-medium text-gray-900 line-clamp-2">
                          {item?.[headingField]}
                        </h2>
                      )}
                      {subHeadingField && isValidValue(item[subHeadingField]) && (
                        <p className="text-sm text-gray-500 line-clamp-3">
                          {item[subHeadingField]}
                        </p>
                      )}
                      {subHeadingField1 &&
                        isValidValue(item[subHeadingField1]) && (
                          <p className="text-sm text-gray-500 truncate">
                            {item[subHeadingField1]}
                          </p>
                        )}
                      {subHeadingField2 &&
                        isValidValue(item[subHeadingField2]) && (
                          <p className="text-sm text-gray-500 truncate">
                            {item[subHeadingField2]}
                          </p>
                        )}
                      {subHeadingField3 &&
                        isValidValue(item[subHeadingField3]) && (
                          <p className="text-sm text-gray-500 truncate">
                            {item[subHeadingField3]}
                          </p>
                        )}
                    </div>

                    <ChevronRight className="h-5 w-5 text-gray-400" />
                  </div>

                  {dataFields.length > 0 && (
                    <div className="mt-2 flex space-x-2">
                      {dataFields.map(
                        (field) =>
                          isValidValue(item[field]) &&
                          renderFieldAction(item[field], field)
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div ref={observerRef} className="h-10" />
          {isFetching && data.length > 0 && (
            <div className="flex justify-center py-4">
              <svg
                className="animate-spin h-6 w-6 text-gray-600"
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
            </div>
          )}
        </>
      )}
    </div>
  );
}
