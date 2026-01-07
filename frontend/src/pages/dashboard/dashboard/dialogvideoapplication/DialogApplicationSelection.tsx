import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import { useState, useEffect } from "react";
import GenerateShortsTaskCard from "./tasktypes/GenerateShortsTaskCard";
import TrimTaskCard from "./tasktypes/TrimTaskCard";
import GenerateVLogTaskCard from "./tasktypes/GenerateVLogTaskCard";
import VoiceIOverTaskCard from "./tasktypes/VoiceIOverTaskCard";
import GenerateSubtitleTaskCard from "./tasktypes/GenerateSubtitleTaskCard";
import PodcastTemplatesTaskCard from "./tasktypes/PodcastTemplatesTaskCard";
import DialogContent from "@mui/material/DialogContent";
import { Box, Grid, IconButton, Typography, Breadcrumbs, Link } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import { VideoItem } from "../generatedvideolist/model/GeneratedVideoListModel";
import DialogShortContent from "./dialoggenerate/dialogshorts/DialogShortsContent";
import { VideoProcessingApplication } from "@/api/models/VideoProcessingApplication";
import { ShortConfigJsonInput } from "@/api/models";
import ShortSubtitleSelection from "./dialoggenerate/dialogshorts/ShortSubtitleSelection";
import ShortTrimSection from "./dialoggenerate/dialogshorts/ShortTrimSection";
import PodcastTemplatesSelection from "./tasktypes/PodcastTemplatesSelection";
import DialogSubtitlingMain from "./dialoggenerate/dialogsubtitling/DialogSubtitlingMain";
import { EventType } from "@/events";
import DialogTrimmingMain from "./dialoggenerate/dialogtrimming/DialogTrimmingMain";

interface DialogTaskSelectionProps {
    open: boolean;
    onClose: () => void;
    video: VideoItem;
    onGenerate?: (video: VideoItem, config: ShortConfigJsonInput) => void;
}

