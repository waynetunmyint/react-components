import React, { useEffect, useState } from "react";
import { GetStoredJWT } from "../StorageComps/StorageCompOne";
import { BASE_URL, PAGE_ID } from "../../../config";

interface OrderItem {
    ProductId?: string | number;
    Title?: string;
    VariantTitle?: string;
    Qty: number;
    Price: number;
}

interface OrderData {
    Id?: string | number;
    CustomerName?: string;
    CustomerPhone?: string;
    CustomerEmail?: string;
    CustomerAddress?: string;
    OrderDeliveryFees?: number;
    OrderDiscountPercentage?: number;
    OrderItems?: string | OrderItem[];
}

interface ProductVariant {
    VariantTitle: string;
    Description?: string;
    Price: number | string;
}

interface Product {
    Id: string | number;
    Title?: string;
    Price?: number;
    ItemList?: string | ProductVariant[];
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onCreated?: () => void;
    orderData?: OrderData | null;
}

export default function ProductManualOrderModal({ isOpen, onClose, onCreated, orderData }: Props) {
    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [customerEmail, setCustomerEmail] = useState("");
    const [customerAddress, setCustomerAddress] = useState("");
    const [deliveryFees, setDeliveryFees] = useState(0);
    const [discountPercentage, setDiscountPercentage] = useState(0);
    const [items, setItems] = useState<OrderItem[]>([{ Title: "", Qty: 1, Price: 0 }]);
    const [products, setProducts] = useState<Product[]>([]);
    const [submitting, setSubmitting] = useState(false);

    const isEditMode = !!orderData?.Id;

    useEffect(() => {
        if (isOpen) fetchProducts();
    }, [isOpen]);

    useEffect(() => {
        if (orderData) {
            setCustomerName(orderData.CustomerName || "");
            setCustomerPhone(orderData.CustomerPhone || "");
            setCustomerEmail(orderData.CustomerEmail || "");
            setCustomerAddress(orderData.CustomerAddress || "");
            setDeliveryFees(Number(orderData.OrderDeliveryFees || 0));
            setDiscountPercentage(Number(orderData.OrderDiscountPercentage || 0));
        } else {
            resetForm();
        }
    }, [orderData]);

    useEffect(() => {
        if (!orderData || products.length === 0) return;

        let parsedItems: any[] = [];
        if (typeof orderData.OrderItems === "string") {
            try {
                parsedItems = JSON.parse(orderData.OrderItems);
            } catch {
                parsedItems = [];
            }
        } else if (Array.isArray(orderData.OrderItems)) {
            parsedItems = orderData.OrderItems;
        }

        const normalizedItems: OrderItem[] = parsedItems.map((item) => {
            const itemProductId = String(item.ProductId || item.productId || item.product_id || item.id || item.Id || "");
            const itemTitle = item.Title || item.title || "";
            const itemVariant = item.VariantTitle || item.variantTitle || item.variant || "";
            const itemPrice = item.Price || item.price || 0;

            let matchedProd = products.find((p) => String(p.Id) === itemProductId);
            if (!matchedProd && itemTitle) {
                matchedProd = products.find((p) => p.Title?.toLowerCase() === itemTitle.toLowerCase());
            }

            return {
                ProductId: matchedProd ? matchedProd.Id : itemProductId,
                Title: matchedProd?.Title || itemTitle,
                VariantTitle: itemVariant,
                Qty: item.Qty || item.qty || 1,
                Price: itemPrice,
            };
        });

        setItems(normalizedItems.length > 0 ? normalizedItems : [{ Title: "", Qty: 1, Price: 0 }]);
    }, [orderData, products]);

    const token = GetStoredJWT();

    const subtotal = items.reduce((s, it) => s + (Number(it.Qty || 0) * Number(it.Price || 0)), 0);
    const discountAmount = (subtotal * Number(discountPercentage || 0)) / 100;
    const afterDiscount = subtotal - discountAmount;
    const total = afterDiscount + Number(deliveryFees || 0);

    const fetchProducts = async () => {
        try {
            const res = await fetch(`${BASE_URL}/product/api/byPageId/byPage/${PAGE_ID}`);
            if (!res.ok) throw new Error(`Failed to fetch products: ${res.status}`);
            const result = await res.json();
            const list = Array.isArray(result) ? result : [];

            const normalized = list.map((p: any) => ({
                Id: p.Id || p.id,
                Title: p.Title || p.title,
                Price: p.Price || p.price,
                ItemList: p.ItemList
            }));

            setProducts(normalized);
        } catch (err) {
            console.error("fetchProducts error", err);
            setProducts([]);
        }
    };

    const resetForm = () => {
        setCustomerName("");
        setCustomerPhone("");
        setCustomerEmail("");
        setCustomerAddress("");
        setDeliveryFees(0);
        setDiscountPercentage(0);
        setItems([{ Title: "", Qty: 1, Price: 0 }]);
    };

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!customerName.trim() || !customerPhone.trim() || items.length === 0) {
            alert("Please provide customer name, phone and at least one item.");
            return;
        }

        try {
            setSubmitting(true);
            const formData = new FormData();
            formData.append("pageId", String(PAGE_ID));
            formData.append("customerName", customerName);
            formData.append("customerPhone", customerPhone);
            formData.append("customerEmail", customerEmail || "");
            formData.append("customerAddress", customerAddress || "");
            formData.append("orderDeliveryFees", String(deliveryFees || 0));
            formData.append("orderDiscountPercentage", String(discountPercentage || 0));
            formData.append("orderItems", JSON.stringify(items));
            formData.append("orderGrandTotal", String(total));

            if (isEditMode) {
                formData.append("id", String(orderData?.Id));
            }

            // The endpoint might need to be adjusted if it's different from bookOrder
            const url = `${BASE_URL}/productOrder/api`;
            const method = isEditMode ? "PATCH" : "POST";

            const res = await fetch(url, {
                method,
                body: formData,
                headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            });

            if (!res.ok) throw new Error(`Failed to ${isEditMode ? 'update' : 'create'} order: ${res.status}`);

            resetForm();
            onClose();
            onCreated && onCreated();
        } catch (err: unknown) {
            console.error(err);
            const msg = err instanceof Error ? err.message : String(err);
            alert(msg || `Failed to ${isEditMode ? 'update' : 'create'} order`);
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[var(--theme-primary-text)]/40 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 overflow-hidden flex flex-col" style={{ maxHeight: "90vh" }}>
                <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-white">
                    <h3 className="text-lg font-semibold text-gray-900">{isEditMode ? 'Edit Product Order' : 'Create Product Order'}</h3>
                    <button type="button" onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        ✕
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-4 mb-6">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Customer Name *</label>
                            <input value={customerName} onChange={(e) => setCustomerName(e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-gray-900 focus:border-black outline-none transition-colors" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Phone *</label>
                            <input value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-gray-900 focus:border-black outline-none transition-colors" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Email</label>
                            <input value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-gray-900 focus:border-black outline-none transition-colors" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Delivery Address</label>
                            <input value={customerAddress} onChange={(e) => setCustomerAddress(e.target.value)} className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-gray-900 focus:border-black outline-none transition-colors" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Delivery Fees (MMK)</label>
                            <input type="number" min="0" value={deliveryFees} onChange={(e) => setDeliveryFees(Number(e.target.value))} className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-gray-900 focus:border-black outline-none transition-colors" />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Discount (%)</label>
                            <select value={discountPercentage} onChange={(e) => setDiscountPercentage(Number(e.target.value))} className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-gray-900 focus:border-[var(--theme-primary-bg)] outline-none transition-colors">
                                {[0, 5, 10, 15, 20, 25, 30, 40, 50].map(d => <option key={d} value={d} className="text-[var(--theme-primary-text)]">{d === 0 ? 'No Discount' : `${d}%`}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="mb-6">
                        <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
                            <h4 className="text-sm font-bold text-gray-900 uppercase">Order Items</h4>
                            <button type="button" onClick={() => setItems([...items, { Title: '', Qty: 1, Price: 0 }])} className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline">+ ADD ITEM</button>
                        </div>

                        <div className="space-y-3">
                            {items.map((it, idx) => {
                                // Find variants for the selected product
                                const currentProd = products.find(p => String(p.Id) === String(it.ProductId));
                                let prodVariants: ProductVariant[] = [];
                                if (currentProd?.ItemList) {
                                    prodVariants = Array.isArray(currentProd.ItemList) ? currentProd.ItemList : JSON.parse(currentProd.ItemList as string);
                                }

                                return (
                                    <div key={idx} className="bg-gray-50 p-3 rounded border border-gray-200 flex flex-col gap-2">
                                        <div className="grid grid-cols-12 gap-2 items-center">
                                            <div className="col-span-11">
                                                <select
                                                    aria-label={`Select product for item ${idx + 1}`}
                                                    value={it.ProductId ? String(it.ProductId) : ""}
                                                    onChange={(e) => {
                                                        const val = e.target.value;
                                                        const sel = products.find((p) => String(p.Id) === val);
                                                        setItems((prev) =>
                                                            prev.map((p, i) =>
                                                                i === idx
                                                                    ? {
                                                                        ...p,
                                                                        ProductId: sel ? sel.Id : val,
                                                                        Title: sel?.Title || p.Title || "",
                                                                        Price: sel?.Price ?? p.Price ?? 0,
                                                                        VariantTitle: "", // Reset variant when product changes
                                                                    }
                                                                    : p
                                                            )
                                                        );
                                                    }}
                                                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm bg-white text-gray-900 focus:border-black outline-none"
                                                >
                                                    <option value="">-- Select Product --</option>
                                                    {products.map((p) => (
                                                        <option key={p.Id} value={String(p.Id)} className="text-black">{p.Title}</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <button type="button" onClick={() => setItems(items.filter((_, i) => i !== idx))} className="col-span-1 text-gray-400 hover:text-red-600 text-center">✕</button>
                                        </div>

                                        <div className="grid grid-cols-12 gap-2">
                                            <div className="col-span-6">
                                                <select
                                                    aria-label={`Select variant for item ${idx + 1}`}
                                                    value={it.VariantTitle || ""}
                                                    onChange={(e) => {
                                                        const vTitle = e.target.value;
                                                        const vObj = prodVariants.find(v => v.VariantTitle === vTitle);
                                                        setItems(prev => prev.map((p, i) => i === idx ? {
                                                            ...p,
                                                            VariantTitle: vTitle,
                                                            Price: vObj ? Number(vObj.Price) : (currentProd?.Price || p.Price)
                                                        } : p));
                                                    }}
                                                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm bg-white text-gray-900 focus:border-black outline-none"
                                                    disabled={!prodVariants.length}
                                                >
                                                    <option value="">-- No Variant --</option>
                                                    {prodVariants.map((v, i) => (
                                                        <option key={i} value={v.VariantTitle} className="text-black">{v.VariantTitle} - {v.Price} MMK</option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div className="col-span-2">
                                                <input
                                                    type="number"
                                                    min="1"
                                                    value={it.Qty}
                                                    onChange={(e) => setItems(prev => prev.map((p, i) => i === idx ? { ...p, Qty: Number(e.target.value) } : p))}
                                                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm bg-white text-gray-900 text-center focus:border-black outline-none"
                                                    placeholder="Qty"
                                                />
                                            </div>
                                            <div className="col-span-4">
                                                <input
                                                    type="number"
                                                    min="0"
                                                    value={it.Price}
                                                    onChange={(e) => setItems(prev => prev.map((p, i) => i === idx ? { ...p, Price: Number(e.target.value) } : p))}
                                                    className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm bg-white text-gray-900 text-right focus:border-black outline-none"
                                                    placeholder="Price"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded border border-gray-200 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Subtotal</span>
                            <span className="text-gray-900 font-medium">{subtotal.toLocaleString()} MMK</span>
                        </div>
                        {discountPercentage > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Discount ({discountPercentage}%)</span>
                                <span className="text-red-600 font-medium">-{discountAmount.toLocaleString()} MMK</span>
                            </div>
                        )}
                        {deliveryFees > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Delivery Fees</span>
                                <span className="text-green-600 font-medium">+{deliveryFees.toLocaleString()} MMK</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center pt-2 border-t border-gray-300 mt-2">
                            <span className="text-base font-bold text-gray-900">Grand Total</span>
                            <span className="text-lg font-bold text-gray-900">{total.toLocaleString()} MMK</span>
                        </div>
                    </div>
                </div>

                <div className="p-5 border-t border-gray-200 flex gap-3 bg-white">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors">Cancel</button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={submitting}
                        className="flex-1 px-4 py-2 rounded text-sm font-bold text-white shadow hover:opacity-90 active:translate-y-0.5 transition-all disabled:opacity-50"
                        style={{ backgroundColor: 'var(--theme-primary-bg)' }}
                    >
                        {submitting ? 'Processing...' : (isEditMode ? 'Update Order' : 'Create Order')}
                    </button>
                </div>
            </div>
        </div>
    );
}
