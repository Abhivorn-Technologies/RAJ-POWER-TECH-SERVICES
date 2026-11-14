'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Zap,
  Cpu,
  Wrench,
  CheckCircle2,
  Building2,
  Server,
  HeartPulse,
  ShoppingBag,
  Home as HomeIcon,
  Factory,
  ArrowRight,
  Phone,
  MessageSquare,
  Clock,
  Sparkles,
  Calendar,
  MapPin,
  RefreshCw,
  BadgeCheck,
  ArrowLeft,
  Activity,
  Layers,
  ChevronRight,
  ChevronLeft,
  Check,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { BUSINESS_INFO } from '@/lib/constants';
import { ClientProject, ClientSector } from '@/types/client-project';
import { INITIAL_CLIENT_PROJECTS } from '@/lib/clients-data';
import { PREMIUM_EASE } from '@/lib/animations';

const SECTOR_TABS: { label: string; value: string; icon: React.ReactNode }[] = [
  { label: 'All Projects', value: 'all', icon: <Sparkles className="w-3.5 h-3.5" /> },
  { label: 'Healthcare & Hospitals', value: 'Healthcare & Hospitals', icon: <HeartPulse className="w-3.5 h-3.5" /> },
  { label: 'Corporate IT & Data Rooms', value: 'Corporate IT & Data Rooms', icon: <Server className="w-3.5 h-3.5" /> },
  { label: 'Commercial & Retail', value: 'Commercial & Retail', icon: <ShoppingBag className="w-3.5 h-3.5" /> },
  { label: 'Villas & Residential', value: 'Villas & Residential', icon: <HomeIcon className="w-3.5 h-3.5" /> },
  { label: 'Industrial & Manufacturing', value: 'Industrial & Manufacturing', icon: <Factory className="w-3.5 h-3.5" /> },
];

// Unique Equipment Systems Data
const POWER_SYSTEMS = [
  {
    id: 'online-ups',
    title: 'True Online Double-Conversion UPS',
    badge: '0.00ms Zero Cutover',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
    icon: Zap,
    iconColor: 'text-[#D52B30]',
    accentGlow: 'group-hover:border-[#D52B30]/30',
    description:
      'Continuous double-conversion topology completely isolates sensitive equipment from utility spikes, brownouts, and generator sync transients. Pure sine wave with THD < 2%.',
    telemetry: '0.00ms Latency • Active PFC 0.99 • Static Bypass',
    specs: ['1 kVA to 60 kVA 3-Phase', 'Static Auto Bypass', 'Galvanic Isolation'],
  },
  {
    id: 'lithium-ess',
    title: 'LiFePO4 Lithium Smart Storage',
    badge: '3500+ Deep Cycles',
    badgeColor: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    icon: Cpu,
    iconColor: 'text-cyan-600',
    accentGlow: 'group-hover:border-cyan-400/40',
    description:
      'High-density Lithium Iron Phosphate chemistry with integrated intelligent BMS. Thermal balancing, rapid 2-hour recharge, and 65% space savings over lead acid.',
    telemetry: '3,500+ Cycles • 2h Full Recharge • Sealed BMS',
    specs: ['Zero Water Maintenance', '10+ Years Lifespan', 'Modular Wall/Rack Mount'],
  },
  {
    id: 'smf-battery',
    title: 'SMF / VRLA Sealed Battery Banks',
    badge: 'Zero Acid Fumes',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    icon: Server,
    iconColor: 'text-amber-600',
    accentGlow: 'group-hover:border-amber-400/40',
    description:
      'Absorbed Glass Mat (AGM) heavy-duty industrial battery banks with Radgrid™ anti-corrosion plates. Authorized central stock from Amaron Quanta & Exide Powersafe.',
    telemetry: 'High-Rate Discharge • Radgrid™ Alloy • Sealed VRLA',
    specs: ['12V to 384V DC String Configs', 'Flame-Retardant ABS Enclosure', 'Indoor Compliant'],
  },
  {
    id: 'dsp-inverters',
    title: 'Pure Sine Wave Heavy Inverters',
    badge: 'High Inrush Capacity',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    icon: Wrench,
    iconColor: 'text-emerald-600',
    accentGlow: 'group-hover:border-emerald-400/40',
    description:
      'DSP-controlled sine wave inverters engineered to absorb severe motor and compressor startup surges. Powers 1.5-ton split ACs, elevators, and retail lighting.',
    telemetry: '300% Peak Inrush • Whisper Quiet < 45dB • Adaptive Charge',
    specs: ['1.5 kVA to 15 kVA Series', '3-Stage Smart Charging', 'MDB Phase Segregation'],
  },
];

