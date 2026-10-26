import React, { useState } from "react";
import { useData } from "../context/DataContext";
import { Order } from "../types";
import { formatINR, formatDate, formatTime } from "../lib/utils";
import { Link } from "../components/ui/Link";
import {
  Search,
  Smartphone,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Ticket,
  Package,
  FileText,
  ExternalLink,
  MapPin,
  Clock,
  Compass,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { openWhatsApp, buildPassMessage } from "../lib/whatsapp";
import { encodePassPayload } from "../lib/passPayload";

export const TrackOrdersPage: React.FC = () => {
  const { orders } = useData();

  const [phone, setPhone] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [verifiedPhone, setVerifiedPhone] = useState("");
  const [matchedOrders, setMatchedOrders] = useState<Order[]>([]);

  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanPhone = phone.replace(/\D/g, "");
    if (cleanPhone.length < 10) {
      toast.error("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    setIsSendingOtp(true);
    try {
      const res = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleanPhone }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.error || "Failed to send SMS OTP.");
      } else {
        setIsOtpSent(true);
        toast.success(`6-digit SMS OTP dispatched to +91 ${cleanPhone}`);
        if (data.devOtp) {
          toast.info(`[Demo Mode] OTP: ${data.devOtp}`);
        }
      }
    } catch (err) {
      toast.error("Network error sending OTP. Please try again.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phone.replace(/\D/g, "");
    const trimmedOtp = otpCode.trim();

    if (trimmedOtp.length < 4) {
      toast.error("Please enter the complete 6-digit OTP code.");
      return;
    }

    setIsVerifyingOtp(true);
    try {
      const res = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: cleanPhone, otp: trimmedOtp }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        toast.error(data.error || "Invalid OTP code.");
      } else {
        setIsVerified(true);
        setVerifiedPhone(cleanPhone);
        toast.success("Mobile number verified successfully!");

        // Filter all matching orders
        const found = orders.filter((o) => {
          const orderPhone = (o.customer_phone || "").replace(/\D/g, "");
          return orderPhone.endsWith(cleanPhone.slice(-10));
        });
        setMatchedOrders(found);
      }
    } catch (err) {
      toast.error("Verification failed. Please retry.");
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  return (
    <div className="min-h-[80vh] py-12 px-4 sm:px-6 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#35160e] text-[#e3a157] border border-[#dab38c]/25 text-xs font-bold uppercase tracking-wider">
          <Compass className="w-3.5 h-3.5" />
          <span>Coastal Patron Self-Service Portal</span>
        </div>
        <h1 className="font-display font-bold text-3xl sm:text-4xl text-[#f5edeb]">
          Track Orders &amp; Access Digital Passes
        </h1>
        <p className="text-xs sm:text-sm text-[#dab38c] max-w-xl mx-auto leading-relaxed">
          Verify your mobile number via Fast2SMS SMS OTP to instantly lookup your 9:16 mobile admission passes, GST tax invoices, and real-time courier tracking.
        </p>
      </div>

      {/* Verification Gate Box */}
      {!isVerified ? (
        <div className="max-w-md mx-auto p-6 sm:p-8 rounded-3xl bg-[#35160e]/85 backdrop-blur-md border border-[#dab38c]/30 shadow-2xl space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-[#dab38c]/15">
            <div className="w-10 h-10 rounded-2xl bg-[#1f0b07] border border-[#e3a157]/40 flex items-center justify-center text-[#e3a157]">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-base text-[#f5edeb]">
                Mobile OTP Verification
              </h3>
              <p className="text-[11px] text-[#dab38c]/70">
                Powered by Fast2SMS Secured Gateway
              </p>
            </div>
          </div>

          {!isOtpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-[#dab38c] uppercase mb-1.5">
                  10-Digit Indian Mobile Number
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-[#dab38c]/60">
                    +91
                  </span>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="9820144512"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                    className="w-full pl-12 pr-4 py-3 rounded-xl bg-[#1f0b07] text-[#f5edeb] border border-[#dab38c]/30 focus:border-[#e3a157] outline-none font-mono text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSendingOtp || phone.replace(/\D/g, "").length < 10}
                className="w-full py-3 rounded-xl bg-[#e3a157] hover:bg-[#dab38c] text-[#29100b] font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50 cursor-pointer"
              >
                {isSendingOtp ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending SMS OTP...</span>
                  </>
                ) : (
                  <>
                    <Smartphone className="w-4 h-4" />
                    <span>Send SMS OTP via Fast2SMS</span>
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="text-center space-y-1">
                <p className="text-xs text-[#dab38c]">
                  Enter the 6-digit verification code sent to:
                </p>
                <p className="font-mono font-bold text-sm text-[#e3a157]">
                  +91 {phone.replace(/\D/g, "")}
                </p>
              </div>

              <div>
                <input
                  type="text"
                  maxLength={6}
                  autoFocus
                  placeholder="······"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                  className="w-full text-center tracking-[0.5em] font-mono text-xl py-3 rounded-xl bg-[#1f0b07] text-[#f5edeb] border border-[#dab38c]/40 focus:border-[#e3a157] outline-none"
                />
              </div>

              <div className="flex items-center justify-between text-xs pt-1">
                <button
                  type="button"
                  onClick={() => setIsOtpSent(false)}
                  className="text-[#dab38c] hover:underline"
                >
                  Change Number
                </button>
                <button
                  type="button"
                  onClick={() => handleSendOtp()}
                  disabled={isSendingOtp}
                  className="text-[#e3a157] font-bold hover:underline"
                >
                  Resend SMS OTP
                </button>
              </div>

              <button
                type="submit"
                disabled={isVerifyingOtp || otpCode.trim().length < 4}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-md transition-all disabled:opacity-50 cursor-pointer"
              >
                {isVerifyingOtp ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <KeyRound className="w-4 h-4" />
                    <span>Verify &amp; View Passes</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      ) : (
        /* Verified Customer Dashboard */
        <div className="space-y-6">
          <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Verified Patron: +91 {verifiedPhone}</span>
            </div>
            <button
              onClick={() => {
                setIsVerified(false);
                setIsOtpSent(false);
                setOtpCode("");
              }}
              className="text-[11px] text-[#dab38c] hover:underline cursor-pointer"
            >
              Log out / Change Phone
            </button>
          </div>

          {matchedOrders.length === 0 ? (
            <div className="p-8 text-center rounded-3xl bg-[#35160e]/50 border border-[#dab38c]/20 space-y-3">
              <AlertCircle className="w-8 h-8 text-[#e3a157] mx-auto opacity-70" />
              <h3 className="font-display font-bold text-lg text-[#f5edeb]">
                No Bookings Found for this Number
              </h3>
              <p className="text-xs text-[#dab38c] max-w-sm mx-auto">
                We did not find any active bookings under +91 {verifiedPhone}. If you booked with a different mobile number, please verify that number.
              </p>
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#e3a157] text-[#29100b] rounded-xl text-xs font-bold hover:bg-[#dab38c] cursor-pointer"
              >
                Explore Coastal Experiences
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="font-display font-bold text-xl text-[#f5edeb]">
                Your Coastal Bookings &amp; Orders ({matchedOrders.length})
              </h2>

              <div className="grid grid-cols-1 gap-4">
                {matchedOrders.map((order) => {
                  const hasExp = order.items.some((i) => i.listing?.type === "experience");
                  const hasGoods = order.items.some((i) => i.listing?.type === "product");
                  const payload = encodePassPayload(order);
                  const confirmationUrl = payload
                    ? `/order/confirmation/${order.order_ref}?p=${payload}`
                    : `/order/confirmation/${order.order_ref}`;
                  const invoiceUrl = `${confirmationUrl}&view=invoice`;

                  return (
                    <div
                      key={order.id}
                      className="p-5 sm:p-6 rounded-3xl bg-[#35160e]/90 border border-[#dab38c]/25 space-y-4 shadow-xl"
                    >
                      <div className="flex items-start justify-between flex-wrap gap-2 pb-3 border-b border-[#dab38c]/15">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-sm text-[#e3a157]">
                              {order.order_ref}
                            </span>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                              {order.status || "Paid"}
                            </span>
                          </div>
                          <p className="text-[11px] text-[#dab38c]">
                            Booked on {formatDate(order.created_at)} · Total Paid: {formatINR(order.total_amount_inr)}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <Link
                            to={confirmationUrl}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#e3a157] hover:bg-[#dab38c] text-[#29100b] text-xs font-bold shadow-xs cursor-pointer"
                          >
                            <Ticket className="w-3.5 h-3.5" />
                            <span>View Digital Passes</span>
                          </Link>

                          <Link
                            to={invoiceUrl}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#1f0b07] hover:bg-[#29100b] border border-[#dab38c]/30 text-[#dab38c] text-xs font-semibold cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Tax Invoice</span>
                          </Link>
                        </div>
                      </div>

                      {/* Items Roster */}
                      <div className="space-y-2">
                        {order.items.map((item, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-2xl bg-[#1f0b07] border border-[#dab38c]/15 flex items-center justify-between text-xs"
                          >
                            <div className="space-y-0.5">
                              <h4 className="font-bold text-[#f5edeb]">
                                {item.listing?.title || "Coastal Offering"}
                              </h4>
                              <div className="flex items-center gap-3 text-[11px] text-[#dab38c]/70">
                                {item.slot && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3 text-[#e3a157]" />
                                    {formatDate(item.slot.slot_start)} at {formatTime(item.slot.slot_start)}
                                  </span>
                                )}
                                {item.listing?.location_name && (
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3 text-[#e3a157]" />
                                    {item.listing.location_name}
                                  </span>
                                )}
                              </div>
                            </div>
                            <span className="font-mono font-bold text-[#e3a157]">
                              Qty: {item.quantity}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Physical Delivery Tracking If Applicable */}
                      {hasGoods && (
                        <div className="p-3 rounded-2xl bg-amber-950/20 border border-amber-500/25 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-2 text-amber-300">
                            <Package className="w-4 h-4" />
                            <span>
                              Fulfillment: {order.fulfillment_status || "Processing at dock"}
                            </span>
                          </div>
                          {order.tracking_awb && (
                            <span className="font-mono text-[11px] text-[#dab38c]">
                              AWB: {order.tracking_awb}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
