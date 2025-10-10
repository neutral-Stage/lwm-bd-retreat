import { Metadata } from "next";
import { getAllBaptized } from "../../lib/data-fetching";
import BaptizedClient from "./BaptizedClient";

export const metadata: Metadata = {
  title: "Baptized List - LWM BD Retreat",
  description: "Manage baptized participants for the retreat",
};

// Enable dynamic rendering for this route to prevent static generation errors
export const dynamic = "force-dynamic";

export default async function BaptizedPage() {
  try {
    const baptized = await fetchBaptized();

    return <BaptizedClient baptized={baptized} />;
  } catch (error) {
    console.error("Error fetching baptized:", error);
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h1>Error Loading Baptized List</h1>
        <p>Unable to load baptized data. Please try again later.</p>
        <p style={{ color: "#666", fontSize: "0.9rem", marginTop: "1rem" }}>
          Error: {error instanceof Error ? error.message : "Unknown error"}
        </p>
      </div>
    );
  }
}

// Helper function to fetch baptized
async function fetchBaptized() {
  try {
    return await getAllBaptized();
  } catch (error) {
    console.error("Failed to fetch baptized:", error);
    throw error;
  }
}