import React from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography } from '@mui/material';

import { KlippersShortsListView } from '@/pages/dashboard/dashboard/klippersshort/KlippersShortsList';

const ListShortsPage = () => {
    const { videoid } = useParams<{ videoid: string }>();
    if (!videoid) {
        return (
            <Box sx={{ 
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flex: 1,
                width: '100%',
                height: '100%',
                textAlign: 'center'
            }}>
                <Typography variant="h5" sx={{ mb: 2 }}>Invalid Video ID</Typography>
                <Typography>Please provide a valid video ID in the URL.</Typography>
            </Box>
        );
    }

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            width: '100%',
            height: '100%'
        }}>
            <KlippersShortsListView
                videoId={videoid}
                onClose={() => {}}
                onPublish={() => {}}
                onEdit={() => {}}
                onDownload={() => {}}
            />
        </Box>
    );
};

export default ListShortsPage;
