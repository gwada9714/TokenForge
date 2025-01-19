import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemText
} from '@mui/material';
import { Chain } from 'viem';

interface NetworkAlertDialogProps {
  open: boolean;
  onClose: () => void;
  onNetworkSelect: (chain: Chain) => void;
  networks: Chain[];
  currentNetwork?: number;
}

export const NetworkAlertDialog: React.FC<NetworkAlertDialogProps> = ({
  open,
  onClose,
  onNetworkSelect,
  networks,
  currentNetwork
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Changer de réseau</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Veuillez sélectionner le réseau sur lequel vous souhaitez basculer :
        </DialogContentText>
        <List>
          {networks.map((network) => (
            <ListItem key={network.id} disablePadding>
              <ListItemButton 
                onClick={() => onNetworkSelect(network)}
                selected={currentNetwork === network.id}
              >
                <ListItemText 
                  primary={network.name}
                  secondary={currentNetwork === network.id ? '(Réseau actuel)' : ''}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
      </DialogActions>
    </Dialog>
  );
};

export default NetworkAlertDialog;
