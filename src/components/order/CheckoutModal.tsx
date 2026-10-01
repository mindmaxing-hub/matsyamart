import React, { useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { X, ShieldCheck, Lock, User, MapPin, AlertCircle } from "lucide-react";
import { Listing, AttendeeDetail, ShippingAddress } from "../../types";
import { formatINR } from "../../lib/utils";
import { initiatePayment } from "../../lib/razorpay";
import { useData } from "../../context/DataContext";
import { useCart } from "../../context/CartContext";

interface CheckoutModalProps {
  items: {
    listing: Listing;
    quantity: number;
    slotId?: string;
  }[];
  onClose: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  items,
  onClose,
}) => {
  const router = useRouter();
  const { createOrder, slots } = useData();
  const { clearCart } = useCart();

  const isExperience = items.some((i) => i.listing.type === "experience");
  const hasPhysicalProduct = items.some((i) => i.listing.type === "product");

  // Customer Form State
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [emergencyContact, setEmergencyContact] = useState("");

  // Shipping details for physical goods
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    addressLine: "",
    landmark: "",
    city: "Mumbai",
    state: "Maharashtra",
    pincode: "",
  });

  // Attendee names for experience
  const [attendeeDetails, setAttendeeDetails] = useState<AttendeeDetail[]>(
    () => {
      const totalExpAttendees = items
        .filter((i) => i.listing.type === "experience")
        .reduce((sum, i) => sum + i.quantity, 0);
      return Array.from({ length: totalExpAttendees }, () => ({
        fullName: "",
        phone: "",
        email: "",
      }));
    },
  );

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const totalAmount = items.reduce(
    (sum, item) => sum + item.listing.price_inr * item.quantity,
    0,
  );

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

    setIsSubmitting(true);

    try {
      // Trigger Razorpay Modal / Sandbox Bridge
      await initiatePayment({
        amountInr: totalAmount,
        orderRef:
          "MM-" + Math.random().toString(36).substring(2, 8).toUpperCase(),
        customerName,
        customerEmail,
        customerPhone,
        description: isExperience
          ? `Booking: ${items[0]?.listing.title || "Coastal Experience"}`
          : `Order: MatsyaMart Community Goods`,
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
              items: items.map((i) => ({
                listing: i.listing,
                quantity: i.quantity,
                slotId: i.slotId,
                attendeeDetails: isExperience ? attendeeDetails : undefined,
              })),
            });

            // If checked out from cart, clear cart
            clearCart();
            onClose();

            // Redirect to digital ticket pass via TanStack router
            router.navigate({
              to: "/order/confirmation/$orderRef",
              params: { orderRef: confirmedOrder.order_ref },
            });
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
                Curated Experience
              </span>
            </div>
            <p className="text-xs text-[#dab38c] mt-1">
              Curated and operated in direct partnership with local coastal
              communities
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
          <div className="bg-[#1f0b07] border border-[#dab38c]/20 rounded-2xl p-4 space-y-2 text-xs">
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
            <div className="flex justify-between items-center text-sm font-bold text-[#f5edeb] pt-2 border-t border-[#dab38c]/20">
              <span>Total Payable</span>
              <span className="font-display text-base text-[#e3a157] font-bold">
                {formatINR(totalAmount)}
              </span>
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
                Email Address (for pass & tickets) *
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
                <span>Maritime Safety & Emergency Contact</span>
              </h4>
              <div>
                <label className="text-xs font-medium text-[#dab38c] block mb-1">
                  Emergency Contact Name & Phone (Required for boat/harbor
                  manifests)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sunita Sharma (+91 98201 99887)"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl bg-[#1f0b07] text-[#f5edeb] placeholder:text-[#dab38c]/40 border border-[#dab38c]/30 focus:border-[#e3a157] outline-none"
                />
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
                  ? "Securing Spot..."
                  : `Pay ${formatINR(totalAmount)} via UPI / Cards`}
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
