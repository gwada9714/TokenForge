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
import { useAuditLogs, LogLevel, LogCategory } from '../../hooks/useAuditLogs';

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

        // Par période
        if (log.timestamp >= oneDayAgo) acc.lastDay++;
        if (log.timestamp >= oneWeekAgo) acc.lastWeek++;
        if (log.timestamp >= oneMonthAgo) acc.lastMonth++;

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
        lastMonth: 0,
      }
    );
  }, [logs]);

  // Données pour le graphique par niveau
  const levelData = useMemo(
    () =>
      Object.entries(stats.byLevel).map(([level, count]) => ({
        name: level,
        value: count,
      })),
    [stats.byLevel]
  );

  // Données pour le graphique par catégorie
  const categoryData = useMemo(
    () =>
      Object.entries(stats.byCategory).map(([category, count]) => ({
        name: category,
        value: count,
      })),
    [stats.byCategory]
  );

  // Données pour le graphique par heure
  const hourlyData = useMemo(
    () =>
      Array.from({ length: 24 }, (_, hour) => ({
        hour,
        count: stats.byHour[hour] || 0,
      })),
    [stats.byHour]
  );

  // Couleurs pour les graphiques
  const COLORS = {
    info: theme.palette.info.main,
    warning: theme.palette.warning.main,
    error: theme.palette.error.main,
    critical: theme.palette.error.dark,
    security: theme.palette.primary.main,
    transaction: theme.palette.secondary.main,
    network: theme.palette.success.main,
    contract: theme.palette.warning.main,
    system: theme.palette.info.main,
  };

  return (
    <Box>
      {/* Statistiques générales */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Total des logs</Typography>
              <Typography variant="h4">{stats.total}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">Dernières 24h</Typography>
              <Typography variant="h4">{stats.lastDay}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">7 derniers jours</Typography>
              <Typography variant="h4">{stats.lastWeek}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h6">30 derniers jours</Typography>
              <Typography variant="h4">{stats.lastMonth}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Graphiques */}
      <Grid container spacing={2}>
        {/* Distribution par niveau */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardHeader title="Distribution par niveau" />
            <CardContent>
              <Box sx={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
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
              <Box sx={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
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
                      {categoryData.map((entry, index) => (
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

        {/* Distribution horaire */}
        <Grid item xs={12}>
          <Card>
            <CardHeader title="Distribution horaire" />
            <CardContent>
              <Box sx={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <BarChart data={hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="hour"
                      tickFormatter={hour => `${hour}h`}
                    />
                    <YAxis />
                    <Tooltip
                      labelFormatter={hour => `${hour}h`}
                      formatter={(value: number) => [value, 'Logs']}
                    />
                    <Bar
                      dataKey="count"
                      fill={theme.palette.primary.main}
                      name="Nombre de logs"
                    />
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
