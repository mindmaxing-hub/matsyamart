import React, { useState } from "react";
import { Check, X, Phone, Mail, MapPin, Tag, AlertCircle } from "lucide-react";
import { CommunityVendorProposal } from "../../types";
import { useData } from "../../context/DataContext";
import { formatINR } from "../../lib/utils";

interface ProposalQueueProps {
  proposals: CommunityVendorProposal[];
}

export const ProposalQueue: React.FC<ProposalQueueProps> = ({ proposals }) => {
  const { updateProposalStatus } = useData();
  const [adminNotes, setAdminNotes] = useState<Record<string, string>>({});

  const handleApprove = (id: string) => {
    updateProposalStatus(
      id,
      "approved",
      adminNotes[id] || "Approved by Bhoomiputra coordinator",
    );
  };

  const handleReject = (id: string) => {
    updateProposalStatus(
      id,
      "rejected",
      adminNotes[id] || "Rejected after review",
    );
  };

  return (
    <div className="space-y-4 text-[#f5edeb]">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display font-bold text-lg text-[#f5edeb]">
            Community Self-Listing Proposals Queue
          </h3>
          <p className="text-xs text-[#dab38c]/70">
            Proposals submitted by local boatmen, guides, and women's self-help
            groups (Bachat Gats).
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#35160e] text-[#e3a157] border border-[#dab38c]/25">
          {proposals.length} Submissions
        </span>
      </div>

      <div className="space-y-3.5">
        {proposals.length === 0 ? (
          <div className="p-8 text-center bg-[#29100b] rounded-2xl border border-[#dab38c]/20 text-[#dab38c]/60 text-xs">
            No community proposals currently awaiting moderation.
          </div>
        ) : (
          proposals.map((prop) => {
            const isPending = prop.status === "pending_review";
            const isApproved = prop.status === "approved";

            return (
              <div
                key={prop.id}
                className="bg-[#29100b] rounded-2xl border border-[#dab38c]/25 p-5 space-y-4 shadow-xl"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#dab38c]/15 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-display font-bold text-base text-[#f5edeb]">
                        {prop.proposal_title}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          prop.proposal_type === "experience"
                            ? "bg-[#35160e] text-[#e3a157] border border-[#dab38c]/25"
                            : "bg-[#35160e] text-[#dab38c] border border-[#dab38c]/25"
                        }`}
                      >
                        {prop.proposal_type}
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
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider self-start sm:self-auto ${
                      isApproved
                        ? "bg-emerald-950/60 text-emerald-300 border border-emerald-500/30"
                        : isPending
                          ? "bg-amber-950/60 text-amber-300 border border-amber-500/30"
                          : "bg-rose-950/60 text-rose-300 border border-rose-500/30"
                    }`}
                  >
                    {prop.status.replace("_", " ")}
                  </span>
                </div>

                <p className="text-xs text-[#dab38c] leading-relaxed">
                  {prop.summary}
                </p>

                {prop.estimated_price_inr && (
                  <div className="text-xs font-semibold text-[#dab38c]/80">
                    Proposed Pricing:{" "}
                    <span className="text-[#e3a157] font-display font-bold">
                      {formatINR(prop.estimated_price_inr)}
                    </span>
                  </div>
                )}

                {/* Moderation Controls */}
                {isPending && (
                  <div className="pt-3 border-t border-[#dab38c]/15 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <input
                      type="text"
                      placeholder="Add coordinator notes or site-visit date..."
                      value={adminNotes[prop.id] || ""}
                      onChange={(e) =>
                        setAdminNotes({
                          ...adminNotes,
                          [prop.id]: e.target.value,
                        })
                      }
                      className="w-full sm:w-80 text-xs p-2 bg-[#1f0b07] text-[#f5edeb] placeholder:text-[#dab38c]/40 border border-[#dab38c]/30 rounded-xl outline-none focus:border-[#e3a157]"
                    />

                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                      <button
                        onClick={() => handleReject(prop.id)}
                        className="px-3 py-1.5 rounded-xl border border-rose-500/30 bg-rose-950/40 text-rose-300 hover:bg-rose-900/50 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Decline</span>
                      </button>

                      <button
                        onClick={() => handleApprove(prop.id)}
                        className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 transition-colors shadow-xs cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve &amp; Schedule Onboarding</span>
                      </button>
                    </div>
                  </div>
                )}

                {prop.admin_notes && (
                  <div className="text-[11px] text-[#dab38c] bg-[#1f0b07] p-2 rounded-lg border border-[#dab38c]/20 flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 text-[#e3a157] shrink-0" />
                    <span>Admin Notes: {prop.admin_notes}</span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
