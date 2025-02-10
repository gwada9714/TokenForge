import React from 'react';
import { Box, Typography, List, ListItem, ListItemText, ListItemSecondaryAction, IconButton } from '@mui/material';
import { Block, CheckCircle } from '@mui/icons-material';

export const UserManagement: React.FC = () => {
  const users = [
    { id: 1, name: 'User 1', email: 'user1@example.com', status: 'active' },
    { id: 2, name: 'User 2', email: 'user2@example.com', status: 'pending' },
  ];

  return (
    <Box>
      <List>
        {users.map((user) => (
          <ListItem key={user.id}>
            <ListItemText
              primary={user.name}
              secondary={user.email}
            />
            <ListItemSecondaryAction>
              <IconButton edge="end" aria-label="approve">
                <CheckCircle color="success" />
              </IconButton>
              <IconButton edge="end" aria-label="block">
                <Block color="error" />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </Box>
  );
};
