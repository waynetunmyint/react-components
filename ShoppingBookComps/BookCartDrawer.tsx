import React, { useState } from 'react';
import { useShoppingCart } from './BookCartContext';
import { useToast } from '../UIComps/ToastContext';
import BookCheckoutForm from './BookCheckoutForm';
import { Delete } from 'lucide-react';
import { formatPrice } from '../UniversalComps/Universal_FormatterComp';

export const CartDrawer: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  const { cart, updateQty, removeItem, clearCart } = useShoppingCart();
  const { show } = useToast();
  const [checkout, setCheckout] = useState(false);

  const handleOrderComplete = () => {
    // clear cart and show success
    clearCart();
    show('Order placed — thank you!');
    setCheckout(false);
    onClose();
  };

  return (
    <div
      className={`fixed top-0 right-0 h-full w-full md:w-96 bg-white shadow-lg transform transition-transform z-40 ${open ? 'translate-x-0' : 'translate-x-full'
        } text-gray-900`}
      aria-hidden={!open}
    >
      <div className="p-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--theme-border-primary, #eee)' }}>
        <h3 className="text-lg font-semibold" style={{ color: '#111' }}>Cart</h3>
        <button onClick={onClose} className="text-sm hover:opacity-80 transition-opacity" style={{ color: 'var(--theme-text-secondary)' }}>Close</button>
      </div>

      {checkout ? (
        <BookCheckoutForm items={cart.items} grandTotal={cart.GrandTotal} onCancel={() => setCheckout(false)} onComplete={handleOrderComplete} />
      ) : (
        <>
          <div className="p-4 space-y-4 overflow-y-auto h-[calc(100%-160px)]">
            {cart.items.length === 0 && <div className="text-sm text-gray-500">Cart is empty</div>}
            {cart.items.map((it, idx) => (
              <div key={idx} className="w-full py-2 border-b last:border-b-0" style={{ borderColor: 'var(--theme-border-primary, #eee)' }}>
                <div className="font-medium truncate" style={{ color: '#111' }}>{it.Title}</div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 items-center mt-2">
                  <div className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>{formatPrice(it.Price) ?? 0} MMK</div>

                  <div className="flex items-center justify-center">
                    <input
                      type="number"
                      min={1}
                      value={it.Qty}
                      onChange={(e) => updateQty(idx, Math.max(1, Number(e.target.value || 1)))}
                      className="w-20 border rounded px-2 py-1 text-sm text-center bg-white outline-none focus:ring-1 focus:ring-[var(--theme-primary-bg)]"
                      style={{ color: '#111', borderColor: 'var(--theme-border-primary, #eee)' }}
                    />
                  </div>

                  <div className="text-sm font-medium text-right" style={{ color: '#111' }}>{it.PriceTotal.toLocaleString()} MMK</div>

                  <div className="flex justify-end">
                    <button onClick={() => removeItem(idx)} className="text-sm text-red-600">
                      <Delete size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t" style={{ borderColor: 'var(--theme-border-primary, #eee)' }}>
            <div className="flex items-center justify-between mb-3">
              <div className="text-sm" style={{ color: '#666' }}>Grand Total</div>
              <div className="font-semibold" style={{ color: '#111' }}>{cart.GrandTotal.toLocaleString()} MMK</div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={clearCart}
                style={{ borderColor: 'var(--theme-border-primary, #eee)', color: '#333' }}
                className="flex-1 px-3 py-2 border rounded text-sm hover:bg-gray-50 transition-colors"
              >
                Clear
              </button>
              <button
                onClick={() => setCheckout(true)}
                style={{ backgroundColor: 'var(--theme-primary-bg)', color: 'var(--theme-primary-text)' }}
                className="flex-1 px-3 py-2 rounded text-sm font-semibold hover:opacity-90 transition-all shadow-md"
              >
                Checkout
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default CartDrawer;
