"use client";
import React, { useEffect, useRef, useState } from "react";
import { BASE_URL, IMAGE_URL } from "../../config";
import { DollarSign, User } from "lucide-react";

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

export function UniversalChatGroupGridComp({
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

  const observerRef = useRef<HTMLDivElement | null>(null);

  // touch tracking for pull to refresh
  const touchStartY = useRef(0);
  const touchMoveY = useRef(0);

  useEffect(() => {
    setData([]);
    setPage(1);
    setHasMore(true);
    fetchData(1);
  }, [dataSource, customAPI]);

  // ✅ Infinite scroll observer
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
        res = await fetch(`${BASE_URL}${customAPI}`);
      } else {
        res = await fetch(`${BASE_URL}/${dataSource}/api/byPage/${pageNo}`);
      }

      if (!res.ok) throw new Error("Failed to fetch data");
      const newData = await res.json();

      console.log("Chat Groups Information", newData);
      
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
    localStorage.setItem("StoredItem", JSON.stringify(item));
    window.location.href = `/${dataSource}/view/${item?.Id}`;
  }

  // ✅ Pull down refresh (only at top of page)
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
      className=" min-h-screen"
    >
      {/* Refresh indicator */}
      {isRefreshing && (
        <div className="flex justify-center items-center py-3 text-sm text-gray-500">
          <div className="animate-spin h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full mr-2"></div>
          Refreshing...
        </div>
      )}

      {/* Grid */}
      <div className="p-3 grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-8">
        {data.map((item, index) => {
          const imageSrc =
            imageField && item?.[imageField]
              ? `${IMAGE_URL}/uploads/${item[imageField]}`
              : `${IMAGE_URL}/uploads/${defaultImage}`;

          return (
            <div
              key={index}
              onClick={() => handleView(item)}
              className="bg-white relative rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:scale-[1.02] transition-all cursor-pointer overflow-hidden"
            >
              {/* Image */}
              {imageField && (
                <img
                  src={imageSrc}
                  alt={headingField ? item?.[headingField] : "Image"}
                  className="w-full aspect-square object-cover rounded-t-2xl"
                />
              )}
<div className="absolute top-5 left-5 flex items-center gap-1 text-yellow-500">
  <User size={16} /> {item?.MemberCount}
</div>
<div className="absolute top-5 right-5 flex items-center gap-1 text-yellow-500">
  <DollarSign size={16} /> {item?.Price}
</div>
            </div>
          );
        })}
      </div>

      {/* Infinite scroll sentinel */}
      <div ref={observerRef} className="w-full h-1" />

      {/* Skeleton Loader */}
      {isFetching && data.length === 0 && (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 animate-pulse p-3">
          {Array.from({ length: 12 }).map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-sm overflow-hidden"
            >
              <div className="w-full aspect-square bg-gray-200" />
              <div className="p-3 space-y-2">
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
