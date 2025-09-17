export interface Participant {
  _id: string;
  _type?: 'participant';
  _createdAt?: string;
  _updatedAt?: string;
  regNo?: string;
  name: string;
  contact: string;
  phone?: string;
  birthYear?: number;
  age?: number;
  gender: 'male' | 'female';
  present: 'present' | 'absent';
  isSaved?: boolean;
  guestOrSaved?: 'guest' | 'saved';
  salvationDate?: string;
  fellowshipName: string;
  department?: string;
  guardianName?: string;
  guardianContact?: string;
  room?: string;
  feePaid?: boolean;
  roomNo?: {
    roomNo: string;
  } | string;
}

export interface Room {
  _id: string;
  _type: 'room';
  _createdAt: string;
  _updatedAt: string;
  roomNo: string;
  capacity: number;
  occupied: number;
  available: number;
  booked: number;
}

export interface Fellowship {
  name: string;
  slug: string;
}

export interface PageProps {
  params: {
    slug?: string;
  };
  searchParams?: {
    [key: string]: string | string[] | undefined;
  };
}

export interface SearchableTableProps {
  participants: Participant[];
  fellowship: string;
}

export interface EditModalFormProps {
  open: boolean;
  onClose: () => void;
  participant?: Participant;
  onSave: (participant: Participant) => void;
}

export interface RoomSelectionProps {
  rooms: Room[];
  selectedRoom?: string;
  onRoomSelect: (roomId: string) => void;
}