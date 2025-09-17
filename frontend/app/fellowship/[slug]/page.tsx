import React from 'react';
import { Metadata } from 'next';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { getFellowshipParticipants } from '../../../lib/data-fetching';
import { getFellowshipsWithSlugs, getNameFromSlug } from '../../../data/fellowship';
import SearchableTable from '../../../components/searchableTable';
import { notFound } from 'next/navigation';
import { Participant } from '../../../types/index';

interface FellowshipPageProps {
  params: {
    slug: string;
  };
}

// Generate static params for all fellowships
export async function generateStaticParams() {
  const fellowships = getFellowshipsWithSlugs();
  return fellowships.map((fellowship) => ({
    slug: fellowship.slug,
  }));
}

// Generate metadata for each fellowship page
export async function generateMetadata({ params }: FellowshipPageProps): Promise<Metadata> {
  const fellowshipName = getNameFromSlug(params.slug);
  
  if (!fellowshipName) {
    return {
      title: 'Fellowship Not Found',
      description: 'The requested fellowship page could not be found.',
    };
  }

  return {
    title: `${fellowshipName} - LWM BD Retreat`,
    description: `Participant list and information for ${fellowshipName} at Living Waters Ministries Bangladesh Retreat.`,
    openGraph: {
      title: `${fellowshipName} - LWM BD Retreat`,
      description: `Participant list and information for ${fellowshipName}`,
      type: 'website',
    },
  };
}

// Server component with ISR data fetching
export default async function FellowshipPage({ params }: FellowshipPageProps) {
  const fellowshipName = getNameFromSlug(params.slug);

  if (!fellowshipName) {
    notFound();
  }

  let participants: Participant[] = [];
  let error: string | null = null;

  try {
    // Server-side data fetching with ISR (revalidates every hour)
    const fetchedParticipants = await getFellowshipParticipants(fellowshipName);
    participants = Array.isArray(fetchedParticipants) ? fetchedParticipants : [];
  } catch (err) {
    console.error('Error fetching participants:', err);
    error = err instanceof Error ? err.message : 'Failed to fetch participants';
    participants = [];
  }

  return (
    <Box>
      <Container maxWidth="xl" sx={{ marginTop: '2rem', marginBottom: '2rem' }}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 600,
            color: 'primary.main',
            marginBottom: '1.5rem'
          }}
        >
          {fellowshipName}
        </Typography>

        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ marginBottom: '2rem' }}
        >
          Total Participants: {participants?.length || 0}
        </Typography>

        {error && (
          <Typography
            variant="body2"
            color="error"
            sx={{ marginBottom: '1rem' }}
          >
            Error loading data: {error}
          </Typography>
        )}

        <SearchableTable
          data={participants || []}
          fellowship={fellowshipName}
        />
      </Container>
    </Box>
  );
}

// Enable ISR with hourly revalidation
export const revalidate = 3600; // 1 hour

// Enable dynamic rendering for this route to prevent static generation errors
export const dynamic = 'force-dynamic';