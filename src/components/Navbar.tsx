// @ts-expect-error React is needed for JSX
import React from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '@/hooks/useAuth';
import { APP_NAME } from '@/config/constants';

const NavContainer = styled.nav`
  background-color: white;
  padding: 1rem 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Logo = styled(Link)`
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--color-primary);
`;

const NavLinks = styled.div`
  display: flex;
  gap: 2rem;
  align-items: center;
`;

const NavLink = styled(Link)`
  color: #4b5563;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s;

  &:hover {
    color: var(--color-primary);
  }
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  background-color: var(--color-primary);
  color: white;
  font-weight: 500;
  transition: background-color 0.2s;

  &:hover {
    background-color: var(--color-secondary);
  }
`;

export function Navbar() {
  const { isAuthenticated, logout } = useAuth();

  return (
    <NavContainer>
      <Logo to="/">{APP_NAME}</Logo>
      <NavLinks>
        {isAuthenticated ? (
          <>
            <NavLink to="/dashboard">Tableau de bord</NavLink>
            <NavLink to="/profile">Profil</NavLink>
            <Button onClick={logout}>Déconnexion</Button>
          </>
        ) : (
          <NavLink to="/auth">Connexion</NavLink>
        )}
      </NavLinks>
    </NavContainer>
  );
}
