'use client';

import React from 'react';
import { 
  HardHat, 
  Building2, 
  UserCheck, 
  ShieldCheck, 
  Globe, 
  Wifi, 
  WifiOff, 
  Users, 
  UserPlus
} from 'lucide-react';
import { SiteRecord } from '@/lib/types';
import { translations, Language } from '@/lib/dictionary';

interface NavbarProps {
  currentRole: 'ADMIN' | 'LABOUR';
  setRole: (role: 'ADMIN' | 'LABOUR') => void;
  lang: Language;
  setLang: (lang: Language) => void;
  sites: SiteRecord[];
  selectedSiteId: string;
  setSelectedSiteId: (siteId: string) => void;
  isOnline: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  setRole,
  lang,
  setLang,
  sites,
  selectedSiteId,
  setSelectedSiteId,
  isOnline,
}) => {
  const t = translations[lang];

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Branding */}
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20">
              <HardHat className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-sky-400 via-indigo-300 to-white bg-clip-text text-transparent">
                  {t.appTitle}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                  v2.0 PWA
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                {t.appSubtitle}
              </p>
            </div>
          </div>

          {/* Site Selector & Controls */}
          <div className="flex items-center space-x-2 sm:space-x-4">
            
            {/* Site Dropdown */}
            {currentRole === 'ADMIN' && (
              <div className="relative hidden md:flex items-center">
                <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <select
                  value={selectedSiteId}
                  onChange={(e) => setSelectedSiteId(e.target.value)}
                  className="bg-slate-800 text-slate-200 text-sm pl-9 pr-4 py-1.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="ALL">{t.allSites}</option>
                  {sites.map((site) => (
                    <option key={site.id} value={site.id}>
                      {site.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Offline/Online PWA Indicator */}
            <div
              className={`flex items-center space-x-1.5 text-xs px-2.5 py-1 rounded-full border ${
                isOnline
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse'
              }`}
            >
              {isOnline ? (
                <>
                  <Wifi className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-3.5 w-3.5" />
                  <span>Offline Sync</span>
                </>
              )}
            </div>

            {/* Language Switcher */}
            <button
              onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
              className="flex items-center space-x-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              <Globe className="h-3.5 w-3.5 text-sky-400" />
              <span>{t.languageToggle}</span>
            </button>

            {/* Role Switcher Badge */}
            <div className="flex bg-slate-800 p-0.5 rounded-lg border border-slate-700">
              <button
                onClick={() => setRole('ADMIN')}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-medium transition ${
                  currentRole === 'ADMIN'
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Contractor</span>
              </button>
              <button
                onClick={() => setRole('LABOUR')}
                className={`flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-medium transition ${
                  currentRole === 'LABOUR'
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <UserCheck className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Labour</span>
              </button>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
