import React, { useState } from "react";
import { Order, FulfillmentStatus } from "../../types";
import { formatINR, formatDate, formatTime } from "../../lib/utils";
import { resolvePassCategory } from "../../lib/passThemes";
import {
  X,
  User,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  Package,
  Truck,
  ExternalLink,
  MessageCircle,
  FileText,
  Copy,
  Check,
  ShieldAlert,
  Sparkles,
  Ticket,
  Printer,
} from "lucide-react";
import { toast } from "sonner";
import { TaxInvoice } from "../order/TaxInvoice";
import { CourierLabel } from "./CourierLabel";

interface CustomerOrderDetailModalProps {
  order: Order;
  onClose: () => void;
  onUpdateFulfillment?: (
    orderId: string,
    status: FulfillmentStatus,
    courier?: string,
    awb?: string,
  ) => void;
}

export const CustomerOrderDetailModal: React.FC<
  CustomerOrderDetailModalProps
> = ({ order, onClose, onUpdateFulfillment }) => {
  const [copiedRef, setCopiedRef] = useState(false);
  const [showInvoice, setShowInvoice] = useState(false);
  const [showCourierLabel, setShowCourierLabel] = useState(false);

  // Fulfillment edit state
  const [currentStatus, setCurrentStatus] = useState<FulfillmentStatus>(
    order.fulfillment_status || "unfulfilled",
  );
  const [courierName, setCourierName] = useState(order.courier_partner || "Coastal Express Courier");
  const [trackingAwb, setTrackingAwb] = useState(order.tracking_awb || "");
  const [isSavingStatus, setIsSavingStatus] = useState(false);

  const hasPhysicalGoods = order.items.some((i) => i.listing?.type === "product");
  const hasExperience = order.items.some((i) => i.listing?.type === "experience");
  const firstExperience = order.items.find((i) => i.listing?.type === "experience");
  const passCategory = firstExperience ? resolvePassCategory(firstExperience.listing) : "walk";

  const handleCopyRef = () => {
    navigator.clipboard.writeText(order.order_ref);
    setCopiedRef(true);
    toast.success("Order reference copied to clipboard!");
    setTimeout(() => setCopiedRef(false), 2000);
  };

  const handleSaveFulfillment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onUpdateFulfillment) return;
    setIsSavingStatus(true);
    onUpdateFulfillment(order.id, currentStatus, courierName, trackingAwb);
    setIsSavingStatus(false);
    toast.success(`Updated fulfillment milestone to ${currentStatus.toUpperCase()}`);
  };

  const cleanPhone = order.customer_phone.replace(/[^0-9]/g, "");
  const waUrl = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
        `Namaste ${order.customer_name}! Regarding your MatsyaMart order (${order.order_ref}): `,
      )}`
    : `https://wa.me/?text=${encodeURIComponent(
        `Namaste ${order.customer_name}! Regarding your MatsyaMart order (${order.order_ref}): `,
      )}`;

  const trackingOrPassUrl = `/order/confirmation/${order.order_ref}`;

  return (
    <>
      {showInvoice && (
        <TaxInvoice order={order} onClose={() => setShowInvoice(false)} />
      )}

      {showCourierLabel && (
        <CourierLabel
          order={order}
          onClose={() => setShowCourierLabel(false)}
        />
      )}

      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-fade-in text-[#f5edeb]">
        <div className="bg-[#29100b] border border-[#dab38c]/30 rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="p-5 sm:p-6 bg-[#1f0b07] border-b border-[#dab38c]/20 flex items-center justify-between shrink-0">
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="font-mono font-bold text-lg text-[#e3a157]">
                  {order.order_ref}
                </span>
                <button
                  onClick={handleCopyRef}
                  className="p-1 hover:bg-[#35160e] text-[#dab38c] rounded-md transition-colors cursor-pointer"
                  title="Copy Order Reference"
                >
                  {copiedRef ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
                <span
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border ${
                    hasPhysicalGoods && hasExperience
                      ? "bg-purple-900/40 text-purple-300 border-purple-500/40"
                      : hasPhysicalGoods
                        ? "bg-emerald-900/40 text-emerald-300 border-emerald-500/40"
                        : passCategory === "food"
                          ? "bg-blue-900/40 text-blue-300 border-blue-500/40"
                          : passCategory === "walk"
                            ? "bg-teal-900/40 text-teal-300 border-teal-500/40"
                            : "bg-amber-900/40 text-amber-300 border-amber-500/40"
                  }`}
                >
                  {hasPhysicalGoods && hasExperience
                    ? "Mixed Order"
                    : hasPhysicalGoods
                      ? "Physical Goods"
                      : passCategory === "food"
                        ? "Coastal Food Feast"
                        : passCategory === "walk"
                          ? "Heritage Walk"
                          : "Craft Workshop"}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase bg-emerald-900/40 text-emerald-300 border border-emerald-500/30">
                  {order.status || "Confirmed"}
                </span>
              </div>
              <p className="text-xs text-[#dab38c]/70 mt-1">
                Placed on {formatDate(order.created_at)} at{" "}
                {formatTime(order.created_at)}
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-2 hover:bg-[#35160e] rounded-full text-[#dab38c] hover:text-[#f5edeb] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Modal Content */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-xs">
            {/* Customer Contact & Emergency Profile */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#1f0b07] border border-[#dab38c]/20 rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center justify-between border-b border-[#dab38c]/15 pb-2">
                  <h4 className="font-bold text-[#e3a157] uppercase text-[11px] flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#e3a157]" />
                    <span>Customer Details</span>
                  </h4>
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-[10px] rounded-lg shadow-xs transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <MessageCircle className="w-3 h-3" />
                    <span>WhatsApp</span>
                  </a>
                </div>

                <div className="space-y-1">
                  <div className="font-bold text-sm text-[#f5edeb]">
                    {order.customer_name}
                  </div>
                  <div className="flex items-center gap-2 text-[#dab38c]">
                    <Phone className="w-3.5 h-3.5 text-[#e3a157]" />
                    <span className="font-mono">{order.customer_phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#dab38c]">
                    <Mail className="w-3.5 h-3.5 text-[#e3a157]" />
                    <span>{order.customer_email}</span>
                  </div>
                  {order.emergency_contact && (
                    <div className="flex items-center gap-2 text-rose-300 text-[11px] pt-1">
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                      <span><strong>Emergency:</strong> {order.emergency_contact}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Destination: Delivery Address or Experience Meeting Point */}
              <div className="bg-[#1f0b07] border border-[#dab38c]/20 rounded-2xl p-4 space-y-2.5">
                <div className="flex items-center justify-between border-b border-[#dab38c]/15 pb-2">
                  <h4 className="font-bold text-[#e3a157] uppercase text-[11px] flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#e3a157]" />
                    <span>
                      {hasPhysicalGoods ? "Shipping Destination" : "Experience Venue"}
                    </span>
                  </h4>
                  {firstExperience?.listing?.meeting_point_maps_url && (
                    <a
                      href={firstExperience.listing.meeting_point_maps_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-2.5 py-1 bg-[#35160e] hover:bg-[#481f14] text-[#e3a157] font-bold text-[10px] rounded-lg border border-[#dab38c]/30 transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <ExternalLink className="w-3 h-3" />
                      <span>Google Maps</span>
                    </a>
                  )}
                </div>

                {hasPhysicalGoods && order.shipping_address ? (
                  <div className="space-y-1 text-[#dab38c]">
                    <div className="font-medium text-[#f5edeb]">
                      {order.shipping_address.addressLine}
                    </div>
                    {order.shipping_address.landmark && (
                      <div className="text-[11px] text-[#dab38c]/80">
                        Landmark: {order.shipping_address.landmark}
                      </div>
                    )}
                    <div>
                      {order.shipping_address.city}, {order.shipping_address.state} –{" "}
                      <strong className="font-mono text-[#f5edeb]">
                        {order.shipping_address.pincode}
                      </strong>
                    </div>
                    <div className="text-[10px] text-[#dab38c]/70 pt-1 font-mono">
                      Carrier: {order.courier_partner || "Coastal Express Courier"} · AWB:{" "}
                      {order.tracking_awb || "Pending Dispatch"}
                    </div>
                  </div>
                ) : firstExperience ? (
                  <div className="space-y-1 text-[#dab38c]">
                    <div className="font-medium text-[#f5edeb]">
                      {firstExperience.listing?.location_name || "Mumbai Coast"}
                    </div>
                    {firstExperience.listing?.secret_meeting_point && (
                      <div className="text-[11px] text-[#dab38c]/80 leading-relaxed">
                        {firstExperience.listing.secret_meeting_point}
                      </div>
                    )}
                    <div className="text-[11px] text-[#e3a157] pt-1">
                      Lead Host: {firstExperience.listing?.host_name} (
                      {firstExperience.listing?.host_phone || "+91 99204 77158"})
                    </div>
                  </div>
                ) : (
                  <div className="text-[#dab38c]/60">Standard Coastal Dispatch</div>
                )}
              </div>
            </div>

            {/* If Physical Goods: Quick Milestone & AWB Update Form */}
            {hasPhysicalGoods && onUpdateFulfillment && (
              <form
                onSubmit={handleSaveFulfillment}
                className="bg-[#1f0b07] border border-[#dab38c]/20 rounded-2xl p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-[#e3a157] uppercase text-[11px] flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-[#e3a157]" />
                    <span>Fulfillment &amp; Courier Dispatch Control</span>
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowCourierLabel(true)}
                    className="px-2.5 py-1 bg-[#35160e] hover:bg-[#481f14] text-[#e3a157] font-bold text-[10px] rounded-lg border border-[#dab38c]/30 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Printer className="w-3 h-3" />
                    <span>Print 4×6 Thermal Label</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[#dab38c] font-semibold mb-1">
                      Milestone Status
                    </label>
                    <select
                      value={currentStatus}
                      onChange={(e) => setCurrentStatus(e.target.value as FulfillmentStatus)}
                      className="w-full px-3 py-1.5 bg-[#29100b] border border-[#dab38c]/30 rounded-xl text-white outline-none focus:border-[#e3a157] cursor-pointer"
                    >
                      <option value="unfulfilled">1. Unfulfilled</option>
                      <option value="processing">2. Hand-Packed (Processing)</option>
                      <option value="shipped">3. Dispatched (Shipped)</option>
                      <option value="delivered">4. Delivered</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[#dab38c] font-semibold mb-1">
                      Courier Partner
                    </label>
                    <input
                      type="text"
                      value={courierName}
                      onChange={(e) => setCourierName(e.target.value)}
                      placeholder="e.g. Coastal Express Courier"
                      className="w-full px-3 py-1.5 bg-[#29100b] border border-[#dab38c]/30 rounded-xl text-white outline-none focus:border-[#e3a157]"
                    />
                  </div>

                  <div>
                    <label className="block text-[#dab38c] font-semibold mb-1">
                      AWB / Tracking No.
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={trackingAwb}
                        onChange={(e) => setTrackingAwb(e.target.value)}
                        placeholder="e.g. CE-89410293"
                        className="w-full px-3 py-1.5 bg-[#29100b] border border-[#dab38c]/30 rounded-xl text-white outline-none focus:border-[#e3a157]"
                      />
                      <button
                        type="submit"
                        disabled={isSavingStatus}
                        className="px-3 py-1.5 bg-[#e3a157] hover:bg-[#dab38c] text-[#29100b] font-bold rounded-xl transition-all cursor-pointer shrink-0"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            )}

            {/* Line Items Breakdown */}
            <div className="bg-[#1f0b07] border border-[#dab38c]/20 rounded-2xl p-4 space-y-3">
              <h4 className="font-bold text-[#e3a157] uppercase text-[11px] flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-[#e3a157]" />
                <span>Ordered Items &amp; Bookings ({order.items.length})</span>
              </h4>

              <div className="divide-y divide-[#dab38c]/10">
                {order.items.map((item, idx) => (
                  <div
                    key={idx}
                    className="py-3 first:pt-0 last:pb-0 flex items-start justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="font-bold text-sm text-[#f5edeb]">
                        {item.quantity}× {item.listing?.title || "MatsyaMart Item"}
                      </div>
                      <div className="text-[11px] text-[#dab38c]/80">
                        {item.listing?.type === "product" ? (
                          <span>
                            Weight: {item.listing.weight_grams || 500}g · Collective:{" "}
                            {item.listing.artisan_collective}
                          </span>
                        ) : (
                          <span>
                            Slot:{" "}
                            {item.slot
                              ? `${formatDate(item.slot.slot_start)} (${formatTime(item.slot.slot_start)})`
                              : "Confirmed Schedule"}{" "}
                            · {item.quantity} Spot{item.quantity > 1 ? "s" : ""}
                          </span>
                        )}
                      </div>

                      {/* Attendee Seat Names if Experience */}
                      {item.attendee_details && item.attendee_details.length > 0 && (
                        <div className="pt-1.5 space-y-1">
                          <span className="text-[10px] font-bold text-[#e3a157] uppercase tracking-wider block">
                            Assigned Guest Seats:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {item.attendee_details.map((att, aIdx) => (
                              <span
                                key={aIdx}
                                className="px-2 py-0.5 rounded-md bg-[#29100b] border border-[#dab38c]/30 text-[10px] text-[#f5edeb]"
                              >
                                Seat #{aIdx + 1}: {att.fullName}{" "}
                                {att.phone && `(${att.phone})`}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="text-right font-mono font-bold text-[#e3a157] text-sm shrink-0">
                      {formatINR(item.unit_price_inr * item.quantity)}
                      <div className="text-[10px] text-[#dab38c]/60 font-sans font-normal">
                        ({formatINR(item.unit_price_inr)} each)
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary & Discounts Audit */}
            <div className="bg-[#1f0b07] border border-[#dab38c]/20 rounded-2xl p-4 space-y-2">
              <h4 className="font-bold text-[#e3a157] uppercase text-[11px]">
                Payment &amp; Financial Audit
              </h4>

              <div className="space-y-1.5 text-xs text-[#dab38c]">
                <div className="flex justify-between">
                  <span>Gross Subtotal</span>
                  <span className="font-mono text-[#f5edeb]">
                    {formatINR(
                      order.items.reduce(
                        (sum, it) => sum + it.unit_price_inr * it.quantity,
                        0,
                      ),
                    )}
                  </span>
                </div>

                {order.coupon_code && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Coupon Discount ({order.coupon_code})</span>
                    <span className="font-mono">
                      -{formatINR(order.discount_amount_inr || 0)}
                    </span>
                  </div>
                )}

                {order.loyalty_points_redeemed && order.loyalty_points_redeemed > 0 && (
                  <div className="flex justify-between text-[#e3a157]">
                    <span>
                      MatsyaPoints Redeemed ({order.loyalty_points_redeemed} pts)
                    </span>
                    <span className="font-mono">
                      -{formatINR(order.loyalty_discount_inr || 0)}
                    </span>
                  </div>
                )}

                <div className="flex justify-between font-bold text-base text-[#f5edeb] border-t border-[#dab38c]/20 pt-2 mt-1">
                  <span>Net Amount Paid</span>
                  <span className="font-mono text-[#e3a157]">
                    {formatINR(order.total_amount_inr)}
                  </span>
                </div>

                <div className="flex justify-between text-[10px] text-[#dab38c]/60 pt-1 font-mono">
                  <span>Payment Gateway: Razorpay Online</span>
                  <span>Txn Ref: {order.razorpay_payment_id || "PAY_CONFIRMED"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Action Bar */}
          <div className="p-4 sm:p-5 bg-[#1f0b07] border-t border-[#dab38c]/20 flex items-center justify-between flex-wrap gap-2.5 shrink-0">
            <div className="flex items-center gap-2">
              <a
                href={trackingOrPassUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 bg-[#35160e] hover:bg-[#481f14] text-[#e3a157] font-bold rounded-xl border border-[#dab38c]/30 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {hasExperience ? (
                  <>
                    <Ticket className="w-3.5 h-3.5" />
                    <span>View 9:16 Digital Pass</span>
                  </>
                ) : (
                  <>
                    <Truck className="w-3.5 h-3.5" />
                    <span>View Delivery Portal</span>
                  </>
                )}
                <ExternalLink className="w-3 h-3 text-[#dab38c]/70" />
              </a>

              <button
                type="button"
                onClick={() => setShowInvoice(true)}
                className="px-3 py-2 bg-[#35160e] hover:bg-[#481f14] text-[#dab38c] hover:text-[#f5edeb] font-bold rounded-xl border border-[#dab38c]/30 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Tax Invoice</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="px-5 py-2 bg-[#e3a157] hover:bg-[#dab38c] text-[#29100b] font-bold rounded-xl transition-all cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
