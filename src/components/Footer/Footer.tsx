import { Box, Typography, Container } from "@mui/material";

export const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: "auto",
        backgroundColor: (theme) =>
          theme.palette.mode === "light"
            ? theme.palette.grey[200]
            : theme.palette.grey[800],
      }}
    >
      <Container maxWidth="sm">
        <Typography variant="body2" color="text.secondary" align="center">
          {"Copyright "}
          <Typography variant="body2" color="text.secondary" align="center" component="span">
            {new Date().getFullYear()}
          </Typography>
          {" TokenForge. All rights reserved."}
        </Typography>
      </Container>
    </Box>
  );
};
