// @ts-expect-error React is needed for JSX
import React from "react";
import { NavLink } from "react-router-dom";
import styled from "styled-components";
import { navigationRoutes } from "@/router/routes";
import { useTokenForgeAuth } from "@/hooks/useAuth";

const SidebarContainer = styled.aside`
  width: 280px;
  background-color: white;
  border-right: 1px solid #e5e7eb;
  height: 100%;
  padding: 2rem 0;
`;

const NavItem = styled(NavLink)`
  display: flex;
  align-items: center;
  padding: 0.75rem 2rem;
  color: #4b5563;
  text-decoration: none;
  transition: all 0.2s;

  &:hover {
    background-color: #f3f4f6;
    color: var(--color-primary);
  }

  &.active {
    background-color: #f3f4f6;
    color: var(--color-primary);
    border-right: 3px solid var(--color-primary);
  }
`;

const NavSection = styled.div`
  margin-bottom: 2rem;

  h3 {
    padding: 0.75rem 2rem;
    color: #6b7280;
    font-size: 0.875rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }
`;

export function Sidebar() {
  const { isAuthenticated } = useTokenForgeAuth();

  const filteredRoutes = navigationRoutes.filter((route) => {
    if (route.isProtected && !isAuthenticated) return false;
    if (route.isPublic && isAuthenticated) return false;
    return true;
  });

  return (
    <SidebarContainer>
      <NavSection>
        <h3>Navigation</h3>
        {filteredRoutes.map((route) => (
          <NavItem key={route.path} to={route.path} end={route.path === "/"}>
            {route.title}
          </NavItem>
        ))}
      </NavSection>
    </SidebarContainer>
  );
}
