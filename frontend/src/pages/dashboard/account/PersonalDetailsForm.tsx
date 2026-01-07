import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Paper,
  Grid,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import { Edit, CheckCircle, Cancel, Delete } from '@mui/icons-material';
import { createApiConfiguration } from '@/apiConfig';
import { SubscriptionApi } from '@/api/apis/SubscriptionApi';

const PersonalDetailsForm = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1 (555) 123-4567'
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    setIsEditing(false);
    // Handle save logic here
    console.log('Saving:', formData);
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data if needed
  };

  const handleDeleteAccount = () => {
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    // Handle account deletion logic here
    console.log('Deleting account...');
    try {
      const subscriptionApi = new SubscriptionApi(createApiConfiguration());
      const data = await subscriptionApi.deleteAccountApiV1SubscriptionDeleteAccountPost({});
      console.log("Delete account API response:", data);
      setDeleteDialogOpen(false);
      setTimeout(() => {
        localStorage.clear();
        window.location.href = '/login';
      }, 1000);
    } catch (error) {
      console.error("Error deleting account:", error);
      // Handle error (e.g., show error message to user) 
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
  };

  return (
    <Paper sx={{ 
      borderRadius: 8, 
      overflow: 'hidden',
      boxShadow: 'none',
      border: '1px solid rgba(0, 0, 0, 0.1)',
      bgcolor: 'white'
    }}>
      <Box sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
          <Typography variant="h6" sx={{ 
            fontWeight: '600', 
            color: '#2f2e2c',
            fontFamily: "'Inter', sans-serif"
          }}>
            Personal Information
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            {!isEditing ? (
              <Button
                startIcon={<Edit />}
                onClick={() => setIsEditing(true)}
                sx={{ 
                  borderRadius: 12,
                  px: 2,
                  py: 1,
                  bgcolor: '#000000',
                  color: 'white',
                  fontWeight: '600',
                  textTransform: 'none',
                  fontSize: '0.875rem',
                  boxShadow: 'none',
                  '&:hover': {
                    bgcolor: '#000000',
                    boxShadow: 'none',
                  }
                }}
              >
                Edit
              </Button>
            ) : (
              <>
                <Button
                  startIcon={<CheckCircle />}
                  onClick={handleSave}
                  sx={{ 
                    borderRadius: 12,
                    px: 2,
                    py: 1,
                    bgcolor: '#000000',
                    color: 'white',
                    fontWeight: '600',
                    textTransform: 'none',
                    fontSize: '0.875rem',
                    boxShadow: 'none',
                    '&:hover': {
                      bgcolor: '#000000',
                      boxShadow: 'none',
                    }
                  }}
                >
                  Save
                </Button>
                <Button
                  startIcon={<Cancel />}
                  onClick={handleCancel}
                  sx={{ 
                    borderRadius: 12,
                    px: 2,
                    py: 1,
                    bgcolor: '#f5f5f5',
                    color: '#6b7280',
                    fontWeight: '600',
                    textTransform: 'none',
                    fontSize: '0.875rem',
                    boxShadow: 'none',
                    '&:hover': {
                      bgcolor: '#e5e7eb',
                      boxShadow: 'none',
                    }
                  }}
                >
                  Cancel
                </Button>
              </>
            )}
            <Button
              startIcon={<Delete />}
              onClick={handleDeleteAccount}
              sx={{ 
                borderRadius: 12,
                px: 2,
                py: 1,
                bgcolor: '#000000',
                color: 'white',
                fontWeight: '600',
                textTransform: 'none',
                fontSize: '0.875rem',
                boxShadow: 'none',
                '&:hover': {
                  bgcolor: '#000000',
                  boxShadow: 'none',
                }
              }}
            >
              Delete Account
            </Button>
          </Box>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="First Name"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              disabled={!isEditing}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 12,
                  '& fieldset': {
                    borderColor: 'rgba(0, 0, 0, 0.1)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(0, 0, 0, 0.2)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#e2f4a6',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#6b7280',
                  fontFamily: "'Inter', sans-serif"
                },
                '& .MuiInputBase-input': {
                  color: '#2f2e2c',
                  fontFamily: "'Inter', sans-serif"
                }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Last Name"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              disabled={!isEditing}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 12,
                  '& fieldset': {
                    borderColor: 'rgba(0, 0, 0, 0.1)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(0, 0, 0, 0.2)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#e2f4a6',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#6b7280',
                  fontFamily: "'Inter', sans-serif"
                },
                '& .MuiInputBase-input': {
                  color: '#2f2e2c',
                  fontFamily: "'Inter', sans-serif"
                }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              disabled={!isEditing}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 12,
                  '& fieldset': {
                    borderColor: 'rgba(0, 0, 0, 0.1)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(0, 0, 0, 0.2)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#e2f4a6',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#6b7280',
                  fontFamily: "'Inter', sans-serif"
                },
                '& .MuiInputBase-input': {
                  color: '#2f2e2c',
                  fontFamily: "'Inter', sans-serif"
                }
              }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Phone"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              disabled={!isEditing}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 12,
                  '& fieldset': {
                    borderColor: 'rgba(0, 0, 0, 0.1)',
                  },
                  '&:hover fieldset': {
                    borderColor: 'rgba(0, 0, 0, 0.2)',
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#e2f4a6',
                  },
                },
                '& .MuiInputLabel-root': {
                  color: '#6b7280',
                  fontFamily: "'Inter', sans-serif"
                },
                '& .MuiInputBase-input': {
                  color: '#2f2e2c',
                  fontFamily: "'Inter', sans-serif"
                }
              }}
            />
          </Grid>
        </Grid>
      </Box>

      <Dialog
        open={deleteDialogOpen}
        onClose={handleCancelDelete}
        aria-labelledby="delete-account-dialog-title"
        aria-describedby="delete-account-dialog-description"
      >
        <DialogTitle id="delete-account-dialog-title" sx={{ 
          fontWeight: '600',
          fontFamily: "'Inter', sans-serif",
          color: '#2f2e2c'
        }}>
          Delete Account
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-account-dialog-description" sx={{ 
            fontFamily: "'Inter', sans-serif",
            color: '#6b7280',
            fontSize: '0.9375rem'
          }}>
            Are you sure you want to delete your account? This action will permanently delete all your videos, cancel your active subscription, and remove all your account data. This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button
            onClick={handleCancelDelete}
            sx={{
              borderRadius: 12,
              px: 2,
              py: 1,
              bgcolor: '#f5f5f5',
              color: '#6b7280',
              fontWeight: '600',
              textTransform: 'none',
              fontSize: '0.875rem',
              boxShadow: 'none',
              '&:hover': {
                bgcolor: '#e5e7eb',
                boxShadow: 'none',
              }
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDelete}
            autoFocus
            startIcon={<Delete />}
            sx={{
              borderRadius: 12,
              px: 2,
              py: 1,
              bgcolor: '#d32f2f',
              color: 'white',
              fontWeight: '600',
              textTransform: 'none',
              fontSize: '0.875rem',
              boxShadow: 'none',
              '&:hover': {
                bgcolor: '#c62828',
                boxShadow: 'none',
              }
            }}
          >
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default PersonalDetailsForm; 