import React from "react";
import { Container, Typography, Box } from "@mui/material";

const About: React.FC = () => {
  return (
    <Container>
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          About TokenForge
        </Typography>
        <Typography variant="body1" paragraph>
          TokenForge is a powerful and user-friendly platform designed to
          simplify the process of creating and managing custom tokens on the
          blockchain.
        </Typography>
        <Typography variant="body1" paragraph>
          Our mission is to empower individuals and businesses to leverage
          blockchain technology and tokenization without the need for extensive
          technical knowledge.
        </Typography>
        <Typography variant="body1">
          With TokenForge, you can easily:
        </Typography>
        <ul>
          <li>Create custom tokens with various properties</li>
          <li>Manage and monitor your tokens</li>
          <li>Analyze token performance and usage</li>
          <li>Interact with your tokens securely</li>
        </ul>
      </Box>
    </Container>
  );
};

export default About;
