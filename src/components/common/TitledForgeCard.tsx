import React from 'react';
import { Typography } from '@mui/material';
import { ForgeCard, ForgeCardProps } from './ForgeCard';

interface TitledForgeCardProps extends Omit<ForgeCardProps, 'children'> {
  title: string;
  children?: React.ReactNode;
}

export const TitledForgeCard: React.FC<TitledForgeCardProps> = ({ title, children, ...props }) => {
  return (
    <ForgeCard {...props}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      {children}
    </ForgeCard>
  );
};
