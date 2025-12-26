import React, { useState, useCallback } from "react";
import { List, LayoutGrid, ArrowRight, X, Video, Users, Clock, Layers } from "lucide-react";
import { IMAGE_URL } from "../../../config";
import BlockHeader from "../BlockComps/BlockHeader";

interface Props {
    dataSource: string;
    headingTitle?: string | null;
    subHeadingTitle?: string | null;
    items?: any[];
    loading?: boolean;
    error?: string | null;
}

export default function CourseTwelve({
    dataSource,
    headingTitle,
    subHeadingTitle,
    items = [],
    loading = false,
    error = null,
}: Props) {
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
        <div className="bg-white rounded-[2rem] shadow-sm overflow-hidden animate-pulse border border-gray-100">
            <div className="w-full aspect-[4/3] bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100" />
            <div className="p-8 space-y-4">
                <div className="h-6 bg-gray-100 rounded-full w-3/4" />
                <div className="h-4 bg-gray-100 rounded-full w-1/2" />
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
        <section className="py-20 md:py-28 bg-gradient-to-b from-white via-gray-50/50 to-white overflow-hidden relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <BlockHeader
                    headingTitle={headingTitle || "Featured Courses"}
                    subHeadingTitle={subHeadingTitle}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                    dataSource={dataSource}
                    showViewAll={!loading && items.length > 0}
                />

                <div className={viewMode === "list" ? "flex flex-col gap-4" : `grid ${getGridClass()} gap-3 sm:gap-6`}>
                    {loading ? (
                        Array.from({ length: 4 }).map((_, idx) => <Skeleton key={idx} />)
                    ) : items.length === 0 ? (
                        <div className="col-span-full flex flex-col items-center justify-center py-24 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">No items found</h3>
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
                                        className="group bg-white rounded-[2rem] p-5 shadow-sm hover:shadow-xl border border-gray-100/80 transition-all duration-500 cursor-pointer flex flex-col md:flex-row gap-8 items-center"
                                        onClick={() => handleNavigation(item.Id)}
                                    >
                                        <div className="relative w-full md:w-64 aspect-square rounded-2xl overflow-hidden bg-gray-100">
                                            <img src={imageUrl} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                        </div>
                                        <div className="flex-1 py-2 min-w-0 text-left">
                                            <h3 className="font-extrabold text-2xl text-gray-900 mb-3 group-hover:text-[var(--theme-primary-bg)] transition-colors">{title}</h3>
                                            <p className="text-gray-600 line-clamp-2 mb-6">{description}</p>
                                            <div className="grid grid-cols-3 gap-6 py-6 border-y border-gray-100/50 mb-6">
                                                <div className="flex flex-col">
                                                    <Layers size={20} className="mb-1 text-gray-400" />
                                                    <span className="text-sm font-bold text-gray-900">{item.CourseLevelTitle || 'General'}</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    {(item.IsZoom == "1" || item.IsZoom === "Yes") ? <Video size={20} className="mb-1 text-blue-500" /> : <Users size={20} className="mb-1 text-emerald-500" />}
                                                    <span className="text-sm font-bold text-gray-900">{(item.IsZoom == "1" || item.IsZoom === "Yes") ? "Zoom" : "Class"}</span>
                                                </div>
                                                <div className="flex flex-col">
                                                    <Clock size={20} className="mb-1 text-gray-400" />
                                                    <span className="text-sm font-bold text-gray-900">{item.Duration || '12-Wk'}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }

                            return (
                                <div
                                    key={item.Id || idx}
                                    className="group relative bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl border border-gray-100/80 transition-all duration-500 hover:-translate-y-2 cursor-pointer flex flex-col"
                                    onClick={() => handleNavigation(item.Id)}
                                >
                                    <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
                                        <img src={imageUrl} alt={title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    </div>
                                    <div className="p-6 md:p-8 flex-1 flex flex-col">
                                        <h3 className="font-extrabold text-xl md:text-2xl text-gray-900 mb-3 line-clamp-2 group-hover:text-[var(--theme-primary-bg)] transition-colors">{title}</h3>
                                        <p className="text-gray-600 text-sm md:text-base line-clamp-3 mb-6 flex-1 text-left">{description}</p>
                                        <div className="grid grid-cols-3 gap-2 py-5 border-y border-gray-100/50 my-2">
                                            <div className="flex flex-col items-center">
                                                <Layers size={20} className="text-gray-400 mb-1" />
                                                <span className="text-xs font-bold text-gray-900 truncate">{item.CourseLevelTitle || 'Gen'}</span>
                                            </div>
                                            <div className="flex flex-col items-center border-x border-gray-100">
                                                {(item.IsZoom == "1" || item.IsZoom === "Yes") ? <Video size={20} className="text-blue-500 mb-1" /> : <Users size={20} className="text-emerald-500 mb-1" />}
                                                <span className="text-xs font-bold text-gray-900">{(item.IsZoom == "1" || item.IsZoom === "Yes") ? "Zoom" : "Class"}</span>
                                            </div>
                                            <div className="flex flex-col items-center">
                                                <Clock size={20} className="text-gray-400 mb-1" />
                                                <span className="text-xs font-bold text-gray-900 truncate">{item.Duration || '12W'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {modalImage && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-300"
                    onClick={() => setModalImage(null)}
                >
                    <button onClick={() => setModalImage(null)} className="absolute top-6 right-6 p-2 text-white/70 hover:text-white bg-white/10 rounded-full shadow-lg backdrop-blur-sm">
                        <X size={24} />
                    </button>
                    <img src={modalImage} alt="Preview" className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" onClick={(e) => e.stopPropagation()} />
                </div>
            )}
        </section>
    );
}
