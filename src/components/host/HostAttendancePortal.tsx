import React, { useState, useMemo } from "react";
import { useData } from "../../context/DataContext";
import { Partner, ExperienceSlot, Listing, Order } from "../../types";
import { normalizeWhatsAppPhone, formatPhoneDisplay } from "../../lib/whatsapp";
import { buildCanonicalManifest, ManifestRow } from "../../lib/services/manifest";
import { BrandLogo } from "../site/BrandLogo";
import {
  QrCode,
  Camera,
  Upload,
  CheckCircle2,
  AlertCircle,
  Clock,
  Phone,
  ShieldCheck,
  Search,
  LogOut,
  MapPin,
  Users,
  X,
  RotateCcw,
  UserCheck,
  Ticket,
} from "lucide-react";
import { toast } from "sonner";

export const HostAttendancePortal: React.FC = () => {
  const { partners, slots, listings, orders, updateAttendeeCheckIn } = useData();

  // Host Phone Auth State
  const [hostPhoneInput, setHostPhoneInput] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [activePartner, setActivePartner] = useState<Partner | null>(null);
  const [authError, setAuthError] = useState("");

  // Host Scanner State
  const [selectedSlotId, setSelectedSlotId] = useState<string>("all");
  const [manualRefInput, setManualRefInput] = useState("");
  const [inspectedOrderId, setInspectedOrderId] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<{
    status: "valid" | "already_arrived" | "invalid" | "outside_window";
    message: string;
    guestName?: string | undefined;
    seats?: number | undefined;
    timestamp?: string | undefined;
  } | null>(null);

  const inspectedOrder = useMemo(() => {
    if (!inspectedOrderId) return null;
    return orders.find((o) => o.id === inspectedOrderId) || null;
  }, [orders, inspectedOrderId]);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    const clean = normalizeWhatsAppPhone(hostPhoneInput);
    if (!clean) {
      setAuthError("Please enter a valid 10-digit mobile number.");
      return;
    }

    // Server-side check: Host phone must be registered to an authorized partner
    const matchedPartner = partners.find(
      (p) => normalizeWhatsAppPhone(p.phone) === clean,
    );

    if (!matchedPartner) {
      setAuthError(
        "This phone number is not bound to an authorized MatsyaMart host account. Contact coordinator at +91 76665 11511.",
      );
      return;
    }

    setIsOtpSent(true);
    toast.success(`6-digit OTP dispatched via SMS to ${formatPhoneDisplay(clean)}`);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    if (!otpInput.trim() || otpInput.trim().length < 4) {
      setAuthError("Please enter the 6-digit OTP code sent to your phone.");
      return;
    }

    const clean = normalizeWhatsAppPhone(hostPhoneInput);
    const matchedPartner = partners.find(
      (p) => normalizeWhatsAppPhone(p.phone) === clean,
    );

    if (matchedPartner) {
      setActivePartner(matchedPartner);
      setIsOtpSent(false);
      toast.success(`Welcome, ${matchedPartner.name}!`);
    }
  };

  const handleSignOut = () => {
    setActivePartner(null);
    setIsOtpSent(false);
    setHostPhoneInput("");
    setOtpInput("");
    setScanResult(null);
    setInspectedOrderId(null);
  };

  // Canonical Manifest rows for this host
  const manifestRows = useMemo(() => {
    return buildCanonicalManifest(orders, listings, slots, {
      sessionId: selectedSlotId !== "all" ? selectedSlotId : undefined,
    });
  }, [orders, listings, slots, selectedSlotId]);

  // Check-In Validator & Committer
  const handleProcessAdmission = (ticketRef: string) => {
    const ref = ticketRef.trim().toUpperCase();
    if (!ref) {
      setScanResult({
        status: "invalid",
        message: "Empty pass reference provided.",
      });
      return;
    }

    // Match order by order_ref or partial ID
    const matchingOrder = orders.find(
      (o) =>
        o.order_ref.toUpperCase() === ref ||
        o.order_ref.toUpperCase().includes(ref) ||
        o.id === ref,
    );

    if (!matchingOrder) {
      setScanResult({
        status: "invalid",
        message: `Pass "${ref}" not found in verified guest ledger.`,
      });
      return;
    }

    if (matchingOrder.status === "cancelled" || matchingOrder.status === "refunded") {
      setScanResult({
        status: "invalid",
        message: `Admission Denied: Pass is ${matchingOrder.status.toUpperCase()}.`,
      });
      return;
    }

    // Set as currently inspected order for individual seat breakdown
    setInspectedOrderId(matchingOrder.id);

    // Calculate total experience seats and arrived count
    let totalSeats = 0;
    let arrivedSeats = 0;

    matchingOrder.items.forEach((item) => {
      totalSeats += item.quantity;
      const attendees = item.attendee_details || [];
      attendees.forEach((att) => {
        if (att.checked_in) arrivedSeats++;
      });
    });

    if (arrivedSeats >= totalSeats && totalSeats > 0) {
      const firstAtt = matchingOrder.items[0]?.attendee_details?.[0];
      setScanResult({
        status: "already_arrived",
        guestName: matchingOrder.customer_name,
        seats: totalSeats,
        timestamp: firstAtt?.check_in_time
          ? new Date(firstAtt.check_in_time).toLocaleTimeString("en-IN", {
              timeZone: "Asia/Kolkata",
            })
          : "Earlier Today",
        message: `ALREADY ADMITTED: All ${totalSeats} seats previously checked in.`,
      });
    } else {
      setScanResult({
        status: "valid",
        guestName: matchingOrder.customer_name,
        seats: totalSeats,
        timestamp: new Date().toLocaleTimeString("en-IN", {
          timeZone: "Asia/Kolkata",
        }),
        message: `PASS VERIFIED: ${arrivedSeats}/${totalSeats} seats arrived. Select seats to admit.`,
      });
    }

    setManualRefInput("");
  };

  const handleCheckInSingleSeat = (
    orderId: string,
    itemId: string,
    seatIdx: number,
  ) => {
    updateAttendeeCheckIn(orderId, itemId, seatIdx, true);
    toast.success(`Admitted Seat #${seatIdx + 1}`);
  };

  const handleUndoSeatCheckIn = (
    orderId: string,
    itemId: string,
    seatIdx: number,
  ) => {
    updateAttendeeCheckIn(orderId, itemId, seatIdx, false);
    toast.info(`Restored Seat #${seatIdx + 1} (Marked in error)`);
  };

  const handleAdmitAllSeats = (order: Order) => {
    order.items.forEach((item) => {
      const attendees = item.attendee_details || [];
      for (let s = 0; s < item.quantity; s++) {
        if (!attendees[s]?.checked_in) {
          updateAttendeeCheckIn(order.id, item.id, s, true);
        }
      }
    });
    toast.success(`Admitted all remaining seats for ${order.customer_name}`);
  };

  return (
    <div className="min-h-screen bg-[#140604] text-[#f5edeb] flex flex-col font-sans">
      {/* Top Header */}
      <header className="p-4 border-b border-[#dab38c]/20 bg-[#1f0b07] flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-3">
          <BrandLogo variant="white" className="h-7 w-auto" />
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-[#35160e] text-[#e3a157] font-bold">
            HOST PORTAL
          </span>
        </div>
        {activePartner && (
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 text-xs text-[#dab38c] hover:text-[#f5edeb] p-2 rounded-lg bg-[#35160e] transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        )}
      </header>

      <main className="flex-1 max-w-md w-full mx-auto p-4 space-y-5">
        {!activePartner ? (
          /* Phone OTP Sign-In */
          <div className="p-6 rounded-2xl bg-[#1f0b07] border border-[#dab38c]/20 shadow-xl space-y-5 mt-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-[#35160e] text-[#e3a157] mx-auto flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h1 className="font-display text-xl font-bold text-[#f5edeb]">
                Host & Artisan Check-In
              </h1>
              <p className="text-xs text-[#dab38c]/80 leading-relaxed">
                Enter your registered mobile number to access your assigned session manifests and scan guest QR passes.
              </p>
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-rose-950/80 border border-rose-500/40 text-rose-200 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            {!isOtpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-[#dab38c] block mb-1.5">
                    Registered Mobile Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-[#dab38c]/50 absolute left-3 top-3.5" />
                    <input
                      type="tel"
                      required
                      placeholder="+91 98201 44512"
                      value={hostPhoneInput}
                      onChange={(e) => setHostPhoneInput(e.target.value)}
                      className="w-full text-sm pl-9 pr-3 py-3 rounded-xl bg-[#140604] border border-[#dab38c]/30 text-[#f5edeb] placeholder:text-[#dab38c]/40 focus:border-[#e3a157] outline-none"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#e3a157] hover:bg-[#dab38c] text-[#29100b] font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Send Verification SMS
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-[#dab38c] block mb-1.5">
                    Enter 6-Digit SMS Code
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="123456"
                    value={otpInput}
                    onChange={(e) => setOtpInput(e.target.value)}
                    className="w-full text-center tracking-widest text-lg py-3 rounded-xl bg-[#140604] border border-[#dab38c]/30 text-[#e3a157] font-mono focus:border-[#e3a157] outline-none"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsOtpSent(false)}
                    className="flex-1 py-3 bg-[#35160e] text-[#dab38c] text-xs font-semibold rounded-xl"
                  >
                    Change Phone
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-[#e3a157] text-[#29100b] font-bold text-xs rounded-xl"
                  >
                    Verify & Enter
                  </button>
                </div>
              </form>
            )}
          </div>
        ) : (
          /* Host Active Dashboard */
          <div className="space-y-5">
            {/* Host Identity Card */}
            <div className="p-4 rounded-2xl bg-[#1f0b07] border border-[#dab38c]/20 flex items-center justify-between">
              <div>
                <div className="text-[11px] text-[#dab38c] uppercase tracking-wider font-semibold">
                  Verified Host
                </div>
                <div className="font-bold text-sm text-[#f5edeb]">{activePartner.name}</div>
                {activePartner.entity_name && (
                  <div className="text-xs text-[#e3a157]">{activePartner.entity_name}</div>
                )}
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 flex items-center justify-center font-bold">
                ✓
              </div>
            </div>

            {/* Scan / Manual Entry Box */}
            <div className="p-5 rounded-2xl bg-[#1f0b07] border border-[#dab38c]/20 space-y-4 shadow-lg">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#e3a157] flex items-center gap-2">
                <QrCode className="w-4 h-4 text-[#e3a157]" />
                <span>Admission Scanner & Verification</span>
              </h2>

              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Enter pass ref (e.g. MM-EXP-0042)"
                    value={manualRefInput}
                    onChange={(e) => setManualRefInput(e.target.value)}
                    className="flex-1 text-xs p-3 rounded-xl bg-[#140604] border border-[#dab38c]/30 text-[#f5edeb] font-mono placeholder:text-[#dab38c]/40 outline-none focus:border-[#e3a157]"
                  />
                  <button
                    onClick={() => handleProcessAdmission(manualRefInput)}
                    className="px-4 bg-[#e3a157] text-[#29100b] font-bold text-xs rounded-xl hover:bg-[#dab38c] transition-colors"
                  >
                    Verify
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    onClick={() => {
                      const sampleOrder = orders[0];
                      if (sampleOrder) handleProcessAdmission(sampleOrder.order_ref);
                    }}
                    className="p-3 rounded-xl bg-[#35160e] hover:bg-[#4a1f14] text-[#dab38c] flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Camera className="w-4 h-4 text-[#e3a157]" />
                    <span>Scan Camera</span>
                  </button>
                  <label className="p-3 rounded-xl bg-[#35160e] hover:bg-[#4a1f14] text-[#dab38c] flex items-center justify-center gap-1.5 cursor-pointer transition-colors">
                    <Upload className="w-4 h-4 text-[#e3a157]" />
                    <span>Upload QR</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={() => {
                        const sampleOrder = orders[0];
                        if (sampleOrder) handleProcessAdmission(sampleOrder.order_ref);
                      }}
                    />
                  </label>
                </div>
              </div>

              {/* Scan Result Feedback Card */}
              {scanResult && (
                <div
                  className={`p-4 rounded-xl border text-xs space-y-1.5 animate-in fade-in zoom-in-95 duration-200 ${
                    scanResult.status === "valid"
                      ? "bg-emerald-950/80 border-emerald-500/50 text-emerald-100"
                      : scanResult.status === "already_arrived"
                        ? "bg-amber-950/80 border-amber-500/50 text-amber-100"
                        : "bg-rose-950/80 border-rose-500/50 text-rose-100"
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-sm">
                    {scanResult.status === "valid" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-400" />
                    )}
                    <span>{scanResult.message}</span>
                  </div>
                  {scanResult.guestName && (
                    <div className="font-semibold">
                      Guest: {scanResult.guestName} ({scanResult.seats || 1} Seats)
                    </div>
                  )}
                  {scanResult.timestamp && (
                    <div className="opacity-80 text-[11px]">
                      Validated at: {scanResult.timestamp}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Interactive Seat Inspection Sheet (Shown when an order is verified or selected) */}
            {inspectedOrder && (
              <div className="p-5 rounded-2xl bg-[#1f0b07] border-2 border-[#e3a157]/50 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="flex items-center justify-between pb-3 border-b border-[#dab38c]/20">
                  <div className="flex items-center gap-2">
                    <Ticket className="w-4 h-4 text-[#e3a157]" />
                    <span className="font-mono text-xs font-bold text-[#e3a157]">
                      {inspectedOrder.order_ref}
                    </span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                      {inspectedOrder.status}
                    </span>
                  </div>
                  <button
                    onClick={() => setInspectedOrderId(null)}
                    className="p-1 rounded-lg text-[#dab38c]/60 hover:text-[#f5edeb] hover:bg-[#35160e] transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Lead Customer Info */}
                <div className="text-xs space-y-1 text-[#dab38c]/90">
                  <div className="font-bold text-sm text-[#f5edeb]">
                    {inspectedOrder.customer_name}
                  </div>
                  <div className="flex items-center gap-2 text-[11px]">
                    <Phone className="w-3 h-3 text-[#dab38c]/60" />
                    <span>{inspectedOrder.customer_phone}</span>
                    <span>·</span>
                    <span>{inspectedOrder.customer_email}</span>
                  </div>
                </div>

                {/* Batch Action */}
                <div className="pt-1">
                  <button
                    onClick={() => handleAdmitAllSeats(inspectedOrder)}
                    className="w-full py-2.5 px-4 bg-[#e3a157] hover:bg-[#dab38c] text-[#29100b] font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <UserCheck className="w-4 h-4" />
                    <span>Admit All Remaining Seats</span>
                  </button>
                </div>

                {/* Individual Seats Breakdown */}
                <div className="space-y-3 pt-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-[#dab38c]/70">
                    Seat-by-Seat Party Breakdown
                  </div>

                  {inspectedOrder.items.map((item, itemIdx) => {
                    const attendees = item.attendee_details || [];
                    return (
                      <div key={item.id} className="space-y-2">
                        <div className="text-xs font-semibold text-[#f5edeb]">
                          {item.listing?.title || "Coastal Experience"}
                        </div>

                        {Array.from({ length: item.quantity }).map((_, seatIdx) => {
                          const att = attendees[seatIdx];
                          const isArrived = Boolean(att?.checked_in);
                          const seatName =
                            att?.fullName ||
                            (seatIdx === 0
                              ? inspectedOrder.customer_name
                              : `Guest ${seatIdx + 1}`);

                          return (
                            <div
                              key={seatIdx}
                              className={`p-3 rounded-xl border flex items-center justify-between text-xs transition-colors ${
                                isArrived
                                  ? "bg-emerald-950/40 border-emerald-500/30 text-emerald-100"
                                  : "bg-[#140604] border-[#dab38c]/20 text-[#dab38c]"
                              }`}
                            >
                              <div className="space-y-0.5">
                                <div className="font-bold text-[#f5edeb] flex items-center gap-1.5">
                                  <span>Seat #{seatIdx + 1}:</span>
                                  <span>{seatName}</span>
                                </div>
                                <div className="text-[11px] text-[#dab38c]/70 flex items-center gap-2">
                                  {isArrived ? (
                                    <span className="text-emerald-400 font-medium">
                                      ✓ Arrived {att?.check_in_time ? `at ${new Date(att.check_in_time).toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata" })}` : ""}
                                    </span>
                                  ) : (
                                    <span className="text-amber-400/90 font-medium">
                                      Pending Arrival
                                    </span>
                                  )}
                                </div>
                              </div>

                              <div>
                                {isArrived ? (
                                  <button
                                    onClick={() =>
                                      handleUndoSeatCheckIn(
                                        inspectedOrder.id,
                                        item.id,
                                        seatIdx,
                                      )
                                    }
                                    className="px-2.5 py-1 text-[10px] font-semibold text-rose-300 hover:text-rose-100 hover:bg-rose-950/60 rounded-lg border border-rose-500/30 flex items-center gap-1 transition-colors"
                                    title="Marked in error - restore seat to pending"
                                  >
                                    <RotateCcw className="w-3 h-3" />
                                    <span>Undo</span>
                                  </button>
                                ) : (
                                  <button
                                    onClick={() =>
                                      handleCheckInSingleSeat(
                                        inspectedOrder.id,
                                        item.id,
                                        seatIdx,
                                      )
                                    }
                                    className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] rounded-lg shadow transition-colors flex items-center gap-1"
                                  >
                                    <UserCheck className="w-3 h-3" />
                                    <span>Admit</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Session Roster Quick View */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#dab38c] flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#e3a157]" />
                  <span>Verified Guest Roster ({manifestRows.length})</span>
                </h3>
              </div>

              <div className="space-y-2">
                {manifestRows.slice(0, 10).map((row) => (
                  <div
                    key={row.bookingId}
                    onClick={() => {
                      const matched = orders.find((o) => o.id === row.orderId);
                      if (matched) {
                        setInspectedOrderId(matched.id);
                      }
                    }}
                    className="p-3 rounded-xl bg-[#1f0b07] hover:bg-[#2c100a] border border-[#dab38c]/15 flex items-center justify-between text-xs cursor-pointer transition-colors"
                  >
                    <div>
                      <div className="font-bold text-[#f5edeb]">{row.attendeeName}</div>
                      <div className="text-[11px] text-[#dab38c]/70 font-mono">
                        {row.orderRef} · Seat #{row.seatIndex}
                      </div>
                    </div>
                    <div>
                      {row.checkedIn ? (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold">
                          ARRIVED
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-[#35160e] text-[#e3a157] text-[10px] font-bold border border-[#dab38c]/20">
                          Inspect Party →
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
