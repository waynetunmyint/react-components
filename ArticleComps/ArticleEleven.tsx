import React, { useState, useCallback } from "react";
import { List, LayoutGrid, ArrowRight, X } from "lucide-react";
import { IMAGE_URL } from "../../../config";
import { priceFormatter } from "../HelperComps/TextCaseComp";
import BlockHeader from "../HelperComps/BlockHeader";

interface Props {
    dataSource: string;
    headingTitle?: string | null;
    subHeadingTitle?: string | null;
    items?: any[];
    loading?: boolean;
    error?: string | null;
}

export default function ArticleEleven({
    dataSource,
    headingTitle,
    subHeadingTitle,
    items: prefetchedItems,
    loading: prefetchedLoading,
    error: prefetchedError,
}: Props) {
    const items = prefetchedItems ?? [];
    const loading = prefetchedLoading ?? false;
    const error = prefetchedError ?? null;

    const [viewMode, setViewMode] = useState<"list" | "grid" | "largeGrid">("grid");
    const [modalImage, setModalImage] = useState<string | null>(null);

    const getImageUrl = useCallback((thumbnail: string | undefined) => {
        return thumbnail
            ? `${IMAGE_URL}/uploads/${thumbnail}`
            : "https://via.placeholder.com/400x300?text=No+Image";
    }, []);

    const handleNavigation = useCallback(
        (id: string | number) => {
            if (dataSource && id) {
                window.location.href = `/${dataSource}/view/${id}`;
            }
        },
        [dataSource]
    );

    const getGridClass = () => {
        switch (viewMode) {
            case "grid":
                return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
            case "largeGrid":
                return "grid-cols-1 sm:grid-cols-2";
            default:
                return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
        }
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
            <div className="max-w-7xl mx-auto px-4 py-12 text-center text-red-500">
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="py-8 sm:py-12 px-2 sm:px-4 bg-page text-page transition-colors duration-300">
            <div className="max-w-7xl mx-auto">
                {/* <BlockHeader
                    headingTitle={headingTitle}
                    subHeadingTitle={subHeadingTitle}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                    dataSource={dataSource}
                    showViewAll={!loading && items.length > 0}
                /> */}

                <div className={viewMode === "list" ? "flex flex-col gap-4" : `grid ${getGridClass()} gap-3 sm:gap-6`}>
                    {loading ? (
                        Array.from({ length: 4 }).map((_, idx) => <Skeleton key={idx} />)
                    ) : items.length === 0 ? (
                        <div className="col-span-full flex flex-col items-center justify-center py-24 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">No items found</h3>
                            <p className="text-gray-500 mt-1">Check back later for updates.</p>
                        </div>
                    ) : (
                        items.map((item, idx) => {
                            const imageUrl = getImageUrl(item.Thumbnail);
                            const title = item.Title || "Untitled";
                            const description = item.Description || "";

                            if (viewMode === "list") {
                                return (
                                    <div
                                        key={item.Id || idx}
                                        className="group bg-white rounded-3xl p-4 shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 cursor-pointer flex gap-6 items-center"
                                        onClick={() => handleNavigation(item.Id)}
                                    >
                                        <div className="relative w-32 h-32 sm:w-48 sm:h-32 flex-shrink-0 rounded-2xl overflow-hidden bg-gray-100">
                                            <img src={imageUrl} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        </div>
                                        <div className="flex-1 py-1 min-w-0">
                                            <h3 className="font-bold text-xl text-gray-900 mb-2 group-hover:text-[var(--theme-primary-bg)] transition-colors truncate">
                                                {title}
                                            </h3>
                                            {description && (
                                                <p className="text-gray-500 text-sm line-clamp-2">{description}</p>
                                            )}
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <div
                                    key={item.Id || idx}
                                    className="group relative bg-white rounded-2xl sm:rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl border border-gray-100 transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col"
                                    onClick={() => handleNavigation(item.Id)}
                                >
                                    <div className="relative overflow-hidden bg-gray-100 aspect-[4/3]">
                                        <img
                                            src={imageUrl}
                                            alt={title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                        {/* Header Overlay */}
                                        <div className="absolute top-0 left-0 right-0 p-3 flex items-start justify-between bg-gradient-to-b from-black/50 to-transparent">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-white/20 bg-gray-200">
                                                    {item.PageThumbnail ? (
                                                        <img
                                                            src={getImageUrl(item.PageThumbnail)}
                                                            alt={item.PageTitle || "Page"}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-gray-300" />
                                                    )}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-white text-xs font-semibold shadow-black drop-shadow-md line-clamp-1">
                                                        {item.PageTitle || "Page Name"}
                                                    </span>
                                                    {item.ViewCount !== undefined && (
                                                        <span className="text-white/80 text-[10px] font-medium shadow-black drop-shadow-md">
                                                            {item.ViewCount} views
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>


                                        <div className="absolute inset-x-0 bottom-0 p-2 flex justify-end">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setModalImage(imageUrl); }}
                                                className="p-2 bg-white/90 backdrop-blur-md rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X size={16} className="rotate-45" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-3 sm:p-5 flex-1 flex flex-col">
                                        <h3 className="font-bold text-sm sm:text-lg text-gray-900 mb-1 sm:mb-2 line-clamp-2 group-hover:text-[var(--theme-primary-bg)] transition-colors">
                                            {title}
                                        </h3>
                                        <p className="text-gray-500 text-xs sm:text-sm line-clamp-2 mb-2 sm:mb-4">{description}</p>
                                        {item.Price && (
                                            <div className="mt-auto pt-2 sm:pt-4 border-t border-gray-50 flex items-center justify-between">
                                                <span className="text-sm sm:text-lg font-bold text-[var(--theme-primary-bg)]">
                                                    {priceFormatter(item.Price)}
                                                </span>
                                                <ArrowRight size={16} className="text-gray-400 group-hover:text-[var(--theme-primary-bg)]" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
