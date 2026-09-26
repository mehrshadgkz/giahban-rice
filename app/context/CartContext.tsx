// Path: /app/context
// File: CartContext.tsx
// Version: 1.1.0
//
// v1.1.0: added weightKg to CartItem, so the checkout page can compute
// real total shipping weight (e.g. a 5kg bag × 2 quantity = 10kg) instead
// of incorrectly treating "quantity" as if it were kilograms. This
// matters going forward since not every product will always be 5kg
// (e.g. a future 1kg rice flour bag).

"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type CartItem = {
  slug: string;
  name: string;
  image: string;
  variantLabel: string;
  price: number;
  weightKg: number;
  quantity: number;
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (slug: string, variantLabel: string) => void;
  updateQuantity: (slug: string, variantLabel: string, quantity: number) => void;
  clearCart: () => void;
  cartCount: number;
  cartTotal: number;
  cartTotalWeightKg: number;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = "giahban-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setItems(JSON.parse(saved));
      } catch {
        // Ignore corrupted data, start with an empty cart
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, isLoaded]);

  function addItem(newItem: Omit<CartItem, "quantity">, quantity: number = 1) {
    setItems((current) => {
      const existing = current.find(
        (item) => item.slug === newItem.slug && item.variantLabel === newItem.variantLabel
      );
      if (existing) {
        return current.map((item) =>
          item === existing ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...current, { ...newItem, quantity }];
    });
  }

  function removeItem(slug: string, variantLabel: string) {
    setItems((current) =>
      current.filter((item) => !(item.slug === slug && item.variantLabel === variantLabel))
    );
  }

  function updateQuantity(slug: string, variantLabel: string, quantity: number) {
    if (quantity < 1) {
      removeItem(slug, variantLabel);
      return;
    }
    setItems((current) =>
      current.map((item) =>
        item.slug === slug && item.variantLabel === variantLabel
          ? { ...item, quantity }
          : item
      )
    );
  }

  function clearCart() {
    setItems([]);
  }

  const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  // Real total weight in kg — each item's own weightKg × how many of it
  // are in the cart, summed across every different item.
  const cartTotalWeightKg = items.reduce(
    (sum, item) => sum + item.weightKg * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        cartCount,
        cartTotal,
        cartTotalWeightKg,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used inside a CartProvider");
  }
  return context;
}