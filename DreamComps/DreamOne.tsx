import React, { useState } from "react";
import {
    IonModal,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonText
} from '@ionic/react';
import { closeOutline, chevronForwardOutline, sparklesOutline } from 'ionicons/icons';
import { IMAGE_URL } from "../../../config";

interface Props {
    dataSource: string;
    items?: any[];
    loading?: boolean;
    error?: string | null;
}

export default function DreamOne({
    dataSource,
    items: prefetchedItems,
    loading: prefetchedLoading,
    error: prefetchedError,
}: Props) {
    const items = prefetchedItems ?? [];
    const loading = prefetchedLoading ?? false;
    const error = prefetchedError ?? null;

    const [selectedItem, setSelectedItem] = useState<any | null>(null);

    const Skeleton = () => (
        <div className="bg-[#161633] rounded-2xl shadow-lg border border-[#222244] p-6 animate-pulse mb-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-[#222244] rounded-xl" />
            <div className="flex-1">
                <div className="h-5 bg-[#222244] rounded w-1/3 mb-2" />
                <div className="h-4 bg-[#222244]/50 rounded w-1/4" />
            </div>
            <div className="w-8 h-8 bg-[#222244]/50 rounded-full" />
        </div>
    );

    if (error) {
        return (
            <div className="max-w-3xl mx-auto px-4 py-12 text-center">
                <IonText color="danger">
                    <p className="text-lg font-medium">{error}</p>
                </IonText>
            </div>
        );
    }

    return (
        <div>
            {!selectedItem && (
                <div className="max-w-3xl mx-auto">
                    <div className="flex flex-col gap-4">
                        {loading ? (
                            Array.from({ length: 6 }).map((_, idx) => <Skeleton key={idx} />)
                        ) : items.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24 bg-[#161633]/50 rounded-3xl border border-dashed border-[#222244] shadow-xl">
                                <IonIcon icon={sparklesOutline} className="text-5xl text-[#222244] mb-4" />
                                <h3 className="text-[#a0a0c0] font-bold text-lg">No dreams found</h3>
                                <p className="text-sm text-[#a0a0c0]/60 mt-1">Your dream journey begins here</p>
                            </div>
                        ) : (
                            items.map((item, idx) => (
                                <div
                                    key={item.Id || idx}
                                    className="group bg-[#161633] rounded-[24px] p-6 flex items-center gap-6 shadow-xl hover:shadow-[var(--accent-500)]/10 hover:translate-y-[-4px] border border-[#222244] hover:border-[var(--accent-500)]/30 transition-all duration-500 cursor-pointer"
                                    onClick={() => setSelectedItem(item)}
                                >
                                    <div className="flex-1">
                                        <h3 className="text-xl font-black text-white group-hover:text-[var(--accent-500)] transition-colors leading-tight">
                                            {item?.Title || "Untitled Dream"}
                                        </h3>
                                        {item?.Description && (
                                            <p className="text-sm text-[#a0a0c0] mt-2 line-clamp-1 group-hover:text-[#c0c0e0] transition-colors">
                                                {item.Description}
                                            </p>
                                        )}
                                    </div>

                                    <div className="w-12 h-12 rounded-[16px] bg-[#0d0d21] group-hover:bg-[var(--accent-500)] flex items-center justify-center shadow-inner transition-all duration-300">
                                        <IonIcon
                                            icon={chevronForwardOutline}
                                            className="text-[#222244] group-hover:text-[#090918] transition-colors text-xl"
                                        />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}

            {/* Enlarged View Modal */}
            <IonModal
                isOpen={!!selectedItem}
                onDidDismiss={() => setSelectedItem(null)}
                className="dream-modal-centered"
            >
                <IonHeader className="ion-no-border">
                    <IonToolbar className="px-4 py-4" style={{ '--background': '#090918' }}>
                        <div className="pr-12">
                            <h2 className="text-xl font-black text-white leading-snug">
                                {selectedItem?.Title || "Dream Details"}
                            </h2>
                        </div>
                        <IonButtons slot="end" className="absolute top-2 right-2">
                            <IonButton onClick={() => setSelectedItem(null)}>
                                <IonIcon icon={closeOutline} slot="icon-only" style={{ color: '#FFCC33' }} />
                            </IonButton>
                        </IonButtons>
                    </IonToolbar>
                </IonHeader>
                <IonContent className="ion-padding" style={{ '--background': '#0d0d21' }}>
                    <div className="max-w-2xl mx-auto py-6">
                        <div className="bg-[#161633] rounded-[32px] p-8 border border-[#222244] shadow-2xl relative overflow-hidden">
                            {/* Decorative accent */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[var(--accent-500)] to-transparent opacity-30" />

                            <h4 className="text-[11px] font-black text-[var(--accent-500)] uppercase tracking-[0.2em] mb-4 opacity-70">
                                Interpretation & Journey
                            </h4>

                            <p className="text-white leading-relaxed text-lg whitespace-pre-wrap font-medium">
                                {selectedItem?.Description || "No detailed description available."}
                            </p>

                            <div className="mt-8 flex justify-center">
                                <div className="w-16 h-1 bg-[#222244] rounded-full opacity-30" />
                            </div>
                        </div>
                    </div>
                </IonContent>
            </IonModal>

            <style>{`
                .dream-modal-centered {
                    --width: 90%;
                    --max-width: 600px;
                    --height: auto;
                    --max-height: 90%;
                    --border-radius: 32px;
                    --box-shadow: 0 40px 80px -12px rgba(0, 0, 0, 0.6);
                }
                
                @media (min-width: 768px) {
                    .dream-modal-centered {
                        --width: 75%;
                    }
                }

                .dream-modal-centered ion-title {
                    white-space: normal;
                    overflow: visible;
                    text-align: left;
                    padding-right: 40px; /* Space for close button */
                }

                .dream-modal-centered ion-toolbar {
                    --min-height: 64px;
                    --padding-top: 12px;
                    --padding-bottom: 12px;
                }

                .dream-modal-centered::part(content) {
                    margin: auto;
                    position: relative;
                    max-height: 90%;
                    overflow: auto;
                }
                
                .dream-modal-centered::part(backdrop) {
                    background: #000000;
                    opacity: 1 !important;
                }
            `}</style>
        </div>
    );
}
