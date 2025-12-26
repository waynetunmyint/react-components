"use client";
import React, { useEffect, useRef, useState } from "react";
import { BASE_URL, IMAGE_URL } from "../../config";

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

export function DirectoryGridComp({
  dataSource,
  imageField,
  categoryNameField,
  headingField,
  subHeadingField,
  subHeadingField1,
  idField,
  defaultImage = "logo.png",
  customAPI,
}: Props) {
  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [isFetching, setIsFetching] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [imageErrors, setImageErrors] = useState<Set<number>>(new Set());

  const observerRef = useRef<HTMLDivElement | null>(null);
  const touchStartY = useRef(0);
  const touchMoveY = useRef(0);

  useEffect(() => {
    setData([]);
    setPage(1);
    setHasMore(true);
    setImageErrors(new Set());
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

      let res;
      if (customAPI) {
        res = await fetch(`${BASE_URL}/${customAPI}`);
      } else {
        res = await fetch(`${BASE_URL}/${dataSource}/api/byPage/${pageNo}`);
      }

      if (!res.ok) throw new Error("Failed to fetch data");
      const newData = await res.json();
      if (!Array.isArray(newData)) throw new Error("Data is not iterable");

      setData((prev) => (pageNo === 1 ? newData : [...prev, ...newData]));
      setPage(pageNo);
      if (newData.length === 0) setHasMore(false);
    } catch (err) {
      console.error(err);
      setHasMore(false);
    } finally {
      setIsFetching(false);
      setIsRefreshing(false);
    }
  }

  function handleView(item: any) {
    const storedItem = JSON.stringify(item);
    sessionStorage.setItem("StoredItem", storedItem);
    window.location.href = `/${dataSource}/view/${item?.Id}`;
  }

  function handleTouchStart(e: React.TouchEvent) {
    touchStartY.current = e.touches[0].clientY;
  }

  function handleTouchMove(e: React.TouchEvent) {
    touchMoveY.current = e.touches[0].clientY;
    const distance = touchMoveY.current - touchStartY.current;
    if (distance > 0 && window.scrollY === 0 && !isRefreshing) {
      setPullDistance(Math.min(distance, 100));
    }
  }

  function handleTouchEnd() {
    const distance = touchMoveY.current - touchStartY.current;
    if (distance > 70 && !isRefreshing && window.scrollY === 0) {
      fetchData(1, true);
    }
    touchStartY.current = 0;
    touchMoveY.current = 0;
    setPullDistance(0);
  }

  function handleImageError(index: number) {
    setImageErrors((prev) => new Set(prev).add(index));
  }

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="min-h-screen bg-gradient-to-br"
      style={{
        fontFamily:
          '-apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", system-ui, sans-serif',
        WebkitFontSmoothing: "antialiased",
      }}
    >
      {/* Pull to Refresh - Enhanced */}
      <div
        className="flex justify-center items-center overflow-hidden"
        style={{
          height: isRefreshing ? "60px" : `${pullDistance * 0.6}px`,
          opacity: isRefreshing ? 1 : Math.min(pullDistance / 80, 1),
          transition: isRefreshing ? "all 0.3s ease" : "none",
        }}
      >
        <div className="flex flex-col items-center">
          {isRefreshing ? (
            <div className="relative w-7 h-7">
              <svg className="animate-spin" viewBox="0 0 24 24">
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray="50"
                  strokeDashoffset="15"
                />
              </svg>
            </div>
          ) : (
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              style={{
                transform: `rotate(${Math.min(pullDistance * 1.8, 180)}deg)`,
                transition: "transform 0.1s ease-out",
              }}
            >
              <path
                d="M12 4 L12 16 M12 16 L8 12 M12 16 L16 12"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
          {isRefreshing && (
            <span className="text-sm font-medium  mt-2">
              Refreshing...
            </span>
          )}
        </div>
      </div>

      {/* Grid Container - Enhanced */}
      <div className="px-4 py-4">
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {data.map((item, index) => {
            const imageSrc =
              imageField && item?.[imageField] && !imageErrors.has(index)
                ? `${IMAGE_URL}/uploads/${item[imageField]}`
                : `${IMAGE_URL}/uploads/${defaultImage}`;

            return (
              <div
                key={index}
                onClick={() => handleView(item)}
                className="group bg-white rounded-2xl overflow-hidden cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl active:scale-95"
                style={{
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)",
                }}
              >
                {/* Image Container */}
                {imageField && (
                  <div className="relative w-full aspect-square overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                    <img
                      src={imageSrc}
                      alt={headingField ? item?.[headingField] : "Image"}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                      onError={() => handleImageError(index)}
                    />

                    {/* Gradient Overlay on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {/* Category Badge - Enhanced */}
                    <div className="absolute text-center top-3 left-3">
                      <p
                        className="text-xs font-bold text-white px-3 py-1.5  text-center rounded-full shadow-lg"
                        style={{
                          backgroundColor: "rgba(59, 130, 246, 0.9)",
                          backdropFilter: "blur(12px)",
                          WebkitBackdropFilter: "blur(12px)",
                          letterSpacing: "0.02em",
                        }}
                      >
                        {item?.[categoryNameField]}
                      </p>
                    </div>

                    {/* ID Badge - Enhanced */}
                    {idField && (
                      <div className="absolute top-3 right-3">
                        <span
                          className="text-xs font-bold text-white px-2.5 py-1 rounded-full shadow-md"
                          style={{
                            backgroundColor: "rgba(0, 0, 0, 0.6)",
                            backdropFilter: "blur(12px)",
                            WebkitBackdropFilter: "blur(12px)",
                          }}
                        >
                          #{item?.[idField]}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Content - Enhanced Typography */}
                <div className="p-4  text-center">
                  {headingField && (
                    <h3 className="font-bold text-base text-gray-900 line-clamp-2 leading-snug mb-2 group-hover: transition-colors">
                      {item?.[headingField]}
                    </h3>
                  )}

                  {subHeadingField && (
                    <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed mb-1.5">
                      {item?.[subHeadingField]}
                    </p>
                  )}

                  {subHeadingField1 && (
                    <p className="text-xs text-gray-500 font-medium mt-2 truncate">
                      {item?.[subHeadingField1]}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Infinite Scroll Sentinel */}
      <div ref={observerRef} className="w-full h-1" />

      {/* Loading More - Enhanced */}
      {isFetching && data.length > 0 && (
        <div className="flex justify-center items-center py-10">
          <div className="flex items-center gap-3 bg-white px-6 py-3 rounded-full shadow-lg border border-gray-200">
            <svg className="animate-spin" width="20" height="20" viewBox="0 0 20 20">
              <circle
                cx="10"
                cy="10"
                r="8"
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray="40"
                strokeDashoffset="10"
              />
            </svg>
            <span className="text-sm font-medium text-gray-700">
              Loading more...
            </span>
          </div>
        </div>
      )}

      {/* Skeleton Loader - Enhanced */}
      {isFetching && data.length === 0 && (
        <div className="px-4 py-4">
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {Array.from({ length: 12 }).map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl overflow-hidden"
                style={{ boxShadow: "0 2px 8px rgba(0, 0, 0, 0.08)" }}
              >
                <div className="w-full aspect-square bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded-lg w-3/4 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded-lg w-full animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded-lg w-5/6 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded-lg w-2/3 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* End of Results - Enhanced */}
      {!hasMore && data.length > 0 && (
        <div className="flex justify-center items-center py-10">
          <div className="bg-white px-6 py-3 rounded-full shadow-md border border-gray-200">
            <p className="text-sm text-gray-600 font-medium">
              You've reached the end
            </p>
          </div>
        </div>
      )}

      {/* Empty State - Enhanced */}
      {!isFetching && data.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 px-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center mb-5 shadow-md">
            <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
              <path
                d="M10 10h16M10 18h16M10 26h10"
                stroke="#3b82f6"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            No Items Found
          </h3>
          <p className="text-base text-gray-500 text-center max-w-sm leading-relaxed">
            There are currently no items to display. Check back later!
          </p>
        </div>
      )}
    </div>
  );
}