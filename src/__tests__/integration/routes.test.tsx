import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { Web3Providers } from '@/providers/Web3Providers';
import { TokenForgeAuthProvider } from '@/features/auth/providers/TokenForgeAuthProvider';
import { Layout } from '@/layouts/Layout';
import { AuthGuard } from '@/guards/AuthGuard';
import { AdminGuard } from '@/guards/AdminGuard';
import { PublicGuard } from '@/guards/PublicGuard';
import { describe, it, expect, beforeEach, vi } from 'vitest';

// Import des pages
import { Home } from '@/features/home/pages/HomePage';
import { Dashboard } from '@/features/dashboard/pages/DashboardPage';
import { Profile } from '@/features/auth/pages/ProfilePage';
import { Auth } from '@/features/auth/pages/AuthPage';
import { Documentation } from '@/features/docs/pages/DocumentationPage';
import { CreateToken } from '@/features/token/pages/CreateTokenPage';
import { TokenList } from '@/features/token/pages/TokenListPage';
import { TokenDetails } from '@/features/token/pages/TokenDetailsPage';
import { Services } from '@/features/services/pages/ServicesPage';
import { Plans } from '@/features/pricing/pages/PlansPage';
import { Learn } from '@/features/learn/pages/LearnPage';
import { Blog } from '@/features/blog/pages/BlogPage';
import { Partnership } from '@/features/partnership/pages/PartnershipPage';
import { AdminDashboard } from '@/features/admin/pages/AdminDashboardPage';
import { NotFound } from '@/features/common/pages/NotFoundPage';

// Mock du hook d'authentification
vi.mock('@/hooks/useAuth', () => ({
  useTokenForgeAuth: () => ({
    isAuthenticated: false,
    isAdmin: false,
    isLoading: false
  })
}));

const renderWithRouter = (route: string) => {
  return render(
    <Web3Providers>
      <TokenForgeAuthProvider>
        <MemoryRouter initialEntries={[route]}>
          <Layout>
            <Routes>
              {/* Routes publiques */}
              <Route path="/" element={<Home />} />
              <Route path="/auth" element={<PublicGuard><Auth /></PublicGuard>} />
              <Route path="/docs" element={<Documentation />} />
              <Route path="/learn" element={<Learn />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/partnership" element={<Partnership />} />
              <Route path="/plans" element={<Plans />} />
              <Route path="/services" element={<Services />} />
              
              {/* Routes protégées */}
              <Route path="/dashboard" element={<AuthGuard><Dashboard /></AuthGuard>} />
              <Route path="/profile" element={<AuthGuard><Profile /></AuthGuard>} />
              <Route path="/create-token" element={<AuthGuard><CreateToken /></AuthGuard>} />
              <Route path="/tokens" element={<AuthGuard><TokenList /></AuthGuard>} />
              <Route path="/tokens/:id" element={<AuthGuard><TokenDetails /></AuthGuard>} />
              
              {/* Routes admin */}
              <Route path="/admin" element={<AdminGuard><AdminDashboard /></AdminGuard>} />
              
              {/* Route 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </MemoryRouter>
      </TokenForgeAuthProvider>
    </Web3Providers>
  );
};

describe('Router Integration Tests', () => {
  describe('Routes publiques', () => {
    it('rend la page d\'accueil', () => {
      renderWithRouter('/');
      expect(screen.getByText(/TokenForge/i)).toBeInTheDocument();
    });

    it('rend la page de documentation', () => {
      renderWithRouter('/docs');
      expect(screen.getByText(/Documentation/i)).toBeInTheDocument();
    });

    it('rend la page d\'apprentissage', () => {
      renderWithRouter('/learn');
      expect(screen.getByText(/Centre d'Apprentissage/i)).toBeInTheDocument();
    });

    it('rend la page de blog', () => {
      renderWithRouter('/blog');
      expect(screen.getByText(/Blog TokenForge/i)).toBeInTheDocument();
    });

    it('rend la page de partenariat', () => {
      renderWithRouter('/partnership');
      expect(screen.getByText(/Programme de Partenariat/i)).toBeInTheDocument();
    });

    it('rend la page des plans', () => {
      renderWithRouter('/plans');
      expect(screen.getByText(/Plans & Tarifs/i)).toBeInTheDocument();
    });

    it('rend la page des services', () => {
      renderWithRouter('/services');
      expect(screen.getByText(/Services/i)).toBeInTheDocument();
    });
  });

  describe('Routes protégées', () => {
    beforeEach(() => {
      vi.spyOn(require('@/features/auth/hooks/useTokenForgeAuth'), 'useTokenForgeAuth')
        .mockImplementation(() => ({
          isAuthenticated: false,
          isAdmin: false,
          isLoading: false
        }));
    });

    it('redirige vers /auth quand non authentifié', () => {
      renderWithRouter('/dashboard');
      expect(screen.getByText(/Connexion/i)).toBeInTheDocument();
    });

    it('permet l\'accès au dashboard quand authentifié', () => {
      vi.spyOn(require('@/features/auth/hooks/useTokenForgeAuth'), 'useTokenForgeAuth')
        .mockImplementation(() => ({
          isAuthenticated: true,
          isAdmin: false,
          isLoading: false
        }));
      renderWithRouter('/dashboard');
      expect(screen.getByText(/Tableau de bord/i)).toBeInTheDocument();
    });
  });

  describe('Routes admin', () => {
    it('redirige vers /auth quand non authentifié', () => {
      renderWithRouter('/admin');
      expect(screen.getByText(/Connexion/i)).toBeInTheDocument();
    });

    it('redirige vers / quand authentifié mais non admin', () => {
      vi.spyOn(require('@/features/auth/hooks/useTokenForgeAuth'), 'useTokenForgeAuth')
        .mockImplementation(() => ({
          isAuthenticated: true,
          isAdmin: false,
          isLoading: false
        }));
      renderWithRouter('/admin');
      expect(screen.getByText(/TokenForge/i)).toBeInTheDocument();
    });

    it('permet l\'accès à l\'admin quand authentifié et admin', () => {
      vi.spyOn(require('@/features/auth/hooks/useTokenForgeAuth'), 'useTokenForgeAuth')
        .mockImplementation(() => ({
          isAuthenticated: true,
          isAdmin: true,
          isLoading: false
        }));
      renderWithRouter('/admin');
      expect(screen.getByText(/Administration/i)).toBeInTheDocument();
    });
  });

  describe('Route 404', () => {
    it('rend la page 404 pour une route inexistante', () => {
      renderWithRouter('/route-inexistante');
      expect(screen.getByText(/404/i)).toBeInTheDocument();
    });
  });
});