import React, { useState, useCallback } from "react";
import { Package, ArrowRight, Eye, X } from "lucide-react";
import { IMAGE_URL } from "../../../config";
import { formatPrice } from "../HelperComps/TextCaseComp";
import BlockHeader from "../BlockComps/BlockHeader";

interface Props {
    dataSource: string;
    headingTitle?: string | null;
    subHeadingTitle?: string | null;
    items?: any[];
    loading?: boolean;
    error?: string | null;
}

export default function ArticleOne({
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

    const getImageUrl = useCallback((thumbnail?: string) => {
        return thumbnail ? `${IMAGE_URL}/uploads/${thumbnail}` : "https://via.placeholder.com/800x600?text=No+Image";
    }, []);

    const navigateTo = useCallback((id?: string | number) => {
        if (!id) return;
        window.location.href = `/${dataSource}/view/${id}`;
    }, [dataSource]);

    const onKey = (e: React.KeyboardEvent, id?: string | number) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            navigateTo(id);
        }
    };

    const SkeletonCard = () => (
        <article className="bg-white rounded-3xl overflow-hidden shadow-sm animate-pulse">
            <div className="w-full aspect-[16/9] bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100" />
            <div className="p-5 space-y-3">
                <div className="h-5 bg-gray-200 rounded-lg w-3/4" />
                <div className="h-4 bg-gray-100 rounded-lg w-full" />
                <div className="h-4 bg-gray-100 rounded-lg w-2/3" />
            </div>
        </article>
    );

    const gridCols = () => {
        switch (viewMode) {
            case "grid": return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
            case "largeGrid": return "grid-cols-1 sm:grid-cols-2";
            case "list": default: return "grid-cols-1";
        }
    };

    if (error) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-12 text-center text-red-500">
                <p>{error}</p>
            </div>
        );
    }

    return (
        <section id="block-articles" className="py-12 px-4 bg-page text-page transition-colors duration-300">
            <div className="max-w-7xl mx-auto">
                <BlockHeader
                    headingTitle={headingTitle}
                    subHeadingTitle={subHeadingTitle}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                    dataSource={dataSource}
                    showViewAll={!loading && items.length > 0}
                />

                {loading ? (
                    <div className={`grid gap-6 ${gridCols()}`}>
                        {Array.from({ length: 6 }).map((_, i) => (
                            <SkeletonCard key={i} />
                        ))}
                    </div>
                ) : items.length === 0 ? (
                    <div className="text-center py-24 bg-white rounded-3xl border border-gray-100 shadow-sm">
                        <div className="mx-auto w-24 h-24 rounded-full flex items-center justify-center mb-6 bg-gray-50">
                            <Package className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">No articles found</h3>
                    </div>
                ) : (
                    <div className={viewMode === "list" ? "flex flex-col gap-5" : `grid gap-6 ${gridCols()}`}>
                        {items.map((item, idx) => {
                            const img = getImageUrl(item.Thumbnail);
                            const title = item.Title || "Untitled";
                            const excerpt = item.Description || item.Summary || "";

                            if (viewMode === "list") {
                                return (
                                    <article
                                        key={item.Id || idx}
                                        tabIndex={0}
                                        onKeyDown={(e) => onKey(e, item.Id)}
                                        onClick={() => navigateTo(item.Id)}
                                        className="group flex flex-col sm:flex-row gap-5 bg-white rounded-3xl p-5 cursor-pointer shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 hover:-translate-y-1"
                                    >
                                        <div className="w-full sm:w-64 aspect-[16/9] rounded-2xl overflow-hidden relative flex-shrink-0">
                                            <img src={img} alt={title} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        </div>
                                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                                            <h3 className="font-bold text-xl text-gray-900 mb-2 group-hover:text-[var(--theme-primary-bg)] transition-colors">{title}</h3>
                                            {excerpt && <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed mb-4">{excerpt}</p>}
                                            <div className="mt-auto flex items-center gap-4 text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                <span>{item.Author || item.Publisher || item?.ViewCount + " Views" || "Unknown Author"}</span>
                                                {item.Price && <span className="text-[var(--theme-primary-bg)] font-bold bg-[rgba(var(--theme-primary-bg-rgb),0.1)] px-2 py-1 rounded-md">{formatPrice(item.Price)}</span>}
                                            </div>
                                        </div>
                                        <div className="hidden sm:flex items-center self-center text-gray-300 group-hover:text-[var(--theme-primary-bg)] transition-colors pr-2">
                                            <ArrowRight size={24} />
                                        </div>
                                    </article>
                                );
                            }

                            return (
                                <article
                                    key={item.Id || idx}
                                    tabIndex={0}
                                    onKeyDown={(e) => onKey(e, item.Id)}
                                    onClick={() => navigateTo(item.Id)}
                                    className="group relative bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-[rgba(var(--theme-primary-bg-rgb),0.1)] border border-gray-100 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                                >
                                    <div className="w-full aspect-[16/9] bg-gray-100 relative overflow-hidden">
                                        <img src={img} alt={title} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setModalImage(img);
                                            }}
                                            className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-md rounded-full shadow-lg opacity-0 group-hover:opacity-100 transform scale-75 group-hover:scale-100 transition-all duration-300 hover:bg-white z-10"
                                        >
                                            <Eye size={16} className="text-gray-700" />
                                        </button>
                                    </div>
                                    <div className="p-6">
                                        <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 leading-tight group-hover:text-[var(--theme-primary-bg)] transition-colors">{title}</h3>
                                        {excerpt && <p className="text-gray-500 text-sm line-clamp-3 leading-relaxed mb-4">{excerpt}</p>}
                                        <div className="flex items-center justify-between pt-4 border-t border-gray-100 text-xs text-gray-500 font-medium">
                                            <span className="truncate max-w-[60%]">{item.Author || item.Publisher || item?.ViewCount + " Views" || "Unknown Author"}</span>
                                            {item.Price ? (
                                                <span className="text-[var(--theme-primary-bg)] font-bold bg-[rgba(var(--theme-primary-bg-rgb),0.1)] px-2 py-1 rounded-md">{formatPrice(item.Price)}</span>
                                            ) : (
                                                <div className="flex items-center gap-1 group-hover:text-[var(--theme-primary-bg)] transition-colors">
                                                    Read More <ArrowRight size={12} />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                )}
            </div>

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
        </section>
    );
}
