import React from 'react';
import { Box, Typography, Container, Paper, Grid } from '@mui/material';

export const TokenomicsPage: React.FC = () => {
    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Tokenomics Designer
            </Typography>

            <Paper sx={{ p: 3, mb: 4 }}>
                <Typography variant="h5" gutterBottom>
                    Concevez l'économie parfaite pour votre token
                </Typography>

                <Typography paragraph>
                    Notre outil de conception de tokenomics vous permet de créer et simuler différents modèles économiques pour votre token.
                </Typography>

                <Grid container spacing={3} sx={{ mt: 2 }}>
                    <Grid item xs={12} md={6}>
                        <Box sx={{ p: 2, border: '1px dashed grey', borderRadius: 1, height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Typography>Graphique de distribution (placeholder)</Typography>
                        </Box>
                    </Grid>
                    <Grid item xs={12} md={6}>
                        <Box sx={{ p: 2, border: '1px dashed grey', borderRadius: 1, height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Typography>Paramètres de tokenomics (placeholder)</Typography>
                        </Box>
                    </Grid>
                </Grid>
            </Paper>

            <Typography variant="h5" gutterBottom>
                Fonctionnalités
            </Typography>

            <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2, height: '100%' }}>
                        <Typography variant="h6" gutterBottom>
                            Simulation économique
                        </Typography>
                        <Typography>
                            Testez différents scénarios et visualisez l'impact sur votre économie de token.
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2, height: '100%' }}>
                        <Typography variant="h6" gutterBottom>
                            Modèles prédéfinis
                        </Typography>
                        <Typography>
                            Utilisez nos modèles optimisés pour différents cas d'usage (DeFi, GameFi, DAO, etc.).
                        </Typography>
                    </Paper>
                </Grid>
                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 2, height: '100%' }}>
                        <Typography variant="h6" gutterBottom>
                            Documentation automatisée
                        </Typography>
                        <Typography>
                            Générez une documentation complète de votre modèle tokenomics pour vos investisseurs.
                        </Typography>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};
