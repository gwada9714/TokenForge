import React from 'react';
import Image from 'next/image';
import { Box, Skeleton } from '@mui/material';

interface OptimizedImageProps {
  src: string;
  alt: string;
  width: number;
  height: number;
  priority?: boolean;
  className?: string;
  quality?: number;
}

const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  width,
  height,
  priority = false,
  className = '',
  quality = 75,
}) => {
  const [isLoading, setIsLoading] = React.useState(true);

  return (
    <Box position="relative" width={width} height={height} className={className}>
      {isLoading && (
        <Skeleton
          variant="rectangular"
          width={width}
          height={height}
          animation="wave"
          sx={{ position: 'absolute', top: 0, left: 0 }}
        />
      )}
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        quality={quality}
        priority={priority}
        onLoadingComplete={() => setIsLoading(false)}
        style={{
          objectFit: 'cover',
          opacity: isLoading ? 0 : 1,
          transition: 'opacity 0.3s ease-in-out',
        }}
      />
    </Box>
  );
};

export default React.memo(OptimizedImage);
