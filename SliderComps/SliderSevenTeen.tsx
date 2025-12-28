import React, { useEffect, useRef, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BASE_URL, IMAGE_URL, PAGE_ID, PAGE_TYPE } from "../../../config";

interface Props {
    dataSource: string;
    headingTitle?: string | null;
    subHeadingTitle?: string | null;
    customAPI?: string;
    items?: any[];
    loading?: boolean;
    error?: string | null;
}

export default function SliderSevenTeen({
    dataSource,
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

    const sliderRef = useRef<HTMLDivElement>(null);

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
            setLocalError(err instanceof Error ? err.message : "Error fetching data");
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
            if (!sliderRef.current || !items || items.length === 0) return;

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
        [currentIndex, items]
    );

    if (error) return null;
    if (loading || !items || items.length === 0) return null;

    return (
        <div className="relative w-full overflow-hidden bg-black group/slider">
            {/* Slider container */}
            <div
                ref={sliderRef}
                className="no-scrollbar flex w-full h-auto overflow-x-hidden scroll-smooth"
            >
                {items.map((item, idx) => (
                    <div key={item.Id || idx} className="w-full flex-shrink-0 relative h-auto">
                        <img
                            src={getImageUrl(item?.Thumbnail)}
                            alt={item?.Title || `Slide ${idx + 1}`}
                            className="w-full h-auto block object-cover"
                        />
                    </div>
                ))}
            </div>

            {/* Navigation buttons */}
            <button
                onClick={() => scroll("left")}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-black/30 text-white opacity-0 group-hover/slider:opacity-100 transition-opacity hover:bg-black/60 backdrop-blur-sm"
                aria-label="Previous slide"
            >
                <ChevronLeft size={32} />
            </button>

            <button
                onClick={() => scroll("right")}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-12 h-12 flex items-center justify-center rounded-full bg-black/30 text-white opacity-0 group-hover/slider:opacity-100 transition-opacity hover:bg-black/60 backdrop-blur-sm"
                aria-label="Next slide"
            >
                <ChevronRight size={32} />
            </button>

            {/* Pagination dots (simple indicators) */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
                {items.map((_, idx) => (
                    <div
                        key={idx}
                        className={`w-2 h-2 rounded-full transition-all ${currentIndex === idx ? "bg-white w-4" : "bg-white/40"
                            }`}
                    />
                ))}
            </div>

            <style>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
}
