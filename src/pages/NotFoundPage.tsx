import React from "react";
import { Link } from "../components/ui/Link";
import { Compass, ArrowLeft } from "lucide-react";

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-4 space-y-4">
      <div className="w-16 h-16 rounded-full bg-[#35160e] text-[#e3a157] border border-[#dab38c]/25 flex items-center justify-center">
        <Compass className="w-8 h-8" />
      </div>
      <h1 className="font-display font-bold text-3xl text-[#f5edeb]">
        404 — Shore Not Found
      </h1>
      <p className="text-xs sm:text-sm text-[#dab38c] max-w-sm">
        The page you navigated to doesn't exist on MatsyaMart or has shifted
        with the tide.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#e3a157] hover:bg-[#dab38c] text-[#29100b] rounded-xl text-xs font-bold shadow-md transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Catalog</span>
      </Link>
    </div>
  );
};
