import * as React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActionArea from '@mui/material/CardActionArea';
import Chip from '@mui/material/Chip';
import Link from 'next/link';
import { getAllFellowships } from '../../lib/data-fetching';
import { Fellowship } from '../../types/index';

export default async function FellowshipPage() {
  const fellowships = await getAllFellowships();

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50' }}>
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1976d2 0%, #9c27b0 100%)',
          color: 'white',
          py: 8,
          mb: 6,
          borderRadius: '0 0 24px 24px',
        }}
      >
        <Container maxWidth="lg">
          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontWeight: 700,
              textAlign: 'center',
              mb: 2
            }}
          >
            Fellowships
          </Typography>
          <Typography
            variant="h6"
            sx={{
              textAlign: 'center',
              opacity: 0.9,
              maxWidth: '600px',
              margin: '0 auto'
            }}
          >
            Discover and join our fellowship programs designed to foster growth and community
          </Typography>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ pb: 8 }}>
        <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
            Available Programs
          </Typography>
          <Chip
            label={`${fellowships.length} Fellowship${fellowships.length !== 1 ? 's' : ''}`}
            color="primary"
            variant="outlined"
          />
        </Box>

        <Grid container spacing={4}>
          {fellowships.map((fellowship) => (
            <Grid item xs={12} sm={6} md={4} key={fellowship.slug.current}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'all 0.3s ease-in-out',
                  borderRadius: 2,
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 8,
                  },
                }}
              >
                <CardActionArea
                  component={Link}
                  href={`/fellowship/${fellowship.slug.current}`}
                  sx={{ height: '100%' }}
                >
                  <CardContent sx={{ p: 3, height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <Typography
                      variant="h6"
                      component="h3"
                      sx={{
                        fontWeight: 600,
                        mb: 2,
                        flexGrow: 1,
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      {fellowship.fellowship}
                    </Typography>
                    <Box sx={{ mt: 'auto', pt: 2 }}>
                      <Typography
                        variant="body2"
                        color="primary"
                        sx={{
                          fontWeight: 500,
                          textTransform: 'uppercase',
                          fontSize: '0.75rem',
                          letterSpacing: 1
                        }}
                      >
                        Learn More →
                      </Typography>
                    </Box>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>

        {fellowships.length === 0 && (
          <Box
            sx={{
              textAlign: 'center',
              py: 8,
              bgcolor: 'white',
              borderRadius: 2,
              boxShadow: 1
            }}
          >
            <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
              No fellowships available
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Check back later for new fellowship opportunities
            </Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
}