import React, { useState, useEffect } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  CircularProgress,
  TablePagination,
} from '@mui/material';

interface TokenEvent {
  id: string;
  event: string;
  from: string;
  to: string;
  amount?: string;
  timestamp: number;
  transactionHash: string;
}

interface TokenHistoryProps {
  tokenAddress: string;
}

export const TokenHistory: React.FC<TokenHistoryProps> = ({ tokenAddress }) => {
  const [events, setEvents] = useState<TokenEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // TODO: Implement actual event fetching logic
        // This is mock data for demonstration
        const mockEvents: TokenEvent[] = [
          {
            id: '1',
            event: 'Transfer',
            from: '0x1234...5678',
            to: '0x8765...4321',
            amount: '1000',
            timestamp: Date.now(),
            transactionHash: '0xabcd...efgh',
          },
          // Add more mock events as needed
        ];

        setEvents(mockEvents);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching events:', error);
        setLoading(false);
      }
    };

    fetchEvents();
  }, [tokenAddress]);

  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (events.length === 0) {
    return (
      <Box textAlign="center" py={3}>
        <Typography color="textSecondary">
          No events found for this token
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Event</TableCell>
              <TableCell>From</TableCell>
              <TableCell>To</TableCell>
              <TableCell align="right">Amount</TableCell>
              <TableCell>Time</TableCell>
              <TableCell>Transaction</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {events
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((event) => (
                <TableRow key={event.id}>
                  <TableCell>{event.event}</TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      {event.from}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                      {event.to}
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    {event.amount}
                  </TableCell>
                  <TableCell>
                    {new Date(event.timestamp).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        fontFamily: 'monospace',
                        textOverflow: 'ellipsis',
                        overflow: 'hidden',
                        maxWidth: '100px',
                      }}
                    >
                      {event.transactionHash}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={events.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25]}
      />
    </Box>
  );
};

export default React.memo(TokenHistory);
