import React, { useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography,
  useTheme,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useAuditLogs, LogLevel, LogCategory } from '../../../../hooks/useAuditLogs';
import { AdminComponentProps } from '../types';
import { ForgeCard } from '../../../common/ForgeCard';

interface LogStats {
  byLevel: Record<LogLevel, number>;
  byCategory: Record<LogCategory, number>;
  byHour: Record<number, number>;
  total: number;
  lastDay: number;
  lastWeek: number;
}

export const AuditStats: React.FC<AdminComponentProps> = ({ onError }) => {
  const theme = useTheme();
  const { logs, isLoading, error } = useAuditLogs({ onError });

  const stats = useMemo<LogStats>(() => {
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;

    return logs.reduce(
      (acc, log) => {
        // Par niveau
        acc.byLevel[log.level] = (acc.byLevel[log.level] || 0) + 1;

        // Par catégorie
        acc.byCategory[log.category] = (acc.byCategory[log.category] || 0) + 1;

        // Par heure
        const hour = new Date(log.timestamp).getHours();
        acc.byHour[hour] = (acc.byHour[hour] || 0) + 1;

        // Statistiques temporelles
        if (log.timestamp >= oneDayAgo) acc.lastDay++;
        if (log.timestamp >= oneWeekAgo) acc.lastWeek++;

        acc.total++;
        return acc;
      },
      {
        byLevel: {} as Record<LogLevel, number>,
        byCategory: {} as Record<LogCategory, number>,
        byHour: {} as Record<number, number>,
        total: 0,
        lastDay: 0,
        lastWeek: 0,
      }
    );
  }, [logs]);

  const levelData = useMemo(
    () =>
      Object.entries(stats.byLevel).map(([level, count]) => ({
        name: level,
        value: count,
      })),
    [stats.byLevel]
  );

  const categoryData = useMemo(
    () =>
      Object.entries(stats.byCategory).map(([category, count]) => ({
        name: category,
        value: count,
      })),
    [stats.byCategory]
  );

  const hourlyData = useMemo(
    () =>
      Array.from({ length: 24 }, (_, hour) => ({
        hour: hour.toString().padStart(2, '0') + 'h',
        count: stats.byHour[hour] || 0,
      })),
    [stats.byHour]
  );

  const COLORS = {
    error: theme.palette.error.main,
    warning: theme.palette.warning.main,
    info: theme.palette.info.main,
    debug: theme.palette.grey[500],
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <ForgeCard>
          <CardHeader title="Statistiques Générales" />
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Typography variant="h4">{stats.total}</Typography>
              <Typography color="text.secondary">Logs au Total</Typography>

              <Box sx={{ mt: 2 }}>
                <Typography variant="h6">{stats.lastDay}</Typography>
                <Typography color="text.secondary">Dernières 24h</Typography>
              </Box>

              <Box sx={{ mt: 2 }}>
                <Typography variant="h6">{stats.lastWeek}</Typography>
                <Typography color="text.secondary">7 Derniers Jours</Typography>
              </Box>
            </Box>
          </CardContent>
        </ForgeCard>
      </Grid>

      <Grid item xs={12} md={4}>
        <ForgeCard>
          <CardHeader title="Distribution par Niveau" />
          <CardContent>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={levelData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    label
                  >
                    {levelData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[entry.name as keyof typeof COLORS]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </ForgeCard>
      </Grid>

      <Grid item xs={12} md={4}>
        <ForgeCard>
          <CardHeader title="Distribution par Catégorie" />
          <CardContent>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={categoryData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    label
                  >
                    {categoryData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={theme.palette.primary.main}
                        opacity={0.5 + (index * 0.5) / categoryData.length}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </ForgeCard>
      </Grid>

      <Grid item xs={12}>
        <ForgeCard>
          <CardHeader title="Distribution Horaire" />
          <CardContent>
            <Box sx={{ height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill={theme.palette.primary.main} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </ForgeCard>
      </Grid>
    </Grid>
  );
};

export default React.memo(AuditStats);
