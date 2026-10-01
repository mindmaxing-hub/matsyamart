import React, { createContext, useContext, useState, useEffect } from "react";
import { Listing } from "../types";
import { useData } from "./DataContext";

interface WishlistContextType {
  wishlistIds: string[];
  wishlistItems: Listing[];
  isInWishlist: (id: string) => boolean;
  toggleWishlist: (listing: Listing) => void;
  addToWishlist: (listing: Listing) => void;
  removeFromWishlist: (id: string) => void;
  clearWishlist: () => void;
  isWishlistOpen: boolean;
  setIsWishlistOpen: (open: boolean) => void;
  wishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined,
);

const WISHLIST_STORAGE_KEY = "matsyamart_wishlist_v1";
const WISHLIST_COOKIE_KEY = "matsyamart_wishlist";

// Helper to read cookie
function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(
    new RegExp("(^|;\\s*)(" + name + ")=([^;]*)"),
  );
  return match && match[3] !== undefined ? decodeURIComponent(match[3]) : null;
}

// Helper to set cookie (30 days, Lax, secure if https)
function setCookie(name: string, value: string, days = 30) {
  if (typeof document === "undefined") return;
  const date = new Date();
  date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${date.toUTCString()}; path=/; SameSite=Lax${secure}`;
}

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { listings } = useData();

  const [wishlistIds, setWishlistIds] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      // 1. Check sessionStorage first
      const sessionData = sessionStorage.getItem(WISHLIST_STORAGE_KEY);
      if (sessionData) {
        const parsed = JSON.parse(sessionData);
        if (Array.isArray(parsed)) return parsed;
      }

      // 2. Check localStorage
      const localData = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (localData) {
        const parsed = JSON.parse(localData);
        if (Array.isArray(parsed)) return parsed;
      }

      // 3. Fallback to cookie
      const cookieData = getCookie(WISHLIST_COOKIE_KEY);
      if (cookieData) {
        const parsed = JSON.parse(cookieData);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn("Could not restore wishlist from client storage:", e);
    }
    return [];
  });

  const [isWishlistOpen, setIsWishlistOpen] = useState(false);

  // Sync state to sessionStorage, localStorage, and cookie whenever it changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const serialized = JSON.stringify(wishlistIds);
      sessionStorage.setItem(WISHLIST_STORAGE_KEY, serialized);
      localStorage.setItem(WISHLIST_STORAGE_KEY, serialized);
      setCookie(WISHLIST_COOKIE_KEY, serialized, 30);
    } catch (err) {
      console.warn("Failed to persist wishlist across storage/cookie:", err);
    }
  }, [wishlistIds]);

  const isInWishlist = (id: string) => wishlistIds.includes(id);

  const addToWishlist = (listing: Listing) => {
    setWishlistIds((prev) => {
      if (prev.includes(listing.id)) return prev;
      return [...prev, listing.id];
    });
  };

  const removeFromWishlist = (id: string) => {
    setWishlistIds((prev) => prev.filter((item) => item !== id));
  };

  const toggleWishlist = (listing: Listing) => {
    setWishlistIds((prev) => {
      if (prev.includes(listing.id)) {
        return prev.filter((item) => item !== listing.id);
      }
      return [...prev, listing.id];
    });
  };

  const clearWishlist = () => {
    setWishlistIds([]);
  };

  // Resolve full listing objects
  const wishlistItems = wishlistIds
    .map((id) => listings.find((l) => l.id === id))
    .filter((l): l is Listing => Boolean(l));

  return (
    <WishlistContext.Provider
      value={{
        wishlistIds,
        wishlistItems,
        isInWishlist,
        toggleWishlist,
        addToWishlist,
        removeFromWishlist,
        clearWishlist,
        isWishlistOpen,
        setIsWishlistOpen,
        wishlistCount: wishlistIds.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = (): WishlistContextType => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
};
