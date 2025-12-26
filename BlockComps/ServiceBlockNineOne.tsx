import React, { useState, useCallback } from "react";
import { List, LayoutGrid, ArrowRight, Briefcase, ChevronRight } from "lucide-react";
import BlockHeader from "../BlockComps/BlockHeader";

interface Props {
    dataSource: string;
    headingTitle?: string | null;
    subHeadingTitle?: string | null;
    items?: any[];
    loading?: boolean;
    error?: string | null;
}

export default function ServiceBlockNineOne({
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

    const handleNavigation = useCallback((id: string | number) => {
        if (dataSource && id) window.location.href = `/${dataSource}/view/${id}`;
    }, [dataSource]);

    const getGridClass = () => {
        switch (viewMode) {
            case "grid": return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
            case "largeGrid": return "grid-cols-1 sm:grid-cols-2";
            default: return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";
        }
    };

    const colors = [
        { bg: "from-[var(--theme-primary-bg)] to-[var(--theme-accent)]", light: "from-[rgba(var(--theme-primary-bg-rgb),0.1)] to-[rgba(var(--theme-primary-bg-rgb),0.05)]", border: "border-[rgba(var(--theme-primary-bg-rgb),0.2)]" },
    ];

    const Skeleton = () => (
        <div className="bg-white rounded-3xl p-6 animate-pulse border border-gray-100">
            <div className="w-14 h-14 bg-gray-200 rounded-2xl mb-4" />
            <div className="h-6 bg-gray-200 rounded-lg w-3/4 mb-3" />
            <div className="h-4 bg-gray-100 rounded-lg w-full mb-2" />
            <div className="h-4 bg-gray-100 rounded-lg w-5/6" />
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
        <div className="py-16 px-4 bg-gradient-to-b from-gray-50 to-white">
            <div className="max-w-7xl mx-auto">
                <BlockHeader
                    headingTitle={headingTitle || "Services"}
                    subHeadingTitle={subHeadingTitle}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                    dataSource={dataSource}
                    showViewAll={!loading && items.length > 0}
                />

                {/* Services Grid */}
                <div className={viewMode === "list" ? "flex flex-col gap-4" : `grid ${getGridClass()} gap-6`}>
                    {loading ? (
                        Array.from({ length: 6 }).map((_, idx) => <Skeleton key={idx} />)
                    ) : items.length === 0 ? (
                        <div className="col-span-full flex flex-col items-center justify-center py-20">
                            <div className="w-20 h-20 bg-gray-100 rounded-3xl flex items-center justify-center mb-5">
                                <Briefcase size={32} className="text-gray-400" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No services available</h3>
                            <p className="text-gray-500 text-center max-w-xs">Services will appear here once added.</p>
                        </div>
                    ) : (
                        items.map((item, idx) => {
                            const title = item.Title || "Untitled";
                            const description = item.Description || "";
                            const color = colors[idx % colors.length];

                            if (viewMode === "list") {
                                return (
                                    <div
                                        key={item.Id || idx}
                                        className={`group flex items-center gap-6 bg-gradient-to-r ${color.light} p-6 rounded-2xl border ${color.border} hover:shadow-lg transition-all duration-300 cursor-pointer`}
                                        onClick={() => handleNavigation(item.Id)}
                                    >
                                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${color.bg} flex items-center justify-center shadow-lg flex-shrink-0`}>
                                            <span className="text-white font-bold text-xl">{title.charAt(0)}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="font-bold text-gray-900 text-xl mb-1 group-hover:text-[var(--theme-primary-bg)] transition-colors">{title}</h3>
                                            {description && <p className="text-gray-600 line-clamp-2">{description}</p>}
                                        </div>
                                        <ChevronRight size={24} className="text-gray-400 group-hover:text-[var(--theme-primary-bg)] group-hover:translate-x-1 transition-all" />
                                    </div>
                                );
                            }

                            return (
                                <div
                                    key={item.Id || idx}
                                    className="group relative bg-white rounded-3xl p-8 shadow-sm hover:shadow-2xl border border-gray-100 transition-all duration-300 hover:-translate-y-2 cursor-pointer overflow-hidden"
                                    onClick={() => handleNavigation(item.Id)}
                                >
                                    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${color.light} rounded-full blur-3xl opacity-60 group-hover:opacity-100 transition-opacity`} />
                                    <div className="relative">
                                        <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${color.bg} flex items-center justify-center shadow-lg mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                            <span className="text-white font-bold text-2xl">{title.charAt(0)}</span>
                                        </div>
                                        <h3 className="font-bold text-gray-900 text-2xl mb-3 group-hover:text-[var(--theme-primary-bg)] transition-colors duration-200">
                                            {title}
                                        </h3>
                                        {description && (
                                            <p className="text-gray-500 leading-relaxed line-clamp-3 mb-6">{description}</p>
                                        )}
                                        <div className="flex items-center gap-2 text-[var(--theme-primary-bg)] font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <span>Learn more</span>
                                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                        </div>
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
