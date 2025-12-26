"use client";

import React, { useState, useEffect } from "react";
import { ImageIcon, ShoppingCart, ChevronDown, Check } from "lucide-react";
import { IMAGE_URL, SHOW_SHOPPING_CART } from "../../../config";
import { formatPrice, getImageUrl } from "../HelperComps/TextCaseComp";
import ImageModal from "../ModalComps/ImageModal";
import { useShoppingCart } from "../ShoppingBookComps/BookCartContext";
import { useToast } from "../UIComps/ToastContext";

interface ProductVariant {
    VariantTitle: string;
    Description?: string;
    Price: number | string;
}

interface ProductData {
    id?: string | number;
    Id?: string | number;
    Title?: string;
    Description?: string;
    Thumbnail?: string;
    ThumbnailOne?: string;
    ThumbnailTwo?: string;
    ThumbnailThree?: string;
    YoutubeVideoLink?: string;
    ItemList?: string | ProductVariant[]; // Can be JSON string or array
    [key: string]: unknown;
}

interface Props {
    item?: ProductData | null;
}

export default function ProductViewOne({ item }: Props) {
    const [showFullDescription, setShowFullDescription] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

    const { addItem } = useShoppingCart();
    const { show } = useToast();

    const variants: ProductVariant[] = React.useMemo(() => {
        if (!item?.ItemList) return [];
        if (Array.isArray(item.ItemList)) return item.ItemList;
        try {
            return JSON.parse(item.ItemList as string);
        } catch (e) {
            console.error("Failed to parse ItemList", e);
            return [];
        }
    }, [item?.ItemList]);

    useEffect(() => {
        if (item) {
            setIsLoading(false);
            if (variants.length > 0 && !selectedVariant) {
                setSelectedVariant(variants[0]);
            }
            return;
        }
        const timer = setTimeout(() => setIsLoading(false), 1500);
        return () => clearTimeout(timer);
    }, [item, variants, selectedVariant]);

    if (isLoading) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4">
                <div className="animate-pulse text-center">
                    <div className="w-24 h-24 bg-gray-100 rounded-full mx-auto mb-6"></div>
                    <div className="h-8 bg-gray-100 rounded w-48 mx-auto mb-4"></div>
                    <div className="h-4 bg-gray-100 rounded w-64 mx-auto"></div>
                </div>
            </div>
        );
    }

    if (!item)
        return (
            <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4">
                <div className="max-w-md text-center">
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">Product Not Found</h3>
                    <button
                        onClick={() => window.history.back()}
                        className="px-6 py-2.5 text-[var(--theme-primary-text)] rounded-lg hover:opacity-90 transition-all font-semibold"
                        style={{ backgroundColor: 'var(--theme-primary-bg)' }}
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );

    const imageUrl = getImageUrl(item.Thumbnail as string | undefined);
    const title = item.Title || "Untitled Product";
    const description = item.Description || "";

    const handleAddToCart = () => {
        if (!item) return;

        const cartTitle = selectedVariant
            ? `${title} (${selectedVariant.VariantTitle})`
            : title;

        const cartPrice = selectedVariant
            ? Number(selectedVariant.Price)
            : (item.Price ? Number(item.Price) : 0);

        addItem({
            Id: `${item.Id || item.id}${selectedVariant ? `-${selectedVariant.VariantTitle}` : ''}`,
            Title: cartTitle,
            Price: cartPrice,
            Qty: 1,
            PriceTotal: cartPrice
        });
        show('Added to cart');
    };

    return (
        <div className="min-h-screen bg-white mt-10">
            <div className="max-w-7xl mx-auto px-4 py-6 md:py-10">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="flex md:flex-row flex-col">

                        {/* LEFT — IMAGES */}
                        <div className="w-full md:w-1/2 bg-gray-50 p-6">
                            <div className="sticky top-24">
                                <div className="aspect-square rounded-2xl overflow-hidden shadow-sm bg-white border border-gray-100">
                                    {item?.YoutubeVideoLink ? (
                                        <iframe
                                            className="w-full h-full"
                                            src={(item.YoutubeVideoLink as string).replace("watch?v=", "embed/")}
                                            title={title}
                                            frameBorder="0"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        ></iframe>
                                    ) : imageUrl ? (
                                        <ImageModal
                                            src={imageUrl}
                                            alt={title}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                                            <ImageIcon size={64} />
                                            <p className="mt-2 text-sm">No Image Available</p>
                                        </div>
                                    )}
                                </div>

                                <div className="flex gap-3 mt-4 overflow-x-auto pb-2 scrollbar-hide">
                                    {[item.ThumbnailOne, item.ThumbnailTwo, item.ThumbnailThree]
                                        .filter(t => t && t !== "logo.png")
                                        .map((thumb, idx) => (
                                            <div key={idx} className="w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border border-gray-200 cursor-pointer hover:border-[var(--theme-accent)] transition-colors">
                                                <ImageModal
                                                    src={getImageUrl(thumb) || ""}
                                                    alt={`${title} thumb ${idx + 1}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            </div>
                                        ))}
                                </div>
                            </div>
                        </div>

                        {/* RIGHT — DETAILS */}
                        <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col">
                            <div className="flex-1">
                                <nav className="flex mb-4 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                    <span>Product Details</span>
                                </nav>

                                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4 leading-tight">
                                    {title}
                                </h1>

                                {/* PRICE DISPLAY */}
                                <div className="flex items-baseline gap-2 mb-8">
                                    <span className="text-3xl font-bold" style={{ color: 'var(--theme-accent)' }}>
                                        {formatPrice(
                                            selectedVariant
                                                ? Number(selectedVariant.Price)
                                                : (variants[0] ? Number(variants[0].Price) : (item.Price ? Number(item.Price) : 0))
                                        )}
                                    </span>
                                    <span className="text-gray-500 font-medium">MMK</span>
                                </div>

                                {/* VARIANT SELECTION */}
                                {variants.length > 0 && (
                                    <div className="mb-8">
                                        <label className="block text-sm font-semibold text-gray-900 mb-3">
                                            Select Variant
                                        </label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            {variants.map((v, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => setSelectedVariant(v)}
                                                    className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${selectedVariant?.VariantTitle === v.VariantTitle
                                                        ? "border-[var(--theme-accent)] bg-[var(--theme-accent)]/5"
                                                        : "border-gray-100 bg-gray-50 hover:border-gray-200"
                                                        }`}
                                                >
                                                    <div className="flex flex-col items-start">
                                                        <span className={`text-sm font-bold ${selectedVariant?.VariantTitle === v.VariantTitle ? "text-[var(--theme-accent)]" : "text-gray-900"}`}>
                                                            {v.VariantTitle}
                                                        </span>
                                                        {v.Description && (
                                                            <span className="text-xs text-gray-500 mt-0.5">{v.Description}</span>
                                                        )}
                                                    </div>
                                                    {selectedVariant?.VariantTitle === v.VariantTitle && (
                                                        <Check size={18} className="text-[var(--theme-accent)]" />
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* ADD TO CART */}
                                {SHOW_SHOPPING_CART && (
                                    <div className="flex flex-col gap-4 mb-10">
                                        <button
                                            onClick={handleAddToCart}
                                            className="w-full flex items-center justify-center gap-3 py-4 rounded-xl text-[var(--theme-primary-text)] font-bold text-lg shadow-lg hover:opacity-95 active:scale-[0.98] transition-all"
                                            style={{ backgroundColor: 'var(--theme-primary-bg)' }}
                                        >
                                            <ShoppingCart size={22} />
                                            Add to Cart
                                        </button>
                                        <p className="text-center text-xs text-gray-500">
                                            Standard shipping applies. Returns accepted within 7 days.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* TABS/COLLAPSIBLE DESCRIPTION */}
                            <div className="mt-auto border-t border-[var(--theme-text-primary)]/5 pt-8">
                                <button
                                    onClick={() => setShowFullDescription(!showFullDescription)}
                                    className="w-full flex items-center justify-between text-left mb-4"
                                >
                                    <h2 className="text-lg font-bold text-gray-900">Description</h2>
                                    <ChevronDown
                                        size={20}
                                        className={`text-gray-400 transition-transform ${showFullDescription ? 'rotate-180' : ''}`}
                                    />
                                </button>
                                <div
                                    className={`overflow-hidden transition-all duration-300 ${showFullDescription ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}
                                >
                                    <div className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap pb-6">
                                        {description || "No additional description available for this product."}
                                        {selectedVariant?.Description && (
                                            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                                <p className="font-semibold text-xs text-gray-500 uppercase mb-2">Variant Details</p>
                                                <p className="text-gray-900">{selectedVariant.Description}</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
