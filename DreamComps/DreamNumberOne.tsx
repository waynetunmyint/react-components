import React, { useState, useEffect } from "react";
import { X, ChevronRight, Sparkles } from "lucide-react";
import { IMAGE_URL } from "@/config";

interface Props {
    dataSource: string;
    items?: any[];
    loading?: boolean;
    error?: string | null;
}

export default function DreamNumberOne({
    dataSource,
    items: prefetchedItems,
    loading: prefetchedLoading,
    error: prefetchedError,
}: Props) {
    const items = prefetchedItems ?? [];
    const loading = prefetchedLoading ?? false;
    const error = prefetchedError ?? null;

    const [selectedItem, setSelectedItem] = useState<any | null>(null);

    // Lock scroll when modal is open
    useEffect(() => {
        if (selectedItem) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [selectedItem]);

    const Skeleton = () => (
        <div className="bg-[var(--bg-100,#161633)] rounded-2xl shadow-lg border border-[var(--ion-color-step-200,#222244)] p-6 animate-pulse mb-4 flex items-center gap-4">
            <div className="flex-1">
                <div className="h-4 bg-[var(--ion-color-step-200,#222244)] rounded w-16 mb-2" />
                <div className="h-6 bg-[var(--ion-color-step-200,#222244)] rounded w-3/4" />
            </div>
            <div className="w-16 h-12 bg-[var(--ion-color-step-200,#222244)] rounded-xl" />
        </div>
    );

    if (error) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-12 text-center">
                <p className="text-lg font-medium text-red-500">{error}</p>
            </div>
        );
    }

    return (
        <div className="relative">
            {!selectedItem && (
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                        {loading ? (
                            Array.from({ length: 8 }).map((_, idx) => <Skeleton key={idx} />)
                        ) : items.length === 0 ? (
                            <div className="col-span-full flex flex-col items-center justify-center py-24 bg-[var(--bg-100,#161633)]/50 rounded-3xl border border-dashed border-[var(--ion-color-step-200,#222244)] shadow-xl">
                                <Sparkles size={48} className="text-[var(--ion-color-step-200,#222244)] mb-4" />
                                <h3 className="text-[var(--ion-color-step-400,#a0a0c0)] font-bold text-lg">No dream numbers found</h3>
                                <p className="text-sm text-[var(--ion-color-step-400,#a0a0c0)]/60 mt-1">Discover your lucky numbers</p>
                            </div>
                        ) : (
                            items.map((item, idx) => (
                                <div
                                    key={item.Id || idx}
                                    className="group bg-[var(--bg-100,#161633)] rounded-[28px] p-5 sm:p-6 flex flex-col items-center text-center gap-4 shadow-xl hover:shadow-[var(--accent-500)]/10 hover:translate-y-[-6px] border border-[var(--ion-color-step-200,#222244)] hover:border-[var(--accent-500)]/30 transition-all duration-500 cursor-pointer overflow-hidden"
                                    onClick={() => setSelectedItem(item)}
                                >
                                    <div className="w-full min-w-0">
                                        <div className="flex justify-center mb-2">
                                            {item?.Code && (
                                                <span className="font-black text-[var(--accent-500)] bg-[var(--accent-500)]/10 px-2 py-0.5 rounded-md uppercase tracking-wider">
                                                    {item.Code}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="w-full aspect-square rounded-[22px] bg-[var(--ion-background-color,#0d0d21)] group-hover:bg-[var(--accent-500)] border border-[var(--ion-color-step-200,#222244)] group-hover:border-transparent transition-all duration-300 flex flex-col items-center justify-center shadow-inner gap-1">
                                        <span className="text-sm sm:text-base font-black text-white group-hover:text-[var(--ion-color-step-50,#090918)] transition-colors line-clamp-1 px-3">
                                            {item?.Title || "--"}
                                        </span>
                                        <span className="text-3xl sm:text-4xl font-black text-[var(--accent-500)] group-hover:text-[var(--ion-color-step-50,#090918)]">
                                            {item?.Number || "--"}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Custom Modal */}
            {selectedItem && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div
                        className="absolute inset-0 bg-black/90 backdrop-blur-sm"
                        onClick={() => setSelectedItem(null)}
                    />

                    {/* Modal Content */}
                    <div className="relative w-full max-w-[550px] bg-[var(--ion-background-color,#0d0d21)] rounded-[32px] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
                        {/* Modal Header */}
                        <div className="flex justify-end p-4">
                            <button
                                onClick={() => setSelectedItem(null)}
                                className="p-2 rounded-full bg-[var(--bg-100,#161633)] text-[var(--accent-500)] hover:bg-[var(--ion-color-step-200,#222244)] transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="px-8 pb-12 overflow-y-auto max-h-[80vh]">
                            <div className="bg-[var(--accent-500)] rounded-[32px] p-8 border border-[var(--accent-600)] shadow-2xl relative overflow-hidden text-center scale-95 md:scale-100 transition-transform duration-500">
                                {/* Decorative elements */}
                                <div className="absolute -top-12 -left-12 w-32 h-32 bg-white/20 rounded-full blur-2xl" />
                                <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-[var(--ion-color-step-50,#090918)]/10 rounded-full blur-2xl" />

                                <div className="mb-8 relative z-10">
                                    {selectedItem?.Code && (
                                        <span className="inline-block text-[12px] font-black text-[var(--ion-color-step-50,#090918)] bg-white/30 px-4 py-1 rounded-full uppercase tracking-[0.2em] mb-4">
                                            {selectedItem.Code}
                                        </span>
                                    )}
                                    <h2 className="text-3xl md:text-4xl font-black text-[var(--ion-color-step-50,#090918)] leading-tight">
                                        {selectedItem?.Title}
                                    </h2>
                                </div>

                                <div className="relative z-10 inline-flex flex-col items-center justify-center w-32 h-32 rounded-[40px] bg-[var(--ion-background-color,#0d0d21)] border-4 border-white shadow-2xl mb-8 transform hover:scale-105 transition-transform duration-500 mx-auto">
                                    <span className="text-5xl font-black text-white">
                                        {selectedItem?.Number}
                                    </span>
                                </div>

                                {selectedItem?.Description && (
                                    <div className="mt-4 pt-8 border-t border-[var(--ion-color-step-50,#090918)]/10 relative z-10 text-left">
                                        <p className="text-[var(--ion-color-step-50,#090918)] leading-relaxed text-lg whitespace-pre-wrap font-bold">
                                            {selectedItem.Description}
                                        </p>
                                    </div>
                                )}

                                <div className="mt-8 flex justify-center relative z-10">
                                    <div className="w-16 h-1 bg-[var(--ion-color-step-50,#090918)] rounded-full opacity-10" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
