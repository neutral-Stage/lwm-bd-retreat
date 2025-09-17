import { Metadata } from 'next';
import NewFormClient from './NewFormClient';

export const metadata: Metadata = {
  title: 'New Registration - LWM BD Retreat',
  description: 'Register for the Life Word Mission Bangladesh Retreat',
};

export default function NewFormPage() {
  return <NewFormClient />;
}

// Enable dynamic rendering for this route to prevent static generation errors
export const dynamic = 'force-dynamic';