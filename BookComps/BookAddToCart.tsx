import React, { useState } from 'react';
import { ShoppingCart, Plus, Minus } from 'lucide-react';
import { useShoppingCart } from './BookCartContext';

interface BookAddToCartProps {
  bookId: string | number;
  bookTitle: string;
  bookPrice: number;
  bookThumbnail?: string;
  className?: string;
}

export const BookAddToCart: React.FC<BookAddToCartProps> = ({
  bookId,
  bookTitle,
  bookPrice,
  className = '',
}) => {
  const { addItem } = useShoppingCart();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    setIsAdding(true);

    try {
      await addItem({
        Id: bookId,
        Title: bookTitle,
        Price: bookPrice,
        Qty: quantity,
        PriceTotal: bookPrice * quantity,
      });

      // Reset quantity after adding
      setQuantity(1);
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const incrementQty = () => setQuantity((prev) => prev + 1);
  const decrementQty = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Quantity Selector */}
      <div className="flex items-center gap-2 bg-[var(--theme-text-secondary)]/10 rounded-lg p-1">
        <button
          onClick={decrementQty}
          className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[var(--theme-text-secondary)]/10 active:opacity-70 transition-all"
          aria-label="Decrease quantity"
        >
          <Minus size={16} className="text-[var(--theme-text-muted)]" />
        </button>
        <span className="w-10 text-center font-semibold" style={{ color: 'var(--theme-text-primary)' }}>
          {quantity}
        </span>
        <button
          onClick={incrementQty}
          className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-[var(--theme-text-secondary)]/10 active:opacity-70 transition-all"
          aria-label="Increase quantity"
        >
          <Plus size={16} className="text-[var(--theme-text-muted)]" />
        </button>
      </div>

      {/* Add to Cart Button */}
      <button
        onClick={handleAddToCart}
        disabled={isAdding}
        id="page-button-primary"
        style={{
          backgroundColor: 'var(--theme-primary-bg)',
          color: 'var(--theme-primary-text)'
        }}
        className="flex-1 px-6 py-3 rounded-xl font-semibold flex items-center justify-center gap-2 active:opacity-70 disabled:opacity-50 transition-all hover:opacity-90"
      >
        <ShoppingCart size={18} />
        {isAdding ? 'Adding...' : 'Add to Cart'}
      </button>
    </div>
  );
};

export default BookAddToCart;
