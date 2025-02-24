import React from 'react';
import styled from 'styled-components';
import { Container, Text } from './common/styles';
import { APP_NAME } from '@/config/constants';
import { COLORS, SPACING } from '@/config/constants/theme';

const FooterContainer = styled.footer`
  background-color: ${COLORS.background.primary};
  border-top: 1px solid ${COLORS.border};
  padding: ${SPACING.xl} 0;
  margin-top: auto;
`;

const FooterContent = styled(Container)`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const Copyright = styled(Text)`
  font-size: 0.875rem;
  margin-bottom: 0;
`;

const FooterLinks = styled.div`
  display: flex;
  gap: ${SPACING.xl};
`;

const FooterLink = styled.a`
  color: ${COLORS.text.secondary};
  font-size: 0.875rem;
  text-decoration: none;
  transition: color 0.2s;

  &:hover {
    color: var(--color-primary);
  }
`;

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <FooterContainer>
      <FooterContent>
        <Copyright>
          © {currentYear} {APP_NAME}. Tous droits réservés.
        </Copyright>
        <FooterLinks>
          <FooterLink href="/privacy">Confidentialité</FooterLink>
          <FooterLink href="/terms">Conditions d'utilisation</FooterLink>
          <FooterLink href="/contact">Contact</FooterLink>
        </FooterLinks>
      </FooterContent>
    </FooterContainer>
  );
} 