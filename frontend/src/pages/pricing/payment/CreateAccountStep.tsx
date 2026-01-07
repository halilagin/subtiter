import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Alert,
  Link,
  InputAdornment,
  IconButton
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

interface CreateAccountStepProps {
  onSuccess: () => void;
  planDetails?: {
    name: string;
    price: number;
  };
}

const CreateAccountStep: React.FC<CreateAccountStepProps> = ({ onSuccess, planDetails }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible);
  };

  const toggleConfirmPasswordVisibility = () => {
    setIsConfirmPasswordVisible(!isConfirmPasswordVisible);
  };

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setSuccessMessage('Account created successfully! Proceeding to payment...');
      
      // Wait a moment to show success message
      setTimeout(() => {
        onSuccess();
      }, 1000);
      
    } catch (error) {
      setErrors({ submit: 'Failed to create account. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (successMessage) {
    return (
      <Paper 
        elevation={0}
        variant="outlined"
        sx={{ 
          p: 4, 
          borderRadius: 3,
          bgcolor: 'white',
          border: '1px solid #e5e7eb',
          boxShadow: 'none',
          textAlign: 'center'
        }}
      >
        <Alert severity="success" sx={{ mb: 2 }}>
          {successMessage}
        </Alert>
      </Paper>
    );
  }

  return (
    <Paper 
      component="form"
      onSubmit={handleSubmit}
      elevation={0}
      variant="outlined"
      sx={{ 
        p: 4, 
        borderRadius: 3,
        bgcolor: 'white',
        border: '1px solid #e5e7eb',
        boxShadow: 'none'
      }}
    >
      {errors.submit && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errors.submit}
        </Alert>
      )}

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {/* First Name */}
        <TextField
          placeholder="First Name"
          name="firstName"
          value={formData.firstName}
          onChange={handleInputChange}
          error={!!errors.firstName}
          helperText={errors.firstName}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '32px',
              fontSize: '0.875rem',
              fontWeight: '400',
              color: '#374151',
              border: '1px solid #d1d5db',
              '&:hover': {
                border: '1px solid #9ca3af'
              },
              '&.Mui-focused': {
                border: '2px solid #5a4eff'
              },
              '& fieldset': {
                borderColor: 'transparent',
                borderWidth: 0
              },
              '& input': {
                paddingLeft: '12px',
                textIndent: '8px'
              }
            },
            '& .MuiInputLabel-root': {
              color: '#9ca3af',
              fontSize: '0.875rem',
              fontWeight: '400',
              left: '12px'
            }
          }}
        />

        {/* Last Name */}
        <TextField
          placeholder="Last Name"
          name="lastName"
          value={formData.lastName}
          onChange={handleInputChange}
          error={!!errors.lastName}
          helperText={errors.lastName}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '32px',
              fontSize: '0.875rem',
              fontWeight: '400',
              color: '#374151',
              border: '1px solid #d1d5db',
              '&:hover': {
                border: '1px solid #9ca3af'
              },
              '&.Mui-focused': {
                border: '2px solid #5a4eff'
              },
              '& fieldset': {
                borderColor: 'transparent',
                borderWidth: 0
              },
              '& input': {
                paddingLeft: '12px',
                textIndent: '8px'
              }
            },
            '& .MuiInputLabel-root': {
              color: '#9ca3af',
              fontSize: '0.875rem',
              fontWeight: '400',
              left: '12px'
            }
          }}
        />

        {/* Email */}
        <TextField
          placeholder="Email Address"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          error={!!errors.email}
          helperText={errors.email}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '32px',
              fontSize: '0.875rem',
              fontWeight: '400',
              color: '#374151',
              border: '1px solid #d1d5db',
              '&:hover': {
                border: '1px solid #9ca3af'
              },
              '&.Mui-focused': {
                border: '2px solid #5a4eff'
              },
              '& fieldset': {
                borderColor: 'transparent',
                borderWidth: 0
              },
              '& input': {
                paddingLeft: '12px',
                textIndent: '8px'
              }
            },
            '& .MuiInputLabel-root': {
              color: '#9ca3af',
              fontSize: '0.875rem',
              fontWeight: '400',
              left: '12px'
            }
          }}
        />

        {/* Password */}
        <TextField
          placeholder="Password"
          name="password"
          type={isPasswordVisible ? 'text' : 'password'}
          value={formData.password}
          onChange={handleInputChange}
          error={!!errors.password}
          helperText={errors.password}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle password visibility"
                  onClick={togglePasswordVisibility}
                  onMouseDown={handleMouseDownPassword}
                  edge="end"
                  sx={{ color: '#6b7280', mr: 0.8 }}
                >
                  {isPasswordVisible ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '32px',
              fontSize: '0.875rem',
              fontWeight: '400',
              color: '#374151',
              border: '1px solid #d1d5db',
              '&:hover': {
                border: '1px solid #9ca3af'
              },
              '&.Mui-focused': {
                border: '2px solid #5a4eff'
              },
              '& fieldset': {
                borderColor: 'transparent',
                borderWidth: 0
              },
              '& input': {
                paddingLeft: '12px',
                textIndent: '8px'
              }
            },
            '& .MuiInputLabel-root': {
              color: '#9ca3af',
              fontSize: '0.875rem',
              fontWeight: '400',
              left: '12px'
            }
          }}
        />

        {/* Confirm Password */}
        <TextField
          placeholder="Confirm Password"
          name="confirmPassword"
          type={isConfirmPasswordVisible ? 'text' : 'password'}
          value={formData.confirmPassword}
          onChange={handleInputChange}
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="toggle confirm password visibility"
                  onClick={toggleConfirmPasswordVisibility}
                  onMouseDown={handleMouseDownPassword}
                  edge="end"
                  sx={{ color: '#6b7280', mr: 0.8 }}
                >
                  {isConfirmPasswordVisible ? <Visibility /> : <VisibilityOff />}
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '32px',
              fontSize: '0.875rem',
              fontWeight: '400',
              color: '#374151',
              border: '1px solid #d1d5db',
              '&:hover': {
                border: '1px solid #9ca3af'
              },
              '&.Mui-focused': {
                border: '2px solid #5a4eff'
              },
              '& fieldset': {
                borderColor: 'transparent',
                borderWidth: 0
              },
              '& input': {
                paddingLeft: '12px',
                textIndent: '8px'
              }
            },
            '& .MuiInputLabel-root': {
              color: '#9ca3af',
              fontSize: '0.875rem',
              fontWeight: '400',
              left: '12px'
            }
          }}
        />

        {/* Submit Button */}
        <Button
          type="submit"
          variant="contained"
          disabled={isLoading}
          sx={{
            mt: 2,
            py: 1.5,
            bgcolor: '#000000',
            color: 'white',
            borderRadius: '32px',
            textTransform: 'none',
            fontSize: '1rem',
            fontWeight: '600',
            fontFamily: "'Inter', sans-serif",
            '&:hover': {
              bgcolor: '#1a1a1a'
            },
            '&:disabled': {
              bgcolor: '#9ca3af'
            }
          }}
        >
          {isLoading ? 'Creating Account...' : 'Create Account & Continue'}
        </Button>

        {/* Login Link */}
        <Typography variant="body2" sx={{ textAlign: 'center', mt: 2, color: '#6b7280' }}>
          Already have an account?{' '}
          <Link component={RouterLink} to="/login" sx={{ color: '#5a4eff', textDecoration: 'none' }}>
            Sign in
          </Link>
        </Typography>
      </Box>
    </Paper>
  );
};

export default CreateAccountStep;
