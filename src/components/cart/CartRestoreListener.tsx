import React, { useEffect, useRef } from "react";
import { useCart } from "../../context/CartContext";
import { useData } from "../../context/DataContext";
import { decodeCartRestoreToken } from "../../lib/abandonedCart";
import { toast } from "sonner";

export const CartRestoreListener: React.FC = () => {
  const { restoreCartItems } = useCart();
  const { listings, slots } = useData();
  const processedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined" || processedRef.current) return;
    if (!listings || listings.length === 0) return;

    try {
      const searchParams = new URLSearchParams(window.location.search);
      const restoreToken = searchParams.get("restore");

      if (restoreToken) {
        processedRef.current = true;
        const decoded = decodeCartRestoreToken(restoreToken);

        if (decoded && decoded.items.length > 0) {
          const matchedItems = decoded.items
            .map((it) => {
              const listing = listings.find((l) => l.id === it.listingId);
              if (!listing) return null;
              const slot = it.slotId ? slots.find((s) => s.id === it.slotId) : undefined;
              return {
                listing,
                quantity: it.quantity || 1,
                slot,
              };
            })
            .filter(Boolean) as Array<{
            listing: (typeof listings)[0];
            quantity: number;
            slot?: (typeof slots)[0] | undefined;
          }>;

          if (matchedItems.length > 0) {
            restoreCartItems(
              matchedItems as Array<{
                listing: (typeof listings)[0];
                quantity: number;
                slot?: (typeof slots)[0] | undefined;
              }>,
            );
            toast.success("Welcome back! Your coastal basket has been restored.", {
              description: `${matchedItems.length} item(s) recovered with your selected dates.`,
              duration: 5000,
            });

            // Clean query parameter from URL without page reload
            searchParams.delete("restore");
            const newSearch = searchParams.toString();
            const newUrl =
              window.location.pathname + (newSearch ? `?${newSearch}` : "") + window.location.hash;
            window.history.replaceState({}, "", newUrl);
          }
        }
      }
    } catch (err) {
      console.warn("Error processing restore token:", err);
    }
  }, [listings, slots, restoreCartItems]);

  return null;
};
