import React, { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
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
 * SliderFour - Minimal Fade Style
 * Clean, minimalist slider with smooth fade transitions
 */
export default function SliderFour({
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
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);

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
        if (items.length === 0 || !isAutoPlaying) return;
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % items.length);
        }, 5000);
        return () => clearInterval(interval);
    }, [items.length, isAutoPlaying]);

    const getImageUrl = useCallback((thumbnail: string | undefined) => {
        return thumbnail
            ? `${IMAGE_URL}/uploads/${thumbnail}`
            : "https://via.placeholder.com/1200x600?text=No+Image";
    }, []);

    const nextSlide = () => {
        setCurrentIndex((prev) => (prev + 1) % items.length);
    };

    const prevSlide = () => {
        setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
    };

    const goToSlide = (index: number) => {
        setCurrentIndex(index);
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
            <div className="w-full h-[550px] bg-gray-100 animate-pulse"></div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="w-full h-[550px] bg-gray-50 flex items-center justify-center">
                <p className="text-gray-400 text-xl">No images available</p>
            </div>
        );
    }

    return (
        <div className="relative w-full h-auto min-h-[400px] bg-white overflow-hidden group grid grid-cols-1">
            {/* Image Stack with Fade */}
            <div className="col-start-1 row-start-1 w-full h-auto grid grid-cols-1">
                {items.map((item, idx) => {
                    const imageUrl = getImageUrl(item?.Thumbnail);
                    const title = item?.Title;
                    const description = item?.Description;
                    const isActive = currentIndex === idx;

                    return (
                        <div
                            key={item.Id || idx}
                            className={`col-start-1 row-start-1 w-full h-auto transition-opacity duration-1000 ${isActive ? "opacity-100 z-10" : "opacity-0 z-0"
                                }`}
                        >
                            <img
                                src={imageUrl}
                                alt={title || `Slide ${idx + 1}`}
                                className="w-full h-auto"
                            />

                            {/* Subtle Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                            {/* Centered Content */}
                            <div className="absolute inset-0 flex items-end justify-center pb-24">
                                <div className="text-center max-w-3xl px-8">
                                    {title && (
                                        <h2 className="text-4xl md:text-6xl font-light text-white mb-4 tracking-wide">
                                            {title}
                                        </h2>
                                    )}
                                    {description && (
                                        <p className="text-lg text-white/90 font-light line-clamp-2">
                                            {description}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Minimal Navigation */}
            <button
                onClick={prevSlide}
                className="absolute left-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-white/90 hover:bg-white transition-all opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95 shadow-lg"
                aria-label="Previous"
            >
                <ChevronLeft className="w-5 h-5 text-gray-800" />
            </button>

            <button
                onClick={nextSlide}
                className="absolute right-6 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-white/90 hover:bg-white transition-all opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95 shadow-lg"
                aria-label="Next"
            >
                <ChevronRight className="w-5 h-5 text-gray-800" />
            </button>

            {/* Play/Pause */}
            <button
                onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                className="absolute top-6 right-6 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-white/90 hover:bg-white transition-all opacity-0 group-hover:opacity-100 hover:scale-110 active:scale-95 shadow-lg"
                aria-label={isAutoPlaying ? "Pause" : "Play"}
            >
                {isAutoPlaying ? (
                    <Pause className="w-4 h-4 text-gray-800" fill="currentColor" />
                ) : (
                    <Play className="w-4 h-4 text-gray-800" fill="currentColor" />
                )}
            </button>

            {/* Line Indicators */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                {items.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => goToSlide(idx)}
                        className="group relative"
                        aria-label={`Go to slide ${idx + 1}`}
                    >
                        <div
                            className={`h-0.5 transition-all duration-300 ${currentIndex === idx
                                ? "w-16 bg-white"
                                : "w-8 bg-white/50 group-hover:bg-white/80"
                                }`}
                        />
                        {currentIndex === idx && isAutoPlaying && (
                            <div
                                className="absolute top-0 left-0 h-0.5 bg-white/30 transition-all duration-[5000ms] ease-linear"
                                style={{ width: "100%" }}
                                key={currentIndex}
                            />
                        )}
                    </button>
                ))}
            </div>

            {/* Counter */}
            <div className="absolute top-6 left-6 z-20 text-white/80 font-light text-sm tracking-widest">
                {String(currentIndex + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
            </div>
        </div>
    );
}
