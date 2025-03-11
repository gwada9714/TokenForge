import React, { useState } from 'react';
import {
    Container,
    Typography,
    Grid,
    Box,
    Card,
    CardContent,
    CardHeader,
    Button,
    Stepper,
    Step,
    StepLabel,
    Divider,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Paper,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Chip,
    Avatar,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Accordion,
    AccordionSummary,
    AccordionDetails
} from '@mui/material';
import {
    EmojiEvents,
    ExpandMore,
    Group,
    CheckCircle,
    Star,
    StarBorder,
    Campaign,
    School,
    Code,
    Forum,
    Translate,
    ArrowForward,
    LinkedIn,
    Twitter,
    GitHub
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

const BenefitIcon = styled(Box)(({ theme }) => ({
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

const StyledAvatar = styled(Avatar)(({ theme }) => ({
    width: 80,
    height: 80,
    margin: '0 auto',
    marginBottom: theme.spacing(2),
    border: `3px solid ${theme.palette.primary.main}`,
}));

const AmbassadorProgramPage: React.FC = () => {
    const [activeStep, setActiveStep] = useState(0);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        country: '',
        experience: '',
        motivation: '',
        socialMedia: '',
        skills: []
    });

    const handleNext = () => {
        setActiveStep((prevActiveStep) => prevActiveStep + 1);
    };

    const handleBack = () => {
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleSelectChange = (e: any) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    return (
        <Container maxWidth="lg" sx={{ py: 6 }}>
            <Typography variant="h3" component="h1" gutterBottom align="center" fontWeight="bold">
                Programme d'Ambassadeurs TokenForge
            </Typography>
            <Typography variant="h6" align="center" color="textSecondary" paragraph sx={{ mb: 6 }}>
                Rejoignez notre communauté d'élite et contribuez à façonner l'avenir de la création de tokens
            </Typography>

            <Grid container spacing={6} sx={{ mb: 8 }}>
                <Grid item xs={12} md={6}>
                    <Box>
                        <Typography variant="h4" gutterBottom>
                            Devenez Ambassadeur TokenForge
                        </Typography>
                        <Typography variant="body1" paragraph>
                            Notre programme d'ambassadeurs réunit des passionnés de blockchain et de crypto-monnaies du monde entier.
                            En tant qu'ambassadeur, vous représenterez TokenForge dans votre communauté locale et en ligne, tout en
                            développant vos compétences et votre réseau.
                        </Typography>
                        <Typography variant="body1" paragraph>
                            Nous recherchons des personnes enthousiastes, créatives et engagées qui souhaitent contribuer à la
                            démocratisation de la création de tokens et à l'adoption des technologies blockchain.
                        </Typography>
                        <Button
                            variant="contained"
                            color="primary"
                            size="large"
                            endIcon={<ArrowForward />}
                            onClick={() => setActiveStep(1)}
                            sx={{ mt: 2 }}
                        >
                            Postuler maintenant
                        </Button>
                    </Box>
                </Grid>
                <Grid item xs={12} md={6}>
                    <Box component="img"
                        src="/images/ambassador-program.jpg"
                        alt="Programme d'ambassadeurs"
                        sx={{
                            width: '100%',
                            borderRadius: 2,
                            boxShadow: 3,
                            height: 'auto',
                            maxHeight: 400,
                            objectFit: 'cover'
                        }}
                    />
                </Grid>
            </Grid>

            <Box sx={{ mb: 8 }}>
                <Typography variant="h4" align="center" gutterBottom>
                    Avantages du Programme
                </Typography>
                <Typography variant="body1" align="center" color="textSecondary" paragraph sx={{ mb: 4 }}>
                    Rejoindre notre programme d'ambassadeurs vous offre de nombreux avantages
                </Typography>

                <Grid container spacing={4}>
                    <Grid item xs={12} sm={6} md={3}>
                        <StyledCard>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <BenefitIcon sx={{ mx: 'auto' }}>
                                    <EmojiEvents fontSize="large" />
                                </BenefitIcon>
                                <Typography variant="h6" gutterBottom>
                                    Récompenses exclusives
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    Gagnez des tokens, des NFTs exclusifs et des récompenses financières en fonction de vos contributions
                                </Typography>
                            </CardContent>
                        </StyledCard>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <StyledCard>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <BenefitIcon sx={{ mx: 'auto' }}>
                                    <School fontSize="large" />
                                </BenefitIcon>
                                <Typography variant="h6" gutterBottom>
                                    Formation avancée
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    Accédez à des formations exclusives sur la blockchain, la tokenomics et le marketing digital
                                </Typography>
                            </CardContent>
                        </StyledCard>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <StyledCard>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <BenefitIcon sx={{ mx: 'auto' }}>
                                    <Group fontSize="large" />
                                </BenefitIcon>
                                <Typography variant="h6" gutterBottom>
                                    Réseau international
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    Connectez-vous avec d'autres ambassadeurs et experts de l'industrie blockchain du monde entier
                                </Typography>
                            </CardContent>
                        </StyledCard>
                    </Grid>

                    <Grid item xs={12} sm={6} md={3}>
                        <StyledCard>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <BenefitIcon sx={{ mx: 'auto' }}>
                                    <Campaign fontSize="large" />
                                </BenefitIcon>
                                <Typography variant="h6" gutterBottom>
                                    Visibilité accrue
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                    Opportunités de prise de parole lors d'événements et mise en avant de vos contributions
                                </Typography>
                            </CardContent>
                        </StyledCard>
                    </Grid>
                </Grid>
            </Box>

            <Box sx={{ mb: 8 }}>
                <Typography variant="h4" align="center" gutterBottom>
                    Missions et Récompenses
                </Typography>
                <Typography variant="body1" align="center" color="textSecondary" paragraph sx={{ mb: 4 }}>
                    Accomplissez des missions variées et gagnez des points pour monter en niveau
                </Typography>

                <TableContainer component={Paper} sx={{ mb: 4 }}>
                    <Table>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: 'primary.light' }}>
                                <TableCell>Type de mission</TableCell>
                                <TableCell>Description</TableCell>
                                <TableCell>Points</TableCell>
                                <TableCell>Difficulté</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            <TableRow>
                                <TableCell>
                                    <Box display="flex" alignItems="center">
                                        <Forum sx={{ mr: 1 }} color="primary" />
                                        Engagement communautaire
                                    </Box>
                                </TableCell>
                                <TableCell>Animer des discussions, répondre aux questions, modérer les forums</TableCell>
                                <TableCell>5-20</TableCell>
                                <TableCell>
                                    <Box display="flex">
                                        <Star color="warning" />
                                        <StarBorder color="warning" />
                                        <StarBorder color="warning" />
                                    </Box>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>
                                    <Box display="flex" alignItems="center">
                                        <School sx={{ mr: 1 }} color="primary" />
                                        Contenu éducatif
                                    </Box>
                                </TableCell>
                                <TableCell>Créer des tutoriels, guides, articles explicatifs sur TokenForge</TableCell>
                                <TableCell>20-50</TableCell>
                                <TableCell>
                                    <Box display="flex">
                                        <Star color="warning" />
                                        <Star color="warning" />
                                        <StarBorder color="warning" />
                                    </Box>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>
                                    <Box display="flex" alignItems="center">
                                        <Translate sx={{ mr: 1 }} color="primary" />
                                        Traduction
                                    </Box>
                                </TableCell>
                                <TableCell>Traduire la documentation, l'interface ou le contenu marketing</TableCell>
                                <TableCell>15-40</TableCell>
                                <TableCell>
                                    <Box display="flex">
                                        <Star color="warning" />
                                        <Star color="warning" />
                                        <StarBorder color="warning" />
                                    </Box>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>
                                    <Box display="flex" alignItems="center">
                                        <Campaign sx={{ mr: 1 }} color="primary" />
                                        Promotion
                                    </Box>
                                </TableCell>
                                <TableCell>Organiser des événements, webinaires, campagnes sur les réseaux sociaux</TableCell>
                                <TableCell>30-100</TableCell>
                                <TableCell>
                                    <Box display="flex">
                                        <Star color="warning" />
                                        <Star color="warning" />
                                        <Star color="warning" />
                                    </Box>
                                </TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>
                                    <Box display="flex" alignItems="center">
                                        <Code sx={{ mr: 1 }} color="primary" />
                                        Contribution technique
                                    </Box>
                                </TableCell>
                                <TableCell>Développer des templates, tester des fonctionnalités, signaler des bugs</TableCell>
                                <TableCell>25-150</TableCell>
                                <TableCell>
                                    <Box display="flex">
                                        <Star color="warning" />
                                        <Star color="warning" />
                                        <Star color="warning" />
                                    </Box>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </TableContainer>

                <Typography variant="h5" gutterBottom>
                    Niveaux et Privilèges
                </Typography>
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} md={4}>
                        <Card variant="outlined">
                            <CardHeader
                                title="Niveau 1: Explorateur"
                                titleTypographyProps={{ variant: 'h6' }}
                                avatar={<Avatar sx={{ bgcolor: 'bronze' }}>1</Avatar>}
                            />
                            <CardContent>
                                <Typography variant="body2" paragraph>
                                    0-500 points
                                </Typography>
                                <Divider sx={{ mb: 2 }} />
                                <List dense>
                                    <ListItem>
                                        <ListItemIcon>
                                            <CheckCircle color="success" fontSize="small" />
                                        </ListItemIcon>
                                        <ListItemText primary="Accès au canal Discord privé" />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemIcon>
                                            <CheckCircle color="success" fontSize="small" />
                                        </ListItemIcon>
                                        <ListItemText primary="Badge Ambassadeur niveau 1" />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemIcon>
                                            <CheckCircle color="success" fontSize="small" />
                                        </ListItemIcon>
                                        <ListItemText primary="Récompenses de base pour les missions" />
                                    </ListItem>
                                </List>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card variant="outlined">
                            <CardHeader
                                title="Niveau 2: Innovateur"
                                titleTypographyProps={{ variant: 'h6' }}
                                avatar={<Avatar sx={{ bgcolor: 'silver' }}>2</Avatar>}
                            />
                            <CardContent>
                                <Typography variant="body2" paragraph>
                                    501-2000 points
                                </Typography>
                                <Divider sx={{ mb: 2 }} />
                                <List dense>
                                    <ListItem>
                                        <ListItemIcon>
                                            <CheckCircle color="success" fontSize="small" />
                                        </ListItemIcon>
                                        <ListItemText primary="Tous les avantages du niveau 1" />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemIcon>
                                            <CheckCircle color="success" fontSize="small" />
                                        </ListItemIcon>
                                        <ListItemText primary="Réductions sur les services TokenForge" />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemIcon>
                                            <CheckCircle color="success" fontSize="small" />
                                        </ListItemIcon>
                                        <ListItemText primary="Accès aux webinaires exclusifs" />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemIcon>
                                            <CheckCircle color="success" fontSize="small" />
                                        </ListItemIcon>
                                        <ListItemText primary="NFT exclusif niveau 2" />
                                    </ListItem>
                                </List>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <Card variant="outlined" sx={{ borderColor: 'gold', boxShadow: 3 }}>
                            <CardHeader
                                title="Niveau 3: Visionnaire"
                                titleTypographyProps={{ variant: 'h6' }}
                                avatar={<Avatar sx={{ bgcolor: 'gold' }}>3</Avatar>}
                            />
                            <CardContent>
                                <Typography variant="body2" paragraph>
                                    2001+ points
                                </Typography>
                                <Divider sx={{ mb: 2 }} />
                                <List dense>
                                    <ListItem>
                                        <ListItemIcon>
                                            <CheckCircle color="success" fontSize="small" />
                                        </ListItemIcon>
                                        <ListItemText primary="Tous les avantages des niveaux précédents" />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemIcon>
                                            <CheckCircle color="success" fontSize="small" />
                                        </ListItemIcon>
                                        <ListItemText primary="Invitation aux événements exclusifs" />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemIcon>
                                            <CheckCircle color="success" fontSize="small" />
                                        </ListItemIcon>
                                        <ListItemText primary="Opportunités de mentorat avec l'équipe" />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemIcon>
                                            <CheckCircle color="success" fontSize="small" />
                                        </ListItemIcon>
                                        <ListItemText primary="Partage des revenus sur certaines missions" />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemIcon>
                                            <CheckCircle color="success" fontSize="small" />
                                        </ListItemIcon>
                                        <ListItemText primary="NFT exclusif niveau 3 avec avantages spéciaux" />
                                    </ListItem>
                                </List>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Box>

            <Box sx={{ mb: 8 }}>
                <Typography variant="h4" align="center" gutterBottom>
                    Nos Ambassadeurs Vedettes
                </Typography>
                <Typography variant="body1" align="center" color="textSecondary" paragraph sx={{ mb: 4 }}>
                    Découvrez quelques-uns de nos ambassadeurs les plus actifs
                </Typography>

                <Grid container spacing={4}>
                    {[1, 2, 3, 4].map((item) => (
                        <Grid item xs={12} sm={6} md={3} key={item}>
                            <StyledCard>
                                <CardContent sx={{ textAlign: 'center' }}>
                                    <StyledAvatar>
                                        {`A${item}`}
                                    </StyledAvatar>
                                    <Typography variant="h6" gutterBottom>
                                        {item === 1 && "Maria S."}
                                        {item === 2 && "Alex T."}
                                        {item === 3 && "Sophia L."}
                                        {item === 4 && "David K."}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary" gutterBottom>
                                        {item === 1 && "Espagne • Niveau 3"}
                                        {item === 2 && "Canada • Niveau 3"}
                                        {item === 3 && "Singapour • Niveau 2"}
                                        {item === 4 && "Allemagne • Niveau 2"}
                                    </Typography>
                                    <Box sx={{ mb: 2 }}>
                                        {item === 1 && <Chip size="small" label="Éducation" sx={{ mr: 0.5, mb: 0.5 }} />}
                                        {item === 1 && <Chip size="small" label="Communauté" sx={{ mr: 0.5, mb: 0.5 }} />}

                                        {item === 2 && <Chip size="small" label="Développement" sx={{ mr: 0.5, mb: 0.5 }} />}
                                        {item === 2 && <Chip size="small" label="Contenu" sx={{ mr: 0.5, mb: 0.5 }} />}

                                        {item === 3 && <Chip size="small" label="Marketing" sx={{ mr: 0.5, mb: 0.5 }} />}
                                        {item === 3 && <Chip size="small" label="Événements" sx={{ mr: 0.5, mb: 0.5 }} />}

                                        {item === 4 && <Chip size="small" label="Traduction" sx={{ mr: 0.5, mb: 0.5 }} />}
                                        {item === 4 && <Chip size="small" label="Support" sx={{ mr: 0.5, mb: 0.5 }} />}
                                    </Box>
                                    <Typography variant="body2">
                                        {item === 1 && "A créé plus de 30 tutoriels et organisé 5 webinaires éducatifs."}
                                        {item === 2 && "Développeur de 12 templates personnalisés et contributeur technique actif."}
                                        {item === 3 && "A organisé 8 événements locaux et gère plusieurs communautés en Asie."}
                                        {item === 4 && "Traducteur principal pour l'allemand et modérateur communautaire."}
                                    </Typography>
                                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 1 }}>
                                        <Twitter fontSize="small" color="primary" />
                                        <LinkedIn fontSize="small" color="primary" />
                                        {(item === 2 || item === 4) && <GitHub fontSize="small" color="primary" />}
                                    </Box>
                                </CardContent>
                            </StyledCard>
                        </Grid>
                    ))}
                </Grid>
            </Box>

            <Box sx={{ mb: 8 }}>
                <Typography variant="h4" align="center" gutterBottom>
                    Processus de Candidature
                </Typography>
                <Typography variant="body1" align="center" color="textSecondary" paragraph sx={{ mb: 4 }}>
                    Suivez ces étapes pour rejoindre notre programme d'ambassadeurs
                </Typography>

                <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 4 }}>
                    <Step>
                        <StepLabel>Informations</StepLabel>
                    </Step>
                    <Step>
                        <StepLabel>Candidature</StepLabel>
                    </Step>
                    <Step>
                        <StepLabel>Entretien</StepLabel>
                    </Step>
                    <Step>
                        <StepLabel>Onboarding</StepLabel>
                    </Step>
                </Stepper>

                {activeStep === 0 && (
                    <Paper sx={{ p: 4 }}>
                        <Typography variant="h5" gutterBottom>
                            Conditions d'éligibilité
                        </Typography>
                        <Typography variant="body1" paragraph>
                            Pour devenir ambassadeur TokenForge, vous devez remplir les conditions suivantes:
                        </Typography>
                        <List>
                            <ListItem>
                                <ListItemIcon>
                                    <CheckCircle color="success" />
                                </ListItemIcon>
                                <ListItemText
                                    primary="Passion pour la blockchain et les crypto-monnaies"
                                    secondary="Une connaissance de base des technologies blockchain est nécessaire"
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon>
                                    <CheckCircle color="success" />
                                </ListItemIcon>
                                <ListItemText
                                    primary="Présence active sur les réseaux sociaux"
                                    secondary="Twitter, LinkedIn, Discord ou autres plateformes pertinentes"
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon>
                                    <CheckCircle color="success" />
                                </ListItemIcon>
                                <ListItemText
                                    primary="Excellentes compétences en communication"
                                    secondary="Capacité à expliquer des concepts techniques de manière claire et accessible"
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon>
                                    <CheckCircle color="success" />
                                </ListItemIcon>
                                <ListItemText
                                    primary="Engagement minimum de 5-10 heures par mois"
                                    secondary="Pour accomplir des missions et participer aux activités communautaires"
                                />
                            </ListItem>
                        </List>
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleNext}
                            >
                                Continuer
                            </Button>
                        </Box>
                    </Paper>
                )}

                {activeStep === 1 && (
                    <Paper sx={{ p: 4 }}>
                        <Typography variant="h5" gutterBottom>
                            Formulaire de candidature
                        </Typography>
                        <Typography variant="body1" paragraph>
                            Veuillez remplir tous les champs ci-dessous pour soumettre votre candidature.
                        </Typography>

                        <Grid container spacing={3}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Nom complet"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleFormChange}
                                    required
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Email"
                                    name="email"
                                    type="email"
                                    value={formData.email}
                                    onChange={handleFormChange}
                                    required
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth variant="outlined">
                                    <InputLabel>Pays</InputLabel>
                                    <Select
                                        name="country"
                                        value={formData.country}
                                        onChange={handleSelectChange}
                                        label="Pays"
                                    >
                                        <MenuItem value="france">France</MenuItem>
                                        <MenuItem value="canada">Canada</MenuItem>
                                        <MenuItem value="usa">États-Unis</MenuItem>
                                        <MenuItem value="uk">Royaume-Uni</MenuItem>
                                        <MenuItem value="germany">Allemagne</MenuItem>
                                        <MenuItem value="spain">Espagne</MenuItem>
                                        <MenuItem value="other">Autre</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth variant="outlined">
                                    <InputLabel>Expérience en blockchain</InputLabel>
                                    <Select
                                        name="experience"
                                        value={formData.experience}
                                        onChange={handleSelectChange}
                                        label="Expérience en blockchain"
                                    >
                                        <MenuItem value="beginner">Débutant (&lt; 1 an)</MenuItem>
                                        <MenuItem value="intermediate">Intermédiaire (1-3 ans)</MenuItem>
                                        <MenuItem value="advanced">Avancé (3-5 ans)</MenuItem>
                                        <MenuItem value="expert">Expert (5+ ans)</MenuItem>
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Profils de réseaux sociaux (Twitter, LinkedIn, Discord, etc.)"
                                    name="socialMedia"
                                    value={formData.socialMedia}
                                    onChange={handleFormChange}
                                    multiline
                                    rows={2}
                                    variant="outlined"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Pourquoi souhaitez-vous devenir ambassadeur TokenForge?"
                                    name="motivation"
                                    value={formData.motivation}
                                    onChange={handleFormChange}
                                    multiline
                                    rows={4}
                                    variant="outlined"
                                    required
                                />
                            </Grid>
                        </Grid>

                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                            <Button onClick={handleBack}>
                                Retour
                            </Button>
                            <Button
                                variant="contained"
                                color="primary"
                                onClick={handleNext}
                            >
                                Soumettre
                            </Button>
                        </Box>
                    </Paper>
                )}

                {activeStep === 2 && (
                    <Paper sx={{ p: 4, textAlign: 'center' }}>
                        <CheckCircle color="success" sx={{ fontSize: 60, mb: 2 }} />



                        <Typography variant='h5' gutterBottom>
                            Candidature soumise avec succ�s!
                        </Typography>
                        <Typography variant='body1' paragraph>
                            Merci pour votre int�r�t envers le programme d'ambassadeurs TokenForge. Nous examinerons votre
                            candidature et vous contacterons dans les 5 jours ouvrables pour un entretien.
                        </Typography>
                        <Typography variant='body1' paragraph>
                            En attendant, n'h�sitez pas � rejoindre notre Discord communautaire pour commencer � vous impliquer dans l'�cosyst�me TokenForge.
                        </Typography>
                        <Button
                            variant='outlined'
                            color='primary'
                            href='https://discord.gg/tokenforge'
                            target='_blank'
                            rel='noopener noreferrer'
                            sx={{ mt: 2 }}
                        >
                            Rejoindre notre Discord
                        </Button>
                    </Paper>
                )}

                {activeStep === 3 && (
                    <Paper sx={{ p: 4, textAlign: 'center' }}>
                        <Typography variant='h5' gutterBottom>
                            Onboarding des Ambassadeurs
                        </Typography>
                        <Typography variant='body1' paragraph>
                            Une fois votre candidature accept�e, vous suivrez un processus d'onboarding complet:
                        </Typography>
                        <List>
                            <ListItem>
                                <ListItemIcon>
                                    <CheckCircle color='success' />
                                </ListItemIcon>
                                <ListItemText
                                    primary="Session d'orientation"
                                    secondary='Pr�sentation d�taill�e du programme et de vos responsabilit�s'
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon>
                                    <CheckCircle color='success' />
                                </ListItemIcon>
                                <ListItemText
                                    primary='Formation initiale'
                                    secondary='Apprentissage des fonctionnalit�s de TokenForge et des meilleures pratiques'
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon>
                                    <CheckCircle color='success' />
                                </ListItemIcon>
                                <ListItemText
                                    primary="Attribution d'un mentor"
                                    secondary='Un ambassadeur exp�riment� vous guidera pendant vos premiers mois'
                                />
                            </ListItem>
                            <ListItem>
                                <ListItemIcon>
                                    <CheckCircle color='success' />
                                </ListItemIcon>
                                <ListItemText
                                    primary='Premi�res missions'
                                    secondary='Des missions adapt�es � votre profil pour commencer � gagner des points'
                                />
                            </ListItem>
                        </List>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                            <Button onClick={handleBack}>
                                Retour
                            </Button>
                            <Button
                                variant='contained'
                                color='primary'
                                onClick={() => setActiveStep(0)}
                            >
                                Terminer
                            </Button>
                        </Box>
                    </Paper>
                )}
            </Box>

            <Box sx={{ mb: 8 }}>
                <Typography variant='h4' align='center' gutterBottom>
                    Questions Fr�quentes
                </Typography>
                <Typography variant='body1' align='center' color='textSecondary' paragraph sx={{ mb: 4 }}>
                    Tout ce que vous devez savoir sur notre programme d'ambassadeurs
                </Typography>

                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography variant='subtitle1'>Combien de temps dure le programme d'ambassadeurs?</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography variant='body2'>
                            Le programme d'ambassadeurs TokenForge est un engagement continu sans dur�e fixe. Vous pouvez rester ambassadeur aussi longtemps que vous �tes actif et que vous respectez les conditions du programme. Nous effectuons une �valuation trimestrielle pour nous assurer que tous les ambassadeurs sont engag�s et contribuent r�guli�rement.
                        </Typography>
                    </AccordionDetails>
                </Accordion>

                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography variant='subtitle1'>Quelles sont les comp�tences les plus recherch�es?</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography variant='body2'>
                            Nous recherchons des ambassadeurs avec diverses comp�tences, notamment: communication, r�daction, marketing digital, organisation d'�v�nements, d�veloppement, design, traduction, et connaissance technique de la blockchain. Cependant, la passion et l'engagement sont les qualit�s les plus importantes. M�me si vous d�butez, vous pouvez apporter une contribution pr�cieuse.
                        </Typography>
                    </AccordionDetails>
                </Accordion>

                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography variant='subtitle1'>Comment les r�compenses sont-elles distribu�es?</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography variant='body2'>
                            Les r�compenses sont distribu�es mensuellement en fonction des points accumul�s et des missions accomplies. Elles peuvent prendre diff�rentes formes: tokens TKN, NFTs exclusifs, r�ductions sur les services TokenForge, invitations � des �v�nements VIP, ou m�me des r�compenses financi�res pour les contributions exceptionnelles. Les ambassadeurs de niveau 3 peuvent �galement b�n�ficier d'un partage des revenus sur certaines activit�s.
                        </Typography>
                    </AccordionDetails>
                </Accordion>

                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography variant='subtitle1'>Puis-je �tre ambassadeur si je travaille d�j� pour un autre projet blockchain?</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography variant='body2'>
                            Oui, vous pouvez �tre ambassadeur TokenForge tout en travaillant avec d'autres projets, � condition qu'il n'y ait pas de conflit d'int�r�t direct. Nous vous demanderons de divulguer vos affiliations lors de votre candidature. Dans certains cas, nous pouvons m�me �tablir des partenariats avec d'autres projets compl�mentaires pour cr�er des synergies.
                        </Typography>
                    </AccordionDetails>
                </Accordion>

                <Accordion>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                        <Typography variant='subtitle1'>Comment puis-je progresser rapidement dans le programme?</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Typography variant='body2'>
                            Pour progresser rapidement, concentrez-vous sur des contributions de qualit� plut�t que sur la quantit�. Identifiez vos forces et choisissez des missions qui correspondent � vos comp�tences. La r�gularit� est �galement importante: des contributions constantes, m�me petites, sont plus valoris�es que des efforts sporadiques. N'h�sitez pas � proposer vos propres initiatives - l'innovation est fortement r�compens�e dans notre programme.
                        </Typography>
                    </AccordionDetails>
                </Accordion>
            </Box>
        </Container>
    );
};

export default AmbassadorProgramPage;
