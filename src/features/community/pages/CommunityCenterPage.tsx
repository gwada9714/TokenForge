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
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  TextField,
  Paper,
  Chip,
  Menu,
  MenuItem,
  InputAdornment,
} from "@mui/material";
// import { styled } from '@mui/material/styles';
import {
  Forum,
  Poll,
  Announcement,
  ThumbUp,
  ThumbDown,
  Comment,
  Share,
  MoreVert,
  Send,
  Search,
  FilterList,
  Sort,
  Bookmark,
  BookmarkBorder,
  Verified,
  Add,
  Visibility,
} from "@mui/icons-material";

// Composants stylisés définis mais non utilisés dans ce fichier
// Conservés pour une utilisation future potentielle
// const StyledCard = styled(Card)(({ theme }) => ({
//     height: '100%',
//     display: 'flex',
//     flexDirection: 'column',
//     transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
//     '&:hover': {
//         transform: 'translateY(-5px)',
//         boxShadow: theme.shadows[10],
//     },
// }));

// const UserBadge = styled(Chip)(({ theme }) => ({
//     position: 'absolute',
//     top: 16,
//     right: 16,
//     zIndex: 1,
// }));

export const CommunityCenterPage: React.FC = () => {
  const [tabValue, setTabValue] = useState(0);
  const [searchValue, setSearchValue] = useState("");
  // États pour le filtrage et le tri (préparés pour une implémentation future)
  // const [filterValue, setFilterValue] = useState('all');
  // const [sortValue, setSortValue] = useState('recent');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [bookmarkedPosts, setBookmarkedPosts] = useState<number[]>([]);
  const [likedPosts, setLikedPosts] = useState<number[]>([]);
  const [dislikedPosts, setDislikedPosts] = useState<number[]>([]);
  const [commentText, setCommentText] = useState("");

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(event.target.value);
  };

  // Fonctions pour le filtrage et le tri (préparées pour une implémentation future)
  // const handleFilterChange = (event: any) => {
  //     setFilterValue(event.target.value as string);
  // };

  // const handleSortChange = (event: any) => {
  //     setSortValue(event.target.value as string);
  // };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleBookmarkToggle = (postId: number) => {
    if (bookmarkedPosts.includes(postId)) {
      setBookmarkedPosts(bookmarkedPosts.filter((id) => id !== postId));
    } else {
      setBookmarkedPosts([...bookmarkedPosts, postId]);
    }
  };

  const handleLike = (postId: number) => {
    if (likedPosts.includes(postId)) {
      setLikedPosts(likedPosts.filter((id) => id !== postId));
    } else {
      setLikedPosts([...likedPosts, postId]);
      setDislikedPosts(dislikedPosts.filter((id) => id !== postId));
    }
  };

  const handleDislike = (postId: number) => {
    if (dislikedPosts.includes(postId)) {
      setDislikedPosts(dislikedPosts.filter((id) => id !== postId));
    } else {
      setDislikedPosts([...dislikedPosts, postId]);
      setLikedPosts(likedPosts.filter((id) => id !== postId));
    }
  };

  const handleCommentChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCommentText(event.target.value);
  };

  const handleCommentSubmit = () => {
    // Logique pour soumettre un commentaire
    setCommentText("");
  };

  // Données simulées pour les annonces
  const announcements = [
    {
      id: 1,
      title: "Mise à jour majeure de la plateforme TokenForge v2.5",
      content:
        "Nous sommes ravis d'annoncer le lancement de TokenForge v2.5 avec de nouvelles fonctionnalités: support multi-chain étendu, outils de tokenomics avancés et interface utilisateur améliorée. Découvrez toutes les nouveautés dès maintenant!",
      author: "Équipe TokenForge",
      authorRole: "Officiel",
      date: "28 Février 2025",
      image: "/images/update-announcement.jpg",
      important: true,
    },
    {
      id: 2,
      title: "Webinaire: Tokenomics avancés - 15 Mars 2025",
      content:
        "Ne manquez pas notre prochain webinaire sur les tokenomics avancés, animé par Dr. Sarah Chen, économiste blockchain. Apprenez à concevoir des modèles économiques durables pour vos projets. Inscrivez-vous dès maintenant!",
      author: "Équipe Événements",
      authorRole: "Officiel",
      date: "26 Février 2025",
      image: "/images/webinar-announcement.jpg",
      important: false,
    },
  ];

  // Données simulées pour les discussions
  const discussions = [
    {
      id: 3,
      title:
        "Quelle est la meilleure stratégie de staking pour un token de gouvernance?",
      content:
        "Je développe un token de gouvernance pour une DAO et je cherche des conseils sur la configuration optimale du staking. Quels paramètres recommandez-vous pour encourager la participation à long terme tout en maintenant une liquidité suffisante?",
      author: "CryptoBuilder",
      authorRole: "Membre",
      authorLevel: 2,
      date: "1 Mars 2025",
      tags: ["staking", "gouvernance", "tokenomics"],
      likes: 24,
      comments: 18,
      views: 156,
    },
    {
      id: 4,
      title: "Retour d'expérience: Déploiement multi-chain avec TokenForge",
      content:
        "Je viens de déployer mon token sur 4 blockchains différentes (Ethereum, BSC, Polygon et Avalanche) en utilisant TokenForge. Je partage mon expérience, les défis rencontrés et les solutions trouvées. N'hésitez pas à poser vos questions!",
      author: "MultiChainDev",
      authorRole: "Ambassadeur",
      authorLevel: 3,
      date: "28 Février 2025",
      tags: ["multi-chain", "déploiement", "retour d'expérience"],
      likes: 42,
      comments: 31,
      views: 287,
    },
    {
      id: 5,
      title: "Comment configurer efficacement les mécanismes anti-whale?",
      content:
        "Je souhaite protéger mon token contre les manipulations de marché par les gros détenteurs. Quels sont vos conseils pour configurer les limites de transaction et de détention? Quels pourcentages recommandez-vous?",
      author: "TokenSecure",
      authorRole: "Membre",
      authorLevel: 1,
      date: "27 Février 2025",
      tags: ["sécurité", "anti-whale", "tokenomics"],
      likes: 18,
      comments: 23,
      views: 194,
    },
  ];

  // Données simulées pour les sondages
  const polls = [
    {
      id: 6,
      title:
        "Quelle blockchain souhaitez-vous voir ajoutée en priorité à TokenForge?",
      author: "Équipe Produit",
      authorRole: "Officiel",
      date: "27 Février 2025",
      options: [
        { text: "Solana", votes: 156 },
        { text: "Cardano", votes: 98 },
        { text: "Polkadot", votes: 87 },
        { text: "Near Protocol", votes: 64 },
      ],
      totalVotes: 405,
      endDate: "15 Mars 2025",
      userVoted: false,
    },
    {
      id: 7,
      title:
        "Quelle fonctionnalité souhaitez-vous voir développée en priorité?",
      author: "Équipe Produit",
      authorRole: "Officiel",
      date: "20 Février 2025",
      options: [
        { text: "Outils de marketing intégrés", votes: 243 },
        { text: "Analyse on-chain avancée", votes: 187 },
        { text: "Templates de smart contracts personnalisables", votes: 165 },
        { text: "Intégration avec plus de DEX", votes: 129 },
      ],
      totalVotes: 724,
      endDate: "5 Mars 2025",
      userVoted: true,
      userVotedOption: 2,
    },
  ];

  // Données simulées pour les ambassadeurs vedettes
  const topAmbassadors = [
    {
      id: 8,
      name: "Maria S.",
      role: "Ambassadeur",
      level: 3,
      country: "Espagne",
      avatar: "/images/ambassador-1.jpg",
      points: 3450,
      specialties: ["Éducation", "Communauté"],
      contributions:
        "A créé plus de 30 tutoriels et organisé 5 webinaires éducatifs.",
    },
    {
      id: 9,
      name: "Alex T.",
      role: "Ambassadeur",
      level: 3,
      country: "Canada",
      avatar: "/images/ambassador-2.jpg",
      points: 3280,
      specialties: ["Développement", "Contenu"],
      contributions:
        "Développeur de 12 templates personnalisés et contributeur technique actif.",
    },
    {
      id: 10,
      name: "Sophia L.",
      role: "Ambassadeur",
      level: 2,
      country: "Singapour",
      avatar: "/images/ambassador-3.jpg",
      points: 1850,
      specialties: ["Marketing", "Événements"],
      contributions:
        "A organisé 8 événements locaux et gère plusieurs communautés en Asie.",
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
        Centre Communautaire
      </Typography>
      <Typography
        variant="h6"
        align="center"
        color="textSecondary"
        paragraph
        sx={{ mb: 6 }}
      >
        Rejoignez la communauté TokenForge, partagez vos expériences et apprenez
        des autres membres
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={8}>
          <Box sx={{ mb: 4 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="fullWidth"
              textColor="primary"
              indicatorColor="primary"
            >
              <Tab icon={<Forum />} label="Discussions" />
              <Tab icon={<Announcement />} label="Annonces" />
              <Tab icon={<Poll />} label="Sondages" />
            </Tabs>
          </Box>

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
                startAdornment: (
                  <InputAdornment position="start">
                    <Search />
                  </InputAdornment>
                ),
              }}
              sx={{ flexGrow: 1 }}
            />

            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                variant="contained"
                color="primary"
                startIcon={<Add />}
                size="medium"
              >
                Nouvelle discussion
              </Button>

              <IconButton color="primary">
                <FilterList />
              </IconButton>

              <IconButton color="primary">
                <Sort />
              </IconButton>
            </Box>
          </Box>

          {tabValue === 0 && (
            <>
              {discussions.map((discussion) => (
                <Card key={discussion.id} sx={{ mb: 3 }}>
                  <CardContent>
                    <Box
                      sx={{ display: "flex", alignItems: "flex-start", mb: 2 }}
                    >
                      <Avatar sx={{ mr: 2 }}>
                        {discussion.author.charAt(0)}
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            mb: 0.5,
                          }}
                        >
                          <Typography variant="subtitle1" fontWeight="bold">
                            {discussion.author}
                          </Typography>
                          {discussion.authorRole === "Ambassadeur" && (
                            <Chip
                              size="small"
                              label={`${discussion.authorRole} Niv.${discussion.authorLevel}`}
                              color="primary"
                              sx={{ ml: 1 }}
                            />
                          )}
                        </Box>
                        <Typography variant="caption" color="textSecondary">
                          {discussion.date}
                        </Typography>
                      </Box>
                      <IconButton size="small" onClick={handleMenuOpen}>
                        <MoreVert fontSize="small" />
                      </IconButton>
                    </Box>

                    <Typography variant="h6" gutterBottom>
                      {discussion.title}
                    </Typography>

                    <Typography variant="body2" paragraph>
                      {discussion.content}
                    </Typography>

                    <Box
                      sx={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 0.5,
                        mb: 2,
                      }}
                    >
                      {discussion.tags.map((tag) => (
                        <Chip
                          key={tag}
                          label={tag}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 2 }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <IconButton
                            size="small"
                            color={
                              likedPosts.includes(discussion.id)
                                ? "primary"
                                : "default"
                            }
                            onClick={() => handleLike(discussion.id)}
                          >
                            <ThumbUp fontSize="small" />
                          </IconButton>
                          <Typography variant="body2">
                            {discussion.likes +
                              (likedPosts.includes(discussion.id) ? 1 : 0) -
                              (dislikedPosts.includes(discussion.id) ? 1 : 0)}
                          </Typography>
                          <IconButton
                            size="small"
                            color={
                              dislikedPosts.includes(discussion.id)
                                ? "primary"
                                : "default"
                            }
                            onClick={() => handleDislike(discussion.id)}
                          >
                            <ThumbDown fontSize="small" />
                          </IconButton>
                        </Box>

                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Comment
                            fontSize="small"
                            color="action"
                            sx={{ mr: 0.5 }}
                          />
                          <Typography variant="body2">
                            {discussion.comments}
                          </Typography>
                        </Box>

                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Visibility
                            fontSize="small"
                            color="action"
                            sx={{ mr: 0.5 }}
                          />
                          <Typography variant="body2">
                            {discussion.views}
                          </Typography>
                        </Box>
                      </Box>

                      <Box>
                        <IconButton
                          size="small"
                          onClick={() => handleBookmarkToggle(discussion.id)}
                        >
                          {bookmarkedPosts.includes(discussion.id) ? (
                            <Bookmark fontSize="small" color="primary" />
                          ) : (
                            <BookmarkBorder fontSize="small" />
                          )}
                        </IconButton>
                        <IconButton size="small">
                          <Share fontSize="small" />
                        </IconButton>
                      </Box>
                    </Box>
                  </CardContent>
                  <Divider />
                  <CardActions sx={{ px: 2, py: 1 }}>
                    <TextField
                      fullWidth
                      placeholder="Ajouter un commentaire..."
                      variant="outlined"
                      size="small"
                      value={commentText}
                      onChange={handleCommentChange}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              edge="end"
                              color="primary"
                              onClick={handleCommentSubmit}
                              disabled={!commentText.trim()}
                            >
                              <Send />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </CardActions>
                </Card>
              ))}

              <Box sx={{ textAlign: "center", mt: 4 }}>
                <Button variant="outlined" color="primary" size="large">
                  Voir plus de discussions
                </Button>
              </Box>
            </>
          )}

          {tabValue === 1 && (
            <>
              {announcements.map((announcement) => (
                <Card
                  key={announcement.id}
                  sx={{
                    mb: 3,
                    border: announcement.important ? "1px solid" : "none",
                    borderColor: "primary.main",
                  }}
                >
                  {announcement.image && (
                    <CardMedia
                      component="img"
                      height="200"
                      image={announcement.image}
                      alt={announcement.title}
                    />
                  )}
                  <CardContent>
                    <Box
                      sx={{ display: "flex", alignItems: "flex-start", mb: 2 }}
                    >
                      <Avatar sx={{ mr: 2, bgcolor: "primary.main" }}>
                        {announcement.author.charAt(0)}
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            mb: 0.5,
                          }}
                        >
                          <Typography variant="subtitle1" fontWeight="bold">
                            {announcement.author}
                          </Typography>
                          <Chip
                            size="small"
                            label={announcement.authorRole}
                            color="primary"
                            icon={<Verified />}
                            sx={{ ml: 1 }}
                          />
                          {announcement.important && (
                            <Chip
                              size="small"
                              label="Important"
                              color="error"
                              sx={{ ml: 1 }}
                            />
                          )}
                        </Box>
                        <Typography variant="caption" color="textSecondary">
                          {announcement.date}
                        </Typography>
                      </Box>
                    </Box>

                    <Typography variant="h6" gutterBottom>
                      {announcement.title}
                    </Typography>

                    <Typography variant="body1" paragraph>
                      {announcement.content}
                    </Typography>

                    <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                      <Button variant="outlined" color="primary">
                        En savoir plus
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </>
          )}

          {tabValue === 2 && (
            <>
              {polls.map((poll) => (
                <Card key={poll.id} sx={{ mb: 3 }}>
                  <CardContent>
                    <Box
                      sx={{ display: "flex", alignItems: "flex-start", mb: 2 }}
                    >
                      <Avatar sx={{ mr: 2, bgcolor: "primary.main" }}>
                        {poll.author.charAt(0)}
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            mb: 0.5,
                          }}
                        >
                          <Typography variant="subtitle1" fontWeight="bold">
                            {poll.author}
                          </Typography>
                          <Chip
                            size="small"
                            label={poll.authorRole}
                            color="primary"
                            icon={<Verified />}
                            sx={{ ml: 1 }}
                          />
                        </Box>
                        <Typography variant="caption" color="textSecondary">
                          {poll.date} • Fin du sondage: {poll.endDate}
                        </Typography>
                      </Box>
                    </Box>

                    <Typography variant="h6" gutterBottom>
                      {poll.title}
                    </Typography>

                    <List>
                      {poll.options.map((option, index) => {
                        const percentage = Math.round(
                          (option.votes / poll.totalVotes) * 100
                        );
                        const isUserVote =
                          poll.userVoted && poll.userVotedOption === index;

                        return (
                          <ListItem key={index} sx={{ px: 0 }}>
                            <Box sx={{ width: "100%" }}>
                              <Box
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  mb: 0.5,
                                }}
                              >
                                <Typography
                                  variant="body1"
                                  sx={{ flexGrow: 1 }}
                                >
                                  {option.text}
                                  {isUserVote && (
                                    <Chip
                                      size="small"
                                      label="Votre vote"
                                      color="primary"
                                      sx={{ ml: 1 }}
                                    />
                                  )}
                                </Typography>
                                <Typography variant="body2" fontWeight="bold">
                                  {percentage}%
                                </Typography>
                              </Box>
                              <Box
                                sx={{
                                  height: 8,
                                  bgcolor: "grey.200",
                                  borderRadius: 1,
                                  position: "relative",
                                  overflow: "hidden",
                                }}
                              >
                                <Box
                                  sx={{
                                    position: "absolute",
                                    top: 0,
                                    left: 0,
                                    height: "100%",
                                    width: `${percentage}%`,
                                    bgcolor: isUserVote
                                      ? "primary.main"
                                      : "primary.light",
                                    borderRadius: 1,
                                  }}
                                />
                              </Box>
                              <Typography
                                variant="caption"
                                color="textSecondary"
                              >
                                {option.votes} votes
                              </Typography>
                            </Box>
                          </ListItem>
                        );
                      })}
                    </List>

                    <Box
                      sx={{
                        mt: 2,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Typography variant="body2" color="textSecondary">
                        {poll.totalVotes} votes au total
                      </Typography>
                      {!poll.userVoted && (
                        <Button variant="contained" color="primary">
                          Voter
                        </Button>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              ))}

              <Box sx={{ textAlign: "center", mt: 4 }}>
                <Button variant="outlined" color="primary">
                  Voir les sondages précédents
                </Button>
              </Box>
            </>
          )}
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, mb: 4 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 2,
              }}
            >
              <Typography variant="h6">Votre profil</Typography>
              <Button size="small" color="primary">
                Éditer
              </Button>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <Avatar sx={{ width: 60, height: 60, mr: 2 }}>U</Avatar>
              <Box>
                <Typography variant="subtitle1" fontWeight="bold">
                  Utilisateur
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Membre depuis Février 2025
                </Typography>
                <Chip
                  size="small"
                  label="Niveau 1"
                  color="primary"
                  sx={{ mt: 0.5 }}
                />
              </Box>
            </Box>
            <Divider sx={{ my: 2 }} />
            <Typography variant="subtitle2" gutterBottom>
              Statistiques
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Box sx={{ textAlign: "center" }}>
                  <Typography variant="h6">3</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Discussions
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ textAlign: "center" }}>
                  <Typography variant="h6">12</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Commentaires
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={4}>
                <Box sx={{ textAlign: "center" }}>
                  <Typography variant="h6">250</Typography>
                  <Typography variant="body2" color="textSecondary">
                    Points
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            <Button variant="outlined" color="primary" fullWidth sx={{ mt: 2 }}>
              Voir mon activité
            </Button>
          </Paper>

          <Paper sx={{ p: 3, mb: 4 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 2,
              }}
            >
              <Typography variant="h6">Ambassadeurs vedettes</Typography>
              <Button size="small" color="primary">
                Voir tous
              </Button>
            </Box>
            <List disablePadding>
              {topAmbassadors.map((ambassador) => (
                <ListItem key={ambassador.id} sx={{ px: 0 }}>
                  <ListItemAvatar>
                    <Avatar>{ambassador.name.charAt(0)}</Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        {ambassador.name}
                        <Chip
                          size="small"
                          label={`Niv.${ambassador.level}`}
                          color="primary"
                          sx={{ ml: 1 }}
                        />
                      </Box>
                    }
                    secondary={
                      <>
                        <Typography
                          variant="caption"
                          component="span"
                          display="block"
                        >
                          {ambassador.country} • {ambassador.points} points
                        </Typography>
                        <Box sx={{ mt: 0.5 }}>
                          {ambassador.specialties.map((specialty) => (
                            <Chip
                              key={specialty}
                              label={specialty}
                              size="small"
                              variant="outlined"
                              sx={{ mr: 0.5, mb: 0.5 }}
                            />
                          ))}
                        </Box>
                      </>
                    }
                  />
                </ListItem>
              ))}
            </List>
            <Button variant="outlined" color="primary" fullWidth sx={{ mt: 2 }}>
              Devenir ambassadeur
            </Button>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 2,
              }}
            >
              <Typography variant="h6">Événements à venir</Typography>
              <Button size="small" color="primary">
                Voir tous
              </Button>
            </Box>
            <List disablePadding>
              <ListItem sx={{ px: 0 }}>
                <ListItemText
                  primary="Webinaire: Tokenomics avancés"
                  secondary={
                    <>
                      <Typography
                        variant="caption"
                        component="span"
                        display="block"
                      >
                        15 Mars 2025 • 19:00 CET
                      </Typography>
                      <Typography
                        variant="caption"
                        component="span"
                        display="block"
                      >
                        Animé par Dr. Sarah Chen
                      </Typography>
                    </>
                  }
                />
                <Button size="small" variant="outlined" color="primary">
                  S'inscrire
                </Button>
              </ListItem>
              <Divider component="li" />
              <ListItem sx={{ px: 0 }}>
                <ListItemText
                  primary="Atelier: Déploiement multi-chain"
                  secondary={
                    <>
                      <Typography
                        variant="caption"
                        component="span"
                        display="block"
                      >
                        22 Mars 2025 • 15:00 CET
                      </Typography>
                      <Typography
                        variant="caption"
                        component="span"
                        display="block"
                      >
                        Animé par l'équipe technique
                      </Typography>
                    </>
                  }
                />
                <Button size="small" variant="outlined" color="primary">
                  S'inscrire
                </Button>
              </ListItem>
            </List>
          </Paper>
        </Grid>
      </Grid>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMenuClose}>Signaler</MenuItem>
        <MenuItem onClick={handleMenuClose}>Masquer</MenuItem>
        <MenuItem onClick={handleMenuClose}>Copier le lien</MenuItem>
      </Menu>
    </Container>
  );
};

export default CommunityCenterPage;
