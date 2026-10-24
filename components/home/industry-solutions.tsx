'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HeartPulse,
  Server,
  Building2,
  Home,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Zap,
  Activity,
  Cpu,
  Layers,
  FileText,
} from 'lucide-react';
import { fadeUp, VIEWPORT_ONCE, PREMIUM_EASE } from '@/lib/animations';
import { Button } from '@/components/ui/button';

interface SectorSolution {
  id: string;
  name: string;
  shortName: string;
  tagline: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
  badgeBg: string;
  description: string;
  criticalNeeds: string[];
  recommendedEquipment: {
    title: string;
    brand: string;
    model: string;
    specs: string;
    image: string;
    link: string;
  };
  targetApplications: string[];
  quotePrompt: string;
}

const SECTOR_SOLUTIONS: SectorSolution[] = [
  {
    id: 'healthcare',
    name: 'Hospitals & Diagnostic Healthcare',
    shortName: 'Healthcare & Clinics',
    tagline: '0.00ms Zero-Transfer Isolation for Critical Care',
    icon: HeartPulse,
    accentColor: 'text-rose-600',
    badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
    description:
      'Continuous double-conversion power isolation protecting sensitive pathology analyzers, ultrasound diagnostics, ICU ventilators, and surgical equipment from lethal voltage transients and blackouts.',
    criticalNeeds: [
      '0.00ms Transfer Latency (True Online Double Conversion)',
      'Pure Galvanic Isolation & Surge Suppression',
      'Leak-Proof, Flame-Retardant AGM VRLA Storage',
      'Silent, Emissions-Free Indoor Deployment',
    ],
    recommendedEquipment: {
      title: 'Mission-Critical Medical Power Combo',
      brand: 'BPE & Exide',
      model: 'BPE True Online Double-Conversion UPS + Exide Powersafe Plus VRLA',
      specs: '1kVA - 20kVA Online • 0ms Latency • Flame Retardant ABS',
      image: '/products/bpe-online-ups-hq.png',
      link: '/shop?category=ups',
    },
    targetApplications: [
      'Diagnostic Ultrasound & MRI Racks',
      'Pathology Blood Gas Analyzers',
      'ICU Patient Monitors & Ventilators',
      'Surgical Lighting & Cold Storage',
    ],
    quotePrompt: 'Healthcare & Diagnostic Clinic Setup',
  },
  {
    id: 'datacenter',
    name: 'IT Infrastructure & Data Clusters',
    shortName: 'IT & Data Centers',
    tagline: 'Guaranteed Continuous Server & Network Uptime',
    icon: Server,
    accentColor: 'text-cyan-600',
    badgeBg: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    description:
      'High-frequency pure sinusoidal power conditioning engineered to prevent server reboot cycles, network switch crashes, and database corruption during utility fluctuations or generator synchronization.',
    criticalNeeds: [
      'Pure Sine Wave Output (THD < 2%) with Active PFC',
      'Instant High-Rate Discharge for Cyclic Load Pulses',
      'Patented Radgrid™ Plate Corrosion Resistance',
      'Wide Input Voltage Tolerance (110V - 300V AC)',
    ],
    recommendedEquipment: {
      title: 'High-Density Rack Server Power Stack',
      brand: 'BPE & Amaron Quanta',
      model: 'BPE MF Series Online UPS + Amaron Quanta Radgrid™ SMF VRLA',
      specs: '1kVA - 6kVA High Frequency • 0.9 Power Factor • High Rate HRD',
      image: '/products/amaron-quanta-clean.png',
      link: '/shop?brand=BPE',
    },
    targetApplications: [
      'Rack-Mounted Server Enclosures',
      'Core Router & Fiber Switch Racks',
      'Network Attached Storage (NAS/SAN)',
      'Telecom & Biometric Access Points',
    ],
    quotePrompt: 'IT Server Room & Data Rack Setup',
  },
  {
    id: 'commercial',
    name: 'Commercial, Retail & Banking',
    shortName: 'Commercial & Retail',
    tagline: 'Uninterrupted Point-of-Sale & Branch Continuity',
    icon: Building2,
    accentColor: 'text-amber-600',
    badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
    description:
      'Reliable, clean voltage backup protecting electronic billing terminals, CCTV surveillance storage, cash counters, and office workstation pods without interruption during localized grid outages.',
    criticalNeeds: [
      'Built-in Automatic Voltage Regulation (AVR Boost/Buck)',
      'Compact Footprint for Under-Counter Installation',
      'Cold-Start Capability for Instant Off-Grid Boot',
      'Zero-Maintenance Sealed Battery Architecture',
    ],
    recommendedEquipment: {
      title: 'Commercial Branch & Retail Protection Kit',
      brand: 'BPE & Microtek',
      model: 'BPE Line-Interactive AVR Series / Microtek Pure Sine Systems',
      specs: '650VA - 2kVA Workstation • Dual Surge Protected Outlets',
      image: '/products/bpe-bp-650-clean.png',
      link: '/shop?category=inverters',
    },
    targetApplications: [
      'POS Billing Counters & Barcode Scanners',
      'CCTV Surveillance NVR / DVR Racks',
      'ATM Lobbies & Currency Sorters',
      'Corporate Workstations & Wi-Fi Pods',
    ],
    quotePrompt: 'Commercial Retail / Office Billing Setup',
  },
  {
    id: 'residential',
    name: 'Luxury Villas & Residential Homes',
    shortName: 'Villas & Residential',
    tagline: 'Silent Pure Sine Power for Premium Living',
    icon: Home,
    accentColor: 'text-emerald-600',
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    description:
      'Microcontroller DSP-controlled smart hybrid inverters engineered with copper-wound transformers to seamlessly drive heavy motor inrush from refrigerators and smart entertainment without hum or flicker.',
    criticalNeeds: [
      'Heavy Motor Surge Tolerance (vTURBO Peak Current)',
      'High-Spine C10 Tall Tubular Deep-Discharge Longevity',
      'Smart Multi-Stage Microcontroller Charging',
      'Low Maintenance with Antimonial Lead Metallurgy',
    ],
    recommendedEquipment: {
      title: 'Heavy-Duty Residential Inverter & Battery Bank',
      brand: 'Microtek & Exide',
      model: 'Microtek Heavy Duty vTURBO 1550/2000 + Exide Tubular Battery',
      specs: '1250VA - 1850VA Pure Sine • 150Ah - 200Ah C10 Deep Cycle',
      image: '/products/microtek-vturbo-clean.png',
      link: '/shop?category=inverters',
    },
    targetApplications: [
      'Inverter Refrigerator & Microwave Loads',
      'Smart 4K OLED TVs & Soundbars',
      'Ceiling Fans & High-Efficiency LED Bulbs',
      'Home Office PC & Wi-Fi Routers',
    ],
    quotePrompt: 'Residential Villa Inverter & Battery Combo',
  },
];

