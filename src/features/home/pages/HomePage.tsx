import React from 'react';
import { HeroSection } from '@/features/home/sections/HeroSection';
import { IntroductionSection } from '@/features/home/sections/IntroductionSection';
import { FeaturesSection } from '@/features/home/sections/FeaturesSection';
import { PricingSection } from '@/features/home/sections/PricingSection';
import { ServicesSection } from '@/features/home/sections/ServicesSection';
import { TokenSection } from '@/features/home/sections/TokenSection';
import { PartnershipSection } from '@/features/home/sections/PartnershipSection';
import { RoadmapSection } from '@/features/home/sections/RoadmapSection';
import { FAQSection } from '@/features/home/sections/FAQSection';
import { CTASection } from '@/features/home/sections/CTASection';
import { SEOHead } from '@/components';

export const HomePage: React.FC = () => {
  return (
    <>
      <SEOHead 
        title="TokenForge - Forge Your Crypto Future"
        description="Créez et déployez vos tokens en quelques clics. TokenForge est la plateforme de création de tokens la plus avancée et accessible."
      />
      
      <main>
        <HeroSection />
        <IntroductionSection />
        <FeaturesSection />
        <PricingSection />
        <ServicesSection />
        <TokenSection />
        <PartnershipSection />
        <RoadmapSection />
        <FAQSection />
        <CTASection />
      </main>
    </>
  );
};
