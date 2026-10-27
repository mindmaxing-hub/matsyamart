import React, { useState } from "react";
import { Order } from "../../types";
import { formatINR, formatDate } from "../../lib/utils";
import { Link } from "../ui/Link";
import { TaxInvoice } from "./TaxInvoice";
import {
  Package,
  Truck,
  CheckCircle2,
  Clock,
  MapPin,
  MessageCircle,
  FileText,
  Copy,
  Check,
  ShieldCheck,
  ArrowLeft,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

interface GoodsOrderTrackerProps {
  order: Order;
  onViewInvoice?: () => void;
}

export const GoodsOrderTracker: React.FC<GoodsOrderTrackerProps> = ({
  order,
  onViewInvoice,
}) => {
  const [copiedRef, setCopiedRef] = useState(false);
  const [internalShowInvoice, setInternalShowInvoice] = useState(false);

  const productItems = order.items.filter(
    (item) => item.listing?.type === "product",
  );
  const displayItems = productItems.length > 0 ? productItems : order.items;

  const handleCopyRef = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(order.order_ref);
      setCopiedRef(true);
      toast.success("Order reference copied!");
      setTimeout(() => setCopiedRef(false), 2000);
    }
  };

  const handleWhatsAppAlerts = () => {
    const phone = "919920477158";
    const text = encodeURIComponent(
      `Hello MatsyaMart Logistics! I would like delivery and tracking updates for my coastal artisanal goods order: ${order.order_ref}.`,
    );
    window.open(`https://wa.me/${phone}?text=${text}`, "_blank");
  };

  const orderDateStr = formatDate(order.created_at);

  // Delivery estimation: 3-5 business days from order creation
  const orderDate = new Date(order.created_at || Date.now());
  const minDeliveryDate = new Date(orderDate);
  minDeliveryDate.setDate(orderDate.getDate() + 3);
  const maxDeliveryDate = new Date(orderDate);
  maxDeliveryDate.setDate(orderDate.getDate() + 5);

  const formatEstDate = (d: Date) =>
    d.toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      weekday: "short",
    });

  const estimatedDeliveryWindow = `${formatEstDate(minDeliveryDate)} – ${formatEstDate(maxDeliveryDate)}`;

  // Shipping address resolution
  const addr = order.shipping_address;
  const formattedAddress = addr
    ? [addr.addressLine, addr.landmark, `${addr.city}, ${addr.state} - ${addr.pincode}`]
        .filter(Boolean)
        .join(", ")
    : "Standard Express Delivery across Greater Mumbai";

  // Dynamic stepper milestone mapping based on live fulfillment_status
  const fulfillmentStatus = order.fulfillment_status || "processing";
  const courierName = order.courier_partner || "Coastal Express Courier";
  const awb = order.tracking_awb;

  const getStepStatus = (stepIndex: number): "completed" | "active" | "upcoming" => {
    switch (fulfillmentStatus) {
      case "delivered":
        return "completed";
      case "shipped":
        if (stepIndex <= 2) return "completed";
        if (stepIndex === 3) return "active";
        return "upcoming";
      case "processing":
        if (stepIndex === 0) return "completed";
        if (stepIndex === 1) return "active";
        return "upcoming";
      case "unfulfilled":
      default:
        if (stepIndex === 0) return "active";
        return "upcoming";
    }
  };

  const steps = [
    {
      id: "placed",
      title: "Order Placed",
      subtitle: `Verified on ${orderDateStr}`,
      status: getStepStatus(0),
      icon: CheckCircle2,
    },
    {
      id: "packing",
      title: "Hand-Packed by Collective",
      subtitle: "Artisans preparing fresh jars & coastal pack",
      status: getStepStatus(1),
      icon: Package,
    },
    {
      id: "dispatched",
      title: "Dispatched from Coastal Hub",
      subtitle: awb
        ? `Shipped via ${courierName} (AWB: ${awb})`
        : `Handed over to ${courierName}`,
      status: getStepStatus(2),
      icon: Truck,
    },
    {
      id: "transit",
      title: "Out for Delivery",
      subtitle: "Local courier partner delivery in progress",
      status: getStepStatus(3),
      icon: Clock,
    },
    {
      id: "delivered",
      title: "Delivered",
      subtitle:
        fulfillmentStatus === "delivered"
          ? "Package safely delivered"
          : `Estimated: ${estimatedDeliveryWindow}`,
      status: getStepStatus(4),
      icon: Sparkles,
    },
  ];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Top Banner: Order Confirmed & Support Headline */}
      <div className="bg-[#29100b] border border-[#dab38c]/25 rounded-2xl sm:rounded-3xl p-4 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-[#e3a157]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#dab38c]/15">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 text-emerald-400 text-xs font-semibold border border-emerald-500/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Order Confirmed • Hand-Packed at Source</span>
            </div>
            <h1 className="font-display font-bold text-2xl sm:text-3xl text-[#f5edeb]">
              Thank you, {order.customer_name}!
            </h1>
            <p className="text-xs sm:text-sm text-[#dab38c]">
              Your order supports indigenous coastal artisans and Koli fisher collectives.
            </p>
          </div>

          <div className="flex flex-col items-start sm:items-end gap-1.5 shrink-0">
            <span className="text-[11px] uppercase tracking-wider text-[#dab38c]/70 font-semibold">
              Order Reference
            </span>
            <button
              onClick={handleCopyRef}
              title="Click to copy order reference"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#1f0b07] border border-[#dab38c]/30 text-[#e3a157] font-mono text-xs font-bold hover:bg-[#35160e] transition-colors cursor-pointer group"
            >
              <span>{order.order_ref}</span>
              {copiedRef ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-[#dab38c] group-hover:text-[#e3a157]" />
              )}
            </button>
          </div>
        </div>

        {/* Real-Time Fulfillment Progress Stepper */}
        <div className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1.5 sm:gap-4 mb-4">
            <h2 className="text-xs font-bold uppercase tracking-wider text-[#dab38c] flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#e3a157] shrink-0" />
              <span>Fulfillment & Dispatch Tracker</span>
            </h2>
            <span className="text-[11px] text-[#e3a157] font-medium">
              Estimated: {estimatedDeliveryWindow}
            </span>
          </div>

          <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-[11px] sm:before:left-[15px] before:top-2 before:bottom-2 before:w-[2px] before:bg-[#dab38c]/20">
            {steps.map((step) => {
              const Icon = step.icon;
              const isCompleted = step.status === "completed";
              const isActive = step.status === "active";

              return (
                <div key={step.id} className="relative flex items-start gap-4">
                  {/* Step node dot */}
                  <div
                    className={`absolute -left-6 sm:-left-8 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border transition-all ${
                      isCompleted
                        ? "bg-emerald-500/20 border-emerald-400 text-emerald-400"
                        : isActive
                          ? "bg-[#e3a157]/20 border-[#e3a157] text-[#e3a157] ring-4 ring-[#e3a157]/15"
                          : "bg-[#1f0b07] border-[#dab38c]/30 text-[#dab38c]/40"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs sm:text-sm font-bold ${
                          isCompleted
                            ? "text-[#f5edeb]"
                            : isActive
                              ? "text-[#e3a157]"
                              : "text-[#dab38c]/60"
                        }`}
                      >
                        {step.title}
                      </span>
                      {isActive && (
                        <span className="px-2 py-0.5 rounded-full bg-[#e3a157]/20 text-[#e3a157] text-[10px] font-bold border border-[#e3a157]/40 uppercase tracking-wider">
                          In Progress
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] sm:text-xs text-[#dab38c]/75">
                      {step.subtitle}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grid: Delivery Destination & Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Shipping Destination Card */}
        <div className="bg-[#29100b] border border-[#dab38c]/20 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold text-[#f5edeb] uppercase tracking-wider">
            <MapPin className="w-4 h-4 text-[#e3a157]" />
            <span>Shipping Destination</span>
          </div>
          <div className="space-y-1 text-xs">
            <p className="font-bold text-[#f5edeb]">{order.customer_name}</p>
            <p className="text-[#dab38c] leading-relaxed">{formattedAddress}</p>
            <p className="text-[#dab38c]/70 pt-1 font-mono">
              Contact: {order.customer_phone}
            </p>
          </div>
          <div className="pt-2 border-t border-[#dab38c]/15 text-[11px] text-[#dab38c]/70 flex items-center justify-between">
            <span>Carrier: Coastal Express Courier</span>
            <span className="text-emerald-400 font-medium">Standard Dispatch</span>
          </div>
        </div>

        {/* WhatsApp & Instant Assistance Card */}
        <div className="bg-[#29100b] border border-[#dab38c]/20 rounded-2xl p-5 flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#f5edeb] uppercase tracking-wider">
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              <span>Direct WhatsApp Dispatch Alert</span>
            </div>
            <p className="text-xs text-[#dab38c] leading-relaxed">
              Connect directly with our coastal fulfillment coordinator to track real-time courier pickup or request custom packing instructions.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={handleWhatsAppAlerts}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Get WhatsApp Delivery Alerts</span>
            </button>
          </div>
        </div>
      </div>

      {/* Package Contents Breakdown */}
      <div className="bg-[#29100b] border border-[#dab38c]/20 rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#dab38c]/15">
          <div className="flex items-center gap-2">
            <Package className="w-4 h-4 text-[#e3a157]" />
            <h3 className="font-display font-bold text-sm text-[#f5edeb]">
              Artisanal Package Breakdown
            </h3>
          </div>
          <span className="text-xs text-[#dab38c]">
            {displayItems.length} {displayItems.length === 1 ? "Item" : "Items"}
          </span>
        </div>

        <div className="divide-y divide-[#dab38c]/10">
          {displayItems.map((item, idx) => {
            const listing = item.listing;
            const collective =
              listing?.artisan_collective || "Koli Coastal Artisanal Collective";
            const weight = listing?.weight_grams
              ? `${listing.weight_grams}g`
              : "Standard Pack";
            const itemImg =
              listing?.images?.[0] ||
              "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600";

            return (
              <div
                key={item.id || idx}
                className="py-3.5 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5">
                  <img
                    src={itemImg}
                    alt={listing?.title || "Product"}
                    className="w-14 h-14 rounded-xl object-cover border border-[#dab38c]/20 bg-[#1f0b07] shrink-0"
                  />
                  <div className="space-y-0.5">
                    <p className="font-bold text-xs sm:text-sm text-[#f5edeb]">
                      {listing?.title || "Artisanal Product"}
                    </p>
                    <p className="text-[11px] text-[#dab38c]/80 flex items-center gap-2">
                      <span>{collective}</span>
                      <span>•</span>
                      <span className="font-mono">{weight}</span>
                    </p>
                    <p className="text-[11px] text-[#dab38c]/60 font-mono">
                      Qty: {item.quantity} × {formatINR(item.unit_price_inr)}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-mono font-bold text-xs sm:text-sm text-[#e3a157]">
                    {formatINR(item.unit_price_inr * item.quantity)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pricing Summary */}
        <div className="pt-4 border-t border-[#dab38c]/15 space-y-2 text-xs">
          <div className="flex justify-between text-[#dab38c]">
            <span>Items Subtotal</span>
            <span className="font-mono">{formatINR(order.total_amount_inr)}</span>
          </div>
          <div className="flex justify-between text-[#dab38c]">
            <span>Artisan Packaging & Safety Seal</span>
            <span className="text-emerald-400 font-semibold">FREE</span>
          </div>
          <div className="flex justify-between text-[#dab38c]">
            <span>Coastal Express Shipping</span>
            <span className="text-emerald-400 font-semibold">FREE</span>
          </div>
          <div className="pt-2 border-t border-[#dab38c]/15 flex justify-between text-[#f5edeb] font-bold text-sm">
            <span>Total Paid</span>
            <span className="font-mono text-[#e3a157]">
              {formatINR(order.total_amount_inr)}
            </span>
          </div>
        </div>
      </div>

      {/* Customer Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <Link
          to="/"
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#1f0b07] hover:bg-[#35160e] text-[#dab38c] hover:text-[#f5edeb] text-xs font-semibold border border-[#dab38c]/25 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Continue Shopping Coastal Goods
        </Link>

        <button
          onClick={onViewInvoice || (() => setInternalShowInvoice(true))}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#35160e] hover:bg-[#481f14] text-[#e3a157] text-xs font-semibold border border-[#dab38c]/30 shadow-xs cursor-pointer transition-colors"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Download GST Tax Invoice</span>
        </button>
      </div>

      {/* Internal Tax Invoice Modal */}
      {internalShowInvoice && (
        <TaxInvoice
          order={order}
          onClose={() => setInternalShowInvoice(false)}
        />
      )}
    </div>
  );
};
