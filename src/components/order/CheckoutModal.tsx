import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ShieldCheck, Lock, User, Mail, Phone, MapPin, Sparkles, AlertCircle } from 'lucide-react';
import { Listing, AttendeeDetail, ShippingAddress } from '../../types';
import { formatINR } from '../../lib/utils';
import { initiatePayment } from '../../lib/razorpay';
import { useData } from '../../context/DataContext';
import { useCart } from '../../context/CartContext';

interface CheckoutModalProps {
  items: {
    listing: Listing;
    quantity: number;
    slotId?: string;
  }[];
  onClose: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ items, onClose }) => {
  const navigate = useNavigate();
  const { createOrder } = useData();
  const { clearCart } = useCart();

  const isExperience = items.some((i) => i.listing.type === 'experience');
  const hasPhysicalProduct = items.some((i) => i.listing.type === 'product');

  // Customer Form State
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');

  // Shipping details for physical goods
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    addressLine: '',
    landmark: '',
    city: 'Mumbai',
    state: 'Maharashtra',
    pincode: '',
  });

  // Attendee names for experience
  const [attendeeDetails, setAttendeeDetails] = useState<AttendeeDetail[]>(() => {
    const totalExpAttendees = items
      .filter((i) => i.listing.type === 'experience')
      .reduce((sum, i) => sum + i.quantity, 0);
    return Array.from({ length: totalExpAttendees }, () => ({
      fullName: '',
      phone: '',
      email: '',
    }));
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const totalAmount = items.reduce(
    (sum, item) => sum + item.listing.price_inr * item.quantity,
    0
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!customerName.trim() || !customerEmail.trim() || !customerPhone.trim()) {
      setErrorMessage('Please fill in your name, email, and phone number.');
      return;
    }

    if (hasPhysicalProduct && (!shippingAddress.addressLine.trim() || !shippingAddress.pincode.trim())) {
      setErrorMessage('Please provide a complete shipping address and pin code.');
      return;
    }

    setIsSubmitting(true);

    try {
      // Trigger Razorpay Modal
      await initiatePayment({
        amountInr: totalAmount,
        orderRef: 'MM-' + Math.random().toString(36).substring(2, 8).toUpperCase(),
        customerName,
        customerEmail,
        customerPhone,
        description: isExperience
          ? `Booking: ${items[0].listing.title}`
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

            // Redirect to digital ticket pass
            navigate(`/order/confirmation/${confirmedOrder.order_ref}`);
          } catch (err: any) {
            console.error('Failed to create order record', err);
            setErrorMessage('Payment was captured, but failed to create order. Please contact host support.');
            setIsSubmitting(false);
          }
        },
        onDismiss: () => {
          setIsSubmitting(false);
        },
      });
    } catch (err: any) {
      console.error('Payment initiation error', err);
      setErrorMessage('Could not initialize payment gateway. Please try again.');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-modal w-full max-w-xl overflow-hidden border border-slate-200 animate-scale-in">
        
        {/* Header */}
        <div className="bg-ocean-950 text-white p-6 flex items-center justify-between border-b border-ocean-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-display font-bold text-xl text-white">Instant Checkout</span>
              <span className="text-[10px] font-semibold bg-sun-300 text-ocean-950 px-2 py-0.5 rounded-full uppercase">
                Zero Middlemen
              </span>
            </div>
            <p className="text-xs text-ocean-200 mt-0.5">
              100% of proceeds go directly to Koli elders & artisan collectives
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-ocean-200 hover:text-white rounded-xl hover:bg-ocean-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content & Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Order Summary Strip */}
          <div className="bg-ocean-50/70 border border-ocean-100 rounded-2xl p-4 space-y-2 text-xs">
            <div className="font-semibold text-ocean-900 uppercase tracking-wider text-[11px]">
              Order Summary ({items.length} {items.length === 1 ? 'item' : 'items'})
            </div>
            {items.map((i, idx) => (
              <div key={idx} className="flex justify-between items-center text-slate-700">
                <span className="truncate max-w-[280px]">
                  {i.quantity}× {i.listing.title}
                </span>
                <span className="font-semibold text-ocean-950 font-display">
                  {formatINR(i.listing.price_inr * i.quantity)}
                </span>
              </div>
            ))}
            <div className="flex justify-between items-center text-sm font-bold text-ocean-950 pt-2 border-t border-ocean-200/60">
              <span>Total Payable</span>
              <span className="font-display text-base text-ocean-900">{formatINR(totalAmount)}</span>
            </div>
          </div>

          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Lead Contact Info */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-ocean-700" />
              <span>Lead Guest / Buyer Information</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-ocean-600 focus:ring-1 focus:ring-ocean-600 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">WhatsApp Phone *</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. +91 98200 12345"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-ocean-600 focus:ring-1 focus:ring-ocean-600 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-medium text-slate-600 block mb-1">Email Address *</label>
              <input
                type="email"
                required
                placeholder="e.g. rahul@example.com (for itinerary & pass)"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-ocean-600 focus:ring-1 focus:ring-ocean-600 outline-none"
              />
            </div>
          </div>

          {/* Tour Specific Fields */}
          {isExperience && (
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-ocean-700" />
                <span>Maritime Safety & Emergency Contact</span>
              </h4>
              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">
                  Emergency Contact Name & Phone (Required for boat/dock manifests)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Sunita Sharma (+91 98201 99887)"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-ocean-600 outline-none"
                />
              </div>
            </div>
          )}

          {/* Physical Delivery Fields */}
          {hasPhysicalProduct && (
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-700" />
                <span>Delivery Address (Direct Dispatch from Coastal Collective)</span>
              </h4>

              <div>
                <label className="text-xs font-medium text-slate-600 block mb-1">Street Address *</label>
                <input
                  type="text"
                  required
                  placeholder="Flat/House no, Building, Street"
                  value={shippingAddress.addressLine}
                  onChange={(e) => setShippingAddress({ ...shippingAddress, addressLine: e.target.value })}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">City</label>
                  <input
                    type="text"
                    value={shippingAddress.city}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-600 block mb-1">Pincode *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 400053"
                    value={shippingAddress.pincode}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, pincode: e.target.value })}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Action Trigger */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-ocean-800 hover:bg-ocean-900 disabled:bg-slate-300 text-white font-semibold text-sm rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 group cursor-pointer"
            >
              <Lock className="w-4 h-4 text-sun-300" />
              <span>
                {isSubmitting ? 'Securing Spot...' : `Pay ${formatINR(totalAmount)} via UPI / Cards`}
              </span>
            </button>

            <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> 256-bit Encrypted
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
