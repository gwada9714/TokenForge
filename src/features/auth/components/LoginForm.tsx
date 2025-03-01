import React, { useState } from 'react';
import { 
  Box, 
  TextField, 
  Button, 
  InputAdornment, 
  IconButton,
  Typography,
  useTheme,
  useMediaQuery 
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { AuthError } from '../errors/AuthError';

interface LoginFormProps {
  onSubmit: (email: string, password: string) => Promise<void>;
  isLoading?: boolean;
  error?: AuthError | null;
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSubmit,
  isLoading = false,
  error
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (getFieldError('email') || getFieldError('password')) return;
    
    try {
      await onSubmit(email, password);
    } catch (err) {
      // console.error('Login error:', err);
    }
  };

  const handleFieldBlur = (field: string) => {
    setTouchedFields(prev => new Set([...prev, field]));
  };

  const getFieldError = (field: string): string => {
    if (!touchedFields.has(field)) return '';
    
    switch (field) {
      case 'email':
        return !email ? 'Email is required' : 
               !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(email) ? 'Invalid email address' : '';
      case 'password':
        return !password ? 'Password is required' : 
               password.length < 6 ? 'Password must be at least 6 characters' : '';
      default:
        return '';
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      noValidate
      sx={{
        width: '100%',
        mt: 1,
        '& .MuiTextField-root': { mb: 2 },
      }}
      role="form"
      aria-label="Login Form"
    >
      <Typography 
        variant={isMobile ? "h5" : "h4"} 
        component="h1" 
        gutterBottom
        sx={{ textAlign: 'center' }}
      >
        Sign In
      </Typography>

      <TextField
        fullWidth
        id="email"
        name="email"
        label="Email Address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onBlur={() => handleFieldBlur('email')}
        error={!!getFieldError('email')}
        helperText={getFieldError('email')}
        disabled={isLoading}
        autoComplete="email"
        autoFocus
        required
        inputProps={{
          'aria-label': 'Email Address',
          'aria-required': 'true',
          'aria-invalid': !!getFieldError('email'),
          'aria-describedby': 'email-helper-text'
        }}
      />

      <TextField
        fullWidth
        id="password"
        name="password"
        label="Password"
        type={showPassword ? 'text' : 'password'}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onBlur={() => handleFieldBlur('password')}
        error={!!getFieldError('password')}
        helperText={getFieldError('password')}
        disabled={isLoading}
        required
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                onClick={() => setShowPassword(!showPassword)}
                onMouseDown={(e) => e.preventDefault()}
                edge="end"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
        inputProps={{
          'aria-label': 'Password',
          'aria-required': 'true',
          'aria-invalid': !!getFieldError('password'),
          'aria-describedby': 'password-helper-text'
        }}
      />

      <Button
        type="submit"
        fullWidth
        variant="contained"
        color="primary"
        disabled={isLoading || !!getFieldError('email') || !!getFieldError('password')}
        sx={{ mt: 3, mb: 2 }}
        aria-label="Sign in"
      >
        {isLoading ? 'Signing in...' : 'Sign In'}
      </Button>

      {error && (
        <Typography 
          color="error" 
          variant="body2" 
          role="alert" 
          sx={{ mt: 2, textAlign: 'center' }}
        >
          {error.message}
        </Typography>
      )}
    </Box>
  );
};
