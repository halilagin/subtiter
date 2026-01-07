import { useState } from 'react';
import {    
    Box,
    Typography,
    TextField,
    Button,
    Link,
    InputAdornment,
    IconButton
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { AuthApi } from '@/api';
import { createApiConfiguration } from '@/apiConfig';
import SocialMediaLoginComponent from './SocialMediaLoginComponent';




const LoginComponent = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const handleLogin = async () => {
        try {
            setIsLoading(true);
            setError('');
            
            const authApi = new AuthApi(createApiConfiguration());
            
            const data = await authApi.loginCognitoApiV1AuthLoginAuthproviderPost({
                username: email,
                password: password
            });

            localStorage.setItem('access_token', data.accessToken);
            localStorage.setItem('token_type', data.tokenType);

            navigate('/in/dashboard');
        } catch (err:any) {
            setError(err.message || 'An error occurred during login');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        handleLogin();
    };

    const togglePasswordVisibility = () => {
        setIsPasswordVisible(!isPasswordVisible); // Toggle the visibility state
    };

    const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
        event.preventDefault(); // Prevent blur on click
    };

    return (
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1, width: '100%' }}>
            <SocialMediaLoginComponent 
                onError={setError}
                onLoading={setIsLoading}
            />

            <Typography variant="body2" sx={{ fontWeight: '300', mb: 1, textAlign: 'left', color: '#000000' }}>
              Email address
            </Typography>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Your email address"
              name="email"
              autoComplete="email"
              autoFocus
              sx={{
                mt: 0,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '32px',
                  bgcolor: 'white',
                  backdropFilter: 'blur(15px)',
                  boxShadow: 'none',
                  border: '1px solid #e5e7eb',
                  transition: 'border-color 0.3s ease',
                  '& fieldset': {
                    border: 'none !important',
                    borderWidth: '0 !important',
                    borderColor: 'transparent !important',
                  },
                  '&:hover fieldset': {
                    border: 'none !important',
                    borderWidth: '0 !important',
                    borderColor: 'transparent !important',
                  },
                  '&.Mui-focused fieldset': {
                    border: 'none !important',
                    borderWidth: '0 !important',
                    borderColor: 'transparent !important',
                  },
                  '&:hover': {
                    border: '1px solid #e5e7eb',
                  },
                  '&.Mui-focused': {
                    border: '1px solid #e5e7eb',
                  },
                },
                '& .MuiInputBase-input': {
                  color: '#000000',
                  paddingLeft: '20px',
                  '&::placeholder': {
                    color: '#6b7280',
                    opacity: 1,
                  },
                },
              }}
            />
            <Typography variant="body2" sx={{ fontWeight: '300', mb: 1, mt: 2, textAlign: 'left', color: '#000000' }}>
              Your Password
            </Typography>
                        <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              placeholder="Your password"
              type={isPasswordVisible ? 'text' : 'password'}
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={togglePasswordVisibility}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                        sx={{ color: '#6b7280', mr: 0.8}}
                    >
                      {isPasswordVisible ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                mt: 0,
                '& .MuiOutlinedInput-root': {
                  borderRadius: '32px',
                  bgcolor: 'white',
                  backdropFilter: 'blur(15px)',
                  boxShadow: 'none',
                  border: '1px solid #e5e7eb',
                  transition: 'border-color 0.3s ease',
                  '& fieldset': {
                    border: 'none !important',
                    borderWidth: '0 !important',
                    borderColor: 'transparent !important',
                  },
                  '&:hover fieldset': {
                    border: 'none !important',
                    borderWidth: '0 !important',
                    borderColor: 'transparent !important',
                  },
                  '&.Mui-focused fieldset': {
                    border: 'none !important',
                    borderWidth: '0 !important',
                    borderColor: 'transparent !important',
                  },
                  '&:hover': {
                    border: '1px solid #e5e7eb',
                  },
                  '&.Mui-focused': {
                    border: '1px solid #e5e7eb',
                  },
                },
                '& .MuiInputBase-input': {
                  color: '#000000',
                  paddingLeft: '20px',
                  '&::placeholder': {
                    color: '#6b7280',
                    opacity: 1,
                  },
                },
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 3,
                mb: 1,
                py: 1.5,
                bgcolor: '#000000',
                color: 'white',
                borderRadius: '30px',
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: '700',
                fontFamily: "'Inter', sans-serif",
                boxShadow: 'none',
                '&:hover': {
                  bgcolor: '#000000',
                  boxShadow: 'none',
                },
                '&:focus': {
                  boxShadow: 'none',
                },
              }}
            >
              Sign in
            </Button>

            {error && (
              <Box sx={{ mt: 2, p: 2, bgcolor: '#fee2e2', borderRadius: '8px', border: '1px solid #fecaca' }}>
                <Typography variant="body2" sx={{ color: '#dc2626', textAlign: 'center' }}>
                  {error}
                </Typography>
              </Box>
            )}

            {isLoading && (
              <Box sx={{ mt: 2, textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: '#6b7280' }}>
                  Authenticating...
                </Typography>
              </Box>
            )}

            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Link href="#" variant="body2" sx={{ color: '#94A3B8', textDecoration: 'none' }}>
                Forgot your password?
              </Link>
            </Box>
            <Box sx={{ textAlign: 'center', mt: 1 }}>
              <Typography variant="body2" sx={{ color: '#808080', fontWeight: '300' }}>
                Don't have an account?{' '}
                <Link component={RouterLink} to="/create-account" sx={{ color: '#141414', fontWeight: 600, textDecoration: 'none' }}>
                    Sign Up
                </Link>
              </Typography>
            </Box>
          </Box>
        
    );
};

export default LoginComponent;
