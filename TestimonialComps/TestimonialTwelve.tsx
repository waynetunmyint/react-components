"use client";
import React, { useState, useCallback } from "react";
import { ChevronLeft, ChevronRight, ImageIcon } from "lucide-react";
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

export default function TestimonialTwelve({
    dataSource,
    headingTitle,
    subHeadingTitle,
    items = [],
    loading = false,
    error = null,
}: Props) {
    const [currentIndex, setCurrentIndex] = useState(0);

    const getImageUrl = useCallback((thumbnail: string | undefined) => {
        return thumbnail
            ? `${IMAGE_URL}/uploads/${thumbnail}`
            : "https://via.placeholder.com/800x600?text=No+Image";
    }, []);

    const nextSlide = () => {
        if (items.length <= 1) return;
        setCurrentIndex((prev) => (prev + 1) % items.length);
    };

    const prevSlide = () => {
        if (items.length <= 1) return;
        setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
    };

    const Skeleton = () => (
        <div className="aspect-[4/5] bg-gray-100 rounded-2xl animate-pulse flex items-center justify-center">
            <ImageIcon className="text-gray-200" size={40} />
        </div>
    );

    if (error) return null;
    if (!loading && items.length === 0) return null;

    return (
        <div className="py-16 px-4 bg-white overflow-hidden relative group/section">
            <div className="max-w-7xl mx-auto">
                <BlockHeader
                    headingTitle={headingTitle}
                    subHeadingTitle={subHeadingTitle}
                    showSwitcher={false}
                    dataSource={dataSource}
                    showViewAll={false}
                />

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => <Skeleton key={i} />)}
                    </div>
                ) : (
                    <div className="relative px-4">
                        <div className="overflow-hidden">
                            <div
                                className="flex transition-transform duration-700 cubic-bezier(0.4, 0, 0.2, 1)"
                                style={{
                                    transform: `translateX(calc(-${currentIndex} * (100% / 1)))`,
                                }}
                            >
                                {items.map((item, idx) => {
                                    const imageUrl = getImageUrl(item.Thumbnail);
                                    return (
                                        <div
                                            key={item.Id || idx}
                                            className="w-full md:w-1/3 flex-shrink-0 px-2 md:px-4"
                                            style={{
                                                flex: "0 0 100%",
                                                maxWidth: "100%",
                                                "--md-flex": "0 0 33.333333%",
                                                "--md-max-width": "33.333333%"
                                            } as React.CSSProperties}
                                        >
                                            <div className="group/card relative rounded-2xl overflow-hidden shadow-2xl shadow-gray-200/50 transition-all duration-500">
                                                <img
                                                    src={imageUrl}
                                                    alt={item.Title || `Testimonial ${idx + 1}`}
                                                    className="w-full h-auto group-hover/card:scale-110 transition-transform duration-[1.5s]"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity" />
                                                {item.PersonName && (
                                                    <div className="absolute bottom-6 left-6 right-6 translate-y-4 opacity-0 group-hover/card:translate-y-0 group-hover/card:opacity-100 transition-all">
                                                        <h4 className="text-white font-bold text-xl">{item.PersonName}</h4>
                                                        {item.PersonJobTitle && <p className="text-white/80 text-sm">{item.PersonJobTitle}</p>}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        <style>{`
              @media (min-width: 768px) {
                .group\\/section div[style*="--md-flex"] {
                  flex: 0 0 33.333333% !important;
                  max-width: 33.333333% !important;
                }
                .group\\/section .flex.transition-transform {
                  transform: translateX(calc(-${currentIndex} * (100% / 3))) !important;
                }
              }
            `}</style>

                        {items.length > 1 && (
                            <>
                                <button
                                    onClick={prevSlide}
                                    className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 z-20 w-12 h-12 md:w-16 md:h-16 bg-white rounded-full shadow-2xl flex items-center justify-center text-gray-800 hover:text-[var(--theme-primary-bg)] transition-all opacity-100 md:opacity-0 group-hover/section:opacity-100"
                                >
                                    <ChevronLeft size={28} />
                                </button>
                                <button
                                    onClick={nextSlide}
                                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 z-20 w-12 h-12 md:w-16 md:h-16 bg-white rounded-full shadow-2xl flex items-center justify-center text-gray-800 hover:text-[var(--theme-primary-bg)] transition-all opacity-100 md:opacity-0 group-hover/section:opacity-100"
                                >
                                    <ChevronRight size={28} />
                                </button>
                            </>
                        )}

                        {items.length > 1 && (
                            <div className="flex justify-center gap-2 mt-12">
                                {items.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentIndex(idx)}
                                        className={`h-1.5 rounded-full transition-all duration-500 ${idx === currentIndex ? "bg-[var(--theme-primary-bg)] w-8" : "bg-gray-200 w-2"}`}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
