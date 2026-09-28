import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { ListingType } from '../types';
import {
  Compass,
  Anchor,
  ShieldCheck,
  CheckCircle2,
  Users,
  Camera,
  Coins,
  MapPin,
  ArrowRight,
} from 'lucide-react';

export const HostWithUsPage: React.FC = () => {
  const { addProposal } = useData();

  const [applicantName, setApplicantName] = useState('');
  const [village, setVillage] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [proposalTitle, setProposalTitle] = useState('');
  const [proposalType, setProposalType] = useState<ListingType>('experience');
  const [summary, setSummary] = useState('');
  const [estimatedPrice, setEstimatedPrice] = useState('');
  const [samplePhoto, setSamplePhoto] = useState('');

  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applicantName || !village || !phone || !proposalTitle || !summary) return;

    addProposal({
      applicant_name: applicantName,
      koliwada_or_village: village,
      phone,
      email: email || undefined,
      proposal_title: proposalTitle,
      proposal_type: proposalType,
      summary,
      estimated_price_inr: estimatedPrice ? Number(estimatedPrice) : undefined,
      sample_photos: samplePhoto ? [samplePhoto] : [],
    });

    setIsSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      
      {/* Header & Manifesto */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-ocean-100 text-ocean-800 text-xs font-semibold">
          <Anchor className="w-3.5 h-3.5 text-ocean-700" />
          <span>Indigenous Host & Artisan Onboarding</span>
        </div>

        <h1 className="font-display font-bold text-3xl sm:text-4xl text-ocean-950">
          Share Your Heritage. Sell Your Catch. Host On Your Terms.
        </h1>

        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Are you a Koli elder, young boatman, artisan, or member of a Mahila Bachat Gat? MatsyaMart connects you directly to respectful urban travelers, students, and food enthusiasts with zero platform middlemen fees.
        </p>
      </div>

      {/* 3 Pillar Pledges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2">
          <div className="w-9 h-9 rounded-xl bg-ocean-100 text-ocean-800 flex items-center justify-center font-bold text-sm">
            100%
          </div>
          <h4 className="font-display font-bold text-sm text-slate-900">Direct Host Earnings</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            All ticket revenues and product sales transfer straight to your bank account without aggregators slicing your profit.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2">
          <div className="w-9 h-9 rounded-xl bg-sun-100 text-ocean-950 flex items-center justify-center font-bold text-sm">
            🛡️
          </div>
          <h4 className="font-display font-bold text-sm text-slate-900">Safety & Insurance Support</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Bhoomiputra Foundation provides verified guest waivers, life jackets, and attendee manifests for every tour.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs space-y-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
            🤝
          </div>
          <h4 className="font-display font-bold text-sm text-slate-900">Dignified Storytelling</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            You set the itinerary, dates, and maximum guest caps according to lunar tides and village customs.
          </p>
        </div>
      </div>

      {/* Submission Form or Success State */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-tactile p-6 sm:p-10">
        {isSubmitted ? (
          <div className="text-center py-10 space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="font-display font-bold text-2xl text-ocean-950">
              Proposal Received! Welcome to MatsyaMart.
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
              Thank you, <strong>{applicantName}</strong>. Your proposal for "<strong>{proposalTitle}</strong>" has been submitted to the Bhoomiputra coordinator team. A local coordinator will contact you on <strong>{phone}</strong> to arrange a community verification visit.
            </p>
            <div className="pt-4 flex justify-center gap-3">
              <Link
                to="/"
                className="px-5 py-2.5 bg-ocean-800 text-white rounded-xl text-xs font-semibold shadow-xs hover:bg-ocean-900 transition-colors"
              >
                Back to Catalog Home
              </Link>
              <button
                onClick={() => {
                  setIsSubmitted(false);
                  setProposalTitle('');
                  setSummary('');
                }}
                className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-200 transition-colors"
              >
                Submit Another Proposal
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="border-b border-slate-100 pb-4">
              <h3 className="font-display font-bold text-xl text-ocean-950">
                Submit Your Proposal
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Fill out this simple form in English, Marathi, or Hindi.
              </p>
            </div>

            {/* Step 1: Who are you */}
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                1. Host & Village Details
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Your Full Name / Collective Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Suresh Nakawa / Mahila Bachat Gat"
                    value={applicantName}
                    onChange={(e) => setApplicantName(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-ocean-600 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Koliwada / Village / Estuary Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Versova Koliwada, Worli, Airoli, Madh"
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-ocean-600 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    WhatsApp Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98200 00000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-ocean-600 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="yourname@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-ocean-600 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Step 2: What do you want to offer */}
            <div className="space-y-4 pt-4 border-t border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                2. Offering Overview
              </span>

              {/* Type Switcher */}
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Offering Category *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setProposalType('experience')}
                    className={`p-3 rounded-xl border text-left text-xs transition-all ${
                      proposalType === 'experience'
                        ? 'border-ocean-700 bg-ocean-50 text-ocean-950 font-bold ring-2 ring-ocean-600/20'
                        : 'border-slate-200 bg-white text-slate-700'
                    }`}
                  >
                    🧭 Coastal Tour / Experience
                    <span className="block text-[11px] font-normal text-slate-500 mt-0.5">
                      Walking trail, boat ride, net-weaving, food trail
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setProposalType('product')}
                    className={`p-3 rounded-xl border text-left text-xs transition-all ${
                      proposalType === 'product'
                        ? 'border-amber-600 bg-amber-50 text-amber-950 font-bold ring-2 ring-amber-600/20'
                        : 'border-slate-200 bg-white text-slate-700'
                    }`}
                  >
                    🐟 Artisan Good / Pantry
                    <span className="block text-[11px] font-normal text-slate-500 mt-0.5">
                      Sun-dried seafood, masalas, honey, boat crafts
                    </span>
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Proposed Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mahim Night Lantern Fishing Walk / Sun-Dried Bombil Pack"
                  value={proposalTitle}
                  onChange={(e) => setProposalTitle(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-ocean-600 outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Describe what guests will experience or receive *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Share details about the route, history, materials, preparation, and what makes it special to your village..."
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-ocean-600 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Estimated Desired Price (₹ per person / per pack)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g. 850"
                    value={estimatedPrice}
                    onChange={(e) => setEstimatedPrice(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-ocean-600 outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Sample Photo URL (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={samplePhoto}
                    onChange={(e) => setSamplePhoto(e.target.value)}
                    className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-ocean-600 outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                🔒 Free submission • No upfront listing fees
              </span>
              <button
                type="submit"
                className="px-6 py-3.5 bg-ocean-800 hover:bg-ocean-900 text-white rounded-xl text-xs font-semibold transition-all shadow-md flex items-center gap-2"
              >
                <span>Submit Proposal for Community Review</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}
      </div>

    </div>
  );
};
