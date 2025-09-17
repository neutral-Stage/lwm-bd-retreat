import { Metadata } from 'next';
import { getAllParticipants } from '../../lib/data-fetching';
import ParticipantList from './ParticipantList';

export const metadata: Metadata = {
  title: 'Participant List - LWM BD Retreat',
  description: 'Admin dashboard for managing retreat participants',
};

// Enable ISR with 5 minute revalidation for admin data
export const revalidate = 300;

// Enable dynamic rendering for this route to prevent static generation errors
export const dynamic = 'force-dynamic';

export default async function ListPage() {
  try {
    const participants = await getAllParticipants();
    
    return <ParticipantList participants={participants} />;
  } catch (error) {
    console.error('Error fetching participants:', error);
    return (
      <div>
        <h1>Error loading participants</h1>
        <p>Please try again later.</p>
      </div>
    );
  }
}