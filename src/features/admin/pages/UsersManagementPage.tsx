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
  Button
} from '@mui/material';
import {
  Search as SearchIcon,
  Edit as EditIcon,
  Block as BlockIcon,
  Delete as DeleteIcon,
  Add as AddIcon
} from '@mui/icons-material';

interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user' | 'moderator';
  status: 'active' | 'blocked' | 'pending';
  createdAt: string;
  lastLogin: string;
}

const mockUsers: User[] = [
  {
    id: '1',
    username: 'john_doe',
    email: 'john@example.com',
    role: 'admin',
    status: 'active',
    createdAt: '2024-01-01',
    lastLogin: '2024-02-24 10:30'
  },
  {
    id: '2',
    username: 'jane_smith',
    email: 'jane@example.com',
    role: 'user',
    status: 'active',
    createdAt: '2024-01-15',
    lastLogin: '2024-02-23 15:45'
  },
  {
    id: '3',
    username: 'bob_wilson',
    email: 'bob@example.com',
    role: 'moderator',
    status: 'blocked',
    createdAt: '2024-02-01',
    lastLogin: '2024-02-20 09:15'
  }
];

export const UsersManagementPage: React.FC = () => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');

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

  const getRoleColor = (role: User['role']) => {
    switch (role) {
      case 'admin':
        return 'error';
      case 'moderator':
        return 'warning';
      default:
        return 'primary';
    }
  };

  const getStatusColor = (status: User['status']) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'blocked':
        return 'error';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  const filteredUsers = mockUsers.filter(user =>
    user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Container maxWidth="lg">
      <Box mb={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Gestion des Utilisateurs
        </Typography>
      </Box>

      <Paper elevation={1}>
        <Box p={3}>
          {/* Barre d'outils */}
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <TextField
              size="small"
              placeholder="Rechercher un utilisateur..."
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
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
            >
              Nouvel Utilisateur
            </Button>
          </Box>

          {/* Table des utilisateurs */}
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Utilisateur</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Rôle</TableCell>
                  <TableCell>Statut</TableCell>
                  <TableCell>Créé le</TableCell>
                  <TableCell>Dernière connexion</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((user) => (
                    <TableRow key={user.id} hover>
                      <TableCell>{user.username}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Chip
                          label={user.role}
                          size="small"
                          color={getRoleColor(user.role)}
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={user.status}
                          size="small"
                          color={getStatusColor(user.status)}
                        />
                      </TableCell>
                      <TableCell>{user.createdAt}</TableCell>
                      <TableCell>{user.lastLogin}</TableCell>
                      <TableCell>
                        <IconButton size="small" color="primary">
                          <EditIcon fontSize="small" />
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
            count={filteredUsers.length}
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
