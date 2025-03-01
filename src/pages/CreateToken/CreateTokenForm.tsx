import React, { useState } from 'react';
import {
  Box,
  TextField,
  Checkbox,
  FormControlLabel,
  Button,
  Typography,
  Paper,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTokens } from '../../contexts/TokenContext';

interface TokenFormData {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: string;
  burnable: boolean;
  mintable: boolean;
  pausable: boolean;
}

const initialFormData: TokenFormData = {
  name: '',
  symbol: '',
  decimals: 18,
  totalSupply: '',
  burnable: false,
  mintable: false,
  pausable: false
};

export const CreateTokenForm: React.FC = () => {
  const [formData, setFormData] = useState<TokenFormData>(initialFormData);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { createToken } = useTokens();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      await createToken(formData);
      navigate('/tokens');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Créer un Nouveau Token
      </Typography>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <TextField
          fullWidth
          label="Nom du Token"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="Symbole"
          value={formData.symbol}
          onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          type="number"
          label="Décimales"
          value={formData.decimals}
          onChange={(e) => setFormData({ ...formData, decimals: parseInt(e.target.value) })}
          margin="normal"
          required
        />
        <TextField
          fullWidth
          label="Supply Totale"
          value={formData.totalSupply}
          onChange={(e) => setFormData({ ...formData, totalSupply: e.target.value })}
          margin="normal"
          required
        />
        <Box sx={{ mt: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.burnable}
                onChange={(e) => setFormData({ ...formData, burnable: e.target.checked })}
              />
            }
            label="Burnable"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.mintable}
                onChange={(e) => setFormData({ ...formData, mintable: e.target.checked })}
              />
            }
            label="Mintable"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.pausable}
                onChange={(e) => setFormData({ ...formData, pausable: e.target.checked })}
              />
            }
            label="Pausable"
          />
        </Box>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 3 }}
          disabled={submitting}
        >
          {submitting ? 'Création en cours...' : 'Créer le Token'}
        </Button>
      </Box>
    </Paper>
  );
}; 