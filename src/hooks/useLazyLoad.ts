import { useEffect, useRef, useState } from 'react';

interface UseLazyLoadProps {
  threshold?: number;
  rootMargin?: string;
}

export const useLazyLoad = ({ threshold = 0.1, rootMargin = '50px' }: UseLazyLoadProps = {}) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(element);
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observer.observe(element);

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [threshold, rootMargin]);

  return { isVisible, elementRef };
};
