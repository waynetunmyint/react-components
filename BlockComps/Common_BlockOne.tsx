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

export default function CommonBlockOne({
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
                return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
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
        <div className="py-12 px-4 bg-page text-page transition-colors duration-300">
            <div className="max-w-7xl mx-auto">
                <BlockHeader
                    headingTitle={headingTitle}
                    subHeadingTitle={subHeadingTitle}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                    dataSource={dataSource}
                    showViewAll={!loading && items.length > 0}
                />

                <div className={viewMode === "list" ? "flex flex-col gap-4 md:gap-5" : `grid ${getGridClass()} gap-4 md:gap-5`}>
                    {loading ? (
                        Array.from({ length: 4 }).map((_, idx) => <Skeleton key={idx} />)
                    ) : items.length === 0 ? (
                        <div className="col-span-full flex flex-col items-center justify-center py-24">
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">No items found</h3>
                        </div>
                    ) : (
                        items.map((item, idx) => {
                            const imageUrl = getImageUrl(item.Thumbnail);
                            const title = item.Title || "Untitled";
                            const description = item.Description || "No description available";

                            if (viewMode === "list") {
                                return (
                                    <div
                                        key={item.Id || idx}
                                        className="group bg-white rounded-2xl p-4 shadow-sm hover:shadow-md border border-gray-200/60 transition-all duration-200 ease-out cursor-pointer"
                                        onClick={() => handleNavigation(item.Id)}
                                    >
                                        <div className="flex gap-4">
                                            <div className="flex-1 flex flex-col gap-2 min-w-0">
                                                <h3 className="font-semibold text-gray-900 text-lg line-clamp-1 group-hover:text-[var(--theme-primary-bg)] transition-colors">
                                                    {title}
                                                </h3>
                                                {description && (
                                                    <div className="mt-3 pt-3 border-t border-gray-100">
                                                        <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
                                                            {description}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <div
                                    key={item.Id || idx}
                                    className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg border border-gray-100 transition-all duration-200 ease-out hover:-translate-y-1 cursor-pointer"
                                    onClick={() => handleNavigation(item.Id)}
                                >
                                    <div className="relative overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200 aspect-[4/3]">
                                        <img
                                            src={imageUrl}
                                            alt={title}
                                            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-200 ease-out"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div
                                                className="w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-sm"
                                                onClick={(e) => { e.stopPropagation(); setModalImage(imageUrl); }}
                                            >
                                                <X size={20} className="text-gray-800 rotate-45" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-5 relative z-20">
                                        <h3 className="font-semibold text-gray-900 text-lg mb-2 line-clamp-2 group-hover:text-[var(--theme-primary-bg)] transition-colors">
                                            {title}
                                        </h3>
                                        <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed mb-3">
                                            {description}
                                        </p>
                                        {item.BookAuthorTitle && (
                                            <p className="font-semibold text-gray-700 text-sm mb-3">
                                                {item.BookAuthorTitle}
                                            </p>
                                        )}
                                        {item.Price && (
                                            <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-100">
                                                <span className="font-bold text-lg text-[var(--theme-primary-bg)]">
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

            {modalImage && (
                <div
                    className="fixed inset-0 bg-black/95 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300"
                    onClick={() => setModalImage(null)}
                >
                    <button
                        onClick={() => setModalImage(null)}
                        className="absolute top-6 right-6 text-white bg-white/10 hover:bg-white/20 rounded-full p-3 transition-all duration-300 hover:rotate-90"
                    >
                        <X size={24} />
                    </button>
                    <img src={modalImage} alt="Preview" className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl" onClick={(e) => e.stopPropagation()} />
                </div>
            )}
        </div>
    );
}
