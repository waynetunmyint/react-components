import React, { useEffect, useRef, useState } from "react";
import { BASE_URL, IMAGE_URL } from "../../config";

interface SimpleListProps {
  dataSource: string;
  imageField?: string;
  headingField?: string;
  subHeadingField?:string;
  idField?: string;
  defaultImage?: string;
}

export  function UniversalSimpleList({
  dataSource,
  imageField,
  headingField,
  subHeadingField,
  idField,
  defaultImage = "logo.png",
}: SimpleListProps) {
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

  function handleView(item:any){
    window.location.href=item?.URL;
  //istory.push(item?.URL);
  }

  return (
    <div className="overflow-x-auto mt-6">
<div className="space-y-4 mt-6">
  {data.map((item, index) => {
    const imageSrc = item?.[imageField]
      ? `${IMAGE_URL}/uploads/${item[imageField]}`
      : `${IMAGE_URL}/uploads/${defaultImage}`;

    return (
      <div
        key={index}
        onClick={()=>handleView(item)}
        className="flex items-center bg-white rounded shadow p-4 hover:bg-gray-100 cursor-pointer"
      >
        {/* Image: 1/4 width */}
        {imageField && (
          <div className="flex-shrink-0 w-1/10">
            <img
              src={imageSrc}
              alt={item?.[headingField] || "Image"}
              className="w-[100px] aspect-square object-cover rounded border border-gray-300"
            />
          </div>
        )}

        {/* Heading: 3/4 width */}
        <div className="ml-4 w-9/10 justify-start">
          {idField && (
            <p className="text-sm text-gray-500 mb-1">ID: {item?.[idField]}</p>
          )}
          {headingField && (
            <>
            <h2 className="text-lg font-semibold text-gray-800">
              {item?.[headingField]}
            </h2>
            <p className=" text-gray-500 line-clamp-3">{item?.[subHeadingField]}</p>
            </>
          )}
        </div>
      </div>
    );
  })}
</div>

      <div ref={observerRef} className="h-10" />
      {isFetching && (
        <div className="flex justify-center py-4">
          <svg className="animate-spin h-6 w-6 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
          </svg>
        </div>
      )}
    </div>
  );
}