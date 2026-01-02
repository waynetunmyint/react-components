import React, { useEffect, useState, useCallback } from "react";
import { Star, Quote, MessageSquare, ChevronLeft, ChevronRight } from "lucide-react";
import { BASE_URL, IMAGE_URL, PAGE_ID } from "@/config";

interface Props {
    dataSource?: string;
    headingTitle?: string | null;
    subHeadingTitle?: string | null;
    customAPI?: string;
    // ========== Pre-fetched data from BlockSwitcher (SWR) ==========
    items?: any[];
    loading?: boolean;
    error?: string | null;
}

export default function TestimonialOne({
    dataSource = "testimonial",
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
    const [activeIndex, setActiveIndex] = useState(0);

    const items = hasPreFetchedData ? prefetchedItems : localItems;
    const loading = hasPreFetchedData ? (prefetchedLoading ?? false) : localLoading;
    const error = hasPreFetchedData ? prefetchedError : localError;

    const getData = useCallback(async () => {
        if (hasPreFetchedData) return;

        try {
            setLocalLoading(true);
            setLocalError(null);

            const url = customAPI
                ? `${BASE_URL}${customAPI}`
                : `${BASE_URL}/${dataSource}/api/byPageId/byPage/${PAGE_ID}/1`;

            const response = await fetch(url);
            const result = await response.json();
            setLocalItems(Array.isArray(result) ? result : []);
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
            : "https://via.placeholder.com/100x100?text=User";
    }, []);

    // Compact Star rating
    const StarRating = ({ count }: { count: number }) => {
        const stars = Math.min(Math.max(0, count || 5), 5);
        return (
            <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        size={12}
                        className={star <= stars
                            ? "fill-amber-400 text-amber-400"
                            : "fill-gray-200 text-gray-200"
                        }
                    />
                ))}
            </div>
        );
    };

    const nextSlide = () => {
        setActiveIndex((prev) => (prev + 1) % items.length);
    };

    const prevSlide = () => {
        setActiveIndex((prev) => (prev - 1 + items.length) % items.length);
    };

    const Skeleton = () => (
        <div className="bg-white rounded-xl p-4 shadow-sm animate-pulse">
            <div className="flex gap-0.5 mb-3">
                {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="w-3 h-3 bg-gray-200 rounded" />
                ))}
            </div>
            <div className="h-3 bg-gray-200 rounded w-full mb-1.5" />
            <div className="h-3 bg-gray-200 rounded w-3/4 mb-3" />
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gray-200 rounded-full" />
                <div>
                    <div className="h-3 bg-gray-200 rounded w-16 mb-1" />
                    <div className="h-2 bg-gray-100 rounded w-12" />
                </div>
            </div>
        </div>
    );

    if (error) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-6">
                <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4">
                    <h3 className="text-red-900 font-bold text-sm">Error Loading Testimonials</h3>
                    <p className="text-red-700 text-sm mt-1">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="py-8 px-4 bg-gradient-to-b from-gray-50 to-white">
            <div className="max-w-6xl mx-auto">
                {/* Compact Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-2 mb-2">
                        <Quote className="w-5 h-5 text-[var(--theme-primary-bg)]" />
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                            {headingTitle || "What Our Clients Say"}
                        </h2>
                    </div>
                    {subHeadingTitle && (
                        <p className="text-sm text-gray-500">
                            {subHeadingTitle}
                        </p>
                    )}
                </div>

                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {Array.from({ length: 4 }).map((_, idx) => <Skeleton key={idx} />)}
                    </div>
                ) : items.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10">
                        <MessageSquare className="w-8 h-8 text-gray-300 mb-2" />
                        <h3 className="text-sm font-semibold text-gray-900">No testimonials found</h3>
                    </div>
                ) : (
                    <>
                        {/* Compact Grid View */}
                        <div className="hidden sm:grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {items.map((item, idx) => {
                                const imageUrl = getImageUrl(item.Thumbnail);
                                return (
                                    <div
                                        key={item.Id || idx}
                                        className="group relative bg-white rounded-xl p-4 shadow-sm hover:shadow-md border border-gray-100 transition-all duration-300"
                                    >
                                        {/* Stars */}
                                        <div className="mb-2">
                                            <StarRating count={item.StarCount} />
                                        </div>

                                        {/* Description - compact */}
                                        <p className="text-xs text-gray-600 leading-relaxed mb-3 line-clamp-3">
                                            "{item.Description}"
                                        </p>

                                        {/* Author - compact */}
                                        <div className="flex items-center gap-2 pt-2 border-t border-gray-50">
                                            <div className="w-8 h-8 rounded-full overflow-hidden ring-1 ring-gray-100 flex-shrink-0">
                                                <img
                                                    src={imageUrl}
                                                    alt={item.PersonName || "Person"}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="font-semibold text-xs text-gray-900 truncate">
                                                    {item.PersonName || "Anonymous"}
                                                </h4>
                                                <p className="text-[10px] text-gray-500 truncate">
                                                    {item.PersonJobTitle || "Customer"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Mobile Carousel */}
                        <div className="sm:hidden relative">
                            <div className="overflow-hidden">
                                <div
                                    className="flex transition-transform duration-400 ease-out"
                                    style={{ transform: `translateX(-${activeIndex * 100}%)` }}
                                >
                                    {items.map((item, idx) => {
                                        const imageUrl = getImageUrl(item.Thumbnail);
                                        return (
                                            <div
                                                key={item.Id || idx}
                                                className="w-full flex-shrink-0 px-1"
                                            >
                                                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                                                    <div className="mb-2">
                                                        <StarRating count={item.StarCount} />
                                                    </div>
                                                    <p className="text-xs text-gray-600 leading-relaxed mb-3 line-clamp-4">
                                                        "{item.Description}"
                                                    </p>
                                                    <div className="flex items-center gap-2 pt-2 border-t border-gray-50">
                                                        <div className="w-8 h-8 rounded-full overflow-hidden ring-1 ring-gray-100">
                                                            <img
                                                                src={imageUrl}
                                                                alt={item.PersonName || "Person"}
                                                                className="w-full h-full object-cover"
                                                            />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-semibold text-xs text-gray-900">
                                                                {item.PersonName || "Anonymous"}
                                                            </h4>
                                                            <p className="text-[10px] text-gray-500">
                                                                {item.PersonJobTitle || "Customer"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Compact Navigation */}
                            {items.length > 1 && (
                                <div className="flex justify-center items-center gap-3 mt-4">
                                    <button
                                        onClick={prevSlide}
                                        className="w-8 h-8 rounded-full bg-white shadow flex items-center justify-center text-gray-500 hover:text-[var(--theme-primary-bg)] transition-all"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>

                                    <div className="flex gap-1.5">
                                        {items.map((_, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setActiveIndex(idx)}
                                                className={`h-1.5 rounded-full transition-all duration-300 ${idx === activeIndex
                                                    ? "bg-[var(--theme-primary-bg)] w-4"
                                                    : "bg-gray-300 w-1.5"
                                                    }`}
                                            />
                                        ))}
                                    </div>

                                    <button
                                        onClick={nextSlide}
                                        className="w-8 h-8 rounded-full bg-white shadow flex items-center justify-center text-gray-500 hover:text-[var(--theme-primary-bg)] transition-all"
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
