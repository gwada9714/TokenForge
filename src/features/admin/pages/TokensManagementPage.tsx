import React, { useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Chip,
  TextField,
  InputAdornment,
  Button,
  Menu,
  MenuItem
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Visibility as ViewIcon,
  Block as BlockIcon,
  Delete as DeleteIcon,
  CheckCircle as VerifyIcon
} from '@mui/icons-material';

interface Token {
  id: string;
  name: string;
  symbol: string;
  network: string;
  creator: string;
  status: 'verified' | 'pending' | 'blocked';
  totalSupply: string;
  holders: number;
  createdAt: string;
}

const mockTokens: Token[] = [
  {
    id: '1',
    name: 'MyToken',
    symbol: 'MTK',
    network: 'BSC',
    creator: '0x1234...5678',
    status: 'verified',
    totalSupply: '1,000,000',
    holders: 150,
    createdAt: '2024-02-24'
  },
  {
    id: '2',
    name: 'GameToken',
    symbol: 'GTK',
    network: 'Ethereum',
    creator: '0xabcd...efgh',
    status: 'pending',
    totalSupply: '500,000',
    holders: 75,
    createdAt: '2024-02-23'
  },
  {
    id: '3',
    name: 'ScamToken',
    symbol: 'SCAM',
    network: 'Polygon',
    creator: '0x9876...4321',
    status: 'blocked',
    totalSupply: '10,000,000',
    holders: 25,
    createdAt: '2024-02-22'
  }
];

export const TokensManagementPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAnchorEl, setFilterAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedNetwork, setSelectedNetwork] = useState<string>('all');

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(event.target.value);
    setPage(0);
  };

  const handleFilterClick = (event: React.MouseEvent<HTMLElement>) => {
    setFilterAnchorEl(event.currentTarget);
  };

  const handleFilterClose = () => {
    setFilterAnchorEl(null);
  };

  const handleNetworkSelect = (network: string) => {
    setSelectedNetwork(network);
    handleFilterClose();
  };

  const getStatusColor = (status: Token['status']) => {
    switch (status) {
      case 'verified':
        return 'success';
      case 'pending':
        return 'warning';
      case 'blocked':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusIcon = (status: Token['status']) => {
    switch (status) {
      case 'verified':
        return <VerifyIcon fontSize="small" />;
      case 'pending':
        return <ViewIcon fontSize="small" />;
      case 'blocked':
        return <BlockIcon fontSize="small" />;
      default:
        return null;
    }
  };

  const filteredTokens = mockTokens.filter(token =>
    (token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    token.symbol.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (selectedNetwork === 'all' || token.network === selectedNetwork)
  );

  return (
    <Container maxWidth="lg">
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Gestion des Tokens
        </Typography>
      </Box>

      <Paper elevation={1}>
        <Box p={3}>
          {/* Barre d'outils */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Box display="flex" gap={2}>
              <TextField
                size="small"
                placeholder="Rechercher un token..."
                value={searchQuery}
                onChange={handleSearch}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  )
                }}
              />
              <Button
                variant="outlined"
                startIcon={<FilterIcon />}
                onClick={handleFilterClick}
              >
                Filtrer
              </Button>
              <Menu
                anchorEl={filterAnchorEl}
                open={Boolean(filterAnchorEl)}
                onClose={handleFilterClose}
              >
                <MenuItem onClick={() => handleNetworkSelect('all')}>
                  Tous les réseaux
                </MenuItem>
                <MenuItem onClick={() => handleNetworkSelect('BSC')}>BSC</MenuItem>
                <MenuItem onClick={() => handleNetworkSelect('Ethereum')}>Ethereum</MenuItem>
                <MenuItem onClick={() => handleNetworkSelect('Polygon')}>Polygon</MenuItem>
              </Menu>
            </Box>
          </Box>

          {/* Table des tokens */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nom</TableCell>
                  <TableCell>Symbole</TableCell>
                  <TableCell>Réseau</TableCell>
                  <TableCell>Créateur</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell>Supply Totale</TableCell>
                  <TableCell>Holders</TableCell>
                  <TableCell>Créé le</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTokens
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((token) => (
                    <TableRow key={token.id} hover>
                      <TableCell>{token.name}</TableCell>
                      <TableCell>{token.symbol}</TableCell>
                      <TableCell>
                        <Chip label={token.network} size="small" variant="outlined" />
                      </TableCell>
                      <TableCell>{token.creator}</TableCell>
                      <TableCell>
                        <Chip
                          icon={getStatusIcon(token.status)}
                          label={token.status}
                          size="small"
                          color={getStatusColor(token.status)}
                        />
                      </TableCell>
                      <TableCell>{token.totalSupply}</TableCell>
                      <TableCell>{token.holders}</TableCell>
                      <TableCell>{token.createdAt}</TableCell>
                      <TableCell>
                        <IconButton size="small" color="primary">
                          <ViewIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="warning">
                          <BlockIcon fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error">
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>

          <TablePagination
            component="div"
            count={filteredTokens.length}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            labelRowsPerPage="Lignes par page"
          />
        </Box>
      </Paper>
    </Container>
  );
};
