import React, { useEffect, useState, useCallback } from "react";
import { LayoutGrid, List, Package, ArrowRight, X } from "lucide-react";
import { BASE_URL, IMAGE_URL, PAGE_ID } from "@/config";
import { priceFormatter, handleOpenLink } from "../HelperComps/TextCaseComp";

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

export default function UniversitySixteen({
    dataSource,
    headingTitle,
    subHeadingTitle,
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
    const [modalImage, setModalImage] = useState<string | null>(null);
    const [contactInfo, setContactInfo] = useState<any>(null);

    useEffect(() => {
        const fetchContactInfo = async () => {
            try {
                const res = await fetch(`${BASE_URL}/contactInfo/api/byPageId/${PAGE_ID}`);
                const result = await res.json();
                const info = Array.isArray(result) ? result[0] : result;
                setContactInfo(info);
            } catch (err) {
                console.error("Error fetching contact info", err);
            }
        };
        fetchContactInfo();
    }, []);

    // Use prefetched data if available, otherwise use local state
    const items = hasPreFetchedData ? prefetchedItems : localItems;
    const loading = hasPreFetchedData ? (prefetchedLoading ?? false) : localLoading;
    const error = hasPreFetchedData ? prefetchedError : localError;

    // Only fetch if no pre-fetched data is provided (backward compatibility)
    const getData = useCallback(async () => {
        if (hasPreFetchedData) return; // Skip if data is pre-fetched

        if (!dataSource) {
            setLocalError("No data source provided");
            setLocalLoading(false);
            return;
        }

        const url = customAPI
            ? `${BASE_URL}${customAPI}`
            : `${BASE_URL}/${dataSource}/api/byPageId/byPage/${PAGE_ID}/1`;

        // Generate a cache key
        const cacheKey = `common_one_cache_${btoa(url).substring(0, 32)}`; // Simple hash

        let hasCache = false;

        try {
            // 1. Try Cache
            const cached = localStorage.getItem(cacheKey);
            if (cached) {
                const parsed = JSON.parse(cached);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    setLocalItems(parsed);
                    setLocalLoading(false);
                    hasCache = true;
                    console.log(`[CommonOne] Using cache for ${dataSource}`);
                }
            }
        } catch (e) {
            console.warn("Cache read error", e);
        }

        try {
            // 2. Fetch Network
            if (!hasCache) {
                setLocalLoading(true);
                setLocalError(null);
            }

            const response = await fetch(url);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);

            const result = await response.json();
            const data = Array.isArray(result) ? result :
                (result && Array.isArray(result.data)) ? result.data : [];

            // 3. Update Cache & State
            if (data) {
                // Save to cache
                localStorage.setItem(cacheKey, JSON.stringify(data));

                // Compare before update to avoid unnecessary re-render? 
                // React handles this, but we can be explicit if we want.
                // Simple replacement as requested.
                setLocalItems(data);
            }
        } catch (err) {
            const message = err instanceof Error ? err.message : "Error fetching data";
            console.error(message, err);

            // Only show error if we didn't show cache
            if (!hasCache) {
                setLocalError(message);
                setLocalItems([]);
            }
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
            : "https://via.placeholder.com/400x300?text=No+Image";
    }, []);

    const getGridClass = () => {
        return "grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
    };

    const Skeleton = () => (
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden animate-pulse">
            <div className="w-full aspect-[4/3] bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100" />
            <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-2/3" />
            </div>
        </div>
    );

    if (error) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-12">
                <div className="relative overflow-hidden bg-gradient-to-r from-red-50 to-rose-50 border-l-4 border-red-500 rounded-2xl p-8 shadow-xl">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-red-100/30 rounded-full blur-3xl" />
                    <div className="relative flex items-center gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center shadow-lg">
                            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-red-900 font-bold text-lg">Error Loading Data</h3>
                            <p className="text-red-700 mt-1">{error}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="py-8 sm:py-12 px-2 sm:px-4 bg-page text-page transition-colors duration-300">
            <div className="max-w-7xl mx-auto">
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 px-4 gap-4 sm:gap-0">
                    <div className="flex-1 w-full sm:w-auto">
                        <h2 id="page-heading-title-color" className="text-3xl font-bold tracking-tight text-[var(--theme-primary-bg)]">
                            {headingTitle}
                        </h2>
                        {subHeadingTitle && (
                            <p className="mt-1 text-base text-gray-900 font-medium">
                                {subHeadingTitle}
                            </p>
                        )}
                    </div>


                    {/* Right: View All */}
                    <div className="flex items-center gap-4">
                        {!loading && items.length > 0 && (
                            <button
                                onClick={() => (window.location.href = `/${dataSource}`)}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold text-white bg-[var(--theme-primary-bg)] hover:shadow-lg hover:shadow-[var(--theme-primary-bg)]/20 transition-all"
                            >
                                View All
                                <ArrowRight size={16} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Content Container */}
                <div className="w-full">
                    <div className={`grid ${getGridClass()} gap-4 sm:gap-6`}>
                        {loading ? (
                            Array.from({ length: 8 }).map((_, idx) => <Skeleton key={idx} />)
                        ) : items.length === 0 ? (
                            <div className="col-span-full flex flex-col items-center justify-center py-24 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                                <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4">
                                    <Package className="w-8 h-8 text-gray-300" />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">No items found</h3>
                                <p className="text-gray-500 mt-1">Check back later for updates.</p>
                            </div>
                        ) : (
                            items.map((item, idx) => {
                                const imageUrl = getImageUrl(item.Thumbnail);
                                const title = item.Title || "Untitled";
                                const description = item.Description || "";

                                return (
                                    <div
                                        key={item.Id || idx}
                                        className="group relative bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-[var(--theme-primary-bg)]/5 border border-gray-100 transition-all duration-500 hover:-translate-y-2 flex flex-col h-full"
                                    >
                                        <div
                                            className="relative aspect-[4/3] overflow-hidden bg-gray-50 cursor-zoom-in"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setModalImage(imageUrl);
                                            }}
                                        >
                                            <img
                                                src={imageUrl}
                                                alt={title}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
                                        </div>

                                        <div className="p-4 sm:p-6 flex-1 flex flex-col bg-white">
                                            <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-[var(--theme-primary-bg)] transition-colors min-h-[3.5rem] leading-snug">
                                                {title}
                                            </h3>

                                            {description && (
                                                <p className="text-gray-500 text-sm leading-relaxed mb-6 line-clamp-3 flex-1">
                                                    {description}
                                                </p>
                                            )}

                                            <div className="mt-auto space-y-4">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleOpenLink(contactInfo?.GoogleFormLink);
                                                    }}
                                                    className="w-full py-3 bg-[var(--theme-primary-bg)] text-white text-sm font-bold rounded-2xl hover:brightness-110 transition-all transform active:scale-95 shadow-md shadow-[var(--theme-primary-bg)]/20"
                                                >
                                                    Request Details
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>

            {modalImage && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300"
                    onClick={() => setModalImage(null)}
                >
                    <button
                        onClick={() => setModalImage(null)}
                        className="absolute top-6 right-6 p-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all backdrop-blur-sm"
                    >
                        <X size={24} />
                    </button>
                    <img
                        src={modalImage}
                        alt="Preview"
                        className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    />
                </div>
            )}
        </div>
    );
}
