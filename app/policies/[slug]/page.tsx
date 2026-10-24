import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { BUSINESS_INFO } from '@/lib/constants';

interface PolicyPageProps {
  params: Promise<{ slug: string }>;
}

interface PolicyDetail {
  title: string;
  subtitle: string;
  sections: { heading: string; body: string }[];
}

const POLICIES: Record<string, PolicyDetail> = {
  privacy: {
    title: 'Privacy Policy',
    subtitle: 'Customer Information Security & Communications Protocol',
    sections: [
      {
        heading: 'Information We Collect',
        body: 'RAJ POWER TECH SERVICES collects client contact information, including name, phone number, email, installation address, and electrical load requirements exclusively to generate technical quotations, process hardware orders, and coordinate certified doorstep deliveries.',
      },
      {
        heading: 'Use of Contact Information',
        body: 'Customer mobile numbers are utilized strictly for transaction fulfillment, quotation delivery via WhatsApp or SMS, dispatch status notifications, and factory warranty registration. We strictly uphold customer confidentiality and never sell, lease, or share personal information with third-party advertising brokers.',
      },
      {
        heading: 'Data Security & Storage',
        body: 'All customer quotations and transaction records are maintained in encrypted, secured databases accessible solely to authorized RPS administrative personnel to verify past purchases and assist with on-site warranty claims.',
      },
      {
        heading: 'Opt-Out & Rights',
        body: 'Clients may request updates or deletion of their contact records at any time by contacting our central administrative desk at info@rajpowertech.in or calling our helpline at +91 9441113576.',
      },
    ],
  },
  terms: {
    title: 'Terms of Service',
    subtitle: 'Commercial Purchasing, Quotations & Electrical Sizing Conditions',
    sections: [
      {
        heading: 'Quotation Validity & Technical Sizing',
        body: 'Formal quotations provided by RAJ POWER TECH SERVICES remain valid for 15 calendar days from issuance, subject to raw material metal fluctuations and manufacturer pricing adjustments. Recommended inverter and battery capacities are calibrated to customer-reported electrical loads.',
      },
      {
        heading: 'Tax Invoicing & GST Compliance',
        body: 'All commercial equipment sales are accompanied by a valid GST tax invoice issued by RAJ POWER TECH ENTERPRISES (GSTIN: 36ABCDE1234F1Z5). Serial numbers for inverters, batteries, and online UPS units are legibly recorded on the tax invoice for warranty tracking.',
      },
      {
        heading: 'Payment & Order Acceptance',
        body: 'Orders are confirmed upon receipt of authorized purchase orders or advance payments through verified digital channels (RTGS/NEFT/UPI/Bank Transfer). Full balance settlement is required prior to equipment dispatch or upon scheduled delivery as agreed.',
      },
      {
        heading: 'Electrical Site Preparedness',
        body: 'Customers must ensure proper grounding/earthing and suitable ventilation for high-capacity tubular battery banks. RPS technicians provide advisory guidelines during site assessment.',
      },
    ],
  },
  shipping: {
    title: 'Delivery & Shipping Terms',
    subtitle: 'Logistics, Battery Transport & Doorstep Fulfillment',
    sections: [
      {
        heading: 'Serviceable Territory',
        body: 'RAJ POWER TECH SERVICES directly manages doorstep delivery and technician dispatch across the Hyderabad and Secunderabad twin-city metropolitan areas, as well as designated industrial clusters across Telangana and Andhra Pradesh.',
      },
      {
        heading: 'Safe Battery Transport Regulations',
        body: 'All tall tubular and SMF VRLA batteries are transported in compliance with hazardous materials road transit safety protocols. Units are secured against tipping, impact, and terminal short-circuiting during transit.',
      },
      {
        heading: 'Transit Insurance & Inspection',
        body: 'Hardware is comprehensively insured during transport from our Secunderabad warehouse to your delivery address. Clients are advised to inspect external casing integrity and verify seal numbers before signing delivery challans.',
      },
      {
        heading: 'Installation Scheduling',
        body: 'Certified technician installation is typically completed within 24 to 48 hours of equipment arrival for standard residential and commercial systems.',
      },
    ],
  },
  warranty: {
    title: 'Manufacturer Warranty Guidelines',
    subtitle: 'Official OEM Inverter, Battery & UPS Coverage',
    sections: [
      {
        heading: 'Original Equipment Manufacturer (OEM) Warranty',
        body: 'All power products supplied by RAJ POWER TECH SERVICES carry authentic, direct manufacturer warranties issued by Exide Industries Ltd, Amara Raja Energy & Mobility (Amaron Quanta), Best Power Equipments India Pvt. Ltd. (BPE), and Microtek Power Systems.',
      },
      {
        heading: 'On-Site Warranty Claim Protocol',
        body: 'In the rare event of equipment failure, customers can initiate service calls through the manufacturer nationwide helpline or contact the RPS service desk directly. An authorized brand service technician is dispatched to diagnose or replace defective units on-site.',
      },
      {
        heading: 'Required Claim Documentation',
        body: 'To validate warranty claims, the customer must present the original RPS GST Tax Invoice and the manufacturer warranty card bearing matching hardware serial numbers.',
      },
      {
        heading: 'Exclusions & Safe Operation',
        body: 'Warranties do not cover physical drops, external liquid ingress, lightning surge without surge protection, unauthorized tampering, or improper battery electrolyte dilution.',
      },
    ],
  },
};

export function generateStaticParams() {
  return Object.keys(POLICIES).map((slug) => ({
    slug,
  }));
}

export default async function PolicyPage({ params }: PolicyPageProps) {
  const { slug } = await params;
  const policy = POLICIES[slug];

  if (!policy) {
    notFound();
  }

  return (
    <div className="py-16 bg-[#F3F5F8]/70 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link href="/" className="hover:text-[#142B55] transition-colors flex items-center gap-1 font-medium">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Home</span>
          </Link>
          <span>/</span>
          <span className="text-slate-800 font-semibold">Policies</span>
          <span>/</span>
          <span className="text-[#142B55] font-bold">{policy.title}</span>
        </div>

        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-sm space-y-8">
          <div className="space-y-2 border-b border-slate-100 pb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-50 text-[#142B55] border border-blue-100">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Official Regulatory &amp; Service Terms</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#142B55] tracking-tight">
              {policy.title}
            </h1>

            <p className="text-sm font-semibold text-[#D52B30]">
              {policy.subtitle}
            </p>
          </div>

          <div className="space-y-6">
            {policy.sections.map((section, idx) => (
              <div key={idx} className="space-y-2 p-5 rounded-2xl bg-slate-50 border border-slate-100">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{section.heading}</span>
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-6">
                  {section.body}
                </p>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-500">
            <div>
              Authorized Operating Entity: <span className="font-bold text-slate-800">{BUSINESS_INFO.name}</span>
            </div>
            <div>
              Direct Contact: <span className="font-bold text-[#142B55]">{BUSINESS_INFO.phoneFormatted}</span> • {BUSINESS_INFO.email}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
