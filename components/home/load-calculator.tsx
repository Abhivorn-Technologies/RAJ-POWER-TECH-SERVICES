'use client';

import React, { useState } from 'react';
import {
  Fan,
  Lightbulb,
  Tv,
  Refrigerator,
  Monitor,
  Wind,
  Plus,
  Minus,
  BatteryCharging,
  Zap,
  Send,
  Cpu,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { buildWhatsAppInquiryUrl } from '@/lib/utils';

interface ApplianceConfig {
  id: string;
  name: string;
  watts: number;
  icon: React.ReactNode;
  defaultQty: number;
}

const APPLIANCES: ApplianceConfig[] = [
  { id: 'fans', name: 'Ceiling Fans (75W)', watts: 75, icon: <Fan className="w-5 h-5" />, defaultQty: 3 },
  { id: 'lights', name: 'LED Lights (15W)', watts: 15, icon: <Lightbulb className="w-5 h-5" />, defaultQty: 4 },
  { id: 'tv', name: 'Smart TV (120W)', watts: 120, icon: <Tv className="w-5 h-5" />, defaultQty: 1 },
  { id: 'fridge', name: 'Refrigerator (250W)', watts: 250, icon: <Refrigerator className="w-5 h-5" />, defaultQty: 1 },
  { id: 'pc', name: 'Workstation / PC (300W)', watts: 300, icon: <Monitor className="w-5 h-5" />, defaultQty: 0 },
  { id: 'ac', name: 'Inverter AC (1200W)', watts: 1200, icon: <Wind className="w-5 h-5" />, defaultQty: 0 },
];

export function LoadCalculatorSection() {
  const [quantities, setQuantities] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    APPLIANCES.forEach((a) => {
      init[a.id] = a.defaultQty;
    });
    return init;
  });

  const handleIncrement = (id: string) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.min(10, (prev[id] || 0) + 1),
    }));
  };

  const handleDecrement = (id: string) => {
    setQuantities((prev) => ({
      ...prev,
      [id]: Math.max(0, (prev[id] || 0) - 1),
    }));
  };

  // Compute Total Active Watts
  const totalWatts = APPLIANCES.reduce((sum, app) => {
    return sum + (quantities[app.id] || 0) * app.watts;
  }, 0);

  // Sizing recommendations
  let requiredVA = 900;
  let recommendedInverter = 'BPE 1100VA / Microtek 1150 Pure Sine Wave';
  let recommendedBattery = '150Ah Tall Tubular C10 Battery (12V single)';
  let estimatedHours = '5.0 - 6.5 Hours Standard';

  if (totalWatts <= 300) {
    requiredVA = 700;
    recommendedInverter = 'Microtek 700VA / BPE Smart Sine Wave';
    recommendedBattery = '100Ah - 120Ah Tall Tubular Battery';
    estimatedHours = '8.0 - 10.0 Hours Continuous';
  } else if (totalWatts <= 650) {
    requiredVA = 900;
    recommendedInverter = 'BPE 900VA / Microtek vTURBO Pure Sine Wave';
    recommendedBattery = '150Ah Tall Tubular C10 Battery (12V single)';
    estimatedHours = '5.5 - 7.0 Hours Standard';
  } else if (totalWatts <= 1100) {
    requiredVA = 1500;
    recommendedInverter = 'Microtek 1550 vTURBO / BPE 1.5kVA Sine Wave';
    recommendedBattery = '180Ah - 200Ah Tall Tubular C10 Battery';
    estimatedHours = '4.5 - 5.5 Hours Continuous';
  } else if (totalWatts <= 1800) {
    requiredVA = 2200;
    recommendedInverter = 'BPE 2kVA / Microtek 24V Pure Sine Wave Combo';
    recommendedBattery = '2x 150Ah Tubular Batteries (24V System)';
    estimatedHours = '4.0 - 5.0 Hours Heavy-Duty';
  } else {
    requiredVA = 3500;
    recommendedInverter = 'BPE 3kVA Online UPS / Microtek 3.5kVA Sine Wave';
    recommendedBattery = '2x - 4x 200Ah Tall Tubular Battery Bank (48V)';
    estimatedHours = '3.0 - 4.0 Hours High-Load';
  }

  const loadPercent = Math.min(100, Math.round((totalWatts / 2000) * 100));

  return (
    <section className="py-20 bg-white text-slate-900 relative overflow-hidden border-b border-slate-100">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-slate-100 border border-slate-200 text-[#142B55] mb-3">
            <Cpu className="w-3.5 h-3.5 text-[#D52B30]" />
            Intelligent Power Load &amp; Backup Sizer
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Size Your Inverter &amp; Battery System in Real Time
          </h2>
          <p className="mt-3 text-slate-600 text-sm sm:text-base leading-relaxed">
            Select the appliances you want to run simultaneously. Our engineering engine calculates the exact wattage, recommended sine wave inverter capacity, and tubular battery backup hours.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Appliance Selector Grid */}
          <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center justify-between">
              <span>Select Simultaneous Appliances</span>
              <span className="text-xs font-mono font-bold text-[#142B55] bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                {totalWatts} Watts Active
              </span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {APPLIANCES.map((app) => {
                const count = quantities[app.id] || 0;
                const isSelected = count > 0;
                return (
                  <div
                    key={app.id}
                    className={`p-3.5 rounded-2xl border transition-all duration-200 flex items-center justify-between ${
                      isSelected
                        ? 'bg-blue-50/40 border-[#142B55]/40 shadow-xs'
                        : 'bg-slate-50/70 border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                          isSelected
                            ? 'bg-[#142B55] text-white shadow-xs'
                            : 'bg-white border border-slate-200 text-slate-600'
                        }`}
                      >
                        {app.icon}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-900 block leading-tight">
                          {app.name}
                        </span>
                        <span className="text-[11px] font-mono text-slate-500">
                          {count * app.watts}W total
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleDecrement(app.id)}
                        disabled={count <= 0}
                        aria-label={`Decrease ${app.name}`}
                        className="w-7 h-7 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 flex items-center justify-center disabled:opacity-40 transition-colors cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-mono font-extrabold text-xs w-4 text-center text-slate-900">
                        {count}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleIncrement(app.id)}
                        aria-label={`Increase ${app.name}`}
                        className="w-7 h-7 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Live Power Computation Gauge */}
          <div className="lg:col-span-5 bg-slate-50/90 rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-md relative">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-5">
              <span className="text-xs uppercase font-mono font-bold tracking-wider text-[#142B55] flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-[#D52B30]" />
                Live Engineering Sizing
              </span>
              <span className="text-xs font-mono font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
                Certified Accurate
              </span>
            </div>

            {/* Total Wattage Dial Bar */}
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-600 font-semibold">Total Running Load:</span>
                <span className="text-lg font-black text-slate-900">{totalWatts} Watts</span>
              </div>

              <div className="w-full bg-slate-200 rounded-full h-3.5 p-0.5 border border-slate-300 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    loadPercent > 75
                      ? 'bg-gradient-to-r from-amber-500 to-red-600 shadow-sm'
                      : 'bg-gradient-to-r from-blue-600 to-cyan-500 shadow-sm'
                  }`}
                  style={{ width: `${Math.max(8, loadPercent)}%` }}
                />
              </div>

              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>0W</span>
                <span className="font-bold text-[#142B55]">Recommended: {requiredVA} VA</span>
                <span>2000W Max</span>
              </div>
            </div>

            {/* Recommended Combo Details */}
            <div className="space-y-3 mb-6 text-xs">
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
                <span className="text-[10px] font-mono text-slate-500 uppercase block font-semibold">
                  Recommended Inverter Model
                </span>
                <span className="text-sm font-extrabold text-[#142B55] block mt-0.5">
                  {recommendedInverter}
                </span>
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  Pure Sine Wave • 0ms Transfer Speed • Appliance Safe
                </span>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs">
                <span className="text-[10px] font-mono text-slate-500 uppercase block font-semibold">
                  Recommended Battery Bank
                </span>
                <span className="text-sm font-extrabold text-emerald-700 block mt-0.5">
                  {recommendedBattery}
                </span>
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  High-Cycle Deep Discharge • Low Maintenance Tubular
                </span>
              </div>

              <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono text-slate-500 uppercase block font-semibold">
                    Estimated Backup Duration
                  </span>
                  <span className="text-base font-black text-amber-700 mt-0.5 block">
                    {estimatedHours}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200/60">
                  <BatteryCharging className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Action WhatsApp Quote */}
            <a
              href={buildWhatsAppInquiryUrl(
                `${recommendedInverter} with ${recommendedBattery} (${totalWatts}W load)`,
                'Inverter & Battery Combo'
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full"
            >
              <Button
                size="lg"
                variant="primary"
                fullWidth
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 rounded-xl shadow-md shadow-emerald-600/20 text-xs sm:text-sm cursor-pointer"
                icon={<Send className="w-4 h-4 ml-1" />}
              >
                Request Quotation for This Combo
              </Button>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
