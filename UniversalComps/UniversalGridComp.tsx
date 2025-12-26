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

export function UniversalGridComp({
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
    // Store in memory instead of localStorage
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
    if (distance > 80 && !isRefreshing && window.scrollY === 0) {
      fetchData(1, true);
    }
    touchStartY.current = 0;
    touchMoveY.current = 0;
    setPullDistance(0);
  }

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="min-h-screen to-white"
    >
      {/* Pull to Refresh Indicator - iOS Style */}
      <div 
        className="flex justify-center items-center transition-all duration-200 ease-out overflow-hidden"
        style={{ 
          height: isRefreshing ? '60px' : `${pullDistance}px`,
          opacity: isRefreshing ? 1 : pullDistance / 100
        }}
      >
        <div className="flex flex-col items-center">
          <div 
            className={`w-6 h-6 border-2 border-gray-300 rounded-full ${
              isRefreshing ? 'border-t-blue-500 animate-spin' : ''
            }`}
            style={{
              transform: `rotate(${pullDistance * 3.6}deg)`,
            }}
          />
          {isRefreshing && (
            <p className="text-xs text-gray-500 mt-2 animate-pulse">Refreshing...</p>
          )}
        </div>
      </div>

      {/* Grid Container */}
      <div className="px-4 py-3">
        <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {data.map((item, index) => {
            const imageSrc =
              imageField && item?.[imageField]
                ? `${IMAGE_URL}/uploads/${item[imageField]}`
                : `${IMAGE_URL}/uploads/${defaultImage}`;

            return (
              <div
                key={index}
                onClick={() => handleView(item)}
                className="group bg-white rounded-3xl overflow-hidden active:scale-95 transition-all duration-200 ease-out cursor-pointer"
                style={{
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 2px rgba(0, 0, 0, 0.06)',
                }}
              >
                {/* Image Container */}
                {imageField && (
                  <div className="relative w-full aspect-square overflow-hidden bg-gray-100">
                    <img
                      src={imageSrc}
                      alt={headingField ? item?.[headingField] : "Image"}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                    
                    {/* Category Badge - Floating */}
                    <div className="absolute top-2 left-2">
                      <span className="text-[10px] font-semibold text-white bg-black/30 backdrop-blur-md px-2.5 py-1 rounded-full">
                        {item?.[categoryNameField]}
                      </span>
                    </div>

                    {/* ID Badge - Top Right */}
                    {idField && (
                      <div className="absolute top-2 right-2">
                        <span className="text-[9px] font-medium text-white bg-black/30 backdrop-blur-md px-2 py-0.5 rounded-full">
                          #{item?.[idField]}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {/* Content */}
                <div className="p-3">
                  {headingField && (
                    <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 leading-snug mb-1">
                      {item?.[headingField]}
                    </h3>
                  )}

                  {subHeadingField && (
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                      {item?.[subHeadingField]}
                    </p>
                  )}

                  {subHeadingField1 && (
                    <p className="text-[10px] text-gray-400 mt-1.5 font-medium">
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

      {/* Loading More Indicator */}
      {isFetching && data.length > 0 && (
        <div className="flex justify-center items-center py-8">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      )}

      {/* Skeleton Loader - iOS Style */}
      {isFetching && data.length === 0 && (
        <div className="px-4 py-3">
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {Array.from({ length: 12 }).map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-3xl overflow-hidden animate-pulse"
                style={{
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
                }}
              >
                <div className="w-full aspect-square bg-gray-200" />
                <div className="p-3 space-y-2">
                  <div className="h-3 bg-gray-200 rounded-full w-3/4"></div>
                  <div className="h-2.5 bg-gray-200 rounded-full w-full"></div>
                  <div className="h-2.5 bg-gray-200 rounded-full w-5/6"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* End of Results */}
      {!hasMore && data.length > 0 && (
        <div className="flex justify-center items-center py-8">
          <p className="text-xs text-gray-400 font-medium">No more items to load</p>
        </div>
      )}
    </div>
  );
}