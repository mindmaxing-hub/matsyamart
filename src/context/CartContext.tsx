import React, { createContext, useContext, useState, useEffect } from "react";
import { Listing, CartItem, ExperienceSlot } from "../types";

export function getCartLineKey(listingId: string, slotId?: string | undefined): string {
  return slotId ? `${listingId}:${slotId}` : listingId;
}

interface CartContextType {
  items: CartItem[];
  addItem: (listing: Listing, quantity?: number, slot?: ExperienceSlot) => void;
  removeItem: (lineKeyOrListingId: string) => void;
  removeItems: (itemsToRemove: { listingId: string; slotId?: string | undefined }[]) => void;
  updateQuantity: (lineKeyOrListingId: string, quantity: number) => void;
  clearCart: () => void;
  totalAmount: number;
  totalItemsCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "matsyamart_cart_v1";

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      console.error("Failed to save cart to localStorage", err);
    }
  }, [items]);

  const addItem = (listing: Listing, quantity: number = 1, slot?: ExperienceSlot) => {
    const lineKey = getCartLineKey(listing.id, slot?.id);
    setItems((prev) => {
      const existing = prev.find(
        (item) => getCartLineKey(item.listing.id, item.slot?.id) === lineKey,
      );
      if (existing) {
        return prev.map((item) =>
          getCartLineKey(item.listing.id, item.slot?.id) === lineKey
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        );
      }
      return [...prev, { listing, quantity, slot }];
    });
    setIsCartOpen(true);
  };

  const removeItem = (lineKeyOrListingId: string) => {
    setItems((prev) =>
      prev.filter(
        (item) =>
          getCartLineKey(item.listing.id, item.slot?.id) !== lineKeyOrListingId &&
          item.listing.id !== lineKeyOrListingId,
      ),
    );
  };

  const removeItems = (
    itemsToRemove: { listingId: string; slotId?: string | undefined }[],
  ) => {
    const keysToRemove = new Set(
      itemsToRemove.map((i) => getCartLineKey(i.listingId, i.slotId)),
    );
    setItems((prev) =>
      prev.filter(
        (item) => !keysToRemove.has(getCartLineKey(item.listing.id, item.slot?.id)),
      ),
    );
  };

  const updateQuantity = (lineKeyOrListingId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(lineKeyOrListingId);
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        getCartLineKey(item.listing.id, item.slot?.id) === lineKeyOrListingId ||
        item.listing.id === lineKeyOrListingId
          ? { ...item, quantity }
          : item,
      ),
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalAmount = items.reduce(
    (sum, item) => sum + item.listing.price_inr * item.quantity,
    0,
  );

  const totalItemsCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        removeItems,
        updateQuantity,
        clearCart,
        totalAmount,
        totalItemsCount,
        isCartOpen,
        setIsCartOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
