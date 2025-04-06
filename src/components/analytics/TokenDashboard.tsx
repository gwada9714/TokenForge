import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
} from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { TokenAnalytics, TokenEvent } from "@/types/analytics";
import { RootState } from "@/store/store";
import { TokenAnalyticsService } from "@/core/services/TokenAnalyticsService";
import { formatNumber, formatDate, shortenAddress } from "@/utils/format";
import { useNetwork } from "@/hooks/useNetwork";

const MetricCard: React.FC<{
  title: string;
  value: string;
  change?: string;
}> = ({ title, value, change }) => (
  <Card sx={{ height: "100%" }}>
    <CardContent>
      <Typography color="textSecondary" gutterBottom>
        {title}
      </Typography>
      <Typography variant="h5" component="div">
        {value}
      </Typography>
      {change && (
        <Typography
          color={change.startsWith("-") ? "error" : "success"}
          variant="body2"
        >
          {change}
        </Typography>
      )}
    </CardContent>
  </Card>
);

const EventsTable: React.FC<{ events: TokenEvent[] }> = ({ events }) => (
  <TableContainer component={Paper}>
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell>Type</TableCell>
          <TableCell>From</TableCell>
          <TableCell>To</TableCell>
          <TableCell align="right">Amount</TableCell>
          <TableCell>Time</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {events.map((event) => (
          <TableRow key={event.hash}>
            <TableCell>{event.type}</TableCell>
            <TableCell>{shortenAddress(event.from)}</TableCell>
            <TableCell>{shortenAddress(event.to)}</TableCell>
            <TableCell align="right">{formatNumber(event.amount)}</TableCell>
            <TableCell>
              <Typography>
                {formatDate(
                  typeof event.timestamp === "string"
                    ? new Date(event.timestamp)
                    : event.timestamp
                )}
              </Typography>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);

export const TokenDashboard: React.FC<{ tokenAddress: string }> = ({
  tokenAddress,
}) => {
  const dispatch = useDispatch();
  const { network } = useNetwork();
  const analytics = useSelector(
    (state: RootState) => state.analytics.tokens[tokenAddress]
  );
  const loading = useSelector((state: RootState) => state.analytics.loading);
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout>();

  useEffect(() => {
    if (!network) return;

    const fetchData = async () => {
      const service = new TokenAnalyticsService(network);
      try {
        const data = await service.getTokenAnalytics(tokenAddress);
        // dispatch update action
      } catch (error) {
        console.error("Error fetching analytics:", error);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30s
    setRefreshInterval(interval);

    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
    };
  }, [tokenAddress, network]);

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!analytics) {
    return (
      <Box textAlign="center" py={4}>
        <Typography>No data available</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Grid container spacing={3}>
        {/* Métriques principales */}
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Price"
            value={`$${formatNumber(analytics.metrics.price)}`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Market Cap"
            value={`$${formatNumber(analytics.metrics.marketCap)}`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="24h Volume"
            value={`$${formatNumber(analytics.metrics.volume24h)}`}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <MetricCard
            title="Holders"
            value={analytics.metrics.holders.toString()}
          />
        </Grid>

        {/* Graphique des prix */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Price History
              </Typography>
              <Box sx={{ height: 400 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.history.prices}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="timestamp"
                      tickFormatter={(value) =>
                        formatDate(
                          typeof value === "string" ? new Date(value) : value
                        )
                      }
                    />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="price"
                      stroke="#8884d8"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Tableau des événements récents */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Transactions
              </Typography>
              <EventsTable events={analytics.events.slice(0, 10)} />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
