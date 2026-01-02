import React, { useState, useCallback } from "react";
import { IMAGE_URL } from "@/config";
import BlockHeader from "../BlockComps/BlockHeader";

interface Props {
    dataSource: string;
    headingTitle?: string | null;
    subHeadingTitle?: string | null;
    items?: any[];
    loading?: boolean;
    error?: string | null;
}

export default function AuthorOne({
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

    const getImageUrl = useCallback((thumbnail: string | undefined) => {
        return thumbnail
            ? `${IMAGE_URL}/uploads/${thumbnail}`
            : "https://via.placeholder.com/400x300?text=No+Image";
    }, []);

    const getGridClass = () => {
        switch (viewMode) {
            case "grid":
                return "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6";
            case "largeGrid":
                return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
            default:
                return "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6";
        }
    };

    const handleNavigation = useCallback(
        (id: string | number) => {
            if (dataSource && id) {
                window.location.href = `/${dataSource}/view/${id}`;
            }
        },
        [dataSource]
    );

    if (error) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-12 text-center text-red-500">
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div className="py-8 px-4 bg-page">
            <div className="max-w-7xl mx-auto">
                <BlockHeader
                    headingTitle={headingTitle}
                    subHeadingTitle={subHeadingTitle}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                    dataSource={dataSource}
                    showViewAll={!loading && items.length > 0}
                />

                <div className={viewMode === "list" ? "flex flex-col gap-4 px-4" : `grid ${getGridClass()} gap-4 px-4`}>
                    {loading ? (
                        Array.from({ length: 6 }).map((_, idx) => (
                            <div key={idx} className="flex flex-col">
                                <div className="w-full aspect-square bg-gray-100 rounded-2xl animate-pulse" />
                                <div className="mt-2 h-4 bg-gray-100 rounded-full w-3/4" />
                                <div className="mt-1 h-3 bg-gray-100 rounded-full w-1/2" />
                            </div>
                        ))
                    ) : items.length === 0 ? (
                        <div className="col-span-full flex flex-col items-center justify-center py-16">
                            <h3 className="text-lg font-semibold text-page mb-1">
                                No items found
                            </h3>
                        </div>
                    ) : (
                        items.map((item, idx) => {
                            const imageUrl = getImageUrl(item.Thumbnail);
                            const title = item.Title || "Untitled";
                            const description = item.Description || "";
                            const count = item.Count || item.Total || item.BookCount || 0;

                            if (viewMode === "list") {
                                return (
                                    <div
                                        key={item.Id || idx}
                                        onClick={() => handleNavigation(item.Id)}
                                        className="group flex gap-4 bg-white rounded-2xl p-4 shadow-sm hover:shadow-lg border border-gray-100 transition-all cursor-pointer"
                                    >
                                        <div className="w-32 h-32 rounded-xl overflow-hidden flex-shrink-0">
                                            <img src={imageUrl} alt={title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                        </div>
                                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                                            <h3 className="font-bold text-gray-900 group-hover:text-[var(--theme-primary-bg)] transition-colors">{title}</h3>
                                            {description && <p className="text-gray-500 text-sm line-clamp-2 mt-1">{description}</p>}
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <div
                                    key={item.Id || idx}
                                    onClick={() => handleNavigation(item.Id)}
                                    className="flex flex-col cursor-pointer group"
                                >
                                    <div className="w-full aspect-square bg-gray-100 rounded-2xl overflow-hidden shadow-sm group-hover:shadow-lg transition-all">
                                        <img
                                            src={imageUrl}
                                            alt={title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    </div>
                                    <div className="mt-2 text-center px-1">
                                        <div className="font-medium text-sm text-page line-clamp-1 group-hover:text-[var(--theme-primary-bg)] transition-colors">
                                            {title}
                                        </div>
                                        {count > 0 && (
                                            <div className="text-xs text-page-secondary mt-0.5">
                                                {count} {count === 1 ? 'item' : 'items'}
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
