import React from 'react';
import {
  Box,
  TextField,
  FormControlLabel,
  Switch,
  Typography,
  Paper,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { TokenType } from '../../types/tokens';

interface AdvancedTokenFormProps {
  tokenType: TokenType;
}

export const AdvancedTokenForm: React.FC<AdvancedTokenFormProps> = ({ tokenType }) => {
  const isERC20 = tokenType.id === 'erc20';
  const isNFT = tokenType.id === 'erc721' || tokenType.id === 'erc1155';
  const isERC4626 = tokenType.id === 'erc4626';

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Advanced {tokenType.name} Configuration
      </Typography>
      
      <Box component="form" sx={{ mt: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Token Name"
              placeholder={isERC20 ? "e.g., 'My Token'" : "e.g., 'My NFT Collection'"}
              required
            />
          </Grid>
          
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Token Symbol"
              placeholder={isERC20 ? "e.g., 'MTK'" : "e.g., 'MNFT'"}
              required
            />
          </Grid>

          {isERC20 && (
            <>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Initial Supply"
                  type="number"
                  placeholder="e.g., 1000000"
                  required
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Max Supply"
                  type="number"
                  placeholder="e.g., 1000000000 (0 for unlimited)"
                />
              </Grid>
              
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Decimals"
                  type="number"
                  defaultValue={18}
                  required
                />
              </Grid>
            </>
          )}

          {isNFT && (
            <>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Base URI"
                  placeholder="e.g., https://api.mynft.com/tokens/"
                  required
                />
              </Grid>
            </>
          )}

          {isERC4626 && (
            <>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Asset Token Address"
                  placeholder="e.g., 0x..."
                  required
                />
              </Grid>
            </>
          )}

          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Access Control</InputLabel>
              <Select
                defaultValue="ownable"
                label="Access Control"
              >
                <MenuItem value="ownable">Ownable (Single Owner)</MenuItem>
                <MenuItem value="roles">Access Control Roles</MenuItem>
                <MenuItem value="none">None</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Token Features
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Burnable"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={<Switch defaultChecked />}
                  label="Mintable"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={<Switch />}
                  label="Pausable"
                />
              </Grid>
              
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={<Switch />}
                  label="Upgradeable"
                />
              </Grid>

              {isERC20 && (
                <>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={<Switch />}
                      label="Permit"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={<Switch />}
                      label="Flash Minting"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={<Switch />}
                      label="Snapshots"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={<Switch />}
                      label="Votes"
                    />
                  </Grid>
                </>
              )}

              {isNFT && (
                <>
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={<Switch />}
                      label="Batch Minting"
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6}>
                    <FormControlLabel
                      control={<Switch />}
                      label="Enumerable"
                    />
                  </Grid>
                </>
              )}
            </Grid>
          </Grid>
        </Grid>
      </Box>
    </Paper>
  );
};
