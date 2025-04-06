import React from "react";
import {
  Container,
  Typography,
  Box,
  Breadcrumbs,
  Link,
  Paper,
  Alert,
} from "@mui/material";
import { KYCVerificationForm } from "../components/KYCVerificationForm";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

const KYCVerificationPage: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        aria-label="breadcrumb"
        sx={{ mb: 3 }}
      >
        <Link color="inherit" href="/">
          Accueil
        </Link>
        <Link color="inherit" href="/services">
          Services
        </Link>
        <Typography color="text.primary">Vérification KYC</Typography>
      </Breadcrumbs>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Vérification KYC
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
          Complétez votre vérification d'identité pour accéder à toutes les
          fonctionnalités de TokenForge.
        </Typography>

        <Paper sx={{ p: 3, mb: 4 }}>
          <Alert severity="info" sx={{ mb: 0 }}>
            <Typography variant="body1">
              <strong>
                Pourquoi avons-nous besoin de vérifier votre identité ?
              </strong>
            </Typography>
            <ul>
              <li>
                Pour nous conformer aux réglementations en vigueur (KYC/AML)
              </li>
              <li>
                Pour protéger notre plateforme contre les activités frauduleuses
              </li>
              <li>Pour garantir la sécurité de tous nos utilisateurs</li>
              <li>
                Pour vous donner accès aux fonctionnalités avancées de
                TokenForge
              </li>
            </ul>
            <Typography variant="body2" sx={{ mt: 2 }}>
              Vos données personnelles sont traitées de manière sécurisée et
              confidentielle, conformément à notre politique de confidentialité.
            </Typography>
          </Alert>
        </Paper>
      </Box>

      <KYCVerificationForm />
    </Container>
  );
};

export default KYCVerificationPage;
