import React, { useState } from 'react';
import { useShoppingCart, StoredCartItem } from './BookCartContext';
import { useToast } from '../UIComps/ToastContext';
import BookCheckoutForm from './BookCheckoutForm';
import { Trash2, ShoppingBag, Plus, Minus, X, Trash } from 'lucide-react';
import { formatPrice } from '../HelperComps/TextCaseComp';

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
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] transition-opacity animate-in fade-in duration-300"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-[450px] shadow-[-20px_0_50px_rgba(0,0,0,0.2)] transform transition-transform duration-500 ease-out z-[101] flex flex-col ${open ? 'translate-x-0' : 'translate-x-full'
          } bg-[var(--theme-secondary-bg)] text-[var(--theme-text-primary)]`}
        aria-hidden={!open}
      >
        <div className="p-6 border-b flex items-center justify-between" style={{ borderColor: 'var(--theme-border-primary)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-lg" style={{ background: 'var(--accent-500)' }}>
              <ShoppingBag size={20} />
            </div>
            <div>
              <h3 className="text-xl font-black uppercase tracking-tight">Your Cart</h3>
              <p className="text-[10px] text-[var(--theme-text-muted)] font-bold uppercase tracking-widest -mt-1">
                {cart.items.length} {cart.items.length === 1 ? 'item' : 'items'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-[var(--bg-200)] text-[var(--theme-text-muted)] hover:text-[var(--scolor)] transition-all active:scale-90"
          >
            <X size={24} />
          </button>
        </div>

        {checkout ? (
          <BookCheckoutForm items={cart.items} grandTotal={cart.GrandTotal} onCancel={() => setCheckout(false)} onComplete={handleOrderComplete} />
        ) : (
          <>
            <div className="flex-1 p-6 space-y-6 overflow-y-auto scrollbar-thin scrollbar-thumb-[var(--bg-300)]">
              {cart.items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-12 opacity-40">
                  <div className="w-24 h-24 rounded-[2.5rem] bg-[var(--bg-200)] flex items-center justify-center mb-2">
                    <ShoppingBag size={48} className="text-[var(--theme-text-muted)]" />
                  </div>
                  <h4 className="font-bold text-lg uppercase tracking-tight">Empty Cart</h4>
                  <p className="text-xs font-medium">Looks like you haven't added anything yet.</p>
                </div>
              ) : (
                cart.items.map((it: StoredCartItem, idx: number) => (
                  <div key={idx} className="group flex flex-col gap-4 p-4 rounded-[2rem] bg-white shadow-sm border border-[var(--theme-border-primary)] transition-all hover:shadow-md hover:border-[var(--scolor)]/20">
                    <div className="flex justify-between items-start gap-3">
                      <div className="font-black text-sm uppercase leading-tight tracking-tight line-clamp-2" style={{ color: 'var(--theme-text-primary)' }}>{it.Title}</div>
                      <button
                        onClick={() => removeItem(idx)}
                        className="p-2 rounded-xl text-red-100 hover:text-red-500 hover:bg-red-50 transition-all flex-shrink-0"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-2">
                      <div className="flex items-center gap-1 bg-[var(--bg-200)] p-1 rounded-2xl">
                        <button
                          onClick={() => updateQty(idx, Math.max(1, it.Qty - 1))}
                          className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white hover:shadow-sm text-[var(--theme-text-muted)] hover:text-[var(--scolor)] transition-all active:scale-90"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="w-12 text-center text-sm font-black text-[var(--theme-text-primary)]">{it.Qty}</span>
                        <button
                          onClick={() => updateQty(idx, it.Qty + 1)}
                          className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white hover:shadow-sm text-[var(--theme-text-muted)] hover:text-[var(--scolor)] transition-all active:scale-90"
                        >
                          <Plus size={16} />
                        </button>
                      </div>

                      <div className="text-right">
                        <p className="text-[10px] font-bold text-[var(--theme-text-muted)] uppercase tracking-wider mb-1">Subtotal</p>
                        <div className="text-sm font-black" style={{ color: 'var(--theme-text-primary)' }}>{it.PriceTotal.toLocaleString()} MMK</div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="p-8 bg-white border-t border-[var(--theme-border-primary)] shadow-[0_-15px_30px_rgba(0,0,0,0.05)]">
              <div className="flex items-end justify-between mb-6">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--theme-text-muted)] mb-1">Total Order Value</p>
                  <div className="text-2xl font-black text-[var(--accent-500)] tracking-tighter">
                    {cart.GrandTotal.toLocaleString()} <span className="text-xs ml-1">MMK</span>
                  </div>
                </div>
                <button
                  onClick={clearCart}
                  className="text-[10px] font-black uppercase tracking-widest text-red-500/60 hover:text-red-500 flex items-center gap-1.5 transition-colors p-1"
                >
                  <Trash size={12} />
                  Clear Cart
                </button>
              </div>
              <div className="flex gap-4">
                <button
                  disabled={cart.items.length === 0}
                  onClick={() => setCheckout(true)}
                  className="flex-1 py-4.5 rounded-[1.5rem] text-sm font-black uppercase tracking-widest text-white shadow-xl hover:shadow-[var(--scolor)]/20 hover:-translate-y-1 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale disabled:pointer-events-none py-4"
                  style={{ background: 'var(--accent-500)' }}
                >
                  Checkout Now
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default CartDrawer;
