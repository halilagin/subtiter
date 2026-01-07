import { useState, useRef, useLayoutEffect } from "react";
import { Box } from "@mui/material";
import DialogTaskSelection from "../../dashboard/dashboard/dialogvideoapplication/DialogApplicationSelection";
import { VideoItem } from "../../dashboard/dashboard/generatedvideolist/model/GeneratedVideoListModel";
import { VideoAspectRatio, CreatedAt, UpdatedAt } from "@/api/models";
import BerfinSlide2Content from "./bertintestcomponents/BerfinSlide2Content";

import { BerfinWheelPicker } from "./bertintestcomponents/BerfinWheelPicker";


const BerfinTest = () => {
    const [dialogOpen, setDialogOpen] = useState(true);
    const [selectedValue, setSelectedValue] = useState("Option 1");
    
    // Picker options
    const pickerOptions = ["Option 1", "Option 2", "Option 3", "Option 4", "Option 5", "Option 6", "Option 7", "Option 8"];
    
    // Mock video data for testing
    const mockVideo: VideoItem = {
        videoId: 'test-video-1',
        videoUrl: 'https://via.placeholder.com/400x200/000000/FFFFFF?text=Video+Preview',
        videoThumbnailUrl: 'https://via.placeholder.com/400x200/000000/FFFFFF?text=Video+Preview',
        videoDuration: 1800,
        videoTitle: 'Test Video',
        videoAspectRatio: VideoAspectRatio._916,
        createdAt: {} as CreatedAt,
        updatedAt: {} as UpdatedAt,
        status: 'completed'
    };

    // Slide2 refs and state
    const videoContainerRef = useRef<HTMLDivElement>(null);
    const [rectanglePositions, setRectanglePositions] = useState<{ top: number; left: number }[]>([]);

    useLayoutEffect(() => {
        if (videoContainerRef.current) {
            const { offsetWidth, offsetHeight } = videoContainerRef.current;
            setRectanglePositions([
                { top: offsetHeight * 0.15, left: offsetWidth * 0.12 },
                { top: offsetHeight * 0.15, left: offsetWidth * 0.70 },
            ]);
        }
    }, []);

    // Common styles for Before/After labels
    const labelBoxStyle = {
        bgcolor: 'white',
        color: '#000000',
        px: 3,
        py: 0.9,
        borderRadius: 2,
        display: 'inline-block',
        fontFamily: "'Inter', sans-serif",
        fontWeight: '600',
        fontSize: '0.9rem',
        minWidth: '85px',
        textAlign: 'center'
    };

    return (
        <Box 
            sx={{ 
                bgcolor: '#f4f0e7', 
                width: '100vw',
                height: '100vh', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                overflow: 'hidden',
                position: 'fixed',
                top: 0,
                left: 0,
            }}
        >
            {/* Slide2 Content */}
            <Box sx={{ 
                bgcolor: 'transparent', 
                borderRadius: 3,
                maxWidth: '1200px',
                width: '100%'
            }}>
                {/* <BerfinSlide2Content 
                    videoContainerRef={videoContainerRef}
                    rectanglePositions={rectanglePositions}
                    labelBoxStyle={labelBoxStyle}
                /> */}
            </Box>


            {/* iOS-style Wheel Picker */}
            <Box sx={{ position: 'fixed', bottom: 20, right: 20, bgcolor: 'white', p: 2, borderRadius: 2, boxShadow: 3, minWidth: 250 }}>
                <BerfinWheelPicker
                    options={pickerOptions}
                    value={selectedValue}
                    onChange={setSelectedValue}
                />
            </Box>

        </Box>
    )
}

export default BerfinTest;

