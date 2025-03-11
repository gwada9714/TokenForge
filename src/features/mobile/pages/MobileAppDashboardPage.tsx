import React, { useState } from 'react';
import {
    Container,
    Typography,
    Box,
    Paper,
    Grid,
    Button,
    Chip,
    Avatar,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Divider,
    IconButton,
    Switch,
    FormControlLabel
} from '@mui/material';
import {
    Smartphone,
    Notifications,
    Settings,
    Visibility,
    BarChart,
    ArrowUpward,
    ArrowDownward,
    Warning,
    CheckCircle,
    Info,
    Star,
    StarBorder,
    Refresh,
    MoreVert,
    Download
} from '@mui/icons-material';

export const MobileAppDashboardPage: React.FC = () => {
    const [notificationsEnabled, setNotificationsEnabled] = useState(true);

    const handleNotificationsChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setNotificationsEnabled(event.target.checked);
    };

    // Données simulées pour les tokens
    const userTokens = [
        {
            id: 1,
            name: "DeFi Yield Token",
            symbol: "DYT",
            balance: 1250.75,
            value: 625.38,
            change24h: 5.2,
            blockchain: "Ethereum",
            logo: "/images/token-logo-1.png"
        },
        {
            id: 2,
            name: "GameFi Rewards",
            symbol: "GFR",
            balance: 4500,
            value: 315.00,
            change24h: -2.8,
            blockchain: "Polygon",
            logo: "/images/token-logo-2.png"
        },
        {
            id: 3,
            name: "Governance DAO",
            symbol: "GDAO",
            balance: 75.5,
            value: 1132.50,
            change24h: 12.4,
            blockchain: "Arbitrum",
            logo: "/images/token-logo-3.png"
        }
    ];

    // Données simulées pour les alertes
    const recentAlerts = [
        {
            id: 101,
            type: "price",
            token: "DYT",
            message: "DYT a augmenté de 5% en 1 heure",
            timestamp: "Il y a 35 minutes",
            severity: "info"
        },
        {
            id: 102,
            type: "whale",
            token: "GFR",
            message: "Mouvement important détecté: 50,000 GFR",
            timestamp: "Il y a 2 heures",
            severity: "warning"
        },
        {
            id: 103,
            type: "security",
            token: "GDAO",
            message: "Nouvelle proposition de gouvernance #42",
            timestamp: "Il y a 5 heures",
            severity: "info"
        }
    ];

    // Données simulées pour les actions rapides
    const quickActions = [
        { id: 1, name: "Voir mes tokens", icon: <Visibility />, color: "primary.main" },
        { id: 2, name: "Statistiques", icon: <BarChart />, color: "secondary.main" },
        { id: 3, name: "Alertes prix", icon: <Notifications />, color: "success.main" },
        { id: 4, name: "Paramètres", icon: <Settings />, color: "warning.main" }
    ];

    return (
        <Container maxWidth="lg" sx={{ py: 6 }}>
            <Typography variant="h3" component="h1" gutterBottom align="center" fontWeight="bold">
                Application Mobile
            </Typography>
            <Typography variant="h6" align="center" color="textSecondary" paragraph sx={{ mb: 6 }}>
                Gérez vos tokens et recevez des alertes en temps réel sur votre mobile
            </Typography>

            <Grid container spacing={4}>
                <Grid item xs={12} md={8}>
                    <Paper sx={{ p: 3, mb: 4 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Smartphone color="primary" sx={{ fontSize: 40, mr: 2 }} />
                                <Box>
                                    <Typography variant="h5" gutterBottom>
                                        Dashboard Mobile
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        Version 2.5.0 • Dernière synchronisation: il y a 5 minutes
                                    </Typography>
                                </Box>
                            </Box>
                            <Button
                                variant="outlined"
                                color="primary"
                                startIcon={<Refresh />}
                            >
                                Actualiser
                            </Button>
                        </Box>

                        <Divider sx={{ mb: 3 }} />

                        <Typography variant="h6" gutterBottom>
                            Mes Tokens
                        </Typography>

                        <List>
                            {userTokens.map((token) => (
                                <Paper key={token.id} sx={{ mb: 2, overflow: 'hidden' }}>
                                    <ListItem
                                        secondaryAction={
                                            <IconButton edge="end">
                                                <MoreVert />
                                            </IconButton>
                                        }
                                    >
                                        <ListItemIcon>
                                            <Avatar src={token.logo} alt={token.symbol}>
                                                {token.symbol.charAt(0)}
                                            </Avatar>
                                        </ListItemIcon>
                                        <ListItemText
                                            primary={
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    <Typography variant="subtitle1" fontWeight="bold">
                                                        {token.name}
                                                    </Typography>
                                                    <Chip
                                                        label={token.blockchain}
                                                        size="small"
                                                        sx={{ ml: 1 }}
                                                    />
                                                </Box>
                                            }
                                            secondary={
                                                <Typography variant="body2" color="textSecondary">
                                                    {token.balance.toLocaleString()} {token.symbol}
                                                </Typography>
                                            }
                                        />
                                        <Box sx={{ textAlign: 'right', minWidth: 100 }}>
                                            <Typography variant="subtitle1" fontWeight="bold">
                                                ${token.value.toLocaleString()}
                                            </Typography>
                                            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                                                {token.change24h > 0 ? (
                                                    <ArrowUpward fontSize="small" color="success" sx={{ mr: 0.5 }} />
                                                ) : (
                                                    <ArrowDownward fontSize="small" color="error" sx={{ mr: 0.5 }} />
                                                )}
                                                <Typography
                                                    variant="body2"
                                                    color={token.change24h > 0 ? "success.main" : "error.main"}
                                                >
                                                    {Math.abs(token.change24h)}%
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </ListItem>
                                </Paper>
                            ))}
                        </List>

                        <Box sx={{ textAlign: 'center', mt: 2 }}>
                            <Button
                                variant="outlined"
                                color="primary"
                            >
                                Voir tous mes tokens
                            </Button>
                        </Box>

                        <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
                            Alertes récentes
                        </Typography>

                        <List>
                            {recentAlerts.map((alert) => (
                                <ListItem key={alert.id} sx={{ mb: 1, bgcolor: 'background.paper', borderRadius: 1 }}>
                                    <ListItemIcon>
                                        {alert.severity === 'warning' && <Warning color="warning" />}
                                        {alert.severity === 'info' && <Info color="info" />}
                                        {alert.severity === 'success' && <CheckCircle color="success" />}
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={alert.message}
                                        secondary={alert.timestamp}
                                    />
                                </ListItem>
                            ))}
                        </List>

                        <Box sx={{ textAlign: 'center', mt: 2 }}>
                            <Button
                                variant="outlined"
                                color="primary"
                            >
                                Voir toutes les alertes
                            </Button>
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12} md={4}>
                    <Paper sx={{ p: 3, mb: 4 }}>
                        <Typography variant="h6" gutterBottom>
                            Actions rapides
                        </Typography>
                        <Grid container spacing={2} sx={{ mb: 3 }}>
                            {quickActions.map((action) => (
                                <Grid item xs={6} key={action.id}>
                                    <Button
                                        variant="outlined"
                                        fullWidth
                                        sx={{
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            py: 2,
                                            borderColor: action.color,
                                            color: action.color,
                                            '&:hover': {
                                                borderColor: action.color,
                                                bgcolor: `${action.color}10`,
                                            }
                                        }}
                                    >
                                        <Box sx={{ mb: 1, color: action.color }}>
                                            {action.icon}
                                        </Box>
                                        <Typography variant="body2">
                                            {action.name}
                                        </Typography>
                                    </Button>
                                </Grid>
                            ))}
                        </Grid>

                        <Divider sx={{ my: 3 }} />

                        <Typography variant="h6" gutterBottom>
                            Télécharger l'application
                        </Typography>
                        <Box sx={{ textAlign: 'center', mb: 3 }}>
                            <Box
                                component="img"
                                src="/images/qr-code-app.png"
                                alt="QR Code"
                                sx={{ width: 150, height: 150, mb: 2 }}
                            />
                            <Typography variant="body2" paragraph>
                                Scannez ce QR code pour télécharger l'application mobile TokenForge
                            </Typography>
                            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={<Download />}
                                >
                                    App Store
                                </Button>
                                <Button
                                    variant="contained"
                                    color="primary"
                                    startIcon={<Download />}
                                >
                                    Google Play
                                </Button>
                            </Box>
                        </Box>

                        <Divider sx={{ my: 3 }} />

                        <Typography variant="h6" gutterBottom>
                            Paramètres de notification
                        </Typography>
                        <FormControlLabel
                            control={
                                <Switch
                                    checked={notificationsEnabled}
                                    onChange={handleNotificationsChange}
                                    color="primary"
                                />
                            }
                            label="Activer les notifications push"
                        />
                        <Typography variant="body2" color="textSecondary" paragraph>
                            Recevez des alertes en temps réel sur les mouvements de prix, les transactions importantes et les événements de sécurité.
                        </Typography>
                        <Button
                            variant="outlined"
                            color="primary"
                            fullWidth
                        >
                            Configurer les notifications
                        </Button>
                    </Paper>

                    <Paper sx={{ p: 3 }}>
                        <Typography variant="h6" gutterBottom>
                            Évaluer l'application
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Box sx={{ display: 'flex', mr: 1 }}>
                                <Star color="warning" />
                                <Star color="warning" />
                                <Star color="warning" />
                                <Star color="warning" />
                                <StarBorder color="warning" />
                            </Box>
                            <Typography variant="body2" color="textSecondary">
                                4.2/5 (1,245 avis)
                            </Typography>
                        </Box>
                        <Button
                            variant="outlined"
                            color="primary"
                            fullWidth
                            startIcon={<Star />}
                        >
                            Laisser un avis
                        </Button>
                    </Paper>
                </Grid>
            </Grid>
        </Container>
    );
};

export default MobileAppDashboardPage;
