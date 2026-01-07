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
import { AuthApi } from '@/api';
import { createApiConfiguration } from '@/apiConfig';
import SocialMediaLoginComponent from '@/components/SocialMediaLoginComponent';
import './CreateAccountForm.css';

interface CreateAccountFormProps {
  onSuccess?: () => void;
}

const CreateAccountForm: React.FC<CreateAccountFormProps> = ({ onSuccess }) => {
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
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (formData.password !== formData.confirmPassword) {
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

  const handleSubmit = async () => {
    // if (!validateForm()) {
    //   return;
    // }

    setIsLoading(true);
    
    try {
      const authApi = new AuthApi(createApiConfiguration());
      
      await authApi.registerApiV1AuthRegisterPost({
        userRegister: {
          email: formData.email,
          name: formData.firstName + " " + formData.lastName,
          password: formData.password,
          subscriptionPlan: "no_plan"
        }
      });
      
      setSuccessMessage('Account created successfully! You can now log in.');
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        confirmPassword: ''
      });
    } catch (error: any) {
      console.error('Registration error:', error);
      // Handle 422 - user already exists
      if (error?.response?.status === 422) {
        console.log('User already exists');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (successMessage) {
    return (
      <Box className="success-container">
        <Typography variant="h4" className="success-title">
          Account Created!
        </Typography>
        <Typography variant="body1" className="success-message">
          {successMessage}
        </Typography>
        <Button
          component={RouterLink}
          to="/login"
          variant="contained"
          className="success-button"
        >
          Go to Login
        </Button>
      </Box>
    );
  }

  return (
    <Box 
      className="create-account-form"
    >
      <Typography variant="h4" className="form-icon">
        ✦
      </Typography>
      <Typography variant="h4" component="h1" className="form-title">
        Create Account
      </Typography>

      <Typography variant="body1" className="form-subtitle">
        Join Subtiter and start creating amazing content
      </Typography>

      <Box sx={{ mb: 3 }}>
        <SocialMediaLoginComponent 
          onError={(error) => {
            setErrors(prev => ({ ...prev, general: error }));
          }}
          onLoading={setIsLoading}
        />
      </Box>

      {errors.general && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errors.general}
        </Alert>
      )}

      <Box className="form-fields">
         <TextField
           fullWidth
           name="firstName"
           placeholder="First Name*"
           value={formData.firstName}
           onChange={handleInputChange}
           error={!!errors.firstName}
           helperText={errors.firstName}
           variant="outlined"
           className="custom-textfield"
        />

         <TextField
           fullWidth
           name="lastName"
           placeholder="Last Name*"
          value={formData.lastName}
          onChange={handleInputChange}
          error={!!errors.lastName}
          helperText={errors.lastName}
          variant="outlined"
          className="custom-textfield"
        />

         <TextField
           fullWidth
           name="email"
           placeholder="Email Address*"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          error={!!errors.email}
          helperText={errors.email}
          variant="outlined"
          className="custom-textfield"
        />

         <TextField
           fullWidth
           name="password"
           placeholder="Password*"
          type={isPasswordVisible ? 'text' : 'password'}
          value={formData.password}
          onChange={handleInputChange}
          error={!!errors.password}
          helperText={errors.password}
          variant="outlined"
          className="custom-textfield"
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
        />

         <TextField
           fullWidth
           name="confirmPassword"
           placeholder="Confirm Password*"
          type={isConfirmPasswordVisible ? 'text' : 'password'}
          value={formData.confirmPassword}
          onChange={handleInputChange}
          error={!!errors.confirmPassword}
          helperText={errors.confirmPassword}
          variant="outlined"
          className="custom-textfield"
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
        />
      </Box>

      <Button 
        fullWidth 
        variant="contained" 
        disabled={isLoading}
        onClick={handleSubmit}
        className="submit-button"
      >
        {isLoading ? 'Creating Account...' : 'Create Account'}
      </Button>

      <Box className="footer-text">
        <Typography variant="body2">
          Already have an account?{' '}
          <Link 
            component={RouterLink} 
            to="/login"
            className="footer-link"
          >
            Sign in
          </Link>
        </Typography>
      </Box>
    </Box>
  );
};

export default CreateAccountForm;
