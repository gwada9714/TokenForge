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
`;

interface IconWrapperProps {
  $status: 'active' | 'completed' | 'pending';
}

const IconWrapper = styled.div<IconWrapperProps>`
  width: 64px;
  height: 64px;
  margin-bottom: 1.5rem;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  background: ${props => props.theme.colors.forge.metallic};
  animation: ${props => props.$status === 'active' ? pulse : 'none'} 2s infinite;

  svg {
    width: 32px;
    height: 32px;
    color: ${props => props.theme.colors.text.light};
  }
`;

const Title = styled.h3`
  font-family: ${props => props.theme.typography.fontFamily.heading};
  font-size: 1.25rem;
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 0.75rem;
`;

const Description = styled.p`
  font-family: ${props => props.theme.typography.fontFamily.body};
  font-size: 1rem;
  color: ${props => props.theme.colors.text.secondary};
  line-height: 1.5;
`;

interface StatusBadgeProps {
  $status: 'active' | 'completed' | 'pending';
}

const StatusBadge = styled.div<StatusBadgeProps>`
  position: absolute;
  top: -4px;
  right: -4px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: ${props => {
    switch (props.$status) {
      case 'active':
        return props.theme.colors.success.main;
      case 'completed':
        return props.theme.colors.primary.main;
      case 'pending':
        return props.theme.colors.text.secondary;
      default:
        return props.theme.colors.text.secondary;
    }
  }};
  border: 2px solid ${props => props.theme.colors.background.paper};
  animation: ${props => props.$status === 'active' ? rotate : 'none'} 2s linear infinite;
`;

interface SecurityFeatureProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  status?: 'active' | 'completed' | 'pending';
  className?: string;
}

const SecurityFeature: React.FC<SecurityFeatureProps> = ({
  icon,
  title,
  description,
  status = 'completed',
  className
}) => {
  return (
    <Container className={className}>
      <IconWrapper $status={status}>
        {icon}
        <StatusBadge $status={status} />
      </IconWrapper>
      <Title>{title}</Title>
      <Description>{description}</Description>
    </Container>
  );
};

export default SecurityFeature;
