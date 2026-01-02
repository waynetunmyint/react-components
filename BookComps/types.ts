export type StoredCartItem = {
  Title?: string;
  Price: number;
  Qty: number;
  PriceTotal: number;
};

export type StoredCart = {
  items: StoredCartItem[];
  GrandTotal: number;
};
