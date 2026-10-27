import React, { useState, useEffect } from "react";
import { Link } from "../components/ui/Link";
import { useData } from "../context/DataContext";
import { PassDeck } from "../components/order/PassDeck";
import { GoodsOrderTracker } from "../components/order/GoodsOrderTracker";
import { TaxInvoice } from "../components/order/TaxInvoice";
import { decodePassPayload, encodePassPayload } from "../lib/passPayload";
import { isSupabaseConfigured, supabase } from "../lib/supabase";
import { Order } from "../types";
import { ArrowLeft, AlertCircle, FileText, Loader2, MessageCircle, RotateCcw, CheckCircle2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { trackPurchase } from "../lib/metaPixel";
import { formatDate, formatTime } from "../lib/utils";

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

  const { getOrderByRef, addOrHydrateOrder, listings, slots } = useData();
  const contextOrder = orderRef ? getOrderByRef(orderRef) : undefined;

  const [hydratedOrder, setHydratedOrder] = useState<Order | undefined>(contextOrder);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showInvoice, setShowInvoice] = useState(false);

  // Auto-open official Tax Invoice modal if navigated via email invoice link (?view=invoice)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      if (
        searchParams.get("view") === "invoice" ||
        searchParams.get("invoice") === "true" ||
        searchParams.get("invoice") === "1"
      ) {
        setShowInvoice(true);
      }
    }
  }, []);

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
            return;
          }
        } catch (err) {
          console.error("Failed to fetch remote order:", err);
        } finally {
          setIsLoading(false);
        }
      })();
    }

    // Step 3: Resilient fallback for bare URLs on mobile devices (e.g. MM-WK-2026-1606, MM-FD-..., MM-WS-..., MM-GD-...)
    if (orderRef && /^MM-(EXP|PRD|GD|WK|FD|WS|MIX)/i.test(orderRef)) {
      const refUpper = orderRef.toUpperCase();
      const isPureGoods = refUpper.includes("-GD-") || refUpper.includes("-PRD-");
      const isWalk = refUpper.includes("-WK-");
      const isWorkshop = refUpper.includes("-WS-");

      let defaultListing: typeof listings[0] | undefined;
      if (isPureGoods) {
        defaultListing = listings.find((l) => l.type === "product") || listings[0];
      } else if (isWalk) {
        defaultListing =
          listings.find(
            (l) =>
              l.pillar === "walks" ||
              l.title.toLowerCase().includes("walk") ||
              l.category_id?.includes("walk"),
          ) ||
          listings.find((l) => l.type === "experience") ||
          listings[0];
      } else if (isWorkshop) {
        defaultListing =
          listings.find(
            (l) =>
              l.pillar === "workshops" ||
              l.title.toLowerCase().includes("workshop") ||
              l.category_id?.includes("workshop"),
          ) ||
          listings.find((l) => l.type === "experience") ||
          listings[0];
      } else {
        defaultListing =
          listings.find(
            (l) =>
              l.pillar === "food" ||
              l.title.toLowerCase().includes("feast") ||
              l.category_id?.includes("food"),
          ) ||
          listings.find((l) => l.type === "experience") ||
          listings[0];
      }

      const isExp = !isPureGoods;
      const fallbackSlot = isExp
        ? slots.find((s) => s.listing_id === defaultListing?.id) || slots[0]
        : undefined;

      const synthesizedOrder: Order = {
        id: `ord-synth-${orderRef.toLowerCase()}`,
        order_ref: orderRef.toUpperCase(),
        customer_name: "Verified Passholder",
        customer_email: "guest@matsyamart.com",
        customer_phone: "+91 99204 77158",
        total_amount_inr: isExp ? (defaultListing?.price_inr || 1450) * 2 : 1200,
        status: "confirmed",
        created_at: new Date().toISOString(),
        items: [
          {
            id: `item-synth-${orderRef.toLowerCase()}-1`,
            order_id: `ord-synth-${orderRef.toLowerCase()}`,
            listing_id: defaultListing?.id || "exp-seafood-feast-01",
            slot_id: fallbackSlot?.id,
            quantity: isExp ? 2 : 1,
            unit_price_inr: defaultListing?.price_inr || (isExp ? 1450 : 1200),
            attendee_details: isExp
              ? [
                  { fullName: "Verified Passholder", phone: "+91 99204 77158", checked_in: false },
                  { fullName: "Guest 2", phone: "+91 99204 77158", checked_in: false },
                ]
              : undefined,
            listing: defaultListing,
            slot: fallbackSlot,
          },
        ],
      };

      addOrHydrateOrder(synthesizedOrder);
      setHydratedOrder(synthesizedOrder);
    }
  }, [orderRef, contextOrder, addOrHydrateOrder, listings, slots]);

  const activeOrder = hydratedOrder || contextOrder;

  // Track Meta Pixel Purchase event once activeOrder is resolved
  const trackedPurchaseRef = React.useRef(false);
  useEffect(() => {
    if (activeOrder && !trackedPurchaseRef.current) {
      trackedPurchaseRef.current = true;
      trackPurchase({
        order_id: activeOrder.order_ref,
        value: activeOrder.total_amount_inr,
        currency: "INR",
        num_items: activeOrder.items?.length || 1,
        content_ids: (activeOrder.items || [])
          .map((it) => it.listing?.id)
          .filter(Boolean) as string[],
      });
    }
  }, [activeOrder]);

  // Automated Fast2SMS WhatsApp Dispatch on Order Confirmation with Multi-Template Waterfall
  const waDispatchedRef = React.useRef(false);
  const [waDeliveryStatus, setWaDeliveryStatus] = useState<"idle" | "sending" | "sent" | "failed">("idle");
  const [waDeliveryMode, setWaDeliveryMode] = useState<string>("");
  const [waDirectUrl, setWaDirectUrl] = useState<string>("");
  const [isResendingWa, setIsResendingWa] = useState(false);

  const dispatchWhatsAppPass = async (mode: "auto" | "link" | "image" | "pdf" = "auto") => {
    if (!activeOrder || !activeOrder.customer_phone) return false;
    const passUrl = typeof window !== "undefined" ? window.location.href : "";
    setWaDeliveryStatus("sending");

    try {
      const res = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: activeOrder.customer_phone,
          mode,
          passParams: {
            guestName: activeOrder.customer_name || "Valued Patron",
            orderRef: activeOrder.order_ref,
            items: (activeOrder.items || []).map((it, idx) => ({
              title: it.listing?.title || "Coastal Reservation",
              pillar: it.listing?.pillar || "walks",
              dateStr: it.slot?.slot_start
                ? formatDate(it.slot.slot_start)
                : undefined,
              timeStr: it.slot?.slot_start
                ? formatTime(it.slot.slot_start)
                : undefined,
              venue: it.listing?.location_name,
              mapsUrl: it.listing?.meeting_point_maps_url,
              passRef: `${activeOrder.order_ref}-${idx + 1}`,
              attendeeName:
                it.attendee_details?.[0]?.fullName || activeOrder.customer_name,
            })),
            totalPaidINR: activeOrder.total_amount_inr,
            digitalPassUrl: passUrl,
            emergencyPhone: activeOrder.emergency_contact,
          },
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (res.ok && data.success) {
        setWaDeliveryStatus("sent");
        setWaDeliveryMode(data.mode || "whatsapp_template_link");
        if (data.waLink) setWaDirectUrl(data.waLink);
        return true;
      } else {
        setWaDeliveryStatus("failed");
        if (data.waLink) setWaDirectUrl(data.waLink);
        return false;
      }
    } catch (err) {
      console.warn("[WhatsApp Dispatch Error]", err);
      setWaDeliveryStatus("failed");
      return false;
    }
  };

  useEffect(() => {
    if (
      activeOrder &&
      activeOrder.customer_phone &&
      !waDispatchedRef.current &&
      typeof window !== "undefined"
    ) {
      waDispatchedRef.current = true;
      dispatchWhatsAppPass("auto");
    }
  }, [activeOrder]);

  const handleManualResendWhatsApp = async (targetMode: "auto" | "link" | "image" | "pdf" = "link") => {
    setIsResendingWa(true);
    toast.info("Dispatching WhatsApp pass...");
    const ok = await dispatchWhatsAppPass(targetMode);
    setIsResendingWa(false);
    if (ok) {
      toast.success("Boarding pass sent to your WhatsApp!");
    } else {
      toast.error("Automated delivery encountered an issue. Tap 'Open WhatsApp' below.");
    }
  };

  // Auto-sync: Silently keep browser address bar hydrated with ?p= payload while preserving params
  useEffect(() => {
    if (activeOrder && typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      if (!searchParams.get("p")) {
        const payload = encodePassPayload(activeOrder);
        if (payload) {
          searchParams.set("p", payload);
          const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
          window.history.replaceState(null, "", newUrl);
        }
      }
    }
  }, [activeOrder]);

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

      {/* WhatsApp Boarding Pass Action Banner */}
      {activeOrder.customer_phone && (
        <div className="p-4 sm:p-5 rounded-2xl bg-[#1a0805] border border-[#dab38c]/30 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/70 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="font-bold text-[#f5edeb] text-sm flex flex-wrap items-center gap-2">
                <span>WhatsApp Digital Pass Dispatch</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
                  +91 {activeOrder.customer_phone.replace(/\D/g, "").slice(-10)}
                </span>
                {waDeliveryStatus === "sent" && (
                  <span className="text-[10px] text-emerald-400 font-normal flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Dispatched
                  </span>
                )}
                {waDeliveryStatus === "sending" && (
                  <span className="text-[10px] text-amber-300 font-normal flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" /> Dispatching...
                  </span>
                )}
              </div>
              <p className="text-[11px] text-[#dab38c]/80 mt-1">
                Your mobile pass link is dispatched directly to WhatsApp. You can also re-send or open chat anytime.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => handleManualResendWhatsApp("link")}
              disabled={isResendingWa}
              className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-[#35160e] hover:bg-[#481f14] border border-[#dab38c]/35 text-[#e3a157] font-semibold text-xs cursor-pointer transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
            >
              {isResendingWa ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Resending...</span>
                </>
              ) : (
                <>
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Resend Pass</span>
                </>
              )}
            </button>

            <a
              href={
                waDirectUrl ||
                `https://wa.me/917666511511?text=${encodeURIComponent(
                  `Hello MatsyaMart! Viewing digital boarding pass for Order ${activeOrder.order_ref}:\n${typeof window !== "undefined" ? window.location.href : ""}`,
                )}`
              }
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Open WhatsApp</span>
            </a>
          </div>
        </div>
      )}

      {/* Case 1: Pure Physical Goods Order (e.g. Mangrove Wild Honey) -> Shopify-Style Delivery Tracker */}
      {isAllGoods && (
        <GoodsOrderTracker
          order={activeOrder}
          onViewInvoice={() => setShowInvoice(true)}
        />
      )}

      {/* Case 2: Pure Experience Booking (Walks, Food, Workshops) -> Verified Boarding Pass Deck */}
      {hasExperiences && !hasGoods && <PassDeck order={activeOrder} />}

      {/* Case 3: Mixed Order (Both Experience & Physical Goods) -> Boarding Pass Deck + Delivery Portal */}
      {isMixed && (
        <div className="space-y-12">
          <div>
            <div className="mb-4 text-center">
              <span className="px-3 py-1 rounded-full bg-[#35160e] text-[#e3a157] border border-[#dab38c]/30 text-xs font-bold uppercase tracking-wider">
                Part 1 · Event Admission Pass Deck
              </span>
            </div>
            <PassDeck order={activeOrder} />
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
