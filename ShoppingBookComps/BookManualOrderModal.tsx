import React, { useEffect, useState } from "react";
import { GetStoredJWT } from "../StorageComps/StorageCompOne";
import { BASE_URL, PAGE_ID } from "../../../config";


interface OrderItem {
  BookId?: string | number;
  Title?: string;
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

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: () => void;
  orderData?: OrderData | null;
}

export default function ManualOrderModal({ isOpen, onClose, onCreated, orderData }: Props) {
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [deliveryFees, setDeliveryFees] = useState(0);
  const [discountPercentage, setDiscountPercentage] = useState(0);
  const [items, setItems] = useState<OrderItem[]>([{ Title: "", Qty: 1, Price: 0 }]);
  const [books, setBooks] = useState<Array<{ Id: string | number; Title?: string; Price?: number }>>([]);
  const [submitting, setSubmitting] = useState(false);

  const isEditMode = !!orderData?.Id;

  useEffect(() => {
    if (isOpen) fetchBooks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Process orderData when it changes - set customer info immediately
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

  // Process items AFTER books are loaded to ensure proper matching
  useEffect(() => {
    if (!orderData || books.length === 0) return;

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

    // Normalize items and match to books list using string comparison
    const normalizedItems: OrderItem[] = parsedItems.map((item) => {
      const itemBookId = String(item.BookId || item.bookId || item.book_id || item.id || item.Id || "");
      const itemTitle = item.Title || item.title || "";
      const itemPrice = item.Price || item.price || 0;

      // Try to find a matching book by ID first, then by title as fallback
      let matchedBook = books.find((b) => String(b.Id) === itemBookId);
      if (!matchedBook && itemTitle) {
        matchedBook = books.find((b) => b.Title?.toLowerCase() === itemTitle.toLowerCase());
      }

      return {
        BookId: matchedBook ? matchedBook.Id : itemBookId,
        Title: matchedBook?.Title || itemTitle,
        Qty: item.Qty || item.qty || 1,
        Price: matchedBook?.Price ?? itemPrice,
      };
    });

    setItems(normalizedItems.length > 0 ? normalizedItems : [{ Title: "", Qty: 1, Price: 0 }]);
  }, [orderData, books]);

  const token = GetStoredJWT();

  const subtotal = items.reduce((s, it) => s + (Number(it.Qty || 0) * Number(it.Price || 0)), 0);
  const discountAmount = (subtotal * Number(discountPercentage || 0)) / 100;
  const afterDiscount = subtotal - discountAmount;
  const total = afterDiscount + Number(deliveryFees || 0);

  const fetchBooks = async () => {
    try {
      const res = await fetch(`${BASE_URL}/book/api/byPageId/byPage/${PAGE_ID}`);
      if (!res.ok) throw new Error(`Failed to fetch books: ${res.status}`);
      const result = await res.json();
      const list = Array.isArray(result) ? result : [];

      // Normalize books explicitly to avoid casing issues
      const normalizedBooks = list.map((b: any) => ({
        Id: b.Id || b.id || b._id,
        Title: b.Title || b.title,
        Price: b.Price || b.price
      }));

      setBooks(normalizedBooks);
    } catch (err) {
      console.error("fetchBooks error", err);
      setBooks([]);
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

      const url = `${BASE_URL}/bookOrder/api`;
      const method = isEditMode ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        body: formData,
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      if (!res.ok) throw new Error(`Failed to ${isEditMode ? 'update' : 'create'} order: ${res.status}`);

      // success
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
          <h3 className="text-lg font-semibold text-gray-900">{isEditMode ? 'Edit Book Order' : 'Create Book Order'}</h3>
          <button type="button" onClick={() => { onClose(); resetForm(); }} className="text-gray-400 hover:text-gray-600">
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
                <option value="0" className="text-[var(--theme-primary-text)]">No Discount</option>
                <option value="5" className="text-[var(--theme-primary-text)]">5%</option>
                <option value="10" className="text-[var(--theme-primary-text)]">10%</option>
                <option value="15" className="text-[var(--theme-primary-text)]">15%</option>
                <option value="20" className="text-[var(--theme-primary-text)]">20%</option>
                <option value="25" className="text-[var(--theme-primary-text)]">25%</option>
                <option value="30" className="text-[var(--theme-primary-text)]">30%</option>
                <option value="50" className="text-[var(--theme-primary-text)]">50%</option>
              </select>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
              <h4 className="text-sm font-bold text-gray-900 uppercase">Book Items</h4>
              <button type="button" onClick={() => setItems((prev) => [...prev, { Title: '', Qty: 1, Price: 0 }])} className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline">+ ADD ITEM</button>
            </div>

            <div className="space-y-3">
              {items.map((it, idx) => (
                <div key={idx} className="bg-gray-50 p-3 rounded border border-gray-200 flex flex-col gap-2">
                  <div className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-11">
                      <select
                        aria-label={`Select book for item ${idx + 1}`}
                        value={it.BookId ? String(it.BookId) : ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          const sel = books.find((b) => String(b.Id) === val);
                          setItems((prev) =>
                            prev.map((p, i) =>
                              i === idx
                                ? {
                                  ...p,
                                  BookId: sel ? sel.Id : val,
                                  Title: sel?.Title || p.Title || "",
                                  Price: sel?.Price ?? p.Price ?? 0,
                                  Qty: p.Qty || 1,
                                }
                                : p
                            )
                          );
                        }}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm bg-white text-gray-900 focus:border-black outline-none"
                      >
                        <option value="">-- Select Book --</option>
                        {books.map((b) => (
                          <option key={b.Id} value={String(b.Id)} className="text-black">
                            {b.Title}
                            {b.Price ? ` - ${b.Price}` : ""}
                          </option>
                        ))}
                      </select>
                    </div>
                    <button type="button" onClick={() => setItems((prev) => prev.filter((_, i) => i !== idx))} className="col-span-1 text-gray-400 hover:text-red-600 text-center">✕</button>
                  </div>

                  <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-2">
                      <input
                        value={String(it.Qty)}
                        onChange={(e) => {
                          const v = Number(e.target.value || 0);
                          setItems((prev) => prev.map((p, i) => (i === idx ? { ...p, Qty: v } : p)));
                        }}
                        type="number"
                        min={1}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm bg-white text-gray-900 text-center focus:border-black outline-none"
                        placeholder="Qty"
                      />
                    </div>
                    <div className="col-span-4">
                      <input
                        value={String(it.Price)}
                        onChange={(e) => {
                          const v = Number(e.target.value || 0);
                          setItems((prev) => prev.map((p, i) => (i === idx ? { ...p, Price: v } : p)));
                        }}
                        type="number"
                        min={0}
                        className="w-full px-2 py-1.5 border border-gray-300 rounded text-sm bg-white text-gray-900 text-right focus:border-black outline-none"
                        placeholder="Price"
                      />
                    </div>
                    {/* Spacer to align with product modal style */}
                    <div className="col-span-6"></div>
                  </div>
                </div>
              ))}
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
          <button type="button" onClick={() => { onClose(); resetForm(); }} className="px-4 py-2 rounded text-sm font-medium text-[var(--accent-600)] bg-white border border-gray-300 hover:bg-gray-50 transition-colors">Cancel</button>
          <button
            type="submit"
            disabled={submitting}
            onClick={handleSubmit}
            className="flex-1 px-4 py-2 bg-[var(--accent-600)] rounded-2xl text-white rounded text-sm font-bold  shadow hover:opacity-90 active:translate-y-0.5 transition-all disabled:opacity-50"
          >
            {submitting ? (isEditMode ? 'Updating...' : 'Saving...') : (isEditMode ? 'Update Order' : 'Create Order')}
          </button>
        </div>
      </div>
    </div>
  );
}
