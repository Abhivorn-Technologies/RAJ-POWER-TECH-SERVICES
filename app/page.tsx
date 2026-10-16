import React from 'react';
import { HeroSection } from '@/components/home/hero-section';
import { CategorySection } from '@/components/home/category-section';
import { FeaturedProducts } from '@/components/home/featured-products';
import { WhyChooseRps } from '@/components/home/why-choose-rps';
import { PromotionalBanner } from '@/components/home/promotional-banner';
import { QuotationCta } from '@/components/home/quotation-cta';
import { AboutContact } from '@/components/home/about-contact';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Section C: Hero Banner */}
      <HeroSection />

      {/* Section D: Product Category Section */}
      <CategorySection />

      {/* Section E: Featured Products Section */}
      <FeaturedProducts />

      {/* Section F: Why Choose RPS */}
      <WhyChooseRps />

      {/* Section G: Promotional Banner */}
      <PromotionalBanner />

      {/* Section H: Quotation CTA */}
      <QuotationCta />

      {/* Section I: About & Contact Section */}
      <AboutContact />
    </div>
  );
}
