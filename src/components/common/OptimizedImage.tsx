import React, { useState } from 'react';
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
  const [isLoading, setIsLoading] = useState(true);

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
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className={className}
        loading={priority ? "eager" : "lazy"}
        onLoad={() => setIsLoading(false)}
        style={{
          objectFit: 'cover',
          display: isLoading ? 'none' : 'block',
        }}
      />
    </Box>
  );
};

export default React.memo(OptimizedImage);
