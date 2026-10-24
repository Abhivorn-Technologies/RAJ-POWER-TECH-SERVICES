import test from 'node:test';
import assert from 'node:assert/strict';
import {
  cn,
  formatPriceINR,
  buildWhatsAppInquiryUrl,
  buildDetailedQuotationWhatsAppUrl,
} from '../lib/utils';

test('UTILS: cn correctly merges Tailwind classes and resolves conflicts', () => {
  const result1 = cn('px-4 py-2', 'bg-red-500', false && 'hidden', 'text-white');
  assert.strictEqual(result1, 'px-4 py-2 bg-red-500 text-white');

  // Conflict resolution: text-black should override text-white
  const result2 = cn('text-white', 'text-black');
  assert.strictEqual(result2, 'text-black');
});

test('UTILS: formatPriceINR formats prices with Indian comma formatting and Rupee symbol', () => {
  assert.strictEqual(formatPriceINR(undefined), 'Price on Request');
  // @ts-expect-error testing null safety
  assert.strictEqual(formatPriceINR(null), 'Price on Request');

  const zeroFormatted = formatPriceINR(0);
  assert.ok(zeroFormatted.includes('0'));

  const price1 = formatPriceINR(15000);
  // Standard Indian formatting: ₹15,000
  assert.ok(price1.includes('15,000') || price1.includes('15000'));

  const price2 = formatPriceINR(1250000);
  // Indian formatting: 12,50,000
  assert.ok(price2.includes('12,50,000'));
});

test('UTILS: buildWhatsAppInquiryUrl generates valid wa.me link with encoded message', () => {
  const url1 = buildWhatsAppInquiryUrl('Exide Tubular Battery 150Ah', 'batteries');
  assert.ok(url1.startsWith('https://wa.me/'));
  assert.ok(url1.includes('text='));
  assert.ok(url1.includes(encodeURIComponent('Exide Tubular Battery 150Ah')));

  // Category only
  const url2 = buildWhatsAppInquiryUrl(undefined, 'inverters');
  assert.ok(url2.includes(encodeURIComponent('inverters')));

  // Generic message
  const url3 = buildWhatsAppInquiryUrl();
  assert.ok(url3.includes('text='));
});

test('UTILS: buildDetailedQuotationWhatsAppUrl generates structured commercial RFQ link', () => {
  const quoteDetails = {
    quotationNumber: 'RPS-QT-2026-0042',
    customerName: 'K. Venkatesh',
    customerPhone: '9849098490',
    companyName: 'Venkatesh Hospital & Clinics',
    productName: 'BPE 3KVA Online Industrial UPS',
    category: 'ups',
    quantity: 2,
    price: 45000,
    cityOrDistrict: 'Secunderabad',
    notes: 'Require 2 hours battery bank backup alongside UPS.',
  };

  const url = buildDetailedQuotationWhatsAppUrl(quoteDetails);
  assert.ok(url.startsWith('https://wa.me/'));
  const decoded = decodeURIComponent(url);

  assert.ok(decoded.includes('RPS-QT-2026-0042'));
  assert.ok(decoded.includes('K. Venkatesh'));
  assert.ok(decoded.includes('Venkatesh Hospital & Clinics'));
  assert.ok(decoded.includes('BPE 3KVA Online Industrial UPS'));
  assert.ok(decoded.includes('UPS'));
  assert.ok(decoded.includes('45,000'));
  assert.ok(decoded.includes('2 Unit(s)'));
  assert.ok(decoded.includes('Secunderabad'));
  assert.ok(decoded.includes('Require 2 hours battery bank backup'));
});
