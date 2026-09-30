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
    <div className="space-y-4">
      {/* Header & Filter Chips */}
      <div className="admin-card p-4 sm:p-5 space-y-3">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none flex-wrap">
          <button
            onClick={() => setActiveQueueTab("all")}
            className={`admin-chip cursor-pointer ${
              activeQueueTab === "all" ? "active" : ""
            }`}
          >
            All ({proposals.length + customInquiries.length})
          </button>

          <button
            onClick={() => setActiveQueueTab("experiences")}
            className={`admin-chip cursor-pointer ${
              activeQueueTab === "experiences" ? "active" : ""
            }`}
          >
            Host Experiences ({experienceProposals.length})
          </button>

          <button
            onClick={() => setActiveQueueTab("products")}
            className={`admin-chip cursor-pointer ${
              activeQueueTab === "products" ? "active" : ""
            }`}
          >
            Artisan Goods ({productProposals.length})
          </button>

          <button
            onClick={() => setActiveQueueTab("corporate")}
            className={`admin-chip cursor-pointer ${
              activeQueueTab === "corporate" ? "active" : ""
            }`}
          >
            Corporate ({corporateInquiries.length})
          </button>

          <button
            onClick={() => setActiveQueueTab("reschedules")}
            className={`admin-chip cursor-pointer ${
              activeQueueTab === "reschedules" ? "active" : ""
            }`}
          >
            Reschedules ({rescheduleNotices.length})
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
                  className="admin-card p-5 sm:p-6 space-y-3.5 text-[#29100B]"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <h3 className="font-editorial text-2xl font-normal text-[#29100B] tracking-[-0.01em]">
                        {prop.proposal_title}
                      </h3>
                      <div className="text-[13px] text-[rgba(41,16,11,0.64)] flex flex-wrap items-center gap-2">
                        <b className="text-[#29100B]">{prop.applicant_name}</b>
                        <span>·</span>
                        <span>{prop.koliwada_or_village}</span>
                        <span>·</span>
                        <span className="font-editorial-mono">
                          {prop.phone}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <span
                        className={
                          isPending
                            ? "admin-pill admin-pill-amber"
                            : isApproved
                              ? "admin-pill admin-pill-roast"
                              : "admin-pill admin-pill-line"
                        }
                      >
                        {prop.status.replace("_", " ")}
                      </span>
                      <span className="admin-pill admin-pill-line">
                        {prop.proposal_type === "experience"
                          ? "Host experience"
                          : "Artisan product"}
                      </span>
                    </div>
                  </div>

                  <div className="bg-[#F5EDEB] border border-dashed border-[rgba(41,16,11,0.15)] rounded-xl p-3.5 text-[14px] text-[rgba(41,16,11,0.64)] italic leading-relaxed">
                    “{prop.summary}”
                  </div>

                  {/* Actions & Coordinator Notes */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-[rgba(41,16,11,0.08)]">
                    <div className="text-[13.5px] text-[rgba(41,16,11,0.64)] flex items-center gap-1.5">
                      <span>Target</span>
                      <b className="text-[#29100B]">
                        {prop.estimated_price_inr
                          ? formatINR(prop.estimated_price_inr)
                          : "Needs Estimate"}
                      </b>
                    </div>

                    {isPending ? (
                      <div className="flex flex-wrap items-center gap-2.5">
                        <input
                          type="text"
                          placeholder="Add coordinator note…"
                          value={adminNotes[prop.id] || ""}
                          onChange={(e) =>
                            setAdminNotes({
                              ...adminNotes,
                              [prop.id]: e.target.value,
                            })
                          }
                          className="admin-search rounded-full py-1.5 px-3.5 text-xs w-48 sm:w-60"
                        />
                        <button
                          onClick={() => handleRejectProposal(prop.id)}
                          className="text-[rgba(41,16,11,0.7)] hover:text-[#29100B] text-[13.5px] font-semibold underline underline-offset-3 cursor-pointer"
                        >
                          Decline
                        </button>
                        <button
                          onClick={() => handleApproveProposal(prop.id)}
                          className="admin-btn admin-btn-primary text-xs py-2 px-4 cursor-pointer"
                        >
                          ✓ Approve &amp; List
                        </button>
                      </div>
                    ) : (
                      <div className="text-[12px] text-[rgba(41,16,11,0.44)] italic">
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
                  className="admin-card p-5 sm:p-6 space-y-3.5 text-[#29100B]"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <h3 className="font-editorial text-2xl font-normal text-[#29100B] tracking-[-0.01em]">
                        {inq.subject}
                      </h3>
                      <div className="text-[13px] text-[rgba(41,16,11,0.64)] flex flex-wrap items-center gap-2">
                        <b className="text-[#29100B]">
                          {inq.name}
                          {inq.organization ? ` · ${inq.organization}` : ""}
                        </b>
                        {inq.headcount && (
                          <>
                            <span>·</span>
                            <span>{inq.headcount} guests</span>
                          </>
                        )}
                        {inq.requestedDate && (
                          <>
                            <span>·</span>
                            <span>{inq.requestedDate}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start sm:self-auto">
                      <span
                        className={
                          inq.status === "pending_review"
                            ? "admin-pill admin-pill-amber"
                            : inq.status === "resolved"
                              ? "admin-pill admin-pill-roast"
                              : "admin-pill admin-pill-line"
                        }
                      >
                        {inq.status.replace("_", " ")}
                      </span>
                      <span className="admin-pill admin-pill-line">
                        {isCorporate
                          ? "Corporate inquiry"
                          : "Reschedule notice"}
                      </span>
                    </div>
                  </div>

                  <div className="bg-[#F5EDEB] border border-dashed border-[rgba(41,16,11,0.15)] rounded-xl p-3.5 text-[14px] text-[rgba(41,16,11,0.64)] italic leading-relaxed">
                    “{inq.details}”
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-[rgba(41,16,11,0.08)]">
                    <div className="text-xs text-[rgba(41,16,11,0.64)] font-editorial-mono">
                      Contact: {inq.phone} · {inq.email}
                    </div>

                    <div className="flex items-center gap-2">
                      <a
                        href={`https://wa.me/${inq.phone.replace(/[^\d]/g, "")}?text=${encodeURIComponent(
                          `Namaste ${inq.name}! Reaching out from MatsyaMart regarding your inquiry for ${inq.subject}.`,
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="admin-btn text-xs py-2 px-3.5 cursor-pointer"
                      >
                        Reply on WhatsApp
                      </a>

                      {inq.status === "pending_review" && (
                        <button
                          onClick={() =>
                            handleUpdateInquiryStatus(inq.id, "contacted")
                          }
                          className="admin-btn admin-btn-quiet text-xs py-2 px-3.5 cursor-pointer"
                        >
                          Mark contacted
                        </button>
                      )}

                      {inq.status !== "resolved" && (
                        <button
                          onClick={() =>
                            handleUpdateInquiryStatus(inq.id, "resolved")
                          }
                          className="admin-btn admin-btn-primary text-xs py-2 px-4 cursor-pointer"
                        >
                          Resolve &amp; close
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
