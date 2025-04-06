import React from "react";
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  Chip,
  CardActionArea,
} from "@mui/material";
import { motion } from "framer-motion";
import { styled } from "@mui/material/styles";
import SchoolIcon from "@mui/icons-material/School";
import CodeIcon from "@mui/icons-material/Code";
import SecurityIcon from "@mui/icons-material/Security";
import AccountBalanceIcon from "@mui/icons-material/AccountBalance";

const StyledSection = styled("section")(({ theme }) => ({
  padding: theme.spacing(8, 0),
  backgroundColor: theme.palette.background.default,
}));

const StyledCard = styled(Card)(({ theme }) => ({
  height: "100%",
  transition: "transform 0.3s ease-in-out",
  "&:hover": {
    transform: "translateY(-8px)",
  },
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "center",
  marginBottom: theme.spacing(2),
  "& > svg": {
    fontSize: 48,
    color: theme.palette.primary.main,
  },
}));

interface Topic {
  icon: React.ReactNode;
  title: string;
  description: string;
  category: string;
  difficulty: "Débutant" | "Intermédiaire" | "Avancé";
  duration: string;
}

const topics: Topic[] = [
  {
    icon: <SchoolIcon />,
    title: "Introduction à la Blockchain",
    description:
      "Comprendre les concepts fondamentaux de la blockchain et son fonctionnement.",
    category: "Fondamentaux",
    difficulty: "Débutant",
    duration: "2 heures",
  },
  {
    icon: <CodeIcon />,
    title: "Création de Smart Contracts",
    description:
      "Apprenez à développer et déployer des smart contracts sur Ethereum.",
    category: "Développement",
    difficulty: "Intermédiaire",
    duration: "4 heures",
  },
  {
    icon: <SecurityIcon />,
    title: "Sécurité des Smart Contracts",
    description:
      "Meilleures pratiques et audit de sécurité pour vos smart contracts.",
    category: "Sécurité",
    difficulty: "Avancé",
    duration: "3 heures",
  },
  {
    icon: <AccountBalanceIcon />,
    title: "Tokenomics et Design",
    description:
      "Conception d'une tokenomics efficace et durable pour votre projet.",
    category: "Économie",
    difficulty: "Intermédiaire",
    duration: "3 heures",
  },
];

const difficultyColors = {
  Débutant: "success",
  Intermédiaire: "warning",
  Avancé: "error",
} as const;

const LearnPage: React.FC = () => {
  return (
    <StyledSection>
      <Container maxWidth="lg">
        <Box mb={8} textAlign="center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Typography variant="h2" component="h1" gutterBottom>
              Centre d'Apprentissage
            </Typography>
            <Typography variant="h5" color="textSecondary">
              Développez vos compétences en blockchain et tokenisation
            </Typography>
          </motion.div>
        </Box>

        <Grid container spacing={4}>
          {topics.map((topic, index) => (
            <Grid item xs={12} sm={6} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <StyledCard>
                  <CardActionArea>
                    <CardContent>
                      <IconWrapper>{topic.icon}</IconWrapper>
                      <Box mb={2}>
                        <Chip
                          label={topic.category}
                          color="primary"
                          size="small"
                          sx={{ mr: 1 }}
                        />
                        <Chip
                          label={topic.difficulty}
                          color={difficultyColors[topic.difficulty]}
                          size="small"
                          sx={{ mr: 1 }}
                        />
                        <Chip
                          label={topic.duration}
                          variant="outlined"
                          size="small"
                        />
                      </Box>
                      <Typography variant="h5" component="h2" gutterBottom>
                        {topic.title}
                      </Typography>
                      <Typography
                        variant="body1"
                        color="textSecondary"
                        paragraph
                      >
                        {topic.description}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </StyledCard>
              </motion.div>
            </Grid>
          ))}
        </Grid>

        <Box mt={8} textAlign="center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Typography variant="h4" component="h2" gutterBottom>
              Prêt à commencer ?
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Choisissez un sujet ci-dessus et commencez votre parcours
              d'apprentissage. Nos cours sont conçus pour vous accompagner pas à
              pas dans votre progression.
            </Typography>
          </motion.div>
        </Box>
      </Container>
    </StyledSection>
  );
};

export default LearnPage;
