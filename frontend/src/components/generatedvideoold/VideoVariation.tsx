import React from 'react';
import { Grid } from '@mui/material';
import VideoPreview from './VideoPreview';
import ActionButtons from '../ActionButtons';
import VideoNote from './VideoNote';
import VideoInfo from './VideoInfo';

interface SubtiteRhortModel {
  id: number;
  title: string;
  viralityScore: number;
  transcript: string;
  viralityDescription: string;
  previewUrl: string;
}

interface VideoVariationProps {
  short: SubtiteRhortModel;
  onPublish: () => void;
  onEdit: () => void;
  onDownload: () => void;
}

const VideoVariation: React.FC<VideoVariationProps> = ({ short, onPublish, onEdit, onDownload }) => {
  return (
    <Grid container spacing={8}>
      {/* Video Preview Column */}
      <Grid item xs={12} lg={4}>
        <VideoPreview previewUrl={short.previewUrl} />
        <ActionButtons 
          onPublish={onPublish} 
          onEdit={onEdit} 
          onDownload={onDownload}
          videoTitle={short.title}
          videoUrl={short.previewUrl}
        />
        <VideoNote />
      </Grid>

      {/* Content Column */}
      <Grid item xs={12} lg={8}>
        <VideoInfo 
          title={short.title}
          viralityScore={short.viralityScore}
          viralityDescription={short.viralityDescription}
          transcript={short.transcript}
          id={short.id}
        />
      </Grid>
    </Grid>
  );
};

export default VideoVariation; 