import React, { useEffect, useState, useCallback } from "react";
import { BASE_URL, IMAGE_URL, PAGE_ID, PAGE_TYPE } from "../../../config";

interface Props {
    dataSource: string;
    headingTitle?: string | null;
    subHeadingTitle?: string | null;
    customAPI?: string;
    // ========== Pre-fetched data from BlockSwitcher (SWR) ==========
    items?: any[];
    loading?: boolean;
    error?: string | null;
}

/**
 * SliderFive - Image Only Gallery Style
 * Minimal slider focused purely on images, no text overlays
 */
export default function SliderFive({
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

    useEffect(() => {
        if (items.length === 0) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % items.length);
        }, 4000);
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
            <div className="w-full h-[600px] bg-gray-100 animate-pulse"></div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="w-full h-[600px] bg-gray-50 flex items-center justify-center">
                <p className="text-gray-400 text-xl">No images available</p>
            </div>
        );
    }

    return (
        <div className="relative w-full h-auto min-h-[400px] overflow-hidden group grid grid-cols-1">
            {/* Full-screen Images */}
            <div className="col-start-1 row-start-1 w-full h-auto grid grid-cols-1">
                {items.map((item, idx) => {
                    const imageUrl = getImageUrl(item?.Thumbnail);
                    const isActive = currentIndex === idx;
                    const isPrev = (currentIndex - 1 + items.length) % items.length === idx;
                    const isNext = (currentIndex + 1) % items.length === idx;

                    return (
                        <div
                            key={item.Id || idx}
                            className={`col-start-1 row-start-1 w-full h-auto transition-all duration-700 ease-in-out ${isActive
                                ? "opacity-100 z-10"
                                : isPrev
                                    ? "opacity-0 -translate-x-full z-0"
                                    : isNext
                                        ? "opacity-0 translate-x-full z-0"
                                        : "opacity-0 z-0"
                                }`}
                        >
                            <img
                                src={imageUrl}
                                alt={item?.Title || `Image ${idx + 1}`}
                                className="w-full h-auto"
                            />
                        </div>
                    );
                })}
            </div>

            {/* Minimal Dot Indicators */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-3">
                {items.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => goToSlide(idx)}
                        className="group"
                        aria-label={`Go to image ${idx + 1}`}
                    >
                        <div
                            className={`transition-all duration-300 rounded-full ${currentIndex === idx
                                ? "w-3 h-3 bg-white"
                                : "w-2 h-2 bg-white/40 group-hover:bg-white/70"
                                }`}
                        />
                    </button>
                ))}
            </div>

            {/* Thumbnail Preview Strip (shows on hover) */}
            <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {items.slice(0, Math.min(5, items.length)).map((item, idx) => {
                    const thumbUrl = getImageUrl(item?.Thumbnail);
                    return (
                        <button
                            key={item.Id || idx}
                            onClick={() => goToSlide(idx)}
                            className={`w-16 h-16 rounded-lg overflow-hidden transition-all duration-200 ${currentIndex === idx
                                ? "ring-2 ring-white scale-110"
                                : "opacity-60 hover:opacity-100"
                                }`}
                        >
                            <img
                                src={thumbUrl}
                                alt=""
                                className="w-full h-full object-cover"
                            />
                        </button>
                    );
                })}
                {items.length > 5 && (
                    <div className="w-16 h-16 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center text-white text-xs">
                        +{items.length - 5}
                    </div>
                )}
            </div>

            {/* Image Counter (top right) */}
            <div className="absolute top-6 right-6 z-20 text-white/90 font-mono text-sm bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                {currentIndex + 1} / {items.length}
            </div>

            {/* Click zones for navigation (left/right halves) */}
            <button
                onClick={() => setCurrentIndex((prev) => (prev - 1 + items.length) % items.length)}
                className="absolute left-0 top-0 w-1/2 h-full z-10 cursor-w-resize"
                aria-label="Previous image"
            />
            <button
                onClick={() => setCurrentIndex((prev) => (prev + 1) % items.length)}
                className="absolute right-0 top-0 w-1/2 h-full z-10 cursor-e-resize"
                aria-label="Next image"
            />
        </div>
    );
}
