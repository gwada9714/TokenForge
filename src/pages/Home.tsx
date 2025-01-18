import React, { Suspense } from 'react';
import { Layout } from '../components/Layout';
import Container from '@mui/material/Container';
import CircularProgress from '@mui/material/CircularProgress';
import { AdminCheck } from '../components/admin/AdminCheck';

// Lazy loading des sections
const HeroSection = React.lazy(() => import('../components/sections/HeroSection').then(module => ({ default: module.HeroSection })));
const FeaturesSection = React.lazy(() => import('../components/sections/FeaturesSection').then(module => ({ default: module.FeaturesSection })));
const PricingSection = React.lazy(() => import('../components/sections/PricingSection').then(module => ({ default: module.PricingSection })));
const TokenSection = React.lazy(() => import('../components/sections/TokenSection'));
const CommunitySection = React.lazy(() => import('../components/sections/CommunitySection').then(module => ({ default: module.CommunitySection })));

// Composant de chargement
const LoadingFallback = () => (
  <Container sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
    <CircularProgress />
  </Container>
);

const Home: React.FC = () => {
  return (
    <Layout>
      <Suspense fallback={<LoadingFallback />}>
        <HeroSection />
        <Container maxWidth="lg">
          <AdminCheck />
        </Container>
        <FeaturesSection />
        <PricingSection />
        <TokenSection />
        <CommunitySection />
      </Suspense>
    </Layout>
  );
};

export default Home;