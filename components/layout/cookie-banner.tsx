'use client';

import React, { useState, useEffect } from 'react';
import { Cookie, ShieldCheck, X, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [analyticsConsent, setAnalyticsConsent] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      const saved = localStorage.getItem('rps_cookie_consent');
      if (!saved) {
        setIsVisible(true);
      }
    }, 0);

    const handleOpenSettings = () => {
      setIsVisible(true);
      setShowPreferences(true);
    };

    window.addEventListener('rps-open-cookie-settings', handleOpenSettings);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('rps-open-cookie-settings', handleOpenSettings);
    };
  }, []);

  const handleAcceptAll = () => {
    localStorage.setItem(
      'rps_cookie_consent',
      JSON.stringify({ necessary: true, analytics: true, savedAt: new Date().toISOString() })
    );
    setIsVisible(false);
    setShowPreferences(false);
  };

  const handleNecessaryOnly = () => {
    localStorage.setItem(
      'rps_cookie_consent',
      JSON.stringify({ necessary: true, analytics: false, savedAt: new Date().toISOString() })
    );
    setIsVisible(false);
    setShowPreferences(false);
  };

  const handleSavePreferences = () => {
    localStorage.setItem(
      'rps_cookie_consent',
      JSON.stringify({ necessary: true, analytics: analyticsConsent, savedAt: new Date().toISOString() })
    );
    setIsVisible(false);
    setShowPreferences(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-lg z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="bg-[#0B172F]/95 backdrop-blur-md text-white rounded-2xl border border-[#142B55] shadow-2xl p-5 sm:p-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-amber-400 shrink-0">
              <Cookie className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Cookie &amp; Browsing Consent</h2>
              <span className="text-[11px] text-slate-400 block">RAJ POWER TECH SERVICES</span>
            </div>
          </div>
          <button
            type="button"
            onClick={handleNecessaryOnly}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            aria-label="Close cookie notice"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          We use essential browser cookies and local storage to preserve your shopping bag, save your delivery preferences, and ensure secure authentication. You can choose whether to enable anonymous performance telemetry.
        </p>

        {showPreferences && (
          <div className="bg-white/5 rounded-xl p-3.5 space-y-3 text-xs border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-white block">Strictly Necessary Cookies</span>
                <span className="text-[11px] text-slate-400">Required for cart, checkout, and session security.</span>
              </div>
              <span className="text-[11px] font-bold text-emerald-400">Always Active</span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <div>
                <span className="font-semibold text-white block">Performance &amp; Telemetry</span>
                <span className="text-[11px] text-slate-400">Helps us optimize platform loading speeds and responsiveness.</span>
              </div>
              <input
                type="checkbox"
                checked={analyticsConsent}
                onChange={(e) => setAnalyticsConsent(e.target.checked)}
                className="w-4 h-4 text-[#D52B30] rounded focus:ring-0 cursor-pointer"
              />
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <button
            type="button"
            onClick={() => setShowPreferences(!showPreferences)}
            className="text-xs text-slate-300 hover:text-white underline flex items-center gap-1 cursor-pointer"
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>{showPreferences ? 'Hide Options' : 'Customize'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleNecessaryOnly}
              className="text-xs px-3 py-1.5 rounded-lg border border-white/20 hover:bg-white/10 text-slate-200 transition-colors cursor-pointer"
            >
              Essential Only
            </button>

            {showPreferences ? (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleSavePreferences}
                className="bg-[#D52B30] hover:bg-[#b52226] text-white text-xs font-semibold"
              >
                Save Choices
              </Button>
            ) : (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={handleAcceptAll}
                className="bg-[#D52B30] hover:bg-[#b52226] text-white text-xs font-semibold"
              >
                Accept All
              </Button>
            )}
          </div>
        </div>

        <div className="text-[10px] text-slate-400 flex items-center gap-1.5 border-t border-white/10 pt-2">
          <ShieldCheck className="w-3 h-3 text-emerald-400" />
          <span>You can update your cookie choices at any time via the footer link.</span>
        </div>
      </div>
    </div>
  );
}
