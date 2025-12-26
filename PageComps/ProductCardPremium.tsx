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
            className="group relative bg-white rounded-3xl overflow-hidden transition-all duration-500 hover:shadow-[0_30px_60px_rgba(0,0,0,0.12)] border border-gray-100 flex flex-col h-full"
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
                    <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-200">
                        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                    </div>
                )}

                {/* Badge Overlay */}
                <div className="absolute top-5 left-5">
                    <div className="px-4 py-1.5 bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-full shadow-lg">
                        Premium
                    </div>
                </div>

                {/* Heart/Action Buttons */}
                <div className={`absolute top-5 right-5 flex flex-col gap-3 transition-all duration-500 transform ${isHovered ? 'translate-x-0 opacity-100' : 'translate-x-6 opacity-0'}`}>
                    <button className="w-11 h-11 bg-white/90 backdrop-blur-md shadow-xl rounded-full flex items-center justify-center text-gray-900 hover:bg-black hover:text-white transition-all transform hover:scale-110 active:scale-90">
                        <Heart size={20} />
                    </button>
                    <button className="w-11 h-11 bg-white/90 backdrop-blur-md shadow-xl rounded-full flex items-center justify-center text-gray-900 hover:bg-black hover:text-white transition-all transform hover:scale-110 active:scale-90">
                        <Eye size={20} />
                    </button>
                </div>

                {/* Purchase Button Overlay */}
                <div className={`absolute bottom-0 left-0 right-0 p-5 transition-all duration-500 transform ${isHovered ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}`}>
                    <button
                        className="w-full py-4 bg-black text-white rounded-2xl font-black text-xs uppercase tracking-[0.15em] flex items-center justify-center gap-3 shadow-2xl hover:bg-gray-900 active:scale-[0.98] transition-all"
                        onClick={(e) => { e.stopPropagation(); handleClick(); }}
                    >
                        <ShoppingCart size={18} />
                        View Details
                    </button>
                </div>
            </div>

            {/* Content Section */}
            <div className="p-7 flex flex-col flex-1 bg-white">
                <div className="flex items-center gap-2 mb-4">
                    <span className="w-8 h-[1px] bg-gray-200" />
                    <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-gray-400">
                        Collection 2024
                    </span>
                </div>

                <h3 className="font-extrabold text-gray-900 text-2xl mb-6 line-clamp-1 group-hover:tracking-tight transition-all duration-300">
                    {title}
                </h3>

                <div className="mt-auto flex items-end justify-between pt-6 border-t border-gray-50">
                    <div className="flex flex-col">
                        <span className="text-gray-400 text-[9px] font-black uppercase tracking-[0.2em] mb-1.5 opacity-60">Investment</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-black text-gray-900 tracking-tighter">
                                {price ? priceFormatter(price) : "P.O.R"}
                            </span>
                            {price && <span className="text-[10px] font-bold text-gray-400">MMK</span>}
                        </div>
                    </div>

                    <div className="relative w-14 h-14 group/btn">
                        <div className="absolute inset-0 bg-gray-50 rounded-2xl transition-all duration-500 group-hover:bg-black group-hover:rotate-[15deg] group-hover:shadow-xl" />
                        <div className="absolute inset-0 flex items-center justify-center text-gray-300 group-hover:text-white transition-colors duration-300">
                            <ArrowRight size={24} className="transition-all duration-500 group-hover:translate-x-1" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
