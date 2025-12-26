"use client";
import React, { useEffect, useRef, useState } from "react";
import { Eye, TrendingUp, Calendar, Tag } from "lucide-react";
import { APP_TEXT_COLOR, APP_TEXT_SECONDARY_COLOR, BASE_URL, IMAGE_URL } from "../../config";

interface Props {
  dataSource: string;
  customAPI?: string;
  headingTitle:string;
  subHeadingTitle:string;
}

export function GridScrollComp({
  dataSource,
  customAPI,
  headingTitle,subHeadingTitle
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
  const fetchingRef = useRef(false);
  const [allDataLoaded, setAllDataLoaded] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setData([]);
    setPage(1);
    setHasMore(true);
    fetchData(1);
  }, [dataSource, customAPI]);

  useEffect(() => {
    const target = observerRef.current;
    if (!target) return;
    if (!hasMore) return;
    if (fetchingRef.current) return;
    if (allDataLoaded) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry.isIntersecting) return;
        if (fetchingRef.current) return;
        if (!hasMore || allDataLoaded) return;
        
        fetchData(page + 1);
      },
      { 
        threshold: 0.1,
        rootMargin: '200px'
      }
    );

    observer.observe(target);
    return () => {
      observer.disconnect();
    };
  }, [page, hasMore, allDataLoaded]);

  async function fetchData(pageNo: number, isRefresh = false) {
    try {
      // Prevent concurrent fetches
      if (fetchingRef.current) return;
      fetchingRef.current = true;
      
      if (isRefresh) {
        setIsRefreshing(true);
      } else {
        setIsFetching(true);
      }

      let res;
      if (customAPI) {
        res = await fetch(`${BASE_URL}/${customAPI}`, { cache: "no-store" });
      } else {
        res = await fetch(`${BASE_URL}/${dataSource}/api/byPage/${pageNo}`, { cache: "no-store" });
      }

      if (!res.ok) throw new Error("Failed to fetch data");
      const newData = await res.json();
      if (!Array.isArray(newData)) throw new Error("Data is not iterable");

      // Check if we got any data
      if (newData.length === 0) {
        setHasMore(false);
        setFetching(false);
        setIsRefreshing(false);
        fetchingRef.current = false;
        return;
      }

      setData((prev) => {
        // If it's page 1 or refresh, replace all data
        if (pageNo === 1 || isRefresh) {
          return newData;
        }
        
        // For subsequent pages, prevent duplicates based on Id
        const existingIds = new Set(prev.map(item => item?.Id));
        const uniqueNewData = newData.filter(item => !existingIds.has(item?.Id));
        
        // If no unique data, stop loading more
        if (uniqueNewData.length === 0) {
          setHasMore(false);
        }
        
        return [...prev, ...uniqueNewData];
      });
      
      setPage(pageNo);
      setError(null);
    } catch (err) {
      console.error(err);
      const message = err instanceof Error ? err.message : "Error fetching data";
      setError(new Error(message));
      setHasMore(false);
    } finally {
      fetchingRef.current = false;
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
      setPullDistance(Math.min(distance, 120));
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
      className=""
    >
      {/* Pull to Refresh Indicator */}
      <div 
        className="flex justify-center items-center transition-all duration-300 ease-out overflow-hidden"
        style={{ 
          height: isRefreshing ? '80px' : `${pullDistance}px`,
          opacity: isRefreshing ? 1 : Math.min(pullDistance / 100, 1)
        }}
      >
        <div className="flex flex-col items-center gap-2">
          <div className="relative">
            <div 
              className={`w-8 h-8 rounded-full border-3 border-gray-200 ${
                isRefreshing ? 'border-t-blue-600 animate-spin' : 'border-t-blue-500'
              }`}
              style={{
                transform: isRefreshing ? 'none' : `rotate(${pullDistance * 3.6}deg)`,
                transition: isRefreshing ? 'none' : 'transform 0.1s ease-out'
              }}
            />
            {!isRefreshing && pullDistance > 60 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />
              </div>
            )}
          </div>
          {isRefreshing && (
            <p className="text-sm text-gray-600 font-medium animate-pulse">Refreshing...</p>
          )}
          {!isRefreshing && pullDistance > 60 && (
            <p className="text-xs text-gray-500 font-medium">Release to refresh</p>
          )}
        </div>
      </div>


                  <div className="text-center mb-16 relative">
                    {/* Decorative elements */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-gradient-to-r from-blue-400/10 to-purple-400/10 rounded-full blur-3xl -z-10" />
          
                    
                    <h2 className={` text-2xl md:text-5xl lg:text-6xl font-bold  bg-clip-text mb-6 leading-tight`}>
                      {headingTitle}
                    </h2>
                    
                    <p className={`text-lg max-w-3xl mx-auto leading-relaxed`}>
                      {subHeadingTitle}
                    </p>
                  </div>


      {/* Grid Container */}
      <div className="px-4 sm:px-6 py-4">
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">



          {data.map((item, index) => {
            const imageSrc = item?.Thumbnail
              ? `${IMAGE_URL}/uploads/${item.Thumbnail}`
              : `${IMAGE_URL}/uploads/logo.png`;

            return (
              <div
                key={index}
                onClick={() => handleView(item)}
                className="group bg-white rounded-2xl overflow-hidden hover:shadow-xl active:scale-95 transition-all duration-300 ease-out cursor-pointer border border-gray-100 hover:border-blue-200"
              >
                {/* Image Container */}
                <div className="relative w-full aspect-square overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
                  <img
                    src={imageSrc}
                    alt={item?.Title || "Image"}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                  />
                  
                  {/* Gradient Overlay on Hover */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  {/* Category Badge */}
                  {item?.CategoryName && (
                    <div className="absolute top-3 left-3 z-10">
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-white bg-gradient-to-r from-blue-600 to-blue-700 backdrop-blur-lg px-3 py-1.5 rounded-full shadow-lg border border-white/20">
                        <Tag size={12} />
                        <span>{item.CategoryName}</span>
                      </div>
                    </div>
                  )}

                  {/* ID Badge */}
                  {item?.Id && (
                    <div className="absolute top-3 right-3 z-10">
                      <span className="text-[10px] font-bold text-white bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20">
                        #{item.Id}
                      </span>
                    </div>
                  )}

                  {/* Quick View Indicator */}
                  <div className="absolute bottom-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                      <Eye size={16} className="" />
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  {item?.Title && (
                    <h3 className="font-bold text-sm text-gray-900 line-clamp-2 leading-snug mb-2 group-hover: transition-colors">
                      {item.Title}
                    </h3>
                  )}

                  {item?.Description && (
                    <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed mb-2">
                      {item.Description}
                    </p>
                  )}

                  {item?.CreatedAt && (
                    <div className="flex items-center gap-1.5 text-[11px] text-gray-500 font-medium mt-2 pt-2 border-t border-gray-100">
                      <Calendar size={11} />
                      <span>{new Date(item.CreatedAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>

                {/* Hover Border Effect */}
                <div className="absolute inset-0 rounded-2xl ring-2 ring-blue-500 ring-opacity-0 group-hover:ring-opacity-100 transition-all duration-300 pointer-events-none" />
              </div>
            );
          })}
        </div>
      </div>

      {/* Infinite Scroll Sentinel - Only show when we can load more */}
      {hasMore && !allDataLoaded && !isFetching && (
        <div ref={observerRef} className="w-full h-10" />
      )}

      {/* Loading More Indicator */}
      {isFetching && data.length > 0 && (
        <div className="flex justify-center items-center py-10">
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
              <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
              <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
            </div>
            <p className="text-sm text-gray-500 font-medium">Loading more...</p>
          </div>
        </div>
      )}

      {/* Skeleton Loader */}
      {isFetching && data.length === 0 && (
        <div className="px-4 sm:px-6 py-4">
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {Array.from({ length: 12 }).map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm"
              >
                <div className="w-full aspect-square bg-gradient-to-br from-gray-200 to-gray-300 animate-pulse relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" 
                       style={{ 
                         backgroundSize: '200% 100%',
                         animation: 'shimmer 2s infinite'
                       }} 
                  />
                </div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded-full w-4/5 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded-full w-full animate-pulse"></div>
                  <div className="h-3 bg-gray-200 rounded-full w-3/4 animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* End of Results */}
      {!hasMore && data.length > 0 && !isFetching && (
        <div className="pb-8"></div>
      )}

      {/* Empty State */}
      {!isFetching && data.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 px-4">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center">
              <span className="text-4xl">📦</span>
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">No Items Found</h3>
          <p className="text-sm text-gray-500 text-center max-w-sm">
            There are no items available at the moment. Check back later!
          </p>
        </div>
      )}

      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </div>
  );
}