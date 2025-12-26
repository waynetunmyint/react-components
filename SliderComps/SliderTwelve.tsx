import React, { useEffect, useRef, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Play, Pause, ArrowRight } from "lucide-react";
import { BASE_URL, IMAGE_URL, PAGE_ID, PAGE_TYPE } from "../../../config";

interface Props {
    dataSource: string;
    customAPI?: string;
    items?: any[];
    loading?: boolean;
    error?: string | null;
}

export default function SliderTwelve({
    dataSource,
    customAPI,
    items: prefetchedItems,
    loading: prefetchedLoading,
    error: prefetchedError,
}: Props) {
    // Use pre-fetched data if available, otherwise manage own state
    const hasPreFetchedData = prefetchedItems !== undefined;

    const [localItems, setLocalItems] = useState<any[]>([]);
    const [localLoading, setLocalLoading] = useState(!hasPreFetchedData);
    const [localError, setLocalError] = useState<string | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const [isHovered, setIsHovered] = useState(false);

    // Use prefetched data if available, otherwise use local state
    const items = hasPreFetchedData ? prefetchedItems : localItems;
    const loading = hasPreFetchedData ? (prefetchedLoading ?? false) : localLoading;
    const error = hasPreFetchedData ? prefetchedError : localError;

    const sliderRef = useRef<HTMLDivElement>(null);
    const autoPlayRef = useRef<NodeJS.Timeout | null>(null);

    // Only fetch if no pre-fetched data is provided (backward compatibility)
    const getData = useCallback(async () => {
        if (hasPreFetchedData) return; // Skip if data is pre-fetched

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

    const getImageUrl = useCallback((thumbnail: string | undefined) => {
        return thumbnail
            ? `${IMAGE_URL}/uploads/${thumbnail}`
            : "https://via.placeholder.com/1200x600?text=No+Image";
    }, []);

    const scroll = useCallback(
        (direction: "left" | "right") => {
            if (!sliderRef.current || items.length === 0) return;

            const slider = sliderRef.current;
            let newIndex;

            if (direction === "right") {
                newIndex = currentIndex === items.length - 1 ? 0 : currentIndex + 1;
            } else {
                newIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
            }

            setCurrentIndex(newIndex);
            slider.scrollTo({ left: newIndex * slider.clientWidth, behavior: "smooth" });
        },
        [currentIndex, items.length]
    );

    const goToSlide = useCallback((index: number) => {
        if (!sliderRef.current) return;
        setCurrentIndex(index);
        sliderRef.current.scrollTo({
            left: index * sliderRef.current.clientWidth,
            behavior: "smooth",
        });
    }, []);

    // Auto-play
    useEffect(() => {
        if (!isAutoPlaying || items.length === 0 || isHovered) {
            if (autoPlayRef.current) clearInterval(autoPlayRef.current);
            return;
        }

        autoPlayRef.current = setInterval(() => {
            scroll("right");
        }, 5000);

        return () => {
            if (autoPlayRef.current) clearInterval(autoPlayRef.current);
        };
    }, [isAutoPlaying, items.length, scroll, isHovered]);

    if (error) {
        return (
            <div className="mb-8 p-8 bg-gradient-to-br from-red-900/20 to-orange-900/20 border-2 border-red-500/30 shadow-lg backdrop-blur-sm">
                <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                        <span className="text-2xl">⚠️</span>
                    </div>
                    <div>
                        <p className="text-red-200 font-semibold text-lg">Unable to Load Slider</p>
                        <p className="text-red-300/80 text-sm mt-1">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div
            className="relative mt-0 pt-0 w-full h-auto min-h-[400px] overflow-hidden bg-gradient-to-br from-gray-900 via-black to-gray-900"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Main Slider */}
            <div className="relative h-auto">

                {/* Navigation Left */}
                <button
                    onClick={() => scroll("left")}
                    disabled={loading || items.length === 0}
                    className={`absolute left-6 top-1/2 -translate-y-1/2 z-30
            bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20
            rounded-full p-4 transition-all duration-300 disabled:opacity-0
            ${isHovered ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"}
            hover:scale-110 active:scale-95 shadow-2xl`}
                    aria-label="Previous"
                >
                    <ChevronLeft className="w-6 h-6 text-white" strokeWidth={2.5} />
                </button>

                {/* Navigation Right */}
                <button
                    onClick={() => scroll("right")}
                    disabled={loading || items.length === 0}
                    className={`absolute right-6 top-1/2 -translate-y-1/2 z-30
            bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20
            rounded-full p-4 transition-all duration-300 disabled:opacity-0
            ${isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"}
            hover:scale-110 active:scale-95 shadow-2xl`}
                    aria-label="Next"
                >
                    <ChevronRight className="w-6 h-6 text-white" strokeWidth={2.5} />
                </button>

                {/* Play / Pause */}
                {!loading && items.length > 0 && (
                    <button
                        onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                        className={`absolute top-6 right-6 z-30
              bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20
              rounded-full p-3 transition-all duration-300
              ${isHovered ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"}
              hover:scale-110 active:scale-95 shadow-2xl`}
                        aria-label={isAutoPlaying ? "Pause" : "Play"}
                    >
                        {isAutoPlaying ? (
                            <Pause className="w-5 h-5 text-white" fill="white" />
                        ) : (
                            <Play className="w-5 h-5 text-white" fill="white" />
                        )}
                    </button>
                )}

                {/* Slider */}
                <div ref={sliderRef} className="no-scrollbar w-full h-auto overflow-x-hidden scroll-smooth flex">
                    {loading ? (
                        <></>
                    ) : items.length === 0 ? (
                        <div className="w-full h-full flex items-center justify-center">
                            <div className="text-center p-8">
                                <div className="text-6xl mb-4">📷</div>
                                <p className="text-white/60 text-xl font-semibold">No images available</p>
                            </div>
                        </div>
                    ) : (
                        items.map((item, idx) => {
                            const imageUrl = getImageUrl(item?.Thumbnail);

                            const SlideImage = (
                                <div className="w-full h-auto overflow-hidden">
                                    <img
                                        src={imageUrl}
                                        alt={item?.Title || `Slide ${idx + 1}`}
                                        className="w-full h-auto transition-transform duration-[8000ms] ease-out group-hover:scale-110"
                                        loading="lazy"
                                    />
                                </div>
                            );

                            return (
                                <div key={item.Id || idx} className="slider-card relative w-full h-auto flex-shrink-0 overflow-hidden group">
                                    {item?.LinkURL ? (
                                        <a href={item.LinkURL} className="block w-full h-full cursor-pointer">
                                            {SlideImage}
                                        </a>
                                    ) : (
                                        SlideImage
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Dot Navigation */}
                {!loading && items.length > 0 && (
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex gap-3">
                        {items.map((item, idx) => (
                            <button
                                key={item.Id || idx}
                                onClick={() => goToSlide(idx)}
                                className={`w-3 h-3 rounded-full transition-all duration-300 
                                    ${currentIndex === idx
                                        ? "bg-white scale-125 shadow-lg"
                                        : "bg-white/40 hover:bg-white/80 hover:scale-110"
                                    }`}
                                aria-label={`Go to slide ${idx + 1}`}
                            />
                        ))}
                    </div>
                )}

                {/* Auto-play progress bar */}
                {!loading && items.length > 0 && isAutoPlaying && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 z-30">
                        <div
                            className="h-full bg-white transition-all duration-[5000ms] ease-linear"
                            style={{
                                width: isHovered ? "0%" : "100%",
                                transition: isHovered ? "width 0s" : "width 5000ms linear",
                            }}
                            key={currentIndex}
                        />
                    </div>
                )}
            </div>

            <style>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
        </div>
    );
}
