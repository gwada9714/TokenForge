import React from 'react';
import { Box } from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface UserActivityData {
  date: string;
  activeUsers: number;
  newUsers: number;
  transactions: number;
}

interface UserActivityChartProps {
  data: UserActivityData[];
}

export const UserActivityChart: React.FC<UserActivityChartProps> = ({ data }) => {
  return (
    <Box sx={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <LineChart
          data={data}
          margin={{
            top: 5,
            right: 30,
            left: 20,
            bottom: 5
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="activeUsers"
            name="Utilisateurs Actifs"
            stroke="#8884d8"
            activeDot={{ r: 8 }}
          />
          <Line
            type="monotone"
            dataKey="newUsers"
            name="Nouveaux Utilisateurs"
            stroke="#82ca9d"
          />
          <Line
            type="monotone"
            dataKey="transactions"
            name="Transactions"
            stroke="#ffc658"
          />
        </LineChart>
      </ResponsiveContainer>
    </Box>
  );
}; 