import React, { useState } from 'react';
import { 
  Box, Button, TextField, Typography, Paper, 
  CircularProgress, Snackbar, Alert, Grid, Divider 
} from '@mui/material';
import { createNFTCollection } from '@/lib/firebase/examples/firestore-examples';

/**
 * Composant permettant de créer et minter une collection de NFTs en utilisant
 * les opérations batch de Firestore pour optimiser les performances
 */
export const BatchNFTMintComponent: React.FC = () => {
  const [collectionName, setCollectionName] = useState('');
  const [nftCount, setNftCount] = useState(5);
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mintedNFTIds, setMintedNFTIds] = useState<string[]>([]);

  const handleMintCollection = async () => {
    if (!collectionName || nftCount <= 0 || nftCount > 500) {
      setError('Veuillez entrer un nom de collection valide et un nombre de NFTs entre 1 et 500');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      // Simuler un userId pour l'exemple - dans une app réelle, ce serait pris de l'auth
      const ownerId = 'user_123';
      
      // Métadonnées communes pour tous les NFTs de la collection
      const baseMetadata = {
        name: collectionName,
        description,
        artist: 'TokenForge Creator',
        created: new Date().toISOString(),
        attributes: [
          { trait_type: 'Collection', value: collectionName },
          { trait_type: 'Batch Minted', value: 'Yes' }
        ]
      };

      // Utiliser la nouvelle fonction de batch pour créer tous les NFTs en une seule opération
      const nftIds = await createNFTCollection(collectionName, ownerId, nftCount, baseMetadata);
      
      setMintedNFTIds(nftIds);
      setSuccess(true);
    } catch (err) {
      console.error('Erreur pendant le mint batch:', err);
      setError((err as Error).message || 'Une erreur s\'est produite lors de la création de la collection');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, maxWidth: 800, mx: 'auto', mt: 4 }}>
      <Typography variant="h4" gutterBottom align="center" color="primary">
        Création de Collection NFT par Batch
      </Typography>
      
      <Typography variant="body1" paragraph>
        Ce composant utilise les opérations batch de Firestore pour créer une collection entière 
        de NFTs en une seule transaction, ce qui optimise les performances et garantit l'atomicité.
      </Typography>
      
      <Divider sx={{ my: 2 }} />
      
      <Box component="form" noValidate sx={{ mt: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Nom de la collection"
              value={collectionName}
              onChange={(e) => setCollectionName(e.target.value)}
              disabled={isLoading}
              required
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isLoading}
              multiline
              rows={3}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Nombre de NFTs à créer"
              type="number"
              InputProps={{ inputProps: { min: 1, max: 500 } }}
              value={nftCount}
              onChange={(e) => setNftCount(Number(e.target.value))}
              disabled={isLoading}
              helperText="Maximum 500 NFTs par batch"
              required
            />
          </Grid>
        </Grid>
        
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={handleMintCollection}
            disabled={isLoading || !collectionName || nftCount <= 0}
            startIcon={isLoading ? <CircularProgress size={24} color="inherit" /> : null}
          >
            {isLoading ? 'Création en cours...' : 'Créer la collection'}
          </Button>
        </Box>
      </Box>
      
      {mintedNFTIds.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Collection créée avec succès!
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {mintedNFTIds.length} NFTs ont été créés. Voici les premiers IDs:
          </Typography>
          <Paper elevation={1} sx={{ p: 2, mt: 1, maxHeight: 150, overflow: 'auto' }}>
            {mintedNFTIds.slice(0, 5).map((id, index) => (
              <Typography key={id} variant="body2" sx={{ fontFamily: 'monospace' }}>
                {index + 1}. {id}
              </Typography>
            ))}
            {mintedNFTIds.length > 5 && (
              <Typography variant="body2" sx={{ mt: 1 }}>
                ... et {mintedNFTIds.length - 5} autres
              </Typography>
            )}
          </Paper>
        </Box>
      )}
      
      <Snackbar open={success} autoHideDuration={6000} onClose={() => setSuccess(false)}>
        <Alert severity="success" sx={{ width: '100%' }}>
          Collection créée avec succès!
        </Alert>
      </Snackbar>
      
      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError(null)}>
        <Alert severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default BatchNFTMintComponent;
