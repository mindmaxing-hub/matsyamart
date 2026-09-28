import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Menu, X, Compass, Anchor, ShieldCheck } from 'lucide-react';
import { useCart } from '../../context/CartContext';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { totalItemsCount, setIsCartOpen } = useCart();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <>
      {/* Top Indigenous Stewardship Banner */}
      <div className="bg-ocean-950 text-white text-[11px] py-1.5 px-4 tracking-wide font-medium border-b border-ocean-800">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-sun-300 animate-pulse"></span>
            <span>Direct Community Revenue — 100% of tour fees & goods payouts go directly to Koli hosts & women's collectives</span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-ocean-200">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-sun-300" />
              Verified Koliwada Guides
            </span>
            <span className="text-ocean-500">|</span>
            <a href="https://bhoomiputra.org" target="_blank" rel="noreferrer" className="hover:text-sun-300 transition-colors">
              Bhoomiputra Foundation ↗
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Brand Identity */}
          <Link to="/" className="flex items-center gap-3.5 group">
            {/* Origami Chevron Logo Mark */}
            <div className="w-11 h-11 rounded-xl bg-ocean-900 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform overflow-hidden relative border border-ocean-700">
              <div className="absolute inset-0 bg-gradient-to-tr from-ocean-900 via-ocean-800 to-ocean-600 opacity-90"></div>
              <Anchor className="w-6 h-6 text-sun-300 relative z-10 stroke-[2.2]" />
            </div>
            
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-2xl text-ocean-900 tracking-tight">
                  Matsya<span className="text-ocean-600">Mart</span>
                </span>
                <span className="hidden md:inline-flex text-[10px] font-semibold uppercase tracking-wider bg-ocean-100 text-ocean-800 px-2 py-0.5 rounded-full border border-ocean-200">
                  Coastal Goods & Trails
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-medium tracking-tight">
                A Bhoomiputra Community Initiative
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className={`text-sm font-medium transition-colors ${
                isActive('/') ? 'text-ocean-900 font-semibold' : 'text-slate-600 hover:text-ocean-800'
              }`}
            >
              Explore Experiences
            </Link>
            
            <a
              href="/#artisan-goods"
              className="text-sm font-medium text-slate-600 hover:text-ocean-800 transition-colors"
            >
              Artisan Goods
            </a>

            <Link
              to="/host-with-us"
              className={`text-sm font-medium flex items-center gap-1.5 transition-colors ${
                isActive('/host-with-us')
                  ? 'text-ocean-900 font-semibold'
                  : 'text-slate-600 hover:text-ocean-800'
              }`}
            >
              <Compass className="w-4 h-4 text-ocean-600" />
              Host With Us
            </Link>

            <Link
              to="/admin"
              className={`text-xs uppercase tracking-wider font-semibold px-2.5 py-1 rounded-md transition-colors ${
                isActive('/admin')
                  ? 'bg-ocean-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Admin Portal
            </Link>
          </nav>

          {/* Action Area: Cart & Mobile Toggle */}
          <div className="flex items-center gap-3">
            {/* Bag Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 rounded-xl border border-slate-200/80 bg-slate-50 hover:bg-slate-100 text-ocean-900 transition-colors flex items-center justify-center shadow-xs"
              aria-label="View Cart"
            >
              <ShoppingBag className="w-5 h-5 text-ocean-800" />
              {totalItemsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-sun-300 text-ocean-950 font-bold text-xs rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                  {totalItemsCount}
                </span>
              )}
            </button>

            {/* Mobile Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Mobile Flyout Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-4 pb-6 space-y-3 shadow-lg">
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-base font-medium text-slate-800 hover:bg-ocean-50"
            >
              Explore Experiences & Tours
            </Link>
            <a
              href="/#artisan-goods"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-base font-medium text-slate-800 hover:bg-ocean-50"
            >
              Artisanal Goods & Masalas
            </a>
            <Link
              to="/host-with-us"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-base font-medium text-ocean-800 hover:bg-ocean-50"
            >
              Host With Us (Community Proposal)
            </Link>
            <div className="pt-2 border-t border-slate-100">
              <Link
                to="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-xs uppercase font-semibold text-slate-600 bg-slate-100"
              >
                Coordinator & Admin Dashboard
              </Link>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
