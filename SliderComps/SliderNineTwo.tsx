import React, { useEffect, useRef, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, Play, Pause, ArrowRight } from "lucide-react";
import { BASE_URL, PAGE_ID, IMAGE_URL } from "../../../config";

// Inline skeleton component (moved here so external dependency is not required)
interface SkeletonProps {
    count?: number;
}

const SkeletonLoadingComp: React.FC<SkeletonProps> = ({ count = 3 }) => {
    return (
        <>
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="relative w-full h-full flex-shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-900 to-gray-800" />
                    <div className="absolute inset-0 flex items-center z-10">
                        <div className="container mx-auto px-12 lg:px-24">
                            <div className="max-w-3xl">
                                <div className="h-6 w-32 bg-white/10 rounded mb-4 animate-pulse" />
                                <div className="h-8 w-3/4 bg-white/10 rounded mb-3 animate-pulse" />
                                <div className="h-8 w-1/2 bg-white/10 rounded mb-3 animate-pulse" />
                                <div className="mt-6 h-12 w-48 bg-white/10 rounded animate-pulse" />
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </>
    );
};


interface Props {
    dataSource: string;
}

export default function SliderBlockFive({ dataSource }: Props) {
    const [items, setItems] = useState<Record<string, unknown>[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isAutoPlaying, setIsAutoPlaying] = useState(true);
    const [isHovered, setIsHovered] = useState(false);
    const sliderRef = useRef<HTMLDivElement | null>(null);
    const autoPlayRef = useRef<number | null>(null);

    const getData = useCallback(async () => {
        if (!dataSource) {
            setError("No data source provided");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const endpoint = `/${dataSource}/api/byPageId/${PAGE_ID}`;
            const response = await fetch(`${BASE_URL}${endpoint}`);

            if (!response.ok) throw new Error(`Failed to fetch: ${response.status}`);

            const result = await response.json();
            const list = Array.isArray(result)
                ? result
                : Array.isArray(result?.data)
                    ? result.data
                    : Array.isArray(result?.items)
                        ? result.items
                        : Array.isArray(result?.list)
                            ? result.list
                            : [];

            setItems(list);
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Error fetching slider data";
            setError(message);
            setItems([]);
        } finally {
            setLoading(false);
        }
    }, [dataSource]);

    useEffect(() => {
        getData();
    }, [getData]);

    const getImageUrl = useCallback((fieldValue: string | undefined) => {
        return fieldValue
            ? `${IMAGE_URL}/${fieldValue}`
            : "https://via.placeholder.com/1200x600?text=No+Image";
    }, []);

    const scroll = useCallback(
        (direction: "left" | "right") => {
            if (!sliderRef.current || items.length === 0) return;

            const slider = sliderRef.current as HTMLDivElement;
            let newIndex;

            if (direction === "right") {
                newIndex = currentIndex === items.length - 1 ? 0 : currentIndex + 1;
            } else {
                newIndex = currentIndex === 0 ? items.length - 1 : currentIndex - 1;
            }

            setCurrentIndex(newIndex);
            slider.scrollTo({
                left: newIndex * slider.clientWidth,
                behavior: "smooth"
            });
        },
        [currentIndex, items.length]
    );

    const goToSlide = useCallback((index: number) => {
        if (!sliderRef.current) return;
        const sliderEl = sliderRef.current as HTMLDivElement;
        setCurrentIndex(index);
        sliderEl.scrollTo({
            left: index * sliderEl.clientWidth,
            behavior: "smooth"
        });
    }, []);

    // Auto-play functionality
    useEffect(() => {
        if (!isAutoPlaying || items.length === 0 || isHovered) {
            if (autoPlayRef.current !== null) {
                clearInterval(autoPlayRef.current);
                autoPlayRef.current = null;
            }
            return;
        }

        autoPlayRef.current = window.setInterval(() => {
            scroll("right");
        }, 5000);

        return () => {
            if (autoPlayRef.current !== null) {
                clearInterval(autoPlayRef.current);
                autoPlayRef.current = null;
            }
        };
    }, [isAutoPlaying, items.length, scroll, isHovered]);

    

    if (error) {
        return (
            <div className="-mx-5 -my-5 h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 text-white">
                <div className="text-center">
                    <div className="text-6xl mb-4">⚠️</div>
                    <h3 className="text-2xl font-bold mb-2">Unable to Load Slider</h3>
                    <p className="text-gray-400">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div
            className="-mx-5 -mt-5 mb-5 relative h-screen bg-black"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Main Slider */}
            <div className="relative h-full w-full overflow-hidden">
                {/* Navigation Buttons */}
                <button
                    onClick={() => scroll("left")}
                    disabled={loading || items.length === 0}
                    className={`absolute left-8 top-1/2 -translate-y-1/2 z-20 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 rounded-full p-5 transition-all duration-300 disabled:opacity-0 ${isHovered ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4"
                        } hover:scale-110 active:scale-95 shadow-2xl`}
                    aria-label="Previous"
                >
                    <ChevronLeft className="w-6 h-6 text-white" strokeWidth={2.5} />
                </button>

                <button
                    onClick={() => scroll("right")}
                    disabled={loading || items.length === 0}
                    className={`absolute right-8 top-1/2 -translate-y-1/2 z-20 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 rounded-full p-5 transition-all duration-300 disabled:opacity-0 ${isHovered ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"
                        } hover:scale-110 active:scale-95 shadow-2xl`}
                    aria-label="Next"
                >
                    <ChevronRight className="w-6 h-6 text-white" strokeWidth={2.5} />
                </button>

                {/* Auto-play Control */}
                {!loading && items.length > 0 && (
                    <button
                        onClick={() => setIsAutoPlaying(!isAutoPlaying)}
                        className={`absolute top-8 right-8 z-20 bg-white/10 hover:bg-white/20 backdrop-blur-xl border border-white/20 rounded-full p-4 transition-all duration-300 ${isHovered ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
                            } hover:scale-110 active:scale-95 shadow-2xl`}
                        aria-label={isAutoPlaying ? "Pause" : "Play"}
                    >
                        {isAutoPlaying ? (
                            <Pause className="w-5 h-5 text-white" fill="white" />
                        ) : (
                            <Play className="w-5 h-5 text-white" fill="white" />
                        )}
                    </button>
                )}

                {/* Slider Container */}
                <div
                    ref={sliderRef}
                    className="flex h-full w-full overflow-x-hidden scroll-smooth"
                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                    {loading ? (
                        <SkeletonLoadingComp count={3} />
                    ) : items.length === 0 ? (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 text-white">
                            <div className="text-center">
                                <div className="text-6xl mb-4">📷</div>
                                <p className="text-xl text-gray-400">No images available</p>
                            </div>
                        </div>
                    ) : (
                        items.map((item, idx) => {
                            const thumbnail = String(item['Thumbnail'] ?? '');
                            const imageUrl = getImageUrl("/uploads/" + thumbnail);
                            const title = String(item['Title'] ?? `Slide ${idx + 1}`);
                            const heading = String(item['Title'] ?? '');
                            const description = String(item['Description'] ?? '');

                            return (
                                <div
                                    key={idx}
                                    className="relative w-full h-full flex-shrink-0 group"
                                >
                                    {/* Image with Ken Burns effect on hover */}
                                    <div className="absolute inset-0 overflow-hidden">
                                        <img
                                            src={imageUrl}
                                            alt={title}
                                            className="w-full h-full object-cover transition-transform duration-[8000ms] group-hover:scale-105"
                                            loading="lazy"
                                        />
                                    </div>

                                    {/* Gradient Overlays */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                                    {/* Content */}
                                    <div className="absolute inset-0 flex items-center z-10">
                                        <div className="container mx-auto px-12 lg:px-24">
                                            <div className="max-w-3xl">
                                                {/* Slide Number */}
                                                <div className="text-white/60 font-mono text-sm mb-4 tracking-widest">
                                                    {String(idx + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
                                                </div>

                                                {/* Description */}
                                                {description && (
                                                    <p className="text-lg md:text-xl text-gray-300 mb-8 line-clamp-3 leading-relaxed">
                                                        {description}
                                                    </p>
                                                )}


                                                {/* Title */}
                                                {heading && (
                                                    <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight tracking-tight">
                                                        {heading}
                                                    </h1>
                                                )}


                                                {/* Read More Button */}
                                                <a
                                                    href={`/contact`}
                                                    className="inline-flex items-center gap-3 bg-gray-800/50 text-white px-8 py-4 rounded-full font-semibold text-lg 
             hover:bg-gray-100 hover:text-gray-500 transition-all duration-300 hover:gap-5 
             group/button shadow-2xl"
                                                >
                                                    Learn More
                                                    <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover/button:translate-x-1" />
                                                </a>

                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>

                {/* Dot Navigation */}
                {!loading && items.length > 0 && (
                    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex gap-3">
                        {items.map((_, idx) => {
                            const isActive = currentIndex === idx;
                            return (
                                <button
                                    key={idx}
                                    onClick={() => goToSlide(idx)}
                                    className={`transition-all duration-300 rounded-full ${isActive
                                            ? "w-12 h-3 bg-white"
                                            : "w-3 h-3 bg-white/40 hover:bg-white/60"
                                        }`}
                                    aria-label={`Go to slide ${idx + 1}`}
                                />
                            );
                        })}
                    </div>
                )}

                {/* Progress Bar */}
                {!loading && items.length > 0 && isAutoPlaying && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 z-20">
                        <div
                            className="h-full bg-white transition-all duration-[5000ms] ease-linear"
                            style={{
                                width: isHovered ? "0%" : "100%",
                                transition: isHovered ? "width 0s" : "width 5000ms linear"
                            }}
                            key={currentIndex}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}