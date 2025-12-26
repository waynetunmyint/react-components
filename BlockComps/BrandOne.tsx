import React, { useState, useCallback } from "react";
import { IMAGE_URL } from "../../../config";
import BlockHeader from "../HelperComps/BlockHeader";

interface Props {
    dataSource: string;
    headingTitle?: string | null;
    subHeadingTitle?: string | null;
    items?: any[];
    loading?: boolean;
    error?: string | null;
}

export default function BrandLogoFullPage({
    dataSource,
    headingTitle = "Our Brands",
    subHeadingTitle,
    items: prefetchedItems,
    loading: prefetchedLoading,
    error: prefetchedError,
}: Props) {
    const items = prefetchedItems ?? [];
    const loading = prefetchedLoading ?? false;
    const error = prefetchedError ?? null;

    const imgUrl = (thumb?: string) =>
        thumb
            ? `${IMAGE_URL}/uploads/${thumb}`
            : "https://via.placeholder.com/160x80?text=Logo";

    const go = (id: number | string) => {
        window.location.href = `/${dataSource}/view/${id}`;
    };

    if (error) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-12 text-center text-red-500">
                <p>{error}</p>
            </div>
        );
    }

    return (
        <main className="bg-page px-4 py-12">
            <div className="max-w-7xl mx-auto">
                <BlockHeader
                    headingTitle={headingTitle}
                    subHeadingTitle={subHeadingTitle}
                    showSwitcher={false}
                    dataSource={dataSource}
                    showViewAll={!loading && items.length > 0}
                />

                {/* Grid */}
                <section className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {loading ? (
                        Array.from({ length: 12 }).map((_, i) => (
                            <div
                                key={i}
                                className="h-20 bg-gray-100 rounded-xl animate-pulse"
                            />
                        ))
                    ) : items.length === 0 ? (
                        <div className="col-span-full py-20 text-center text-gray-500">
                            No brands available.
                        </div>
                    ) : (
                        items.map((item, idx) => (
                            <div
                                key={item.Id || idx}
                                onClick={() => go(item.Id)}
                                className="
                  cursor-pointer
                  border border-gray-100
                  rounded-2xl
                  px-4 py-6
                  flex items-center justify-center
                  bg-white
                  transition-all duration-300
                  hover:shadow-xl hover:-translate-y-1
                "
                            >
                                <img
                                    src={imgUrl(item.Thumbnail)}
                                    alt={item.Title || "Brand"}
                                    className="
                    max-h-12
                    max-w-full
                    object-contain
                    grayscale opacity-70
                    transition-all duration-300
                    group-hover:grayscale-0 group-hover:opacity-100
                  "
                                />
                            </div>
                        ))
                    )}
                </section>
            </div>
        </main>
    );
}
