import React, { useState, useCallback } from "react";
import { List, LayoutGrid, ArrowRight, BookOpen, Eye, X } from "lucide-react";
import { IMAGE_URL } from "@/config";
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

export default function BookOne({
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
                return "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
            case "largeGrid":
                return "grid-cols-2 sm:grid-cols-2";
            default:
                return "grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4";
        }
    };

    const Skeleton = () => (
        <div className="bg-[var(--bg1)] rounded-3xl overflow-hidden shadow-sm animate-pulse">
            <div className="w-full aspect-[4/3] bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100" />
            <div className="p-5 space-y-3">
                <div className="h-5 bg-[var(--bg3)] rounded-lg w-3/4" />
                <div className="h-4 bg-[var(--bg2)] rounded-lg w-full" />
            </div>
        </div>
    );

    if (error) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-12 text-center text-[var(--r2)]">
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div id="page-block-book" className="py-16 px-4 bg-page text-page transition-colors duration-300">
            <div className="max-w-7xl mx-auto">
                <BlockHeader
                    headingTitle={headingTitle}
                    subHeadingTitle={subHeadingTitle}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                    dataSource={dataSource}
                    showViewAll={!loading && items.length > 0}
                />

                <div className={viewMode === "list" ? "flex flex-col gap-6" : `grid ${getGridClass()} gap-8`}>
                    {loading ? (
                        Array.from({ length: 4 }).map((_, idx) => <Skeleton key={idx} />)
                    ) : items.length === 0 ? (
                        <div className="col-span-full flex flex-col items-center justify-center py-24 bg-[var(--bg2)] rounded-3xl border border-dashed border-[var(--bg3)]">
                            <h3 className="text-xl font-bold text-[var(--t3)] mb-2">No items found</h3>
                        </div>
                    ) : (
                        items.map((item, idx) => {
                            const imageUrl = getImageUrl(item.Thumbnail);
                            const title = item.Title || "Untitled";
                            const description = item.Description || "";
                            const bookAuthorTitle = item.BookAuthorTitle || item.Author || "";

                            if (viewMode === "list") {
                                return (
                                    <div
                                        key={item.Id || idx}
                                        onClick={() => handleNavigation(item.Id)}
                                        className="group flex flex-col sm:flex-row gap-6 bg-[var(--bg1)] rounded-3xl p-5 shadow-sm hover:shadow-xl border border-[var(--bg2)] transition-all duration-300 cursor-pointer"
                                    >
                                        <div className="w-full sm:w-48 aspect-[4/3] rounded-2xl overflow-hidden relative bg-[var(--bg2)]">
                                            <img src={imageUrl} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                        </div>
                                        <div className="flex-1 py-2">
                                            <h3 className="font-bold text-2xl text-[var(--t3)] mb-2 group-hover:text-[var(--a2)] transition-colors">{title}</h3>
                                            {bookAuthorTitle && <p className="text-[var(--t2)] font-medium mb-2">By {bookAuthorTitle}</p>}
                                            <p className="text-[var(--t2)] line-clamp-2">{description}</p>
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <div
                                    key={item.Id || idx}
                                    onClick={() => handleNavigation(item.Id)}
                                    className="group relative bg-[var(--bg1)] rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl border border-[var(--bg2)] transition-all duration-300 hover:-translate-y-2 cursor-pointer flex flex-col"
                                >
                                    <div className="relative overflow-hidden aspect-[3/4] bg-[var(--bg2)]">
                                        <img src={imageUrl} alt={title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setModalImage(imageUrl); }}
                                                className="p-2 bg-[var(--bg1)]  rounded-xl text-[var(--t1)]"
                                            >
                                                <Eye size={20} />
                                            </button>
                                            <div className="w-8 h-8 rounded-full bg-[var(--a2)] flex items-center justify-center text-[var(--t1)]">
                                                <ArrowRight size={16} />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-4 flex-1">
                                        <h3 className="font-bold text-[var(--t3)] mb-1 line-clamp-1 group-hover:text-[var(--a2)] transition-colors">{title}</h3>
                                        {bookAuthorTitle && <p className="text-[var(--t2)] text-sm line-clamp-1">{bookAuthorTitle}</p>}
                                        {item.Price && (
                                            <div className="mt-3 pt-3 border-t border-gray-50 font-bold text-[var(--a2)]">
                                                {formatPrice(item.Price)}
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
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black  p-4 animate-in fade-in duration-300"
                    onClick={() => setModalImage(null)}
                >
                    <button
                        onClick={() => setModalImage(null)}
                        className="absolute top-6 right-6 p-2 text-[var(--t1)] hover:text-[var(--t1)] bg-[var(--bg1)] hover:bg-[var(--bg1)] rounded-full"
                    >
                        <X size={24} />
                    </button>
                    <img src={modalImage} alt="Preview" className="max-w-full max-h-[90vh] object-contain rounded-xl shadow-2xl" onClick={(e) => e.stopPropagation()} />
                </div>
            )}
        </div>
    );
}
