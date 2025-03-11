import React, { useState } from 'react';
import {
    Container,
    Typography,
    Grid,
    Card,
    CardContent,
    TextField,
    InputAdornment,
    Box,
    Tabs,
    Tab,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Divider,
    Button,
    Breadcrumbs,
    Link,
    Paper,
    Chip,
    Accordion,
    AccordionSummary,
    AccordionDetails
} from '@mui/material';
import {
    Search,
    MenuBook,
    Code,
    School,
    BugReport,
    ArrowForward,
    ExpandMore,
    Visibility,
    Description,
    VideoLibrary,
    Assignment,
    Help,
    Security,
    AccountBalance
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

const StyledCard = styled(Card)(({ theme }) => ({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
    '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: theme.shadows[10],
    },
}));

const CategoryIcon = styled(Box)(({ theme }) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 60,
    height: 60,
    borderRadius: '50%',
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    marginBottom: theme.spacing(2),
}));

export const KnowledgeBasePage: React.FC = () => {
    const [tabValue, setTabValue] = useState(0);
    const [searchQuery, setSearchQuery] = useState('');

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(event.target.value);
    };

    return (
        <Container maxWidth="lg" sx={{ py: 6 }}>
            <Breadcrumbs sx={{ mb: 3 }}>
                <Link color="inherit" href="/">
                    Accueil
                </Link>
                <Link color="inherit" href="/learn">
                    Ressources
                </Link>
                <Typography color="textPrimary">Base de connaissances</Typography>
            </Breadcrumbs>

            <Typography variant="h3" component="h1" gutterBottom align="center" fontWeight="bold">
                Base de Connaissances TokenForge
            </Typography>
            <Typography variant="h6" align="center" color="textSecondary" paragraph sx={{ mb: 4 }}>
                Tout ce que vous devez savoir pour maîtriser la création et la gestion de tokens
            </Typography>

            <Box sx={{ mb: 6 }}>
                <TextField
                    fullWidth
                    placeholder="Rechercher dans la base de connaissances..."
                    variant="outlined"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <Search />
                            </InputAdornment>
                        ),
                    }}
                    sx={{ mb: 2 }}
                />

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    <Chip label="Création de token" onClick={() => { }} />
                    <Chip label="Tokenomics" onClick={() => { }} />
                    <Chip label="Sécurité" onClick={() => { }} />
                    <Chip label="Staking" onClick={() => { }} />
                    <Chip label="Liquidité" onClick={() => { }} />
                    <Chip label="Multi-chain" onClick={() => { }} />
                    <Chip label="Déploiement" onClick={() => { }} />
                </Box>
            </Box>

            <Box sx={{ mb: 6 }}>
                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    variant="scrollable"
                    scrollButtons="auto"
                    textColor="primary"
                    indicatorColor="primary"
                    sx={{ mb: 4 }}
                >
                    <Tab icon={<MenuBook />} label="Documentation" />
                    <Tab icon={<School />} label="Guides pratiques" />
                    <Tab icon={<Help />} label="FAQ" />
                    <Tab icon={<BugReport />} label="Troubleshooting" />
                </Tabs>

                {tabValue === 0 && (
                    <Grid container spacing={4}>
                        <Grid item xs={12} md={4}>
                            <StyledCard>
                                <CardContent>
                                    <CategoryIcon>
                                        <Code fontSize="large" />
                                    </CategoryIcon>
                                    <Typography variant="h5" component="h2" gutterBottom>
                                        Documentation technique
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary" paragraph>
                                        Spécifications détaillées, références API et documentation des smart contracts
                                    </Typography>
                                    <List>
                                        <ListItem button>
                                            <ListItemIcon>
                                                <Description />
                                            </ListItemIcon>
                                            <ListItemText primary="Spécifications des smart contracts" />
                                        </ListItem>
                                        <ListItem button>
                                            <ListItemIcon>
                                                <Description />
                                            </ListItemIcon>
                                            <ListItemText primary="API Reference" />
                                        </ListItem>
                                        <ListItem button>
                                            <ListItemIcon>
                                                <Description />
                                            </ListItemIcon>
                                            <ListItemText primary="Schémas d'architecture" />
                                        </ListItem>
                                    </List>
                                    <Button
                                        variant="outlined"
                                        color="primary"
                                        endIcon={<ArrowForward />}
                                        fullWidth
                                        sx={{ mt: 2 }}
                                    >
                                        Explorer
                                    </Button>
                                </CardContent>
                            </StyledCard>
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <StyledCard>
                                <CardContent>
                                    <CategoryIcon>
                                        <Security fontSize="large" />
                                    </CategoryIcon>
                                    <Typography variant="h5" component="h2" gutterBottom>
                                        Sécurité et bonnes pratiques
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary" paragraph>
                                        Guides de sécurité, meilleures pratiques et conseils d'experts
                                    </Typography>
                                    <List>
                                        <ListItem button>
                                            <ListItemIcon>
                                                <Description />
                                            </ListItemIcon>
                                            <ListItemText primary="Guide Anti-Rugpull" />
                                        </ListItem>
                                        <ListItem button>
                                            <ListItemIcon>
                                                <Description />
                                            </ListItemIcon>
                                            <ListItemText primary="Sécurisation des wallets" />
                                        </ListItem>
                                        <ListItem button>
                                            <ListItemIcon>
                                                <Description />
                                            </ListItemIcon>
                                            <ListItemText primary="Audit de sécurité" />
                                        </ListItem>
                                    </List>
                                    <Button
                                        variant="outlined"
                                        color="primary"
                                        endIcon={<ArrowForward />}
                                        fullWidth
                                        sx={{ mt: 2 }}
                                    >
                                        Explorer
                                    </Button>
                                </CardContent>
                            </StyledCard>
                        </Grid>

                        <Grid item xs={12} md={4}>
                            <StyledCard>
                                <CardContent>
                                    <CategoryIcon>
                                        <AccountBalance fontSize="large" />
                                    </CategoryIcon>
                                    <Typography variant="h5" component="h2" gutterBottom>
                                        Tokenomics avancés
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary" paragraph>
                                        Conception économique, modèles de distribution et stratégies de croissance
                                    </Typography>
                                    <List>
                                        <ListItem button>
                                            <ListItemIcon>
                                                <Description />
                                            </ListItemIcon>
                                            <ListItemText primary="Modèles économiques" />
                                        </ListItem>
                                        <ListItem button>
                                            <ListItemIcon>
                                                <Description />
                                            </ListItemIcon>
                                            <ListItemText primary="Stratégies de distribution" />
                                        </ListItem>
                                        <ListItem button>
                                            <ListItemIcon>
                                                <Description />
                                            </ListItemIcon>
                                            <ListItemText primary="Mécanismes incitatifs" />
                                        </ListItem>
                                    </List>
                                    <Button
                                        variant="outlined"
                                        color="primary"
                                        endIcon={<ArrowForward />}
                                        fullWidth
                                        sx={{ mt: 2 }}
                                    >
                                        Explorer
                                    </Button>
                                </CardContent>
                            </StyledCard>
                        </Grid>
                    </Grid>
                )}

                {tabValue === 1 && (
                    <Grid container spacing={4}>
                        <Grid item xs={12} md={6}>
                            <Paper sx={{ p: 3, mb: 4 }}>
                                <Typography variant="h5" gutterBottom>
                                    Guides pas à pas
                                </Typography>
                                <Divider sx={{ mb: 2 }} />

                                <List>
                                    <ListItem button>
                                        <ListItemIcon>
                                            <Assignment />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="Créer votre premier token en 15 minutes"
                                            secondary="Guide débutant pour créer un token ERC-20 basique"
                                        />
                                        <Chip label="Débutant" color="primary" size="small" />
                                    </ListItem>

                                    <ListItem button>
                                        <ListItemIcon>
                                            <Assignment />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="Configuration du staking pour votre token"
                                            secondary="Mise en place d'un système de staking avec récompenses"
                                        />
                                        <Chip label="Intermédiaire" color="secondary" size="small" />
                                    </ListItem>

                                    <ListItem button>
                                        <ListItemIcon>
                                            <Assignment />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="Déploiement multi-chain avec TokenForge"
                                            secondary="Étendre votre token sur plusieurs blockchains"
                                        />
                                        <Chip label="Avancé" color="error" size="small" />
                                    </ListItem>

                                    <ListItem button>
                                        <ListItemIcon>
                                            <Assignment />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="Optimisation des frais de gas"
                                            secondary="Techniques pour réduire les coûts de déploiement et d'utilisation"
                                        />
                                        <Chip label="Intermédiaire" color="secondary" size="small" />
                                    </ListItem>

                                    <ListItem button>
                                        <ListItemIcon>
                                            <Assignment />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="Création d'une landing page efficace"
                                            secondary="Concevoir une page de présentation attractive pour votre token"
                                        />
                                        <Chip label="Débutant" color="primary" size="small" />
                                    </ListItem>
                                </List>

                                <Button
                                    variant="outlined"
                                    color="primary"
                                    endIcon={<ArrowForward />}
                                    sx={{ mt: 2 }}
                                >
                                    Voir tous les guides
                                </Button>
                            </Paper>
                        </Grid>

                        <Grid item xs={12} md={6}>
                            <Paper sx={{ p: 3, mb: 4 }}>
                                <Typography variant="h5" gutterBottom>
                                    Tutoriels vidéo
                                </Typography>
                                <Divider sx={{ mb: 2 }} />

                                <List>
                                    <ListItem button>
                                        <ListItemIcon>
                                            <VideoLibrary />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="Introduction à TokenForge"
                                            secondary="Présentation des fonctionnalités principales"
                                        />
                                        <Box display="flex" alignItems="center">
                                            <Visibility fontSize="small" sx={{ mr: 0.5 }} />
                                            <Typography variant="caption">1.2K</Typography>
                                        </Box>
                                    </ListItem>

                                    <ListItem button>
                                        <ListItemIcon>
                                            <VideoLibrary />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="Configuration des mécanismes anti-whale"
                                            secondary="Protection contre les manipulations de marché"
                                        />
                                        <Box display="flex" alignItems="center">
                                            <Visibility fontSize="small" sx={{ mr: 0.5 }} />
                                            <Typography variant="caption">876</Typography>
                                        </Box>
                                    </ListItem>

                                    <ListItem button>
                                        <ListItemIcon>
                                            <VideoLibrary />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="Analyse des tokenomics"
                                            secondary="Conception d'un modèle économique viable"
                                        />
                                        <Box display="flex" alignItems="center">
                                            <Visibility fontSize="small" sx={{ mr: 0.5 }} />
                                            <Typography variant="caption">1.5K</Typography>
                                        </Box>
                                    </ListItem>

                                    <ListItem button>
                                        <ListItemIcon>
                                            <VideoLibrary />
                                        </ListItemIcon>
                                        <ListItemText
                                            primary="Déploiement sur Ethereum et BSC"
                                            secondary="Création de tokens multi-chain"
                                        />
                                        <Box display="flex" alignItems="center">
                                            <Visibility fontSize="small" sx={{ mr: 0.5 }} />
                                            <Typography variant="caption">932</Typography>
                                        </Box>
                                    </ListItem>
                                </List>

                                <Button
                                    variant="outlined"
                                    color="primary"
                                    endIcon={<ArrowForward />}
                                    sx={{ mt: 2 }}
                                >
                                    Voir tous les tutoriels
                                </Button>
                            </Paper>
                        </Grid>
                    </Grid>
                )}

                {tabValue === 2 && (
                    <Box>
                        <Typography variant="h5" gutterBottom>
                            Questions fréquemment posées
                        </Typography>
                        <Typography variant="body2" color="textSecondary" paragraph>
                            Trouvez rapidement des réponses aux questions les plus courantes
                        </Typography>

                        <Accordion>
                            <AccordionSummary expandIcon={<ExpandMore />}>
                                <Typography variant="subtitle1" fontWeight="medium">
                                    Quelles blockchains sont supportées par TokenForge?
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Typography variant="body2">
                                    TokenForge supporte actuellement 6 blockchains majeures: Ethereum, Binance Smart Chain (BSC),
                                    Polygon, Avalanche, Solana et Arbitrum. Nous ajoutons régulièrement de nouvelles blockchains
                                    en fonction des demandes de la communauté et des évolutions du marché.
                                </Typography>
                            </AccordionDetails>
                        </Accordion>

                        <Accordion>
                            <AccordionSummary expandIcon={<ExpandMore />}>
                                <Typography variant="subtitle1" fontWeight="medium">
                                    Comment fonctionne la protection Anti-Rugpull?
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Typography variant="body2">
                                    Notre système Anti-Rugpull combine plusieurs mécanismes de sécurité: verrouillage automatique
                                    de liquidité, timelock sur les fonctions critiques, limitations de vente pour les wallets
                                    fondateurs, et transparence totale des transactions. Ces mesures combinées rendent pratiquement
                                    impossible l'exécution d'un rugpull et garantissent la sécurité des investisseurs.
                                </Typography>
                            </AccordionDetails>
                        </Accordion>

                        <Accordion>
                            <AccordionSummary expandIcon={<ExpandMore />}>
                                <Typography variant="subtitle1" fontWeight="medium">
                                    Quels sont les frais de création et de déploiement?
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Typography variant="body2">
                                    Les frais de TokenForge sont en moyenne 20-40% inférieurs à ceux de nos concurrents.
                                    Ils se composent des frais de gas (variables selon la blockchain) et des frais de service
                                    (dépendant du plan choisi). Vous pouvez utiliser notre calculateur de coûts pour obtenir
                                    une estimation précise en fonction de vos besoins spécifiques.
                                </Typography>
                            </AccordionDetails>
                        </Accordion>

                        <Accordion>
                            <AccordionSummary expandIcon={<ExpandMore />}>
                                <Typography variant="subtitle1" fontWeight="medium">
                                    Puis-je modifier mon token après le déploiement?
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Typography variant="body2">
                                    Certains paramètres peuvent être modifiés après le déploiement, comme les limites de transaction,
                                    les taux de taxation, ou les adresses de distribution. Cependant, les paramètres fondamentaux
                                    comme le nom, le symbole ou le supply maximum ne peuvent généralement pas être modifiés une fois
                                    le contrat déployé. C'est pourquoi nous recommandons de bien vérifier tous les paramètres avant
                                    le déploiement final.
                                </Typography>
                            </AccordionDetails>
                        </Accordion>

                        <Accordion>
                            <AccordionSummary expandIcon={<ExpandMore />}>
                                <Typography variant="subtitle1" fontWeight="medium">
                                    Comment fonctionne le système de staking?
                                </Typography>
                            </AccordionSummary>
                            <AccordionDetails>
                                <Typography variant="body2">
                                    Notre système de staking permet aux détenteurs de tokens de verrouiller leurs actifs pour
                                    recevoir des récompenses. Vous pouvez configurer différents pools avec des périodes et des
                                    taux de récompense variables. Le système est entièrement personnalisable et peut être adapté
                                    à différents modèles économiques, que ce soit pour la fidélisation, la gouvernance ou
                                    l'incitation à long terme.
                                </Typography>
                            </AccordionDetails>
                        </Accordion>

                        <Box textAlign="center" mt={3}>
                            <Button variant="contained" color="primary">
                                Voir toutes les FAQ
                            </Button>
                        </Box>
                    </Box>
                )}

                {tabValue === 3 && (
                    <Box>
                        <Typography variant="h5" gutterBottom>
                            Résolution des problèmes
                        </Typography>
                        <Typography variant="body2" color="textSecondary" paragraph>
                            Solutions aux problèmes les plus courants rencontrés lors de la création et gestion de tokens
                        </Typography>

                        <Grid container spacing={4}>
                            <Grid item xs={12} md={6}>
                                <Paper sx={{ p: 3, mb: 4 }}>
                                    <Typography variant="h6" gutterBottom>
                                        Problèmes de déploiement
                                    </Typography>
                                    <Divider sx={{ mb: 2 }} />

                                    <List>
                                        <ListItem>
                                            <ListItemIcon>
                                                <BugReport color="error" />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary="Transaction échouée lors du déploiement"
                                                secondary="Solutions pour les erreurs de gas, nonce ou réseau"
                                            />
                                            <Button size="small" color="primary">
                                                Voir
                                            </Button>
                                        </ListItem>

                                        <ListItem>
                                            <ListItemIcon>
                                                <BugReport color="error" />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary="Contrat non vérifié sur l'explorateur"
                                                secondary="Procédure de vérification manuelle du contrat"
                                            />
                                            <Button size="small" color="primary">
                                                Voir
                                            </Button>
                                        </ListItem>

                                        <ListItem>
                                            <ListItemIcon>
                                                <BugReport color="error" />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary="Erreur de compilation du contrat"
                                                secondary="Résolution des problèmes de version Solidity et dépendances"
                                            />
                                            <Button size="small" color="primary">
                                                Voir
                                            </Button>
                                        </ListItem>
                                    </List>
                                </Paper>
                            </Grid>

                            <Grid item xs={12} md={6}>
                                <Paper sx={{ p: 3, mb: 4 }}>
                                    <Typography variant="h6" gutterBottom>
                                        Problèmes post-déploiement
                                    </Typography>
                                    <Divider sx={{ mb: 2 }} />

                                    <List>
                                        <ListItem>
                                            <ListItemIcon>
                                                <BugReport color="error" />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary="Tokens non visibles dans le wallet"
                                                secondary="Configuration de l'import de tokens personnalisés"
                                            />
                                            <Button size="small" color="primary">
                                                Voir
                                            </Button>
                                        </ListItem>

                                        <ListItem>
                                            <ListItemIcon>
                                                <BugReport color="error" />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary="Problèmes de liquidité sur DEX"
                                                secondary="Diagnostic et résolution des problèmes de paires de trading"
                                            />
                                            <Button size="small" color="primary">
                                                Voir
                                            </Button>
                                        </ListItem>

                                        <ListItem>
                                            <ListItemIcon>
                                                <BugReport color="error" />
                                            </ListItemIcon>
                                            <ListItemText
                                                primary="Fonctions owner inaccessibles"
                                                secondary="Récupération des droits administratifs et gestion des clés"
                                            />
                                            <Button size="small" color="primary">
                                                Voir
                                            </Button>
                                        </ListItem>
                                    </List>
                                </Paper>
                            </Grid>

                            <Grid item xs={12}>
                                <Box textAlign="center">
                                    <Button
                                        variant="contained"
                                        color="primary"
                                        startIcon={<BugReport />}
                                    >
                                        Soumettre un nouveau problème
                                    </Button>
                                </Box>
                            </Grid>
                        </Grid>
                    </Box>
                )}
            </Box>

            <Paper sx={{ p: 4, mt: 4, textAlign: 'center' }}>
                <Typography variant="h5" gutterBottom>
                    Vous ne trouvez pas ce que vous cherchez?
                </Typography>
                <Typography variant="body1" paragraph>
                    Notre équipe de support est disponible pour vous aider avec toutes vos questions
                </Typography>
                <Button
                    variant="contained"
                    color="primary"
                    size="large"
                >
                    Contacter le support
                </Button>
            </Paper>
        </Container>
    );
};

export default KnowledgeBasePage;
