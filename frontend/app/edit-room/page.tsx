import { Metadata } from 'next';
import { getAllRooms } from '../../lib/data-fetching';
import EditRoomClient from './EditRoomClient';

export const metadata: Metadata = {
  title: 'Edit Rooms - LWM BD Retreat',
  description: 'Manage and edit room information for the retreat',
};

export default async function EditRoomPage() {
  const rooms = await getAllRooms();

  return <EditRoomClient initialRooms={rooms} />;
}