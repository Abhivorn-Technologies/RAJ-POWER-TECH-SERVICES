import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPriceINR(amount?: number): string {
  if (amount === undefined || amount === null) return 'Price on Request';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function buildWhatsAppInquiryUrl(productName?: string, category?: string): string {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || '919346021289';
  let message = 'Hello Raj Power Tech Services (RPS), I am looking for power backup solutions.';
  
  if (productName) {
    message = `Hello Raj Power Tech Services (RPS), I would like to request a quotation for: *${productName}*${category ? ` (${category})` : ''}. Please share availability and pricing.`;
  } else if (category) {
    message = `Hello Raj Power Tech Services (RPS), I would like product guidance and a quotation for *${category}*. Please advise suitable models.`;
  }

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function buildDetailedQuotationWhatsAppUrl(details: {
  quotationNumber: string;
  customerName: string;
  customerPhone: string;
  productName?: string;
  category?: string;
  quantity?: number;
  price?: number;
  cityOrDistrict?: string;
  notes?: string;
  companyName?: string;
}): string {
  const phone = process.env.NEXT_PUBLIC_WHATSAPP_PHONE || '919346021289';
  const lines: string[] = [
    '⚡ *RAJ POWER TECH SERVICES - QUOTATION REQUEST*',
    `📋 *Reference #:* ${details.quotationNumber}`,
    `👤 *Customer Name:* ${details.customerName}`,
    `📞 *Phone / WhatsApp:* ${details.customerPhone}`,
  ];

  if (details.companyName) {
    lines.push(`🏢 *Company / Business:* ${details.companyName}`);
  }

  if (details.productName) {
    lines.push(`📦 *Product:* ${details.productName}`);
  }

  if (details.category) {
    lines.push(`🏷️ *Category:* ${details.category.toUpperCase()}`);
  }

  if (details.price && details.price > 0) {
    lines.push(`💰 *Catalogue Price:* ₹${details.price.toLocaleString('en-IN')}`);
  }

  if (details.quantity && details.quantity > 0) {
    lines.push(`🔢 *Quantity:* ${details.quantity} Unit(s)`);
  }

  if (details.cityOrDistrict) {
    lines.push(`📍 *Location:* ${details.cityOrDistrict}`);
  }

  if (details.notes) {
    lines.push(`📝 *Requirements / Notes:* ${details.notes}`);
  }

  lines.push('');
  lines.push('_Please provide best price quote, delivery timeline, and installation support._');

  return `https://wa.me/${phone}?text=${encodeURIComponent(lines.join('\n'))}`;
}
