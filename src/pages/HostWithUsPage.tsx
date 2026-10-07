import React, { useState } from "react";
import { Link } from "../components/ui/Link";
import { useData } from "../context/DataContext";
import { ListingType } from "../types";
import { CheckCircle2, ArrowRight, Send } from "lucide-react";

export const HostWithUsPage: React.FC = () => {
  const { addProposal } = useData();

  const [applicantName, setApplicantName] = useState("");
  const [phone, setPhone] = useState("");
  const [proposalCategory, setProposalCategory] = useState<
    "goods" | "food" | "walks" | "workshops"
  >("goods");
  const [summary, setSummary] = useState("");

  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantName.trim() || !phone.trim() || !summary.trim()) return;

    const listingType: ListingType =
      proposalCategory === "goods" ? "product" : "experience";

    addProposal({
      applicant_name: applicantName,
      koliwada_or_village: "",
      phone,
      email: undefined,
      proposal_title: summary.slice(0, 60) || `${proposalCategory} offering`,
      proposal_type: listingType,
      summary: `[Category: ${proposalCategory.toUpperCase()}] ${summary}`,
      sample_photos: [],
    });

    setIsSubmitted(true);
  };

  const categories: {
    id: "goods" | "food" | "walks" | "workshops";
    label: string;
  }[] = [
    { id: "goods", label: "Goods" },
    { id: "food", label: "Food" },
    { id: "walks", label: "Walks" },
    { id: "workshops", label: "Workshops" },
  ];

  return (
    <div className="bg-[#29100b] text-[#f5edeb] min-h-screen py-16 px-4 sm:px-6 lg:px-8 selection:bg-[#e3a157] selection:text-[#29100b]">
      <div className="max-w-xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#35160e] text-[#dab38c] border border-[#dab38c]/30 text-xs font-medium">
            🐟 Koli Community Partnership
          </div>

          <h1 className="font-display font-bold text-3xl sm:text-4xl text-[#f5edeb] tracking-tight">
            Share Your Offering
          </h1>

          <p className="text-xs sm:text-sm text-[#dab38c] max-w-sm mx-auto leading-relaxed">
            Coastal artisan? Experience host? Tell us what you do — in one line.
          </p>
        </div>

        {/* Form Container */}
        <div className="bg-[#35160e]/90 border border-[#dab38c]/25 rounded-3xl p-6 sm:p-10 shadow-2xl">
          {isSubmitted ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <h2 className="font-display font-bold text-2xl text-[#f5edeb]">
                Received!
              </h2>

              <p className="text-xs sm:text-sm text-[#dab38c] max-w-md mx-auto leading-relaxed">
                Thank you, <strong>{applicantName}</strong>. Our team will reach
                out on WhatsApp within 48 hours.
              </p>

              <div className="pt-4">
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#f5edeb] text-[#29100b] font-bold text-xs hover:bg-[#dab38c] transition-colors"
                >
                  <span>Back to Catalog</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name */}
              <div>
                <label className="text-xs font-semibold text-[#dab38c] block mb-1.5">
                  Your Name *
                </label>
                <input
                  type="text"
                  required
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  placeholder="e.g. Ramesh Patil"
                  className="w-full px-3.5 py-2.5 bg-[#29100b]/70 border border-[#dab38c]/30 rounded-xl text-xs sm:text-sm text-[#f5edeb] placeholder:text-[#dab38c]/40 focus:outline-none focus:border-[#e3a157]"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="text-xs font-semibold text-[#dab38c] block mb-1.5">
                  WhatsApp Number *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 98201 44512"
                  className="w-full px-3.5 py-2.5 bg-[#29100b]/70 border border-[#dab38c]/30 rounded-xl text-xs sm:text-sm text-[#f5edeb] placeholder:text-[#dab38c]/40 focus:outline-none focus:border-[#e3a157]"
                />
              </div>

              {/* Category — Goods → Food → Walks → Workshops */}
              <div>
                <label className="text-xs font-semibold text-[#dab38c] block mb-2">
                  Category *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setProposalCategory(cat.id)}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        proposalCategory === cat.id
                          ? "bg-[#f5edeb] text-[#29100b] border-transparent font-bold"
                          : "bg-[#29100b]/70 text-[#dab38c] border-[#dab38c]/30 hover:bg-[#481f14]"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* What do you offer */}
              <div>
                <label className="text-xs font-semibold text-[#dab38c] block mb-1.5">
                  What do you want to offer? *
                </label>
                <textarea
                  required
                  rows={3}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Tell us what you do in a few words — walk, craft, food, or goods..."
                  className="w-full px-3.5 py-2.5 bg-[#29100b]/70 border border-[#dab38c]/30 rounded-xl text-xs sm:text-sm text-[#f5edeb] placeholder:text-[#dab38c]/40 focus:outline-none focus:border-[#e3a157] resize-none"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                className="w-full py-3.5 bg-[#e3a157] hover:bg-[#dab38c] text-[#29100b] font-bold text-xs sm:text-sm rounded-full transition-colors flex items-center justify-center gap-2 shadow-lg cursor-pointer"
              >
                <Send className="w-4 h-4 text-[#29100b]" />
                <span>Submit for Review</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
