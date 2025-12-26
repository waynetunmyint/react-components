import React from 'react';
import { Plus, Minus, Trash2 } from 'lucide-react';
import { useShoppingCart } from './BookCartContext';
import { StoredCartItem } from './types';
import { formatPrice } from '../HelperComps/TextCaseComp';

interface BookCartItemProps {
  item: StoredCartItem;
  index: number;
}

export const BookCartItem: React.FC<BookCartItemProps> = ({ item, index }) => {
  const { updateQty, removeItem } = useShoppingCart();

  const handleIncrement = () => {
    updateQty(index, (item.Qty || 0) + 1);
  };

  const handleDecrement = () => {
    if ((item.Qty || 0) > 1) {
      updateQty(index, (item.Qty || 0) - 1);
    }
  };

  const handleRemove = () => {
    removeItem(index);
  };

  return (
    <div className="flex items-start gap-4 p-4 bg-white rounded-xl border" style={{ borderColor: 'var(--theme-border-primary)' }}>
      {/* Book Info */}
      <div className="flex-1">
        <h4 className="font-semibold mb-2" style={{ color: 'var(--theme-text-primary)' }}>{item.Title || 'Untitled Book'}</h4>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm" style={{ color: 'var(--theme-text-secondary)' }}>Price:</span>
          <span className="font-semibold" style={{ color: 'var(--theme-text-primary)' }}>{formatPrice(item.Price)}</span>
        </div>

        {/* Quantity Controls */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
            <button
              onClick={handleDecrement}
              className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white active:opacity-70 transition-all"
              aria-label="Decrease quantity"
            >
              <Minus size={14} className="text-gray-700" />
            </button>
            <span className="w-8 text-center text-sm font-semibold" style={{ color: 'var(--theme-text-primary)' }}>
              {item.Qty || 0}
            </span>
            <button
              onClick={handleIncrement}
              className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-white active:opacity-70 transition-all"
              aria-label="Increase quantity"
            >
              <Plus size={14} className="text-gray-700" />
            </button>
          </div>

          <button
            onClick={handleRemove}
            className="p-2 text-red-600 hover:bg-red-50 rounded-lg active:opacity-70 transition-all"
            aria-label="Remove item"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Item Total */}
      <div className="text-right">
        <div className="text-sm mb-1" style={{ color: 'var(--theme-text-secondary)' }}>Total</div>
        <div className="text-lg font-bold" style={{ color: 'var(--theme-text-primary)' }}>
          {formatPrice(item.PriceTotal)}
        </div>
      </div>
    </div>
  );
};

export default BookCartItem;
