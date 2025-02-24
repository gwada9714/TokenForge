import React from 'react';
import { Skeleton, Box, Container } from '@mui/material';

interface ContentSkeletonProps {
  rows?: number;
  variant?: 'text' | 'rectangular' | 'circular';
  height?: number | string;
  width?: number | string;
}

export const ContentSkeleton: React.FC<ContentSkeletonProps> = ({
  rows = 3,
  variant = 'rectangular',
  height = 100,
  width = '100%',
}) => {
  return (
    <Container>
      <Box sx={{ width: '100%', my: 2 }}>
        {Array.from(new Array(rows)).map((_, index) => (
          <Skeleton
            key={index}
            variant={variant}
            height={height}
            width={width}
            sx={{ my: 1 }}
            animation="wave"
          />
        ))}
      </Box>
    </Container>
  );
};

export default ContentSkeleton;
