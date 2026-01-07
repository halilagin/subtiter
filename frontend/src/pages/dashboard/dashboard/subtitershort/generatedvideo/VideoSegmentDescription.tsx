import { SchemaUserSegmentVideo } from "@/api/models/SchemaUserSegmentVideo";
import { Box, Typography } from "@mui/material";



interface VideoSegmentDescriptionProps {
    segment: SchemaUserSegmentVideo;
    isLast?: boolean;
}

export const VideoSegmentTranscript  = ({ segment, isLast = false }: VideoSegmentDescriptionProps) => {
    return (
        <Box sx={{ mb: { xs: isLast ? 4 : 24, lg: 4 }, position: 'relative', zIndex: 3 }}>
          <Typography variant="h6" sx={{ 
            fontWeight: '600', 
            color: '#2f2e2c', 
            mb: 2, 
            fontSize: '1rem', 
            fontFamily: "'Inter', sans-serif" 
          }}>
            Transcript
          </Typography>
          <Box sx={{
            maxHeight: '200px',
            overflow: 'auto',
            border: '1px solid rgba(0, 0, 0, 0.1)',
            borderRadius: '8px',
            p: 2,
            bgcolor: '#f9f9f9',
            position: 'relative',
            zIndex: 3
          }}>
            <Typography variant="body1" sx={{ 
              color: '#6B7280', 
              lineHeight: 1.6, 
              fontSize: '1.1rem', 
              fontWeight: '300', 
              fontFamily: "'Inter', sans-serif" 
            }}>
              {segment.longDescription}
            </Typography>
          </Box>
        </Box>
      );
}



export const VideoSegmentViralityScore  = ({ segment }: VideoSegmentDescriptionProps) => {
    return (
      <Box sx={{ mb: 4 }}>
        <Box sx={{
          bgcolor: 'white',
          p: 3,
          borderRadius: 8,
          border: '1px solid rgba(0, 0, 0, 0.1)'
        }}>
          <Typography variant="h6" sx={{ 
            fontWeight: '600', 
            color: '#2f2e2c', 
            fontSize: '1rem', 
            fontFamily: "'Inter', sans-serif" 
          }}>
             Virality score ({segment.segmentDetails.score}/100)
          </Typography>
          <Typography variant="body1" sx={{ 
            color: '#6B7280', 
            lineHeight: 1.6, 
            fontSize: '1rem', 
            fontWeight: '300', 
            fontFamily: "'Inter', sans-serif" 
          }}>
            {segment.segmentDetails.why}   
          </Typography>
        </Box>
      </Box>
    );
  };

export const VideoSegmentDescriptionComponent = ({segment, isLast = false}: VideoSegmentDescriptionProps) => {
    return (
        <Box sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            maxHeight: 'calc(70vw * 16/9)',
            overflow: 'visible'
          }}>
            <Box sx={{
              flex: 1,
              overflow: 'visible',
              pr: 2,
              pb: { xs: isLast ? 2 : 20, lg: 0 }
            }}>
              <Typography variant="h5" sx={{ fontWeight: '700', color: '#2f2e2c', mb: 3, mt: { xs: -8, lg: 0 }, fontFamily: "'Inter', sans-serif" }}>
                {segment.segmentDetails.title}
              </Typography>
      
              {/* Virality Score */}
              <VideoSegmentViralityScore    
                segment={segment}
              />
      
              {/* Transcript */}
              <VideoSegmentTranscript segment={segment} isLast={isLast} />
            </Box>
          </Box>
    )
}

export const VideoSegmentDescriptionView = ({segment, isLast = false}: VideoSegmentDescriptionProps) => {
    return (
        <>
            <VideoSegmentDescriptionComponent segment={segment} isLast={isLast} />
        </>
    )
}

export default VideoSegmentDescriptionView;