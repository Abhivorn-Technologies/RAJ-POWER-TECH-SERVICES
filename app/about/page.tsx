import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  Award,
  MapPin,
  ShieldCheck,
  Zap,
  Server,
  Activity,
  Cpu,
  Sun,
  BatteryCharging,
  CheckCircle2,
  Building2,
  Factory,
  Stethoscope,
  Landmark,
  Phone,
  MessageSquare,
  Clock,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { BUSINESS_INFO } from '@/lib/constants';
import { ScrollRevealCard } from '@/components/ui/scroll-reveal-card';

export const metadata = {
  title: 'About Us | RAJ POWER TECH SERVICES (RPS) - Power Solutions Specialist',
  description:
    'M/s RAJ POWER TECH SERVICES: 2 decades of hands-on expertise delivering uninterrupted power solutions, authorised distributor for BPE & Microtek Online UPS (1kVA-1000kVA), Exide & Amaron Quanta SMF batteries (7Ah-200Ah).',
};

const SECTORS_PROTECTED = [
  {
    icon: <Server className="w-5 h-5 text-sky-500" />,
    title: 'IT & ITES Infrastructure',
    description: 'Mission-critical backup for data servers, enterprise networks, cloud clusters, and BPO operations.',
  },
  {
    icon: <Stethoscope className="w-5 h-5 text-emerald-500" />,
    title: 'Healthcare & Medical Devices',
    description: 'Zero-transfer power for ICUs, diagnostic labs, operation theatres, and life-critical medical imaging.',
  },
  {
    icon: <Activity className="w-5 h-5 text-teal-500" />,
    title: 'Pharma & Biotech Labs',
    description: 'Strict power continuity for temperature-controlled storage, cleanrooms, and automated synthesis.',
  },
  {
    icon: <Factory className="w-5 h-5 text-amber-500" />,
    title: 'Industrial & Manufacturing',
    description: 'Suppression of voltage sags, protecting continuous production lines, motor drives, and robotics.',
  },
  {
    icon: <Cpu className="w-5 h-5 text-indigo-500" />,
    title: 'Process Management & SCADA',
    description: 'Uninterrupted power for PLCs, telemetry, industrial instrumentation, and automated control units.',
  },
  {
    icon: <Landmark className="w-5 h-5 text-purple-500" />,
    title: 'Finance, Banking & Fintech',
    description: 'High-availability power for core banking servers, ATM networks, trading desks, and branches.',
  },
  {
    icon: <Building2 className="w-5 h-5 text-blue-600" />,
    title: 'Government & PSUs',
    description: 'Direct OEM, tender-compliant certified power installations for state departments and municipal bodies.',
  },
  {
    icon: <Sun className="w-5 h-5 text-amber-600" />,
    title: 'Solar & Clean Energy Hybrid',
    description: 'Comprehensive grid-tied and hybrid solar installations for energy resilience and reduced overheads.',
  },
];

const ADVANTAGE_POINTS = [
  {
    title: 'Single Point of Contact',
    desc: 'From technical load audit and OEM equipment selection to installation, testing, and lifecycle maintenance.',
  },
  {
    title: '2 Decades of Practical Expertise',
    desc: '20+ years of proven hands-on field experience navigating demanding industrial and enterprise power environments.',
  },
  {
    title: 'Direct Authorised OEM Distribution',
    desc: 'Guaranteed genuine hardware directly from BPE, Microtek, Exide, and Amaron Quanta with full manufacturer warranty.',
  },
  {
    title: 'Rapid Engineering Support',
    desc: 'Dedicated technical response team based in Secunderabad providing swift on-site assistance and proactive AMC.',
  },
];

