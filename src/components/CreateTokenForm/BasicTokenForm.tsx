import React from 'react';
import {
  Box,
  TextField,
  FormControlLabel,
  Switch,
  Typography,
  Paper,
} from '@mui/material';
import { TokenType } from '../../types/tokens';

interface BasicTokenFormProps {
  tokenType: TokenType;
}

export const BasicTokenForm: React.FC<BasicTokenFormProps> = ({ tokenType }) => {
  const isERC20 = tokenType.id === 'erc20';
  const isNFT = tokenType.id === 'erc721' || tokenType.id === 'erc1155';

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Basic {tokenType.name} Configuration
      </Typography>
      
      <Box component="form" sx={{ mt: 3 }}>
        <TextField
          fullWidth
          label="Token Name"
          placeholder={isERC20 ? "e.g., 'My Token'" : "e.g., 'My NFT Collection'"}
          margin="normal"
          required
        />
        
        <TextField
          fullWidth
          label="Token Symbol"
          placeholder={isERC20 ? "e.g., 'MTK'" : "e.g., 'MNFT'"}
          margin="normal"
          required
        />

        {isERC20 && (
          <>
            <TextField
              fullWidth
              label="Initial Supply"
              type="number"
              placeholder="e.g., 1000000"
              margin="normal"
              required
            />
            
            <TextField
              fullWidth
              label="Decimals"
              type="number"
              defaultValue={18}
              margin="normal"
              required
            />
          </>
        )}

        {isNFT && (
          <TextField
            fullWidth
            label="Base URI"
            placeholder="e.g., https://api.mynft.com/tokens/"
            margin="normal"
            required
          />
        )}

        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Basic Features
          </Typography>
          
          <FormControlLabel
            control={<Switch defaultChecked />}
            label="Burnable (tokens can be destroyed)"
          />
          
          <FormControlLabel
            control={<Switch defaultChecked />}
            label="Mintable (new tokens can be created)"
          />
          
          <FormControlLabel
            control={<Switch />}
            label="Pausable (transfers can be paused)"
          />
        </Box>
      </Box>
    </Paper>
  );
};
