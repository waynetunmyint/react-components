"use client";
import React, { useEffect, useRef, useState } from "react";
import { BASE_URL, IMAGE_URL } from "../../config";
import DirectoryPageInfoComp from "./DirectoryPageInfoComp";

interface Props {
    dataSource: string;
    imageField?: string;
    categoryNameField?: string;
    headingField?: string;
    subHeadingField?: string;
    subHeadingField1?: string;
    idField?: string;
    defaultImage?: string;
    customAPI?: string;
}

export function DirectoryCardComp({
    dataSource,
    imageField,
    headingField,
    idField,
    defaultImage = "logo.png",
    customAPI
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
    }, [dataSource, customAPI]);

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
        }
    }

    function handleView(item: any) {
        localStorage.setItem("StoredItem", JSON.stringify(item));
        window.location.href = `/${dataSource}/view/${item?.Id}`;
    }

    // Skeleton component
    const SkeletonCard = () => (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition cursor-pointer overflow-hidden animate-pulse">
        {/* Image placeholder */}
        <div className="w-full h-40 bg-gray-200" />

        {/* Text placeholder */}
        <div className="p-3 space-y-2">
        <div className="h-5 bg-gray-300 rounded w-3/4"></div>
        <div className="h-4 bg-gray-300 rounded w-full"></div>
        <div className="h-4 bg-gray-300 rounded w-1/2"></div>
        </div>
    </div>
    );


    return (
        <>
            <div className="bg-gray-100 min-h-screen grid gap-4 grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4  2xl:grid-cols-5 p-2">
                {data.length > 0
                    ? data.map((item, index) => {
                        const imageSrc =
                            imageField && item?.[imageField]
                                ? `${IMAGE_URL}/uploads/${item[imageField]}`
                                : `${IMAGE_URL}/uploads/${defaultImage}`;

                        return (
                            <div
                                key={index}
                                className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition cursor-pointer overflow-hidden"
                            >
                                <DirectoryPageInfoComp selectedItem={item} />
                                <div>
                                    {idField && (
                                        <p
                                            className="text-[11px] text-gray-400 mb-1"
                                            onClick={() => handleView(item)}
                                        >
                                            ID: {item?.[idField]}
                                        </p>
                                    )}
                                    {headingField && (
                                        <p
                                            className="text-start font-medium text-gray-500 p-2"
                                            onClick={() => handleView(item)}
                                        >
                                            {item?.[headingField]}
                                        </p>
                                    )}
                                    {imageField && (
                                        <img
                                            alt=""
                                            src={imageSrc}
                                            className="w-full object-bottom"
                                            onClick={() => handleView(item)}
                                        />
                                    )}
                                </div>
                            </div>
                        );
                    })
                    : null}

                {/* Show skeletons while fetching */}
                {isFetching &&
                    Array.from({ length: 30 }).map((_, idx) => <SkeletonCard key={idx} />)}
            </div>

            {/* Infinite scroll sentinel */}
            <div ref={observerRef} className="h-10" />
        </>
    );
}