// Commissioning Steps
const COMMISSIONING_STEPS = [
  {
    step: '01',
    phase: 'Assessment',
    title: 'Load Profiling & Power Audit',
    description: 'We measure true RMS peak load, startup inrush surges, and neutral-to-earth voltage to calculate exact kVA sizing.',
  },
  {
    step: '02',
    phase: 'Engineering',
    title: 'Topology Sizing & Blueprints',
    description: 'Calculating battery string voltage (12V to 384V DC), heavy copper cable gauge runs, DC isolators, and steel rack layout.',
  },
  {
    step: '03',
    phase: 'Assembly',
    title: 'Rack Commissioning & Earthing',
    description: 'Engineers assemble heavy-duty steel racks, dress flame-retardant DC wiring, calibrate terminal torque, and verify dedicated earthing.',
  },
  {
    step: '04',
    phase: 'Certification',
    title: '100% Full-Cutover Handover',
    description: 'Simulated 100% utility blackout cutover test under live load, output voltage calibration, and official OEM warranty handover.',
  },
];

export default function ServicesPage() {
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const [projects, setProjects] = useState<ClientProject[]>(INITIAL_CLIENT_PROJECTS);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const projectsPerPage = 6;

  // Form states for booking site inspection
  const [auditName, setAuditName] = useState('');
  const [auditPhone, setAuditPhone] = useState('');
  const [auditCompany, setAuditCompany] = useState('');
  const [auditSector, setAuditSector] = useState<ClientSector>('Healthcare & Hospitals');
  const [auditNotes, setAuditNotes] = useState('');
  const [auditSubmitting, setAuditSubmitting] = useState(false);
  const [auditSuccess, setAuditSuccess] = useState(false);

  useEffect(() => {
    async function fetchProjects() {
      try {
        const res = await fetch('/api/clients');
        const data = await res.json();
        if (data.success && Array.isArray(data.projects) && data.projects.length > 0) {
          setProjects(data.projects);
        }
      } catch (e) {
        console.error('Failed to load live client projects, using initial data:', e);
      } finally {
        setLoading(false);
      }
    }
    fetchProjects();
  }, []);

  const filteredProjects =
    selectedSector === 'all'
      ? projects
      : projects.filter((p) => p.sector.toLowerCase() === selectedSector.toLowerCase());

  const totalPages = Math.ceil(filteredProjects.length / projectsPerPage) || 1;
  const paginatedProjects = filteredProjects.slice(
    (currentPage - 1) * projectsPerPage,
    currentPage * projectsPerPage
  );

  const handleSectorChange = (sector: string) => {
    setSelectedSector(sector);
    setCurrentPage(1);
  };

  const handleAuditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auditName.trim() || auditPhone.replace(/\D/g, '').length !== 10) return;

    setAuditSubmitting(true);
    try {
      const cleanPhone = auditPhone.replace(/\D/g, '');
      const notes = `Sector: ${auditSector} | Company: ${auditCompany.trim() || 'N/A'} | Inspection Notes: ${auditNotes.trim() || 'Site audit requested'}`;

      await fetch('/api/quotations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: auditName.trim(),
          customerPhone: cleanPhone,
          companyName: auditCompany.trim() || undefined,
          cityOrDistrict: 'Secunderabad / Hyderabad Hub',
          category: 'Commercial Turnkey Setup',
          productName: `Turnkey On-Site Power Audit (${auditSector})`,
          quantity: 1,
          notes,
        }),
      });

      const waMsg = `Hello Raj Power Tech Services (RPS),
I would like to request an on-site technical inspection / power audit:
• Name: ${auditName.trim()}
• Organization: ${auditCompany.trim() || 'N/A'}
• Sector: ${auditSector}
• Mobile: +91 ${cleanPhone}
• Requirements: ${auditNotes.trim() || 'Need power backup assessment'}

Please confirm a site engineer visit. Thank you!`;

      const waUrl = `https://wa.me/${BUSINESS_INFO.whatsappIntl}?text=${encodeURIComponent(waMsg)}`;
      window.open(waUrl, '_blank', 'noopener,noreferrer');
      setAuditSuccess(true);
    } catch (err) {
      console.error(err);
    } finally {
      setAuditSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 selection:bg-[#142B55]/10 selection:text-[#142B55]">
      {/* 1. HERO SECTION: Clean, Crisp, Bright Light Theme (Centered text, no images) */}
      <section className="relative pt-24 pb-16 overflow-hidden bg-gradient-to-b from-white via-[#F1F5F9]/70 to-[#F8FAFC] border-b border-slate-200/80">
        {/* Subtle engineering grid accent */}
        <div className="absolute inset-0 bg-grid-cyber opacity-[0.03] pointer-events-none" />
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[320px] bg-gradient-to-b from-cyan-400/10 via-[#142B55]/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-5">
          {/* Breadcrumbs */}
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: PREMIUM_EASE }}
            className="flex items-center justify-center gap-2 text-xs text-slate-500 font-medium"
          >
            <Link href="/" className="hover:text-[#142B55] transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>
            <span className="text-slate-400">/</span>
            <span className="text-slate-900 font-semibold">Services</span>
          </motion.div>

          {/* Micro Telemetry Pill */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: PREMIUM_EASE, delay: 0.05 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white text-slate-800 border border-slate-200/80 text-xs font-semibold shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Turnkey Power Engineering &bull; Secunderabad &amp; Hyderabad</span>
            </div>
          </motion.div>

          {/* Clean Main Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: PREMIUM_EASE, delay: 0.1 }}
            className="text-3xl sm:text-5xl lg:text-6xl font-black text-[#142B55] tracking-tight leading-tight"
          >
            Commercial Power Services &amp;{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D52B30] to-rose-600">
              Client Installations
            </span>
          </motion.h1>

          {/* Concise Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: PREMIUM_EASE, delay: 0.15 }}
            className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed"
          >
            Turnkey Online UPS, Lithium ESS, and SMF battery infrastructure installed and maintained for hospitals, IT data centers, commercial hubs, and luxury residences.
          </motion.p>

          {/* High-Impact Live Metric Strip */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: PREMIUM_EASE, delay: 0.2 }}
            className="pt-1 flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs font-medium"
          >
            <div className="px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-slate-700 shadow-xs flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-cyan-600" />
              <span className="font-mono font-bold text-slate-900">0.00ms</span>
              <span>Zero Cutover</span>
            </div>
            <div className="px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-slate-700 shadow-xs flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span className="font-mono font-bold text-slate-900">1,200+</span>
              <span>Verified Installs</span>
            </div>
            <div className="px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-slate-700 shadow-xs flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-[#D52B30]" />
              <span className="font-mono font-bold text-slate-900">4-Hour</span>
              <span>GHMC Dispatch</span>
            </div>
          </motion.div>

          {/* Clean Centered Actions */}
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: PREMIUM_EASE, delay: 0.25 }}
            className="pt-2 flex flex-wrap items-center justify-center gap-3"
          >
            <a href="#customer-showcase">
              <Button
                size="md"
                variant="primary"
                className="bg-[#D52B30] hover:bg-[#b82226] text-white font-bold rounded-xl px-6 py-2.5 shadow-md shadow-[#D52B30]/25 cursor-pointer whitespace-nowrap"
                icon={<ArrowRight className="w-4 h-4" />}
              >
                View Client Projects
              </Button>
            </a>

            <a href="#site-audit">
              <button
                type="button"
                className="inline-flex items-center justify-center gap-2 bg-white border border-slate-300 text-slate-700 hover:border-[#142B55] hover:text-[#142B55] hover:bg-slate-50 font-bold rounded-xl px-6 py-2.5 text-sm shadow-xs transition-all cursor-pointer whitespace-nowrap active:scale-[0.98]"
              >
                <Calendar className="w-4 h-4 text-[#142B55]" />
                <span>Book Power Audit</span>
              </button>
            </a>
          </motion.div>
        </div>
      </section>

      {/* 2. SYSTEMS & EQUIPMENT: UNIQUE FLOATING CARDS WITH SCROLL ANIMATION */}
      <section className="py-20 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.45, ease: PREMIUM_EASE }}
            className="text-center max-w-2xl mx-auto space-y-2 mb-14"
          >
            <span className="text-xs font-black text-[#D52B30] uppercase tracking-wider block">
              Engineering Matrix
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-[#142B55] tracking-tight">
              Power Systems We Engineer &amp; Commission
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Tier-1 OEM hardware calibrated for Indian grid conditions, high inrush loads, and continuous high-temperature duty cycles.
            </p>
          </motion.div>

          {/* Unique Animated Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
            {POWER_SYSTEMS.map((sys, idx) => {
              const Icon = sys.icon;
              return (
                <motion.div
                  key={sys.id}
                  initial={{ opacity: 0, y: 35, scale: 0.97 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.45, delay: idx * 0.1, ease: [0.22, 1, 0.36, 1] }}
                  whileHover={{ y: -6, transition: { duration: 0.25 } }}
                  className={`group relative rounded-3xl p-7 bg-white border border-slate-200 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-15px_rgba(20,43,85,0.12)] transition-all duration-300 flex flex-col justify-between space-y-5 overflow-hidden ${sys.accentGlow}`}
                >
                  {/* Subtle top ambient accent line on hover */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#142B55]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                  <div className="space-y-4">
                    {/* Card Header with Icon & Floating Badge */}
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center shadow-xs group-hover:bg-[#142B55] transition-colors duration-300">
                        <Icon className={`w-6 h-6 ${sys.iconColor} group-hover:text-white transition-colors duration-300`} />
                      </div>

                      <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border shadow-2xs ${sys.badgeColor}`}>
                        {sys.badge}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-extrabold text-slate-900 group-hover:text-[#142B55] transition-colors leading-snug">
                      {sys.title}
                    </h3>

                    {/* Description */}
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                      {sys.description}
                    </p>

                    {/* Live Telemetry Pill */}
                    <div className="p-3 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex items-center gap-2 text-xs font-mono text-slate-700">
                      <Activity className="w-3.5 h-3.5 text-[#142B55] shrink-0 animate-pulse" />
                      <span className="text-[11px] font-bold">{sys.telemetry}</span>
                    </div>
                  </div>

                  {/* Card Footer: Specs Chips */}
                  <div className="pt-4 border-t border-slate-100 flex flex-wrap gap-2">
                    {sys.specs.map((sp, sIdx) => (
                      <span
                        key={sIdx}
                        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 text-slate-700 text-[11px] font-semibold"
                      >
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>{sp}</span>
                      </span>
                    ))}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. EXECUTION PROTOCOL: ANIMATED CONNECTED TRACK */}
      <section className="py-20 bg-gradient-to-b from-[#F8FAFC] to-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.45 }}
            className="text-center max-w-2xl mx-auto space-y-2 mb-14"
          >
            <span className="text-xs font-black text-[#142B55] uppercase tracking-wider block">
              How We Work
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-[#142B55] tracking-tight">
              Our 4-Stage Commissioning Protocol
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Every installation follows certified electrical standards to ensure zero transfer delay, thermal stability, and legal warranty protection.
            </p>
          </motion.div>

          {/* Connected Step Cards with Scroll Reveal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {COMMISSIONING_STEPS.map((step, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 35 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.45, delay: idx * 0.1, ease: PREMIUM_EASE }}
                whileHover={{ y: -6, transition: { duration: 0.25 } }}
                className="p-6 rounded-3xl bg-white border border-slate-200/90 hover:border-[#142B55]/30 shadow-xs hover:shadow-lg transition-all space-y-3 relative group"
              >
                <div className="flex items-center justify-between">
                  <span className="text-3xl font-black text-[#142B55] font-mono group-hover:text-[#D52B30] transition-colors">
                    {step.step}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full">
                    {step.phase}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 group-hover:text-[#142B55] transition-colors leading-snug">
                  {step.title}
                </h3>

                <p className="text-xs text-slate-600 leading-relaxed pt-1">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 4. CUSTOMER PROJECTS & INSTALLATIONS SHOWCASE (UNIQUE CARDS WITH SCROLL ANIMATION) */}
      <section id="customer-showcase" className="py-20 bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-slate-200 pb-6 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4 }}
              className="max-w-2xl space-y-2"
            >
              <span className="text-xs font-black text-[#D52B30] uppercase tracking-wider block">
                Verified Deployments
              </span>
              <h2 className="text-2xl sm:text-4xl font-black text-[#142B55] tracking-tight">
                Customer Projects &amp; Installations
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                Explore real setups commissioned and actively maintained by RPS engineers across Secunderabad &amp; Hyderabad.
              </p>
            </motion.div>

            <div className="text-xs font-mono text-slate-600 flex items-center gap-2 shrink-0">
              <BadgeCheck className="w-4 h-4 text-emerald-600" />
              <span>{projects.length} Verified Installations</span>
            </div>
          </div>

          {/* Sector Filter Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto py-6 scrollbar-none">
            {SECTOR_TABS.map((tab) => {
              const active = selectedSector === tab.value;
              return (
                <button
                  key={tab.value}
                  type="button"
                  onClick={() => handleSectorChange(tab.value)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    active
                      ? 'bg-[#142B55] text-white shadow-md shadow-[#142B55]/20'
                      : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Projects Grid: UNIQUE CARD DESIGN WITH VIEWPORT SCROLL ANIMATIONS */}
          {loading ? (
            <div className="py-20 text-center text-xs font-semibold text-slate-400 flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-[#142B55]" />
              <span>Loading verified client installations...</span>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="p-12 text-center bg-slate-50 rounded-3xl border border-slate-200 max-w-md mx-auto my-6 space-y-2">
              <Building2 className="w-8 h-8 text-slate-400 mx-auto" />
              <h4 className="text-sm font-bold text-slate-800">No project records in this sector</h4>
              <p className="text-xs text-slate-500">Contact our engineering team for custom installation case studies in this sector.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7 mt-4">
              <AnimatePresence mode="popLayout">
                {paginatedProjects.map((proj, idx) => (
                  <motion.div
                    key={proj.id}
                    layout
                    initial={{ opacity: 0, y: 35, scale: 0.96 }}
                    whileInView={{ opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ duration: 0.45, delay: idx * 0.08, ease: [0.22, 1, 0.36, 1] }}
                    whileHover={{ y: -8, transition: { duration: 0.25 } }}
                    className="group relative rounded-3xl bg-white border border-slate-200/90 hover:border-slate-300 shadow-[0_8px_30px_-10px_rgba(0,0,0,0.06)] hover:shadow-[0_25px_50px_-12px_rgba(20,43,85,0.15)] transition-all duration-300 overflow-hidden flex flex-col"
                  >
                    {/* Top Hardware Stage */}
                    <div className="relative aspect-[16/11] w-full bg-gradient-to-b from-slate-50 via-slate-100/60 to-white p-6 border-b border-slate-100 flex items-center justify-center overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={proj.imageUrl || '/products/bpe-online-ups-hq.png'}
                        alt={proj.clientName}
                        className="max-h-full max-w-full object-contain transition-transform duration-500 ease-out group-hover:scale-108"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/products/bpe-online-ups-hq.png';
                        }}
                      />

                      {/* Floating Location Pill (Field 1: Location) */}
                      <div className="absolute top-3.5 left-3.5">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/95 backdrop-blur-md shadow-xs border border-slate-200/90 text-xs font-semibold text-slate-800">
                          <MapPin className="w-3.5 h-3.5 text-[#D52B30] shrink-0" />
                          <span>{proj.location}</span>
                        </span>
                      </div>

                      {/* Verified Badge */}
                      <div className="absolute top-3.5 right-3.5">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold shadow-2xs">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Verified</span>
                        </span>
                      </div>
                    </div>

                    {/* Meta Body: Field 2 (Customer Business Name) & Field 3 (Installed Product) */}
                    <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                      <div className="space-y-1">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Client Facility
                        </span>
                        <h3 className="font-extrabold text-lg text-slate-900 group-hover:text-[#142B55] transition-colors leading-snug">
                          {proj.clientName}
                        </h3>
                      </div>

                      {/* Installed Product Box */}
                      <div className="pt-3 border-t border-slate-100 space-y-2.5">
                        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                          <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-[#D52B30]">
                            <Zap className="w-3 h-3" />
                            <span>Installed Product</span>
                          </div>
                          <p className="text-xs font-bold text-[#142B55] leading-snug">
                            {proj.systemInstalled}
                          </p>
                        </div>

                        {/* WhatsApp Quick Action */}
                        <a
                          href={`https://wa.me/${BUSINESS_INFO.whatsappIntl}?text=${encodeURIComponent(`Hello RPS, I saw your installation at ${proj.clientName} (${proj.systemInstalled}). I would like to inquire about a similar setup for my facility.`)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="pt-1 flex items-center justify-between text-xs font-bold text-slate-500 group-hover:text-[#142B55] transition-colors cursor-pointer whitespace-nowrap"
                        >
                          <span>Inquire Similar Setup</span>
                          <ChevronRight className="w-4 h-4 text-[#D52B30] group-hover:translate-x-1 transition-transform" />
                        </a>
                      </div>
                    </div>

                    {/* Bottom Hover Glow Accent */}
                    <div className="h-1 w-full bg-gradient-to-r from-cyan-500 via-[#142B55] to-[#D52B30] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Customer Projects Pagination */}
          {totalPages > 1 && (
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-200">
              <p className="text-xs text-slate-500 font-medium">
                Showing <span className="font-bold text-slate-900">{(currentPage - 1) * projectsPerPage + 1}</span> to{' '}
                <span className="font-bold text-slate-900">
                  {Math.min(currentPage * projectsPerPage, filteredProjects.length)}
                </span>{' '}
                of <span className="font-bold text-slate-900">{filteredProjects.length}</span> installations
              </p>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  disabled={currentPage === 1}
                  onClick={() => {
                    setCurrentPage((p) => Math.max(p - 1, 1));
                    document.getElementById('customer-showcase')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1 shadow-2xs whitespace-nowrap transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => {
                      setCurrentPage(pageNum);
                      document.getElementById('customer-showcase')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className={`w-8 h-8 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      currentPage === pageNum
                        ? 'bg-[#142B55] text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  type="button"
                  disabled={currentPage === totalPages}
                  onClick={() => {
                    setCurrentPage((p) => Math.min(p + 1, totalPages));
                    document.getElementById('customer-showcase')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1 shadow-2xs whitespace-nowrap transition-colors"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 5. BOOK TECHNICAL AUDIT: Clean Light Consultation Desk */}
      <section id="site-audit" className="py-20 bg-gradient-to-b from-[#F8FAFC] to-[#F1F5F9] border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.45 }}
              className="lg:col-span-5 space-y-5"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-[#D52B30] text-xs font-bold uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5 text-[#D52B30]" />
                <span>On-Site Engineering Diagnostic</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-black text-[#142B55] tracking-tight leading-tight">
                Book an On-Site Power Audit
              </h2>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Planning a hospital wing, server cluster, showroom, or residential backup? 
                Our specialists evaluate your true electrical loads, neutral-to-earth voltage, and provide turnkey engineering proposals.
              </p>

              <div className="pt-2 space-y-3 text-xs text-slate-700">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Authorized Central Stockist (Exide, Quanta, Microtek, BPE)</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-cyan-600 shrink-0" />
                  <span>Transparent GST Billing &amp; Direct OEM Replacement Warranties</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Phone className="w-4 h-4 text-[#D52B30] shrink-0" />
                  <span>Direct Hotline: {BUSINESS_INFO.phoneFormatted}</span>
                </div>
              </div>
            </motion.div>

            {/* Right Form Card */}
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.45, delay: 0.1 }}
              className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 text-slate-800 shadow-xl"
            >
              {auditSuccess ? (
                <div className="p-8 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-3">
                  <div className="w-12 h-12 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-black text-emerald-950">Site Audit Request Dispatched!</h3>
                  <p className="text-xs text-emerald-800">
                    Your site consultation request has been recorded in our dispatch system and forwarded via WhatsApp. Our engineering team will contact you promptly.
                  </p>
                  <Button
                    type="button"
                    variant="white"
                    size="sm"
                    onClick={() => setAuditSuccess(false)}
                    className="mt-2 text-xs font-bold border-slate-300 text-slate-700 hover:text-[#142B55] hover:bg-slate-100 cursor-pointer whitespace-nowrap"
                  >
                    Submit Another Request
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleAuditSubmit} className="space-y-4 text-xs">
                  <div>
                    <h3 className="text-base font-extrabold text-[#142B55]">
                      Request Site Inspection
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Load evaluation and backup architecture for commercial, medical, and residential projects
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
                    <div>
                      <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[11px]">
                        Your Full Name *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Dr. K. Ramesh"
                        value={auditName}
                        onChange={(e) => setAuditName(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#142B55] text-xs text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[11px]">
                        WhatsApp / Contact Mobile *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-2.5 text-slate-500 font-bold text-xs select-none">
                          +91
                        </span>
                        <input
                          type="tel"
                          maxLength={10}
                          required
                          placeholder="98765 43210"
                          value={auditPhone}
                          onChange={(e) => setAuditPhone(e.target.value.replace(/\D/g, ''))}
                          className="w-full pl-12 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs focus:outline-none focus:border-[#142B55] text-slate-900"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[11px]">
                        Organization / Business Name
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Care Diagnostics / Sunrise Villa"
                        value={auditCompany}
                        onChange={(e) => setAuditCompany(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#142B55] text-xs text-slate-900"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[11px]">
                        Sector / Facility Type *
                      </label>
                      <select
                        value={auditSector}
                        onChange={(e) => setAuditSector(e.target.value as ClientSector)}
                        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs focus:outline-none focus:border-[#142B55] cursor-pointer"
                      >
                        <option value="Healthcare & Hospitals">Healthcare & Hospitals</option>
                        <option value="Corporate IT & Data Rooms">Corporate IT & Data Rooms</option>
                        <option value="Commercial & Retail">Commercial & Retail</option>
                        <option value="Villas & Residential">Villas & Residential</option>
                        <option value="Industrial & Manufacturing">Industrial & Manufacturing</option>
                      </select>
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1 text-[11px]">
                        Site Requirements / Expected Load Scope
                      </label>
                      <textarea
                        rows={2}
                        placeholder="e.g. Need 10kVA online UPS for CT scan and laboratory. Include quotation for SMF battery rack."
                        value={auditNotes}
                        onChange={(e) => setAuditNotes(e.target.value)}
                        className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-[#142B55] text-xs text-slate-900"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
                    <Button
                      type="submit"
                      variant="navy"
                      size="md"
                      disabled={auditSubmitting}
                      className="w-full font-bold py-3.5 px-6 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer inline-flex flex-row flex-nowrap items-center justify-center gap-2.5 group/btn whitespace-nowrap"
                    >
                      {auditSubmitting ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-white shrink-0" />
                          <span className="whitespace-nowrap">Routing Request...</span>
                        </>
                      ) : (
                        <>
                          <Calendar className="w-4 h-4 text-amber-400 shrink-0 group-hover/btn:scale-110 transition-transform" />
                          <span className="whitespace-nowrap">Schedule On-Site Power Audit</span>
                          <ArrowRight className="w-4 h-4 shrink-0 group-hover/btn:translate-x-1 transition-transform" />
                        </>
                      )}
                    </Button>

                    <div className="flex items-center justify-center gap-2 text-[11px] text-slate-500 text-center">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>Direct dispatch to RPS Engineers via WhatsApp &amp; Admin Desk</span>
                    </div>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}