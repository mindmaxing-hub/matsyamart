import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { ManifestTable } from '../components/admin/ManifestTable';
import { SlotManager } from '../components/admin/SlotManager';
import { ProposalQueue } from '../components/admin/ProposalQueue';
import {
  ShieldCheck,
  Users,
  Calendar,
  Layers,
  Lock,
  Unlock,
  KeyRound,
  ArrowRight,
} from 'lucide-react';

export const AdminPage: React.FC = () => {
  const { orders, listings, slots, proposals } = useData();

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('matsya_admin_auth') === 'true';
  });

  const [passcode, setPasscode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'manifest' | 'slots' | 'proposals'>('manifest');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode.trim() === 'matsya2026' || passcode.trim() === 'admin') {
      setIsAuthenticated(true);
      sessionStorage.setItem('matsya_admin_auth', 'true');
      setErrorMsg('');
    } else {
      setErrorMsg('Invalid coordinator passcode. (Default demo pass: matsya2026)');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('matsya_admin_auth');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-modal w-full max-w-md p-8 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-ocean-900 text-sun-300 flex items-center justify-center mx-auto shadow-md">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="font-display font-bold text-2xl text-ocean-950">
              Coordinator Portal
            </h2>
            <p className="text-xs text-slate-500">
              Restricted to Bhoomiputra Foundation community leaders & verified tour guides.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                Enter Coordinator Passcode
              </label>
              <div className="relative">
                <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="Enter passcode..."
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className="w-full text-xs pl-9 pr-3 py-3 rounded-xl border border-slate-200 focus:border-ocean-600 outline-none"
                />
              </div>
            </div>

            {errorMsg && (
              <p className="text-xs text-rose-600 font-medium">{errorMsg}</p>
            )}

            <button
              type="submit"
              className="w-full py-3 bg-ocean-800 hover:bg-ocean-900 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <span>Unlock Admin Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => {
                setPasscode('matsya2026');
                setIsAuthenticated(true);
                sessionStorage.setItem('matsya_admin_auth', 'true');
              }}
              className="w-full text-center text-[11px] text-ocean-700 hover:underline pt-1"
            >
              ⚡ Quick Demo Login (matsya2026)
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider bg-ocean-100 text-ocean-800 px-2.5 py-0.5 rounded-full">
              Foundation Ops
            </span>
            <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> Super Admin Access
            </span>
          </div>

          <h1 className="font-display font-bold text-2xl sm:text-3xl text-ocean-950 mt-1">
            Community Manifest & Capacity Control
          </h1>
        </div>

        <button
          onClick={handleLogout}
          className="self-start sm:self-auto px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
        >
          Sign Out
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('manifest')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'manifest'
              ? 'bg-ocean-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Live Attendee Manifest ({orders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('slots')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'slots'
              ? 'bg-ocean-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Slot & Capacity Manager ({slots.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('proposals')}
          className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'proposals'
              ? 'bg-ocean-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Vendor Proposals Queue ({proposals.length})</span>
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'manifest' && <ManifestTable orders={orders} listings={listings} />}
      {activeTab === 'slots' && <SlotManager slots={slots} listings={listings} />}
      {activeTab === 'proposals' && <ProposalQueue proposals={proposals} />}

    </div>
  );
};
