import { Metadata } from 'next';
import { getAllParticipants, getAllRooms } from '../../lib/data-fetching';
import { Participant, Room } from '../../types';
import RoomClient from './RoomClient';

export const metadata: Metadata = {
  title: 'Room Assignment - LWM BD Retreat',
  description: 'Assign participants to rooms for the retreat',
};

export default async function RoomPage() {
  let participants: Participant[] = [];
  let rooms: Room[] = [];

  try {
    const [fetchedParticipants, fetchedRooms] = await Promise.all([
      getAllParticipants(),
      getAllRooms()
    ]);

    participants = Array.isArray(fetchedParticipants) ? fetchedParticipants : [];
    rooms = Array.isArray(fetchedRooms) ? fetchedRooms : [];
  } catch (error) {
    console.error('Error fetching data:', error);
    participants = [];
    rooms = [];
  }

  return <RoomClient participants={participants} rooms={rooms} />;
}

// Enable dynamic rendering for this route to prevent static generation errors
export const dynamic = 'force-dynamic';