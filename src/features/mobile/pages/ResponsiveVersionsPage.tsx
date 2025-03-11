import React, { useState } from 'react';
import {
    Container,
    Typography,
    Box,
    Paper,
    Grid,
    Button,
    Tabs,
    Tab,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Chip,
    Switch,
    FormControlLabel,
    Slider,
    TextField,
    TableContainer,
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    LinearProgress
} from '@mui/material';
import {
    Devices,
    Smartphone,
    Tablet,
    DesktopWindows,
    Check,
    Warning,
    Menu,
    ArrowBack,
    Visibility,
    Speed,
    BugReport,
    Code,
    Refresh,
    Save,
    Preview,
    Schedule,
    Add
} from '@mui/icons-material';

export const ResponsiveVersionsPage: React.FC = () => {
    const [tabValue, setTabValue] = useState(0);
    const [devicePreview, setDevicePreview] = useState('mobile');
    const [darkMode, setDarkMode] = useState(false);
    const [fontScale, setFontScale] = useState(100);
    const [menuStyle, setMenuStyle] = useState('hamburger');

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const handleDeviceChange = (device: string) => {
        setDevicePreview(device);
    };

    const handleDarkModeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setDarkMode(event.target.checked);
    };

    const handleFontScaleChange = (_event: Event, newValue: number | number[]) => {
        setFontScale(newValue as number);
    };

    const handleMenuStyleChange = (style: string) => {
        setMenuStyle(style);
    };

    // Données simulées pour les interfaces adaptatives
    const adaptiveInterfaces = [
        {
            id: 1,
            name: "Dashboard principal",
            description: "Interface principale avec statistiques et actions rapides",
            mobileReady: true,
            tabletReady: true,
            desktopReady: true,
            previewImages: {
                mobile: "/images/dashboard-mobile.jpg",
                tablet: "/images/dashboard-tablet.jpg",
                desktop: "/images/dashboard-desktop.jpg"
            },
            lastUpdated: "28 Février 2025"
        },
        {
            id: 2,
            name: "Création de token",
            description: "Wizard de création de token étape par étape",
            mobileReady: true,
            tabletReady: true,
            desktopReady: true,
            previewImages: {
                mobile: "/images/token-creation-mobile.jpg",
                tablet: "/images/token-creation-tablet.jpg",
                desktop: "/images/token-creation-desktop.jpg"
            },
            lastUpdated: "25 Février 2025"
        },
        {
            id: 3,
            name: "Tokenomics Designer",
            description: "Interface de conception visuelle des tokenomics",
            mobileReady: false,
            tabletReady: true,
            desktopReady: true,
            previewImages: {
                mobile: "/images/tokenomics-mobile.jpg",
                tablet: "/images/tokenomics-tablet.jpg",
                desktop: "/images/tokenomics-desktop.jpg"
            },
            lastUpdated: "20 Février 2025"
        }
    ];

    // Données simulées pour les optimisations mobiles
    const mobileOptimizations = [
        {
            id: 101,
            name: "Navigation simplifiée",
            description: "Menu hamburger avec options principales et navigation par gestes",
            status: "implemented",
            priority: "high"
        },
        {
            id: 102,
            name: "Formulaires adaptatifs",
            description: "Champs de formulaire optimisés pour la saisie mobile avec validation instantanée",
            status: "implemented",
            priority: "high"
        },
        {
            id: 103,
            name: "Mode hors ligne",
            description: "Accès aux fonctionnalités de base sans connexion internet",
            status: "in-progress",
            priority: "medium"
        },
        {
            id: 104,
            name: "Interactions tactiles",
            description: "Support des gestes (swipe, pinch, etc.) pour les interactions principales",
            status: "planned",
            priority: "medium"
        }
    ];

    // Données simulées pour les tests de compatibilité
    const compatibilityTests = [
        {
            id: 201,
            device: "iPhone 14",
            os: "iOS 16",
            browser: "Safari",
            status: "passed",
            issues: 0
        },
        {
            id: 202,
            device: "Samsung Galaxy S22",
            os: "Android 13",
            browser: "Chrome",
            status: "passed",
            issues: 0
        },
        {
            id: 203,
            device: "iPad Pro",
            os: "iOS 16",
            browser: "Safari",
            status: "passed",
            issues: 0
        },
        {
            id: 204,
            device: "Microsoft Surface",
            os: "Windows 11",
            browser: "Edge",
            status: "issues",
            issues: 2
        }
    ];

    return (
        <Container maxWidth="lg" sx={{ py: 6 }}>
            <Typography variant="h3" component="h1" gutterBottom align="center" fontWeight="bold">
                Versions Responsives
            </Typography>
            <Typography variant="h6" align="center" color="textSecondary" paragraph sx={{ mb: 6 }}>
                Gestion et optimisation des interfaces adaptatives pour tous les appareils
            </Typography>

            <Box sx={{ mb: 4 }}>
                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    variant="fullWidth"
                    textColor="primary"
                    indicatorColor="primary"
                >
                    <Tab icon={<Devices />} label="Interfaces adaptatives" />
                    <Tab icon={<Smartphone />} label="Optimisations mobiles" />
                    <Tab icon={<BugReport />} label="Tests de compatibilité" />
                </Tabs>
            </Box>

            {tabValue === 0 && (
                <>
                    <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                        <Typography variant="h5">
                            Interfaces adaptatives
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                                variant={devicePreview === 'mobile' ? 'contained' : 'outlined'}
                                color="primary"
                                startIcon={<Smartphone />}
                                onClick={() => handleDeviceChange('mobile')}
                            >
                                Mobile
                            </Button>
                            <Button
                                variant={devicePreview === 'tablet' ? 'contained' : 'outlined'}
                                color="primary"
                                startIcon={<Tablet />}
                                onClick={() => handleDeviceChange('tablet')}
                            >
                                Tablette
                            </Button>
                            <Button
                                variant={devicePreview === 'desktop' ? 'contained' : 'outlined'}
                                color="primary"
                                startIcon={<DesktopWindows />}
                                onClick={() => handleDeviceChange('desktop')}
                            >
                                Desktop
                            </Button>
                        </Box>
                    </Box>

                    <Grid container spacing={4}>
                        {adaptiveInterfaces.map((interface_) => (
                            <Grid item xs={12} key={interface_.id}>
                                <Paper sx={{ overflow: 'hidden' }}>
                                    <Grid container>
                                        <Grid item xs={12} md={4}>
                                            <Box sx={{ p: 3 }}>
                                                <Typography variant="h6" gutterBottom>
                                                    {interface_.name}
                                                </Typography>
                                                <Typography variant="body2" paragraph>
                                                    {interface_.description}
                                                </Typography>
                                                <Box sx={{ mb: 2 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                        <Smartphone fontSize="small" sx={{ mr: 1 }} />
                                                        <Typography variant="body2" sx={{ mr: 1 }}>
                                                            Mobile:
                                                        </Typography>
                                                        {interface_.mobileReady ? (
                                                            <Chip icon={<Check />} label="Optimisé" color="success" size="small" />
                                                        ) : (
                                                            <Chip icon={<Warning />} label="En cours" color="warning" size="small" />
                                                        )}
                                                    </Box>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                        <Tablet fontSize="small" sx={{ mr: 1 }} />
                                                        <Typography variant="body2" sx={{ mr: 1 }}>
                                                            Tablette:
                                                        </Typography>
                                                        {interface_.tabletReady ? (
                                                            <Chip icon={<Check />} label="Optimisé" color="success" size="small" />
                                                        ) : (
                                                            <Chip icon={<Warning />} label="En cours" color="warning" size="small" />
                                                        )}
                                                    </Box>
                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        <DesktopWindows fontSize="small" sx={{ mr: 1 }} />
                                                        <Typography variant="body2" sx={{ mr: 1 }}>
                                                            Desktop:
                                                        </Typography>
                                                        {interface_.desktopReady ? (
                                                            <Chip icon={<Check />} label="Optimisé" color="success" size="small" />
                                                        ) : (
                                                            <Chip icon={<Warning />} label="En cours" color="warning" size="small" />
                                                        )}
                                                    </Box>
                                                </Box>
                                                <Typography variant="caption" color="textSecondary" display="block">
                                                    Dernière mise à jour: {interface_.lastUpdated}
                                                </Typography>
                                                <Box sx={{ mt: 2 }}>
                                                    <Button
                                                        variant="outlined"
                                                        color="primary"
                                                        startIcon={<Preview />}
                                                        fullWidth
                                                    >
                                                        Prévisualiser
                                                    </Button>
                                                    <Button
                                                        variant="outlined"
                                                        color="primary"
                                                        startIcon={<Code />}
                                                        fullWidth
                                                        sx={{ mt: 1 }}
                                                    >
                                                        Éditer
                                                    </Button>
                                                </Box>
                                            </Box>
                                        </Grid>
                                        <Grid item xs={12} md={8}>
                                            <Box sx={{ position: 'relative', height: '100%', minHeight: 300, bgcolor: 'grey.100' }}>
                                                <Box
                                                    component="img"
                                                    src={interface_.previewImages[devicePreview as keyof typeof interface_.previewImages]}
                                                    alt={`${interface_.name} - ${devicePreview}`}
                                                    sx={{
                                                        width: '100%',
                                                        height: '100%',
                                                        objectFit: 'cover',
                                                        objectPosition: 'top',
                                                        filter: darkMode ? 'brightness(0.8)' : 'none'
                                                    }}
                                                />
                                                <Box
                                                    sx={{
                                                        position: 'absolute',
                                                        bottom: 0,
                                                        left: 0,
                                                        right: 0,
                                                        p: 2,
                                                        bgcolor: 'rgba(0, 0, 0, 0.5)',
                                                        color: 'white',
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center'
                                                    }}
                                                >
                                                    <Typography variant="body2">
                                                        Aperçu {devicePreview} {darkMode ? '(mode sombre)' : '(mode clair)'}
                                                    </Typography>
                                                    <FormControlLabel
                                                        control={
                                                            <Switch
                                                                size="small"
                                                                checked={darkMode}
                                                                onChange={handleDarkModeChange}
                                                                color="default"
                                                            />
                                                        }
                                                        label="Mode sombre"
                                                    />
                                                </Box>
                                            </Box>
                                        </Grid>
                                    </Grid>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                </>
            )}

            {tabValue === 1 && (
                <>
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h5" gutterBottom>
                            Optimisations mobiles
                        </Typography>
                        <Typography variant="body2" color="textSecondary" paragraph>
                            Améliorations spécifiques pour l'expérience sur appareils mobiles
                        </Typography>
                    </Box>

                    <Grid container spacing={4}>
                        <Grid item xs={12} md={6}>
                            <Paper sx={{ p: 3, mb: 4 }}>
                                <Typography variant="h6" gutterBottom>
                                    Paramètres d'affichage mobile
                                </Typography>
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="subtitle2" gutterBottom>
                                        Style de menu
                                    </Typography>
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Button
                                            variant={menuStyle === 'hamburger' ? 'contained' : 'outlined'}
                                            color="primary"
                                            startIcon={<Menu />}
                                            onClick={() => handleMenuStyleChange('hamburger')}
                                            size="small"
                                        >
                                            Hamburger
                                        </Button>
                                        <Button
                                            variant={menuStyle === 'bottom' ? 'contained' : 'outlined'}
                                            color="primary"
                                            startIcon={<ArrowBack />}
                                            onClick={() => handleMenuStyleChange('bottom')}
                                            size="small"
                                        >
                                            Navigation basse
                                        </Button>
                                        <Button
                                            variant={menuStyle === 'tabs' ? 'contained' : 'outlined'}
                                            color="primary"
                                            startIcon={<Visibility />}
                                            onClick={() => handleMenuStyleChange('tabs')}
                                            size="small"
                                        >
                                            Onglets
                                        </Button>
                                    </Box>
                                </Box>

                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="subtitle2" gutterBottom>
                                        Échelle de police
                                    </Typography>
                                    <Box sx={{ px: 1 }}>
                                        <Slider
                                            value={fontScale}
                                            onChange={handleFontScaleChange}
                                            min={80}
                                            max={120}
                                            step={5}
                                            marks={[
                                                { value: 80, label: '80%' },
                                                { value: 100, label: '100%' },
                                                { value: 120, label: '120%' }
                                            ]}
                                            valueLabelDisplay="auto"
                                        />
                                    </Box>
                                </Box>

                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="subtitle2" gutterBottom>
                                        Options d'accessibilité
                                    </Typography>
                                    <FormControlLabel
                                        control={<Switch checked={darkMode} onChange={handleDarkModeChange} />}
                                        label="Mode sombre"
                                    />
                                    <FormControlLabel
                                        control={<Switch />}
                                        label="Contraste élevé"
                                    />
                                    <FormControlLabel
                                        control={<Switch />}
                                        label="Réduire les animations"
                                    />
                                </Box>

                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                    <Button
                                        variant="outlined"
                                        color="primary"
                                        startIcon={<Refresh />}
                                    >
                                        Réinitialiser
                                    </Button>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        startIcon={<Save />}
                                    >
                                        Appliquer
                                    </Button>
                                </Box>
                            </Paper>

                            <Paper sx={{ p: 3 }}>
                                <Typography variant="h6" gutterBottom>
                                    Performance mobile
                                </Typography>
                                <Box sx={{ mb: 3 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                        <Typography variant="body2">Temps de chargement</Typography>
                                        <Typography variant="body2" fontWeight="bold" color="success.main">1.2s</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                        <Typography variant="body2">Taille des ressources</Typography>
                                        <Typography variant="body2" fontWeight="bold">2.4 MB</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                        <Typography variant="body2">Score de performance</Typography>
                                        <Typography variant="body2" fontWeight="bold" color="success.main">92/100</Typography>
                                    </Box>
                                </Box>
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    startIcon={<Speed />}
                                    fullWidth
                                >
                                    Analyser la performance
                                </Button>
                            </Paper>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Paper sx={{ p: 3 }}>
                                <Typography variant="h6" gutterBottom>
                                    Optimisations en cours
                                </Typography>
                                <List>
                                    {mobileOptimizations.map((optimization) => (
                                        <ListItem key={optimization.id} sx={{ px: 0 }}>
                                            <ListItemIcon>
                                                {optimization.status === 'implemented' && <Check color="success" />}
                                                {optimization.status === 'in-progress' && <Refresh color="primary" />}
                                                {optimization.status === 'planned' && <Schedule color="action" />}
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={
                                                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                        {optimization.name}
                                                        <Chip
                                                            label={optimization.priority}
                                                            size="small"
                                                            color={optimization.priority === 'high' ? 'error' : 'warning'}
                                                            sx={{ ml: 1 }}
                                                        />
                                                    </Box>
                                                }
                                                secondary={optimization.description}
                                            />
                                            <Chip
                                                label={
                                                    optimization.status === 'implemented' ? 'Implémenté' :
                                                        optimization.status === 'in-progress' ? 'En cours' : 'Planifié'
                                                }
                                                color={
                                                    optimization.status === 'implemented' ? 'success' :
                                                        optimization.status === 'in-progress' ? 'primary' : 'default'
                                                }
                                                size="small"
                                            />
                                        </ListItem>
                                    ))}
                                </List>
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                                    <Button
                                        variant="outlined"
                                        color="primary"
                                        startIcon={<Add />}
                                    >
                                        Ajouter une optimisation
                                    </Button>
                                </Box>
                            </Paper>
                        </Grid>
                    </Grid>
                </>
            )}

            {tabValue === 2 && (
                <>
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h5" gutterBottom>
                            Tests de compatibilité
                        </Typography>
                        <Typography variant="body2" color="textSecondary" paragraph>
                            Résultats des tests sur différents appareils et navigateurs
                        </Typography>
                    </Box>

                    <Grid container spacing={4}>
                        <Grid item xs={12}>
                            <TableContainer component={Paper}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Appareil</TableCell>
                                            <TableCell>Système</TableCell>
                                            <TableCell>Navigateur</TableCell>
                                            <TableCell>Statut</TableCell>
                                            <TableCell>Problèmes</TableCell>
                                            <TableCell>Actions</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {compatibilityTests.map((test) => (
                                            <TableRow key={test.id}>
                                                <TableCell>{test.device}</TableCell>
                                                <TableCell>{test.os}</TableCell>
                                                <TableCell>{test.browser}</TableCell>
                                                <TableCell>
                                                    {test.status === 'passed' ? (
                                                        <Chip icon={<Check />} label="Succès" color="success" size="small" />
                                                    ) : (
                                                        <Chip icon={<Warning />} label="Problèmes" color="error" size="small" />
                                                    )}
                                                </TableCell>
                                                <TableCell>{test.issues}</TableCell>
                                                <TableCell>
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                    >
                                                        Détails
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Paper sx={{ p: 3 }}>
                                <Typography variant="h6" gutterBottom>
                                    Ajouter un test
                                </Typography>
                                <Grid container spacing={2}>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            label="Appareil"
                                            fullWidth
                                            variant="outlined"
                                            size="small"
                                            margin="normal"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            label="Système d'exploitation"
                                            fullWidth
                                            variant="outlined"
                                            size="small"
                                            margin="normal"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            label="Navigateur"
                                            fullWidth
                                            variant="outlined"
                                            size="small"
                                            margin="normal"
                                        />
                                    </Grid>
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            label="Version"
                                            fullWidth
                                            variant="outlined"
                                            size="small"
                                            margin="normal"
                                        />
                                    </Grid>
                                </Grid>
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                                    <Button
                                        variant="contained"
                                        color="primary"
                                    >
                                        Lancer le test
                                    </Button>
                                </Box>
                            </Paper>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Paper sx={{ p: 3 }}>
                                <Typography variant="h6" gutterBottom>
                                    Résumé des tests
                                </Typography>
                                <Box sx={{ mb: 2 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                        <Typography variant="body2">Tests réussis</Typography>
                                        <Typography variant="body2" fontWeight="bold" color="success.main">75%</Typography>
                                    </Box>
                                    <LinearProgress
                                        variant="determinate"
                                        value={75}
                                        color="success"
                                        sx={{ height: 8, borderRadius: 1, mb: 2 }}
                                    />
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                        <Typography variant="body2">Problèmes critiques</Typography>
                                        <Typography variant="body2" fontWeight="bold" color="error.main">2</Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                        <Typography variant="body2">Problèmes mineurs</Typography>
                                        <Typography variant="body2" fontWeight="bold" color="warning.main">5</Typography>
                                    </Box>
                                </Box>
                                <Button
                                    variant="outlined"
                                    color="primary"
                                    startIcon={<BugReport />}
                                    fullWidth
                                >
                                    Voir le rapport complet
                                </Button>
                            </Paper>
                        </Grid>
                    </Grid>
                </>
            )}
        </Container>
    );
};

export default ResponsiveVersionsPage;
