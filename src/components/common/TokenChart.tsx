import React from 'react';
import styled from 'styled-components';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import { ForgeCard } from './ForgeCard';

interface TokenChartProps {
  data: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  title?: string;
  type?: 'pie' | 'donut';
  className?: string;
}

const ChartContainer = styled.div`
  width: 100%;
  height: 300px;
`;

const Title = styled.h4`
  font-family: ${props => props.theme.typography.fontFamily.heading};
  font-size: 1.25rem;
  font-weight: ${props => props.theme.typography.fontWeight.semibold};
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: 1rem;
  text-align: center;
`;

const CustomTooltip = styled.div`
  background: ${props => props.theme.colors.background.paper};
  border: 1px solid ${props => props.theme.colors.primary.main}20;
  border-radius: 8px;
  padding: 0.75rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const TooltipLabel = styled.p`
  font-weight: ${props => props.theme.typography.fontWeight.medium};
  margin-bottom: 0.25rem;
`;

const TooltipValue = styled.p`
  color: ${props => props.theme.colors.text.secondary};
`;

const CustomLegend = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const LegendColor = styled.div<{ $color: string }>`
  width: 12px;
  height: 12px;
  border-radius: 3px;
  background-color: ${props => props.$color};
`;

const LegendLabel = styled.span`
  font-size: 0.875rem;
  color: ${props => props.theme.colors.text.secondary};
`;

const CustomizedTooltip: React.FC<any> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <CustomTooltip>
        <TooltipLabel>{data.name}</TooltipLabel>
        <TooltipValue>{data.value}%</TooltipValue>
      </CustomTooltip>
    );
  }
  return null;
};

const CustomizedLegend: React.FC<{ data: TokenChartProps['data'] }> = ({ data }) => (
  <CustomLegend>
    {data.map((entry, index) => (
      <LegendItem key={index}>
        <LegendColor $color={entry.color} />
        <LegendLabel>{entry.name} ({entry.value}%)</LegendLabel>
      </LegendItem>
    ))}
  </CustomLegend>
);

const TokenChart: React.FC<TokenChartProps> = ({
  data,
  title,
  type = 'donut',
  className
}) => {
  const innerRadius = type === 'donut' ? '60%' : '0';
  
  return (
    <ForgeCard className={className}>
      {title && <Title>{title}</Title>}
      <ChartContainer>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={innerRadius}
              outerRadius="80%"
              dataKey="value"
              labelLine={false}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomizedTooltip />} />
            <Legend content={<CustomizedLegend data={data} />} />
          </PieChart>
        </ResponsiveContainer>
      </ChartContainer>
    </ForgeCard>
  );
};

export default TokenChart;
