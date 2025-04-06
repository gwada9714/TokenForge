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
  Tabs,
  Tab,
  Divider,
  Chip,
  TextField,
  FormControl,
  InputLabel,
  Select,
  SelectChangeEvent,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import {
  Event,
  EventAvailable,
  Videocam,
  CalendarToday,
  People,
  AccessTime,
  Language,
  Share,
  BookmarkBorder,
  Search,
  FilterList,
  Sort,
  ArrowDropDown,
  Add,
  PlayArrow,
  Download,
  School,
  Visibility,
} from "@mui/icons-material";

const StyledCard = styled(Card)(({ theme: _theme }) => ({
  height: "100%",
  display: "flex",
  flexDirection: "column",
  transition: "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
  "&:hover": {
    transform: "translateY(-5px)",
    boxShadow: _theme.shadows[10],
  },
}));

const EventBadge = styled(Chip)(({ theme: _theme }) => ({
  position: "absolute",
  top: 16,
  right: 16,
  zIndex: 1,
}));

export const WebinarsEventsPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<number | null>(null);
  const [filterValue, setFilterValue] = useState("all");
  const [sortValue, setSortValue] = useState("date");
  const [searchValue, setSearchValue] = useState("");

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleOpenDialog = (eventId: number) => {
    setSelectedEvent(eventId);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleFilterChange = (event: SelectChangeEvent) => {
    setFilterValue(event.target.value);
  };

  const handleSortChange = (event: SelectChangeEvent) => {
    setSortValue(event.target.value);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
  };

  // Données simulées pour les webinaires à venir
  const upcomingWebinars = [
    {
      id: 1,
      title: "Tokenomics avancés: Conception et optimisation",
      date: "15 Mars 2025",
      time: "18:00 UTC",
      duration: "90 min",
      speaker: "Dr. Sarah Chen",
      speakerRole: "Économiste blockchain, TokenForge",
      image: "/images/webinar-tokenomics.jpg",
      participants: 156,
      language: "Français",
      description:
        "Découvrez les principes avancés de tokenomics et apprenez à concevoir des modèles économiques durables pour vos projets blockchain. Ce webinaire couvrira les mécanismes d'incitation, les modèles de distribution et les stratégies anti-inflation.",
      tags: ["tokenomics", "économie", "avancé"],
    },
    {
      id: 2,
      title: "Sécurité des smart contracts: Meilleures pratiques",
      date: "22 Mars 2025",
      time: "16:00 UTC",
      duration: "120 min",
      speaker: "Alex Moreau",
      speakerRole: "Responsable sécurité, TokenForge",
      image: "/images/webinar-security.jpg",
      participants: 203,
      language: "Français",
      description:
        "Protégez vos tokens et vos utilisateurs contre les vulnérabilités courantes. Ce webinaire technique explorera les meilleures pratiques de sécurité pour les smart contracts, les audits de code et les mécanismes de protection anti-rugpull.",
      tags: ["sécurité", "smart contracts", "technique"],
    },
    {
      id: 3,
      title: "Marketing efficace pour les projets crypto",
      date: "29 Mars 2025",
      time: "17:00 UTC",
      duration: "60 min",
      speaker: "Marie Dubois",
      speakerRole: "Directrice marketing, TokenForge",
      image: "/images/webinar-marketing.jpg",
      participants: 178,
      language: "Français",
      description:
        "Apprenez à promouvoir efficacement votre token et à construire une communauté engagée. Ce webinaire couvrira les stratégies de marketing spécifiques à l'écosystème crypto, la gestion communautaire et les techniques de growth hacking.",
      tags: ["marketing", "communauté", "débutant"],
    },
    {
      id: 4,
      title: "Multi-chain: Déploiement et gestion cross-chain",
      date: "5 Avril 2025",
      time: "15:00 UTC",
      duration: "90 min",
      speaker: "Thomas Weber",
      speakerRole: "Ingénieur blockchain, TokenForge",
      image: "/images/webinar-multichain.jpg",
      participants: 124,
      language: "Français",
      description:
        "Explorez les avantages et défis du déploiement multi-chain. Ce webinaire technique vous guidera à travers le processus de déploiement de tokens sur plusieurs blockchains et la gestion efficace des actifs cross-chain.",
      tags: ["multi-chain", "technique", "intermédiaire"],
    },
  ];

  // Données simulées pour les événements à venir
  const upcomingEvents = [
    {
      id: 5,
      title: "TokenForge Summit 2025",
      date: "12-14 Avril 2025",
      location: "Paris, France",
      type: "Conférence",
      image: "/images/event-summit.jpg",
      participants: 500,
      description:
        "La plus grande conférence TokenForge de l'année. Rejoignez-nous pour trois jours de présentations, ateliers et networking avec les leaders de l'industrie blockchain. Découvrez en avant-première les nouvelles fonctionnalités de la plateforme.",
      tags: ["conférence", "networking", "présentiel"],
    },
    {
      id: 6,
      title: "Hackathon DeFi Innovation",
      date: "25-26 Avril 2025",
      location: "En ligne",
      type: "Hackathon",
      image: "/images/event-hackathon.jpg",
      participants: 350,
      description:
        "Participez à notre hackathon de 48 heures et développez des solutions DeFi innovantes avec TokenForge. Prix total de 50 000€ en tokens et opportunités de financement pour les meilleurs projets.",
      tags: ["hackathon", "defi", "développement"],
    },
    {
      id: 7,
      title: "Meetup TokenForge Montréal",
      date: "3 Mai 2025",
      location: "Montréal, Canada",
      type: "Meetup",
      image: "/images/event-meetup.jpg",
      participants: 120,
      description:
        "Rencontrez la communauté TokenForge de Montréal lors de cette soirée networking. Au programme: présentations de projets locaux, discussions sur les tendances blockchain et opportunités de collaboration.",
      tags: ["meetup", "networking", "présentiel"],
    },
  ];

  // Données simulées pour les webinaires passés
  const pastWebinars = [
    {
      id: 8,
      title: "Introduction à TokenForge",
      date: "15 Février 2025",
      duration: "60 min",
      speaker: "Jean Dupont",
      speakerRole: "CEO, TokenForge",
      image: "/images/webinar-intro.jpg",
      views: 1245,
      language: "Français",
      description:
        "Découvrez les fonctionnalités de base de TokenForge et apprenez à créer votre premier token en moins de 15 minutes. Ce webinaire d'introduction est parfait pour les débutants.",
      tags: ["introduction", "débutant"],
    },
    {
      id: 9,
      title: "Staking et récompenses: Configuration optimale",
      date: "1 Février 2025",
      duration: "75 min",
      speaker: "Sophie Martin",
      speakerRole: "Product Manager, TokenForge",
      image: "/images/webinar-staking.jpg",
      views: 876,
      language: "Français",
      description:
        "Apprenez à configurer des mécanismes de staking efficaces pour votre token. Ce webinaire couvre les différents modèles de récompenses, les périodes de lock et les stratégies d'incitation à long terme.",
      tags: ["staking", "récompenses", "intermédiaire"],
    },
    {
      id: 10,
      title: "Analyse de liquidité et gestion des pools",
      date: "15 Janvier 2025",
      duration: "90 min",
      speaker: "Marc Lefebvre",
      speakerRole: "DeFi Specialist, TokenForge",
      image: "/images/webinar-liquidity.jpg",
      views: 932,
      language: "Français",
      description:
        "Maîtrisez les concepts de liquidité et apprenez à gérer efficacement les pools de liquidité pour votre token. Ce webinaire technique explore les stratégies d'optimisation et les mécanismes auto-LP.",
      tags: ["liquidité", "defi", "avancé"],
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
        Webinaires & Événements
      </Typography>
      <Typography
        variant="h6"
        align="center"
        color="textSecondary"
        paragraph
        sx={{ mb: 6 }}
      >
        Restez informé et développez vos compétences avec nos webinaires et
        événements exclusifs
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab icon={<EventAvailable />} label="À venir" />
          <Tab icon={<Videocam />} label="Rediffusions" />
          <Tab icon={<CalendarToday />} label="Calendrier" />
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
              placeholder="Rechercher..."
              variant="outlined"
              size="small"
              value={searchValue}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: <Search color="action" sx={{ mr: 1 }} />,
              }}
              sx={{ flexGrow: 1, maxWidth: { xs: "100%", sm: 300 } }}
            />

            <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Filtrer par</InputLabel>
              <Select
                value={filterValue}
                onChange={handleFilterChange}
                label="Filtrer par"
                startAdornment={<FilterList fontSize="small" sx={{ mr: 1 }} />}
              >
                <MenuItem value="all">Tous</MenuItem>
                <MenuItem value="webinar">Webinaires</MenuItem>
                <MenuItem value="event">Événements</MenuItem>
                <MenuItem value="beginner">Niveau débutant</MenuItem>
                <MenuItem value="intermediate">Niveau intermédiaire</MenuItem>
                <MenuItem value="advanced">Niveau avancé</MenuItem>
              </Select>
            </FormControl>

            <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Trier par</InputLabel>
              <Select
                value={sortValue}
                onChange={handleSortChange}
                label="Trier par"
                startAdornment={<Sort fontSize="small" sx={{ mr: 1 }} />}
              >
                <MenuItem value="date">Date (plus proche)</MenuItem>
                <MenuItem value="date-desc">Date (plus éloignée)</MenuItem>
                <MenuItem value="popularity">Popularité</MenuItem>
                <MenuItem value="title">Titre (A-Z)</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Typography variant="h5" gutterBottom sx={{ mt: 6, mb: 3 }}>
            Prochains webinaires
          </Typography>

          <Grid container spacing={4} sx={{ mb: 6 }}>
            {upcomingWebinars.map((webinar) => (
              <Grid item xs={12} sm={6} md={3} key={webinar.id}>
                <StyledCard>
                  <Box sx={{ position: "relative" }}>
                    <CardMedia
                      component="img"
                      height="160"
                      image={webinar.image}
                      alt={webinar.title}
                    />
                    <EventBadge label="Webinaire" color="primary" />
                  </Box>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="h2" gutterBottom noWrap>
                      {webinar.title}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <CalendarToday
                        fontSize="small"
                        color="action"
                        sx={{ mr: 1 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {webinar.date} • {webinar.time}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <AccessTime
                        fontSize="small"
                        color="action"
                        sx={{ mr: 1 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {webinar.duration}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <People fontSize="small" color="action" sx={{ mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        {webinar.participants} inscrits
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Language
                        fontSize="small"
                        color="action"
                        sx={{ mr: 1 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {webinar.language}
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      {webinar.tags.map((tag) => (
                        <Chip
                          key={tag}
                          label={tag}
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
                      onClick={() => handleOpenDialog(webinar.id)}
                    >
                      Détails
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      color="primary"
                      startIcon={<EventAvailable />}
                    >
                      S'inscrire
                    </Button>
                    <IconButton size="small" sx={{ ml: "auto" }}>
                      <BookmarkBorder fontSize="small" />
                    </IconButton>
                  </CardActions>
                </StyledCard>
              </Grid>
            ))}
          </Grid>

          <Typography variant="h5" gutterBottom sx={{ mt: 6, mb: 3 }}>
            Événements à venir
          </Typography>

          <Grid container spacing={4}>
            {upcomingEvents.map((eventItem) => (
              <Grid item xs={12} sm={6} md={4} key={eventItem.id}>
                <StyledCard>
                  <Box sx={{ position: "relative" }}>
                    <CardMedia
                      component="img"
                      height="180"
                      image={eventItem.image}
                      alt={eventItem.title}
                    />
                    <EventBadge label={eventItem.type} color="secondary" />
                  </Box>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" component="h2" gutterBottom>
                      {eventItem.title}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <CalendarToday
                        fontSize="small"
                        color="action"
                        sx={{ mr: 1 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {eventItem.date}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <Event fontSize="small" color="action" sx={{ mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        {eventItem.location}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <People fontSize="small" color="action" sx={{ mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        {eventItem.participants} participants attendus
                      </Typography>
                    </Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mb: 2 }}
                    >
                      {eventItem.description.substring(0, 120)}...
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      {eventItem.tags.map((tag) => (
                        <Chip
                          key={tag}
                          label={tag}
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
                      onClick={() => handleOpenDialog(eventItem.id)}
                    >
                      Détails
                    </Button>
                    <Button
                      size="small"
                      variant="contained"
                      color="primary"
                      startIcon={<EventAvailable />}
                    >
                      S'inscrire
                    </Button>
                    <IconButton size="small" sx={{ ml: "auto" }}>
                      <Share fontSize="small" />
                    </IconButton>
                  </CardActions>
                </StyledCard>
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {tabValue === 1 && (
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
              placeholder="Rechercher dans les rediffusions..."
              variant="outlined"
              size="small"
              value={searchValue}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: <Search color="action" sx={{ mr: 1 }} />,
              }}
              sx={{ flexGrow: 1, maxWidth: { xs: "100%", sm: 300 } }}
            />

            <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Filtrer par</InputLabel>
              <Select
                value={filterValue}
                onChange={handleFilterChange}
                label="Filtrer par"
                startAdornment={<FilterList fontSize="small" sx={{ mr: 1 }} />}
              >
                <MenuItem value="all">Tous</MenuItem>
                <MenuItem value="beginner">Niveau débutant</MenuItem>
                <MenuItem value="intermediate">Niveau intermédiaire</MenuItem>
                <MenuItem value="advanced">Niveau avancé</MenuItem>
                <MenuItem value="tokenomics">Tokenomics</MenuItem>
                <MenuItem value="security">Sécurité</MenuItem>
                <MenuItem value="marketing">Marketing</MenuItem>
              </Select>
            </FormControl>

            <FormControl variant="outlined" size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Trier par</InputLabel>
              <Select
                value={sortValue}
                onChange={handleSortChange}
                label="Trier par"
                startAdornment={<Sort fontSize="small" sx={{ mr: 1 }} />}
              >
                <MenuItem value="date">Date (plus récent)</MenuItem>
                <MenuItem value="date-asc">Date (plus ancien)</MenuItem>
                <MenuItem value="views">Vues</MenuItem>
                <MenuItem value="title">Titre (A-Z)</MenuItem>
              </Select>
            </FormControl>
          </Box>

          <Typography variant="h5" gutterBottom sx={{ mt: 4, mb: 3 }}>
            Webinaires disponibles en rediffusion
          </Typography>

          <Grid container spacing={4}>
            {pastWebinars.map((webinar) => (
              <Grid item xs={12} sm={6} md={4} key={webinar.id}>
                <StyledCard>
                  <Box sx={{ position: "relative" }}>
                    <CardMedia
                      component="img"
                      height="180"
                      image={webinar.image}
                      alt={webinar.title}
                    />
                    <Box
                      sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "rgba(0, 0, 0, 0.3)",
                      }}
                    >
                      <IconButton
                        sx={{
                          backgroundColor: "rgba(255, 255, 255, 0.8)",
                          "&:hover": {
                            backgroundColor: "rgba(255, 255, 255, 0.9)",
                          },
                        }}
                      >
                        <PlayArrow fontSize="large" color="primary" />
                      </IconButton>
                    </Box>
                    <Box
                      sx={{
                        position: "absolute",
                        bottom: 8,
                        right: 8,
                        backgroundColor: "rgba(0, 0, 0, 0.6)",
                        color: "white",
                        padding: "2px 6px",
                        borderRadius: 1,
                        fontSize: "0.75rem",
                      }}
                    >
                      {webinar.duration}
                    </Box>
                  </Box>
                  <CardContent>
                    <Typography variant="h6" component="h2" gutterBottom>
                      {webinar.title}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <School fontSize="small" color="action" sx={{ mr: 1 }} />
                      <Typography variant="body2" color="text.secondary">
                        {webinar.speaker}, {webinar.speakerRole}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <CalendarToday
                        fontSize="small"
                        color="action"
                        sx={{ mr: 1 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {webinar.date}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                      <Visibility
                        fontSize="small"
                        color="action"
                        sx={{ mr: 1 }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {webinar.views} vues
                      </Typography>
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      {webinar.tags.map((tag) => (
                        <Chip
                          key={tag}
                          label={tag}
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
                      startIcon={<PlayArrow />}
                    >
                      Regarder
                    </Button>
                    <Button size="small" startIcon={<Download />}>
                      Supports
                    </Button>
                    <IconButton size="small" sx={{ ml: "auto" }}>
                      <BookmarkBorder fontSize="small" />
                    </IconButton>
                  </CardActions>
                </StyledCard>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ textAlign: "center", mt: 4 }}>
            <Button variant="outlined" color="primary" size="large">
              Voir plus de webinaires
            </Button>
          </Box>
        </>
      )}

      {tabValue === 2 && (
        <Box>
          <Paper sx={{ p: 3, mb: 4 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h6">Mars 2025</Typography>
              <Box>
                <IconButton size="small">
                  <ArrowDropDown />
                </IconButton>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Add />}
                  size="small"
                >
                  Ajouter à mon calendrier
                </Button>
              </Box>
            </Box>

            <Divider sx={{ mb: 3 }} />

            <List>
              <ListItem
                sx={{
                  border: "1px solid",
                  borderColor: "primary.main",
                  borderRadius: 1,
                  mb: 2,
                  bgcolor: "primary.light",
                }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: "primary.main" }}>15</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary="Tokenomics avancés: Conception et optimisation"
                  secondary={
                    <>
                      <Typography component="span" variant="body2">
                        18:00 UTC • 90 min • Dr. Sarah Chen
                      </Typography>
                      <br />
                      <Chip
                        label="Webinaire"
                        size="small"
                        color="primary"
                        sx={{ mr: 1, mt: 1 }}
                      />
                      <Chip
                        label="156 inscrits"
                        size="small"
                        variant="outlined"
                        sx={{ mt: 1 }}
                      />
                    </>
                  }
                />
                <Button variant="contained" color="primary" size="small">
                  S'inscrire
                </Button>
              </ListItem>

              <ListItem
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  mb: 2,
                }}
              >
                <ListItemAvatar>
                  <Avatar>22</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary="Sécurité des smart contracts: Meilleures pratiques"
                  secondary={
                    <>
                      <Typography component="span" variant="body2">
                        16:00 UTC • 120 min • Alex Moreau
                      </Typography>
                      <br />
                      <Chip
                        label="Webinaire"
                        size="small"
                        color="primary"
                        sx={{ mr: 1, mt: 1 }}
                      />
                      <Chip
                        label="203 inscrits"
                        size="small"
                        variant="outlined"
                        sx={{ mt: 1 }}
                      />
                    </>
                  }
                />
                <Button variant="contained" color="primary" size="small">
                  S'inscrire
                </Button>
              </ListItem>

              <ListItem
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  mb: 2,
                }}
              >
                <ListItemAvatar>
                  <Avatar>29</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary="Marketing efficace pour les projets crypto"
                  secondary={
                    <>
                      <Typography component="span" variant="body2">
                        17:00 UTC • 60 min • Marie Dubois
                      </Typography>
                      <br />
                      <Chip
                        label="Webinaire"
                        size="small"
                        color="primary"
                        sx={{ mr: 1, mt: 1 }}
                      />
                      <Chip
                        label="178 inscrits"
                        size="small"
                        variant="outlined"
                        sx={{ mt: 1 }}
                      />
                    </>
                  }
                />
                <Button variant="contained" color="primary" size="small">
                  S'inscrire
                </Button>
              </ListItem>
            </List>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h6">Avril 2025</Typography>
              <Box>
                <IconButton size="small">
                  <ArrowDropDown />
                </IconButton>
              </Box>
            </Box>

            <Divider sx={{ mb: 3 }} />

            <List>
              <ListItem
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  mb: 2,
                }}
              >
                <ListItemAvatar>
                  <Avatar>5</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary="Multi-chain: Déploiement et gestion cross-chain"
                  secondary={
                    <>
                      <Typography component="span" variant="body2">
                        15:00 UTC • 90 min • Thomas Weber
                      </Typography>
                      <br />
                      <Chip
                        label="Webinaire"
                        size="small"
                        color="primary"
                        sx={{ mr: 1, mt: 1 }}
                      />
                      <Chip
                        label="124 inscrits"
                        size="small"
                        variant="outlined"
                        sx={{ mt: 1 }}
                      />
                    </>
                  }
                />
                <Button variant="contained" color="primary" size="small">
                  S'inscrire
                </Button>
              </ListItem>

              <ListItem
                sx={{
                  border: "1px solid",
                  borderColor: "secondary.main",
                  borderRadius: 1,
                  mb: 2,
                  bgcolor: "secondary.light",
                }}
              >
                <ListItemAvatar>
                  <Avatar sx={{ bgcolor: "secondary.main" }}>12-14</Avatar>
                </ListItemAvatar>
                <ListItemText
                  primary="TokenForge Summit 2025"
                  secondary={
                    <>
                      <Typography component="span" variant="body2">
                        Paris, France • Conférence
                      </Typography>
                      <br />
                      <Chip
                        label="Événement"
                        size="small"
                        color="secondary"
                        sx={{ mr: 1, mt: 1 }}
                      />
                      <Chip
                        label="500 participants"
                        size="small"
                        variant="outlined"
                        sx={{ mt: 1 }}
                      />
                    </>
                  }
                />
                <Button variant="contained" color="secondary" size="small">
                  S'inscrire
                </Button>
              </ListItem>
            </List>
          </Paper>
        </Box>
      )}

      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md">
        {selectedEvent && selectedEvent <= 4 && (
          <>
            <DialogTitle>
              {upcomingWebinars.find((w) => w.id === selectedEvent)?.title}
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box
                    component="img"
                    src={
                      upcomingWebinars.find((w) => w.id === selectedEvent)
                        ?.image
                    }
                    alt={
                      upcomingWebinars.find((w) => w.id === selectedEvent)
                        ?.title
                    }
                    sx={{ width: "100%", borderRadius: 1 }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Détails du webinaire
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" paragraph>
                      {
                        upcomingWebinars.find((w) => w.id === selectedEvent)
                          ?.description
                      }
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="subtitle2">Date et heure:</Typography>
                    <Typography variant="body2">
                      {
                        upcomingWebinars.find((w) => w.id === selectedEvent)
                          ?.date
                      }{" "}
                      à{" "}
                      {
                        upcomingWebinars.find((w) => w.id === selectedEvent)
                          ?.time
                      }
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="subtitle2">Durée:</Typography>
                    <Typography variant="body2">
                      {
                        upcomingWebinars.find((w) => w.id === selectedEvent)
                          ?.duration
                      }
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="subtitle2">Présentateur:</Typography>
                    <Typography variant="body2">
                      {
                        upcomingWebinars.find((w) => w.id === selectedEvent)
                          ?.speaker
                      }
                      ,{" "}
                      {
                        upcomingWebinars.find((w) => w.id === selectedEvent)
                          ?.speakerRole
                      }
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="subtitle2">Langue:</Typography>
                    <Typography variant="body2">
                      {
                        upcomingWebinars.find((w) => w.id === selectedEvent)
                          ?.language
                      }
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2">Participants:</Typography>
                    <Typography variant="body2">
                      {
                        upcomingWebinars.find((w) => w.id === selectedEvent)
                          ?.participants
                      }{" "}
                      inscrits
                    </Typography>
                  </Box>
                  <Box>
                    {upcomingWebinars
                      .find((w) => w.id === selectedEvent)
                      ?.tags.map((tag) => (
                        <Chip
                          key={tag}
                          label={tag}
                          size="small"
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      ))}
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Fermer</Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<EventAvailable />}
              >
                S'inscrire au webinaire
              </Button>
            </DialogActions>
          </>
        )}

        {selectedEvent && selectedEvent > 4 && selectedEvent <= 7 && (
          <>
            <DialogTitle>
              {upcomingEvents.find((e) => e.id === selectedEvent)?.title}
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Box
                    component="img"
                    src={
                      upcomingEvents.find((e) => e.id === selectedEvent)?.image
                    }
                    alt={
                      upcomingEvents.find((e) => e.id === selectedEvent)?.title
                    }
                    sx={{ width: "100%", borderRadius: 1 }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Détails de l'événement
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="body2" paragraph>
                      {
                        upcomingEvents.find((e) => e.id === selectedEvent)
                          ?.description
                      }
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="subtitle2">Date:</Typography>
                    <Typography variant="body2">
                      {upcomingEvents.find((e) => e.id === selectedEvent)?.date}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="subtitle2">Lieu:</Typography>
                    <Typography variant="body2">
                      {
                        upcomingEvents.find((e) => e.id === selectedEvent)
                          ?.location
                      }
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="subtitle2">Type:</Typography>
                    <Typography variant="body2">
                      {upcomingEvents.find((e) => e.id === selectedEvent)?.type}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2">Participants:</Typography>
                    <Typography variant="body2">
                      {
                        upcomingEvents.find((e) => e.id === selectedEvent)
                          ?.participants
                      }{" "}
                      participants attendus
                    </Typography>
                  </Box>
                  <Box>
                    {upcomingEvents
                      .find((e) => e.id === selectedEvent)
                      ?.tags.map((tag) => (
                        <Chip
                          key={tag}
                          label={tag}
                          size="small"
                          sx={{ mr: 0.5, mb: 0.5 }}
                        />
                      ))}
                  </Box>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Fermer</Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<EventAvailable />}
              >
                S'inscrire à l'événement
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default WebinarsEventsPage;
