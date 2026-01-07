
import { useState } from 'react';
import { 
    Box, 
    TextField, 
    Button, 
    Typography, 
    Alert,
    CircularProgress,
    Container,
    Paper
} from '@mui/material';
import { SubscriptionApi } from '@/api/apis';
import { createApiConfiguration } from '@/apiConfig';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';

const ApplyPromotionCode = () => {
    const [promotionCode, setPromotionCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info', text: string } | null>(null);

    const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.toUpperCase().slice(0, 9);
        setPromotionCode(value);
        setMessage(null); // Clear message when user types
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (promotionCode.trim().length !== 9) {
            setMessage({ 
                type: 'error', 
                text: 'Please enter a valid 9-character promotion code' 
            });
            return;
        }

        setLoading(true);
        setMessage(null);

        try {
            const subscriptionApi = new SubscriptionApi(createApiConfiguration());
            const response = await subscriptionApi.applyPromotionCodeApiV1SubscriptionApplyPromotionCodePost({
                body: promotionCode.trim()
            });

            setMessage({ 
                type: 'success', 
                text: 'Promotion code applied successfully! Your account has been updated.' 
            });
            setPromotionCode('');
            
        } catch (error: any) {
            console.error('Error applying promotion code:', error);
            
            if (error.response?.status === 404) {
                setMessage({ 
                    type: 'error', 
                    text: 'Promotion code not found or is not active. Please check the code and try again.' 
                });
            } else if (error.response?.status === 451) {
                setMessage({ 
                    type: 'error', 
                    text: 'You already have an active promotion code. You cannot apply another one.' 
                });
            } else {
                setMessage({ 
                    type: 'error', 
                    text: 'An error occurred while applying the promotion code. Please try again later.' 
                });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 4 }}>
            <Paper 
                elevation={0} 
                sx={{ 
                    p: 4, 
                    borderRadius: 3,
                    border: '1px solid #e0e0e0',
                    backgroundColor: '#fafafa'
                }}
            >
                <Box sx={{ textAlign: 'center', mb: 4 }}>
                    <CardGiftcardIcon sx={{ fontSize: 60, color: '#5a4eff', mb: 2 }} />
                    <Typography 
                        variant="h4" 
                        sx={{ 
                            fontWeight: 700, 
                            color: '#2f2e2c',
                            mb: 1
                        }}
                    >
                        Apply Promotion Code
                    </Typography>
                    <Typography 
                        variant="body1" 
                        sx={{ 
                            color: '#808080',
                            fontSize: '0.95rem'
                        }}
                    >
                        Enter your 9-character promotion code to unlock special benefits
                    </Typography>
                </Box>

                <form onSubmit={handleSubmit}>
                    <Box sx={{ mb: 3 }}>
                        <TextField
                            fullWidth
                            label="Promotion Code"
                            variant="outlined"
                            value={promotionCode}
                            onChange={handleCodeChange}
                            placeholder="XXXXXXXXX"
                            disabled={loading}
                            inputProps={{
                                maxLength: 9,
                                style: { 
                                    textTransform: 'uppercase',
                                    letterSpacing: '0.1em',
                                    fontSize: '1.1rem',
                                    fontWeight: 600
                                }
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    backgroundColor: 'white',
                                    '&:hover fieldset': {
                                        borderColor: '#5a4eff',
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: '#5a4eff',
                                    },
                                },
                            }}
                        />
                        <Typography 
                            variant="caption" 
                            sx={{ 
                                color: '#808080',
                                mt: 1,
                                display: 'block'
                            }}
                        >
                            {promotionCode.length}/9 characters
                        </Typography>
                    </Box>

                    {message && (
                        <Alert 
                            severity={message.type} 
                            sx={{ mb: 3 }}
                        >
                            {message.text}
                        </Alert>
                    )}

                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        disabled={loading || promotionCode.length !== 9}
                        sx={{
                            py: 1.5,
                            fontSize: '1rem',
                            fontWeight: 600,
                            backgroundColor: '#5a4eff',
                            textTransform: 'none',
                            borderRadius: 2,
                            '&:hover': {
                                backgroundColor: '#4839cc',
                            },
                            '&:disabled': {
                                backgroundColor: '#cccccc',
                            },
                        }}
                    >
                        {loading ? (
                            <CircularProgress size={24} sx={{ color: 'white' }} />
                        ) : (
                            'Apply Code'
                        )}
                    </Button>
                </form>

                <Box sx={{ mt: 3, textAlign: 'center' }}>
                    <Typography 
                        variant="body2" 
                        sx={{ 
                            color: '#808080',
                            fontSize: '0.85rem'
                        }}
                    >
                        Don't have a promotion code? Check your email or contact support.
                    </Typography>
                </Box>
            </Paper>
        </Container>
    );
};

export default ApplyPromotionCode;