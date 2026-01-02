"use client";
import React, { useEffect, useRef, useState, useCallback } from "react";
import { IonToast, IonSpinner } from "@ionic/react";
import { BASE_URL, IMAGE_URL } from "@/config";
import { ShoppingBag, User, Users, MessageSquare } from "lucide-react";
import { checkChatMembership } from "../StorageComps/StorageCompOne";
import { formatNumber } from "../HelperComps/TextCaseComp";

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

export const ChatGroupGrid: React.FC<Props> = ({
    dataSource,
    imageField = "Thumbnail",
    headingField = "Title",
    defaultImage = "logo.png",
    customAPI,
}) => {
    const [data, setData] = useState<any[]>([]);
    const [page, setPage] = useState(1);
    const [isFetching, setIsFetching] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [loadingItems, setLoadingItems] = useState<{ [key: string]: boolean }>({});

    const observerRef = useRef<HTMLDivElement | null>(null);

    const fetchData = useCallback(async (pageNo: number, isRefresh = false) => {
        if (isFetching || (!hasMore && !isRefresh)) return;

        try {
            if (isRefresh) setIsRefreshing(true);
            else setIsFetching(true);

            const url = `${BASE_URL}/chatGroup/api`;

            const res = await fetch(url);
            console.log("chat interface url", url);

            if (!res.ok) throw new Error("Failed to fetch data");
            const newData = await res.json();

            if (!Array.isArray(newData)) throw new Error("Data is not iterable");

            setData((prev) => (pageNo === 1 ? newData : [...prev, ...newData]));
            setPage(pageNo);
            if (newData.length === 0 || newData.length < 10) setHasMore(false);
            else setHasMore(true);
        } catch (err) {
            console.error(err);
            setHasMore(false);
            setToastMessage("Error fetching data.");
        } finally {
            setIsFetching(false);
            setIsRefreshing(false);
        }
    }, [dataSource, customAPI, isFetching, hasMore]);

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
                if (entries[0].isIntersecting) {
                    fetchData(page + 1);
                }
            },
            { threshold: 0.1 }
        );

        observer.observe(observerRef.current);
        return () => observer.disconnect();
    }, [fetchData, page, hasMore, isFetching]);

    const handleView = async (item: any) => {
        const id = item?.chatGroupId || item?.Id;
        if (!id) return;

        setLoadingItems(prev => ({ ...prev, [id]: true }));
        try {
            await checkChatMembership(id);
            localStorage.setItem("StoredGroupItem", JSON.stringify(item));
            window.location.href = `/${dataSource}/view/${id}`;
        } catch (err) {
            console.error("Navigation error:", err);
            setToastMessage("Error accessing chat group.");
        } finally {
            setLoadingItems(prev => ({ ...prev, [id]: false }));
        }
    };

    return (
        <div className="w-full">
            <IonToast
                isOpen={!!toastMessage}
                onDidDismiss={() => setToastMessage(null)}
                message={toastMessage || ""}
                duration={3000}
                position="top"
                style={{ '--background': 'var(--bg4)', '--color': 'var(--t1)' }}
            />

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {data.map((item, index) => {
                    const imageSrc = item?.[imageField]
                        ? `${IMAGE_URL}/uploads/${item[imageField]}`
                        : `${IMAGE_URL}/uploads/${defaultImage}`;
                    const id = item?.chatGroupId || item?.Id;
                    const isLoading = !!loadingItems[id];

                    return (
                        <div
                            key={`${id}-${index}`}
                            onClick={() => handleView(item)}
                            className="relative group rounded-2xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer active:scale-95"
                            style={{ backgroundColor: 'var(--bg2)' }}
                        >
                            {/* Image Container */}
                            <div className="aspect-square overflow-hidden relative">
                                <img
                                    src={imageSrc}
                                    alt={item[headingField]}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6), transparent, transparent)' }} />

                                {/* Stats Badges */}
                                <div className="absolute top-2 left-2 flex flex-col gap-1.5">
                                    <div className="backdrop-blur-md px-2 py-1 rounded-full flex items-center gap-1 shadow-sm" style={{ backgroundColor: 'var(--bg2)', border: '1px solid var(--bg3)' }}>
                                        <Users size={12} style={{ color: 'var(--a3)' }} />
                                        <span className="text-[10px] font-bold" style={{ color: 'var(--t1)' }}>
                                            {formatNumber(item?.MemberCount || 0)}
                                        </span>
                                    </div>
                                </div>

                                <div className="absolute top-2 right-2">
                                    <div className="px-2 py-1 rounded-full flex items-center gap-1 shadow-md" style={{ background: 'linear-gradient(to right, var(--a4), var(--a5))' }}>
                                        <ShoppingBag size={12} style={{ color: 'var(--bg1)' }} />
                                        <span className="text-[10px] font-bold" style={{ color: 'var(--bg1)' }}>
                                            {item?.Price > 0 ? `$${formatNumber(item.Price)}` : 'FREE'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Title & Info */}
                            <div className="p-3">
                                <h3 className="font-bold text-sm line-clamp-1 transition-colors" style={{ color: 'var(--t1)' }}>
                                    {item[headingField]}
                                </h3>
                                <div className="mt-1 flex items-center gap-1" style={{ color: 'var(--t3)' }}>
                                    <MessageSquare size={12} />
                                    <span className="text-[10px] line-clamp-1" style={{ color: 'var(--t3)' }}>
                                        {item?.LastMessage || "No messages yet"}
                                    </span>
                                </div>
                            </div>

                            {/* Loading Overlay */}
                            {isLoading && (
                                <div className="absolute inset-0 backdrop-blur-[2px] flex items-center justify-center z-10" style={{ backgroundColor: 'var(--bg2)', opacity: 0.8 }}>
                                    <IonSpinner name="crescent" color="primary" />
                                </div>
                            )}
                        </div>
                    );
                })}

                {/* Loading Skeletons */}
                {isFetching && Array.from({ length: 6 }).map((_, i) => (
                    <div key={`skeleton-${i}`} className="rounded-2xl aspect-square animate-pulse" style={{ backgroundColor: 'var(--bg3)' }} />
                ))}
            </div>

            {/* Infinite Scroll Anchor */}
            <div ref={observerRef} className="h-10 w-full flex items-center justify-center">
                {isFetching && data.length > 0 && <IonSpinner name="dots" />}
            </div>
        </div>
    );
};
