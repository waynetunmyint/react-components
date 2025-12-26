"use client";
import React, { useState } from "react";
import { ArrowRight, ShoppingCart, Heart, Eye } from "lucide-react";
import { getImageUrl, priceFormatter } from "../HelperComps/TextCaseComp";

interface Item {
    Id?: string | number;
    id?: string | number;
    Thumbnail?: string;
    Title?: string;
    BrandName?: string;
    Description?: string;
    Price?: number;
    [key: string]: unknown;
}

interface Props {
    item: Item;
    dataSource: string;
}

export function ProductCardPremium({ item, dataSource }: Props) {
    const [isHovered, setIsHovered] = useState(false);
    const [imageError, setImageError] = useState(false);

    const imageUrl = getImageUrl(item?.Thumbnail);
    const title = item?.Title || item?.BrandName || "Untitled Product";
    const price = item?.Price;
    const itemId = item?.Id || item?.id;

    const handleClick = () => {
        if (dataSource && itemId) {
            window.location.href = `/${dataSource}/view/${itemId}`;
        }
    };

    return (
        <div
            className="group relative bg-[var(--theme-text-secondary)]/5 rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-[0_30px_60px_rgba(0,0,0,0.12)] border border-[var(--theme-text-primary)]/5 flex flex-col h-full backdrop-blur-md"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleClick}
        >
            {/* Image Section */}
            <div className="relative aspect-square overflow-hidden bg-gray-50/50">
                {imageUrl && !imageError ? (
                    <img
                        src={imageUrl}
                        alt={title}
                        className="w-full h-full object-cover transition-all duration-1000 ease-out group-hover:scale-105"
                        onError={() => setImageError(true)}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[var(--theme-text-secondary)]/10 text-[var(--theme-text-muted)]">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                )}

                {/* Badge Overlay */}
                <div className="absolute top-5 left-5">
                    <div className="px-4 py-1.5 bg-[var(--theme-accent)] text-[var(--theme-primary-text)] text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg">
                        Premium
                    </div>
                </div>

                {/* Heart/Action Buttons */}
                <div className={`absolute top-5 right-5 flex flex-col gap-3 transition-all duration-500 transform ${isHovered ? 'translate-x-0 opacity-100' : 'translate-x-6 opacity-0'}`}>
                    <button className="w-11 h-11 bg-[var(--theme-text-primary)]/10 backdrop-blur-md shadow-xl rounded-full flex items-center justify-center text-[var(--theme-text-primary)] hover:bg-[var(--theme-accent)] hover:text-[var(--theme-primary-text)] transition-all transform hover:scale-110 active:scale-90">
                        <Heart size={20} />
                    </button>
                    <button className="w-11 h-11 bg-[var(--theme-text-primary)]/10 backdrop-blur-md shadow-xl rounded-full flex items-center justify-center text-[var(--theme-text-primary)] hover:bg-[var(--theme-accent)] hover:text-[var(--theme-primary-text)] transition-all transform hover:scale-110 active:scale-90">
                        <Eye size={20} />
                    </button>
                </div>

                {/* Purchase Button Overlay */}
                <div className={`absolute bottom-0 left-0 right-0 p-5 transition-all duration-500 transform ${isHovered ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
                    <button
                        className="w-full py-4 bg-[var(--theme-accent)] text-[var(--theme-primary-text)] rounded-2xl font-black text-xs uppercase tracking-[0.15em] flex items-center justify-center gap-3 shadow-2xl hover:bg-[var(--theme-accent)]/80 active:scale-[0.98] transition-all"
                        onClick={(e) => { e.stopPropagation(); handleClick(); }}
                    >
                        <ShoppingCart size={18} />
                        View Details
                    </button>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-7 flex flex-col flex-1 bg-[var(--theme-secondary-bg)]/20">

                <h3 className="font-extrabold text-[var(--theme-text-primary)] text-2xl mb-6 line-clamp-2 group-hover:tracking-tight transition-all duration-300">
                    {title}
                </h3>

                <div className="mt-auto flex items-end justify-between pt-6 border-t border-[var(--theme-text-primary)]/5">
                    <div className="flex flex-col">
                        <div className="flex items-baseline gap-1">
                            <span className="text-xl font-black text-[var(--theme-text-primary)] tracking-tighter">
                                {price ? priceFormatter(price) : "View Details"}
                            </span>
                            {price && <span className="text-[10px] font-bold text-[var(--theme-text-muted)]">MMK</span>}
                        </div>
                    </div>

                    <div className="relative w-10 h-10 group/btn">
                        <div className="absolute inset-0 bg-[var(--theme-text-primary)]/10 rounded-2xl transition-all duration-500 group-hover:bg-[var(--theme-accent)] group-hover:rotate-[15deg] group-hover:shadow-xl" />
                        <div className="absolute inset-0 flex items-center justify-center text-[var(--theme-text-muted)] group-hover:text-[var(--theme-primary-text)] transition-colors duration-300">
                            <ArrowRight size={24} className="transition-all duration-500 group-hover:translate-x-1" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
