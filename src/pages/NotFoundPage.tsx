import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-4 space-y-4">
      <div className="w-16 h-16 rounded-full bg-ocean-50 text-ocean-800 flex items-center justify-center">
        <Compass className="w-8 h-8" />
      </div>
      <h1 className="font-display font-bold text-3xl text-ocean-950">
        404 — Shore Not Found
      </h1>
      <p className="text-xs sm:text-sm text-slate-500 max-w-sm">
        The page you navigated to doesn't exist on MatsyaMart or has shifted with the tide.
      </p>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-ocean-800 hover:bg-ocean-900 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Catalog</span>
      </Link>
    </div>
  );
};
