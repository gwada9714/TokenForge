import React, { useState } from "react";
import {
  Container,
  Typography,
  Grid,
  Box,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Button,
  TextField,
  InputAdornment,
  Tabs,
  Tab,
  Divider,
  Chip,
  Avatar,
  Rating,
  List,
  ListItem,
  ListItemText,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  Search,
  LocationOn,
  Schedule,
  Verified,
  Message,
  CalendarToday,
  Close,
  Share,
  LinkedIn,
  Twitter,
  GitHub,
  Language as LanguageIcon,
  AccessTime,
  AttachMoney,
  Favorite,
  FavoriteBorder,
} from "@mui/icons-material";

const StyledCard = styled(Card)(() => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.1)",
  },
}));

const ExpertBadge = styled(Chip)(() => ({
  position: "absolute",
  top: 16,
  right: 16,
  zIndex: 1,
}));

const StyledRating = styled(Rating)({
  "& .MuiRating-iconFilled": {
    color: "#FFD700",
  },
});

export const ExpertNetworkPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [searchValue, setSearchValue] = useState("");
  const [filterValue, setFilterValue] = useState("all");
  const [sortValue, setSortValue] = useState("rating");
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState<number | null>(null);
  const [favoriteExperts, setFavoriteExperts] = useState<number[]>([]);

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

  const handleOpenDialog = (expertId: number) => {
    setSelectedExpert(expertId);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleToggleFavorite = (expertId: number) => {
    if (favoriteExperts.includes(expertId)) {
      setFavoriteExperts(favoriteExperts.filter((id) => id !== expertId));
    } else {
      setFavoriteExperts([...favoriteExperts, expertId]);
    }
  };

  // Données simulées pour les experts
  const experts = [
    {
      id: 1,
      name: "Dr. Sarah Chen",
      role: "Économiste Blockchain",
      avatar: "/images/expert-1.jpg",
      specialties: ["Tokenomics", "Économie", "DeFi"],
      rating: 4.9,
      reviews: 87,
      hourlyRate: "150€",
      location: "Singapour",
      languages: ["Anglais", "Mandarin", "Français"],
      availability: "Disponible cette semaine",
      verified: true,
      description:
        "Économiste spécialisée en tokenomics avec plus de 8 ans d'expérience dans la conception de modèles économiques pour des projets blockchain. Anciennement chez Binance et ConsenSys.",
      projects: 34,
      completionRate: 98,
    },
    {
      id: 2,
      name: "Alex Moreau",
      role: "Expert en Sécurité Blockchain",
      avatar: "/images/expert-2.jpg",
      specialties: ["Sécurité", "Smart Contracts", "Audit"],
      rating: 4.8,
      reviews: 62,
      hourlyRate: "180€",
      location: "Paris, France",
      languages: ["Français", "Anglais"],
      availability: "Disponible dans 3 jours",
      verified: true,
      description:
        "Spécialiste en sécurité blockchain avec une expertise particulière dans l'audit de smart contracts et la prévention des vulnérabilités. A travaillé sur plus de 50 audits de sécurité pour des projets majeurs.",
      projects: 53,
      completionRate: 100,
    },
    {
      id: 3,
      name: "Maria Rodriguez",
      role: "Développeuse Solidity Senior",
      avatar: "/images/expert-3.jpg",
      specialties: ["Solidity", "ERC-20", "DeFi"],
      rating: 4.7,
      reviews: 41,
      hourlyRate: "160€",
      location: "Madrid, Espagne",
      languages: ["Espagnol", "Anglais"],
      availability: "Disponible maintenant",
      verified: true,
      description:
        "Développeuse Solidity avec 5 ans d'expérience dans la création de tokens et protocoles DeFi. Contributrice active à plusieurs projets open-source et créatrice de bibliothèques Solidity populaires.",
      projects: 29,
      completionRate: 97,
    },
    {
      id: 4,
      name: "Thomas Weber",
      role: "Architecte Multi-chain",
      avatar: "/images/expert-4.jpg",
      specialties: ["Multi-chain", "Interopérabilité", "Bridges"],
      rating: 4.9,
      reviews: 38,
      hourlyRate: "200€",
      location: "Berlin, Allemagne",
      languages: ["Allemand", "Anglais"],
      availability: "Disponible la semaine prochaine",
      verified: true,
      description:
        "Expert en solutions multi-chain et interopérabilité blockchain. Spécialisé dans la conception et l'implémentation de bridges cross-chain et la synchronisation de données entre différentes blockchains.",
      projects: 22,
      completionRate: 95,
    },
    {
      id: 5,
      name: "Sophie Martin",
      role: "Consultante Marketing Crypto",
      avatar: "/images/expert-5.jpg",
      specialties: ["Marketing", "Communauté", "Lancement"],
      rating: 4.6,
      reviews: 53,
      hourlyRate: "130€",
      location: "Montréal, Canada",
      languages: ["Français", "Anglais"],
      availability: "Disponible maintenant",
      verified: true,
      description:
        "Spécialiste en marketing et stratégie de lancement pour projets crypto. A accompagné plus de 30 projets dans leur stratégie de go-to-market, construction communautaire et relations avec les investisseurs.",
      projects: 31,
      completionRate: 94,
    },
    {
      id: 6,
      name: "James Wilson",
      role: "Expert Juridique Crypto",
      avatar: "/images/expert-6.jpg",
      specialties: ["Réglementation", "Compliance", "KYC/AML"],
      rating: 4.8,
      reviews: 29,
      hourlyRate: "220€",
      location: "Londres, Royaume-Uni",
      languages: ["Anglais"],
      availability: "Disponible dans 5 jours",
      verified: true,
      description:
        "Avocat spécialisé dans la réglementation des crypto-actifs et la conformité. Conseille les projets sur les aspects juridiques du lancement de tokens et les exigences réglementaires dans différentes juridictions.",
      projects: 45,
      completionRate: 99,
    },
  ];

  // Données simulées pour les réservations récentes
  const recentBookings = [
    {
      id: 101,
      expertName: "Dr. Sarah Chen",
      expertAvatar: "/images/expert-1.jpg",
      date: "10 Mars 2025",
      time: "14:00 - 15:30",
      topic: "Consultation tokenomics",
      status: "Confirmé",
    },
    {
      id: 102,
      expertName: "Alex Moreau",
      expertAvatar: "/images/expert-2.jpg",
      date: "15 Mars 2025",
      time: "10:00 - 12:00",
      topic: "Audit de sécurité préliminaire",
      status: "En attente",
    },
  ];

  // Données simulées pour les témoignages
  const testimonials = [
    {
      id: 201,
      clientName: "Jean Dupont",
      clientAvatar: "/images/client-1.jpg",
      expertName: "Dr. Sarah Chen",
      rating: 5,
      comment:
        "Dr. Chen a complètement transformé notre approche de tokenomics. Ses conseils nous ont permis d'éviter plusieurs pièges courants et d'optimiser notre modèle économique. Un investissement qui a largement porté ses fruits!",
      date: "Février 2025",
    },
    {
      id: 202,
      clientName: "Laura Schmidt",
      clientAvatar: "/images/client-2.jpg",
      expertName: "Alex Moreau",
      rating: 5,
      comment:
        "L'audit de sécurité réalisé par Alex a été extrêmement approfondi. Il a identifié plusieurs vulnérabilités que nous n'avions pas détectées et nous a fourni des solutions claires. Très professionnel et réactif.",
      date: "Janvier 2025",
    },
    {
      id: 203,
      clientName: "Michael Wong",
      clientAvatar: "/images/client-3.jpg",
      expertName: "Maria Rodriguez",
      rating: 4,
      comment:
        "Maria a développé notre token en un temps record tout en maintenant une qualité exceptionnelle. Son expertise en Solidity est impressionnante et elle a su adapter le code à nos besoins spécifiques.",
      date: "Décembre 2024",
    },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <Typography
        variant="h3"
        component="h1"
        gutterBottom
        align="center"
        fontWeight="bold"
      >
        Réseau d'Experts TokenForge
      </Typography>
      <Typography
        variant="h6"
        align="center"
        color="textSecondary"
        paragraph
        sx={{ mb: 6 }}
      >
        Connectez-vous avec des experts certifiés pour vous accompagner dans
        votre projet blockchain
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab label="Trouver un expert" />
          <Tab label="Mes réservations" />
          <Tab label="Témoignages" />
        </Tabs>
      </Box>

      {tabValue === 0 && (
        <>
          <Box
            sx={{
              mb: 4,
              display: "flex",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <TextField
              placeholder="Rechercher un expert..."
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
              sx={{ flexGrow: 1, maxWidth: { xs: "100%", sm: 300 } }}
            />

            <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Spécialité</InputLabel>
              <Select
                value={filterValue}
                onChange={handleFilterChange}
                label="Spécialité"
              >
                <MenuItem value="all">Toutes</MenuItem>
                <MenuItem value="tokenomics">Tokenomics</MenuItem>
                <MenuItem value="security">Sécurité</MenuItem>
                <MenuItem value="development">Développement</MenuItem>
                <MenuItem value="marketing">Marketing</MenuItem>
                <MenuItem value="legal">Juridique</MenuItem>
                <MenuItem value="multichain">Multi-chain</MenuItem>
              </Select>
            </FormControl>

            <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Trier par</InputLabel>
              <Select
                value={sortValue}
                onChange={handleSortChange}
                label="Trier par"
              >
                <MenuItem value="rating">Note (plus élevée)</MenuItem>
                <MenuItem value="price-asc">Prix (croissant)</MenuItem>
                <MenuItem value="price-desc">Prix (décroissant)</MenuItem>
                <MenuItem value="availability">Disponibilité</MenuItem>
                <MenuItem value="experience">Expérience</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Box sx={{ mb: 2, display: "flex", flexWrap: "wrap", gap: 1 }}>
            <Chip label="Tokenomics" onClick={() => {}} />
            <Chip label="Smart Contracts" onClick={() => {}} />
            <Chip label="Audit de sécurité" onClick={() => {}} />
            <Chip label="Multi-chain" onClick={() => {}} />
            <Chip label="Marketing" onClick={() => {}} />
            <Chip label="Juridique" onClick={() => {}} />
            <Chip label="DeFi" onClick={() => {}} />
          </Box>

          <Grid container spacing={4} sx={{ mb: 6 }}>
            {experts.map((expert) => (
              <Grid item xs={12} sm={6} md={4} key={expert.id}>
                <StyledCard>
                  <Box sx={{ position: "relative" }}>
                    <CardMedia
                      component="img"
                      height="200"
                      image={expert.avatar}
                      alt={expert.name}
                    />
                    {expert.verified && (
                      <ExpertBadge
                        icon={<Verified />}
                        label="Vérifié"
                        color="primary"
                      />
                    )}
                  </Box>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                      }}
                    >
                      <Typography variant="h6" component="h2" gutterBottom>
                        {expert.name}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={() => handleToggleFavorite(expert.id)}
                        color={
                          favoriteExperts.includes(expert.id)
                            ? "primary"
                            : "default"
                        }
                      >
                        {favoriteExperts.includes(expert.id) ? (
                          <Favorite fontSize="small" />
                        ) : (
                          <FavoriteBorder fontSize="small" />
                        )}
                      </IconButton>
                    </Box>
                    <Typography
                      variant="subtitle2"
                      color="primary"
                      gutterBottom
                    >
                      {expert.role}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <StyledRating
                        value={expert.rating}
                        precision={0.1}
                        readOnly
                        size="small"
                      />
                      <Typography variant="body2" sx={{ ml: 1 }}>
                        ({expert.reviews} avis)
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <AttachMoney
                        fontSize="small"
                        color="action"
                        sx={{ mr: 0.5 }}
                      />
                      <Typography variant="body2">
                        {expert.hourlyRate} / heure
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <LocationOn
                        fontSize="small"
                        color="action"
                        sx={{ mr: 0.5 }}
                      />
                      <Typography variant="body2">{expert.location}</Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <AccessTime
                        fontSize="small"
                        color="action"
                        sx={{ mr: 0.5 }}
                      />
                      <Typography
                        variant="body2"
                        color={
                          expert.availability.includes("maintenant")
                            ? "success.main"
                            : "text.secondary"
                        }
                      >
                        {expert.availability}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      {expert.specialties.map((specialty) => (
                        <Chip
                          key={specialty}
                          label={specialty}
                          size="small"
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      ))}
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button
                      size="small"
                      color="primary"
                      onClick={() => handleOpenDialog(expert.id)}
                    >
                      Voir profil
                    </Button>
                    <Button size="small" variant="contained" color="primary">
                      Réserver
                    </Button>
                    <IconButton size="small" sx={{ ml: "auto" }}>
                      <Share fontSize="small" />
                    </IconButton>
                  </CardActions>
                </StyledCard>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ textAlign: "center" }}>
            <Button variant="outlined" color="primary" size="large">
              Voir plus d'experts
            </Button>
          </Box>
        </>
      )}

      {tabValue === 1 && (
        <Box>
          <Typography variant="h5" gutterBottom>
            Mes réservations
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            Gérez vos consultations passées et à venir avec nos experts
          </Typography>

          <Tabs value={0} sx={{ mb: 3 }}>
            <Tab label="À venir" />
            <Tab label="Passées" />
            <Tab label="Toutes" />
          </Tabs>

          {recentBookings.length > 0 ? (
            <Grid container spacing={3}>
              {recentBookings.map((booking) => (
                <Grid item xs={12} sm={6} key={booking.id}>
                  <Paper
                    sx={{
                      p: 3,
                      borderLeft: 4,
                      borderColor:
                        booking.status === "Confirmé"
                          ? "success.main"
                          : "warning.main",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                      <Avatar
                        src={booking.expertAvatar}
                        sx={{ width: 60, height: 60, mr: 2 }}
                      />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" gutterBottom>
                          {booking.topic}
                        </Typography>
                        <Typography variant="subtitle1">
                          avec {booking.expertName}
                        </Typography>
                        <Box
                          sx={{ display: "flex", alignItems: "center", mt: 1 }}
                        >
                          <CalendarToday
                            fontSize="small"
                            color="action"
                            sx={{ mr: 0.5 }}
                          />
                          <Typography variant="body2" sx={{ mr: 2 }}>
                            {booking.date}
                          </Typography>
                          <Schedule
                            fontSize="small"
                            color="action"
                            sx={{ mr: 0.5 }}
                          />
                          <Typography variant="body2">
                            {booking.time}
                          </Typography>
                        </Box>
                        <Chip
                          label={booking.status}
                          size="small"
                          color={
                            booking.status === "Confirmé"
                              ? "success"
                              : "warning"
                          }
                          sx={{ mt: 1 }}
                        />
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        mt: 2,
                      }}
                    >
                      <Button size="small" sx={{ mr: 1 }}>
                        Détails
                      </Button>
                      {booking.status === "Confirmé" && (
                        <Button
                          size="small"
                          variant="outlined"
                          color="primary"
                          startIcon={<Message />}
                        >
                          Message
                        </Button>
                      )}
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Paper sx={{ p: 4, textAlign: "center" }}>
              <Typography variant="h6" gutterBottom>
                Aucune réservation pour le moment
              </Typography>
              <Typography variant="body2" color="textSecondary" paragraph>
                Vous n'avez pas encore réservé de consultation avec nos experts
              </Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={() => setTabValue(0)}
              >
                Trouver un expert
              </Button>
            </Paper>
          )}

          <Box sx={{ mt: 4 }}>
            <Typography variant="h5" gutterBottom>
              Consultations recommandées
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              Basées sur votre profil et vos projets
            </Typography>

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Audit de sécurité initial
                    </Typography>
                    <Typography variant="body2" paragraph>
                      Évaluation préliminaire de la sécurité de votre smart
                      contract avant déploiement
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <AccessTime
                        fontSize="small"
                        color="action"
                        sx={{ mr: 0.5 }}
                      />
                      <Typography variant="body2">2 heures</Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <AttachMoney
                        fontSize="small"
                        color="action"
                        sx={{ mr: 0.5 }}
                      />
                      <Typography variant="body2">À partir de 300€</Typography>
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button size="small" color="primary">
                      En savoir plus
                    </Button>
                    <Button size="small" variant="contained" color="primary">
                      Réserver
                    </Button>
                  </CardActions>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Consultation tokenomics
                    </Typography>
                    <Typography variant="body2" paragraph>
                      Analyse et optimisation de votre modèle économique pour
                      assurer la viabilité à long terme
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <AccessTime
                        fontSize="small"
                        color="action"
                        sx={{ mr: 0.5 }}
                      />
                      <Typography variant="body2">1.5 heures</Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <AttachMoney
                        fontSize="small"
                        color="action"
                        sx={{ mr: 0.5 }}
                      />
                      <Typography variant="body2">À partir de 225€</Typography>
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button size="small" color="primary">
                      En savoir plus
                    </Button>
                    <Button size="small" variant="contained" color="primary">
                      Réserver
                    </Button>
                  </CardActions>
                </Card>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Stratégie de lancement
                    </Typography>
                    <Typography variant="body2" paragraph>
                      Planification complète du lancement de votre token pour
                      maximiser l'impact et l'adoption
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <AccessTime
                        fontSize="small"
                        color="action"
                        sx={{ mr: 0.5 }}
                      />
                      <Typography variant="body2">3 heures</Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <AttachMoney
                        fontSize="small"
                        color="action"
                        sx={{ mr: 0.5 }}
                      />
                      <Typography variant="body2">À partir de 390€</Typography>
                    </Box>
                  </CardContent>
                  <CardActions>
                    <Button size="small" color="primary">
                      En savoir plus
                    </Button>
                    <Button size="small" variant="contained" color="primary">
                      Réserver
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            </Grid>
          </Box>
        </Box>
      )}

      {tabValue === 2 && (
        <Box>
          <Typography variant="h5" gutterBottom>
            Témoignages clients
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            Découvrez ce que nos clients disent de nos experts
          </Typography>

          <Grid container spacing={4}>
            {testimonials.map((testimonial) => (
              <Grid item xs={12} key={testimonial.id}>
                <Paper sx={{ p: 3 }}>
                  <Box sx={{ display: "flex", alignItems: "flex-start" }}>
                    <Avatar
                      src={testimonial.clientAvatar}
                      sx={{ width: 60, height: 60, mr: 2 }}
                    />
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" gutterBottom>
                        {testimonial.clientName}
                      </Typography>
                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 1 }}
                      >
                        <Typography
                          variant="body2"
                          color="textSecondary"
                          sx={{ mr: 1 }}
                        >
                          À propos de {testimonial.expertName}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          • {testimonial.date}
                        </Typography>
                      </Box>
                      <StyledRating
                        value={testimonial.rating}
                        readOnly
                        size="small"
                        sx={{ mb: 1 }}
                      />
                      <Typography variant="body1">
                        "{testimonial.comment}"
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ textAlign: "center", mt: 4 }}>
            <Button variant="outlined" color="primary" size="large">
              Voir plus de témoignages
            </Button>
          </Box>
        </Box>
      )}

      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
      >
        {selectedExpert && (
          <>
            <DialogTitle>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Typography variant="h6">Profil Expert</Typography>
                <IconButton onClick={handleCloseDialog} size="small">
                  <Close />
                </IconButton>
              </Box>
            </DialogTitle>
            <DialogContent dividers>
              <Grid container spacing={3}>
                <Grid item xs={12} md={4}>
                  <Box sx={{ position: "relative" }}>
                    <CardMedia
                      component="img"
                      image={
                        experts.find((e) => e.id === selectedExpert)?.avatar
                      }
                      alt={experts.find((e) => e.id === selectedExpert)?.name}
                      sx={{ borderRadius: 1, mb: 2 }}
                    />
                    {experts.find((e) => e.id === selectedExpert)?.verified && (
                      <Chip
                        icon={<Verified />}
                        label="Expert vérifié"
                        color="primary"
                        size="small"
                        sx={{ position: "absolute", top: 10, right: 10 }}
                      />
                    )}
                  </Box>
                  <Typography variant="h6" gutterBottom>
                    {experts.find((e) => e.id === selectedExpert)?.name}
                  </Typography>
                  <Typography variant="subtitle1" color="primary" gutterBottom>
                    {experts.find((e) => e.id === selectedExpert)?.role}
                  </Typography>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <StyledRating
                      value={
                        experts.find((e) => e.id === selectedExpert)?.rating
                      }
                      precision={0.1}
                      readOnly
                      size="small"
                    />
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      ({experts.find((e) => e.id === selectedExpert)?.reviews}{" "}
                      avis)
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <AttachMoney
                      fontSize="small"
                      color="action"
                      sx={{ mr: 0.5 }}
                    />
                    <Typography variant="body2">
                      {experts.find((e) => e.id === selectedExpert)?.hourlyRate}{" "}
                      / heure
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <LocationOn
                      fontSize="small"
                      color="action"
                      sx={{ mr: 0.5 }}
                    />
                    <Typography variant="body2">
                      {experts.find((e) => e.id === selectedExpert)?.location}
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                    <AccessTime
                      fontSize="small"
                      color="action"
                      sx={{ mr: 0.5 }}
                    />
                    <Typography
                      variant="body2"
                      color={
                        experts
                          .find((e) => e.id === selectedExpert)
                          ?.availability.includes("maintenant")
                          ? "success.main"
                          : "text.secondary"
                      }
                    >
                      {
                        experts.find((e) => e.id === selectedExpert)
                          ?.availability
                      }
                    </Typography>
                  </Box>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle2" gutterBottom>
                    Langues
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    {experts
                      .find((e) => e.id === selectedExpert)
                      ?.languages.map((language) => (
                        <Chip
                          key={language}
                          label={language}
                          size="small"
                          icon={<LanguageIcon fontSize="small" />}
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      ))}
                  </Box>
                  <Typography variant="subtitle2" gutterBottom>
                    Spécialités
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    {experts
                      .find((e) => e.id === selectedExpert)
                      ?.specialties.map((specialty) => (
                        <Chip
                          key={specialty}
                          label={specialty}
                          size="small"
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      ))}
                  </Box>
                  <Box sx={{ display: "flex", gap: 1, mt: 2 }}>
                    <IconButton size="small" color="primary">
                      <LinkedIn />
                    </IconButton>
                    <IconButton size="small" color="primary">
                      <Twitter />
                    </IconButton>
                    <IconButton size="small" color="primary">
                      <GitHub />
                    </IconButton>
                  </Box>
                </Grid>
                <Grid item xs={12} md={8}>
                  <Typography variant="h6" gutterBottom>
                    À propos
                  </Typography>
                  <Typography variant="body1" paragraph>
                    {experts.find((e) => e.id === selectedExpert)?.description}
                  </Typography>
                  <Divider sx={{ my: 2 }} />
                  <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid item xs={6} sm={3}>
                      <Paper sx={{ p: 2, textAlign: "center" }}>
                        <Typography variant="h4" color="primary">
                          {
                            experts.find((e) => e.id === selectedExpert)
                              ?.projects
                          }
                        </Typography>
                        <Typography variant="body2">Projets</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Paper sx={{ p: 2, textAlign: "center" }}>
                        <Typography variant="h4" color="primary">
                          {
                            experts.find((e) => e.id === selectedExpert)
                              ?.completionRate
                          }
                          %
                        </Typography>
                        <Typography variant="body2">Complétion</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Paper sx={{ p: 2, textAlign: "center" }}>
                        <Typography variant="h4" color="primary">
                          {
                            experts.find((e) => e.id === selectedExpert)
                              ?.reviews
                          }
                        </Typography>
                        <Typography variant="body2">Avis</Typography>
                      </Paper>
                    </Grid>
                    <Grid item xs={6} sm={3}>
                      <Paper sx={{ p: 2, textAlign: "center" }}>
                        <Typography variant="h4" color="primary">
                          {experts.find((e) => e.id === selectedExpert)?.rating}
                        </Typography>
                        <Typography variant="body2">Note</Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                  <Typography variant="h6" gutterBottom>
                    Disponibilités
                  </Typography>
                  <Paper sx={{ p: 2, mb: 3 }}>
                    <Typography variant="body2" paragraph>
                      Sélectionnez une date et une heure pour réserver une
                      consultation avec cet expert.
                    </Typography>
                    <Box
                      sx={{ display: "flex", justifyContent: "center", mb: 2 }}
                    >
                      <Button variant="outlined" startIcon={<CalendarToday />}>
                        Voir le calendrier
                      </Button>
                    </Box>
                  </Paper>
                  <Typography variant="h6" gutterBottom>
                    Services proposés
                  </Typography>
                  <List>
                    <ListItem>
                      <ListItemText
                        primary="Consultation initiale (1 heure)"
                        secondary={`${
                          experts.find((e) => e.id === selectedExpert)
                            ?.hourlyRate
                        } • Évaluation de votre projet et recommandations`}
                      />
                      <Button variant="contained" color="primary" size="small">
                        Réserver
                      </Button>
                    </ListItem>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemText
                        primary="Audit approfondi (3-5 heures)"
                        secondary={`À partir de ${
                          parseInt(
                            experts.find((e) => e.id === selectedExpert)
                              ?.hourlyRate || "0"
                          ) * 3
                        }€ • Analyse détaillée et rapport complet`}
                      />
                      <Button variant="contained" color="primary" size="small">
                        Réserver
                      </Button>
                    </ListItem>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemText
                        primary="Accompagnement projet (10+ heures)"
                        secondary="Tarif personnalisé • Suivi complet de votre projet"
                      />
                      <Button variant="outlined" color="primary" size="small">
                        Demander
                      </Button>
                    </ListItem>
                  </List>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog} color="inherit">
                Fermer
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<Message />}
              >
                Contacter
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<CalendarToday />}
              >
                Réserver une consultation
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};
