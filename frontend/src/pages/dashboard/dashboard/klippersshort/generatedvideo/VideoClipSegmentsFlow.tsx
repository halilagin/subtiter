import { Box, Typography } from "@mui/material";    

interface VideoClipSegmentsFlowProps {
  filename?: string;
  segmentCount?: number;
  onSegmentClick?: (index: number) => void;
}

const VideoClipSegmentsFlow = ({ filename, segmentCount = 0, onSegmentClick }: VideoClipSegmentsFlowProps) => {
  // Calculate segment positions and widths
  const calculateSegments = () => {
    if (segmentCount === 0) return [];
    
    const segments = [];
    const segmentWidth = 10; // Fixed width per segment (percentage)
    const totalWidth = 100; // Total progress bar width (percentage)
    
    // Divide progress bar into equal parts and place each segment at the center of each part
    for (let i = 0; i < segmentCount; i++) {
      // Calculate the center of each equal part
      const partWidth = totalWidth / segmentCount;
      const partCenter = (i + 0.5) * partWidth;
      const segmentLeft = partCenter - (segmentWidth / 2);
      
      segments.push({
        left: `${segmentLeft}%`,
        width: `${segmentWidth}%`,
        index: i
      });
    }
    
    return segments;
  };

  const segments = calculateSegments();

  const handleSegmentClick = (index: number) => {
    if (onSegmentClick) {
      onSegmentClick(index);
    }
  };

  return (
    <>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2, width: '100%' }}>
          <Box sx={{ flex: 1, pr: 2 }}>
         
            {/* Progress Bar - Long video with separate short segments */}
            
              <Box sx={{ 
                width: 'calc(100% - 8px)', 
                height: 4, 
                bgcolor: 'rgba(255, 255, 255, 0.3)', 
                borderRadius: 2,
                position: 'relative',
                overflow: 'visible',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                mb: 2
              }}>
                {/* Long video background */}
                <Box sx={{ 
                  position: 'absolute', 
                  top: 0, 
                  left: 0, 
                  width: '100%', 
                  height: '100%', 
                  bgcolor: 'rgba(0, 0, 0, 0.1)', 
                  borderRadius: 2 
                }} />
                
                {/* Short segments - dynamically generated */}
                {segments.map((segment) => (
                  <Box 
                    key={segment.index}
                    onClick={() => handleSegmentClick(segment.index)}
                    sx={{ 
                      position: 'absolute', 
                      top: '10%', 
                      left: segment.left, 
                      width: segment.width, 
                      height: '80%', 
                      bgcolor: '#000000', 
                      borderRadius: 2,
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        bgcolor: '#333333',
                        transform: 'scaleY(1.1)'
                      }
                    }} 
                  />
                ))}

              </Box>
            
          </Box>
        </Box>
    </>
  );
};

export default VideoClipSegmentsFlow;