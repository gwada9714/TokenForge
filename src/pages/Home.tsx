import React from 'react';
import { Layout } from '../components/Layout';
import { HeroSection } from '../components/sections/HeroSection';
import { FeaturesSection } from '../components/sections/FeaturesSection';
import { PricingSection } from '../components/sections/PricingSection';
import TokenSection from '../components/sections/TokenSection';
import { CommunitySection } from '../components/sections/CommunitySection';
import AdminCheck from '../components/admin/AdminCheck';
import { Container } from '@mui/material';

const Home: React.FC = () => {
  return (
    <Layout>
      <Container maxWidth="lg">
        <AdminCheck />
      </Container>
      <HeroSection />
      <FeaturesSection />
      <PricingSection />
      <TokenSection />
      <CommunitySection />
    </Layout>
  );
};

export default Home;