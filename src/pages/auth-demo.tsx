import React from "react";
import { Helmet } from "react-helmet-async";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Divider from "@mui/material/Divider";
import Link from "@mui/material/Link";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import AuthDemo from "@/components/AuthDemo";
import { useAuthContext } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

const AuthDemoPage = () => {
  // Utilisation du contexte d'authentification
  const { isAuthenticated, user, isAdmin } = useAuthContext();
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>Démonstration d'Authentification | TokenForge</title>
        <meta
          name="description"
          content="Démonstration des fonctionnalités d'authentification Firebase dans TokenForge"
        />
      </Helmet>
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Démonstration d'Authentification Firebase
          </Typography>

          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              À propos de cette démonstration
            </Typography>
            <Typography paragraph>
              Cette page démontre l'utilisation du hook <code>useAuth</code> et
              du contexte d'authentification <code>AuthContext</code> dans
              l'application TokenForge. Vous pouvez tester toutes les
              fonctionnalités d'authentification Firebase, notamment:
            </Typography>
            <ul>
              <li>Connexion avec email et mot de passe</li>
              <li>Inscription avec email et mot de passe</li>
              <li>Connexion anonyme</li>
              <li>Déconnexion</li>
              <li>Réinitialisation du mot de passe</li>
              <li>Mise à jour du profil utilisateur</li>
            </ul>
            <Typography paragraph>
              État actuel de l'authentification:{" "}
              <strong>{isAuthenticated ? "Connecté" : "Non connecté"}</strong>
              {isAuthenticated && user && (
                <>
                  <br />
                  Utilisateur: <strong>{user.email || user.uid}</strong>
                  <br />
                  Rôle:{" "}
                  <strong>
                    {isAdmin ? "Administrateur" : "Utilisateur standard"}
                  </strong>
                </>
              )}
            </Typography>
          </Paper>

          <AuthDemo />

          <Box sx={{ mt: 4 }}>
            <Grid container spacing={2}>
              <Grid item>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => navigate("/protected")}
                >
                  Accéder à la page protégée
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant="contained"
                  color="secondary"
                  onClick={() => navigate("/admin")}
                >
                  Accéder à la page admin
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant="outlined"
                  onClick={() => navigate("/docs/auth-hook")}
                >
                  Voir la documentation
                </Button>
              </Grid>
            </Grid>
          </Box>

          <Divider sx={{ my: 4 }} />

          <Typography variant="body2" color="text.secondary">
            <Link
              href="https://github.com/gwada9714/TokenForge"
              target="_blank"
              rel="noopener"
            >
              TokenForge
            </Link>
            {" - "}
            <Link
              href="https://firebase.google.com/docs/auth"
              target="_blank"
              rel="noopener"
            >
              Documentation Firebase Auth
            </Link>
          </Typography>
        </Box>
      </Container>
    </>
  );
};

export default AuthDemoPage;
