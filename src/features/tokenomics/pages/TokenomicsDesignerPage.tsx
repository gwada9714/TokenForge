import React, { useState } from 'react';
import {
    Container,
    Typography,
    Box,
    Paper,
    Grid,
    Tabs,
    Tab,
    Divider,
    Button,
    Alert,
    TextField,
    Slider,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    InputAdornment,
    Tooltip,
    IconButton
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import DownloadIcon from '@mui/icons-material/Download';
import SaveIcon from '@mui/icons-material/Save';
import { SEOHead } from '@/components';

// Types pour les données de tokenomics
interface TokenAllocation {
    name: string;
    percentage: number;
    lockupPeriod: number; // en mois
    vestingPeriod: number; // en mois
    color: string;
}

interface TokenomicsData {
    tokenName: string;
    tokenSymbol: string;
    totalSupply: string;
    initialMarketCap: string;
    initialTokenPrice: string;
    allocations: TokenAllocation[];
}

// Couleurs pour les différentes allocations
const allocationColors = [
    '#4285F4', // Bleu
    '#EA4335', // Rouge
    '#FBBC05', // Jaune
    '#34A853', // Vert
    '#8E24AA', // Violet
    '#16A2D7', // Bleu clair
    '#FF6D00', // Orange
    '#795548', // Marron
    '#607D8B', // Bleu-gris
];

const TokenomicsDesignerPage: React.FC = () => {
    // État pour l'onglet actif
    const [activeTab, setActiveTab] = useState(0);

    // État pour les données de tokenomics
    const [tokenomicsData, setTokenomicsData] = useState<TokenomicsData>({
        tokenName: '',
        tokenSymbol: '',
        totalSupply: '1000000000',
        initialMarketCap: '1000000',
        initialTokenPrice: '0.001',
        allocations: [
            { name: 'Presale', percentage: 40, lockupPeriod: 0, vestingPeriod: 0, color: allocationColors[0] },
            { name: 'Liquidity', percentage: 20, lockupPeriod: 12, vestingPeriod: 0, color: allocationColors[1] },
            { name: 'Team', percentage: 15, lockupPeriod: 6, vestingPeriod: 24, color: allocationColors[2] },
            { name: 'Marketing', percentage: 10, lockupPeriod: 3, vestingPeriod: 12, color: allocationColors[3] },
            { name: 'Development', percentage: 10, lockupPeriod: 3, vestingPeriod: 18, color: allocationColors[4] },
            { name: 'Advisors', percentage: 5, lockupPeriod: 6, vestingPeriod: 18, color: allocationColors[5] }
        ]
    });

    // Fonction pour changer d'onglet
    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setActiveTab(newValue);
    };

    // Fonction pour mettre à jour les données de base
    const handleBaseDataChange = (field: keyof TokenomicsData) => (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setTokenomicsData({
            ...tokenomicsData,
            [field]: event.target.value
        });
    };

    // Fonction pour mettre à jour une allocation
    const handleAllocationChange = (index: number, field: keyof TokenAllocation) => (
        event: React.ChangeEvent<HTMLInputElement> | React.ChangeEvent<{ value: unknown }> | Event,
        newValue?: number | number[]
    ) => {
        const newAllocations = [...tokenomicsData.allocations];

        if (field === 'percentage' && typeof newValue === 'number') {
            newAllocations[index].percentage = newValue;
        } else if (field === 'lockupPeriod' && typeof newValue === 'number') {
            newAllocations[index].lockupPeriod = newValue;
        } else if (field === 'vestingPeriod' && typeof newValue === 'number') {
            newAllocations[index].vestingPeriod = newValue;
        } else if (event.target && 'value' in event.target) {
            // @ts-ignore
            newAllocations[index][field] = event.target.value;
        }

        setTokenomicsData({
            ...tokenomicsData,
            allocations: newAllocations
        });
    };

    // Fonction pour ajouter une nouvelle allocation
    const addAllocation = () => {
        const newColor = allocationColors[tokenomicsData.allocations.length % allocationColors.length];
        setTokenomicsData({
            ...tokenomicsData,
            allocations: [
                ...tokenomicsData.allocations,
                { name: `Allocation ${tokenomicsData.allocations.length + 1}`, percentage: 0, lockupPeriod: 0, vestingPeriod: 0, color: newColor }
            ]
        });
    };

    // Fonction pour supprimer une allocation
    const removeAllocation = (index: number) => {
        const newAllocations = [...tokenomicsData.allocations];
        newAllocations.splice(index, 1);
        setTokenomicsData({
            ...tokenomicsData,
            allocations: newAllocations
        });
    };

    // Calcul du total des allocations
    const totalAllocation = tokenomicsData.allocations.reduce(
        (sum, allocation) => sum + allocation.percentage,
        0
    );

    // Calcul du prix initial du token
    const calculateTokenPrice = () => {
        const totalSupply = parseFloat(tokenomicsData.totalSupply) || 0;
        const initialMarketCap = parseFloat(tokenomicsData.initialMarketCap) || 0;

        if (totalSupply === 0) return '0';

        const price = initialMarketCap / totalSupply;
        return price.toFixed(totalSupply > 1000000 ? 6 : 4);
    };

    // Mise à jour automatique du prix du token lorsque le supply ou le market cap change
    React.useEffect(() => {
        setTokenomicsData(prev => ({
            ...prev,
            initialTokenPrice: calculateTokenPrice()
        }));
    }, [tokenomicsData.totalSupply, tokenomicsData.initialMarketCap]);

    // Fonction pour exporter les données de tokenomics en PDF
    const exportToPDF = () => {
        alert('Fonctionnalité d\'export en PDF à implémenter');
    };

    // Fonction pour sauvegarder le modèle de tokenomics
    const saveModel = () => {
        alert('Fonctionnalité de sauvegarde à implémenter');
    };

    return (
        <>
            <SEOHead
                title="Tokenomics Designer - TokenForge"
                description="Créez et visualisez la distribution économique de votre token avec notre outil de conception tokenomics avancé."
            />

            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Typography variant="h4" component="h1" gutterBottom>
                    Tokenomics Designer
                </Typography>
                <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 4 }}>
                    Concevez et visualisez la distribution économique de votre token
                </Typography>

                <Paper sx={{ mb: 4 }}>
                    <Tabs
                        value={activeTab}
                        onChange={handleTabChange}
                        indicatorColor="primary"
                        textColor="primary"
                        variant="fullWidth"
                    >
                        <Tab label="Configuration de base" />
                        <Tab label="Distribution des tokens" />
                        <Tab label="Visualisation" />
                        <Tab label="Simulation" />
                    </Tabs>

                    <Box sx={{ p: 3 }}>
                        {activeTab === 0 && (
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <Typography variant="h6" gutterBottom>
                                        Informations de base
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" paragraph>
                                        Définissez les paramètres fondamentaux de votre token.
                                    </Typography>
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Nom du token"
                                        value={tokenomicsData.tokenName}
                                        onChange={handleBaseDataChange('tokenName')}
                                        helperText="Nom complet de votre token"
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Symbole du token"
                                        value={tokenomicsData.tokenSymbol}
                                        onChange={handleBaseDataChange('tokenSymbol')}
                                        helperText="Symbole court (3-5 caractères)"
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Supply total"
                                        type="number"
                                        value={tokenomicsData.totalSupply}
                                        onChange={handleBaseDataChange('totalSupply')}
                                        helperText="Nombre total de tokens qui seront créés"
                                        InputProps={{
                                            endAdornment: (
                                                <Tooltip title="Le supply total est le nombre maximum de tokens qui existeront jamais">
                                                    <IconButton size="small">
                                                        <InfoIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            ),
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Market Cap Initial (USD)"
                                        type="number"
                                        value={tokenomicsData.initialMarketCap}
                                        onChange={handleBaseDataChange('initialMarketCap')}
                                        helperText="Capitalisation boursière initiale estimée"
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                            endAdornment: (
                                                <Tooltip title="Le Market Cap initial est calculé en multipliant le prix initial par le supply total">
                                                    <IconButton size="small">
                                                        <InfoIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            ),
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Prix initial du token (USD)"
                                        type="number"
                                        value={tokenomicsData.initialTokenPrice}
                                        disabled
                                        helperText="Calculé automatiquement (Market Cap / Supply Total)"
                                        InputProps={{
                                            startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                        }}
                                    />
                                </Grid>

                                <Grid item xs={12}>
                                    <Divider sx={{ my: 2 }} />
                                    <Typography variant="h6" gutterBottom>
                                        Modèles prédéfinis
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" paragraph>
                                        Choisissez un modèle de tokenomics prédéfini comme point de départ.
                                    </Typography>

                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6} md={3}>
                                            <Button
                                                variant="outlined"
                                                fullWidth
                                                sx={{ p: 2, height: '100%' }}
                                                onClick={() => alert('Modèle DeFi à implémenter')}
                                            >
                                                <Box>
                                                    <Typography variant="subtitle1">DeFi Yield</Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Optimisé pour les projets de finance décentralisée
                                                    </Typography>
                                                </Box>
                                            </Button>
                                        </Grid>
                                        <Grid item xs={12} sm={6} md={3}>
                                            <Button
                                                variant="outlined"
                                                fullWidth
                                                sx={{ p: 2, height: '100%' }}
                                                onClick={() => alert('Modèle GameFi à implémenter')}
                                            >
                                                <Box>
                                                    <Typography variant="subtitle1">GameFi</Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Idéal pour les économies de jeux blockchain
                                                    </Typography>
                                                </Box>
                                            </Button>
                                        </Grid>
                                        <Grid item xs={12} sm={6} md={3}>
                                            <Button
                                                variant="outlined"
                                                fullWidth
                                                sx={{ p: 2, height: '100%' }}
                                                onClick={() => alert('Modèle DAO à implémenter')}
                                            >
                                                <Box>
                                                    <Typography variant="subtitle1">DAO Governance</Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Pour les projets communautaires et de gouvernance
                                                    </Typography>
                                                </Box>
                                            </Button>
                                        </Grid>
                                        <Grid item xs={12} sm={6} md={3}>
                                            <Button
                                                variant="outlined"
                                                fullWidth
                                                sx={{ p: 2, height: '100%' }}
                                                onClick={() => alert('Modèle Social à implémenter')}
                                            >
                                                <Box>
                                                    <Typography variant="subtitle1">Social Token</Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Pour les créateurs et les communautés sociales
                                                    </Typography>
                                                </Box>
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </Grid>
                            </Grid>
                        )}

                        {activeTab === 1 && (
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <Typography variant="h6" gutterBottom>
                                        Distribution des tokens
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" paragraph>
                                        Définissez comment les tokens seront distribués entre les différentes parties prenantes.
                                    </Typography>

                                    {totalAllocation !== 100 && (
                                        <Alert
                                            severity={totalAllocation > 100 ? "error" : "warning"}
                                            sx={{ mb: 3 }}
                                        >
                                            {totalAllocation > 100
                                                ? `Le total des allocations dépasse 100% (${totalAllocation}%). Veuillez ajuster vos allocations.`
                                                : `Le total des allocations est de ${totalAllocation}%. Il reste ${100 - totalAllocation}% à allouer.`}
                                        </Alert>
                                    )}
                                </Grid>

                                {tokenomicsData.allocations.map((allocation, index) => (
                                    <React.Fragment key={index}>
                                        <Grid item xs={12}>
                                            <Paper
                                                variant="outlined"
                                                sx={{
                                                    p: 2,
                                                    borderLeft: `4px solid ${allocation.color}`,
                                                    mb: 2
                                                }}
                                            >
                                                <Grid container spacing={3}>
                                                    <Grid item xs={12} sm={6} md={3}>
                                                        <TextField
                                                            fullWidth
                                                            label="Nom de l'allocation"
                                                            value={allocation.name}
                                                            onChange={(e) => handleAllocationChange(index, 'name')(e)}
                                                        />
                                                    </Grid>
                                                    <Grid item xs={12} sm={6} md={3}>
                                                        <Box sx={{ width: '100%' }}>
                                                            <Typography gutterBottom>
                                                                Pourcentage: {allocation.percentage}%
                                                            </Typography>
                                                            <Slider
                                                                value={allocation.percentage}
                                                                onChange={(e, value) => handleAllocationChange(index, 'percentage')(e, value)}
                                                                min={0}
                                                                max={100}
                                                                step={1}
                                                                valueLabelDisplay="auto"
                                                            />
                                                        </Box>
                                                    </Grid>
                                                    <Grid item xs={12} sm={6} md={2}>
                                                        <Box sx={{ width: '100%' }}>
                                                            <Typography gutterBottom>
                                                                Lockup: {allocation.lockupPeriod} mois
                                                            </Typography>
                                                            <Slider
                                                                value={allocation.lockupPeriod}
                                                                onChange={(e, value) => handleAllocationChange(index, 'lockupPeriod')(e, value)}
                                                                min={0}
                                                                max={36}
                                                                step={1}
                                                                valueLabelDisplay="auto"
                                                            />
                                                        </Box>
                                                    </Grid>
                                                    <Grid item xs={12} sm={6} md={2}>
                                                        <Box sx={{ width: '100%' }}>
                                                            <Typography gutterBottom>
                                                                Vesting: {allocation.vestingPeriod} mois
                                                            </Typography>
                                                            <Slider
                                                                value={allocation.vestingPeriod}
                                                                onChange={(e, value) => handleAllocationChange(index, 'vestingPeriod')(e, value)}
                                                                min={0}
                                                                max={48}
                                                                step={1}
                                                                valueLabelDisplay="auto"
                                                            />
                                                        </Box>
                                                    </Grid>
                                                    <Grid item xs={12} md={2} sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <Button
                                                            variant="outlined"
                                                            color="error"
                                                            onClick={() => removeAllocation(index)}
                                                            fullWidth
                                                        >
                                                            Supprimer
                                                        </Button>
                                                    </Grid>
                                                </Grid>
                                            </Paper>
                                        </Grid>
                                    </React.Fragment>
                                ))}

                                <Grid item xs={12}>
                                    <Button
                                        variant="outlined"
                                        onClick={addAllocation}
                                        fullWidth
                                        sx={{ mt: 2 }}
                                    >
                                        Ajouter une allocation
                                    </Button>
                                </Grid>
                            </Grid>
                        )}

                        {activeTab === 2 && (
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <Typography variant="h6" gutterBottom>
                                        Visualisation de la distribution
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" paragraph>
                                        Visualisez la répartition de vos tokens et la libération progressive dans le temps.
                                    </Typography>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Paper
                                        variant="outlined"
                                        sx={{
                                            p: 3,
                                            height: 300,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <Typography variant="body1" color="text.secondary">
                                            Graphique de distribution (à implémenter)
                                        </Typography>
                                    </Paper>
                                    <Typography variant="subtitle2" align="center" sx={{ mt: 1 }}>
                                        Distribution initiale des tokens
                                    </Typography>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Paper
                                        variant="outlined"
                                        sx={{
                                            p: 3,
                                            height: 300,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <Typography variant="body1" color="text.secondary">
                                            Graphique de vesting (à implémenter)
                                        </Typography>
                                    </Paper>
                                    <Typography variant="subtitle2" align="center" sx={{ mt: 1 }}>
                                        Libération progressive des tokens
                                    </Typography>
                                </Grid>

                                <Grid item xs={12}>
                                    <Divider sx={{ my: 2 }} />
                                    <Typography variant="h6" gutterBottom>
                                        Résumé de la distribution
                                    </Typography>

                                    <Grid container spacing={2}>
                                        {tokenomicsData.allocations.map((allocation, index) => (
                                            <Grid item xs={12} sm={6} md={4} key={index}>
                                                <Paper
                                                    variant="outlined"
                                                    sx={{
                                                        p: 2,
                                                        borderLeft: `4px solid ${allocation.color}`
                                                    }}
                                                >
                                                    <Typography variant="subtitle1">
                                                        {allocation.name}
                                                    </Typography>
                                                    <Typography variant="h6">
                                                        {allocation.percentage}%
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        {parseFloat(tokenomicsData.totalSupply) * (allocation.percentage / 100)} tokens
                                                    </Typography>
                                                    <Typography variant="body2" color="text.secondary">
                                                        Lockup: {allocation.lockupPeriod} mois | Vesting: {allocation.vestingPeriod} mois
                                                    </Typography>
                                                </Paper>
                                            </Grid>
                                        ))}
                                    </Grid>
                                </Grid>
                            </Grid>
                        )}

                        {activeTab === 3 && (
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <Typography variant="h6" gutterBottom>
                                        Simulation économique
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" paragraph>
                                        Simulez différents scénarios pour évaluer la performance de votre tokenomics.
                                    </Typography>

                                    <Alert severity="info" sx={{ mb: 3 }}>
                                        Cette fonctionnalité sera disponible prochainement. Elle permettra de simuler différents scénarios de marché et d'évaluer l'impact sur le prix et la liquidité de votre token.
                                    </Alert>
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <Paper
                                        variant="outlined"
                                        sx={{
                                            p: 3,
                                            height: 300,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <Typography variant="body1" color="text.secondary">
                                            Simulation de prix (à implémenter)
                                        </Typography>
                                    </Paper>
                                </Grid>

                                <Grid item xs={12} sm={6}>
                                    <Paper
                                        variant="outlined"
                                        sx={{
                                            p: 3,
                                            height: 300,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <Typography variant="body1" color="text.secondary">
                                            Simulation de liquidité (à implémenter)
                                        </Typography>
                                    </Paper>
                                </Grid>

                                <Grid item xs={12}>
                                    <Paper variant="outlined" sx={{ p: 3 }}>
                                        <Typography variant="subtitle1" gutterBottom>
                                            Paramètres de simulation
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary" paragraph>
                                            Configurez les paramètres pour la simulation économique.
                                        </Typography>

                                        <Grid container spacing={3}>
                                            <Grid item xs={12} sm={6} md={4}>
                                                <FormControl fullWidth>
                                                    <InputLabel>Scénario de marché</InputLabel>
                                                    <Select
                                                        value="bullish"
                                                        label="Scénario de marché"
                                                        disabled
                                                    >
                                                        <MenuItem value="bullish">Marché haussier</MenuItem>
                                                        <MenuItem value="bearish">Marché baissier</MenuItem>
                                                        <MenuItem value="sideways">Marché stable</MenuItem>
                                                        <MenuItem value="volatile">Marché volatile</MenuItem>
                                                    </Select>
                                                </FormControl>
                                            </Grid>

                                            <Grid item xs={12} sm={6} md={4}>
                                                <TextField
                                                    fullWidth
                                                    label="Durée de simulation"
                                                    value="12"
                                                    disabled
                                                    InputProps={{
                                                        endAdornment: <InputAdornment position="end">mois</InputAdornment>,
                                                    }}
                                                />
                                            </Grid>

                                            <Grid item xs={12} sm={6} md={4}>
                                                <TextField
                                                    fullWidth
                                                    label="Volume quotidien initial"
                                                    value="50000"
                                                    disabled
                                                    InputProps={{
                                                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                                                    }}
                                                />
                                            </Grid>
                                        </Grid>
                                    </Paper>
                                </Grid>
                            </Grid>
                        )}
                    </Box>
                </Paper>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                    <Button
                        variant="outlined"
                        startIcon={<SaveIcon />}
                        onClick={saveModel}
                    >
                        Sauvegarder
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<DownloadIcon />}
                        onClick={exportToPDF}
                    >
                        Exporter en PDF
                    </Button>
                </Box>
            </Container>
        </>
    );
};

export default TokenomicsDesignerPage;
