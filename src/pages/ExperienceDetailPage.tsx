import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { SlotBookingSheet } from '../components/experience/SlotBookingSheet';
import { ItineraryTimeline } from '../components/experience/ItineraryTimeline';
import { HostProfileCard } from '../components/experience/HostProfileCard';
import {
  ArrowLeft,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Camera,
  Utensils,
  Backpack,
} from 'lucide-react';
import { formatDuration } from '../lib/utils';

export const ExperienceDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { getListingBySlug, getSlotsByListingId } = useData();

  const listing = slug ? getListingBySlug(slug) : undefined;
  const slots = listing ? getSlotsByListingId(listing.id) : [];

  const [activeImageIdx, setActiveImageIdx] = useState(0);

  if (!listing) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="font-display font-bold text-2xl text-slate-800">Experience Not Found</h2>
        <p className="text-xs text-slate-500">The coastal tour you are looking for may have concluded or been relocated.</p>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-ocean-800 text-white rounded-xl text-xs font-semibold"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Return to Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Breadcrumb & Back Link */}
      <div>
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-ocean-700 hover:text-ocean-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to All Experiences
        </Link>
      </div>

      {/* Main Experience Header */}
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase bg-ocean-100 text-ocean-800">
            Coastal Experience
          </span>
          <span className="flex items-center gap-1 text-xs font-medium text-slate-500">
            <MapPin className="w-3.5 h-3.5 text-ocean-700" />
            {listing.location_name}
          </span>
          <span className="text-slate-300">•</span>
          <span className="flex items-center gap-1 text-xs font-medium text-slate-500">
            <Clock className="w-3.5 h-3.5 text-ocean-700" />
            {formatDuration(listing.duration_minutes)}
          </span>
        </div>

        <h1 className="font-display font-bold text-2xl sm:text-4xl text-ocean-950 leading-tight">
          {listing.title}
        </h1>

        <p className="text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed">
          {listing.short_summary}
        </p>
      </div>

      {/* Photo Gallery Grid */}
      <div className="space-y-3">
        <div className="aspect-[16/9] sm:aspect-[21/9] w-full rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 shadow-xs relative">
          <img
            src={listing.images[activeImageIdx] || listing.images[0]}
            alt={listing.title}
            className="w-full h-full object-cover transition-all duration-300"
          />
          <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white text-[11px] px-3 py-1 rounded-full flex items-center gap-1.5">
            <Camera className="w-3.5 h-3.5 text-sun-300" />
            <span>Photo courtesy of {listing.host_name}</span>
          </div>
        </div>

        {/* Thumbnail Selector */}
        {listing.images.length > 1 && (
          <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
            {listing.images.map((img, idx) => (
              <button
                key={idx}
                onClick={() => setActiveImageIdx(idx)}
                className={`w-20 h-14 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                  activeImageIdx === idx ? 'border-ocean-600 ring-2 ring-ocean-600/30' : 'border-transparent opacity-70 hover:opacity-100'
                }`}
              >
                <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start pt-4">
        
        {/* Left Column: Full Narrative, Timeline, Host (7 Cols) */}
        <div className="lg:col-span-7 space-y-10">
          
          {/* Host Card */}
          <HostProfileCard listing={listing} />

          {/* Full Narrative */}
          <div className="space-y-4">
            <h3 className="font-display font-bold text-xl text-ocean-950">
              About This Experience & Coastal Tradition
            </h3>
            <div className="prose prose-slate text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {listing.full_description}
            </div>
          </div>

          {/* Itinerary Timeline */}
          {listing.itinerary && <ItineraryTimeline itinerary={listing.itinerary} />}

          {/* What's Included */}
          {listing.included_items && listing.included_items.length > 0 && (
            <div className="space-y-3 bg-slate-50 border border-slate-200/80 rounded-3xl p-6">
              <h4 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
                <Utensils className="w-4 h-4 text-emerald-600" />
                <span>What's Included in Your Pass</span>
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-700">
                {listing.included_items.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Things to Carry */}
          {listing.things_to_carry && listing.things_to_carry.length > 0 && (
            <div className="space-y-3 bg-ocean-50/50 border border-ocean-100 rounded-3xl p-6">
              <h4 className="font-display font-bold text-base text-slate-900 flex items-center gap-2">
                <Backpack className="w-4 h-4 text-ocean-700" />
                <span>Essential Things to Carry</span>
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs text-slate-700">
                {listing.things_to_carry.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-ocean-600 shrink-0 mt-1.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

        </div>

        {/* Right Column: Sticky Slot Booking Sheet (5 Cols) */}
        <div className="lg:col-span-5 sticky top-28 space-y-4">
          <SlotBookingSheet listing={listing} slots={slots} />

          {/* Host Direct Revenue Guarantee */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-500 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-slate-700">
              <ShieldCheck className="w-4 h-4 text-sun-300" />
              <span>Bhoomiputra Direct Payouts Guarantee</span>
            </div>
            <p className="text-[11px] leading-relaxed">
              Ticket payments go directly into community accounts. If a tidal boat tour is cancelled due to adverse weather or marine warnings, 100% refund or free date rescheduling is provided instantly.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};
