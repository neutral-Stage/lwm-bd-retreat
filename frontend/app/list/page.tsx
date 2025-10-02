import { Metadata } from "next";
import { getAllParticipants } from "../../lib/data-fetching";
import ParticipantList from "./ParticipantList";

export const metadata: Metadata = {
  title: "Participant List - LWM BD Retreat",
  description:
    "Comprehensive participant management system for retreat attendees",
};

// Enable ISR with 5 minute revalidation for admin data
export const revalidate = 300;

// Enable dynamic rendering for this route to prevent static generation errors
export const dynamic = "force-dynamic";

export default async function ListPage() {
  try {
    const participants = await fetchParticipants();

    return <ParticipantList participants={participants} />;
  } catch (error) {
    console.error("Error fetching participants:", error);
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h1>Error Loading Participants</h1>
        <p>Unable to load participant data. Please try again later.</p>
        <p style={{ color: "#666", fontSize: "0.9rem", marginTop: "1rem" }}>
          Error: {error instanceof Error ? error.message : "Unknown error"}
        </p>
      </div>
    );
  }
}

// Helper function to fetch participants
async function fetchParticipants() {
  // You can add caching logic here if needed
  try {
    return await getAllParticipants();
  } catch (error) {
    console.error("Failed to fetch participants:", error);
    throw error;
  }
}
