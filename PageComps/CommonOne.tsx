"use client";
import React, { useState } from "react";
import { ArrowRight, Calendar, Eye } from "lucide-react";
import { formatDate, getImageUrl, priceFormatter } from "../HelperComps/TextCaseComp";

interface Item {
    Id?: string | number;
    id?: string | number;
    Thumbnail?: string;
    Title?: string;
    BrandName?: string;
    Description?: string;
    CreatedAt?: string;
    CreatedDate?: string;
    Date?: string;
    ViewCount?: number;
    Price?: number;
    [key: string]: unknown;
}

interface Props {
    item?: Item | null;
    dataSource?: string;
}

export function CommonOne({ item, dataSource }: Props) {
    const [imageError, setImageError] = useState<boolean>(false);

    if (!item) return null;

    const imageUrl = getImageUrl(item?.Thumbnail);
    const title = item?.Title || item?.BrandName || "Untitled";
    const description = item?.Description || "";
    const createdDate = formatDate(item?.CreatedAt || item?.CreatedDate || item?.Date);
    const viewCount = item?.ViewCount;
    const price = item?.Price;
    const itemId = item?.Id || item?.id;

    const handleClick = () => {
        if (dataSource && itemId) {
            window.location.href = `/${dataSource}/view/${itemId}`;
        }
    };

    return (
        <div
            onClick={handleClick}
            role="button"
            tabIndex={0}
            aria-label={`View ${title}`}
            onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleClick();
                }
            }}
            className="group relative bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl border border-gray-100 transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col focus-visible:ring-4 focus:outline-none"
        >
            {/* Image Container */}
            <div className="relative overflow-hidden aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-50">
                {imageUrl && !imageError ? (
                    <img
                        src={imageUrl}
                        alt={title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                        loading="lazy"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-300">
                        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                )}

                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* View Count Badge */}
                {viewCount !== undefined && viewCount > 0 && (
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 bg-black/50 backdrop-blur-sm text-white text-xs font-medium rounded-full">
                        <Eye size={12} />
                        <span>{viewCount.toLocaleString()}</span>
                    </div>
                )}

                {/* Arrow on hover */}
                <div className="absolute bottom-4 right-4 w-10 h-10 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 shadow-lg" style={{ backgroundColor: 'var(--theme-primary-bg, #5FA310)' }}>
                    <ArrowRight size={20} />
                </div>
            </div>

            {/* Content */}
            <div className="p-5 flex-1 flex flex-col">
                {/* Title */}
                <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-theme-primary transition-colors duration-200">
                    {title}
                </h3>

                {/* Description */}
                {description && (
                    <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed mb-4 flex-1">
                        {description}
                    </p>
                )}

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                    {/* Left: Date or Price */}
                    {price ? (
                        <div className="flex flex-col">
                            <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: 'var(--theme-primary-bg, #5FA310)' }}>Price</span>
                            <span className="text-lg font-bold text-gray-900">
                                {priceFormatter(price)}
                            </span>
                        </div>
                    ) : createdDate ? (
                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                            <Calendar size={14} />
                            <span>{createdDate}</span>
                        </div>
                    ) : (
                        <span className="text-sm text-gray-400">View details</span>
                    )}

                    {/* Right: Arrow */}
                    <div className="w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 bg-gray-50 text-gray-400 group-hover:text-white group-hover:bg-theme-primary">
                        <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
                    </div>
                </div>
            </div>
        </div>
    );
}
