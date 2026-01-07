import { Modal } from "@mui/material";
import { Box } from "@mui/material";
import { IconButton } from "@mui/material";
import { Close } from "@mui/icons-material";
import { Typography } from "@mui/material";
import { Button } from "@mui/material";
import { AutoAwesome } from "@mui/icons-material";
import { useState } from "react";



const GenerateNewShortModal = () => {
    const [openGenerateModal, setOpenGenerateModal] = useState(false);
    const [topicInput, setTopicInput] = useState("");
  return (
    <>
    <Modal
        open={openGenerateModal}
        onClose={() => setOpenGenerateModal(false)}
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', p: 1 }}
      >
        <Box sx={{
          bgcolor: 'white',
          borderRadius: 3,
          boxShadow: 24,
          width: 'calc(100vw - 32px)',
          maxWidth: '700px',
          height: 'calc(100vh - 32px)',
          display: 'flex',
          flexDirection: 'column',
          p: 4,
          position: 'relative',
          overflow: 'hidden',
          outline: 'none',
          '&:focus': {
            outline: 'none',
            boxShadow: 24
          }
        }}>
          {/* Close Button */}
          <IconButton
            onClick={() => setOpenGenerateModal(false)}
            sx={{ 
              position: 'absolute', 
              top: 16, 
              right: 16, 
              zIndex: 2,
              bgcolor: '#F3F4F6',
              color: '#6B7280',
              '&:hover': {
                bgcolor: '#E5E7EB'
              }
            }}
          >
            <Close sx={{ fontSize: 18 }} />
          </IconButton>

          {/* Video Preview */}
          <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            mb: 3
          }}>
            <Box sx={{
              width: '100%',
              maxWidth: 250,
              aspectRatio: '16/9',
              bgcolor: '#374151',
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative'
            }}>
              <Typography color="white" variant="h6">
                Video Preview
              </Typography>
              <Typography 
                sx={{ 
                  position: 'absolute', 
                  bottom: 6, 
                  left: 6, 
                  color: 'white',
                  fontSize: '0.75rem',
                  fontWeight: '500'
                }}
              >
                38:00
              </Typography>
            </Box>
          </Box>

          {/* Main Title */}
          <Typography variant="h5" sx={{ fontWeight: '700', color: '#1F2937', mb: 3, textAlign: 'center' }}>
            New Short about...
          </Typography>

          {/* Input Field */}
          <Box sx={{ mb: 4 }}>
            <input
              type="text"
              placeholder="Write a topic covered in your video..."
              value={topicInput}
              onChange={(e) => setTopicInput(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                fontSize: '14px',
                outline: 'none',
                backgroundColor: 'white'
              }}
              onFocus={(e) => e.target.style.outline = 'none'}
            />
          </Box>

          {/* Topic Suggestions */}
          <Box sx={{ mb: 4, bgcolor: 'rgba(227, 232, 239, 0.3)', borderRadius: 12, p: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: '600', color: '#1F2937', mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
              Topic suggestion
              <AutoAwesome sx={{ fontSize: 16, color: '#1F2937' }} />
            </Typography>
            <Typography variant="body2" sx={{ color: '#6B7280', mb: 2 }}>
              We found great unused topics!
            </Typography>
            
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {[
                "Navigating Relationships in the Dance Community",
                "How Music Influences the Experience of Dancing Tango",
                "The evolution of personal interests: From martial arts to tango",
                "Balancing technique and personal expression in tango",
                "Enhancing the tango community experience",
                "The Importance of Community and Connection in Tango Culture"
              ].map((topic, index) => (
                <Button
                  key={index}
                  variant="outlined"
                  onClick={() => setTopicInput(topic)}
                  startIcon={
                    <Box sx={{
                      width: 40,
                      height: 24,
                      bgcolor: '#374151',
                      borderRadius: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Typography sx={{ color: 'white', fontSize: '0.6rem', fontWeight: '500' }}>
                        {Math.floor(Math.random() * 60) + 1}:{Math.floor(Math.random() * 60).toString().padStart(2, '0')}
                      </Typography>
                    </Box>
                  }
                  sx={{
                    justifyContent: 'flex-start',
                    textAlign: 'left',
                    borderColor: '#E5E7EB',
                    color: '#374151',
                    bgcolor: '#E3E8EF',
                    borderRadius: 12,
                    py: 1,
                    px: 2,
                    textTransform: 'none',
                    fontWeight: '600',
                    fontSize: '0.9rem',
                    '&:hover': {
                      bgcolor: '#E3E8EF',
                      borderColor: '#D1D5DB'
                    }
                  }}
                >
                  {topic}
                </Button>
              ))}
            </Box>
          </Box>

          {/* Generate Button */}
          <Box sx={{ mt: 'auto', pt: 2 }}>
            <Button
              variant="contained"
              fullWidth
              sx={{
                bgcolor: '#1F2937',
                color: 'white',
                borderRadius: 12,
                py: 1.2,
                fontWeight: '600',
                textTransform: 'none',
                fontSize: '1rem',
                '&:hover': {
                  bgcolor: '#111827'
                }
              }}
            >
              Generate
            </Button>
          </Box>
        </Box>
      </Modal>
    </>
  );
};

export default GenerateNewShortModal;