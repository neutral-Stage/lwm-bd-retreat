import React from 'react';
import { Metadata } from 'next';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import { alpha } from '@mui/material/styles';
import GroupIcon from '@mui/icons-material/Group';
import PersonIcon from '@mui/icons-material/Person';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import { getAllFellowships, getFellowshipBySlug, getFellowshipParticipantsBySlug, getAllFellowshipParticipantsBySlug } from '../../../lib/data-fetching';
import SearchableTable from '../../../components/searchableTable';
import { notFound } from 'next/navigation';
import { Participant, Fellowship } from '../../../types/index';

interface FellowshipPageProps {
  params: {
    slug: string;
  };
}

// Generate static params for all fellowships
export async function generateStaticParams() {
  const fellowships = await getAllFellowships();
  return fellowships.map((fellowship) => ({
    slug: fellowship.slug.current,
  }));
}

// Generate metadata for each fellowship page
export async function generateMetadata({ params }: FellowshipPageProps): Promise<Metadata> {
  const fellowship = await getFellowshipBySlug(params.slug);
  
  if (!fellowship) {
    return {
      title: 'Fellowship Not Found',
      description: 'The requested fellowship page could not be found.',
    };
  }

  return {
    title: `${fellowship.fellowship} - LWM BD Retreat`,
    description: `Participant list and information for ${fellowship.fellowship} at Living Waters Ministries Bangladesh Retreat. ${fellowship.description || ''}`.trim(),
    openGraph: {
      title: `${fellowship.fellowship} - LWM BD Retreat`,
      description: `Participant list and information for ${fellowship.fellowship}`,
      type: 'website',
    },
  };
}

// Server component with ISR data fetching
export default async function FellowshipPage({ params }: FellowshipPageProps) {
  const fellowship = await getFellowshipBySlug(params.slug);

  if (!fellowship) {
    notFound();
  }

  let participants: Participant[] = [];
  let allParticipants: Participant[] = [];
  let error: string | null = null;

  try {
    // Server-side data fetching with ISR (revalidates every hour)
    const [fetchedParticipants, fetchedAllParticipants] = await Promise.all([
      getFellowshipParticipantsBySlug(params.slug), // Only present participants
      getAllFellowshipParticipantsBySlug(params.slug) // All participants (present + absent)
    ]);
    participants = Array.isArray(fetchedParticipants) ? fetchedParticipants : [];
    allParticipants = Array.isArray(fetchedAllParticipants) ? fetchedAllParticipants : [];
  } catch (err) {
    console.error('Error fetching participants:', err);
    error = err instanceof Error ? err.message : 'Failed to fetch participants';
    participants = [];
    allParticipants = [];
  }

  const absentCount = allParticipants.length - participants.length;
  const attendanceRate = allParticipants.length > 0 ? Math.round((participants.length / allParticipants.length) * 100) : 0;

  return (
    <Box sx={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      py: 4
    }}>
      <Container maxWidth="xl">
        {/* Header Section */}
        <Card sx={{
          mb: 4,
          background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.3)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <GroupIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
              <Typography
                variant="h3"
                component="h1"
                sx={{
                  fontWeight: 700,
                  background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontSize: { xs: '2rem', md: '3rem' }
                }}
              >
                {fellowship.fellowship}
              </Typography>
            </Box>

            {fellowship.description && (
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{ mb: 3, fontStyle: 'italic' }}
              >
                {fellowship.description}
              </Typography>
            )}

            <Grid container spacing={3}>
              {fellowship.incharge && (
                <Grid item xs={12} sm={6} md={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <SupervisorAccountIcon sx={{ color: 'primary.main', mr: 1 }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">
                        In Charge
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {fellowship.incharge}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              )}

              {fellowship.leaders && (
                <Grid item xs={12} sm={6} md={4}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <PersonIcon sx={{ color: 'primary.main', mr: 1 }} />
                    <Box>
                      <Typography variant="caption" color="text.secondary" display="block">
                        Leaders
                      </Typography>
                      <Typography variant="body1" fontWeight={600}>
                        {fellowship.leaders}
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              )}

              <Grid item xs={12} sm={6} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <LocationOnIcon sx={{ color: 'primary.main', mr: 1 }} />
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Division
                    </Typography>
                    <Typography variant="body1" fontWeight={600}>
                      {fellowship.division}
                    </Typography>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              textAlign: 'center',
              background: 'linear-gradient(135deg, #43a047 0%, #66bb6a 100%)',
              color: 'white',
              boxShadow: '0 4px 20px rgba(67, 160, 71, 0.3)'
            }}>
              <CardContent>
                <Typography variant="h3" fontWeight={700}>
                  {allParticipants?.length || 0}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Total Registered
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              textAlign: 'center',
              background: 'linear-gradient(135deg, #1976d2 0%, #42a5f5 100%)',
              color: 'white',
              boxShadow: '0 4px 20px rgba(25, 118, 210, 0.3)'
            }}>
              <CardContent>
                <Typography variant="h3" fontWeight={700}>
                  {participants?.length || 0}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Present
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              textAlign: 'center',
              background: 'linear-gradient(135deg, #f57c00 0%, #ffb74d 100%)',
              color: 'white',
              boxShadow: '0 4px 20px rgba(245, 124, 0, 0.3)'
            }}>
              <CardContent>
                <Typography variant="h3" fontWeight={700}>
                  {absentCount}
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Absent
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{
              textAlign: 'center',
              background: `linear-gradient(135deg, ${attendanceRate >= 80 ? '#43a047' : attendanceRate >= 60 ? '#f57c00' : '#d32f2f'} 0%, ${attendanceRate >= 80 ? '#66bb6a' : attendanceRate >= 60 ? '#ffb74d' : '#f44336'} 100%)`,
              color: 'white',
              boxShadow: `0 4px 20px rgba(${attendanceRate >= 80 ? '67, 160, 71' : attendanceRate >= 60 ? '245, 124, 0' : '211, 47, 47'}, 0.3)`
            }}>
              <CardContent>
                <Typography variant="h3" fontWeight={700}>
                  {attendanceRate}%
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Attendance Rate
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Participants Table */}
        <Card sx={{
          background: 'rgba(255,255,255,0.95)',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.3)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
        }}>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ p: 3, pb: 0 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Typography variant="h5" fontWeight={600} sx={{ display: 'flex', alignItems: 'center' }}>
                  <GroupIcon sx={{ mr: 1 }} />
                  Participants List
                </Typography>
                <Chip
                  label="Live Data"
                  color="success"
                  variant="outlined"
                  size="small"
                />
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Search and filter participants by name, status, or any field. Export data to Excel for offline use.
              </Typography>
            </Box>

            {error && (
              <Box sx={{ p: 3, pt: 0 }}>
                <Card sx={{ backgroundColor: alpha('#f44336', 0.1), border: '1px solid #f44336' }}>
                  <CardContent>
                    <Typography color="error" sx={{ display: 'flex', alignItems: 'center' }}>
                      ⚠️ Error loading data: {error}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
            )}

            <SearchableTable
              data={allParticipants || []}
              fellowship={fellowship.fellowship}
            />
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

// Enable ISR with hourly revalidation
export const revalidate = 3600; // 1 hour

// Enable dynamic rendering for this route to prevent static generation errors
export const dynamic = 'force-dynamic';