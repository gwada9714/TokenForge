import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { StyledButton } from '@/components/ui/Button';
import { StyledProps } from '@/components/ui/types';
import { useTokenForgeAuth } from '@/features/auth';
import { useAccount } from 'wagmi';

interface HeaderContainerProps {
  isScrolled: boolean;
}

const HeaderContainer = styled.header<HeaderContainerProps>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 800;
  background-color: ${(props: HeaderContainerProps & StyledProps) => 
    props.isScrolled ? '#FFFFFF' : 'transparent'};
  backdrop-filter: ${(props: HeaderContainerProps) => 
    props.isScrolled ? 'blur(8px)' : 'none'};
  padding: 1rem 2rem;
  transition: all 0.2s ease-in-out;
  box-shadow: ${(props: HeaderContainerProps) => 
    props.isScrolled ? '0 1px 2px 0 rgba(0, 0, 0, 0.05)' : 'none'};
`;

const HeaderContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Logo = styled.div`
  font-family: 'Montserrat', sans-serif;
  font-weight: 700;
  font-size: 1.25rem;
  color: #182038;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  img {
    height: 32px;
  }
`;

const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: 1.5rem;

  @media (max-width: 768px) {
    display: none;
  }
`;

const NavLink = styled(Link)`
  color: #182038;
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem 1rem;
  transition: color 0.2s ease-in-out;

  &:hover {
    color: #4F46E5;
  }
`;

const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  padding: 0.5rem;
  cursor: pointer;
  color: #182038;

  @media (max-width: 768px) {
    display: block;
  }
`;

interface MobileMenuProps {
  isOpen: boolean;
}

const MobileMenu = styled.div<MobileMenuProps>`
  display: none;
  position: fixed;
  top: 60px;
  left: 0;
  right: 0;
  background-color: #FFFFFF;
  padding: 1rem;
  transform: translateY(${(props: MobileMenuProps) => props.isOpen ? '0' : '-100%'});
  transition: transform 0.2s ease-in-out;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    display: block;
  }
`;

const MobileNav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useTokenForgeAuth();
  const { isConnected } = useAccount();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleAuthClick = async () => {
    if (isAuthenticated) {
      await logout();
      navigate('/');
    } else {
      navigate('/auth/login');
    }
  };

  const handleWalletClick = () => {
    if (!isConnected) {
      navigate('/connect-wallet');
    }
  };

  return (
    <HeaderContainer isScrolled={isScrolled}>
      <HeaderContent>
        <Logo>
          <Link to="/">
            <img src="/logo.svg" alt="TokenForge" />
            TokenForge
          </Link>
        </Logo>

        <Nav>
          {isAuthenticated && (
            <>
              <NavLink to="/dashboard">Dashboard</NavLink>
              <NavLink to="/tokens">Mes Tokens</NavLink>
              {user?.isAdmin && <NavLink to="/admin">Admin</NavLink>}
            </>
          )}
          <NavLink to="/marketplace">Marketplace</NavLink>
          
          {!isAuthenticated && (
            <>
              <NavLink to="/about">À propos</NavLink>
              <NavLink to="/contact">Contact</NavLink>
            </>
          )}
          
          <StyledButton 
            $variant="secondary" 
            $size="medium" 
            onClick={handleAuthClick}
          >
            {isAuthenticated ? 'Déconnexion' : 'Connexion'}
          </StyledButton>
          
          {!isConnected && (
            <StyledButton 
              $variant="primary" 
              $size="medium"
              onClick={handleWalletClick}
            >
              Connecter Wallet
            </StyledButton>
          )}
        </Nav>

        <MobileMenuButton onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          ☰
        </MobileMenuButton>
      </HeaderContent>

      <MobileMenu isOpen={isMobileMenuOpen} data-testid="mobile-menu">
        <MobileNav>
          {isAuthenticated && (
            <>
              <NavLink to="/dashboard">Dashboard</NavLink>
              <NavLink to="/tokens">Mes Tokens</NavLink>
              {user?.isAdmin && <NavLink to="/admin">Admin</NavLink>}
            </>
          )}
          <NavLink to="/marketplace">Marketplace</NavLink>
          
          {!isAuthenticated && (
            <>
              <NavLink to="/about">À propos</NavLink>
              <NavLink to="/contact">Contact</NavLink>
            </>
          )}
          
          <StyledButton 
            $variant="secondary" 
            $size="medium" 
            $fullWidth
            onClick={handleAuthClick}
          >
            {isAuthenticated ? 'Déconnexion' : 'Connexion'}
          </StyledButton>
          
          {!isConnected && (
            <StyledButton 
              $variant="primary" 
              $size="medium"
              $fullWidth
              onClick={handleWalletClick}
            >
              Connecter Wallet
            </StyledButton>
          )}
        </MobileNav>
      </MobileMenu>
    </HeaderContainer>
  );
};