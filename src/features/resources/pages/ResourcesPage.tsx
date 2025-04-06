import React from "react";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  Box,
  Divider,
  Chip,
} from "@mui/material";
import ArticleIcon from "@mui/icons-material/Article";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import CodeIcon from "@mui/icons-material/Code";
import SchoolIcon from "@mui/icons-material/School";

export const ResourcesPage: React.FC = () => {
  // Ressources (à remplacer par des données réelles)
  const resources = [
    {
      id: 1,
      title: "Guide complet de création de token ERC-20",
      description:
        "Apprenez à créer votre propre token ERC-20 sur Ethereum avec notre guide étape par étape.",
      type: "article",
      category: "ethereum",
      image: "/images/placeholder-resource.jpg",
    },
    {
      id: 2,
      title: "Tokenomics : les meilleures pratiques",
      description:
        "Découvrez comment concevoir une économie de token durable et attractive pour les investisseurs.",
      type: "article",
      category: "tokenomics",
      image: "/images/placeholder-resource.jpg",
    },
    {
      id: 3,
      title: "Tutoriel vidéo : Déployer un token sur BSC",
      description:
        "Suivez notre tutoriel vidéo pour déployer votre token sur Binance Smart Chain en moins de 15 minutes.",
      type: "video",
      category: "binance",
      image: "/images/placeholder-resource.jpg",
    },
    {
      id: 4,
      title: "Sécuriser votre smart contract",
      description:
        "Les meilleures pratiques pour éviter les vulnérabilités et protéger votre token contre les attaques.",
      type: "article",
      category: "security",
      image: "/images/placeholder-resource.jpg",
    },
    {
      id: 5,
      title: "Code source : Token avec mécanisme anti-whale",
      description:
        "Exemple de code source pour implémenter un mécanisme anti-whale dans votre token.",
      type: "code",
      category: "security",
      image: "/images/placeholder-resource.jpg",
    },
    {
      id: 6,
      title: "Cours : Introduction à la blockchain",
      description:
        "Cours complet pour comprendre les fondamentaux de la technologie blockchain.",
      type: "course",
      category: "education",
      image: "/images/placeholder-resource.jpg",
    },
  ];

  // Fonction pour obtenir l'icône en fonction du type de ressource
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "article":
        return <ArticleIcon />;
      case "video":
        return <VideoLibraryIcon />;
      case "code":
        return <CodeIcon />;
      case "course":
        return <SchoolIcon />;
      default:
        return <ArticleIcon />;
    }
  };

  // Fonction pour obtenir la couleur en fonction de la catégorie
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "ethereum":
        return "#627eea";
      case "binance":
        return "#f3ba2f";
      case "tokenomics":
        return "#2196f3";
      case "security":
        return "#f44336";
      case "education":
        return "#4caf50";
      default:
        return "#9e9e9e";
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Ressources
      </Typography>

      <Typography paragraph>
        Explorez notre bibliothèque de ressources pour approfondir vos
        connaissances sur la création de tokens et la blockchain.
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h5" gutterBottom>
          Catégories
        </Typography>

        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 3 }}>
          <Chip label="Tous" color="primary" variant="filled" clickable />
          <Chip
            label="Ethereum"
            sx={{ bgcolor: "#627eea", color: "white" }}
            clickable
          />
          <Chip
            label="Binance Smart Chain"
            sx={{ bgcolor: "#f3ba2f", color: "white" }}
            clickable
          />
          <Chip
            label="Tokenomics"
            sx={{ bgcolor: "#2196f3", color: "white" }}
            clickable
          />
          <Chip
            label="Sécurité"
            sx={{ bgcolor: "#f44336", color: "white" }}
            clickable
          />
          <Chip
            label="Éducation"
            sx={{ bgcolor: "#4caf50", color: "white" }}
            clickable
          />
        </Box>

        <Divider sx={{ mb: 4 }} />
      </Box>

      <Grid container spacing={3}>
        {resources.map((resource) => (
          <Grid item xs={12} sm={6} md={4} key={resource.id}>
            <Card
              sx={{ height: "100%", display: "flex", flexDirection: "column" }}
            >
              <CardActionArea>
                <CardMedia
                  component="img"
                  height="140"
                  image={resource.image}
                  alt={resource.title}
                  sx={{ bgcolor: "grey.200" }}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Chip
                      icon={getTypeIcon(resource.type)}
                      label={
                        resource.type.charAt(0).toUpperCase() +
                        resource.type.slice(1)
                      }
                      size="small"
                      variant="outlined"
                    />
                    <Chip
                      label={
                        resource.category.charAt(0).toUpperCase() +
                        resource.category.slice(1)
                      }
                      size="small"
                      sx={{
                        bgcolor: getCategoryColor(resource.category),
                        color: "white",
                      }}
                    />
                  </Box>
                  <Typography gutterBottom variant="h6" component="div">
                    {resource.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {resource.description}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};
