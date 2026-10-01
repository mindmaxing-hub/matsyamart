import React, { useState } from "react";
import { Link } from "../components/ui/Link";
import { useData } from "../context/DataContext";
import { ListingType } from "../types";
import {
  Compass,
  CheckCircle2,
  Users,
  ArrowRight,
  ShieldCheck,
  Send,
} from "lucide-react";

export const HostWithUsPage: React.FC = () => {
  const { addProposal } = useData();

  const [applicantName, setApplicantName] = useState("");
  const [village, setVillage] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [proposalTitle, setProposalTitle] = useState("");
  const [proposalCategory, setProposalCategory] = useState<
    "walks" | "workshops" | "food" | "goods"
  >("walks");
  const [summary, setSummary] = useState("");
  const [samplePhoto, setSamplePhoto] = useState("");

  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantName || !village || !phone || !proposalTitle || !summary)
      return;

    const listingType: ListingType =
      proposalCategory === "goods" ? "product" : "experience";

    addProposal({
      applicant_name: applicantName,
      koliwada_or_village: village,
      phone,
      email: email || undefined,
      proposal_title: proposalTitle,
      proposal_type: listingType,
      summary: `[Category: ${proposalCategory.toUpperCase()}] ${summary}`,
      sample_photos: samplePhoto ? [samplePhoto] : [],
    });

    setIsSubmitted(true);
  };

  return (
    <div className="bg-[#29100b] text-[#f5edeb] min-h-screen py-16 px-4 sm:px-6 lg:px-8 selection:bg-[#e3a157] selection:text-[#29100b]">
      <div className="max-w-3xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#35160e] text-[#e3a157] border border-[#dab38c]/30 text-xs font-semibold">
            <span>Community Partnership</span>
          </div>

          <h1 className="font-display font-bold text-3xl sm:text-5xl text-[#f5edeb] tracking-tight">
            Partner With Us
          </h1>

          <p className="text-xs sm:text-sm text-[#dab38c] max-w-xl mx-auto leading-relaxed">
            Do you lead a coastal walk, boat tour, traditional craft workshop,
            or make authentic artisan foods? Submit your idea to our curation
            team.
          </p>
        </div>

        {/* 3 Clear Operating Principles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl bg-[#35160e]/85 border border-[#dab38c]/25 shadow-md space-y-2">
            <div className="w-9 h-9 rounded-xl bg-[#481f14] text-[#e3a157] flex items-center justify-center font-bold text-sm border border-[#e3a157]/30">
              <Compass className="w-4 h-4" />
            </div>
            <h4 className="font-display font-bold text-sm text-[#f5edeb]">
              Curated by Us
            </h4>
            <p className="text-xs text-[#dab38c] leading-relaxed">
              Our team visits your village or dock, helps structure the
              itinerary, and ensures guest safety.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#35160e]/85 border border-[#dab38c]/25 shadow-md space-y-2">
            <div className="w-9 h-9 rounded-xl bg-[#481f14] text-[#e3a157] flex items-center justify-center font-bold text-sm border border-[#e3a157]/30">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h4 className="font-display font-bold text-sm text-[#f5edeb]">
              We Manage Logistics
            </h4>
            <p className="text-xs text-[#dab38c] leading-relaxed">
              From online ticketing and attendee check-ins to customer support,
              we manage all operations.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-[#35160e]/85 border border-[#dab38c]/25 shadow-md space-y-2">
            <div className="w-9 h-9 rounded-xl bg-[#481f14] text-[#e3a157] flex items-center justify-center font-bold text-sm border border-[#e3a157]/30">
              <Users className="w-4 h-4" />
            </div>
            <h4 className="font-display font-bold text-sm text-[#f5edeb]">
              Fair Community Revenue
            </h4>
            <p className="text-xs text-[#dab38c] leading-relaxed">
              Transparent, reliable payouts directly supporting local coastal
              families and self-help groups.
            </p>
          </div>
        </div>

        {/* Form Container */}
        <div className="bg-[#35160e]/90 border border-[#dab38c]/25 rounded-3xl p-6 sm:p-10 shadow-2xl">
          {isSubmitted ? (
            <div className="py-12 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/30">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <h2 className="font-display font-bold text-2xl text-[#f5edeb]">
                Submission Received!
              </h2>

              <p className="text-xs sm:text-sm text-[#dab38c] max-w-md mx-auto leading-relaxed">
                Thank you, <strong>{applicantName}</strong>. Our community team
                will review your submission and contact you on WhatsApp within
                48 hours to discuss itinerary planning.
              </p>

              <div className="pt-4">
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#f5edeb] text-[#29100b] font-bold text-xs hover:bg-[#dab38c] transition-colors"
                >
                  <span>Return to Catalog</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="border-b border-[#dab38c]/15 pb-4">
                <h3 className="font-display font-bold text-lg text-[#f5edeb]">
                  Submit an Experience or Craft Proposal
                </h3>
                <p className="text-xs text-[#dab38c]">
                  Fill in the details below. We do not require complicated
                  paperwork to get started.
                </p>
              </div>

              {/* Personal Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#dab38c] block mb-1.5">
                    Your Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    placeholder="e.g. Ramesh Patil / Shakuntala Devi"
                    className="w-full px-3.5 py-2.5 bg-[#29100b]/70 border border-[#dab38c]/30 rounded-xl text-xs sm:text-sm text-[#f5edeb] placeholder:text-[#dab38c]/40 focus:outline-none focus:border-[#e3a157]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#dab38c] block mb-1.5">
                    Coastal Village / Location *
                  </label>
                  <input
                    type="text"
                    required
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    placeholder="e.g. Versova, Worli, Madh Island, Alibaug"
                    className="w-full px-3.5 py-2.5 bg-[#29100b]/70 border border-[#dab38c]/30 rounded-xl text-xs sm:text-sm text-[#f5edeb] placeholder:text-[#dab38c]/40 focus:outline-none focus:border-[#e3a157]"
                  />
                </div>
              </div>

              {/* Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#dab38c] block mb-1.5">
                    WhatsApp Phone Number *
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

                <div>
                  <label className="text-xs font-semibold text-[#dab38c] block mb-1.5">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. contact@example.com"
                    className="w-full px-3.5 py-2.5 bg-[#29100b]/70 border border-[#dab38c]/30 rounded-xl text-xs sm:text-sm text-[#f5edeb] placeholder:text-[#dab38c]/40 focus:outline-none focus:border-[#e3a157]"
                  />
                </div>
              </div>

              {/* Pillar Selector */}
              <div>
                <label className="text-xs font-semibold text-[#dab38c] block mb-2">
                  What type of offering is this? *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setProposalCategory("walks")}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      proposalCategory === "walks"
                        ? "bg-[#f5edeb] text-[#29100b] border-transparent font-bold"
                        : "bg-[#29100b]/70 text-[#dab38c] border-[#dab38c]/30 hover:bg-[#481f14]"
                    }`}
                  >
                    🚶 Walks
                  </button>

                  <button
                    type="button"
                    onClick={() => setProposalCategory("workshops")}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      proposalCategory === "workshops"
                        ? "bg-[#f5edeb] text-[#29100b] border-transparent font-bold"
                        : "bg-[#29100b]/70 text-[#dab38c] border-[#dab38c]/30 hover:bg-[#481f14]"
                    }`}
                  >
                    🛠️ Workshops
                  </button>

                  <button
                    type="button"
                    onClick={() => setProposalCategory("food")}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      proposalCategory === "food"
                        ? "bg-[#f5edeb] text-[#29100b] border-transparent font-bold"
                        : "bg-[#29100b]/70 text-[#dab38c] border-[#dab38c]/30 hover:bg-[#481f14]"
                    }`}
                  >
                    🍲 Food
                  </button>

                  <button
                    type="button"
                    onClick={() => setProposalCategory("goods")}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                      proposalCategory === "goods"
                        ? "bg-[#f5edeb] text-[#29100b] border-transparent font-bold"
                        : "bg-[#29100b]/70 text-[#dab38c] border-[#dab38c]/30 hover:bg-[#481f14]"
                    }`}
                  >
                    🧺 Goods
                  </button>
                </div>
              </div>

              {/* Title of Offering */}
              <div>
                <label className="text-xs font-semibold text-[#dab38c] block mb-1.5">
                  Title or Name of the Offering *
                </label>
                <input
                  type="text"
                  required
                  value={proposalTitle}
                  onChange={(e) => setProposalTitle(e.target.value)}
                  placeholder="e.g. Dawn Fish Harbor Walk / Bamboo Net Weaving Class / Sun-Dried Prawns"
                  className="w-full px-3.5 py-2.5 bg-[#29100b]/70 border border-[#dab38c]/30 rounded-xl text-xs sm:text-sm text-[#f5edeb] placeholder:text-[#dab38c]/40 focus:outline-none focus:border-[#e3a157]"
                />
              </div>

              {/* Summary Description */}
              <div>
                <label className="text-xs font-semibold text-[#dab38c] block mb-1.5">
                  Brief Description & Story *
                </label>
                <textarea
                  required
                  rows={3}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Tell us what guests will experience, what craft you practice, or what makes your offering special..."
                  className="w-full px-3.5 py-2.5 bg-[#29100b]/70 border border-[#dab38c]/30 rounded-xl text-xs sm:text-sm text-[#f5edeb] placeholder:text-[#dab38c]/40 focus:outline-none focus:border-[#e3a157] resize-none"
                />
              </div>

              {/* Photo Link (Optional) */}
              <div>
                <label className="text-xs font-semibold text-[#dab38c] block mb-1.5">
                  Sample Photo URL or Instagram Handle (Optional)
                </label>
                <input
                  type="text"
                  value={samplePhoto}
                  onChange={(e) => setSamplePhoto(e.target.value)}
                  placeholder="e.g. https://... or @coastal_artisans"
                  className="w-full px-3.5 py-2.5 bg-[#29100b]/70 border border-[#dab38c]/30 rounded-xl text-xs sm:text-sm text-[#f5edeb] placeholder:text-[#dab38c]/40 focus:outline-none focus:border-[#e3a157]"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#e3a157] hover:bg-[#dab38c] text-[#29100b] font-bold text-xs sm:text-sm rounded-full transition-colors flex items-center justify-center gap-2 shadow-lg cursor-pointer"
                >
                  <Send className="w-4 h-4 text-[#29100b]" />
                  <span>Submit for Review</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
