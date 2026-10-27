import React, { useState, useMemo, useEffect } from "react";
import { Order, Listing } from "../../types";
import { formatINR, formatDate, formatTime } from "../../lib/utils";
import {
  FAST2SMS_SENDER_DISPLAY,
  FAST2SMS_SENDER_PHONE_ID,
  FAST2SMS_PAYMENT_TEMPLATE_ID,
  buildMultiPassWhatsAppMessage,
  buildAbandonedCartWhatsAppMessage,
  sendFast2SMSWhatsApp,
  normalizeWhatsAppNumber,
} from "../../lib/fast2smsWhatsApp";
import {
  AbandonedCartRecord,
  getSavedAbandonedCarts,
  updateAbandonedCartStatus,
  buildCartRestoreUrl,
} from "../../lib/abandonedCart";
import { openWhatsApp } from "../../lib/whatsapp";
import {
  MessageSquare,
  ShoppingCart,
  Send,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  ExternalLink,
  Copy,
  Check,
  RefreshCw,
  Search,
  Filter,
  Ticket,
  ChevronRight,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

interface WhatsAppHubProps {
  orders: Order[];
  listings: Listing[];
}

export const WhatsAppHub: React.FC<WhatsAppHubProps> = ({ orders, listings }) => {
  const [activeTab, setActiveTab] = useState<"abandoned" | "dispatches" | "compose">("abandoned");
  const [abandonedCarts, setAbandonedCarts] = useState<AbandonedCartRecord[]>([]);
  const [cartFilter, setCartFilter] = useState<"all" | "abandoned" | "contacted" | "recovered">("all");
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Direct Composer State
  const [composerPhone, setComposerPhone] = useState("");
  const [composerText, setComposerText] = useState("");
  const [isSendingDirect, setIsSendingDirect] = useState(false);

  // Load saved abandoned carts
  const reloadCarts = () => {
    setAbandonedCarts(getSavedAbandonedCarts());
  };

  useEffect(() => {
    reloadCarts();
  }, []);

  const filteredCarts = useMemo(() => {
    return abandonedCarts.filter((c) => {
      if (cartFilter === "all") return true;
      return c.status === cartFilter;
    });
  }, [abandonedCarts, cartFilter]);

  const handleCopyRestoreLink = (cart: AbandonedCartRecord) => {
    const url = buildCartRestoreUrl(cart);
    navigator.clipboard.writeText(url);
    setCopiedId(cart.id);
    toast.success("1-Click cart restore link copied to clipboard!");
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleRecoverViaWhatsApp = (cart: AbandonedCartRecord) => {
    if (!cart.customerPhone) {
      toast.error("No phone number captured for this customer.");
      return;
    }
    const restoreUrl = buildCartRestoreUrl(cart);
    const summary = cart.items.map((i) => `${i.title} (${i.quantity}x)`).join(", ");
    const text = buildAbandonedCartWhatsAppMessage({
      customerName: cart.customerName,
      itemsSummary: summary,
      totalINR: cart.totalINR,
      restoreUrl,
      discountPercentage: cart.memberDiscountApplied ? 15 : undefined,
    });

    updateAbandonedCartStatus(cart.id, "contacted", "whatsapp");
    reloadCarts();
    openWhatsApp(cart.customerPhone, text);
    toast.success("Opened WhatsApp with pre-filled recovery link!");
  };

  const handleAutoDispatchWhatsApp = async (cart: AbandonedCartRecord) => {
    const cleanPhone = (cart.customerPhone || "").replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      toast.error("Valid 10-digit mobile number required for WhatsApp.");
      return;
    }
    const restoreUrl = buildCartRestoreUrl(cart);
    const summary = cart.items.map((i) => `${i.title} (${i.quantity}x)`).join(", ");
    const text = buildAbandonedCartWhatsAppMessage({
      customerName: cart.customerName,
      itemsSummary: summary,
      totalINR: cart.totalINR,
      restoreUrl,
      discountPercentage: cart.memberDiscountApplied ? 15 : undefined,
    });

    toast.info("Dispatching recovery link via Fast2SMS WhatsApp API...");

    try {
      const res = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: cleanPhone,
          customText: text,
        }),
      });
      const data = await res.json();
      if (data.success) {
        updateAbandonedCartStatus(cart.id, "contacted", "whatsapp");
        reloadCarts();
        toast.success(`WhatsApp recovery link sent to +91 ${cleanPhone.slice(-10)}`);
        if (data.mode === "direct_wa_link" && data.waLink) {
          window.open(data.waLink, "_blank");
        }
      } else {
        toast.error(data.error || "Failed to dispatch WhatsApp message.");
      }
    } catch {
      toast.error("Network error dispatching WhatsApp recovery message.");
    }
  };

  const handleResendOrderPasses = (order: Order) => {
    if (!order.customer_phone) {
      toast.error("No phone number recorded on this order.");
      return;
    }
    const origin = typeof window !== "undefined" ? window.location.origin : "https://matsyamart.com";
    const passUrl = `${origin}/order/confirmation/${order.order_ref}`;

    const text = buildMultiPassWhatsAppMessage({
      guestName: order.customer_name || "Valued Patron",
      orderRef: order.order_ref,
      items: order.items.map((it, idx) => ({
        title: it.listing?.title || "Coastal Experience",
        pillar: it.listing?.pillar || "walks",
        dateStr: it.slot?.slot_start
          ? formatDate(it.slot.slot_start)
          : undefined,
        timeStr: it.slot?.slot_start
          ? formatTime(it.slot.slot_start)
          : undefined,
        venue: it.listing?.location_name,
        mapsUrl: it.listing?.meeting_point_maps_url,
        passRef: `${order.order_ref}-${idx + 1}`,
        attendeeName: it.attendee_details?.[0]?.fullName || order.customer_name,
      })),
      totalPaidINR: order.total_amount_inr,
      digitalPassUrl: passUrl,
      emergencyPhone: order.emergency_contact,
    });

    openWhatsApp(order.customer_phone, text);
    toast.success(`Dispatched passes to ${order.customer_phone} via WhatsApp`);
  };

  const handleSendDirectWhatsApp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = composerPhone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      toast.error("Please enter a valid 10-digit Indian phone number.");
      return;
    }
    if (!composerText.trim()) {
      toast.error("Please enter a message text.");
      return;
    }

    setIsSendingDirect(true);
    try {
      const res = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: cleanPhone,
          customText: composerText.trim(),
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`WhatsApp message sent to +91 ${cleanPhone}`);
        if (data.mode === "direct_wa_link" && data.waLink) {
          window.open(data.waLink, "_blank");
        }
        setComposerText("");
      } else {
        toast.error(data.error || "Failed to dispatch message.");
      }
    } catch (err) {
      toast.error("Network error sending WhatsApp message.");
    } finally {
      setIsSendingDirect(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner: Fast2SMS WhatsApp Gateway Live Status */}
      <div className="p-5 sm:p-6 rounded-3xl bg-[#35160e]/90 border border-[#dab38c]/30 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-[#1f0b07] border border-emerald-500/40 flex items-center justify-center text-emerald-400">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-bold text-lg text-[#f5edeb]">
                Fast2SMS WhatsApp Command Center
              </h2>
              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-950/80 border border-emerald-500/40 text-[10px] font-bold text-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Gateway
              </span>
            </div>
            <p className="text-xs text-[#dab38c]">
              Official Sender: <span className="font-mono font-bold text-[#e3a157]">{FAST2SMS_SENDER_DISPLAY}</span> · Template ID: <span className="font-mono text-[#dab38c]/80">{FAST2SMS_PAYMENT_TEMPLATE_ID} (payment_completed)</span>
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-1.5 p-1 bg-[#1f0b07] rounded-xl border border-[#dab38c]/20 self-stretch sm:self-auto">
          <button
            onClick={() => setActiveTab("abandoned")}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "abandoned"
                ? "bg-[#e3a157] text-[#29100b] shadow-xs"
                : "text-[#dab38c] hover:text-[#f5edeb]"
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Abandoned Carts ({abandonedCarts.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("dispatches")}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "dispatches"
                ? "bg-[#e3a157] text-[#29100b] shadow-xs"
                : "text-[#dab38c] hover:text-[#f5edeb]"
            }`}
          >
            <Ticket className="w-3.5 h-3.5" />
            <span>Order Passes ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("compose")}
            className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === "compose"
                ? "bg-[#e3a157] text-[#29100b] shadow-xs"
                : "text-[#dab38c] hover:text-[#f5edeb]"
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Direct Composer</span>
          </button>
        </div>
      </div>

      {/* TAB 1: ABANDONED CARTS COMMAND CENTER */}
      {activeTab === "abandoned" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#dab38c] uppercase">Filter:</span>
              {(["all", "abandoned", "contacted", "recovered"] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setCartFilter(filter)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                    cartFilter === filter
                      ? "bg-[#e3a157] text-[#29100b]"
                      : "bg-[#35160e] text-[#dab38c] hover:text-[#f5edeb]"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            <button
              onClick={reloadCarts}
              className="inline-flex items-center gap-1 px-3 py-1 bg-[#1f0b07] hover:bg-[#35160e] border border-[#dab38c]/25 rounded-xl text-xs text-[#dab38c] transition-colors cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh Records</span>
            </button>
          </div>

          {filteredCarts.length === 0 ? (
            <div className="p-8 text-center rounded-3xl bg-[#35160e]/50 border border-[#dab38c]/20 space-y-2">
              <ShoppingCart className="w-8 h-8 text-[#dab38c]/50 mx-auto" />
              <h4 className="font-display font-bold text-base text-[#f5edeb]">
                No Abandoned Carts in this View
              </h4>
              <p className="text-xs text-[#dab38c]">
                Carts are automatically logged whenever a customer inputs their mobile number in checkout and does not complete payment.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3.5">
              {filteredCarts.map((cart) => (
                <div
                  key={cart.id}
                  className="p-5 rounded-2xl bg-[#35160e]/80 border border-[#dab38c]/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-md hover:border-[#e3a157]/40 transition-all"
                >
                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm text-[#f5edeb]">
                        {cart.customerName || "Anonymous Coastal Patron"}
                      </span>
                      {cart.customerPhone && (
                        <span className="font-mono text-xs text-[#e3a157] font-semibold">
                          +91 {cart.customerPhone.replace(/\D/g, "")}
                        </span>
                      )}
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          cart.status === "recovered"
                            ? "bg-emerald-950 text-emerald-300 border border-emerald-500/30"
                            : cart.status === "contacted"
                              ? "bg-amber-950 text-amber-300 border border-amber-500/30"
                              : "bg-rose-950 text-rose-300 border border-rose-500/30"
                        }`}
                      >
                        {cart.status}
                      </span>
                      {cart.memberDiscountApplied && (
                        <span className="px-2 py-0.5 rounded-full bg-[#1f0b07] text-[#e3a157] border border-[#e3a157]/30 text-[10px] font-bold">
                          Bhoomiputra Member
                        </span>
                      )}
                    </div>

                    <div className="text-xs text-[#dab38c] space-y-0.5">
                      <div>
                        Items:{" "}
                        <span className="text-[#f5edeb] font-medium">
                          {cart.items.map((i) => `${i.title} (${i.quantity}x)`).join(", ")}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#dab38c]/70 flex items-center gap-3">
                        <span>Cart Total: <b className="text-[#e3a157]">{formatINR(cart.totalINR)}</b></span>
                        <span>•</span>
                        <span>Captured: {new Date(cart.createdAt).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}</span>
                        {cart.recoveryChannel && (
                          <>
                            <span>•</span>
                            <span>Contacted via {cart.recoveryChannel.toUpperCase()}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 1-Click Recovery Actions */}
                  <div className="flex items-center gap-2 self-stretch sm:self-auto flex-wrap">
                    <button
                      onClick={() => handleRecoverViaWhatsApp(cart)}
                      className="flex-1 sm:flex-initial px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-colors"
                      title="Open WhatsApp with pre-filled restore link"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Recover WhatsApp</span>
                    </button>

                    <button
                      onClick={() => handleAutoDispatchWhatsApp(cart)}
                      className="flex-1 sm:flex-initial px-3 py-2 rounded-xl bg-[#1f0b07] hover:bg-[#29100b] border border-[#dab38c]/30 text-[#dab38c] text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                      title="Auto-dispatch recovery message via Fast2SMS WhatsApp API"
                    >
                      <Send className="w-3.5 h-3.5 text-[#e3a157]" />
                      <span>Auto WhatsApp</span>
                    </button>

                    <button
                      onClick={() => handleCopyRestoreLink(cart)}
                      className="p-2 rounded-xl bg-[#1f0b07] hover:bg-[#29100b] border border-[#dab38c]/30 text-[#dab38c] hover:text-[#f5edeb] cursor-pointer transition-colors"
                      title="Copy Shareable 1-Click Cart Restore URL"
                    >
                      {copiedId === cart.id ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>

                    {cart.status !== "recovered" && (
                      <button
                        onClick={() => {
                          updateAbandonedCartStatus(cart.id, "recovered");
                          reloadCarts();
                          toast.success("Cart marked as recovered!");
                        }}
                        className="p-2 rounded-xl text-[11px] text-[#dab38c]/60 hover:text-emerald-400 cursor-pointer"
                        title="Mark as Recovered"
                      >
                        ✓
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: RECENT ORDER PASS DISPATCHES */}
      {activeTab === "dispatches" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-3.5">
            {orders.slice(0, 30).map((order) => (
              <div
                key={order.id}
                className="p-5 rounded-2xl bg-[#35160e]/80 border border-[#dab38c]/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-md"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-[#e3a157]">
                      {order.order_ref}
                    </span>
                    <span className="font-semibold text-xs text-[#f5edeb]">
                      {order.customer_name}
                    </span>
                    {order.customer_phone && (
                      <span className="font-mono text-xs text-[#dab38c]">
                        (+91 {order.customer_phone.replace(/\D/g, "")})
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#dab38c]">
                    {order.items.map((i) => i.listing?.title).filter(Boolean).join(" · ")}
                  </p>
                  <p className="text-[11px] text-[#dab38c]/60">
                    Total: {formatINR(order.total_amount_inr)} · Booked {formatDate(order.created_at)}
                  </p>
                </div>

                <div className="flex items-center gap-2 self-stretch sm:self-auto">
                  <button
                    onClick={() => handleResendOrderPasses(order)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md cursor-pointer transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Re-Send WhatsApp Passes</span>
                  </button>

                  <a
                    href={`/order/confirmation/${order.order_ref}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-[#1f0b07] hover:bg-[#29100b] border border-[#dab38c]/30 text-[#dab38c] hover:text-[#f5edeb] cursor-pointer"
                    title="View Customer Digital Pass Page"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: DIRECT WHATSAPP COMPOSER */}
      {activeTab === "compose" && (
        <div className="max-w-xl mx-auto p-6 rounded-3xl bg-[#35160e]/90 border border-[#dab38c]/30 shadow-2xl space-y-5">
          <div className="space-y-1">
            <h3 className="font-display font-bold text-base text-[#f5edeb]">
              Send Direct WhatsApp Dispatch
            </h3>
            <p className="text-xs text-[#dab38c]">
              Dispatches directly through the official +91 76665 11511 Fast2SMS gateway.
            </p>
          </div>

          <form onSubmit={handleSendDirectWhatsApp} className="space-y-4 text-xs">
            <div>
              <label className="block text-[11px] font-bold text-[#dab38c] uppercase mb-1">
                Recipient Indian Mobile Number
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-[#dab38c]/60">
                  +91
                </span>
                <input
                  type="tel"
                  maxLength={10}
                  required
                  placeholder="9820144512"
                  value={composerPhone}
                  onChange={(e) => setComposerPhone(e.target.value.replace(/\D/g, ""))}
                  className="w-full pl-12 pr-4 py-2.5 rounded-xl bg-[#1f0b07] text-[#f5edeb] border border-[#dab38c]/30 focus:border-[#e3a157] outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-[#dab38c] uppercase mb-1">
                Message Content
              </label>
              <textarea
                rows={5}
                required
                placeholder="Namaste, your MatsyaMart coastal trail update..."
                value={composerText}
                onChange={(e) => setComposerText(e.target.value)}
                className="w-full p-3 rounded-xl bg-[#1f0b07] text-[#f5edeb] border border-[#dab38c]/30 focus:border-[#e3a157] outline-none resize-none leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={isSendingDirect || composerPhone.replace(/\D/g, "").length < 10 || !composerText.trim()}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{isSendingDirect ? "Dispatching..." : "Send via Fast2SMS WhatsApp"}</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
