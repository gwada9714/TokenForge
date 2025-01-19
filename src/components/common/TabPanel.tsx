import React from 'react';
import { Box, Fade } from '@mui/material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

export const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => {
  const isSelected = value === index;

  return (
    <div
      role="tabpanel"
      hidden={!isSelected}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      aria-hidden={!isSelected}
    >
      <Fade in={isSelected} timeout={300}>
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      </Fade>
    </div>
  );
};

export const a11yProps = (index: number) => {
  return {
    id: `admin-tab-${index}`,
    'aria-controls': `admin-tabpanel-${index}`,
  };
};
