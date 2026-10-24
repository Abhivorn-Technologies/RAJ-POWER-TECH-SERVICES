import React from 'react';
import { HeroSection } from '@/components/home/hero-section';
import { CategorySection } from '@/components/home/category-section';
import { BrandShowcase } from '@/components/home/brand-showcase';
import { FeaturedProducts } from '@/components/home/featured-products';
import { IndustrySolutionsSection } from '@/components/home/industry-solutions';
import { WhyChooseRps } from '@/components/home/why-choose-rps';
import { QuotationCta } from '@/components/home/quotation-cta';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Hero Section */}
      <HeroSection />

      {/* 2. Core Equipment Categories */}
      <CategorySection />

      {/* 3. Industry & Facility Solutions Matrix */}
      <IndustrySolutionsSection />

      {/* 4. Authorized 4 Brands Showcase */}
      <BrandShowcase />

      {/* 5. Featured Verified Products with 3D Tilt Cards */}
      <FeaturedProducts />

      {/* 6. Technical Assurance & Trust */}
      <WhyChooseRps />

      {/* 5. Direct Product Quotation Support */}
      <QuotationCta />
    </div>
  );
}
