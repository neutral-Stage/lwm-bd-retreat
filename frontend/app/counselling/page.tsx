import { Metadata } from "next";
import { getAllCounsellings } from "../../lib/data-fetching";
import CounsellingClient from "./CounsellingClient";

export const metadata: Metadata = {
  title: "Counselling Teams - LWM BD Retreat",
  description: "Manage counselling teams with counsellors and participants for the retreat",
};

// Enable dynamic rendering for this route to prevent static generation errors
export const dynamic = "force-dynamic";

export default async function CounsellingPage() {
  try {
    const counsellings = await fetchCounsellings();

    return <CounsellingClient counsellings={counsellings} />;
  } catch (error) {
    console.error("Error fetching counsellings:", error);
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h1>Error Loading Counselling Teams</h1>
        <p>Unable to load counselling data. Please try again later.</p>
        <p style={{ color: "#666", fontSize: "0.9rem", marginTop: "1rem" }}>
          Error: {error instanceof Error ? error.message : "Unknown error"}
        </p>
      </div>
    );
  }
}

// Helper function to fetch counsellings
async function fetchCounsellings() {
  try {
    return await getAllCounsellings();
  } catch (error) {
    console.error("Failed to fetch counsellings:", error);
    throw error;
  }
}