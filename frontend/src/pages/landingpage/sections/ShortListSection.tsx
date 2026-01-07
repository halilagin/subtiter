import { Container, Box } from '@mui/material';
import { ShortExampleVideoList } from '@/pages/landingpage/hero/ShortExampleVideoList';

const ShortListSection = () => {
  return (
    <Box sx={{ bgcolor: '#f5f5f5' }}>
      <Container maxWidth="xl" sx={{ pt: 16, pb: 12 }}>
        <ShortExampleVideoList />
      </Container>
    </Box>
  );
};

export default ShortListSection;

