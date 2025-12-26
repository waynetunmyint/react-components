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

export function UniversalGridSearchComp({
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
  const [search, setSearch] = useState("");

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
    if (!observerRef.current || !hasMore || isFetching || search) return;

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
  }, [isFetching, page, hasMore, search]);

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

  async function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!search.trim()) {
      setPage(1);
      setData([]);
      setHasMore(true);
      fetchData(1);
      return;
    }

    try {
      setIsFetching(true);
      const res = await fetch(`${BASE_URL}/${dataSource}/api`);
      if (!res.ok) throw new Error("Failed to fetch data");
      const allData = await res.json();

      const filtered = allData.filter((item: any) => {
        const searchLower = search.toLowerCase();
        return (
          (item?.[headingField || ""] || "")
            .toString()
            .toLowerCase()
            .includes(searchLower) ||
          (item?.[subHeadingField || ""] || "")
            .toString()
            .toLowerCase()
            .includes(searchLower) ||
          (item?.[subHeadingField1 || ""] || "")
            .toString()
            .toLowerCase()
            .includes(searchLower) ||
          (item?.[categoryNameField] || "")
            .toString()
            .toLowerCase()
            .includes(searchLower)
        );
      });

      setData(filtered);
      setHasMore(false); // disable infinite scroll while searching
    } catch (err) {
      console.error(err);
    } finally {
      setIsFetching(false);
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
      className="min-h-screen bg-gray-100"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Search Bar */}
      <form
        onSubmit={handleSearchSubmit}
        className="p-3 bg-white border-b border-gray-200 sticky top-0 z-10"
      >
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500"
          />
      </form>

      {/* Refresh indicator */}
      {isRefreshing && (
        <div className="flex justify-center items-center py-3 text-sm text-gray-500">
          <div className="animate-spin h-4 w-4 border-2 border-gray-400 border-t-transparent rounded-full mr-2"></div>
          Refreshing...
        </div>
      )}

      {/* Grid */}
      <div className="p-2 grid bg-gray-100 gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4">
        {data.map((item, index) => {
          const imageSrc =
            imageField && item?.[imageField]
              ? `${IMAGE_URL}/uploads/${item[imageField]}`
              : `${IMAGE_URL}/uploads/${defaultImage}`;

          return (
            <div
              key={index}
              onClick={() => handleView(item)}
              className="bg-white rounded-t-xl border border-gray-200 shadow-sm hover:shadow-md transition cursor-pointer overflow-hidden"
            >
              {/* Image */}
              {imageField && (
                <img
                  src={imageSrc}
                  alt={headingField ? item?.[headingField] : "Image"}
                  className="w-full aspect-square object-cover rounded-t-2xl"
                />
              )}

              {/* Content */}
              <div className="p-3">
                {idField && (
                  <p className="text-[11px] text-gray-400 mb-1">
                    ID: {item?.[idField]}
                  </p>
                )}
                {headingField && (
                  <>
                    <p className="font-medium text-gray-500">
                      {item?.[categoryNameField]}
                    </p>
                    <h2 className="font-bold text-gray-800 line-clamp-2 mt-1">
                      {item?.[headingField]}
                    </h2>
                    {subHeadingField && (
                      <p className="text-xs text-gray-500 line-clamp-2 mt-1">
                        {item?.[subHeadingField]}
                      </p>
                    )}
                    {subHeadingField1 && (
                      <p className="text-xs text-gray-500 mt-1">
                        {item?.[subHeadingField1]}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Infinite scroll sentinel */}
      {!search && <div ref={observerRef} className="w-full h-1" />}

      {/* Skeleton Loader */}
      {isFetching && data.length === 0 && (
        <div className="grid bg-gray-100 gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 animate-pulse">
          {Array.from({ length: 20 }).map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden"
            >
              <div className="w-full aspect-square bg-gray-200 rounded-t-2xl" />
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
