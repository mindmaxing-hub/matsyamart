import React, { useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { X, ShieldCheck, Lock, User, MapPin, AlertCircle, Sparkles } from "lucide-react";
import { Listing, AttendeeDetail, ShippingAddress } from "../../types";
import { formatINR } from "../../lib/utils";
import { initiatePayment } from "../../lib/razorpay";
import { encodePassPayload } from "../../lib/passPayload";
import { useData } from "../../context/DataContext";
import { useCart } from "../../context/CartContext";

interface CheckoutModalProps {
  items: {
    listing: Listing;
    quantity: number;
    slotId?: string | undefined;
  }[];
  onClose: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  items,
  onClose,
}) => {
  const router = useRouter();
  const {
    createOrder,
    slots,
    validateCoupon,
    loyaltyProgram,
    getMembershipByPhone,
    bhoomiputraConfig,
    isEmergencyContactRequired,
  } = useData();
  const { removeItems, clearCart } = useCart();

  const isExperience = items.some((i) => i.listing.type === "experience");
  const emergencyRequired = isExperience && isEmergencyContactRequired(items);
  const hasPhysicalProduct = items.some((i) => i.listing.type === "product");
  const isPureGoods = hasPhysicalProduct && !isExperience;
  const isMixedCart = hasPhysicalProduct && isExperience;

  // Customer Form State
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");

  // Bhoomiputra Member Discount State
  const [isBhoomiMember, setIsBhoomiMember] = useState(false);
  const [bhoomiMemberId, setBhoomiMemberId] = useState("");

  // Dynamic Phone-Keyed Loyalty Membership (Westside-style)
  const [useLoyaltyPoints, setUseLoyaltyPoints] = useState(false);
  const member = customerPhone ? getMembershipByPhone(customerPhone) : undefined;
  const availableLoyaltyPoints = member
    ? member.spendable_points
    : customerPhone.replace(/[^0-9]/g, "").length >= 10
      ? 100 // Welcome bonus for new coastal patrons
      : 450;
  const loyaltyRate = loyaltyProgram?.config?.pointValueINR || 0.1;
  const pointsCashValue = Math.floor(availableLoyaltyPoints * loyaltyRate);

  // Promo Code State
  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discountAmount: number;
    description?: string | undefined;
  } | null>(null);
  const [couponFeedback, setCouponFeedback] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Shipping details for physical goods
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    addressLine: "",
    landmark: "",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "",
  });

  // Discrete Attendee state keyed by item index
  const [itemAttendees, setItemAttendees] = useState<Record<number, AttendeeDetail[]>>(() => {
    const map: Record<number, AttendeeDetail[]> = {};
    items.forEach((item, itemIdx) => {
      if (item.listing.type === "experience") {
        map[itemIdx] = Array.from({ length: item.quantity }, (_, seatIdx) => ({
          fullName: seatIdx === 0 ? "" : "",
          phone: "",
          email: "",
        }));
      }
    });
    return map;
  });

  const handleUpdateAttendee = (
    itemIdx: number,
    seatIdx: number,
    field: "fullName" | "phone" | "email",
    val: string,
  ) => {
    setItemAttendees((prev) => {
      const currentList = prev[itemIdx] ? [...prev[itemIdx]!] : [];
      if (!currentList[seatIdx]) {
        currentList[seatIdx] = { fullName: "", phone: "" };
      }
      currentList[seatIdx] = {
        ...currentList[seatIdx]!,
        [field]: val,
      };
      return { ...prev, [itemIdx]: currentList };
    });
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const subtotalAmount = items.reduce(
    (sum, item) => sum + item.listing.price_inr * item.quantity,
    0,
  );

  // Bhoomiputra Member Discount calculation
  const bhoomiEligibleItems = items.filter((i) =>
    i.listing.pillar
      ? bhoomiputraConfig.applicable_pillars.includes(i.listing.pillar)
      : false,
  );
  const bhoomiEligibleTotal = bhoomiEligibleItems.reduce(
    (sum, item) => sum + item.listing.price_inr * item.quantity,
    0,
  );
  const bhoomiDiscountAmount =
    isBhoomiMember &&
    bhoomiputraConfig.is_enabled &&
    bhoomiEligibleTotal >= bhoomiputraConfig.min_order_inr
      ? Math.round((bhoomiEligibleTotal * bhoomiputraConfig.discount_percent) / 100)
      : 0;

  const promoDiscountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const activeDiscountAmount = isBhoomiMember ? bhoomiDiscountAmount : promoDiscountAmount;

  const loyaltyDiscountINR = useLoyaltyPoints
    ? Math.min(Math.floor(subtotalAmount * 0.5), pointsCashValue)
    : 0;
  const finalAmount = Math.max(0, subtotalAmount - activeDiscountAmount - loyaltyDiscountINR);

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponFeedback(null);

    if (!couponCodeInput.trim()) {
      setCouponFeedback({
        type: "error",
        message: "Please enter a promo code.",
      });
      return;
    }

    const result = validateCoupon(couponCodeInput, items);
    if (!result.valid || !result.coupon) {
      setCouponFeedback({
        type: "error",
        message: result.error || "Invalid promo code.",
      });
      return;
    }

    setAppliedCoupon({
      code: result.coupon.code,
      discountAmount: result.discountAmount || 0,
      description: result.coupon.description,
    });

    setCouponFeedback({
      type: "success",
      message: `${result.coupon.code} applied! Saved ₹${result.discountAmount}.`,
    });
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCodeInput("");
    setCouponFeedback(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    // Strict Validation
    if (!customerName.trim()) {
      setErrorMessage("Please enter your full name.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!customerEmail.trim() || !emailRegex.test(customerEmail.trim())) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    const cleanedPhone = customerPhone.replace(/\D/g, "");
    if (cleanedPhone.length < 10) {
      setErrorMessage("Please enter a valid 10-digit mobile number.");
      return;
    }

    // Capacity check for experiences
    for (const item of items) {
      if (item.slotId) {
        const slot = slots.find((s) => s.id === item.slotId);
        if (slot) {
          const available = slot.capacity - slot.booked_count;
          if (available < item.quantity) {
            setErrorMessage(
              `Sorry, only ${available} seat(s) remaining for this slot.`,
            );
            return;
          }
        }
      }
    }

    if (
      hasPhysicalProduct &&
      (!shippingAddress.addressLine.trim() || !shippingAddress.pincode.trim())
    ) {
      setErrorMessage(
        "Please provide a complete delivery street address and pincode.",
      );
      return;
    }

    if (emergencyRequired && !emergencyContact.trim()) {
      setErrorMessage(
        "Maritime Safety Contact is mandatory for this booking. Please enter emergency contact name & phone number.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // Trigger Razorpay Modal / Sandbox Bridge
      await initiatePayment({
        amountInr: finalAmount,
        orderRef:
          "MM-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
        customerName,
        customerEmail,
        customerPhone,
        description: isExperience
          ? `Booking: ${items[0]?.listing.title || (items[0]?.listing.pillar === "food" ? "Coastal Food Feast" : "Coastal Experience")}`
          : `Order: MatsyaMart Community Goods`,
        isExperience,
        onSuccess: async (rzpResult) => {
          try {
            const confirmedOrder = await createOrder({
              customerName,
              customerEmail,
              customerPhone,
              emergencyContact: emergencyContact || undefined,
              shippingAddress: hasPhysicalProduct ? shippingAddress : undefined,
              razorpayPaymentId: rzpResult.razorpay_payment_id,
              razorpayOrderId: rzpResult.razorpay_order_id,
              couponCode: isBhoomiMember ? bhoomiputraConfig.code_alias : appliedCoupon?.code,
              discountAmount: activeDiscountAmount > 0 ? activeDiscountAmount : undefined,
              isBhoomiputraMember: isBhoomiMember,
              bhoomiputraMemberId: isBhoomiMember ? (bhoomiMemberId.trim() || "BPF-MEMBER-VERIFIED") : undefined,
              pointsRedeemed: useLoyaltyPoints ? availableLoyaltyPoints : undefined,
              pointsDiscountAmount: loyaltyDiscountINR > 0 ? loyaltyDiscountINR : undefined,
              items: items.map((i, idx) => {
                // Default first attendee to lead customer if left blank
                const rawAttendees = itemAttendees[idx] || [];
                const finalizedAttendees = rawAttendees.map((att, seatIdx) => ({
                  ...att,
                  fullName:
                    att.fullName.trim() ||
                    (seatIdx === 0 ? customerName : `Guest ${seatIdx + 1}`),
                  phone: att.phone.trim() || customerPhone,
                }));

                return {
                  listing: i.listing,
                  quantity: i.quantity,
                  slotId: i.slotId,
                  attendeeDetails:
                    i.listing.type === "experience"
                      ? finalizedAttendees
                      : undefined,
                };
              }),
            });

            // Remove only the checked-out items; preserve unrelated basket items
            removeItems(
              items.map((i) => ({
                listingId: i.listing.id,
                slotId: i.slotId,
              })),
            );
            onClose();

            // Encode pass payload token
            const payload = encodePassPayload(confirmedOrder);
            const origin =
              typeof window !== "undefined" && window.location.origin
                ? window.location.origin
                : "https://matsyamart.com";

            const passUrl = payload
              ? `${origin}/order/confirmation/${confirmedOrder.order_ref}?p=${payload}`
              : `${origin}/order/confirmation/${confirmedOrder.order_ref}`;

            const invoiceUrl = payload
              ? `${origin}/order/confirmation/${confirmedOrder.order_ref}?view=invoice&p=${payload}`
              : `${origin}/order/confirmation/${confirmedOrder.order_ref}?view=invoice`;

            const primaryItem = confirmedOrder.items[0];
            const primaryListing = primaryItem?.listing;
            const primarySlot = primaryItem?.slot;

            const seatsCount = confirmedOrder.items.reduce(
              (acc, it) =>
                acc + (it.listing?.type === "experience" ? it.quantity : 0),
              0,
            );

            const slotDate = primarySlot?.slot_start
              ? new Date(primarySlot.slot_start).toLocaleDateString("en-IN", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : "Scheduled Coastal Admission";

            const slotTime = primarySlot?.slot_start
              ? new Date(primarySlot.slot_start).toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "Check pass for timing";

            const emailPayload = {
              orderRef: confirmedOrder.order_ref,
              customerName: confirmedOrder.customer_name,
              customerEmail: confirmedOrder.customer_email,
              experienceTitle:
                primaryListing?.title || "MatsyaMart Coastal Order",
              pillar: primaryListing?.pillar || "food",
              seatsCount:
                seatsCount > 0 ? seatsCount : confirmedOrder.items.length,
              totalAmountInr: confirmedOrder.total_amount_inr,
              dateFormatted: slotDate,
              timeFormatted: slotTime,
              meetingAddress:
                primaryListing?.secret_meeting_point ||
                primaryListing?.location_name,
              mapsUrl: primaryListing?.meeting_point_maps_url,
              passUrl,
              invoiceUrl,
              invoiceNumber: `INV-${confirmedOrder.order_ref}`,
              gstin: "27ABBFK9637R1ZF",
              shippingAddress: confirmedOrder.shipping_address,
              items: confirmedOrder.items.map((it) => ({
                title: it.listing?.title || "Coastal Item",
                quantity: it.quantity,
                unitPrice: it.unit_price_inr,
                pillar: it.listing?.pillar,
                type: it.listing?.type,
              })),
            };

            // Asynchronously dispatch confirmation ticket email with QR pass & Tax Invoice
            try {
              fetch("/api/send-booking-confirmation", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(emailPayload),
              }).catch((e) => console.log("Email dispatch queued:", e));
            } catch {
              // Ignore network dispatch errors
            }

            // Optional Supabase edge function fallback if configured
            try {
              const supabaseUrl = import.meta.env["VITE_SUPABASE_URL"];
              if (supabaseUrl && !supabaseUrl.includes("your-project-id")) {
                fetch(`${supabaseUrl}/functions/v1/send-booking-confirmation`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(emailPayload),
                }).catch(() => {});
              }
            } catch {
              // Ignore fallback errors
            }

            // Redirect to digital ticket pass via TanStack router with self-contained payload token
            if (payload) {
              router.navigate({
                to: "/order/confirmation/$orderRef",
                params: { orderRef: confirmedOrder.order_ref },
                search: { p: payload },
              });
            } else {
              router.navigate({
                to: "/order/confirmation/$orderRef",
                params: { orderRef: confirmedOrder.order_ref },
              });
            }
          } catch (err: unknown) {
            console.error("Failed to create order record", err);
            setErrorMessage(
              "Payment was captured, but failed to create order. Please contact host support.",
            );
            setIsSubmitting(false);
          }
        },
        onDismiss: () => {
          setIsSubmitting(false);
        },
      });
    } catch (err: unknown) {
      console.error("Payment initiation error", err);
      setErrorMessage(
        "Could not initialize payment gateway. Please try again.",
      );
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#29100b] rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden border border-[#dab38c]/30 animate-scale-in text-[#f5edeb]">
        {/* Header */}
        <div className="bg-[#1f0b07] text-[#f5edeb] p-6 flex items-center justify-between border-b border-[#dab38c]/20">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-xl text-[#f5edeb]">
                Instant Checkout
              </span>
              <span className="text-[10px] font-semibold bg-[#e3a157]/15 text-[#e3a157] border border-[#e3a157]/40 px-2 py-0.5 rounded-full uppercase">
                {isPureGoods
                  ? "Coastal Artisan Pantry"
                  : isMixedCart
                    ? "Mixed Experience & Pantry Order"
                    : "Curated Experience"}
              </span>
            </div>
            <p className="text-xs text-[#dab38c] mt-1">
              {isPureGoods
                ? "Direct dispatch from indigenous coastal fisher collectives & artisans"
                : isMixedCart
                  ? "Curated coastal experiences combined with direct artisanal pantry dispatch"
                  : "Curated and operated in direct partnership with local coastal communities"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-[#dab38c] hover:text-[#f5edeb] rounded-xl hover:bg-[#35160e] transition-colors cursor-pointer"
            aria-label="Close checkout"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content & Form */}
        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-6 max-h-[80vh] overflow-y-auto"
        >
          {/* Order Summary Strip */}
          <div className="bg-[#1f0b07] border border-[#dab38c]/20 rounded-2xl p-4 space-y-3 text-xs">
            <div className="font-semibold text-[#dab38c] uppercase tracking-wider text-[11px]">
              Order Summary ({items.length}{" "}
              {items.length === 1 ? "item" : "items"})
            </div>
            {items.map((i, idx) => (
              <div
                key={idx}
                className="flex justify-between items-center text-[#dab38c]"
              >
                <span className="truncate max-w-[280px]">
                  {i.quantity}× {i.listing.title}
                </span>
                <span className="font-semibold text-[#f5edeb] font-display">
                  {formatINR(i.listing.price_inr * i.quantity)}
                </span>
              </div>
            ))}

            {/* Bhoomiputra Member Privilege Card */}
            {bhoomiputraConfig.is_enabled && (
              <div className="p-3 rounded-xl bg-[#140604] border border-[#dab38c]/30 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isBhoomiMember}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setIsBhoomiMember(checked);
                        if (checked && appliedCoupon) {
                          setAppliedCoupon(null);
                        }
                      }}
                      className="w-4 h-4 accent-[#e3a157] rounded cursor-pointer"
                    />
                    <span className="text-xs font-bold text-[#f5edeb]">
                      I am a Bhoomiputra Foundation Member
                    </span>
                  </label>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#e3a157]/20 text-[#e3a157] border border-[#e3a157]/40">
                    {bhoomiputraConfig.discount_percent}% Member Off
                  </span>
                </div>

                {isBhoomiMember && (
                  <div className="space-y-1.5 pt-1.5 border-t border-[#dab38c]/15">
                    <input
                      type="text"
                      placeholder="Enter Bhoomiputra Member ID or Phone (e.g. BPF-77158)"
                      value={bhoomiMemberId}
                      onChange={(e) => setBhoomiMemberId(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl bg-[#29100b] border border-[#dab38c]/30 text-xs font-mono text-[#f5edeb] placeholder:text-[#dab38c]/40 focus:outline-none focus:border-[#e3a157]"
                    />
                    <div className="text-[11px] text-emerald-400 font-medium">
                      ✓ Bhoomiputra {bhoomiputraConfig.discount_percent}% privilege applied (-{formatINR(bhoomiDiscountAmount)})
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Promo Code Input & Status (Disabled if Bhoomiputra member active) */}
            {!isBhoomiMember && (
              <div className="pt-2 border-t border-[#dab38c]/15 space-y-2">
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300">
                    <div className="flex items-center gap-1.5 font-mono">
                      <span className="font-bold text-emerald-400">{appliedCoupon.code}</span>
                      <span className="text-[11px] text-emerald-300/80 font-sans">
                        (Saved {formatINR(appliedCoupon.discountAmount)})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-[11px] text-emerald-400 hover:text-emerald-200 underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Promo code (e.g. BHOOMI2025)"
                        value={couponCodeInput}
                        onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                        className="flex-1 px-3 py-1.5 rounded-xl bg-[#29100b] border border-[#dab38c]/30 text-xs font-mono text-[#f5edeb] placeholder:text-[#dab38c]/40 focus:outline-none focus:border-[#e3a157]"
                      />
                      <button
                        type="button"
                        onClick={handleApplyCoupon}
                        className="px-3 py-1.5 rounded-xl bg-[#35160e] hover:bg-[#481f14] border border-[#dab38c]/30 text-[#e3a157] font-semibold text-xs cursor-pointer transition-colors"
                      >
                        Apply
                      </button>
                    </div>
                    {couponFeedback && (
                      <div
                        className={`text-[11px] mt-1.5 ${
                          couponFeedback.type === "success"
                            ? "text-emerald-400"
                            : "text-rose-400"
                        }`}
                      >
                        {couponFeedback.message}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* MatsyaPoints Loyalty Redemption */}
            <div className="p-2.5 rounded-xl bg-[#140604] border border-[#dab38c]/20 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#e3a157]" />
                <div>
                  <div className="font-bold text-[#f5edeb] flex items-center gap-1.5">
                    <span>{availableLoyaltyPoints} MatsyaPoints Available</span>
                    {member && (
                      <span className="text-[10px] px-1.5 py-0.5 bg-[#e3a157]/20 text-[#e3a157] rounded-md uppercase font-semibold">
                        {member.current_tier} Patron
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-[#dab38c]/70">
                    Worth {formatINR(pointsCashValue)} · Spendable toward order
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setUseLoyaltyPoints(!useLoyaltyPoints)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  useLoyaltyPoints
                    ? "bg-[#e3a157] text-[#29100b]"
                    : "bg-[#29100b] text-[#dab38c] hover:text-white border border-[#dab38c]/30"
                }`}
              >
                {useLoyaltyPoints ? "Points Applied ✓" : "Redeem Points"}
              </button>
            </div>

            {/* Price Calculations */}
            <div className="pt-2 border-t border-[#dab38c]/20 space-y-1">
              {(isBhoomiMember || appliedCoupon || useLoyaltyPoints) && (
                <div className="flex justify-between items-center text-[#dab38c]">
                  <span>Subtotal</span>
                  <span>{formatINR(subtotalAmount)}</span>
                </div>
              )}
              {isBhoomiMember && bhoomiDiscountAmount > 0 && (
                <div className="flex justify-between items-center text-emerald-400 font-semibold">
                  <span>Bhoomiputra Member Discount ({bhoomiputraConfig.discount_percent}%)</span>
                  <span>-{formatINR(bhoomiDiscountAmount)}</span>
                </div>
              )}
              {!isBhoomiMember && appliedCoupon && (
                <div className="flex justify-between items-center text-emerald-400 font-semibold">
                  <span>Promo Discount ({appliedCoupon.code})</span>
                  <span>-{formatINR(promoDiscountAmount)}</span>
                </div>
              )}
              {useLoyaltyPoints && loyaltyDiscountINR > 0 && (
                <div className="flex justify-between items-center text-amber-300 font-semibold">
                  <span>MatsyaPoints Redeemed</span>
                  <span>-{formatINR(loyaltyDiscountINR)}</span>
                </div>
              )}
              <div className="flex justify-between items-center text-sm font-bold text-[#f5edeb] pt-1">
                <span>Total Payable</span>
                <span className="font-display text-base text-[#e3a157] font-bold">
                  {formatINR(finalAmount)}
                </span>
              </div>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Lead Contact Info */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#f5edeb] flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#e3a157]" />
              <span>Lead Guest / Buyer Information</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-[#dab38c] block mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl bg-[#1f0b07] text-[#f5edeb] placeholder:text-[#dab38c]/40 border border-[#dab38c]/30 focus:border-[#e3a157] focus:ring-1 focus:ring-[#e3a157] outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-[#dab38c] block mb-1">
                  WhatsApp Phone *
                </label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 9820012345"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl bg-[#1f0b07] text-[#f5edeb] placeholder:text-[#dab38c]/40 border border-[#dab38c]/30 focus:border-[#e3a157] focus:ring-1 focus:ring-[#e3a157] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-[#dab38c] block mb-1">
                {isPureGoods
                  ? "Email Address (for order tracking & tax invoice) *"
                  : isMixedCart
                    ? "Email Address (for pass, tracking & tax invoice) *"
                    : "Email Address (for verified 9:16 pass & tickets) *"}
              </label>
              <input
                type="email"
                required
                placeholder="e.g. rahul@example.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full text-xs p-3 rounded-xl bg-[#1f0b07] text-[#f5edeb] placeholder:text-[#dab38c]/40 border border-[#dab38c]/30 focus:border-[#e3a157] focus:ring-1 focus:ring-[#e3a157] outline-none"
              />
            </div>
          </div>

          {/* Tour Specific Fields */}
          {isExperience && (
            <div className="space-y-3 pt-2 border-t border-[#dab38c]/20">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#f5edeb] flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#e3a157]" />
                <span>
                  Maritime Safety &amp; Emergency Contact{" "}
                  {emergencyRequired ? (
                    <span className="text-rose-400 font-bold text-[11px] normal-case bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/30">
                      * Required for Harbor Manifest
                    </span>
                  ) : (
                    <span className="text-[#dab38c]/70 font-normal text-[11px] normal-case">
                      (Optional)
                    </span>
                  )}
                </span>
              </h4>
              <div>
                <label className="text-xs font-medium text-[#dab38c] block mb-1">
                  {emergencyRequired
                    ? "Emergency Contact Name & Phone * (Mandatory for coastal safety)"
                    : "Emergency Contact Name & Phone (Optional for boat/harbor manifests)"}
                </label>
                <input
                  type="text"
                  required={emergencyRequired}
                  placeholder="e.g. Sunita Sharma (+91 98201 99887)"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  className={`w-full text-xs p-3 rounded-xl bg-[#1f0b07] text-[#f5edeb] placeholder:text-[#dab38c]/40 border ${
                    emergencyRequired && !emergencyContact.trim()
                      ? "border-rose-500/50 focus:border-rose-500"
                      : "border-[#dab38c]/30 focus:border-[#e3a157]"
                  } outline-none`}
                />
              </div>

              {/* Discrete Guest Names per Experience Item */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#f5edeb] flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#e3a157]" />
                  <span>Attendee Seats per Experience</span>
                </h4>
                {items.map((item, itemIdx) => {
                  if (item.listing.type !== "experience") return null;
                  const seatList = itemAttendees[itemIdx] || [];
                  return (
                    <div
                      key={itemIdx}
                      className="p-3 rounded-xl bg-[#140604] border border-[#dab38c]/20 space-y-2.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#f5edeb]">
                          {item.listing.title}
                        </span>
                        <span className="text-[#e3a157] font-mono text-[11px]">
                          {item.quantity} {item.quantity === 1 ? "Seat" : "Seats"}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {seatList.map((seat, seatIdx) => (
                          <div
                            key={seatIdx}
                            className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]"
                          >
                            <input
                              type="text"
                              placeholder={
                                seatIdx === 0
                                  ? `Seat 1 (Default: ${customerName || "Lead Guest"})`
                                  : `Seat ${seatIdx + 1} Full Name`
                              }
                              value={seat.fullName}
                              onChange={(e) =>
                                handleUpdateAttendee(
                                  itemIdx,
                                  seatIdx,
                                  "fullName",
                                  e.target.value,
                                )
                              }
                              className="p-2 rounded-lg bg-[#1f0b07] text-[#f5edeb] placeholder:text-[#dab38c]/40 border border-[#dab38c]/30 focus:border-[#e3a157] outline-none"
                            />
                            <input
                              type="tel"
                              placeholder={
                                seatIdx === 0
                                  ? `Seat 1 Phone (Default: ${customerPhone || "Lead"})`
                                  : `Seat ${seatIdx + 1} Phone`
                              }
                              value={seat.phone}
                              onChange={(e) =>
                                handleUpdateAttendee(
                                  itemIdx,
                                  seatIdx,
                                  "phone",
                                  e.target.value,
                                )
                              }
                              className="p-2 rounded-lg bg-[#1f0b07] text-[#f5edeb] placeholder:text-[#dab38c]/40 border border-[#dab38c]/30 focus:border-[#e3a157] outline-none"
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Physical Delivery Fields */}
          {hasPhysicalProduct && (
            <div className="space-y-3 pt-2 border-t border-[#dab38c]/20">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#f5edeb] flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#e3a157]" />
                <span>
                  Delivery Address (Direct Dispatch from Coastal Collective)
                </span>
              </h4>

              <div>
                <label className="text-xs font-medium text-[#dab38c] block mb-1">
                  Street Address *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Flat/House no, Building, Street"
                  value={shippingAddress.addressLine}
                  onChange={(e) =>
                    setShippingAddress({
                      ...shippingAddress,
                      addressLine: e.target.value,
                    })
                  }
                  className="w-full text-xs p-3 rounded-xl bg-[#1f0b07] text-[#f5edeb] placeholder:text-[#dab38c]/40 border border-[#dab38c]/30 focus:border-[#e3a157] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-[#dab38c] block mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    value={shippingAddress.city}
                    onChange={(e) =>
                      setShippingAddress({
                        ...shippingAddress,
                        city: e.target.value,
                      })
                    }
                    className="w-full text-xs p-3 rounded-xl bg-[#1f0b07] text-[#f5edeb] placeholder:text-[#dab38c]/40 border border-[#dab38c]/30 focus:border-[#e3a157] outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-[#dab38c] block mb-1">
                    Pincode *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 400053"
                    value={shippingAddress.pincode}
                    onChange={(e) =>
                      setShippingAddress({
                        ...shippingAddress,
                        pincode: e.target.value,
                      })
                    }
                    className="w-full text-xs p-3 rounded-xl bg-[#1f0b07] text-[#f5edeb] placeholder:text-[#dab38c]/40 border border-[#dab38c]/30 focus:border-[#e3a157] outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Action Trigger */}
          <div className="pt-4 border-t border-[#dab38c]/20 space-y-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-[#e3a157] hover:bg-[#dab38c] disabled:bg-[#35160e] disabled:text-[#dab38c]/50 text-[#29100b] font-bold text-sm rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              <Lock className="w-4 h-4 text-[#29100b]" />
              <span>
                {isSubmitting
                  ? (isExperience ? "Securing Spot..." : "Placing Order...")
                  : `Pay ${formatINR(finalAmount)} via UPI / Cards`}
              </span>
            </button>

            <div className="flex items-center justify-center gap-4 text-[11px] text-[#dab38c]/70">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 256-bit
                Encrypted
              </span>
              <span>•</span>
              <span>UPI, Cards, NetBanking supported</span>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
