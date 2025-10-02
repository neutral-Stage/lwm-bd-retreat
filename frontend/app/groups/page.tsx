import { Metadata } from "next";
import { getAllGroups } from "../../lib/data-fetching";
import GroupsClient from "./GroupsClient";

export const metadata: Metadata = {
  title: "Groups Management - LWM BD Retreat",
  description: "Manage groups with participants and volunteers for the retreat",
};

// Enable dynamic rendering for this route to prevent static generation errors
export const dynamic = "force-dynamic";

export default async function GroupsPage() {
  try {
    const groups = await fetchGroups();

    return <GroupsClient groups={groups} />;
  } catch (error) {
    console.error("Error fetching groups:", error);
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <h1>Error Loading Groups</h1>
        <p>Unable to load groups data. Please try again later.</p>
        <p style={{ color: "#666", fontSize: "0.9rem", marginTop: "1rem" }}>
          Error: {error instanceof Error ? error.message : "Unknown error"}
        </p>
      </div>
    );
  }
}

// Helper function to fetch groups
async function fetchGroups() {
  try {
    return await getAllGroups();
  } catch (error) {
    console.error("Failed to fetch groups:", error);
    throw error;
  }
}