import { 
  Stack,
  FormControl,
  FormLabel,
  TextField,
  Button,
  Paper
} from '@mui/material'

export const CreateTokenForm = () => {
  return (
    <Paper 
      component="form"
      elevation={1}
      sx={{
        p: 3,
        borderRadius: 2
      }}
    >
      <Stack spacing={3}>
        <FormControl required>
          <FormLabel>Nom du Token</FormLabel>
          <TextField 
            fullWidth
            placeholder="Nom du Token"
            variant="outlined"
          />
        </FormControl>
        <FormControl required>
          <FormLabel>Symbole</FormLabel>
          <TextField 
            fullWidth
            placeholder="Symbole"
            variant="outlined"
          />
        </FormControl>
        <FormControl required>
          <FormLabel>Supply Initial</FormLabel>
          <TextField 
            fullWidth
            placeholder="Supply Initial"
            type="number"
            variant="outlined"
          />
        </FormControl>
        <Button 
          type="submit" 
          size="large"
          variant="contained"
          fullWidth
        >
          Créer Token
        </Button>
      </Stack>
    </Paper>
  )
}