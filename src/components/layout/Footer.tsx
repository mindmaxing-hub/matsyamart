import React from 'react';
import { Link } from 'react-router-dom';
import { Anchor, Heart, Shield, Waves, MapPin, Mail, Phone } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-ocean-950 text-slate-300 pt-16 pb-12 border-t border-ocean-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-ocean-800/80">
          
          {/* Col 1: Mission & Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-ocean-800 flex items-center justify-center border border-ocean-700">
                <Anchor className="w-5 h-5 text-sun-300" />
              </div>
              <span className="font-display font-bold text-2xl text-white tracking-tight">
                Matsya<span className="text-ocean-400">Mart</span>
              </span>
            </div>
            <p className="text-xs text-ocean-200 leading-relaxed">
              Dedicated experiential tourism and indigenous artisan marketplace supporting Koliwadas, Gaothans, and mangrove guardians along the Konkan coastline.
            </p>
            <div className="pt-2 text-xs text-sun-300 font-medium flex items-center gap-2">
              <Shield className="w-4 h-4 text-sun-300 shrink-0" />
              <span>100% Direct Community Revenue Model</span>
            </div>
          </div>

          {/* Col 2: Coastal Hubs */}
          <div className="space-y-3">
            <h3 className="font-display font-semibold text-white text-sm uppercase tracking-wider">
              Coastal Hubs & Koliwadas
            </h3>
            <ul className="space-y-2 text-xs text-ocean-200">
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-sun-300" />
                Versova & Madh Island Koliwadas
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-sun-300" />
                Worli & Mahim Historic Seafronts
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-sun-300" />
                Sassoon Docks & Colaba Harbor
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-sun-300" />
                Thane Creek & Airoli Mangrove Estuaries
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-sun-300" />
                Uran, Dharamtar & Alibaug Coast
              </li>
            </ul>
          </div>

          {/* Col 3: Quick Navigation */}
          <div className="space-y-3">
            <h3 className="font-display font-semibold text-white text-sm uppercase tracking-wider">
              Platform & Community
            </h3>
            <ul className="space-y-2 text-xs text-ocean-200">
              <li>
                <Link to="/" className="hover:text-sun-300 transition-colors">
                  All Coastal Experiences
                </Link>
              </li>
              <li>
                <a href="/#artisan-goods" className="hover:text-sun-300 transition-colors">
                  Artisanal Pantry & Sun-Dried Seafood
                </a>
              </li>
              <li>
                <Link to="/host-with-us" className="hover:text-sun-300 transition-colors">
                  List Your Craft or Tour (Host With Us)
                </Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-sun-300 transition-colors">
                  Host & Manifest Management Portal
                </Link>
              </li>
              <li>
                <a href="https://bhoomiputra.org" target="_blank" rel="noreferrer" className="hover:text-sun-300 transition-colors">
                  Bhoomiputra Foundation Main Site ↗
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Community Trust & Contact */}
          <div className="space-y-3">
            <h3 className="font-display font-semibold text-white text-sm uppercase tracking-wider">
              Emergency & Inquiries
            </h3>
            <div className="space-y-2.5 text-xs text-ocean-200">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-sun-300 shrink-0" />
                <span>+91 98201 44512 (Host Desk WhatsApp)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-sun-300 shrink-0" />
                <span>coordinator@bhoomiputra.org</span>
              </div>
              <div className="pt-2 text-[11px] text-ocean-300 border-t border-ocean-800/80 leading-relaxed">
                Tours are strictly community-led and weather dependent according to the lunar tidal calendar.
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-ocean-400 gap-4">
          <div className="flex items-center gap-1.5">
            <span>© {new Date().getFullYear()} MatsyaMart. Powered by</span>
            <span className="text-white font-medium">Bhoomiputra Foundation</span>
            <span>• Built with</span>
            <Heart className="w-3.5 h-3.5 text-rose-400 inline" />
            <span>for coastal indigenous communities</span>
          </div>

          <div className="flex items-center gap-4 text-ocean-300">
            <span className="hover:text-white cursor-pointer">Ethical Tourism Charter</span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer">Cancellation & Weather Policy</span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer">Bachat Gat Fair Wage Pledge</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
