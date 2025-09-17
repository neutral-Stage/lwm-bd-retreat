import { Metadata } from 'next';
import { getAllParticipants } from '../../lib/data-fetching';
import { Participant } from '../../types';
import PaidListClient from './PaidListClient';

export const metadata: Metadata = {
  title: 'Payment List - LWM BD Retreat',
  description: 'Track participant payment status for the retreat',
};

export default async function PaidListPage() {
  let participants: Participant[] = [];
  try {
    const fetchedParticipants = await getAllParticipants();
    participants = Array.isArray(fetchedParticipants) ? fetchedParticipants : [];
  } catch (error) {
    console.error('Error fetching participants:', error);
    participants = [];
  }

  return <PaidListClient participants={participants} />;
}

// Enable dynamic rendering for this route to prevent static generation errors
export const dynamic = 'force-dynamic';