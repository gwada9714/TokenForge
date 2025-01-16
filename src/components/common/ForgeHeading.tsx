import React from 'react';
import styled, { css } from 'styled-components';
import { fadeIn } from './styles/animations';

interface ForgeHeadingProps {
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  $hasGradient?: boolean;
  $isAnimated?: boolean;
  $align?: 'left' | 'center' | 'right';
  children: React.ReactNode;
}

const getFontSize = (level: number = 1) => {
  const sizes = {
    1: 'calc(2.5rem + 1vw)',
    2: 'calc(2rem + 0.5vw)',
    3: 'calc(1.5rem + 0.3vw)',
    4: 'calc(1.25rem + 0.2vw)',
    5: '1.25rem',
    6: '1rem'
  };
  return sizes[level as keyof typeof sizes];
};

const StyledHeading = styled(({ level, ...props }) => {
  const Tag = `h${level}` as keyof JSX.IntrinsicElements;
  return <Tag {...props} />;
})<ForgeHeadingProps>`
  font-family: ${props => props.theme.typography.fontFamily.heading};
  font-weight: ${props => props.theme.typography.fontWeight.bold};
  line-height: 1.2;
  margin-bottom: 0.5em;
  font-size: ${props => getFontSize(props.level)};
  text-align: ${props => props.$align};

  ${props => props.$hasGradient && css`
    background: linear-gradient(
      135deg,
      ${props.theme.colors.primary.main},
      ${props.theme.colors.secondary.main}
    );
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-fill-color: transparent;
  `}

  ${props => props.$isAnimated && css`
    animation: ${fadeIn} 0.5s ease-out;
  `}

  &:after {
    content: '';
    display: ${props => props.$hasGradient ? 'block' : 'none'};
    width: 50px;
    height: 4px;
    margin-top: 0.5em;
    background: ${props => props.theme.colors.secondary.main};
    border-radius: 2px;
    margin-left: ${props => props.$align === 'center' ? 'auto' : '0'};
    margin-right: ${props => props.$align === 'center' ? 'auto' : '0'};
    transform: scaleX(0);
    transform-origin: left;
    animation: scaleIn 0.5s ease-out forwards;
  }

  @keyframes scaleIn {
    to {
      transform: scaleX(1);
    }
  }
`;

export const ForgeHeading: React.FC<ForgeHeadingProps> = ({
  level = 1,
  $hasGradient = false,
  $isAnimated = true,
  $align = 'left',
  children,
  ...props
}) => {
  return (
    <StyledHeading
      level={level}
      $hasGradient={$hasGradient}
      $isAnimated={$isAnimated}
      $align={$align}
      {...props}
    >
      {children}
    </StyledHeading>
  );
};
