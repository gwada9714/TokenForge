import React from "react";
import { Helmet } from "react-helmet-async";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import { useNavigate } from "react-router-dom";
import AuthGuard from "../components/AuthGuard";
import { useAuthContext } from "../contexts/AuthContext";

const ProtectedPage = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuthContext();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate("/auth-demo");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  return (
    <AuthGuard requireAuth={true} fallbackUrl="/auth-demo">
      <Helmet>
        <title>Page Protégée | TokenForge</title>
        <meta
          name="description"
          content="Page protégée nécessitant une authentification"
        />
      </Helmet>
      <Container maxWidth="md">
        <Box sx={{ my: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Page Protégée
          </Typography>

          <Paper sx={{ p: 4, mb: 4 }}>
            <Typography variant="h6" gutterBottom>
              Bienvenue,{" "}
              {user?.displayName || user?.email || "Utilisateur Anonyme"}!
            </Typography>
            <Typography paragraph>
              Cette page est protégée et n&apos;est accessible qu&apos;aux
              utilisateurs authentifiés. Si vous voyez ce contenu, cela signifie
              que vous êtes correctement authentifié.
            </Typography>
            <Typography paragraph>Informations utilisateur:</Typography>
            <Box
              sx={{
                backgroundColor: "rgba(0, 0, 0, 0.05)",
                p: 2,
                borderRadius: 1,
                mb: 3,
              }}
            >
              <Typography
                variant="body2"
                component="pre"
                sx={{ fontFamily: "monospace" }}
              >
                {JSON.stringify(user, null, 2)}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => navigate("/auth-demo")}
              >
                Retour à la démo
              </Button>
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleSignOut}
              >
                Se déconnecter
              </Button>
            </Box>
          </Paper>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textAlign: "center" }}
          >
            Pour en savoir plus sur la protection des routes, consultez la{" "}
            <Link href="/docs/auth-hook" color="primary">
              documentation du hook d&apos;authentification
            </Link>
            .
          </Typography>
        </Box>
      </Container>
    </AuthGuard>
  );
};

export default ProtectedPage;
