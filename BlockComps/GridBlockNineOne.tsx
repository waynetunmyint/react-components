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

export default function GridBlockNineOne({
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
            case "grid": return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
            case "largeGrid": return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
            default: return "grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
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
        <div className="py-10 px-4">
            <div className="max-w-7xl mx-auto">
                <BlockHeader
                    headingTitle={headingTitle}
                    subHeadingTitle={subHeadingTitle}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                    dataSource={dataSource}
                    showViewAll={!loading && items.length > 0}
                />

                {/* Grid */}
                <div className={viewMode === "list" ? "flex flex-col gap-4" : `grid ${getGridClass()} gap-5`}>
                    {loading ? (
                        Array.from({ length: 4 }).map((_, idx) => <Skeleton key={idx} />)
                    ) : items.length === 0 ? (
                        <div className="col-span-full flex flex-col items-center justify-center py-20 bg-gray-50 rounded-3xl">
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
                                        className="group flex gap-4 bg-white rounded-2xl p-4 shadow-sm hover:shadow-lg border border-gray-100 transition-all cursor-pointer"
                                        onClick={() => handleNavigation(item.Id)}
                                    >
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-gray-900 text-lg mb-1 line-clamp-1 group-hover:text-[var(--theme-primary-bg)] transition-colors">{title}</h3>
                                            {description && <p className="text-gray-500 text-sm line-clamp-2">{description}</p>}
                                        </div>
                                        <ArrowRight size={20} className="text-gray-400 group-hover:text-[var(--theme-primary-bg)] group-hover:translate-x-1 transition-all self-center" />
                                    </div>
                                );
                            }

                            return (
                                <div
                                    key={item.Id || idx}
                                    className="group relative bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl border border-gray-100 transition-all duration-300 hover:-translate-y-2 cursor-pointer"
                                    onClick={() => handleNavigation(item.Id)}
                                >
                                    {/* Image */}
                                    <div className="relative overflow-hidden aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200">
                                        <img
                                            src={imageUrl}
                                            alt={title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                                        {/* Quick View Button */}
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all">
                                            <div
                                                className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg transform scale-75 group-hover:scale-100 transition-transform"
                                                onClick={(e) => { e.stopPropagation(); setModalImage(imageUrl); }}
                                            >
                                                <Eye size={20} className="text-gray-800" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-5">
                                        <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-2 group-hover:text-[var(--theme-primary-bg)] transition-colors">{title}</h3>
                                        {description && <p className="text-gray-500 text-sm line-clamp-2 mb-3">{description}</p>}
                                        {item.Price && (
                                            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-[rgba(var(--theme-primary-bg-rgb),0.1)] border border-[rgba(var(--theme-primary-bg-rgb),0.2)] rounded-full mt-2">
                                                <span className="text-[var(--theme-primary-bg)] font-bold">{priceFormatter(item.Price)}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Modal */}
            {modalImage && (
                <div className="fixed inset-0 bg-black/95 backdrop-blur-xl flex items-center justify-center z-50 p-4" onClick={() => setModalImage(null)}>
                    <button onClick={() => setModalImage(null)} className="absolute top-6 right-6 text-white bg-white/10 hover:bg-white/20 rounded-full p-3 transition-all hover:rotate-90">
                        <X size={24} />
                    </button>
                    <img src={modalImage} alt="Preview" className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl" onClick={(e) => e.stopPropagation()} />
                </div>
            )}
        </div>
    );
}
