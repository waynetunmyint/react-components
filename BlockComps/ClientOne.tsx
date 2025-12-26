import React, { useState, useCallback } from "react";
import { Users } from "lucide-react";
import { IMAGE_URL } from "../../../config";
import BlockHeader from "../HelperComps/BlockHeader";

interface Props {
    dataSource?: string;
    headingTitle?: string | null;
    subHeadingTitle?: string | null;
    items?: any[];
    loading?: boolean;
    error?: string | null;
}

export default function ClientOne({
    dataSource = "client",
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
            : "https://via.placeholder.com/200x200?text=Logo";
    }, []);

    const handleNavigation = useCallback(
        (id: string | number) => {
            if (dataSource && id) {
                window.location.href = `/${dataSource}/view/${id}`;
            }
        },
        [dataSource]
    );

    const Skeleton = () => (
        <div className="flex flex-col items-center gap-4 animate-pulse">
            <div className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full bg-gradient-to-br from-gray-100 via-gray-200 to-gray-100" />
            <div className="h-4 bg-gray-200 rounded-full w-20" />
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
                    headingTitle={headingTitle || "Our Clients"}
                    subHeadingTitle={subHeadingTitle}
                    showSwitcher={false}
                    dataSource={dataSource}
                    showViewAll={!loading && items.length > 0}
                />

                {/* Client Grid */}
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-6 sm:gap-8 lg:gap-10">
                    {loading ? (
                        Array.from({ length: 6 }).map((_, idx) => <Skeleton key={idx} />)
                    ) : items.length === 0 ? (
                        <div className="col-span-full flex flex-col items-center justify-center py-16">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                                <Users className="w-8 h-8 text-gray-300" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">No clients found</h3>
                        </div>
                    ) : (
                        items.map((item, idx) => {
                            const imageUrl = getImageUrl(item.Thumbnail);
                            const title = item.Title || "Client";

                            return (
                                <div
                                    key={item.Id || idx}
                                    className="group flex flex-col items-center cursor-pointer"
                                    onClick={() => handleNavigation(item.Id)}
                                >
                                    {/* Circular Avatar */}
                                    <div className="relative mb-4">
                                        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[var(--theme-primary-bg)]/20 to-[var(--theme-primary-bg)]/5 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 scale-110" />
                                        <div className="relative w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-full p-1 bg-gradient-to-br from-gray-200 via-gray-100 to-gray-200 group-hover:from-[var(--theme-primary-bg)] group-hover:via-[var(--theme-accent)] group-hover:to-[var(--theme-primary-bg)] transition-all duration-500 shadow-lg group-hover:shadow-xl">
                                            <div className="w-full h-full rounded-full bg-white p-3 overflow-hidden">
                                                <img
                                                    src={imageUrl}
                                                    alt={title}
                                                    className="w-full h-full object-contain rounded-full group-hover:scale-110 transition-transform duration-500"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <h3 className="text-sm sm:text-base font-semibold text-gray-800 text-center line-clamp-2 group-hover:text-[var(--theme-primary-bg)] transition-colors duration-300 max-w-full px-2">
                                        {title}
                                    </h3>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
