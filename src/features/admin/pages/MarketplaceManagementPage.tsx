import React, { useState } from 'react';
import {
    Container,
    Typography,
    Box,
    Paper,
    Tabs,
    Tab,
    Grid,
    CardMedia,
    Button,
    Chip,
    Avatar,
    List,
    ListItem,
    ListItemText,
    TextField,
    InputAdornment,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Table,
    TableContainer,
    TableHead,
    TableRow,
    TableCell,
    TableBody,
    Rating
} from '@mui/material';
import {
    Search,
    CheckCircle,
    Cancel,
    Flag
} from '@mui/icons-material';

export const MarketplaceManagementPage: React.FC = () => {
    const [tabValue, setTabValue] = useState(0);
    const [searchValue, setSearchValue] = useState('');
    const [filterValue, setFilterValue] = useState('all');
    const [sortValue, setSortValue] = useState('recent');
    const [_openDialog, setOpenDialog] = useState(false);
    const [_selectedTemplate, setSelectedTemplate] = useState<number | null>(null);
    const [_selectedComment, setSelectedComment] = useState<number | null>(null);

    // Données simulées pour les templates en attente d'approbation
    const pendingTemplates = [
        {
            id: 1,
            name: "DeFi Yield Farming Token",
            creator: "CryptoBuilder",
            creatorAvatar: "/images/avatar-1.jpg",
            category: "DeFi",
            price: 0.05,
            submissionDate: "28 Février 2025",
            status: "pending",
            description: "Template optimisé pour les projets DeFi avec mécanismes de farming et staking intégrés. Inclut des fonctionnalités de récompense automatique et de verrouillage de liquidité.",
            image: "/images/template-defi.jpg",
            features: ["Auto-staking", "Liquidity locking", "Reward distribution", "Anti-whale"],
            blockchain: ["Ethereum", "BSC", "Polygon"]
        },
        {
            id: 2,
            name: "GameFi Token Standard",
            creator: "GameDevPro",
            creatorAvatar: "/images/avatar-2.jpg",
            category: "GameFi",
            price: 0.08,
            submissionDate: "27 Février 2025",
            status: "pending",
            description: "Template spécialement conçu pour les tokens de jeux blockchain avec fonctionnalités d'items NFT et économie in-game.",
            image: "/images/template-gamefi.jpg",
            features: ["NFT integration", "In-game economy", "Player rewards", "Marketplace ready"],
            blockchain: ["Ethereum", "Solana", "Avalanche"]
        },
        {
            id: 3,
            name: "DAO Governance Token",
            creator: "DAOmaster",
            creatorAvatar: "/images/avatar-3.jpg",
            category: "Governance",
            price: 0.06,
            submissionDate: "25 Février 2025",
            status: "pending",
            description: "Template pour tokens de gouvernance avec système de vote, délégation et propositions intégrées.",
            image: "/images/template-dao.jpg",
            features: ["Voting system", "Delegation", "Proposal mechanism", "Timelock"],
            blockchain: ["Ethereum", "Arbitrum", "Optimism"]
        }
    ];

    // Données simulées pour les commentaires à modérer
    const commentsToModerate = [
        {
            id: 101,
            user: "TokenUser123",
            userAvatar: "/images/user-1.jpg",
            templateId: 5,
            templateName: "Social Token Pro",
            comment: "Ce template est exactement ce que je cherchais ! Très facile à utiliser et bien documenté.",
            rating: 5,
            date: "1 Mars 2025",
            status: "pending",
            flags: 0
        },
        {
            id: 102,
            user: "CryptoExplorer",
            userAvatar: "/images/user-2.jpg",
            templateId: 8,
            templateName: "DeFi Staking Master",
            comment: "Attention, ce template contient des vulnérabilités ! J'ai trouvé une faille dans la fonction de distribution des récompenses.",
            rating: 2,
            date: "28 Février 2025",
            status: "flagged",
            flags: 3
        },
        {
            id: 103,
            user: "BlockchainDev",
            userAvatar: "/images/user-3.jpg",
            templateId: 12,
            templateName: "NFT Marketplace Token",
            comment: "Contactez-moi sur Telegram @scammer pour un template gratuit bien meilleur que celui-ci !",
            rating: 1,
            date: "27 Février 2025",
            status: "flagged",
            flags: 5
        }
    ];

    // Données simulées pour les royalties
    const royaltiesData = [
        {
            id: 201,
            creator: "CryptoBuilder",
            templateName: "DeFi Yield Farming Token",
            sales: 28,
            totalRevenue: 1.4,
            creatorRevenue: 0.98,
            platformFee: 0.42,
            lastPayout: "25 Février 2025",
            nextPayout: "10 Mars 2025"
        },
        {
            id: 202,
            creator: "GameDevPro",
            templateName: "GameFi Token Standard",
            sales: 15,
            totalRevenue: 1.2,
            creatorRevenue: 0.84,
            platformFee: 0.36,
            lastPayout: "25 Février 2025",
            nextPayout: "10 Mars 2025"
        },
        {
            id: 203,
            creator: "DAOmaster",
            templateName: "DAO Governance Token",
            sales: 12,
            totalRevenue: 0.72,
            creatorRevenue: 0.504,
            platformFee: 0.216,
            lastPayout: "25 Février 2025",
            nextPayout: "10 Mars 2025"
        }
    ];

    // Données simulées pour les statistiques de ventes
    const salesStats = {
        totalSales: 342,
        totalRevenue: 18.6,
        topCategories: [
            { name: "DeFi", sales: 145, percentage: 42 },
            { name: "GameFi", sales: 98, percentage: 29 },
            { name: "Governance", sales: 56, percentage: 16 },
            { name: "Social", sales: 43, percentage: 13 }
        ],
        monthlySales: [
            { month: "Septembre 2024", sales: 42, revenue: 2.1 },
            { month: "Octobre 2024", sales: 56, revenue: 2.8 },
            { month: "Novembre 2024", sales: 68, revenue: 3.4 },
            { month: "Décembre 2024", sales: 75, revenue: 3.75 },
            { month: "Janvier 2025", sales: 82, revenue: 4.1 },
            { month: "Février 2025", sales: 89, revenue: 4.45 }
        ]
    };

    const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
        setTabValue(newValue);
    };

    const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setSearchValue(event.target.value);
    };

    const handleFilterChange = (event: any) => {
        setFilterValue(event.target.value as string);
    };

    const handleSortChange = (event: any) => {
        setSortValue(event.target.value as string);
    };


    const handleOpenTemplateDialog = (templateId: number) => {
        setSelectedTemplate(templateId);
        setOpenDialog(true);
    };

    const handleOpenCommentDialog = (commentId: number) => {
        setSelectedComment(commentId);
        setOpenDialog(true);
    };


    const handleApproveTemplate = (templateId: number) => {
        console.log(`Template ${templateId} approved`);
        // Logique d'approbation à implémenter
    };

    const handleRejectTemplate = (templateId: number) => {
        console.log(`Template ${templateId} rejected`);
        // Logique de rejet à implémenter
    };

    const handleApproveComment = (commentId: number) => {
        console.log(`Comment ${commentId} approved`);
        // Logique d'approbation à implémenter
    };

    const handleRejectComment = (commentId: number) => {
        console.log(`Comment ${commentId} rejected`);
        // Logique de rejet à implémenter
    };

    return (
        <Container maxWidth="lg" sx={{ py: 6 }}>
            <Typography variant="h3" component="h1" gutterBottom align="center" fontWeight="bold">
                Gestion de la Marketplace
            </Typography>
            <Typography variant="h6" align="center" color="textSecondary" paragraph sx={{ mb: 6 }}>
                Gérez les templates, les commentaires et les royalties de la marketplace
            </Typography>

            <Box sx={{ mb: 4 }}>
                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    variant="fullWidth"
                    textColor="primary"
                    indicatorColor="primary"
                >
                    <Tab label="Approbation des templates" />
                    <Tab label="Modération des commentaires" />
                    <Tab label="Gestion des royalties" />
                    <Tab label="Statistiques de ventes" />
                </Tabs>
            </Box>

            {tabValue === 0 && (
                <>
                    <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                        <TextField
                            placeholder="Rechercher un template..."
                            variant="outlined"
                            size="small"
                            value={searchValue}
                            onChange={handleSearchChange}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ flexGrow: 1, maxWidth: { xs: '100%', sm: 300 } }}
                        />

                        <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
                            <InputLabel>Catégorie</InputLabel>
                            <Select
                                value={filterValue}
                                onChange={handleFilterChange}
                                label="Catégorie"
                            >
                                <MenuItem value="all">Toutes</MenuItem>
                                <MenuItem value="defi">DeFi</MenuItem>
                                <MenuItem value="gamefi">GameFi</MenuItem>
                                <MenuItem value="governance">Governance</MenuItem>
                                <MenuItem value="social">Social</MenuItem>
                                <MenuItem value="utility">Utility</MenuItem>
                            </Select>
                        </FormControl>

                        <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
                            <InputLabel>Trier par</InputLabel>
                            <Select
                                value={sortValue}
                                onChange={handleSortChange}
                                label="Trier par"
                            >
                                <MenuItem value="recent">Plus récent</MenuItem>
                                <MenuItem value="oldest">Plus ancien</MenuItem>
                                <MenuItem value="price-asc">Prix (croissant)</MenuItem>
                                <MenuItem value="price-desc">Prix (décroissant)</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>

                    <Typography variant="h5" gutterBottom>
                        Templates en attente d'approbation
                    </Typography>
                    <Typography variant="body2" color="textSecondary" paragraph>
                        {pendingTemplates.length} templates nécessitent votre validation
                    </Typography>

                    <Grid container spacing={4}>
                        {pendingTemplates.map((template) => (
                            <Grid item xs={12} md={6} key={template.id}>
                                <Paper sx={{ p: 0, overflow: 'hidden' }}>
                                    <Grid container>
                                        <Grid item xs={12} sm={4}>
                                            <Box sx={{ position: 'relative', height: '100%' }}>
                                                <CardMedia
                                                    component="img"
                                                    image={template.image}
                                                    alt={template.name}
                                                    sx={{ height: '100%', minHeight: 200 }}
                                                />
                                                <Chip
                                                    label={template.category}
                                                    color="primary"
                                                    size="small"
                                                    sx={{ position: 'absolute', top: 10, right: 10 }}
                                                />
                                            </Box>
                                        </Grid>
                                        <Grid item xs={12} sm={8}>
                                            <Box sx={{ p: 3 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                                                    <Avatar src={template.creatorAvatar} sx={{ mr: 1, width: 24, height: 24 }} />
                                                    <Typography variant="body2" color="textSecondary">
                                                        {template.creator}
                                                    </Typography>
                                                </Box>
                                                <Typography variant="h6" gutterBottom>
                                                    {template.name}
                                                </Typography>
                                                <Typography variant="body2" paragraph>
                                                    {template.description.substring(0, 120)}...
                                                </Typography>
                                                <Box sx={{ mb: 2 }}>
                                                    {template.features.slice(0, 3).map((feature) => (
                                                        <Chip
                                                            key={feature}
                                                            label={feature}
                                                            size="small"
                                                            sx={{ mr: 0.5, mb: 0.5 }}
                                                        />
                                                    ))}
                                                    {template.features.length > 3 && (
                                                        <Chip
                                                            label={`+${template.features.length - 3}`}
                                                            size="small"
                                                            variant="outlined"
                                                            sx={{ mb: 0.5 }}
                                                        />
                                                    )}
                                                </Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                                    <Typography variant="h6" color="primary">
                                                        {template.price} ETH
                                                    </Typography>
                                                    <Typography variant="caption" color="textSecondary">
                                                        Soumis le {template.submissionDate}
                                                    </Typography>
                                                </Box>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                                    <Button
                                                        size="small"
                                                        onClick={() => handleOpenTemplateDialog(template.id)}
                                                    >
                                                        Voir détails
                                                    </Button>
                                                    <Box>
                                                        <Button
                                                            size="small"
                                                            color="error"
                                                            startIcon={<Cancel />}
                                                            onClick={() => handleRejectTemplate(template.id)}
                                                            sx={{ mr: 1 }}
                                                        >
                                                            Rejeter
                                                        </Button>
                                                        <Button
                                                            size="small"
                                                            variant="contained"
                                                            color="success"
                                                            startIcon={<CheckCircle />}
                                                            onClick={() => handleApproveTemplate(template.id)}
                                                        >
                                                            Approuver
                                                        </Button>
                                                    </Box>
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
                <Box>
                    <Typography variant="h5" gutterBottom>
                        Modération des commentaires
                    </Typography>
                    <Typography variant="body2" color="textSecondary" paragraph>
                        Gérez les commentaires signalés et en attente d'approbation
                    </Typography>

                    <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                        <TextField
                            placeholder="Rechercher un commentaire..."
                            variant="outlined"
                            size="small"
                            value={searchValue}
                            onChange={handleSearchChange}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <Search />
                                    </InputAdornment>
                                ),
                            }}
                            sx={{ flexGrow: 1, maxWidth: { xs: '100%', sm: 300 } }}
                        />

                        <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
                            <InputLabel>Statut</InputLabel>
                            <Select
                                value={filterValue}
                                onChange={handleFilterChange}
                                label="Statut"
                            >
                                <MenuItem value="all">Tous</MenuItem>
                                <MenuItem value="pending">En attente</MenuItem>
                                <MenuItem value="flagged">Signalés</MenuItem>
                                <MenuItem value="approved">Approuvés</MenuItem>
                                <MenuItem value="rejected">Rejetés</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>

                    <Grid container spacing={3}>
                        {commentsToModerate.map((comment) => (
                            <Grid item xs={12} key={comment.id}>
                                <Paper sx={{ p: 3 }}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                                            <Avatar src={comment.userAvatar} sx={{ mr: 2 }} />
                                            <Box>
                                                <Typography variant="subtitle1" fontWeight="bold">
                                                    {comment.user}
                                                </Typography>
                                                <Typography variant="caption" color="textSecondary" display="block">
                                                    Sur {comment.templateName} • {comment.date}
                                                </Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5, mb: 1 }}>
                                                    <Rating
                                                        value={comment.rating}
                                                        readOnly
                                                        size="small"
                                                    />
                                                </Box>
                                            </Box>
                                        </Box>
                                        <Box>
                                            {comment.status === 'pending' && (
                                                <Chip label="En attente" color="primary" size="small" />
                                            )}
                                            {comment.status === 'flagged' && (
                                                <Chip
                                                    icon={<Flag />}
                                                    label={`Signalé (${comment.flags})`}
                                                    color="error"
                                                    size="small"
                                                />
                                            )}
                                        </Box>
                                    </Box>
                                    <Typography variant="body1" paragraph sx={{ mt: 2 }}>
                                        "{comment.comment}"
                                    </Typography>
                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                        <Button
                                            size="small"
                                            onClick={() => handleOpenCommentDialog(comment.id)}
                                        >
                                            Détails
                                        </Button>
                                        <Button
                                            size="small"
                                            color="error"
                                            startIcon={<Cancel />}
                                            onClick={() => handleRejectComment(comment.id)}
                                        >
                                            Rejeter
                                        </Button>
                                        <Button
                                            size="small"
                                            variant="contained"
                                            color="success"
                                            startIcon={<CheckCircle />}
                                            onClick={() => handleApproveComment(comment.id)}
                                        >
                                            Approuver
                                        </Button>
                                    </Box>
                                </Paper>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            )}

            {tabValue === 2 && (
                <Box>
                    <Typography variant="h5" gutterBottom>
                        Gestion des royalties
                    </Typography>
                    <Typography variant="body2" color="textSecondary" paragraph>
                        Suivez et gérez les royalties des créateurs de templates
                    </Typography>

                    <TableContainer component={Paper} sx={{ mb: 4 }}>
                        <Table>
                            <TableHead>
                                <TableRow sx={{ backgroundColor: 'primary.light' }}>
                                    <TableCell>Créateur</TableCell>
                                    <TableCell>Template</TableCell>
                                    <TableCell align="right">Ventes</TableCell>
                                    <TableCell align="right">Revenu total (ETH)</TableCell>
                                    <TableCell align="right">Part créateur (ETH)</TableCell>
                                    <TableCell align="right">Frais plateforme (ETH)</TableCell>
                                    <TableCell>Dernier paiement</TableCell>
                                    <TableCell>Prochain paiement</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {royaltiesData.map((royalty) => (
                                    <TableRow key={royalty.id}>
                                        <TableCell>{royalty.creator}</TableCell>
                                        <TableCell>{royalty.templateName}</TableCell>
                                        <TableCell align="right">{royalty.sales}</TableCell>
                                        <TableCell align="right">{royalty.totalRevenue}</TableCell>
                                        <TableCell align="right">{royalty.creatorRevenue}</TableCell>
                                        <TableCell align="right">{royalty.platformFee}</TableCell>
                                        <TableCell>{royalty.lastPayout}</TableCell>
                                        <TableCell>{royalty.nextPayout}</TableCell>
                                        <TableCell>
                                            <Button size="small" variant="outlined">
                                                Détails
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                            <Paper sx={{ p: 3 }}>
                                <Typography variant="h6" gutterBottom>
                                    Configuration des royalties
                                </Typography>
                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="subtitle2" gutterBottom>
                                        Taux de royalties par catégorie
                                    </Typography>
                                    <Grid container spacing={2}>
                                        <Grid item xs={6}>
                                            <TextField
                                                label="DeFi"
                                                defaultValue="70"
                                                size="small"
                                                InputProps={{
                                                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                                                }}
                                                fullWidth
                                            />
                                        </Grid>
                                        <Grid item xs={6}>
                                            <TextField
                                                label="GameFi"
                                                defaultValue="70"
                                                size="small"
                                                InputProps={{
                                                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                                                }}
                                                fullWidth
                                            />
                                        </Grid>
                                        <Grid item xs={6}>
                                            <TextField
                                                label="Governance"
                                                defaultValue="70"
                                                size="small"
                                                InputProps={{
                                                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                                                }}
                                                fullWidth
                                            />
                                        </Grid>
                                        <Grid item xs={6}>
                                            <TextField
                                                label="Social"
                                                defaultValue="70"
                                                size="small"
                                                InputProps={{
                                                    endAdornment: <InputAdornment position="end">%</InputAdornment>,
                                                }}
                                                fullWidth
                                            />
                                        </Grid>
                                    </Grid>
                                </Box>
                                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                    <Button variant="contained" color="primary">
                                        Enregistrer les modifications
                                    </Button>
                                </Box>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Paper sx={{ p: 3 }}>
                                <Typography variant="h6" gutterBottom>
                                    Paiements en attente
                                </Typography>
                                <Typography variant="body2" paragraph>
                                    3 paiements prévus pour le 10 Mars 2025
                                </Typography>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="subtitle1">
                                        Montant total à payer:
                                    </Typography>
                                    <Typography variant="h6" color="primary">
                                        2.324 ETH
                                    </Typography>
                                </Box>
                                <Button variant="contained" color="primary" fullWidth>
                                    Traiter les paiements
                                </Button>
                            </Paper>
                        </Grid>
                    </Grid>
                </Box>
            )}

            {tabValue === 3 && (
                <Box>
                    <Typography variant="h5" gutterBottom>
                        Statistiques de ventes
                    </Typography>
                    <Typography variant="body2" color="textSecondary" paragraph>
                        Analysez les performances de la marketplace
                    </Typography>

                    <Grid container spacing={3} sx={{ mb: 4 }}>
                        <Grid item xs={12} sm={6} md={3}>
                            <Paper sx={{ p: 3, textAlign: 'center' }}>
                                <Typography variant="h4" color="primary">
                                    {salesStats.totalSales}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    Ventes totales
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Paper sx={{ p: 3, textAlign: 'center' }}>
                                <Typography variant="h4" color="primary">
                                    {salesStats.totalRevenue} ETH
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    Revenu total
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Paper sx={{ p: 3, textAlign: 'center' }}>
                                <Typography variant="h4" color="primary">
                                    {(salesStats.totalRevenue * 0.3).toFixed(2)} ETH
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    Frais de plateforme
                                </Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <Paper sx={{ p: 3, textAlign: 'center' }}>
                                <Typography variant="h4" color="primary">
                                    {salesStats.monthlySales[salesStats.monthlySales.length - 1].sales}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    Ventes ce mois
                                </Typography>
                            </Paper>
                        </Grid>
                    </Grid>

                    <Grid container spacing={4}>
                        <Grid item xs={12} md={6}>
                            <Paper sx={{ p: 3 }}>
                                <Typography variant="h6" gutterBottom>
                                    Ventes par catégorie
                                </Typography>
                                <List>
                                    {salesStats.topCategories.map((category) => (
                                        <ListItem key={category.name} sx={{ px: 0 }}>
                                            <ListItemText
                                                primary={category.name}
                                                secondary={`${category.sales} ventes`}
                                            />
                                            <Box sx={{ width: '60%' }}>
                                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                                                    <Typography variant="body2" color="textSecondary">
                                                        {category.percentage}%
                                                    </Typography>
                                                </Box>
                                                <Box
                                                    sx={{
                                                        width: '100%',
                                                        height: 8,
                                                        backgroundColor: 'grey.300',
                                                        borderRadius: 1
                                                    }}
                                                >
                                                    <Box
                                                        sx={{
                                                            width: `${category.percentage}%`,
                                                            height: 8,
                                                            backgroundColor: 'primary.main',
                                                            borderRadius: 1
                                                        }}
                                                    />
                                                </Box>
                                            </Box>
                                        </ListItem>
                                    ))}
                                </List>
                            </Paper>
                        </Grid>
                        <Grid item xs={12} md={6}>
                            <Paper sx={{ p: 3 }}>
                                <Typography variant="h6" gutterBottom>
                                    Évolution des ventes
                                </Typography>
                                <Box sx={{ height: 300, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                    <Typography variant="body2" color="textSecondary" align="center">
                                        Graphique d'évolution des ventes (à implémenter)
                                    </Typography>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                                        {salesStats.monthlySales.map((month) => (
                                            <Box key={month.month} sx={{ textAlign: 'center' }}>
                                                <Typography variant="caption" color="textSecondary">
                                                    {month.month.split(' ')[0].substring(0, 3)}
                                                </Typography>
                                                <Box
                                                    sx={{
                                                        height: 100,
                                                        width: 20,
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        justifyContent: 'flex-end',
                                                        mx: 'auto'
                                                    }}
                                                >
                                                    <Box
                                                        sx={{
                                                            height: `${(month.sales / 100) * 100}%`,
                                                            backgroundColor: 'primary.main',
                                                            borderRadius: '4px 4px 0 0'
                                                        }}
                                                    />
                                                </Box>
                                                <Typography variant="caption" fontWeight="bold">
                                                    {month.sales}
                                                </Typography>
                                            </Box>
                                        ))}
                                    </Box>
                                </Box>
                            </Paper>
                        </Grid>
                    </Grid>
                </Box>
            )}
        </Container>
    );
};
