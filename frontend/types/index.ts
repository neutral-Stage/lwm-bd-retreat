export interface Participant {
  _id: string;
  _type?: "participant";
  _createdAt?: string;
  _updatedAt?: string;
  regNo?: string | null;
  name: string;
  contact?: string | null;
  phone?: string;
  birthYear?: number | null;
  age?: number | null;
  gender: "male" | "female";
  present: "present" | "absent";
  isSaved?: boolean;
  guestOrSaved?: "guest" | "saved";
  salvationDate?: string | null;
  fellowshipName: string;
  area?: string | null;
  department?: string | null;
  guardianName?: string | null;
  guardianContact?: string | null;
  room?: string;
  feePaid?: boolean;
  roomNo?:
    | {
        roomNo: string;
      }
    | string
    | null;
}

export interface Room {
  _id: string;
  _type: "room";
  _createdAt: string;
  _updatedAt: string;
  roomNo: string;
  capacity: number;
  occupied: number;
  available: number;
  booked: number;
}

export interface Fellowship {
  _id: string;
  _type: "fellowship";
  _createdAt: string;
  _updatedAt: string;
  fellowship: string;
  slug: {
    current: string;
  };
  incharge?: string;
  leaders?: string;
  description?: string;
  division: string;
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
