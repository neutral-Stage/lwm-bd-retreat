'use client';

import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import dayjs, { Dayjs } from 'dayjs';
import { Participant, Room } from '../types';

// Re-export types for convenience
export type { Participant, Room } from '../types';

export interface FormData {
  name: string;
  phone: string;
  fellowshipName: string;
  salvationDate: string;
  present: string;
  gender: string;
  age: number;
  profileImage?: string;
}

export interface AppState {
  participants: Participant[];
  rooms: Room[];
  fellowships: string[];
  loading: boolean;
  error: string | null;
  formData: FormData;
  selectedDate: Dayjs;
  selectedYear: Dayjs;
  isModalOpen: boolean;
  editingParticipant: Participant | null;
}

// Action types
export type AppAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_PARTICIPANTS'; payload: Participant[] }
  | { type: 'ADD_PARTICIPANT'; payload: Participant }
  | { type: 'UPDATE_PARTICIPANT'; payload: Participant }
  | { type: 'DELETE_PARTICIPANT'; payload: string }
  | { type: 'SET_ROOMS'; payload: Room[] }
  | { type: 'ADD_ROOM'; payload: Room }
  | { type: 'UPDATE_ROOM'; payload: Room }
  | { type: 'DELETE_ROOM'; payload: string }
  | { type: 'SET_FELLOWSHIPS'; payload: string[] }
  | { type: 'SET_FORM_DATA'; payload: Partial<FormData> }
  | { type: 'RESET_FORM_DATA' }
  | { type: 'SET_SELECTED_DATE'; payload: Dayjs }
  | { type: 'SET_SELECTED_YEAR'; payload: Dayjs }
  | { type: 'SET_MODAL_OPEN'; payload: boolean }
  | { type: 'SET_EDITING_PARTICIPANT'; payload: Participant | null };

// Initial state
const initialFormData: FormData = {
  name: '',
  phone: '',
  fellowshipName: '',
  salvationDate: '',
  present: 'present',
  gender: 'male',
  age: 18,
};

const initialState: AppState = {
  participants: [],
  rooms: [],
  fellowships: [],
  loading: false,
  error: null,
  formData: initialFormData,
  selectedDate: dayjs(new Date()),
  selectedYear: dayjs(new Date()),
  isModalOpen: false,
  editingParticipant: null,
};

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_PARTICIPANTS':
      return { ...state, participants: action.payload };
    case 'ADD_PARTICIPANT':
      return { ...state, participants: [...state.participants, action.payload] };
    case 'UPDATE_PARTICIPANT':
      return {
        ...state,
        participants: state.participants.map(p =>
          p._id === action.payload._id ? action.payload : p
        ),
      };
    case 'DELETE_PARTICIPANT':
      return {
        ...state,
        participants: state.participants.filter(p => p._id !== action.payload),
      };
    case 'SET_ROOMS':
      return { ...state, rooms: action.payload };
    case 'ADD_ROOM':
      return { ...state, rooms: [...state.rooms, action.payload] };
    case 'UPDATE_ROOM':
      return {
        ...state,
        rooms: state.rooms.map(r =>
          r._id === action.payload._id ? action.payload : r
        ),
      };
    case 'DELETE_ROOM':
      return {
        ...state,
        rooms: state.rooms.filter(r => r._id !== action.payload),
      };
    case 'SET_FELLOWSHIPS':
      return { ...state, fellowships: action.payload };
    case 'SET_FORM_DATA':
      return {
        ...state,
        formData: { ...state.formData, ...action.payload },
      };
    case 'RESET_FORM_DATA':
      return { ...state, formData: initialFormData };
    case 'SET_SELECTED_DATE':
      return { ...state, selectedDate: action.payload };
    case 'SET_SELECTED_YEAR':
      return { ...state, selectedYear: action.payload };
    case 'SET_MODAL_OPEN':
      return { ...state, isModalOpen: action.payload };
    case 'SET_EDITING_PARTICIPANT':
      return { ...state, editingParticipant: action.payload };
    default:
      return state;
  }
}

// Context
const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

// Provider component
export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

// Custom hook
export function useAppContext() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
}

// Action creators
export const actions = {
  setLoading: (loading: boolean): AppAction => ({ type: 'SET_LOADING', payload: loading }),
  setError: (error: string | null): AppAction => ({ type: 'SET_ERROR', payload: error }),
  setParticipants: (participants: Participant[]): AppAction => ({ type: 'SET_PARTICIPANTS', payload: participants }),
  addParticipant: (participant: Participant): AppAction => ({ type: 'ADD_PARTICIPANT', payload: participant }),
  updateParticipant: (participant: Participant): AppAction => ({ type: 'UPDATE_PARTICIPANT', payload: participant }),
  deleteParticipant: (id: string): AppAction => ({ type: 'DELETE_PARTICIPANT', payload: id }),
  setRooms: (rooms: Room[]): AppAction => ({ type: 'SET_ROOMS', payload: rooms }),
  addRoom: (room: Room): AppAction => ({ type: 'ADD_ROOM', payload: room }),
  updateRoom: (room: Room): AppAction => ({ type: 'UPDATE_ROOM', payload: room }),
  deleteRoom: (id: string): AppAction => ({ type: 'DELETE_ROOM', payload: id }),
  setFellowships: (fellowships: string[]): AppAction => ({ type: 'SET_FELLOWSHIPS', payload: fellowships }),
  setFormData: (formData: Partial<FormData>): AppAction => ({ type: 'SET_FORM_DATA', payload: formData }),
  resetFormData: (): AppAction => ({ type: 'RESET_FORM_DATA' }),
  setSelectedDate: (date: Dayjs): AppAction => ({ type: 'SET_SELECTED_DATE', payload: date }),
  setSelectedYear: (year: Dayjs): AppAction => ({ type: 'SET_SELECTED_YEAR', payload: year }),
  setModalOpen: (open: boolean): AppAction => ({ type: 'SET_MODAL_OPEN', payload: open }),
  setEditingParticipant: (participant: Participant | null): AppAction => ({ type: 'SET_EDITING_PARTICIPANT', payload: participant })
};