export default function AboutPage() {
  return (
    <div className="bg-[#F8FAFC] min-h-screen text-slate-800 pb-16">
      {/* 1. HERO BANNER */}
      <div className="bg-gradient-to-b from-[#0B172F] via-[#102244] to-[#142B55] text-white pt-10 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-cyber-dark opacity-30 pointer-events-none" />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#D52B30]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative space-y-6">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Link href="/" className="hover:text-white transition-colors flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Home</span>
            </Link>
            <span>/</span>
            <span className="text-white font-medium">About RPS</span>
          </div>

          <div className="max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-white/10 text-white border border-white/15 backdrop-blur-xs">
              <ShieldCheck className="w-4 h-4 text-[#D52B30]" />
              <span>2 Decades of Power Engineering (20+ Years)</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight text-white">
              Protecting Critical Loads Across Industries with Uninterrupted Power
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
              <strong>M/s RAJ POWER TECH SERVICES (RPS)</strong> is a premier power-solutions organisation dedicated to safeguarding sensitive mission-critical equipment against electrical outages, harmonics, and grid failures.
            </p>
          </div>
        </div>
      </div>

      {/* 2. CORE IDENTITY & CEREMONY FEATURE SECTION */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-10 space-y-12">
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl p-6 sm:p-8 lg:p-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            {/* Left Column: Organization Story */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#142B55]/10 text-[#142B55]">
                <Sparkles className="w-3.5 h-3.5 text-[#D52B30]" />
                <span>Single Point of Contact for All Power Solutions</span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#142B55] leading-snug">
                Two Decades of Dedicated Experience in the Power Industry
              </h2>

              <div className="text-sm text-slate-600 leading-relaxed space-y-4">
                <p>
                  We at <strong>M/s RAJ POWER TECH SERVICES</strong> have hands-on experience providing services for over <strong>2 decades (20+ years)</strong> in the power industry. Specializing in high-uptime <strong>Online UPS systems</strong>, <strong>heavy-duty pure sine wave inverters</strong>, and <strong>industrial solar setups</strong>, our engineering team ensures that your facilities never face costly operational downtime.
                </p>
                <p>
                  Acting as a <strong>single point of contact</strong> for all uninterrupted power requirements, we bridge the gap between technical load sizing, genuine OEM equipment delivery, seamless commissioning, and round-the-clock technical support.
                </p>
              </div>

              {/* 4 Quantitative Metric Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                  <span className="block text-xl sm:text-2xl font-extrabold text-[#142B55]">20+</span>
                  <span className="text-[11px] font-semibold text-slate-600">Years Experience</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                  <span className="block text-xl sm:text-2xl font-extrabold text-[#D52B30]">1–1000</span>
                  <span className="text-[11px] font-semibold text-slate-600">kVA UPS Range</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                  <span className="block text-xl sm:text-2xl font-extrabold text-[#142B55]">7–200</span>
                  <span className="text-[11px] font-semibold text-slate-600">Ah SMF Batteries</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                  <span className="block text-xl sm:text-2xl font-extrabold text-emerald-600">100%</span>
                  <span className="text-[11px] font-semibold text-slate-600">Authorised OEM</span>
                </div>
              </div>
            </div>

            {/* Right Column: Stage Ceremony Award Photo */}
            <div className="lg:col-span-5">
              <div className="rounded-3xl overflow-hidden border border-slate-200/90 bg-[#0B172F] shadow-2xl p-3 sm:p-4 space-y-3.5 group">
                {/* Photo Frame with clear focus on faces and award */}
                <div className="relative aspect-[9/12] sm:aspect-[9/13] w-full rounded-2xl overflow-hidden bg-[#070E1E] border border-white/10 shadow-inner">
                  <Image
                    src="/images/about-award-ceremony.png"
                    alt="BPE Strategic Power Stage Award Ceremony presented to RAJPOWER TECH SERVICES HYDERABAD"
                    fill
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover object-[center_56%] group-hover:scale-105 transition-transform duration-700"
                    priority
                  />
                  {/* Subtle top vignette only */}
                  <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />
                  <div className="absolute top-3 left-3">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-black/60 backdrop-blur-md text-amber-300 border border-amber-400/30 shadow-sm">
                      <Award className="w-3.5 h-3.5" />
                      <span>Official OEM Award Ceremony</span>
                    </span>
                  </div>
                </div>

                {/* Plaque Caption Details Below Photo (Zero overlap on people) */}
                <div className="p-3 sm:p-4 bg-white/5 rounded-2xl border border-white/10 text-white space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-sm font-bold text-white">
                      BPE Strategic Power National Conclave
                    </h4>
                    <span className="text-[10px] font-semibold text-slate-400">Hyderabad</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    Senior leadership conferring the Benchmark Partner recognition upon <strong className="text-white">Raj Power Tech Services, Hyderabad</strong> for two decades of regional power engineering excellence.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. AUTHORISED DISTRIBUTORSHIPS MATRIX */}
        <div className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-[#D52B30] uppercase tracking-wider">
              Direct OEM Partnerships
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#142B55]">
              Authorised Distributorships &amp; Equipment Spectrum
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Direct authorized partnerships with industry-leading manufacturers guarantee authentic engineering, direct factory pricing, and official warranty support.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            {/* Pillar 1: Online UPS Systems */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 space-y-5 flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-600 via-[#142B55] to-sky-400" />

              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="p-3 rounded-2xl bg-blue-50 text-[#142B55] border border-blue-100">
                    <Zap className="w-7 h-7 text-[#D52B30]" />
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#142B55] text-white">
                    1 kVA to 1000 kVA
                  </span>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">
                    Critical Power Protection
                  </span>
                  <h3 className="text-xl font-extrabold text-[#142B55]">
                    Authorised Distributor: Online UPS Systems
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Authorised distributors for <strong>Best Power Equipments (BPE) Online UPS</strong> and <strong>MICROTEK On-Line UPS</strong> across a wide capacity spectrum spanning from <strong>1 kVA up to 1000 kVA</strong>.
                  </p>
                </div>

                <ul className="space-y-2 text-xs text-slate-700 pt-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Zero Transfer Time (&lt; 0ms):</strong> Flawless switchover protecting ultra-sensitive computing and medical loads.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>True Double Conversion IGBT:</strong> Pure sinusoidal output with ultra-low total harmonic distortion (THD).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Scalable Architecture:</strong> 1kVA standalone workstations up to 1000kVA parallel enterprise data centers.</span>
                  </li>
                </ul>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">Brands: BPE &amp; MICROTEK</span>
                <Link
                  href="/shop?category=ups"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#142B55] hover:text-[#D52B30] transition-colors"
                >
                  <span>Explore UPS Systems</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Pillar 2: SMF Batteries */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 space-y-5 flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-600 via-[#142B55] to-teal-400" />

              <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-100">
                    <BatteryCharging className="w-7 h-7 text-emerald-600" />
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-700 text-white">
                    7 Ah to 200 Ah
                  </span>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block">
                    Energy Storage &amp; Standby Power
                  </span>
                  <h3 className="text-xl font-extrabold text-[#142B55]">
                    Authorised Distributor: SMF / VRLA Batteries
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Authorised distributors for <strong>Amaron Quanta</strong> and <strong>Exide Powersafe Plus SMF Batteries</strong> for high-rate discharge applications covering <strong>7 Ah to 200 Ah</strong>.
                  </p>
                </div>

                <ul className="space-y-2 text-xs text-slate-700 pt-2">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>High Discharge Performance:</strong> Engineered for critical standby loads, UPS systems, and telecom stations.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Zero Maintenance VRLA:</strong> Sealed maintenance-free design with oxygen recombination technology.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span><strong>Deep Cycle Longevity:</strong> Robust heavy-duty grid alloy preventing corrosion and premature capacity drop.</span>
                  </li>
                </ul>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">Brands: Exide &amp; Amaron Quanta</span>
                <Link
                  href="/shop?category=batteries"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#142B55] hover:text-[#D52B30] transition-colors"
                >
                  <span>Explore Batteries</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* 4. APPLICATIONS & SECTORS PROTECTED */}
        <div className="space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-bold text-[#D52B30] uppercase tracking-wider">
              Comprehensive Sector Coverage
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#142B55]">
              Suitable Power Solutions for Every Critical Application
            </h2>
            <p className="text-xs sm:text-sm text-slate-600">
              Custom-engineered power setups tailored to the sensitive operational tolerances of diverse commercial and public sectors.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {SECTORS_PROTECTED.map((sector) => (
              <div
                key={sector.title}
                className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-2xs hover:shadow-md transition-all hover:-translate-y-1 space-y-3"
              >
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 w-fit">
                  {sector.icon}
                </div>
                <h3 className="text-sm font-bold text-[#142B55]">{sector.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{sector.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 5. WHY RPS - THE 4 PILLARS */}
        <div className="bg-[#142B55] text-white rounded-3xl p-6 sm:p-10 space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#D52B30]/15 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-2xl space-y-2">
            <span className="text-xs font-bold text-[#D52B30] uppercase tracking-wider">
              The RPS Engineering Advantage
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Why Enterprise &amp; PSU Clients Choose RAJ POWER TECH SERVICES
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {ADVANTAGE_POINTS.map((pt, idx) => (
              <div key={pt.title} className="p-5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <span className="text-xs font-extrabold text-[#D52B30]">0{idx + 1}.</span>
                <h3 className="text-sm font-bold text-white">{pt.title}</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{pt.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 6. VERIFIED OEM CERFIFICATIONS TEASER */}
        <div className="p-6 sm:p-8 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-100 text-amber-900">
              <Award className="w-3.5 h-3.5 text-amber-700" />
              <span>Official Conferred Accreditations</span>
            </div>
            <h3 className="text-xl font-extrabold text-[#142B55]">
              Verified OEM Dealerships &amp; Milestone Plaques
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Exide Industrial Reserve Power ALL STARS Gold Dealer and Best Power Equipments Benchmark &amp; Platinum Partner awards with full documentation available for public inspection.
            </p>
          </div>

          <Link
            href="/certifications"
            className="px-6 py-3.5 rounded-2xl bg-[#142B55] hover:bg-[#0B172F] text-white text-xs font-bold inline-flex items-center gap-2 transition-all shrink-0 shadow-sm group cursor-pointer"
          >
            <span>View All Official Certifications</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* 7. CONTACT & LOCATION SUMMARY */}
        <div className="p-6 sm:p-8 rounded-3xl bg-[#0B172F] text-white space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div>
              <span className="text-xs font-bold text-[#D52B30] uppercase tracking-wider">
                Headquarters &amp; Direct Support Desk
              </span>
              <h3 className="text-lg font-bold text-white">
                RAJ POWER TECH SERVICES (RPS)
              </h3>
            </div>
            <a
              href={BUSINESS_INFO.address.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-sky-400 hover:text-white transition-colors font-medium w-fit"
            >
              <MapPin className="w-3.5 h-3.5 text-[#D52B30]" />
              <span>Locate on Google Maps &rarr;</span>
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-300">
            <div className="space-y-1">
              <span className="text-slate-400 block font-semibold uppercase tracking-wider text-[10px]">
                Registered Office Address
              </span>
              <p className="text-slate-200 leading-relaxed">{BUSINESS_INFO.address.full}</p>
            </div>
            <div className="space-y-1">
              <span className="text-slate-400 block font-semibold uppercase tracking-wider text-[10px]">
                Technical Leadership &amp; Contact
              </span>
              <p className="text-slate-200 font-semibold">{BUSINESS_INFO.contactPerson}</p>
              <p className="text-slate-300">Phone: {BUSINESS_INFO.phoneFormatted}</p>
              <p className="text-slate-300">Email: {BUSINESS_INFO.email}</p>
            </div>
            <div className="space-y-3">
              <span className="text-slate-400 block font-semibold uppercase tracking-wider text-[10px]">
                Immediate Technical Guidance
              </span>
              <div className="flex flex-wrap gap-2.5">
                <a
                  href={`tel:${BUSINESS_INFO.phoneTel}`}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold inline-flex items-center gap-2 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-sky-400" />
                  <span>Call Desk</span>
                </a>
                <a
                  href={`https://wa.me/${BUSINESS_INFO.whatsappIntl}?text=${encodeURIComponent('Hello RPS, I would like to consult with your power engineer regarding an Online UPS / Battery setup.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold inline-flex items-center gap-2 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp Engineer</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
