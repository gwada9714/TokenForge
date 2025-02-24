import React from 'react';
import { Outlet } from 'react-router-dom';
import styled from 'styled-components';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Sidebar } from '@/components/Sidebar';
import { useAuth } from '@/auth/AuthProvider';

const LayoutContainer = styled.div`
  min-height: 100vh;
  display: grid;
  grid-template-areas:
    "nav nav"
    "sidebar main"
    "footer footer";
  grid-template-columns: auto 1fr;
  grid-template-rows: auto 1fr auto;
`;

const Main = styled.main`
  grid-area: main;
  padding: 2rem;
  background-color: #f9fafb;
`;

const Nav = styled.nav`
  grid-area: nav;
  position: sticky;
  top: 0;
  z-index: 10;
`;

const SidebarWrapper = styled.aside`
  grid-area: sidebar;
`;

const FooterWrapper = styled.footer`
  grid-area: footer;
`;

export function Layout() {
  const { isAuthenticated } = useAuth();

  return (
    <LayoutContainer>
      <Nav>
        <Navbar />
      </Nav>
      {isAuthenticated && (
        <SidebarWrapper>
          <Sidebar />
        </SidebarWrapper>
      )}
      <Main>
        <Outlet />
      </Main>
      <FooterWrapper>
        <Footer />
      </FooterWrapper>
    </LayoutContainer>
  );
} 