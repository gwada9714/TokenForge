import React, { useMemo } from 'react';
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Grid,
  Typography,
  useTheme,
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

interface LogStats {
  byLevel: Record<LogLevel, number>;
  byCategory: Record<LogCategory, number>;
  byHour: Record<number, number>;
  total: number;
  lastDay: number;
  lastWeek: number;
  lastMonth: number;
}

export const AuditStats: React.FC = () => {
  const { logs } = useAuditLogs();
  const theme = useTheme();

  // Calculer les statistiques
  const stats = useMemo((): LogStats => {
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000;
    const oneMonthAgo = now - 30 * 24 * 60 * 60 * 1000;

    return logs.reduce(
      (acc, log) => {
        // Par niveau
        acc.byLevel[log.level] = (acc.byLevel[log.level] || 0) + 1;

        // Par catégorie
        acc.byCategory[log.category] = (acc.byCategory[log.category] || 0) + 1;

        // Par heure
        const hour = new Date(log.timestamp).getHours();
        acc.byHour[hour] = (acc.byHour[hour] || 0) + 1;

        // Totaux par période
        const timestamp = log.timestamp;
        acc.total++;
        if (timestamp >= oneDayAgo) acc.lastDay++;
        if (timestamp >= oneWeekAgo) acc.lastWeek++;
        if (timestamp >= oneMonthAgo) acc.lastMonth++;

        return acc;
      },
      {
        byLevel: {} as Record<LogLevel, number>,
        byCategory: {} as Record<LogCategory, number>,
        byHour: {} as Record<number, number>,
        total: 0,
        lastDay: 0,
        lastWeek: 0,
        lastMonth: 0,
      }
    );
  }, [logs]);

  // Données pour les graphiques
  const levelData = Object.entries(stats.byLevel).map(([level, count]) => ({
    name: level,
    value: count,
  }));

  const categoryData = Object.entries(stats.byCategory).map(([category, count]) => ({
    name: category,
    value: count,
  }));

  const hourlyData = Array.from({ length: 24 }, (_, hour) => ({
    hour: `${hour}h`,
    count: stats.byHour[hour] || 0,
  }));

  // Couleurs pour les graphiques
  const COLORS = {
    ERROR: theme.palette.error.main,
    WARNING: theme.palette.warning.main,
    INFO: theme.palette.info.main,
    DEBUG: theme.palette.success.light,
  };

  return (
    <Box sx={{ mt: 3 }}>
      <Grid container spacing={3}>
        {/* Statistiques générales */}
        <Grid item xs={12}>
          <Card>
            <CardHeader title="Vue d'ensemble" />
            <CardContent>
              <Grid container spacing={2}>
                <Grid item xs={3}>
                  <Typography variant="h6">{stats.total}</Typography>
                  <Typography color="textSecondary">Total des logs</Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="h6">{stats.lastDay}</Typography>
                  <Typography color="textSecondary">Dernières 24h</Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="h6">{stats.lastWeek}</Typography>
                  <Typography color="textSecondary">7 derniers jours</Typography>
                </Grid>
                <Grid item xs={3}>
                  <Typography variant="h6">{stats.lastMonth}</Typography>
                  <Typography color="textSecondary">30 derniers jours</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Distribution par niveau */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Distribution par niveau" />
            <CardContent>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={levelData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
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
          </Card>
        </Grid>

        {/* Distribution par catégorie */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Distribution par catégorie" />
            <CardContent>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {categoryData.map((_entry, index) => (
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
          </Card>
        </Grid>

        {/* Distribution horaire */}
        <Grid item xs={12}>
          <Card>
            <CardHeader title="Distribution horaire" />
            <CardContent>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
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
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AuditStats;
