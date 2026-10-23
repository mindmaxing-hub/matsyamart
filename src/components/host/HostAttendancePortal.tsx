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
  const [scanResult, setScanResult] = useState<{
    status: "valid" | "already_arrived" | "invalid" | "outside_window";
    message: string;
    guestName?: string | undefined;
    seats?: number | undefined;
    timestamp?: string | undefined;
  } | null>(null);

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

    // Find the first un-checked in experience item
    let targetItemIndex = -1;
    let targetAttendeeIndex = -1;

    for (let i = 0; i < matchingOrder.items.length; i++) {
      const item = matchingOrder.items[i]!;
      const attendees = item.attendee_details || [];
      const pendingIdx = attendees.findIndex((a) => !a.checked_in);
      if (pendingIdx !== -1) {
        targetItemIndex = i;
        targetAttendeeIndex = pendingIdx;
        break;
      }
    }

    if (targetItemIndex === -1 || targetAttendeeIndex === -1) {
      // All attendees in this order are already checked in!
      const firstAtt = matchingOrder.items[0]?.attendee_details?.[0];
      setScanResult({
        status: "already_arrived",
        guestName: matchingOrder.customer_name,
        seats: matchingOrder.items.reduce((s, it) => s + it.quantity, 0),
        timestamp: firstAtt?.check_in_time
          ? new Date(firstAtt.check_in_time).toLocaleTimeString("en-IN", {
              timeZone: "Asia/Kolkata",
            })
          : "Earlier Today",
        message: `ALREADY ADMITTED: This pass was previously validated.`,
      });
      return;
    }

    const item = matchingOrder.items[targetItemIndex]!;
    // Commit Check-In
    updateAttendeeCheckIn(
      matchingOrder.id,
      item.id,
      targetAttendeeIndex,
      true,
    );

    setScanResult({
      status: "valid",
      guestName:
        item.attendee_details?.[targetAttendeeIndex]?.fullName ||
        matchingOrder.customer_name,
      seats: item.quantity,
      timestamp: new Date().toLocaleTimeString("en-IN", {
        timeZone: "Asia/Kolkata",
      }),
      message: "ADMISSION CONFIRMED: Welcome to the harbor!",
    });

    toast.success(`Checked in ${matchingOrder.customer_name}`);
    setManualRefInput("");
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
                      // Trigger camera simulation
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

            {/* Session Roster Quick View */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#dab38c] flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#e3a157]" />
                  <span>Verified Guest Roster ({manifestRows.length})</span>
                </h3>
              </div>

              <div className="space-y-2">
                {manifestRows.slice(0, 8).map((row) => (
                  <div
                    key={row.bookingId}
                    className="p-3 rounded-xl bg-[#1f0b07] border border-[#dab38c]/15 flex items-center justify-between text-xs"
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
                        <button
                          onClick={() => handleProcessAdmission(row.orderRef)}
                          className="px-2.5 py-1 rounded-full bg-[#35160e] hover:bg-[#e3a157] text-[#dab38c] hover:text-[#29100b] text-[10px] font-bold transition-colors"
                        >
                          Check In
                        </button>
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
