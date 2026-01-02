import React, { useState, useEffect } from 'react';
import { ShoppingCart } from 'lucide-react';
import BookCartDrawer from './BookCartDrawer';
import { useShoppingCart } from './BookCartContext';
import { SHOW_SHOPPING_CART } from "@/config";

export const CartButton: React.FC = () => {
  const [open, setOpen] = useState(false);
  const { cart } = useShoppingCart();
  const [pathname, setPathname] = useState(typeof window !== "undefined" ? window.location.pathname : "/");

  useEffect(() => {
    const handleLocationChange = () => {
      setPathname(window.location.pathname);
    };

    window.addEventListener("popstate", handleLocationChange);
    return () => window.removeEventListener("popstate", handleLocationChange);
  }, []);

  // Check if shopping is enabled and we are not on an admin page
  const currentPath = typeof window !== "undefined" ? window.location.pathname : "/";
  if (!SHOW_SHOPPING_CART || currentPath.startsWith('/admin')) {
    return null;
  }

  const totalQty = cart.items.reduce((s, it) => s + (it.Qty ?? 0), 0);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          background: 'var(--accent-500)',
          color: 'white',
          boxShadow: '0 8px 30px rgba(0,0,0,0.12)'
        }}
        className="fixed right-6 bottom-6 z-50 w-14 h-14 rounded-full flex items-center justify-center transition-all group hover:scale-110 active:scale-95"
        aria-label="Open cart"
      >
        <ShoppingCart size={24} className="group-hover:rotate-12 transition-transform" />
        {totalQty > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-[var(--accent-500)]">
            {totalQty}
          </span>
        )}
      </button>
      <BookCartDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
};

export default CartButton;
