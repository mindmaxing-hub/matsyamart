import React, { useState } from "react";
import {
  Check,
  X,
  Phone,
  Mail,
  MapPin,
  Tag,
  AlertCircle,
  Building2,
  Calendar,
  Waves,
  ShoppingBag,
  Compass,
  MessageSquare,
  Clock,
  Sparkles,
} from "lucide-react";
import { CommunityVendorProposal } from "../../types";
import { useData } from "../../context/DataContext";
import { formatINR, formatDate } from "../../lib/utils";

interface MultiQueueManagerProps {
  proposals: CommunityVendorProposal[];
}

interface CustomInquiryItem {
  id: string;
  type: "corporate_inquiry" | "reschedule_notice";
  name: string;
  organization?: string;
  phone: string;
  email: string;
  subject: string;
  details: string;
  headcount?: number;
  requestedDate?: string;
  status: "pending_review" | "contacted" | "resolved";
  admin_notes?: string;
  created_at: string;
}

const SEED_CUSTOM_INQUIRIES: CustomInquiryItem[] = [
  {
    id: "inq-01",
    type: "corporate_inquiry",
    name: "Tanvi Kapadia",
    organization: "Tata Consultancy Services (CSR Division)",
    phone: "+91 98201 99224",
    email: "tanvi.kapadia@tcs.com",
    subject: "Private 28-Person Versova Dawn Heritage Trail & Koli Breakfast",
    details:
      "We want to book a dedicated morning session for our design team. Require 28 spots, private breakfast at a village home, and vegetarian options for 6 colleagues.",
    headcount: 28,
    requestedDate: "Next Saturday",
    status: "pending_review",
    admin_notes: "Checked guide Devendra Patil availability. Ready to confirm.",
    created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
  {
    id: "inq-02",
    type: "corporate_inquiry",
    name: "Rohan Varma",
    organization: "Studio Bombay Architecture",
    phone: "+91 99302 44100",
    email: "rohan@studiobombay.in",
    subject: "Artisanal Spice Hampers for Diwali Corporate Gifting (50 Sets)",
    details:
      "Interested in procurement of 50 units of the Artisanal Sun-Dried Jawla & Coastal Lal Masala Baskets in custom wooden crates.",
    headcount: 50,
    status: "pending_review",
    created_at: new Date(Date.now() - 3600000 * 30).toISOString(),
  },
  {
    id: "inq-03",
    type: "reschedule_notice",
    name: "Meera Sen",
    phone: "+91 98200 88219",
    email: "meera.sen@example.com",
    subject:
      "Reschedule Request: Thane Flamingo Safari (Ticket MM-EXP-2026-0038)",
    details:
      "Unable to attend this Sunday due to unexpected family travel. Requesting to shift our 2 tickets to the following Saturday morning slot.",
    headcount: 2,
    requestedDate: "Next Weekend",
    status: "pending_review",
    created_at: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
];

export const MultiQueueManager: React.FC<MultiQueueManagerProps> = ({
  proposals,
}) => {
  const { updateProposalStatus } = useData();
  const [activeQueueTab, setActiveQueueTab] = useState<
    "all" | "experiences" | "products" | "corporate" | "reschedules"
  >("all");
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});
  const [customInquiries, setCustomInquiries] = useState<CustomInquiryItem[]>(
    () => {
      try {
        const saved = localStorage.getItem("matsyamart_custom_inquiries_v1");
        return saved ? JSON.parse(saved) : SEED_CUSTOM_INQUIRIES;
      } catch {
        return SEED_CUSTOM_INQUIRIES;
      }
    },
  );

  const handleApproveProposal = (id: string) => {
    updateProposalStatus(
      id,
      "approved",
      adminNotes[id] || "Approved by community coordinator",
    );
  };

  const handleRejectProposal = (id: string) => {
    updateProposalStatus(
      id,
      "rejected",
      adminNotes[id] || "Declined after review",
    );
  };

  const handleUpdateInquiryStatus = (
    id: string,
    status: "contacted" | "resolved",
  ) => {
    setCustomInquiries((prev) => {
      const updated = prev.map((inq) =>
        inq.id === id ? { ...inq, status } : inq,
      );
      localStorage.setItem(
        "matsyamart_custom_inquiries_v1",
        JSON.stringify(updated),
      );
      return updated;
    });
  };

  // Filter items based on active tab
  const experienceProposals = proposals.filter(
    (p) => p.proposal_type === "experience",
  );
  const productProposals = proposals.filter(
    (p) => p.proposal_type === "product",
  );
  const corporateInquiries = customInquiries.filter(
    (i) => i.type === "corporate_inquiry",
  );
  const rescheduleNotices = customInquiries.filter(
    (i) => i.type === "reschedule_notice",
  );

  const totalPending =
    proposals.filter((p) => p.status === "pending_review").length +
    customInquiries.filter((i) => i.status === "pending_review").length;

  return (
    <div className="space-y-5">
      {/* Header & Queue Type Chips */}
      <div className="bg-[#29100b] border border-[#dab38c]/25 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-[#e3a157] bg-[#35160e] px-2.5 py-0.5 rounded-full border border-[#dab38c]/20">
                Community Moderation
              </span>
              <span className="text-xs text-amber-300 font-semibold flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {totalPending} Pending
                Decisions
              </span>
            </div>
            <h2 className="font-display font-bold text-lg sm:text-xl text-[#f5edeb] mt-1">
              Multi-Type Review & Submissions Hub
            </h2>
            <p className="text-xs text-[#dab38c]/70">
              Review and moderate host proposals, artisan submissions, corporate
              bulk requests, and reschedule notices.
            </p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pt-2 border-t border-[#dab38c]/15">
          <button
            onClick={() => setActiveQueueTab("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
              activeQueueTab === "all"
                ? "bg-[#e3a157] text-[#29100b] font-bold"
                : "bg-[#35160e] text-[#dab38c] hover:text-[#f5edeb] border border-[#dab38c]/20"
            }`}
          >
            All Submissions ({proposals.length + customInquiries.length})
          </button>

          <button
            onClick={() => setActiveQueueTab("experiences")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
              activeQueueTab === "experiences"
                ? "bg-[#e3a157] text-[#29100b] font-bold"
                : "bg-[#35160e] text-[#dab38c] hover:text-[#f5edeb] border border-[#dab38c]/20"
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Host Experiences ({experienceProposals.length})</span>
          </button>

          <button
            onClick={() => setActiveQueueTab("products")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
              activeQueueTab === "products"
                ? "bg-[#e3a157] text-[#29100b] font-bold"
                : "bg-[#35160e] text-[#dab38c] hover:text-[#f5edeb] border border-[#dab38c]/20"
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Artisan Goods ({productProposals.length})</span>
          </button>

          <button
            onClick={() => setActiveQueueTab("corporate")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
              activeQueueTab === "corporate"
                ? "bg-[#e3a157] text-[#29100b] font-bold"
                : "bg-[#35160e] text-[#dab38c] hover:text-[#f5edeb] border border-[#dab38c]/20"
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>
              Corporate & Group Inquiries ({corporateInquiries.length})
            </span>
          </button>

          <button
            onClick={() => setActiveQueueTab("reschedules")}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
              activeQueueTab === "reschedules"
                ? "bg-[#e3a157] text-[#29100b] font-bold"
                : "bg-[#35160e] text-[#dab38c] hover:text-[#f5edeb] border border-[#dab38c]/20"
            }`}
          >
            <Waves className="w-3.5 h-3.5" />
            <span>Tidal & Reschedules ({rescheduleNotices.length})</span>
          </button>
        </div>
      </div>

      {/* Queue List Cards */}
      <div className="space-y-4">
        {/* Render Host Proposals */}
        {(activeQueueTab === "all" ||
          activeQueueTab === "experiences" ||
          activeQueueTab === "products") &&
          proposals
            .filter((p) => {
              if (activeQueueTab === "experiences")
                return p.proposal_type === "experience";
              if (activeQueueTab === "products")
                return p.proposal_type === "product";
              return true;
            })
            .map((prop) => {
              const isPending = prop.status === "pending_review";
              const isApproved = prop.status === "approved";

              return (
                <div
                  key={prop.id}
                  className="bg-[#29100b] rounded-2xl border border-[#dab38c]/25 p-5 space-y-4 shadow-lg text-[#f5edeb]"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#dab38c]/15 pb-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-display font-bold text-base text-[#f5edeb]">
                          {prop.proposal_title}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                            prop.proposal_type === "experience"
                              ? "bg-[#35160e] text-[#e3a157] border-[#dab38c]/30"
                              : "bg-[#35160e] text-emerald-300 border-[#dab38c]/30"
                          }`}
                        >
                          {prop.proposal_type === "experience"
                            ? "Host Experience"
                            : "Artisan Product"}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-[#dab38c]/80 mt-1">
                        <span className="font-semibold text-[#f5edeb]">
                          {prop.applicant_name}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-[#e3a157]" />
                          {prop.koliwada_or_village}
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-[#dab38c]">
                          <Phone className="w-3 h-3 text-emerald-400" />
                          {prop.phone}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider self-start sm:self-auto border ${
                        isApproved
                          ? "bg-emerald-950/60 text-emerald-300 border-emerald-800/50"
                          : prop.status === "rejected"
                            ? "bg-rose-950/60 text-rose-300 border-rose-800/50"
                            : "bg-amber-950/60 text-amber-300 border-amber-800/50"
                      }`}
                    >
                      {prop.status.replace("_", " ")}
                    </span>
                  </div>

                  <p className="text-xs text-[#dab38c]/90 leading-relaxed bg-[#35160e]/50 p-3 rounded-xl border border-[#dab38c]/10">
                    {prop.summary}
                  </p>

                  {/* Actions & Coordinator Notes */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
                    <div className="text-xs text-[#dab38c]/70 flex items-center gap-2">
                      <span>Target Price:</span>
                      <strong className="text-[#e3a157]">
                        {prop.estimated_price_inr
                          ? formatINR(prop.estimated_price_inr)
                          : "Needs Estimate"}
                      </strong>
                    </div>

                    {isPending ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Add coordinator notes..."
                          value={adminNotes[prop.id] || ""}
                          onChange={(e) =>
                            setAdminNotes({
                              ...adminNotes,
                              [prop.id]: e.target.value,
                            })
                          }
                          className="text-xs px-2.5 py-1.5 bg-[#35160e] text-[#f5edeb] border border-[#dab38c]/30 rounded-lg outline-none w-48"
                        />
                        <button
                          onClick={() => handleRejectProposal(prop.id)}
                          className="px-3 py-1.5 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 text-xs font-semibold rounded-lg border border-rose-800/40 transition-colors cursor-pointer"
                        >
                          Decline
                        </button>
                        <button
                          onClick={() => handleApproveProposal(prop.id)}
                          className="px-3.5 py-1.5 bg-[#e3a157] hover:bg-[#dab38c] text-[#29100b] text-xs font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve & List</span>
                        </button>
                      </div>
                    ) : (
                      <div className="text-[11px] text-[#dab38c]/60 italic">
                        {prop.admin_notes || "Moderated by coordinator"}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

        {/* Render Corporate & Reschedule Inquiries */}
        {(activeQueueTab === "all" ||
          activeQueueTab === "corporate" ||
          activeQueueTab === "reschedules") &&
          customInquiries
            .filter((inq) => {
              if (activeQueueTab === "corporate")
                return inq.type === "corporate_inquiry";
              if (activeQueueTab === "reschedules")
                return inq.type === "reschedule_notice";
              return true;
            })
            .map((inq) => {
              const isCorporate = inq.type === "corporate_inquiry";
              return (
                <div
                  key={inq.id}
                  className="bg-[#29100b] rounded-2xl border border-[#dab38c]/25 p-5 space-y-4 shadow-lg text-[#f5edeb]"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#dab38c]/15 pb-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-display font-bold text-base text-[#f5edeb]">
                          {inq.subject}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase border ${
                            isCorporate
                              ? "bg-sky-950/60 text-sky-300 border-sky-800/50"
                              : "bg-amber-950/60 text-amber-300 border-amber-800/50"
                          }`}
                        >
                          {isCorporate
                            ? "Corporate Inquiry"
                            : "Reschedule Notice"}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-[#dab38c]/80 mt-1">
                        <span className="font-semibold text-[#f5edeb]">
                          {inq.name}
                        </span>
                        {inq.organization && (
                          <>
                            <span>•</span>
                            <span className="text-[#e3a157]">
                              {inq.organization}
                            </span>
                          </>
                        )}
                        <span>•</span>
                        <span className="flex items-center gap-1 text-[#dab38c]">
                          <Phone className="w-3 h-3 text-emerald-400" />
                          {inq.phone}
                        </span>
                        <span>•</span>
                        <span className="text-[#dab38c]/60">{inq.email}</span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider self-start sm:self-auto border ${
                        inq.status === "resolved"
                          ? "bg-emerald-950/60 text-emerald-300 border-emerald-800/50"
                          : inq.status === "contacted"
                            ? "bg-sky-950/60 text-sky-300 border-sky-800/50"
                            : "bg-amber-950/60 text-amber-300 border-amber-800/50"
                      }`}
                    >
                      {inq.status.replace("_", " ")}
                    </span>
                  </div>

                  <p className="text-xs text-[#dab38c]/90 leading-relaxed bg-[#35160e]/50 p-3 rounded-xl border border-[#dab38c]/10">
                    {inq.details}
                  </p>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
                    <div className="text-xs text-[#dab38c]/70 flex items-center gap-3">
                      {inq.headcount && (
                        <span>
                          Group Size:{" "}
                          <strong className="text-[#e3a157]">
                            {inq.headcount} Guests
                          </strong>
                        </span>
                      )}
                      {inq.requestedDate && (
                        <span>
                          Target:{" "}
                          <strong className="text-[#f5edeb]">
                            {inq.requestedDate}
                          </strong>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={`https://wa.me/${inq.phone.replace(/[^\d]/g, "")}?text=${encodeURIComponent(
                          `Namaste ${inq.name}! Reaching out from MatsyaMart regarding your inquiry for ${inq.subject}.`,
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 transition-colors"
                      >
                        <MessageSquare className="w-3 h-3" />
                        <span>Reply on WhatsApp</span>
                      </a>

                      {inq.status === "pending_review" && (
                        <button
                          onClick={() =>
                            handleUpdateInquiryStatus(inq.id, "contacted")
                          }
                          className="px-3 py-1.5 bg-[#35160e] hover:bg-[#5d3a24] text-[#dab38c] hover:text-[#f5edeb] border border-[#dab38c]/25 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                        >
                          Mark Contacted
                        </button>
                      )}

                      {inq.status !== "resolved" && (
                        <button
                          onClick={() =>
                            handleUpdateInquiryStatus(inq.id, "resolved")
                          }
                          className="px-3 py-1.5 bg-[#e3a157] hover:bg-[#dab38c] text-[#29100b] rounded-lg text-xs font-bold transition-colors cursor-pointer"
                        >
                          Resolve & Close
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
      </div>
    </div>
  );
};