const DialogTaskSelection = ({ open, onClose, video, onGenerate }: DialogTaskSelectionProps) => {

    const [selectedTask, setSelectedTask] = useState<VideoProcessingApplication | null>(null);
    const [showGenerateShortDialog, setShowGenerateShortDialog] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [subtitlePosition, setSubtitlePosition] = useState<'top' | 'center' | 'bottom'>('center');


    useEffect(() => {
        const handleGenerationStarted = (event: Event) => {
             const customEvent = event as CustomEvent;
             if (onGenerate && customEvent.detail && customEvent.detail.videoId === video.videoId) {
                 onGenerate(video, customEvent.detail.config);
             }
        };
        window.addEventListener(EventType.GENERATION_STARTED, handleGenerationStarted);
        return () => {
            window.removeEventListener(EventType.GENERATION_STARTED, handleGenerationStarted);
        };
    }, [onGenerate, video]);


    const getTaskLabel = (taskType: string): string => {
        switch (taskType) {
            case VideoProcessingApplication.GenerateShorts:
                return "Generate Shorts";
            case VideoProcessingApplication.ApplyTrim:
                return "Trim Video";
            case VideoProcessingApplication.ApplyVlog:
                return "Generate VLog";
            case VideoProcessingApplication.ApplyVoiceOver:
                return "Voice Over";
            case VideoProcessingApplication.ApplySubtitles:
                return "Generate Subtitle";
            case VideoProcessingApplication.ApplyPodcastTemplate:
                return "Podcast Templates";
            default:
                return "";
        }
    };

    const handleTaskClick = (taskType: VideoProcessingApplication) => {
        setSelectedTask(taskType);
        if (taskType === VideoProcessingApplication.GenerateShorts) {
            setShowGenerateShortDialog(true);
        }
    };

    const handleBackToTasks = () => {
        setSelectedTask(null);
    };

    const handleGenerateShortClicked = () => {
        setIsProcessing(true);
        setIsProcessing(false);
        onClose();
    };

    const handleSubtitlePositionChange = (position: 'top' | 'center' | 'bottom') => {
        setSubtitlePosition(position);
        // Note: Position might need to be added to ShortConfigJson if backend supports it
    };

    const handleTrimChange = (value: number[]) => {
        // Handle trim values - might need to add to config if backend supports it
        console.log('Trim values:', value);
    };

    return (
        <Dialog 
            open={open} 
            onClose={onClose}
            maxWidth={false}
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.12)',
                    maxWidth: '620px !important',
                    width: '620px !important',
                    m: '32px',
                    '@media (max-width: 600px)': {
                        width: 'calc(100% - 64px) !important',
                        maxWidth: 'calc(100% - 64px) !important',
                        m: '32px auto'
                    }
                }
            }}
        >
            <DialogTitle sx={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                pb: 1,
                pt: 3,
                px: 3,
            }}>
                <Box sx={{ flex: 1 }}>
                    {selectedTask && (
                        <Box
                            sx={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                mb: 2,
                            }}
                        >
                            <Breadcrumbs 
                                separator={
                                    <NavigateNextIcon 
                                        fontSize="small" 
                                        sx={{ color: '#6b7280' }}
                                    />
                                }
                                sx={{
                                    '& .MuiBreadcrumbs-separator': {
                                        mx: 1,
                                    }
                                }}
                            >
                                <Link
                                    component="button"
                                    variant="body1"
                                    onClick={handleBackToTasks}
                                    sx={{
                                        color: '#6b7280',
                                        textDecoration: 'none',
                                        fontWeight: 500,
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 0.5,
                                        '&:hover': {
                                            color: '#2f2e2c',
                                            textDecoration: 'underline',
                                            bgcolor: 'transparent',
                                        },
                                        cursor: 'pointer',
                                        transition: 'all 0.2s ease',
                                    }}
                                >
                                    ← All Tasks
                                </Link>
                                <Typography 
                                    variant="body1" 
                                    sx={{ 
                                        color: '#2f2e2c',
                                        fontWeight: 600,
                                    }}
                                >
                                    {getTaskLabel(selectedTask)}
                                </Typography>
                            </Breadcrumbs>
                        </Box>
                    )}
                    <Typography variant="h5" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {selectedTask ? getTaskLabel(selectedTask) : "Select Your Task"}
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        {selectedTask ? "Configure your task settings" : "Choose what you'd like to do with your video"}
                    </Typography>
                </Box>
                <IconButton 
                    onClick={onClose}
                    sx={{ 
                        color: 'text.secondary',
                        '&:hover': { 
                            bgcolor: 'transparent',
                            transform: 'rotate(90deg)',
                            transition: 'transform 0.2s'
                        }
                    }}
                >
                    <CloseIcon />
                </IconButton>
            </DialogTitle>
            <DialogContent sx={{ px: 3, pb: 3 }}>
                {selectedTask == null && (
                    <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={12} sm={6}>
                            <GenerateShortsTaskCard 
                                onClick={() => handleTaskClick(VideoProcessingApplication.GenerateShorts)} 
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <GenerateSubtitleTaskCard 
                                onClick={() => handleTaskClick(VideoProcessingApplication.ApplySubtitles)} 
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TrimTaskCard 
                                onClick={() => handleTaskClick(VideoProcessingApplication.ApplyTrim)} 
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <PodcastTemplatesTaskCard 
                                onClick={() => handleTaskClick(VideoProcessingApplication.ApplyPodcastTemplate)} 
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <GenerateVLogTaskCard 
                                onClick={() => handleTaskClick(VideoProcessingApplication.ApplyVlog)} 
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <VoiceIOverTaskCard 
                                onClick={() => handleTaskClick(VideoProcessingApplication.ApplyVoiceOver)} 
                            />
                        </Grid>
                    </Grid>
                )}

                {selectedTask != null && (
                    <Box sx={{ mt: 2 }}>
                        {selectedTask == VideoProcessingApplication.GenerateShorts && <DialogShortContent video={video}  />}
                        {selectedTask == VideoProcessingApplication.ApplyTrim && (
                            <DialogTrimmingMain video={video} />
                        )}
                        {selectedTask == VideoProcessingApplication.ApplyVlog && <GenerateVLogTaskCard onClick={() => handleTaskClick(VideoProcessingApplication.ApplyVlog)} />}
                        {selectedTask == VideoProcessingApplication.ApplyVoiceOver && <VoiceIOverTaskCard onClick={() => handleTaskClick(VideoProcessingApplication.ApplyVoiceOver)} />}

                        {selectedTask == VideoProcessingApplication.ApplySubtitles && <DialogSubtitlingMain video={video} />}
                        {selectedTask == VideoProcessingApplication.ApplyPodcastTemplate && <PodcastTemplatesSelection />}
                    </Box>
                )}
            </DialogContent>

           
        </Dialog>
    );
};

export default DialogTaskSelection;
