import React from 'react';
import { getAllParticipants, getAllCounsellings } from '../../lib/data-fetching';
import ReportsClient from './ReportsClient';

export default async function ReportsPage() {
  try {
    const [participants, counsellings] = await Promise.all([
      getAllParticipants(),
      getAllCounsellings(),
    ]);

    return (
      <ReportsClient
        participants={participants}
        counsellings={counsellings}
      />
    );
  } catch (error) {
    console.error('Error loading reports data:', error);
    return (
      <div style={{ padding: '2rem' }}>
        <h1>Error Loading Reports</h1>
        <p>There was an error loading the reports data. Please try again later.</p>
      </div>
    );
  }
}