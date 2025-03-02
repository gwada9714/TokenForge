import React from 'react';
import { Container, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Box, Chip } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';

export const ComparatorPage: React.FC = () => {
    // Données de comparaison (à remplacer par des données réelles)
    const comparisons = [
        {
            feature: 'Création de token ERC-20',
            tokenforge: true,
            competitor1: true,
            competitor2: true,
            competitor3: true,
        },
        {
            feature: 'Création de token BEP-20',
            tokenforge: true,
            competitor1: true,
            competitor2: false,
            competitor3: true,
        },
        {
            feature: 'Création de token Polygon',
            tokenforge: true,
            competitor1: false,
            competitor2: false,
            competitor3: true,
        },
        {
            feature: 'Anti-Rugpull Protection',
            tokenforge: true,
            competitor1: false,
            competitor2: false,
            competitor3: false,
        },
        {
            feature: 'Tokenomics Designer',
            tokenforge: true,
            competitor1: false,
            competitor2: true,
            competitor3: false,
        },
        {
            feature: 'Landing Page Builder',
            tokenforge: true,
            competitor1: false,
            competitor2: false,
            competitor3: false,
        },
        {
            feature: 'Auto-Liquidity Manager',
            tokenforge: true,
            competitor1: false,
            competitor2: false,
            competitor3: true,
        },
        {
            feature: 'Frais de déploiement réduits',
            tokenforge: true,
            competitor1: false,
            competitor2: false,
            competitor3: false,
        },
    ];

    // Prix (à remplacer par des données réelles)
    const pricing = [
        {
            plan: 'Basic',
            tokenforge: '0.05 ETH',
            competitor1: '0.1 ETH',
            competitor2: '0.08 ETH',
            competitor3: '0.12 ETH',
            highlight: true,
        },
        {
            plan: 'Standard',
            tokenforge: '0.1 ETH',
            competitor1: '0.2 ETH',
            competitor2: '0.15 ETH',
            competitor3: '0.25 ETH',
            highlight: true,
        },
        {
            plan: 'Premium',
            tokenforge: '0.2 ETH',
            competitor1: '0.4 ETH',
            competitor2: '0.3 ETH',
            competitor3: '0.5 ETH',
            highlight: true,
        },
    ];

    return (
        <Container maxWidth="lg" sx={{ py: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
                Comparateur de services
            </Typography>

            <Typography paragraph>
                Découvrez pourquoi TokenForge offre le meilleur rapport qualité/prix pour la création de tokens.
            </Typography>

            <Box sx={{ mb: 4 }}>
                <Typography variant="h5" gutterBottom>
                    Fonctionnalités
                </Typography>

                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'primary.main' }}>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Fonctionnalité</TableCell>
                                <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                        TokenForge
                                        <Chip
                                            label="Notre plateforme"
                                            size="small"
                                            sx={{ mt: 0.5, bgcolor: 'secondary.main', color: 'white' }}
                                        />
                                    </Box>
                                </TableCell>
                                <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Concurrent A</TableCell>
                                <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Concurrent B</TableCell>
                                <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Concurrent C</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {comparisons.map((row) => (
                                <TableRow key={row.feature} sx={{ '&:nth-of-type(odd)': { bgcolor: 'action.hover' } }}>
                                    <TableCell component="th" scope="row">{row.feature}</TableCell>
                                    <TableCell align="center">
                                        {row.tokenforge ?
                                            <CheckCircleIcon color="success" /> :
                                            <CancelIcon color="error" />}
                                    </TableCell>
                                    <TableCell align="center">
                                        {row.competitor1 ?
                                            <CheckCircleIcon color="success" /> :
                                            <CancelIcon color="error" />}
                                    </TableCell>
                                    <TableCell align="center">
                                        {row.competitor2 ?
                                            <CheckCircleIcon color="success" /> :
                                            <CancelIcon color="error" />}
                                    </TableCell>
                                    <TableCell align="center">
                                        {row.competitor3 ?
                                            <CheckCircleIcon color="success" /> :
                                            <CancelIcon color="error" />}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>

            <Box>
                <Typography variant="h5" gutterBottom>
                    Tarifs
                </Typography>

                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ bgcolor: 'primary.main' }}>
                                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Plan</TableCell>
                                <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>TokenForge</TableCell>
                                <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Concurrent A</TableCell>
                                <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Concurrent B</TableCell>
                                <TableCell align="center" sx={{ color: 'white', fontWeight: 'bold' }}>Concurrent C</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {pricing.map((row) => (
                                <TableRow key={row.plan} sx={{ '&:nth-of-type(odd)': { bgcolor: 'action.hover' } }}>
                                    <TableCell component="th" scope="row">{row.plan}</TableCell>
                                    <TableCell
                                        align="center"
                                        sx={{
                                            fontWeight: 'bold',
                                            color: row.highlight ? 'success.main' : 'inherit',
                                            bgcolor: row.highlight ? 'success.light' : 'inherit',
                                            opacity: row.highlight ? 0.1 : 1,
                                        }}
                                    >
                                        {row.tokenforge}
                                    </TableCell>
                                    <TableCell align="center">{row.competitor1}</TableCell>
                                    <TableCell align="center">{row.competitor2}</TableCell>
                                    <TableCell align="center">{row.competitor3}</TableCell>
                                </TableRow>
                            ))}
                            <TableRow sx={{ bgcolor: 'secondary.light' }}>
                                <TableCell component="th" scope="row" sx={{ fontWeight: 'bold' }}>Économie moyenne</TableCell>
                                <TableCell align="center">-</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold' }}>-50%</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold' }}>-33%</TableCell>
                                <TableCell align="center" sx={{ fontWeight: 'bold' }}>-60%</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        </Container>
    );
};
