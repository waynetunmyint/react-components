import React, { useEffect, useState, useCallback } from "react";
import { BASE_URL, IMAGE_URL, PAGE_ID, PAGE_TYPE } from "@/config";

interface Props {
    dataSource: string;
    headingTitle?: string | null;
    subHeadingTitle?: string | null;
    customAPI?: string;
    items?: any[];
    loading?: boolean;
    error?: string | null;
}

export default function SliderSix({
    dataSource,
    headingTitle,
    subHeadingTitle,
    customAPI,
    items: prefetchedItems,
    loading: prefetchedLoading,
    error: prefetchedError,
}: Props) {
    const hasPreFetchedData = prefetchedItems !== undefined;

    const [localItems, setLocalItems] = useState<any[]>([]);
    const [localLoading, setLocalLoading] = useState(!hasPreFetchedData);
    const [localError, setLocalError] = useState<string | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);

    const items = hasPreFetchedData ? prefetchedItems : localItems;
    const loading = hasPreFetchedData ? (prefetchedLoading ?? false) : localLoading;
    const error = hasPreFetchedData ? prefetchedError : localError;

    const getData = useCallback(async () => {
        if (hasPreFetchedData) return;

        if (!dataSource) {
            setLocalError("No data source provided");
            setLocalLoading(false);
            return;
        }

        try {
            setLocalLoading(true);
            setLocalError(null);

            const url = customAPI
                ? (customAPI.startsWith('http') ? customAPI : `${BASE_URL}${customAPI.startsWith('/') ? '' : '/'}${customAPI}`)
                : PAGE_TYPE === "standalone"
                    ? (dataSource === "article"
                        ? `${BASE_URL}/${dataSource}/api/byPage/isInteresting/1`
                        : `${BASE_URL}/${dataSource}/api/byPageId/byPage/`)
                    : `${BASE_URL}/${dataSource}/api/byPageId/byPage/${PAGE_ID}/1`;

            const response = await fetch(url);
            const result = await response.json();
            const data = Array.isArray(result) ? result : [];
            setLocalItems(data);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Error fetching data";
            console.error(message, err);
            setLocalError(message);
            setLocalItems([]);
        } finally {
            setLocalLoading(false);
        }
    }, [dataSource, customAPI, hasPreFetchedData]);

    useEffect(() => {
        getData();
    }, [getData]);

    // Auto-play
    useEffect(() => {
        if (items.length === 0) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % items.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [items.length]);

    const getImageUrl = useCallback((thumbnail: string | undefined) => {
        return thumbnail
            ? `${IMAGE_URL}/uploads/${thumbnail}`
            : "https://via.placeholder.com/1200x800?text=No+Image";
    }, []);

    const goToSlide = (index: number) => {
        setCurrentIndex(index);
    };

    if (error) {
        return (
            <div className="mb-8 p-8 bg-red-50 border border-red-200 rounded-2xl">
                <p className="text-red-600 font-semibold">Unable to Load Gallery</p>
                <p className="text-red-500 text-sm mt-1">{error}</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="w-full h-[600px] bg-gray-100 animate-pulse rounded-xl"></div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="w-full h-[600px] bg-gray-50 flex items-center justify-center rounded-xl">
                <p className="text-gray-400 text-xl">No images available</p>
            </div>
        );
    }

    return (
        <div className="relative w-full h-auto overflow-hidden">
            {/* Full-size Image Slider */}
            <div className="relative w-full h-auto">
                {items.map((item, idx) => {
                    const imageUrl = getImageUrl(item?.Thumbnail);
                    const isActive = currentIndex === idx;

                    return (
                        <div
                            key={item.Id || idx}
                            className={`${idx === 0 ? '' : 'absolute inset-0'} w-full h-auto transition-opacity duration-700 ${isActive ? "opacity-100 z-10" : "opacity-0 z-0"
                                }`}
                        >
                            <img
                                src={imageUrl}
                                alt={item?.Title || `Image ${idx + 1}`}
                                className="w-full h-auto object-cover"
                            />
                        </div>
                    );
                })}
            </div>

            {/* Thumbnail Navigation - Always Visible at Bottom Center */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 max-w-[90%] pointer-events-auto">
                <div className="bg-black/40 backdrop-blur-md border border-white/20 rounded-xl p-1.5 shadow-2xl">
                    <div className="flex gap-2 overflow-x-auto no-scrollbar">
                        {items.map((item, idx) => {
                            const thumbUrl = getImageUrl(item?.Thumbnail);
                            const isActive = currentIndex === idx;

                            return (
                                <button
                                    key={item.Id || idx}
                                    onClick={() => goToSlide(idx)}
                                    className={`relative flex-shrink-0 transition-all duration-300 overflow-hidden rounded-lg ${isActive
                                        ? "ring-2 ring-white scale-110 shadow-xl"
                                        : "ring-1 ring-white/30 hover:ring-white/60 hover:scale-105 opacity-70 hover:opacity-100"
                                        }`}
                                    aria-label={`Go to slide ${idx + 1}`}
                                >
                                    <div className="w-20 h-14 md:w-24 md:h-16 bg-black/50">
                                        <img
                                            src={thumbUrl}
                                            alt={item?.Title || `Thumbnail ${idx + 1}`}
                                            className="w-full h-full object-cover"
                                        />
                                        {isActive && (
                                            <div className="absolute inset-0 bg-white/20" />
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
}
