import { Box, Typography } from "@mui/material";
import ShortSubtitleSelection from "../dialogshorts/ShortSubtitleSelection";
import SubtitlingSelection from "./SubtitlingSelection";
import { VideoItem } from "../../../generatedvideolist/model/GeneratedVideoListModel";

interface DialogSubtitlingMainProps {
    video: VideoItem;
}

const DialogSubtitlingMain = ({ video }: DialogSubtitlingMainProps) => {

    const handleSubtitleDefinitionSelect = (subtitleDefinitionId: string) => {
        console.log('subtitleDefinitionId', subtitleDefinitionId);
    };
    
    const handleSubtitleCapitalizationChange = (style: 'default' | 'uppercase' | 'lowercase' | 'capitalize_first_char_in_words') => {
        console.log('style', style);
    };
    
    const handleSubtitlePositionChange = (position: 'top' | 'center' | 'bottom') => {
        console.log('position', position);
    };

    return (
        <Box  >
            <Typography variant="h6">Subtitling</Typography>
            <SubtitlingSelection
                                videoId={video.videoId || ''}
                                onSubtitleDefinitionSelect={handleSubtitleDefinitionSelect}
                                onCapitalizationChange={handleSubtitleCapitalizationChange}
                                onPositionChange={handleSubtitlePositionChange}
                            />
        </Box>
    );
};

export default DialogSubtitlingMain;