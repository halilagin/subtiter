import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AppConfig from '@/AppConfig';
import { useGoogleLogin, TokenResponse } from '@react-oauth/google';
import FacebookLogin from '@greatsumini/react-facebook-login';
import { AuthApi } from '@/api';
import { createApiConfiguration } from '@/apiConfig';

interface SocialMediaLoginComponentProps {
    onError: (error: string) => void;
    onLoading: (loading: boolean) => void;
}

const SocialMediaLoginComponent = ({ onError, onLoading }: SocialMediaLoginComponentProps) => {
    const navigate = useNavigate();

    const handleGoogleLoginSuccess = async (tokenResponse: Omit<TokenResponse, 'error' | 'error_description' | 'error_uri'>) => {
        try {
            console.log('Google login successful:', tokenResponse);
            onLoading(true);
            onError('');
    
            if (!tokenResponse.access_token) {
                throw new Error('Google login failed - no access token');
            }
    
            const authApi = new AuthApi(createApiConfiguration());
            
            const data = await authApi.verifyGoogleTokenApiV1AuthGoogleVerifyTokenPost({
                requestBody: {
                    access_token: tokenResponse.access_token
                }
            });
    
            if (!data.accessToken) {
                throw new Error('No access token received from backend');
            }
    
            localStorage.setItem('access_token', data.accessToken);
            localStorage.setItem('token_type', data.tokenType);
            
            navigate('/in/dashboard');
        } catch (err: any) {
            const errorMessage = err.response?.data?.detail || err.message || 'An error occurred during Google login';
            onError(errorMessage);
        } finally {
            onLoading(false);
        }
    };

    const login = useGoogleLogin({
        onSuccess: handleGoogleLoginSuccess,
        onError: (error) => {
            console.error('Google login error:', error);
            onError('Google login was cancelled or failed');
        },
    });

    const handleFacebookLoginSuccess = async (response: any) => {
        try {
            console.log('Facebook login initiated', response);
            onLoading(true);
            onError('');

            if (!response.accessToken) {
                throw new Error('Facebook login failed');
            }

            console.log('Sending access token to backend...');
            const authApi = new AuthApi(createApiConfiguration());
            
            const data = await authApi.verifyFacebookTokenApiV1AuthFacebookVerifyTokenPost({
                facebookTokenRequest: {
                    accessToken: response.accessToken
                }
            });

            console.log('Backend response:', data);

            localStorage.setItem('access_token', data.accessToken);
            localStorage.setItem('token_type', data.tokenType);
            console.log('Login successful, navigating to dashboard');

            navigate('/in/dashboard');
        } catch (err: any) {
            console.error('Facebook login error:', err);
            onError(err.message || 'An error occurred during Facebook login');
        } finally {
            onLoading(false);
        }
    };

    const handleFacebookLoginError = (error: any) => {
        console.error('Facebook login error:', error);
        onError('Facebook login failed');
    };

    return (
        <>
            <Box
              onClick={() => login()}
              sx={{
                mb: 2,
                position: 'relative',
                py: 1.5,
                bgcolor: 'white',
                color: '#1f2937',
                borderRadius: '32px',
                textTransform: 'none',
                fontSize: '1rem',
                fontWeight: '600',
                fontFamily: "'Inter', sans-serif",
                border: '1px solid #e5e7eb',
                boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                transition: 'all 0.2s ease-in-out',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 2,
                overflow: 'hidden',
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: '#f9fafb',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  transform: 'translateY(-1px)',
                  border: '1px solid #d1d5db',
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: '-100%',
                  width: '100%',
                  height: '100%',
                  background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)',
                  transition: 'left 0.5s',
                },
              }}
            >
              <Box
                component="svg"
                sx={{
                  width: 20,
                  height: 20,
                  flexShrink: 0,
                }}
                viewBox="0 0 24 24"
              >
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </Box>
              <Box component="span" sx={{ position: 'relative', zIndex: 1 }}>
                Continue with Google
              </Box>
            </Box>

            <Box 
              sx={{ 
                mb: 2, 
                position: 'relative',
                cursor: 'pointer',
              }}
            >
              {/* Cursor overlay - ensures pointer cursor everywhere */}
              <Box
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '48px',
                  cursor: 'pointer !important',
                  zIndex: 2,
                  pointerEvents: 'none',
                }}
              />
              
              {/* Hidden Facebook Login Button */}
              <Box 
                sx={{ 
                  position: 'absolute',
                  opacity: 0,
                  pointerEvents: 'auto',
                  width: '100%',
                  height: '48px',
                  top: 0,
                  left: 0,
                  zIndex: 1,
                  '& > div': {
                    width: '100% !important',
                    height: '48px !important',
                  },
                  '& button': {
                    width: '100% !important',
                    height: '48px !important',
                  }
                }}
              >
                <FacebookLogin
                  appId={AppConfig.facebookAppId}
                  fields="name,email"
                  scope="public_profile,email"
                  onSuccess={handleFacebookLoginSuccess}
                  onFail={handleFacebookLoginError}
                />
              </Box>
              
              {/* Custom Fancy Facebook Button (Visual Only) */}
              <Box
                sx={{
                  position: 'relative',
                  zIndex: 0,
                  py: 1.5,
                  bgcolor: '#1877F2',
                  color: 'white',
                  borderRadius: '32px',
                  textTransform: 'none',
                  fontSize: '1rem',
                  fontWeight: '600',
                  fontFamily: "'Inter', sans-serif",
                  border: 'none',
                  boxShadow: '0 2px 4px 0 rgba(24, 119, 242, 0.3)',
                  transition: 'all 0.2s ease-in-out',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 2,
                  overflow: 'hidden',
                  pointerEvents: 'none',
                  '&:hover': {
                    bgcolor: '#166FE5',
                    boxShadow: '0 4px 8px 0 rgba(24, 119, 242, 0.4)',
                    transform: 'translateY(-1px)',
                  },
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: '-100%',
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
                    transition: 'left 0.5s',
                  },
                }}
              >
                <Box
                  component="svg"
                  sx={{
                    width: 20,
                    height: 20,
                    flexShrink: 0,
                  }}
                  viewBox="0 0 24 24"
                  fill="white"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </Box>
                <Box component="span" sx={{ position: 'relative', zIndex: 1 }}>
                  Continue with Facebook
                </Box>
              </Box>
            </Box>
        </>
    );
};

export default SocialMediaLoginComponent;