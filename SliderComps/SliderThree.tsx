import React, { useEffect, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Circle } from "lucide-react";
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
 * SliderThree - Parallax Split Screen Style
 * Split screen with parallax effect and elegant typography
 */
export default function SliderThree({
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
    const [direction, setDirection] = useState<"left" | "right">("right");

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
            setDirection("right");
            setCurrentIndex((prev) => (prev + 1) % items.length);
        }, 7000);
        return () => clearInterval(interval);
    }, [items.length]);

    const getImageUrl = useCallback((thumbnail: string | undefined) => {
        return thumbnail
            ? `${IMAGE_URL}/uploads/${thumbnail}`
            : "https://via.placeholder.com/1200x600?text=No+Image";
    }, []);

    const nextSlide = () => {
        setDirection("right");
        setCurrentIndex((prev) => (prev + 1) % items.length);
    };

    const prevSlide = () => {
        setDirection("left");
        setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
    };

    const goToSlide = (index: number) => {
        setDirection(index > currentIndex ? "right" : "left");
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
            <div className="w-full h-[600px] bg-gradient-to-r from-gray-100 to-gray-200 animate-pulse"></div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="w-full h-[600px] bg-gray-100 flex items-center justify-center">
                <p className="text-gray-400 text-xl">No images available</p>
            </div>
        );
    }

    const currentItem = items[currentIndex];
    const imageUrl = getImageUrl(currentItem?.Thumbnail);
    const title = currentItem?.Title;
    const description = currentItem?.Description;

    return (
        <div className="relative w-full h-[600px] md:h-[700px] bg-black overflow-hidden">
            {/* Background Image with Parallax */}
            <div className="absolute inset-0">
                <div
                    className={`w-full h-full transition-transform duration-1000 ease-out ${direction === "right" ? "animate-[slideInRight_1s_ease-out]" : "animate-[slideInLeft_1s_ease-out]"
                        }`}
                    key={currentIndex}
                >
                    <img
                        src={imageUrl}
                        alt={title || `Slide ${currentIndex + 1}`}
                        className="w-full h-full object-cover scale-110"
                    />
                </div>
                <div className="absolute inset-0 bg-gradient-to-r from-black via-black/70 to-transparent" />
            </div>

            {/* Content Split Screen */}
            <div className="relative z-10 h-full flex items-center">
                <div className="container mx-auto px-8 md:px-16">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        {/* Left Side - Text Content */}
                        <div className="space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="h-px w-16 bg-white/50" />
                                <span className="text-white/70 text-sm tracking-widest uppercase">
                                    Featured Story
                                </span>
                            </div>

                            {title && (
                                <h1 className="text-5xl md:text-7xl font-black text-white leading-tight">
                                    {title}
                                </h1>
                            )}

                            {description && (
                                <p className="text-xl text-gray-300 leading-relaxed max-w-xl">
                                    {description}
                                </p>
                            )}

                            <div className="flex items-center gap-6 pt-4">
                                <button className="px-8 py-4 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-all hover:scale-105 active:scale-95">
                                    Explore More
                                </button>

                                <div className="flex items-center gap-3">
                                    <span className="text-white/50 text-sm">
                                        {String(currentIndex + 1).padStart(2, "0")}
                                    </span>
                                    <div className="h-px w-8 bg-white/30" />
                                    <span className="text-white/50 text-sm">
                                        {String(items.length).padStart(2, "0")}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Right Side - Image Preview (Hidden on Mobile) */}
                        <div className="hidden md:block">
                            <div className="relative">
                                <div className="aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                                    <img
                                        src={imageUrl}
                                        alt={title || "Preview"}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="absolute bottom-8 left-8 md:left-16 z-20 flex items-center gap-4">
                <button
                    onClick={prevSlide}
                    className="w-14 h-14 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                    aria-label="Previous"
                >
                    <ChevronLeft className="w-6 h-6 text-white" />
                </button>

                <button
                    onClick={nextSlide}
                    className="w-14 h-14 bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                    aria-label="Next"
                >
                    <ChevronRight className="w-6 h-6 text-white" />
                </button>

                {/* Vertical Dots */}
                <div className="flex flex-col gap-3 ml-4">
                    {items.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={() => goToSlide(idx)}
                            className="group"
                            aria-label={`Go to slide ${idx + 1}`}
                        >
                            <Circle
                                className={`transition-all duration-300 ${currentIndex === idx
                                    ? "w-3 h-3 text-white fill-white"
                                    : "w-2 h-2 text-white/40 fill-white/40 group-hover:text-white/70 group-hover:fill-white/70"
                                    }`}
                            />
                        </button>
                    ))}
                </div>
            </div>

            <style>{`
                @keyframes slideInRight {
                    from { transform: translateX(100px); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideInLeft {
                    from { transform: translateX(-100px); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `}</style>
        </div>
    );
}
