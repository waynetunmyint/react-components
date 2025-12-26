"use client";
import React, { useEffect, useRef, useState } from "react";
import { BASE_URL, IMAGE_URL } from "../../config";

interface Props {
  dataSource: string;
  imageField?: string;
  headingField?: string;
  subHeadingField?: string;
  idField?: string;
  defaultImage?: string;
}

export function UniversalSlimList({
  dataSource,
  imageField,
  headingField,
  subHeadingField,
  idField,
  defaultImage = "logo.png",
}: Props) {
  const [data, setData] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [isFetching, setIsFetching] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const observerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setData([]);
    setPage(1);
    setHasMore(true);
    fetchData(1);
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

  async function fetchData(pageNo: number) {
    try {
      setIsFetching(true);
      const res = await fetch(`${BASE_URL}/${dataSource}/api/byPage/${pageNo}`);
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
    }
  }

  function handleView(item: any) {
    window.location.href = item?.URL;
    //history.push(item?.URL || "#");
  }

  return (
    <div className="w-full max-w-md mx-auto mt-4">
      <div className="space-y-1">
        {data.length === 0 && isFetching
          ? Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center p-2 space-x-3 bg-gray-200 rounded animate-pulse"
              >
                {imageField && <div className="w-10 h-10 bg-gray-300 rounded-full" />}
                <div className="flex-1 space-y-1">
                  <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-2 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
            ))
          : data.map((item, index) => {
              const imageSrc = item?.[imageField]
                ? `${IMAGE_URL}/uploads/${item[imageField]}`
                : `${IMAGE_URL}/uploads/${defaultImage}`;

              return (
                <div
                  key={index}
                  onClick={() => handleView(item)}
                  className="flex items-center p-2 space-x-3 rounded hover:bg-gray-100 cursor-pointer transition"
                >
                  {imageField && (
                    <img
                      src={imageSrc}
                      alt={item?.[headingField] || "Image"}
                      className="w-10 h-10 rounded-lg object-cover border border-gray-300"
                    />
                  )}
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800 line-clamp-1">
                      {item?.[headingField]}
                    </p>
                    {subHeadingField && (
                      <p className="text-xs text-gray-500 line-clamp-1">{item?.[subHeadingField]}</p>
                    )}
                    {idField && <p className="text-xs text-gray-400">ID: {item?.[idField]}</p>}
                  </div>
                </div>
              );
            })}
      </div>

      {/* Infinite scroll sentinel */}
      <div ref={observerRef} className="h-4" />
    </div>
  );
}
