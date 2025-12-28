import React, { useCallback } from "react";
import { IonIcon, IonText } from "@ionic/react";
import { chevronForwardOutline, sparklesOutline } from "ionicons/icons";
import { IMAGE_URL } from "../../../config";

interface Props {
    dataSource: string;
    items?: any[];
    loading?: boolean;
    error?: string | null;
}

export default function DreamCategoryOne({
    dataSource,
    items: prefetchedItems,
    loading: prefetchedLoading,
    error: prefetchedError,
}: Props) {
    const items = prefetchedItems ?? [];
    const loading = prefetchedLoading ?? false;
    const error = prefetchedError ?? null;

    const handleNavigation = useCallback(
        (id: string | number) => {
            if (dataSource && id) {
                window.location.href = `/${dataSource}/view/${id}`;
            }
        },
        [dataSource]
    );

    const Skeleton = () => (
        <div className="bg-[#161633] rounded-3xl p-6 shadow-lg border border-[#222244] animate-pulse aspect-square flex flex-col items-center justify-center gap-3">
            <div className="w-12 h-12 bg-[#222244] rounded-2xl" />
            <div className="h-4 bg-[#222244] rounded w-2/3" />
            <div className="h-3 bg-[#222244] rounded w-1/2" />
        </div>
    );

    if (error) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-12 text-center">
                <IonText color="danger text-lg font-medium">{error}</IonText>
            </div>
        );
    }

    return (
        <div className="py-12 px-4 bg-[#0d0d21]">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 sm:gap-6">
                    {loading ? (
                        Array.from({ length: 12 }).map((_, idx) => <Skeleton key={idx} />)
                    ) : items.length === 0 ? (
                        <div className="col-span-full flex flex-col items-center justify-center py-32 bg-[#161633]/50 rounded-[40px] border border-dashed border-[#222244]">
                            <IonIcon icon={sparklesOutline} className="text-5xl text-[#222244] mb-4" />
                            <h3 className="text-lg font-bold text-[#a0a0c0]">No dream categories found</h3>
                        </div>
                    ) : (
                        items.map((item, idx) => {
                            const code = item.ShortCode || item.ShortCod;

                            return (
                                <div
                                    key={item.Id || idx}
                                    className="group relative h-full flex flex-col bg-[#161633] rounded-[32px] p-6 shadow-xl hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)] hover:translate-y-[-8px] border border-[#222244] transition-all duration-500 cursor-pointer overflow-hidden"
                                    onClick={() => handleNavigation(item.Id)}
                                >
                                    {/* Decorative Background Element */}
                                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-[var(--accent-500)] opacity-5 group-hover:opacity-10 rounded-full blur-3xl transition-opacity" />

                                    <div className="relative z-10 flex flex-col items-center text-center h-full">
                                        <div className="w-16 h-16 mb-4 bg-gradient-to-br from-[var(--accent-500)] to-[var(--accent-600)] rounded-[20px] flex items-center justify-center shadow-lg shadow-[var(--accent-500)]/20 group-hover:scale-110 transition-transform duration-500">
                                            <span className="text-3xl font-black text-[#090918]">
                                                {code || "--"}
                                            </span>
                                        </div>

                                        <h3 className="text-xl font-black text-white mb-2 leading-tight group-hover:text-[var(--accent-500)] transition-colors">
                                            {"နှင့်ပါတ်သက်သော အိပ်မက်များ"}
                                        </h3>

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
