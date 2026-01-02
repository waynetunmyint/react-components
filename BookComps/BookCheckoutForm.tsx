import React, { useState } from 'react';
import { StoredCartItem } from './types';
import { BASE_URL, PAGE_ID, SHOPPING_TYPE } from '@/config';
import { GetStoredJWT } from '../StorageComps/StorageCompOne';


type Props = {
  items: StoredCartItem[];
  grandTotal: number;
  onCancel: () => void;
  onComplete: (order: any) => void;
};

const CheckoutForm: React.FC<Props> = ({ items, grandTotal, onCancel, onComplete }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  // Dynamically determine endpoint based on type (book or product)
  const ORDERS_API = SHOPPING_TYPE === "book"
    ? BASE_URL + "/bookOrder/api"
    : BASE_URL + "/productOrder/api";
  const token = GetStoredJWT();

  // Show notification with black background
  const showNotification = (msg: string) => {
    setServerError(msg);
    setTimeout(() => setServerError(null), 3000);
  };

  const validate = () => {
    return (
      name.trim().length > 0 &&
      phone.trim().length > 0 &&
      email.trim().length > 0 &&
      address.trim().length > 0
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      showNotification('Please fill in all required fields');
      return;
    }
    setLoading(true);

    // assemble a simple order object
    const order = {
      id: Date.now(),
      customer: { name: name.trim(), phone: phone.trim(), email: email.trim(), address: address.trim() },
      items: items.map((it) => ({ Title: it.Title, Price: it.Price, Qty: it.Qty, PriceTotal: it.PriceTotal })),
      grandTotal,
      createdAt: new Date().toISOString(),
    };

    // If ORDERS_API is set, POST to server; otherwise fallback to localStorage
    try {
      if (ORDERS_API && ORDERS_API.trim() !== "") {

        const formData = new FormData();
        formData.append('pageId', String(PAGE_ID));
        formData.append('customerName', order.customer.name);
        formData.append('customerPhone', order.customer.phone || '');
        formData.append('customerEmail', order.customer.email || '');
        formData.append('customerAddress', order.customer.address || '');
        formData.append('orderGrandTotal', order.grandTotal.toString());
        formData.append('orderItems', JSON.stringify(order.items));

        const resp = await fetch(ORDERS_API, {
          method: 'POST',
          body: formData,
          headers: {
            ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          },
        });
        if (!resp.ok) {
          // fallback to local storage on error
          console.error('Server returned error for order', resp.statusText);
          const raw = localStorage.getItem('StoredOrder');
          const orders = raw ? JSON.parse(raw) : [];
          orders.push(order);
          localStorage.setItem('StoredOrder', JSON.stringify(orders));
          onComplete(order);
        } else {
          // try to use server response if provided
          let serverData = null;
          try {
            serverData = await resp.json();
          } catch {
            /* ignore parse errors */
          }
          onComplete(serverData ?? order);
        }
      } else {
        const raw = localStorage.getItem('StoredOrder');
        const orders = raw ? JSON.parse(raw) : [];
        orders.push(order);
        localStorage.setItem('StoredOrder', JSON.stringify(orders));
        onComplete(order);
      }
    } catch (err) {
      console.error('Failed to submit order', err);
      // fallback to local storage
      try {
        const raw = localStorage.getItem('StoredOrder');
        const orders = raw ? JSON.parse(raw) : [];
        orders.push(order);
        localStorage.setItem('StoredOrder', JSON.stringify(orders));
        onComplete(order);
      } catch (e) {
        console.error('Failed to save order locally', e);
        showNotification('Failed to place order');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 space-y-3 h-[calc(100%-160px)] overflow-y-auto relative">
      {serverError && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[var(--theme-primary-text)] text-[var(--theme-primary-bg)] px-6 py-4 rounded-lg shadow-2xl z-50 animate-fade-in flex flex-col items-center">
          <span className="text-2xl mb-2">⚠️</span>
          <span>{serverError}</span>
        </div>
      )}

      <h4 className="text-lg font-semibold" style={{ color: 'var(--theme-primary-text)' }}>Checkout</h4>
      <div>
        <label className="text-sm" style={{ color: 'var(--theme-text-muted)' }}>Name *</label>
        <input value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-white border rounded px-2 py-1 mt-1 outline-none focus:ring-1 focus:ring-[var(--theme-primary-bg)]" style={{ color: 'var(--theme-primary-text)', borderColor: 'var(--theme-border-primary)' }} />
      </div>
      <div>
        <label className="text-sm" style={{ color: 'var(--theme-text-muted)' }}>Phone *</label>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-white border rounded px-2 py-1 mt-1 outline-none focus:ring-1 focus:ring-[var(--theme-primary-bg)]" style={{ color: 'var(--theme-primary-text)', borderColor: 'var(--theme-border-primary)' }} />
      </div>
      <div>
        <label className="text-sm" style={{ color: 'var(--theme-text-muted)' }}>Email *</label>
        <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-white border rounded px-2 py-1 mt-1 outline-none focus:ring-1 focus:ring-[var(--theme-primary-bg)]" style={{ color: 'var(--theme-primary-text)', borderColor: 'var(--theme-border-primary)' }} />
      </div>
      <div>
        <label className="text-sm" style={{ color: 'var(--theme-text-muted)' }}>Address *</label>
        <textarea value={address} onChange={(e) => setAddress(e.target.value)} className="w-full bg-white border rounded px-2 py-1 mt-1 resize-y outline-none focus:ring-1 focus:ring-[var(--theme-primary-bg)]" style={{ color: 'var(--theme-primary-text)', borderColor: 'var(--theme-border-primary)' }} rows={4} />
      </div>

      <div className="pt-2 border-t" style={{ borderColor: 'var(--theme-border-primary)' }}>
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm" style={{ color: 'var(--theme-text-muted)' }}>Grand Total</div>
          <div className="font-semibold" style={{ color: 'var(--theme-primary-text)' }}>{grandTotal.toLocaleString()} MMK</div>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onCancel}
            style={{ borderColor: 'var(--theme-border-primary)', color: 'var(--theme-primary-text)' }}
            className="flex-1 px-3 py-2 border rounded text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{ backgroundColor: 'var(--theme-primary-bg)', color: 'var(--theme-primary-text)' }}
            className="flex-1 px-3 py-2 rounded text-sm font-bold hover:opacity-90 active:scale-[0.98] transition-all shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Placing...' : 'Place Order'}
          </button>
        </div>
      </div>
    </form>
  );
};

export default CheckoutForm;
