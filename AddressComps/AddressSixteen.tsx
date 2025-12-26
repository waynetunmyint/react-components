import React, { useState, useCallback } from "react";
import { Package } from "lucide-react";
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

export default function AddressSixteen({
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

    const getImageUrl = useCallback((thumbnail: string | undefined) => {
        return thumbnail
            ? `${IMAGE_URL}/uploads/${thumbnail}`
            : "https://via.placeholder.com/400x300?text=No+Image";
    }, []);

    const Skeleton = () => (
        <div className="bg-white rounded-[2rem] shadow-sm overflow-hidden border border-gray-50 flex flex-col h-full">
            <div className="relative aspect-[4/3] bg-slate-100 overflow-hidden" />
            <div className="p-6 space-y-4 flex-1 flex flex-col">
                <div className="h-5 bg-slate-100 rounded-lg w-5/6 animate-pulse" />
                <div className="h-5 bg-slate-100 rounded-lg w-3/4 animate-pulse" />
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
                <BlockHeader
                    headingTitle={headingTitle}
                    subHeadingTitle={subHeadingTitle}
                    showSwitcher={false}
                    dataSource={dataSource}
                    showViewAll={!loading && items.length > 0}
                />

                <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    {loading ? (
                        Array.from({ length: 8 }).map((_, idx) => <Skeleton key={idx} />)
                    ) : items.length === 0 ? (
                        <div className="col-span-full flex flex-col items-center justify-center py-24 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                            <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-4">
                                <Package className="w-8 h-8 text-gray-300" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">No items found</h3>
                        </div>
                    ) : (
                        items.map((item, idx) => {
                            const imageUrl = getImageUrl(item.Thumbnail);
                            const title = item.Title || "Untitled";
                            const description = item.Description || "";

                            return (
                                <div
                                    key={item.Id || idx}
                                    className="group relative bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:shadow-[var(--theme-primary-bg)]/5 border border-gray-100 transition-all duration-500 hover:-translate-y-2 flex flex-col h-full"
                                >
                                    <div className="relative aspect-[4/3] overflow-hidden bg-gray-50">
                                        <img
                                            src={imageUrl}
                                            alt={title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        />
                                    </div>
                                    <div className="p-4 sm:p-6 flex-1 flex flex-col">
                                        <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 leading-snug">{title}</h3>
                                        {description && <p className="text-gray-500 text-sm leading-relaxed line-clamp-3">{description}</p>}
                                        {item.Price && (
                                            <div className="mt-4 pt-4 border-t border-gray-50">
                                                <span className="text-lg font-bold text-[var(--theme-primary-bg)]">
                                                    {priceFormatter(item.Price)}
                                                </span>
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
