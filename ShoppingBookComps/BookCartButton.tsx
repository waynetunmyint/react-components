import React, { useState, useEffect } from 'react';
import { ShoppingCart } from 'lucide-react';
import BookCartDrawer from './BookCartDrawer';
import { useShoppingCart } from './BookCartContext';
import { SHOW_SHOPPING_CART } from '../../../config';

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
          backgroundColor: 'var(--theme-primary-bg)',
          color: 'var(--theme-primary-text)'
        }}
        className="fixed right-6 bottom-6 z-50 p-3 rounded-full shadow-lg flex items-center gap-2 hover:opacity-90 active:scale-95 transition-all"
        aria-label="Open cart"
      >
        <ShoppingCart size={18} />
        <span className="text-sm font-medium">{totalQty}</span>
      </button>
      <BookCartDrawer open={open} onClose={() => setOpen(false)} />
    </>
  );
};

export default CartButton;
