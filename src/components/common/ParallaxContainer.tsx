import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

interface ParallaxContainerProps {
  children: React.ReactNode;
  speed?: number; // Vitesse de l'effet parallaxe (1 = normal, 0.5 = moitié moins rapide)
  direction?: 'up' | 'down';
}

const Container = styled.div<{ $transform: string }>`
  position: relative;
  will-change: transform;
  transform: ${props => props.$transform};
  transition: transform 0.1s linear;
`;

export const ParallaxContainer: React.FC<ParallaxContainerProps> = ({
  children,
  speed = 0.5,
  direction = 'up'
}) => {
  const [offset, setOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const scrolled = window.scrollY;
      
      // Ne déclencher l'effet que lorsque l'élément est visible
      if (rect.top < window.innerHeight && rect.bottom > 0) {
        const scrollOffset = (scrolled * speed) * (direction === 'up' ? -1 : 1);
        setOffset(scrollOffset);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [speed, direction]);

  return (
    <Container
      ref={containerRef}
      $transform={`translateY(${offset}px)`}
    >
      {children}
    </Container>
  );
};
