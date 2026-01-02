import React, { createContext, useContext, useEffect, useState } from "react";

export type StoredCartItem = {
  Id?: string | number;
  Title?: string;
  Price: number;
  Qty: number;
  PriceTotal: number;
};

type StoredCart = {
  items: StoredCartItem[];
  GrandTotal: number;
};

type ShoppingContextValue = {
  cart: StoredCart;
  addItem: (payload: { Id?: string | number; Title?: string; Price?: number; Qty?: number; PriceTotal?: number }) => void;
  removeItem: (index: number) => void;
  updateQty: (index: number, qty: number) => void;
  clearCart: () => void;
};

const ShoppingCartContext = createContext<ShoppingContextValue | undefined>(undefined);

import { PAGE_ID } from "@/config";

const STORAGE_KEY = `StoredCart_${PAGE_ID}`;

export const ShoppingCartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<StoredCart>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { items: [], GrandTotal: 0 };
      const parsed = JSON.parse(raw) as StoredCart;
      // Coerce numeric fields to numbers in case older entries stored them as strings
      const normalizedItems = (parsed.items || []).map((it: any) => ({
        Id: it.Id,
        Title: it.Title,
        Price: Number(it.Price) || 0,
        Qty: Number(it.Qty) || 0,
        PriceTotal: Number(it.PriceTotal) || 0,
      }));
      const grand = (Number(parsed.GrandTotal) || 0) || normalizedItems.reduce((s: number, it: any) => s + (Number(it.PriceTotal) || 0), 0);
      return { items: normalizedItems, GrandTotal: grand };
    } catch {
      return { items: [], GrandTotal: 0 };
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {
      console.error("Failed to persist cart", e);
    }
  }, [cart]);

  const recompute = (items: StoredCartItem[]) =>
    items.reduce((s, it) => s + (Number(it.PriceTotal) || 0), 0);

  const addItem = ({ Id, Title, Price, Qty, PriceTotal }: { Id?: string | number; Title?: string; Price?: number; Qty?: number; PriceTotal?: number }) => {
    const title = Title ?? "Untitled";
    const price = Number(Price) || 0;
    const qtyToAdd = Number(Qty) || 1;
    setCart((prev) => {
      const items = [...prev.items];
      // Prefer matching by Id when provided, otherwise fall back to title+price
      let existing = Id !== undefined ? items.find((i) => i.Id === Id) : undefined;
      if (!existing) existing = items.find((i) => i.Title === title && Number(i.Price) === price);

      if (existing) {
        existing.Qty = Number(existing.Qty || 0) + qtyToAdd;
        const itemPrice = Number(existing.Price) || 0;
        existing.PriceTotal = itemPrice * existing.Qty;
      } else {
        const p = price;
        const newItem: StoredCartItem = {
          Id,
          Title: title,
          Price: p,
          Qty: qtyToAdd,
          PriceTotal: Number(PriceTotal) || p * qtyToAdd,
        };
        items.push(newItem);
      }
      const GrandTotal = recompute(items);
      return { items, GrandTotal };
    });
  };

  const removeItem = (index: number) => {
    setCart((prev) => {
      const items = [...prev.items];
      if (index >= 0 && index < items.length) items.splice(index, 1);
      return { items, GrandTotal: recompute(items) };
    });
  };

  const updateQty = (index: number, qty: number) => {
    setCart((prev) => {
      const items = [...prev.items];
      if (items[index]) {
        const priceNum = Number(items[index].Price) || 0;
        items[index].Qty = qty;
        items[index].PriceTotal = priceNum * qty;
      }
      return { items, GrandTotal: recompute(items) };
    });
  };

  const clearCart = () => setCart({ items: [], GrandTotal: 0 });

  return (
    <ShoppingCartContext.Provider value={{ cart, addItem, removeItem, updateQty, clearCart }}>
      {children}
    </ShoppingCartContext.Provider>
  );
};

export const useShoppingCart = () => {
  const ctx = useContext(ShoppingCartContext);
  if (!ctx) throw new Error("useShoppingCart must be used within ShoppingCartProvider");
  return ctx;
};

export default ShoppingCartContext;
