import { SchemaUserSegmentVideo } from "@/api/models/SchemaUserSegmentVideo";
import { Box, Grid, Container } from "@mui/material";
import VideoSegmentPlayerActions from "./generatedvideo/VideoSegmentPlayerActions";
import VideoSegmentDescriptionView from "./generatedvideo/VideoSegmentDescription";
import { VideoSegmentPlayerComponent } from "./generatedvideo/VideoSegmentPlayer";
import VideoClipSegmentsFlow from "./generatedvideo/VideoClipSegmentsFlow";








interface SubtiterShortMainProps {
    segment: SchemaUserSegmentVideo;
    isFirst?: boolean;
    isLast?: boolean;
    index?: number;
}

const SubtiterShortMain = ({segment, isFirst = false, isLast = false, index = 0}: SubtiterShortMainProps) => {
    return (
        <Box 
          id={`short-${index}`}
          sx={{ 
            maxWidth: '1200px', 
            mx: 'auto', 
            width: '100%',
            pt: isFirst ? 4 : 10,
            pb: { xs: isLast ? 2 : 12, lg: 12 },
            px: 3,
            scrollMarginTop: '20px'
          }}>
            <Grid container spacing={8}>
            {/* Video Preview Column */}
            <Grid item xs={12} lg={4} sx={{ position: 'relative', zIndex: 1 }}>
              {/* Video Container */}
              <VideoSegmentPlayerComponent segment={segment} />
              
              {/* Action Buttons */}
              <VideoSegmentPlayerActions 
                segment={segment}
                segmentIndex={index}
                onPublish={() => {}}
                onEdit={() => {}}
                onDownload={() => {}}
              />
            </Grid>

            {/* Content Column */}
            <Grid item xs={12} lg={8} sx={{ position: 'relative', zIndex: 2, mt: { xs: 0, lg: 0 } }}>
              <VideoSegmentDescriptionView segment={segment} isLast={isLast} />
            </Grid>
          </Grid>
        </Box>
    )
}

export default SubtiterShortMain;