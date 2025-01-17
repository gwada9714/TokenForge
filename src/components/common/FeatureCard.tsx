import React from "react";
import styled, { keyframes } from "styled-components";
import { ForgeCard } from "./ForgeCard";

const iconFloat = keyframes`
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
`;

const IconWrapper = styled.div`
  width: 64px;
  height: 64px;
  margin-bottom: 1.5rem;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  background: ${(props) => props.theme.colors.forge.metallic};

  &:before {
    content: "";
    position: absolute;
    inset: -2px;
    border-radius: 18px;
    padding: 2px;
    background: linear-gradient(
      45deg,
      ${(props) => props.theme.colors.forge.glow},
      transparent
    );
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask: linear-gradient(#fff 0 0) content-box,
      linear-gradient(#fff 0 0);
    mask-composite: exclude;
    -webkit-mask-composite: destination-out;
  }

  svg {
    width: 32px;
    height: 32px;
    color: ${(props) => props.theme.colors.text.light};
    animation: ${iconFloat} 3s ease-in-out infinite;
  }
`;

const Title = styled.h3`
  font-family: ${(props) => props.theme.typography.fontFamily.heading};
  font-size: 1.5rem;
  font-weight: ${(props) => props.theme.typography.fontWeight.bold};
  margin-bottom: 1rem;
  color: ${(props) => props.theme.colors.text.primary};
`;

const Description = styled.p`
  color: ${(props) => props.theme.colors.text.secondary};
  line-height: 1.6;
  margin-bottom: 1.5rem;
`;

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  className?: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  className,
}) => {
  return (
    <ForgeCard variant="elevated" $hasShadow className={className}>
      <IconWrapper>{icon}</IconWrapper>
      <Title>{title}</Title>
      <Description>{description}</Description>
    </ForgeCard>
  );
};

export default FeatureCard;
