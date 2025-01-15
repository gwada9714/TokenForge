import { Box, Typography } from '@mui/material'

export const Footer = () => {
  return (
    <Box 
      component="footer" 
      sx={{ 
        p: 2,
        textAlign: 'center'
      }}
    >
      <Typography variant="body2" color="text.secondary">
        2024 TokenForge. Tous droits rservs.
      </Typography>
    </Box>
  )
}