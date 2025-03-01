import React, { useState } from 'react';
import { 
  List, 
  ListItem, 
  ListItemAvatar, 
  ListItemText, 
  Avatar, 
  Typography, 
  Chip, 
  IconButton, 
  Box, 
  Divider,
  Button,
  useTheme
} from '@mui/material';
import { 
  Person as PersonIcon, 
  MoreVert as MoreVertIcon,
  Add as AddIcon
} from '@mui/icons-material';

// Types pour les utilisateurs
interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'moderator';
  status: 'active' | 'inactive' | 'pending';
  lastActive: string;
}

/**
 * Composant de gestion des utilisateurs
 * Affiche la liste des utilisateurs avec leurs rôles et statuts
 */
export const UserManagement: React.FC = () => {
  const theme = useTheme();
  const [users] = useState<User[]>([
    {
      id: '1',
      name: 'Admin User',
      email: 'admin@tokenforge.com',
      role: 'admin',
      status: 'active',
      lastActive: '2025-03-01T14:32:21'
    },
    {
      id: '2',
      name: 'John Doe',
      email: 'john@example.com',
      role: 'user',
      status: 'active',
      lastActive: '2025-03-01T12:15:45'
    },
    {
      id: '3',
      name: 'Jane Smith',
      email: 'jane@example.com',
      role: 'moderator',
      status: 'active',
      lastActive: '2025-03-01T10:22:33'
    },
    {
      id: '4',
      name: 'Bob Johnson',
      email: 'bob@example.com',
      role: 'user',
      status: 'inactive',
      lastActive: '2025-02-28T16:45:12'
    },
    {
      id: '5',
      name: 'Alice Brown',
      email: 'alice@example.com',
      role: 'user',
      status: 'pending',
      lastActive: '2025-03-01T08:10:05'
    }
  ]);

  // Fonction pour formater la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Fonction pour obtenir la couleur du rôle
  const getRoleColor = (role: 'admin' | 'user' | 'moderator') => {
    switch (role) {
      case 'admin':
        return theme.palette.error.main;
      case 'moderator':
        return theme.palette.warning.main;
      case 'user':
        return theme.palette.primary.main;
    }
  };

  // Fonction pour obtenir la couleur du statut
  const getStatusColor = (status: 'active' | 'inactive' | 'pending') => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'error';
      case 'pending':
        return 'warning';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="subtitle1">
          Utilisateurs récents
        </Typography>
        <Button 
          variant="contained" 
          size="small" 
          startIcon={<AddIcon />}
          sx={{ borderRadius: 2 }}
        >
          Ajouter
        </Button>
      </Box>
      
      <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
        {users.map((user, index) => (
          <React.Fragment key={user.id}>
            <ListItem
              alignItems="flex-start"
              secondaryAction={
                <IconButton edge="end" aria-label="options">
                  <MoreVertIcon />
                </IconButton>
              }
            >
              <ListItemAvatar>
                <Avatar sx={{ bgcolor: getRoleColor(user.role) }}>
                  <PersonIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="subtitle2" component="span">
                      {user.name}
                    </Typography>
                    <Chip 
                      label={user.role} 
                      size="small" 
                      sx={{ 
                        ml: 1, 
                        bgcolor: `${getRoleColor(user.role)}20`,
                        color: getRoleColor(user.role),
                        fontWeight: 'bold',
                        fontSize: '0.7rem'
                      }} 
                    />
                    <Chip 
                      label={user.status} 
                      size="small" 
                      color={getStatusColor(user.status)}
                      sx={{ ml: 1, fontSize: '0.7rem' }} 
                    />
                  </Box>
                }
                secondary={
                  <React.Fragment>
                    <Typography
                      sx={{ display: 'block' }}
                      component="span"
                      variant="body2"
                      color="text.primary"
                    >
                      {user.email}
                    </Typography>
                    <Typography
                      component="span"
                      variant="body2"
                      color="text.secondary"
                    >
                      Dernière activité: {formatDate(user.lastActive)}
                    </Typography>
                  </React.Fragment>
                }
              />
            </ListItem>
            {index < users.length - 1 && <Divider variant="inset" component="li" />}
          </React.Fragment>
        ))}
      </List>
      
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Button 
          variant="text" 
          size="small"
          sx={{ borderRadius: 2 }}
        >
          Voir tous les utilisateurs
        </Button>
      </Box>
    </Box>
  );
};
