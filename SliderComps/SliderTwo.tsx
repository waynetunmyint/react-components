import React, { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BASE_URL, IMAGE_URL, PAGE_ID, PAGE_TYPE } from "@/config";

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
 * SliderTwo - Card Stack Style
 * Modern card-based slider with stacked preview effect
 */
export default function SliderTwo({
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
        }, 6000);
        return () => clearInterval(interval);
    }, [items.length]);

    const getImageUrl = useCallback((thumbnail: string | undefined) => {
        return thumbnail
            ? `${IMAGE_URL}/uploads/${thumbnail}`
            : "https://via.placeholder.com/1200x600?text=No+Image";
    }, []);

    const goToSlide = (index: number) => {
        setCurrentIndex(index);
    };

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % items.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
    };

    if (error) {
        return (
            <div className="mb-8 p-8 bg-red-50 border border-red-200 rounded-2xl">
                <p className="text-red-600 font-semibold">Unable to Load Slider</p>
                <p className="text-red-500 text-sm mt-1">{error}</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="w-full h-[500px] bg-gradient-to-br from-gray-100 to-gray-200 animate-pulse rounded-3xl"></div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="w-full h-[500px] bg-gray-100 rounded-3xl flex items-center justify-center">
                <p className="text-gray-400 text-xl">No images available</p>
            </div>
        );
    }

    return (
        <div className="relative w-full h-[500px] md:h-[600px] bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
            {/* Card Stack Container */}
            <div className="absolute inset-0 flex items-center justify-center p-8">
                <div className="relative w-full max-w-5xl h-full">
                    {items.map((item, idx) => {
                        const imageUrl = getImageUrl(item?.Thumbnail);
                        const title = item?.Title;
                        const description = item?.Description;
                        const offset = idx - currentIndex;
                        const absOffset = Math.abs(offset);

                        if (absOffset > 2) return null;

                        return (
                            <div
                                key={item.Id || idx}
                                className={`absolute inset-0 transition-all duration-700 ease-out ${offset === 0
                                    ? "z-30 scale-100 opacity-100"
                                    : offset > 0
                                        ? `z-${30 - absOffset * 10} scale-${95 - absOffset * 5} opacity-${60 - absOffset * 20}`
                                        : "z-0 scale-90 opacity-0"
                                    }`}
                                style={{
                                    transform: `
                                        translateX(${offset * 60}px)
                                        translateY(${absOffset * 20}px)
                                        scale(${1 - absOffset * 0.1})
                                        rotateY(${offset * 5}deg)
                                    `,
                                    opacity: offset === 0 ? 1 : offset > 0 ? 0.6 - absOffset * 0.2 : 0,
                                }}
                            >
                                <div className="relative w-full h-full bg-white rounded-3xl shadow-2xl overflow-hidden">
                                    <img
                                        src={imageUrl}
                                        alt={title || `Slide ${idx + 1}`}
                                        className="w-full h-full object-cover"
                                    />

                                    {/* Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                                    {/* Content */}
                                    <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
                                        {title && (
                                            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
                                                {title}
                                            </h2>
                                        )}
                                        {description && (
                                            <p className="text-gray-200 text-lg mb-6 line-clamp-2">
                                                {description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Navigation Buttons */}
            <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-40 bg-white/90 hover:bg-white p-4 rounded-full shadow-xl transition-all hover:scale-110 active:scale-95"
                aria-label="Previous"
            >
                <ChevronLeft className="w-6 h-6 text-gray-800" />
            </button>

            <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-40 bg-white/90 hover:bg-white p-4 rounded-full shadow-xl transition-all hover:scale-110 active:scale-95"
                aria-label="Next"
            >
                <ChevronRight className="w-6 h-6 text-gray-800" />
            </button>

            {/* Dot Indicators */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40 flex gap-2">
                {items.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => goToSlide(idx)}
                        className={`transition-all duration-300 rounded-full ${currentIndex === idx
                            ? "w-12 h-3 bg-white shadow-lg"
                            : "w-3 h-3 bg-white/50 hover:bg-white/80"
                            }`}
                        aria-label={`Go to slide ${idx + 1}`}
                    />
                ))}
            </div>
        </div>
    );
}
