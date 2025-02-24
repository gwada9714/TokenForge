import React from 'react';
import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import { ChartPeriod } from '@/hooks/analytics/useTokenChartData';

interface PeriodSelectorProps {
  period: ChartPeriod;
  onChange: (period: ChartPeriod) => void;
}

export const PeriodSelector: React.FC<PeriodSelectorProps> = ({
  period,
  onChange,
}) => {
  const handlePeriodChange = (
    _event: React.MouseEvent<HTMLElement>,
    newPeriod: ChartPeriod | null
  ) => {
    if (newPeriod) {
      onChange(newPeriod);
    }
  };

  return (
    <ToggleButtonGroup
      value={period}
      exclusive
      onChange={handlePeriodChange}
      aria-label="période d'analyse"
      size="small"
    >
      <ToggleButton value="daily" aria-label="journalier">
        Journalier
      </ToggleButton>
      <ToggleButton value="weekly" aria-label="hebdomadaire">
        Hebdomadaire
      </ToggleButton>
      <ToggleButton value="monthly" aria-label="mensuel">
        Mensuel
      </ToggleButton>
    </ToggleButtonGroup>
  );
};

export default PeriodSelector;
