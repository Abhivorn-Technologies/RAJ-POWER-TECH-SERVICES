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
