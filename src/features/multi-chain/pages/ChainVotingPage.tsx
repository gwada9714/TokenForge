import React from "react";
import { Container, Typography, Box, Breadcrumbs, Link } from "@mui/material";
import { ChainVotingSystem } from "../components/ChainVotingSystem";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";

const ChainVotingPage: React.FC = () => {
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
        <Link color="inherit" href="/multi-chain">
          Multi-Chain
        </Link>
        <Typography color="text.primary">Vote Communautaire</Typography>
      </Breadcrumbs>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Vote Communautaire pour les Blockchains
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Aidez-nous à décider quelles blockchains nous devrions intégrer
          ensuite à TokenForge. Votez pour vos préférées ou proposez-en de
          nouvelles!
        </Typography>
      </Box>

      <ChainVotingSystem />
    </Container>
  );
};

export default ChainVotingPage;
