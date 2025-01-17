import React from 'react';
import styled, { keyframes } from 'styled-components';

const moveGradient = keyframes`
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
`;

const sparkle = keyframes`
  0% {
    transform: scale(0) rotate(0deg);
    opacity: 0;
  }
  50% {
    transform: scale(1) rotate(180deg);
    opacity: 0.5;
  }
  100% {
    transform: scale(0) rotate(360deg);
    opacity: 0;
  }
`;

const Background = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  overflow: hidden;
  z-index: -1;
  background: linear-gradient(
    135deg,
    ${props => props.theme.colors.primary.dark}80,
    ${props => props.theme.colors.primary.main}80,
    ${props => props.theme.colors.secondary.dark}40
  );
  background-size: 400% 400%;
  animation: ${moveGradient} 15s ease infinite;
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(
    circle at center,
    transparent 0%,
    ${props => props.theme.colors.primary.dark}80 100%
  );
`;

interface SparkleProps {
  $delay: number;
  $duration: number;
  $size: number;
  $top: number;
  $left: number;
}

const Sparkle = styled.div<SparkleProps>`
  position: absolute;
  width: ${props => props.$size}px;
  height: ${props => props.$size}px;
  top: ${props => props.$top}%;
  left: ${props => props.$left}%;
  background: radial-gradient(
    circle at center,
    ${props => props.theme.colors.secondary.light}80,
    transparent 70%
  );
  border-radius: 50%;
  animation: ${sparkle} ${props => props.$duration}s ease-in-out infinite;
  animation-delay: ${props => props.$delay}s;
`;

interface ForgeBackgroundProps {
  sparkleCount?: number;
}

const ForgeBackground: React.FC<ForgeBackgroundProps> = ({
  sparkleCount = 15
}) => {
  const sparkles = Array.from({ length: sparkleCount }).map((_, i) => ({
    id: i,
    delay: Math.random() * 3,
    duration: 2 + Math.random() * 2,
    size: 10 + Math.random() * 20,
    top: Math.random() * 100,
    left: Math.random() * 100
  }));

  return (
    <Background>
      <Overlay />
      {sparkles.map(sparkle => (
        <Sparkle
          key={sparkle.id}
          $delay={sparkle.delay}
          $duration={sparkle.duration}
          $size={sparkle.size}
          $top={sparkle.top}
          $left={sparkle.left}
        />
      ))}
    </Background>
  );
};

export default ForgeBackground;
