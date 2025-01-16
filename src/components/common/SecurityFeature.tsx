import React from 'react';
import styled, { keyframes } from 'styled-components';
import { ForgeCard } from './ForgeCard';

const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(24, 32, 56, 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(24, 32, 56, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(24, 32, 56, 0);
  }
`;

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const Container = styled(ForgeCard)`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 2rem;
  position: relative;
  overflow: hidden;
  height: 100%;

  &:hover {
    .security-icon {
      animation: ${pulse} 2s infinite;
    }
    
    .security-bg {
      transform: scale(1.1);
    }
  }
`;

const IconWrapper = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: ${props => props.theme.colors.gradient.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  position: relative;
  z-index: 2;
  transition: transform 0.3s ease;

  &.security-icon {
    svg {
      width: 32px;
      height: 32px;
      color: ${props => props.theme.colors.text.light};
    }
  }
`;

const Title = styled.h3`
  font-family: ${props => props.theme.typography.fontFamily.heading};
  font-size: 1.25rem;
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 1rem;
  position: relative;
  z-index: 2;
`;

const Description = styled.p`
  color: ${props => props.theme.colors.text.secondary};
  line-height: 1.6;
  position: relative;
  z-index: 2;
`;

const BackgroundIcon = styled.div`
  position: absolute;
  top: -20%;
  right: -20%;
  width: 200px;
  height: 200px;
  opacity: 0.03;
  transform: rotate(-15deg);
  transition: transform 0.3s ease;

  &.security-bg {
    svg {
      width: 100%;
      height: 100%;
    }
  }
`;

const StatusBadge = styled.div<{ $status: 'active' | 'completed' | 'pending' }>`
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  z-index: 2;

  ${props => {
    switch (props.$status) {
      case 'active':
        return `
          background-color: ${props.theme.colors.success.main};
          animation: ${pulse} 2s infinite;
        `;
      case 'completed':
        return `
          background-color: ${props.theme.colors.success.main};
        `;
      case 'pending':
        return `
          background-color: ${props.theme.colors.warning.main};
        `;
      default:
        return '';
    }
  }}
`;

interface SecurityFeatureProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  status?: 'active' | 'completed' | 'pending';
  className?: string;
}

export const SecurityFeature: React.FC<SecurityFeatureProps> = ({
  icon,
  title,
  description,
  status = 'completed',
  className
}) => {
  return (
    <Container className={className}>
      <StatusBadge $status={status} />
      <IconWrapper className="security-icon">
        {icon}
      </IconWrapper>
      <Title>{title}</Title>
      <Description>{description}</Description>
      <BackgroundIcon className="security-bg">
        {icon}
      </BackgroundIcon>
    </Container>
  );
};
