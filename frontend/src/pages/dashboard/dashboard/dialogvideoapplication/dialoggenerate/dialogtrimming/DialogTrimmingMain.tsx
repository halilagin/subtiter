import { Box, Typography } from "@mui/material";
import TrimmingSelection from "./TrimmingSelection";
import { VideoItem } from "../../../generatedvideolist/model/GeneratedVideoListModel";

interface DialogTrimmingMainProps {
    video: VideoItem;
}

const DialogTrimmingMain = ({ video }: DialogTrimmingMainProps) => {
    return (
        <Box>
            <Typography variant="h6">Trimming</Typography>
            <TrimmingSelection
                videoId={video.videoId || ''}
                video={video}
            />
        </Box>
    );
};

export default DialogTrimmingMain;