export function IndustrySolutionsSection() {
  const [activeTab, setActiveTab] = useState<string>('healthcare');

  const currentSector = SECTOR_SOLUTIONS.find((s) => s.id === activeTab) || SECTOR_SOLUTIONS[0];
  const IconComponent = currentSector.icon;

  return (
    <section
      className="py-20 bg-white text-slate-900 border-b border-slate-100 relative overflow-hidden"
      aria-labelledby="industry-solutions-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={VIEWPORT_ONCE}
          className="text-center max-w-3xl mx-auto mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-mono font-bold tracking-wider uppercase bg-slate-100 border border-slate-200 text-[#142B55] mb-3">
            <Cpu className="w-3.5 h-3.5 text-[#D52B30]" />
            <span>Specialized Power Deployments</span>
          </div>
          <h2
            id="industry-solutions-heading"
            className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight"
          >
            Engineered Power Solutions by Industry &amp; Facility
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
            Different facilities require specific electrical wave topologies. We design and deliver calibrated equipment stacks tailored to healthcare, enterprise IT, commercial retail, and residential properties across Telangana and Andhra Pradesh.
          </p>
        </motion.div>

        {/* Sector Navigation Tabs */}
        <div className="flex items-center justify-start md:justify-center gap-2.5 overflow-x-auto pb-4 mb-10 scrollbar-none">
          {SECTOR_SOLUTIONS.map((sector) => {
            const isActive = sector.id === activeTab;
            const TabIcon = sector.icon;
            return (
              <button
                key={sector.id}
                type="button"
                onClick={() => setActiveTab(sector.id)}
                className={`relative px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 border select-none ${
                  isActive
                    ? 'bg-[#142B55] text-white border-[#142B55] shadow-md shadow-[#142B55]/20'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                }`}
              >
                <TabIcon className={`w-4 h-4 ${isActive ? 'text-cyan-300' : 'text-slate-500'}`} />
                <span>{sector.shortName}</span>
              </button>
            );
          })}
        </div>

        {/* Active Sector Showcase Container */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSector.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: PREMIUM_EASE }}
            className="bg-slate-50/70 rounded-3xl border border-slate-200/90 p-6 sm:p-10 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center"
          >
            {/* Left Column: Requirements & Sizing Parameters (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border mb-3 ${currentSector.badgeBg}`}>
                  <IconComponent className="w-3.5 h-3.5" />
                  <span>{currentSector.tagline}</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {currentSector.name}
                </h3>
                <p className="mt-2.5 text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {currentSector.description}
                </p>
              </div>

              {/* Critical Engineering Parameters */}
              <div className="space-y-2">
                <span className="text-[11px] font-mono uppercase font-bold tracking-wider text-slate-500 block">
                  Critical Engineering Requirements:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {currentSector.criticalNeeds.map((need, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl bg-white border border-slate-200/80 flex items-start gap-2.5 text-xs shadow-2xs"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span className="text-slate-800 font-semibold leading-snug">{need}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Target Equipment Loads */}
              <div>
                <span className="text-[11px] font-mono uppercase font-bold tracking-wider text-slate-500 block mb-2">
                  Typical Equipment Supported:
                </span>
                <div className="flex flex-wrap gap-2">
                  {currentSector.targetApplications.map((app, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 shadow-2xs"
                    >
                      <Zap className="w-3 h-3 text-[#142B55]" />
                      <span>{app}</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* CTA Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <Link href={currentSector.recommendedEquipment.link}>
                  <Button
                    size="md"
                    variant="primary"
                    className="w-full sm:w-auto bg-[#142B55] hover:bg-[#0B172F] text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer"
                    icon={<ArrowRight className="w-4 h-4 ml-1" />}
                  >
                    Explore Recommended Hardware
                  </Button>
                </Link>

                <Link href="/contact">
                  <Button
                    size="md"
                    variant="outline"
                    className="w-full sm:w-auto border-slate-300 hover:bg-white text-slate-800 font-bold text-xs rounded-xl cursor-pointer"
                    icon={<FileText className="w-4 h-4 text-[#D52B30] mr-1" />}
                  >
                    Request Single-Line Diagram Audit
                  </Button>
                </Link>
              </div>
            </div>

            {/* Right Column: Recommended Hardware Stack Card (5 cols) */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-md space-y-5">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#142B55] flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-[#D52B30]" />
                    <span>Recommended Hardware Stack</span>
                  </span>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                    Factory Certified
                  </span>
                </div>

                {/* Product Image Stage */}
                <div className="relative aspect-[4/3] w-full bg-slate-50/70 rounded-2xl border border-slate-100 flex items-center justify-center p-4 overflow-hidden">
                  <Image
                    src={currentSector.recommendedEquipment.image}
                    alt={currentSector.recommendedEquipment.model}
                    fill
                    sizes="(max-width: 768px) 100vw, 380px"
                    className="object-contain p-2"
                  />
                </div>

                {/* Hardware Stack Info */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 bg-[#142B55] text-white rounded">
                      {currentSector.recommendedEquipment.brand}
                    </span>
                    <span className="text-xs text-slate-500 font-semibold">
                      {currentSector.recommendedEquipment.title}
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900 leading-snug">
                    {currentSector.recommendedEquipment.model}
                  </h4>
                  <p className="text-xs font-mono text-slate-500">
                    {currentSector.recommendedEquipment.specs}
                  </p>
                </div>

                {/* Warranty Strip */}
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2 text-xs text-slate-600">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Direct OEM On-Site Warranty + RPS Secunderabad Support</span>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Bottom Quick-Summary Strip */}
        <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4">
          {SECTOR_SOLUTIONS.map((sec) => {
            const SIcon = sec.icon;
            const isCur = sec.id === activeTab;
            return (
              <button
                key={sec.id}
                type="button"
                onClick={() => setActiveTab(sec.id)}
                className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                  isCur
                    ? 'bg-white border-[#142B55] shadow-md ring-2 ring-[#142B55]/10'
                    : 'bg-slate-50/60 border-slate-200 hover:bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <SIcon className={`w-5 h-5 ${isCur ? 'text-[#D52B30]' : 'text-slate-500'}`} />
                  <span className={`text-[10px] font-mono font-bold uppercase ${isCur ? 'text-[#142B55]' : 'text-slate-400'}`}>
                    {isCur ? 'Active' : 'View'}
                  </span>
                </div>
                <h5 className="text-xs font-bold text-slate-900 leading-snug">{sec.shortName}</h5>
                <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{sec.tagline}</p>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
