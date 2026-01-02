import React, { useState, useCallback } from "react";
import { ArrowRight, X } from "lucide-react";
import { IMAGE_URL } from "@/config";
import BlockHeader from "../BlockComps/BlockHeader";

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

export default function BookAuthorSix({
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
        if (viewMode === "list") return "flex flex-col";
        switch (viewMode) {
            case "grid":
                return "grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6";
            case "largeGrid":
                return "grid-cols-2 sm:grid-cols-3";
            default:
                return "grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6";
        }
    };

    const Skeleton = () => (
        <div className="flex flex-col items-center animate-pulse">
            <div className="w-full aspect-square bg-[var(--bg3)] mb-3" />
            <div className="h-4 bg-[var(--bg2)] rounded-full w-3/4" />
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
        <div className="py-8 sm:py-12 px-2 sm:px-4">
            <div className="max-w-7xl mx-auto">
                <BlockHeader
                    headingTitle={headingTitle}
                    subHeadingTitle={subHeadingTitle}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                    dataSource={dataSource}
                    showViewAll={!loading && items.length > 0}
                />

                {/* Content Container */}
                <div className={
                    viewMode === "list"
                        ? "flex flex-col gap-8"
                        : `grid ${getGridClass()} gap-6 sm:gap-10`
                }>

                    {loading ? (
                        Array.from({ length: 12 }).map((_, idx) => <Skeleton key={idx} />)
                    ) : items.length === 0 ? (
                        <div className="col-span-full text-center py-20 text-[var(--t2)]">
                            No items found.
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
                                        className="group cursor-pointer flex gap-4 sm:gap-6 items-start sm:items-center bg-[var(--bg1)] p-2 hover:bg-[var(--bg2)] transition-colors"
                                        onClick={() => handleNavigation(item.Id)}
                                    >
                                        <div className="w-24 h-24 sm:w-40 sm:h-40 flex-shrink-0 overflow-hidden bg-[var(--bg2)]">
                                            <img
                                                src={imageUrl}
                                                alt={title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        </div>
                                        <div className="flex-1 py-1">
                                            <h3 className="font-bold text-lg sm:text-2xl text-[var(--t3)] mb-2 group-hover:text-[var(--a2)] transition-colors">
                                                {title}
                                            </h3>
                                            {description && (
                                                <p className="text-[var(--t2)] text-sm sm:text-base line-clamp-2 sm:line-clamp-3 leading-relaxed mb-4">
                                                    {description}
                                                </p>
                                            )}
                                            <div className="flex items-center text-sm font-bold text-[var(--a2)] opacity-0 group-hover:opacity-100 transform -translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                                                View Details <ArrowRight size={16} className="ml-1" />
                                            </div>
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <div
                                    key={item.Id || idx}
                                    className="group cursor-pointer flex flex-col items-center"
                                    onClick={() => handleNavigation(item.Id)}
                                >
                                    <div className="w-full aspect-square overflow-hidden mb-4 shadow-sm group-hover:shadow-xl transition-all duration-500 bg-[var(--bg2)]">
                                        <img
                                            src={imageUrl}
                                            alt={title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setModalImage(imageUrl);
                                            }}
                                        />
                                    </div>
                                    <h3 className="text-center font-bold text-[var(--t3)] text-sm sm:text-base px-2 line-clamp-2 leading-snug group-hover:text-[var(--a2)] transition-colors">
                                        {title}
                                    </h3>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {modalImage && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black p-4 animate-in fade-in duration-300"
                    onClick={() => setModalImage(null)}
                >
                    <button
                        onClick={() => setModalImage(null)}
                        className="absolute top-6 right-6 p-2 text-[var(--t1)] hover:text-[var(--t1)] bg-gray-800 rounded-full transition-all"
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
