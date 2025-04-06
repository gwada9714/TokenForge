import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";

interface ParallaxContainerProps {
  children: React.ReactNode;
  speed?: number; // Vitesse de l'effet parallaxe (1 = normal, 0.5 = moitié moins rapide)
  direction?: "up" | "down";
}

const Container = styled.div.attrs<{ $transform: string }>((props) => ({
  style: {
    transform: props.$transform,
  },
}))`
  position: relative;
  will-change: transform;
  transition: transform 0.1s linear;
`;

export const ParallaxContainer: React.FC<ParallaxContainerProps> = ({
  children,
  speed = 0.5,
  direction = "up",
}) => {
  const [offset, setOffset] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const scrolled = window.scrollY;
      const viewportHeight = window.innerHeight;

      // Ne déclencher l'effet que lorsque l'élément est visible
      if (rect.top < viewportHeight && rect.bottom > 0) {
        const newOffset =
          (scrolled - (rect.top + scrolled)) *
          speed *
          (direction === "up" ? -1 : 1);
        setOffset(newOffset);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Initial position

    return () => window.removeEventListener("scroll", handleScroll);
  }, [speed, direction]);

  return (
    <Container ref={containerRef} $transform={`translateY(${offset}px)`}>
      {children}
    </Container>
  );
};
