"use client";
import React, { useState, useEffect, useCallback } from "react";
import { IonContent, IonPage, IonRefresher, IonRefresherContent } from "@ionic/react";
import { Search, SlidersHorizontal, Grid, List as ListIcon } from "lucide-react";
import HeaderSwitcher from "../_SwitcherComps/HeaderSwitcher";
import FooterSwitchComp from "../_SwitcherComps/FooterSwitcher";
import { BASE_URL, PAGE_ID, FOOTER_STYLE } from "@/config";
import { ProductCardPremium } from "../PageComps/ProductCardPremium";

const ProductListPage: React.FC = () => {
    const [items, setItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/product/api/byPageId/${PAGE_ID}`);
            const data = await response.json();
            setItems(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Error fetching products:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleRefresh = async (event: CustomEvent) => {
        await fetchData();
        event.detail.complete();
    };

    const filteredItems = items.filter(item =>
        (item.Title || item.BrandName || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <IonPage>
            <HeaderSwitcher headingField="Our Collection" />
            <IonContent fullscreen className="bg-white">
                <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
                    <IonRefresherContent />
                </IonRefresher>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    {/* Page Header */}
                    <div className="mb-10 text-center sm:text-left flex flex-col sm:flex-row sm:items-end justify-between gap-6">
                        <div>
                            <h1 className="text-4xl font-black text-gray-900 mb-2">Premium Products</h1>
                            <p className="text-gray-500 font-medium">Discover our handpicked selection of quality items.</p>
                        </div>

                        <div className="flex items-center gap-3 self-center sm:self-auto">
                            <button
                                onClick={() => setViewMode("grid")}
                                className={`p-2.5 rounded-xl transition-all ${viewMode === "grid" ? "bg-black text-white shadow-lg" : "bg-gray-100 text-gray-400 hover:bg-gray-200"}`}
                            >
                                <Grid size={20} />
                            </button>
                            <button
                                onClick={() => setViewMode("list")}
                                className={`p-2.5 rounded-xl transition-all ${viewMode === "list" ? "bg-black text-white shadow-lg" : "bg-gray-100 text-gray-400 hover:bg-gray-200"}`}
                            >
                                <ListIcon size={20} />
                            </button>
                        </div>
                    </div>

                    {/* Search and Filters Bar */}
                    <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md py-4 mb-8 flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1 group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={20} />
                            <input
                                type="text"
                                placeholder="Search products..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-black/5 transition-all outline-none text-gray-900 font-medium placeholder:text-gray-400"
                            />
                        </div>
                        <button className="flex items-center justify-center gap-2 px-6 py-4 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-all font-bold text-gray-900 border border-transparent hover:border-gray-200">
                            <SlidersHorizontal size={20} />
                            <span>Filters</span>
                        </button>
                    </div>

                    {/* Products Grid */}
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                <div key={i} className="animate-pulse">
                                    <div className="aspect-square bg-gray-100 rounded-2xl mb-4" />
                                    <div className="h-4 bg-gray-100 rounded w-2/3 mb-2" />
                                    <div className="h-4 bg-gray-100 rounded w-1/3" />
                                </div>
                            ))}
                        </div>
                    ) : filteredItems.length > 0 ? (
                        <div className={viewMode === "grid"
                            ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
                            : "flex flex-col gap-6"
                        }>
                            {filteredItems.map((item) => (
                                <ProductCardPremium
                                    key={item.Id || item.id}
                                    item={item}
                                    dataSource="product"
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-24">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Search size={32} className="text-gray-300" />
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">No products found</h2>
                            <p className="text-gray-500">Try adjusting your search or filters to find what you&apos;re looking for.</p>
                        </div>
                    )}
                </div>

                <FooterSwitchComp styleNo={FOOTER_STYLE} />
            </IonContent>
        </IonPage>
    );
};

export default ProductListPage;
