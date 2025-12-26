"use client";
import React, { useEffect, useRef, useState } from "react";
import { Eye, Calendar, Tag, ChevronLeft, ChevronRight } from "lucide-react";
import { BASE_URL, IMAGE_URL } from "../../config";


interface Props {
  dataSource: string;
  customAPI?: string;
  headingTitle: string;
  subHeadingTitle: string;
}

export function ProductScrollGridComp({
  dataSource,
  customAPI,
  headingTitle,
  subHeadingTitle
}: Props) {
  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [isFetching, setIsFetching] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const observerRef = useRef<HTMLDivElement | null>(null);
  const fetchingRef = useRef(false);

  useEffect(() => {
    setData([]);
    setPage(1);
    setHasMore(true);
    fetchData(1);
  }, [dataSource, customAPI]);

  useEffect(() => {
    const target = observerRef.current;
    if (!target || !hasMore || fetchingRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !fetchingRef.current && hasMore) {
          fetchData(page + 1);
        }
      },
      { threshold: 0.1, rootMargin: '200px' }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [page, hasMore]);

  async function fetchData(pageNo: number) {
    if (fetchingRef.current) return;
    fetchingRef.current = true;
    setIsFetching(true);

    try {
      let res;
      if (customAPI) {
        res = await fetch(`${BASE_URL}/${customAPI}`, { cache: "no-store" });
      } else {
        res = await fetch(`${BASE_URL}/${dataSource}/api/byPage/${pageNo}`, { cache: "no-store" });
      }

      if (!res.ok) throw new Error("Failed to fetch data");
      const newData = await res.json();
      
      if (!Array.isArray(newData) || newData.length === 0) {
        setHasMore(false);
        return;
      }

      setData((prev) => {
        if (pageNo === 1) return newData;
        const existingIds = new Set(prev.map(item => item?.Id));
        const uniqueNewData = newData.filter(item => !existingIds.has(item?.Id));
        if (uniqueNewData.length === 0) setHasMore(false);
        return [...prev, ...uniqueNewData];
      });
      
      setPage(pageNo);
    } catch (err) {
      console.error(err);
      setHasMore(false);
    } finally {
      fetchingRef.current = false;
      setIsFetching(false);
    }
  }

  function handleView(item: any) {
    const storedItem = JSON.stringify(item);
    sessionStorage.setItem("StoredItem", storedItem);
    window.location.href = `/${dataSource}/view/${item?.Id}`;
  }

  const nextFeatured = () => {
    setFeaturedIndex((prev) => (prev + 1) % Math.min(data.length, 5));
  };

  const prevFeatured = () => {
    setFeaturedIndex((prev) => (prev - 1 + Math.min(data.length, 5)) % Math.min(data.length, 5));
  };

  const featuredItems = data.slice(0, 5);
  const gridItems = data.slice(5);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">


                <div className="text-center mb-16 relative max-w-4xl mx-auto">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-gradient-to-r from-orange-400/10 to-red-400/10 rounded-full blur-3xl -z-10" />
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            {headingTitle}
          </h2>
          
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            {subHeadingTitle}
          </p>
        </div>


      {/* Hero Featured Section - 1/2-1-1/2 Layout */}
      {featuredItems.length > 0 && (
        <section className="relative h-screen flex items-center overflow-hidden bg-white">
          {/* Left Side Preview (1/2) */}
          <div className="hidden lg:flex w-1/4 h-full items-center justify-center p-8 relative group cursor-pointer" onClick={prevFeatured}>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent to-gray-100 opacity-50" />
            {featuredItems[(featuredIndex - 1 + featuredItems.length) % featuredItems.length] && (
              <div className="relative w-full aspect-square max-w-sm transition-transform duration-500 group-hover:scale-105">
                <img
                  src={featuredItems[(featuredIndex - 1 + featuredItems.length) % featuredItems.length]?.Thumbnail 
                    ? `${IMAGE_URL}/uploads/${featuredItems[(featuredIndex - 1 + featuredItems.length) % featuredItems.length].Thumbnail}`
                    : `${IMAGE_URL}/uploads/logo.png`}
                  alt="Previous"
                  className="w-full h-full object-contain opacity-40 group-hover:opacity-70 transition-opacity duration-300"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronLeft className="text-gray-900" size={24} />
                </div>
              </div>
            )}
          </div>

          {/* Center Main Display (1) */}
          <div className="flex-1 h-full flex flex-col items-center justify-center px-4 md:px-12 relative">
            {/* Main Image - Fixed Size */}
            <div className="w-full max-w-2xl aspect-square flex items-center justify-center relative mb-8">
              <img
                src={featuredItems[featuredIndex]?.Thumbnail 
                  ? `${IMAGE_URL}/uploads/${featuredItems[featuredIndex].Thumbnail}`
                  : `${IMAGE_URL}/uploads/logo.png`}
                alt={featuredItems[featuredIndex]?.Title || "Featured"}
                className="w-full h-full object-contain drop-shadow-2xl transition-all duration-500"
              />
            </div>

            {/* Content - Only for Active Item */}
            <div className="text-center max-w-2xl">
              {/* Title - Animated */}
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 tracking-tight animate-fadeIn">
                {featuredItems[featuredIndex]?.Title || "Featured Item"}
              </h1>

              {/* Description - Animated */}
              <p className="text-sm md:text-base text-gray-600 mb-6 leading-relaxed line-clamp-2 animate-fadeIn">
                {featuredItems[featuredIndex]?.Description || "Discover amazing products"}
              </p>

              <button
                onClick={() => handleView(featuredItems[featuredIndex])}
                className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-semibold rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg uppercase tracking-wide text-sm"
              >
                LEARN MORE
              </button>

              {/* Dots Indicator */}
              {featuredItems.length > 1 && (
                <div className="flex justify-center gap-2 mt-8">
                  {featuredItems.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setFeaturedIndex(idx)}
                      className={`h-1 rounded-full transition-all duration-300 ${
                        idx === featuredIndex ? 'w-8 bg-gray-900' : 'w-1 bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Side Preview (1/2) */}
          <div className="hidden lg:flex w-1/4 h-full items-center justify-center p-8 relative group cursor-pointer" onClick={nextFeatured}>
            <div className="absolute inset-0 bg-gradient-to-l from-transparent to-gray-100 opacity-50" />
            {featuredItems[(featuredIndex + 1) % featuredItems.length] && (
              <div className="relative w-full aspect-square max-w-sm transition-transform duration-500 group-hover:scale-105">
                <img
                  src={featuredItems[(featuredIndex + 1) % featuredItems.length]?.Thumbnail 
                    ? `${IMAGE_URL}/uploads/${featuredItems[(featuredIndex + 1) % featuredItems.length].Thumbnail}`
                    : `${IMAGE_URL}/uploads/logo.png`}
                  alt="Next"
                  className="w-full h-full object-contain opacity-40 group-hover:opacity-70 transition-opacity duration-300"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <ChevronRight className="text-gray-900" size={24} />
                </div>
              </div>
            )}
          </div>

          {/* Mobile Navigation Arrows */}
          {featuredItems.length > 1 && (
            <div className="lg:hidden">
              <button
                onClick={prevFeatured}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-50 transition-all"
              >
                <ChevronLeft className="text-gray-900" size={20} />
              </button>
              <button
                onClick={nextFeatured}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center hover:bg-gray-50 transition-all"
              >
                <ChevronRight className="text-gray-900" size={20} />
              </button>
            </div>
          )}
        </section>
      )}

      {/* Heading Section */}
      <div className="py-20 px-4">

        {/* Grid Section */}
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {gridItems.map((item, index) => {
              const imageSrc = item?.Thumbnail
                ? `${IMAGE_URL}/uploads/${item.Thumbnail}`
                : `${IMAGE_URL}/uploads/logo.png`;

              return (
                <div
                  key={index}
                  onClick={() => handleView(item)}
                  className="group bg-white rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-500 cursor-pointer border border-gray-100 hover:border-orange-200 transform hover:-translate-y-2"
                >
                  {/* Image Container */}
                  <div className="relative w-full aspect-square overflow-hidden bg-gray-100">
                    <img
                      src={imageSrc}
                      alt={item?.Title || "Image"}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      loading="lazy"
                    />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                    {item?.CategoryName && (
                      <div className="absolute top-3 left-3 z-10">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-white bg-gradient-to-r from-orange-500 to-red-500 px-3 py-1.5 rounded-full shadow-lg">
                          <Tag size={12} />
                          {item.CategoryName}
                        </div>
                      </div>
                    )}

                    <div className="absolute bottom-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
                        <Eye size={18} className="text-orange-500" />
                      </div>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    {item?.Title && (
                      <h3 className="font-bold text-base text-gray-900 line-clamp-2 leading-snug mb-2 group-hover:text-orange-500 transition-colors">
                        {item.Title}
                      </h3>
                    )}

                    {item?.Description && (
                      <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed mb-3">
                        {item.Description}
                      </p>
                    )}

                    {item?.CreatedAt && (
                      <div className="flex items-center gap-2 text-xs text-gray-500 font-medium pt-3 border-t border-gray-100">
                        <Calendar size={12} />
                        {new Date(item.CreatedAt).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Loading Indicator */}
      {hasMore && !isFetching && <div ref={observerRef} className="h-10" />}

      {isFetching && data.length > 0 && (
        <div className="flex justify-center items-center py-16">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-3 h-3 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      )}

      {/* Skeleton Loader */}
      {isFetching && data.length === 0 && (
        <div className="max-w-7xl mx-auto px-4 py-20">
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100">
                <div className="w-full aspect-square bg-gray-200 animate-pulse" />
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-4/5 animate-pulse" />
                  <div className="h-3 bg-gray-200 rounded w-full animate-pulse" />
                  <div className="h-3 bg-gray-200 rounded w-3/4 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!isFetching && data.length === 0 && (
        <div className="flex flex-col items-center justify-center py-32">
          <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-6">
            <span className="text-5xl">📦</span>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">No Items Found</h3>
          <p className="text-gray-500">Check back later for new content!</p>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}