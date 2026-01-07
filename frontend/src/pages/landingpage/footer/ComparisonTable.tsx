import React from 'react';
import {
  Box,
  Container,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import { CheckCircle, Cancel as CancelIcon } from '@mui/icons-material';
import { comparisonData } from './comparisonData';

interface ComparisonTableProps {
  selectedAlternative: string | null;
}

const ComparisonTable: React.FC<ComparisonTableProps> = ({ selectedAlternative }) => {
  if (!selectedAlternative) return null;

  return (
    <Box sx={{ bgcolor: '#f5f5f5', py: 12 }}>
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 6, maxWidth: '900px', mx: 'auto' }}>
          <Typography 
            variant="h3" 
            sx={{ 
              fontWeight: '700', 
              mb: 3, 
              lineHeight: 1.3, 
              color: '#000000',
              fontFamily: "'Kelson Sans', 'Inter', sans-serif"
            }}
          >
            Subtiter vs {comparisonData[selectedAlternative as keyof typeof comparisonData]?.name}
          </Typography>
          <Typography 
            variant="h6" 
            sx={{ 
              color: '#000000', 
              lineHeight: 1.6, 
              fontWeight: '300',
              fontFamily: "'Kelson Sans', 'Inter', sans-serif"
            }}
          >
            See why creators choose Subtiter over {comparisonData[selectedAlternative as keyof typeof comparisonData]?.name}
          </Typography>
        </Box>
        <TableContainer component={Paper} elevation={0} sx={{
          bgcolor: '#ffffff',
          borderRadius: 3,
          border: '1px solid #e5e7eb',
          overflow: 'hidden'
        }}>
          <Table sx={{ '& .MuiTableCell-root': { borderBottom: 'none' } }}>
            <TableHead>
              <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                <TableCell sx={{ color: '#000000', fontWeight: '600', fontSize: '1.1rem' }}>
                  Feature
                </TableCell>
                <TableCell sx={{ color: '#000000', fontWeight: '600', textAlign: 'center', fontSize: '1.1rem' }}>
                  Subtiter
                </TableCell>
                <TableCell sx={{ color: '#000000', fontWeight: '600', textAlign: 'center', fontSize: '1.1rem' }}>
                  {comparisonData[selectedAlternative as keyof typeof comparisonData]?.name}
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {comparisonData[selectedAlternative as keyof typeof comparisonData]?.features.map((row, index) => (
                <TableRow key={index}>
                  <TableCell sx={{ color: '#000000' }}>
                    <Box>
                      <Typography variant="body1" sx={{ fontWeight: '500', mb: 0.5 }}>
                        {row.feature}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#000000', fontSize: '0.8rem' }}>
                        {row.description}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>
                    {typeof row.subtiter === 'boolean' ? (
                      row.subtiter ? (
                        <CheckCircle sx={{ color: '#132436', fontSize: 24 }} />
                      ) : (
                        <CancelIcon sx={{ color: '#ef4444', fontSize: 24 }} />
                      )
                    ) : (
                      <Typography variant="body2" sx={{ color: '#132436', fontWeight: 600 }}>
                        {row.subtiter}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center' }}>
                    {typeof row.alternative === 'boolean' ? (
                      row.alternative ? (
                        <CheckCircle sx={{ color: '#132436', fontSize: 24 }} />
                      ) : (
                        <CancelIcon sx={{ color: '#ef4444', fontSize: 24 }} />
                      )
                    ) : (
                      <Typography variant="body2" sx={{ color: '#000000', fontWeight: 500 }}>
                        {row.alternative}
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Container>
    </Box>
  );
};

export default ComparisonTable; 