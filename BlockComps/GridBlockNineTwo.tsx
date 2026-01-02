import React, { useState, useCallback } from "react";
import { List, ArrowRight, Eye, X } from "lucide-react";
import { IMAGE_URL } from "@/config";
import { priceFormatter } from "../HelperComps/TextCaseComp";
import BlockHeader from "../BlockComps/BlockHeader";

interface Props {
    dataSource: string;
    headingTitle?: string | null;
    subHeadingTitle?: string | null;
    items?: any[];
    loading?: boolean;
    error?: string | null;
}

export default function GridBlockNineTwo({
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
        return thumbnail ? `${IMAGE_URL}/uploads/${thumbnail}` : "https://via.placeholder.com/400x300?text=No+Image";
    }, []);

    const handleNavigation = useCallback((id: string | number) => {
        if (dataSource && id) window.location.href = `/${dataSource}/view/${id}`;
    }, [dataSource]);

    const getGridClass = () => {
        switch (viewMode) {
            case "grid": return "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6";
            case "largeGrid": return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
            default: return "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6";
        }
    };

    const Skeleton = () => (
        <div className="bg-white rounded-3xl overflow-hidden animate-pulse shadow-sm">
            <div className="w-full aspect-[4/3] bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100" />
            <div className="p-5 space-y-3">
                <div className="h-5 bg-gray-200 rounded-lg w-3/4" />
                <div className="h-4 bg-gray-100 rounded-lg w-full" />
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
        <div className="py-12 px-4 bg-gray-50/50">
            <div className="max-w-7xl mx-auto">
                <BlockHeader
                    headingTitle={headingTitle}
                    subHeadingTitle={subHeadingTitle}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                    dataSource={dataSource}
                    showViewAll={!loading && items.length > 0}
                />

                {/* Grid Content */}
                <div className={viewMode === "list" ? "flex flex-col gap-4" : `grid ${getGridClass()} gap-6`}>
                    {loading ? (
                        Array.from({ length: 4 }).map((_, idx) => <Skeleton key={idx} />)
                    ) : items.length === 0 ? (
                        <div className="col-span-full flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No items found</h3>
                            <p className="text-gray-500">No items are available at the moment.</p>
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
                                        className="group flex flex-col sm:flex-row gap-5 bg-white rounded-3xl p-5 shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 cursor-pointer"
                                        onClick={() => handleNavigation(item.Id)}
                                    >
                                        <div className="w-full sm:w-48 aspect-[4/3] rounded-2xl overflow-hidden relative">
                                            <img
                                                src={imageUrl}
                                                alt={title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        </div>
                                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                                            <h3 className="font-bold text-xl text-gray-900 mb-2 group-hover:text-[var(--theme-primary-bg)] transition-colors">{title}</h3>
                                            {description && <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed mb-4">{description}</p>}
                                            <div className="mt-auto flex items-center justify-between">
                                                {item.Price && (
                                                    <span className="text-lg font-bold text-[var(--theme-primary-bg)]">{priceFormatter(item.Price)}</span>
                                                )}
                                                <div className="flex items-center gap-1 text-sm font-semibold text-[var(--theme-primary-bg)] opacity-0 group-hover:opacity-100 transform translate-x-[-10px] group-hover:translate-x-0 transition-all duration-300">
                                                    View Details <ArrowRight size={16} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <div
                                    key={item.Id || idx}
                                    className="group relative bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl border border-gray-100 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                                    onClick={() => handleNavigation(item.Id)}
                                >
                                    {/* Image */}
                                    <div className="relative overflow-hidden aspect-[4/3] bg-gray-100">
                                        <img
                                            src={imageUrl}
                                            alt={title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setModalImage(imageUrl);
                                            }}
                                            className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-md rounded-full shadow-lg opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300 hover:bg-white z-10"
                                        >
                                            <Eye size={16} className="text-gray-700" />
                                        </button>
                                    </div>

                                    <div className="p-6">
                                        <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 leading-tight group-hover:text-[var(--theme-primary-bg)] transition-colors">
                                            {title}
                                        </h3>
                                        {description && (
                                            <p className="text-gray-500 text-sm line-clamp-2 mb-4 leading-relaxed">
                                                {description}
                                            </p>
                                        )}
                                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                                            {item.Price ? (
                                                <span className="text-lg font-bold text-[var(--theme-primary-bg)]">
                                                    {priceFormatter(item.Price)}
                                                </span>
                                            ) : (
                                                <span className="text-sm font-medium text-gray-400">View Details</span>
                                            )}
                                            <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-[rgba(var(--theme-primary-bg-rgb),0.1)] group-hover:text-[var(--theme-primary-bg)] transition-colors">
                                                <ArrowRight size={16} className="-ml-0.5" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Image Modal */}
            {modalImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 animate-in fade-in duration-200"
                    onClick={() => setModalImage(null)}
                >
                    <button
                        onClick={() => setModalImage(null)}
                        className="absolute top-6 right-6 p-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all"
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
