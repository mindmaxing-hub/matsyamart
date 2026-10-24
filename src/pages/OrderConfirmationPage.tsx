import React, { useState, useEffect } from "react";
import { Link } from "../components/ui/Link";
import { useData } from "../context/DataContext";
import { DigitalPass } from "../components/order/DigitalPass";
import { GoodsOrderTracker } from "../components/order/GoodsOrderTracker";
import { TaxInvoice } from "../components/order/TaxInvoice";
import { decodePassPayload } from "../lib/passPayload";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import { Order } from "../types";
import { ArrowLeft, AlertCircle, FileText, Loader2 } from "lucide-react";

interface OrderConfirmationPageProps {
  orderRef?: string;
}

export const OrderConfirmationPage: React.FC<OrderConfirmationPageProps> = ({
  orderRef: refProp,
}) => {
  let orderRef = refProp;
  if (!orderRef && typeof window !== "undefined") {
    const parts = window.location.pathname.split("/").filter(Boolean);
    orderRef = parts[parts.length - 1];
  }
  if (orderRef) {
    orderRef = orderRef.split("?")[0]?.split("#")[0]?.trim();
  }

  const { getOrderByRef, addOrHydrateOrder } = useData();
  const contextOrder = orderRef ? getOrderByRef(orderRef) : undefined;

  const [hydratedOrder, setHydratedOrder] = useState<Order | undefined>(contextOrder);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showInvoice, setShowInvoice] = useState(false);

  useEffect(() => {
    if (contextOrder) {
      setHydratedOrder(contextOrder);
      return;
    }

    // Step 1: Check if a self-contained payload token (?p=...) is present in URL
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      const token = searchParams.get("p");
      if (token) {
        const decoded = decodePassPayload(token);
        if (decoded) {
          addOrHydrateOrder(decoded);
          setHydratedOrder(decoded);
          return;
        }
      }
    }

    // Step 2: If not in local context and not in ?p=, check Supabase fallback
    if (orderRef && isSupabaseConfigured && supabase) {
      setIsLoading(true);
      (async () => {
        try {
          const { data, error } = await supabase
            .from("orders")
            .select("*, booking_items(*, offering:offerings(*))")
            .eq("order_ref", orderRef)
            .single();

          if (!error && data) {
            // Reconstruct minimal Order from Supabase
            const remoteOrder: Order = {
              id: data.id,
              order_ref: data.order_ref,
              customer_name: data.customer_name,
              customer_email: data.customer_email,
              customer_phone: data.customer_phone,
              total_amount_inr: data.total_amount_inr,
              status: data.status || "confirmed",
              shipping_address: data.shipping_address,
              emergency_contact: data.emergency_contact,
              created_at: data.created_at,
              items: (data.booking_items || []).map((bi: any) => ({
                id: bi.id,
                order_id: data.id,
                listing_id: bi.offering_id,
                quantity: bi.quantity,
                unit_price_inr: bi.unit_price_inr || 0,
                listing: bi.offering,
              })),
            };
            addOrHydrateOrder(remoteOrder);
            setHydratedOrder(remoteOrder);
          }
        } catch (err) {
          console.error("Failed to fetch remote order:", err);
        } finally {
          setIsLoading(false);
        }
      })();
    }
  }, [orderRef, contextOrder, addOrHydrateOrder]);

  const activeOrder = hydratedOrder || contextOrder;

  if (isLoading) {
    return (
      <div className="max-w-xl mx-auto px-4 py-28 text-center space-y-4">
        <Loader2 className="w-8 h-8 text-[#e3a157] animate-spin mx-auto" />
        <h2 className="font-display font-bold text-xl text-[#f5edeb]">
          Verifying Coastal Order...
        </h2>
        <p className="text-xs text-[#dab38c]">
          Fetching secure order verification records.
        </p>
      </div>
    );
  }

  if (!activeOrder) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-[#35160e] text-[#e3a157] border border-[#dab38c]/25 flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="font-display font-bold text-2xl text-[#f5edeb]">
          Order Pass Not Found
        </h2>
        <p className="text-xs text-[#dab38c]">
          We could not locate reference{" "}
          <code className="font-mono bg-[#1f0b07] text-[#e3a157] px-2 py-0.5 rounded border border-[#dab38c]/25">
            {orderRef}
          </code>
          . If you recently completed payment, please check your WhatsApp or
          return home.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#e3a157] hover:bg-[#dab38c] text-[#29100b] rounded-xl text-xs font-bold transition-colors shadow-md cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Return to Catalog
        </Link>
      </div>
    );
  }

  const isAllGoods =
    activeOrder.items.length > 0 &&
    activeOrder.items.every((it) => it.listing?.type === "product");

  const hasExperiences = activeOrder.items.some(
    (it) => it.listing?.type === "experience",
  );

  const hasGoods = activeOrder.items.some(
    (it) => it.listing?.type === "product",
  );

  const isMixed = hasExperiences && hasGoods;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Navigation & Global Actions */}
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#dab38c] hover:text-[#f5edeb] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Return to Catalog Home
        </Link>

        <button
          onClick={() => setShowInvoice(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#35160e] hover:bg-[#481f14] text-[#e3a157] text-xs font-semibold border border-[#dab38c]/30 shadow-xs cursor-pointer transition-colors"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>GST Tax Invoice</span>
        </button>
      </div>

      {/* Case 1: Pure Physical Goods Order (e.g. Mangrove Wild Honey) -> Shopify-Style Delivery Tracker */}
      {isAllGoods && (
        <GoodsOrderTracker
          order={activeOrder}
          onViewInvoice={() => setShowInvoice(true)}
        />
      )}

      {/* Case 2: Pure Experience Booking (Walks, Food, Workshops) -> Verified Boarding Pass */}
      {hasExperiences && !hasGoods && <DigitalPass order={activeOrder} />}

      {/* Case 3: Mixed Order (Both Experience & Physical Goods) -> Boarding Pass + Delivery Portal */}
      {isMixed && (
        <div className="space-y-12">
          <div>
            <div className="mb-4 text-center">
              <span className="px-3 py-1 rounded-full bg-[#35160e] text-[#e3a157] border border-[#dab38c]/30 text-xs font-bold uppercase tracking-wider">
                Part 1 · Event Admission Boarding Pass
              </span>
            </div>
            <DigitalPass order={activeOrder} />
          </div>

          <div className="border-t border-[#dab38c]/20 pt-8">
            <div className="mb-6 text-center">
              <span className="px-3 py-1 rounded-full bg-[#35160e] text-emerald-400 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider">
                Part 2 · Physical Goods Delivery Tracker
              </span>
            </div>
            <GoodsOrderTracker
              order={activeOrder}
              onViewInvoice={() => setShowInvoice(true)}
            />
          </div>
        </div>
      )}

      {/* Tax Invoice Modal */}
      {showInvoice && (
        <TaxInvoice
          order={activeOrder}
          onClose={() => setShowInvoice(false)}
        />
      )}
    </div>
  );
};
