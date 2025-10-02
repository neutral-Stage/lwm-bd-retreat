import { client } from "../service/sanityClient";
import { Participant, Room, Fellowship } from "../types/index";

// Cache configuration
const REVALIDATE_TIME = 3600; // 1 hour in seconds

// Server-side data fetching with ISR
export async function getFellowshipParticipants(
  fellowshipName: string
): Promise<Participant[]> {
  try {
    const participants = await client.fetch(
      `*[_type == "participant" && fellowshipName == $fellowshipName && present == "present"]{
        _id,
        regNo,
        name,
        contact,
        guardianName,
        guardianContact,
        gender,
        department,
        fellowshipName,
        present,
        isSaved,
        salvationDate,
        birthYear,
        "roomNo": roomNo->roomNo,
        _createdAt
      } | order(_createdAt desc)`,
      { fellowshipName },
      {
        // Enable ISR with hourly revalidation
        next: { revalidate: REVALIDATE_TIME },
      }
    );

    // Ensure we always return an array
    return Array.isArray(participants) ? participants : [];
  } catch (error) {
    console.error("Error fetching fellowship participants:", error);
    // Return empty array instead of throwing during build time
    return [];
  }
}

export async function getAllParticipants(): Promise<Participant[]> {
  try {
    const participants = await client.fetch(
      `*[_type == "participant"]{
        _id,
        regNo,
        name,
        contact,
        guardianName,
        guardianContact,
        gender,
        department,
        fellowshipName,
        area,
        present,
        isSaved,
        salvationDate,
        age,
        "roomNo": roomNo->roomNo,
        _createdAt
      } | order(_createdAt desc)`,
      {},
      {
        cache: "no-store", // Always fetch fresh data for admin
      }
    );

    // Ensure we always return an array
    return Array.isArray(participants) ? participants : [];
  } catch (error) {
    console.error("Error fetching all participants:", error);
    // Return empty array instead of throwing during build time
    return [];
  }
}

export async function getAllRooms(): Promise<Room[]> {
  try {
    const rooms = await client.fetch(
      `*[_type == "roomNo"]{
        _id,
        roomNo,
        capacity,
        "booked": count(*[_type == "participant" && roomNo._ref == ^._id])
      } | order(roomNo asc)`,
      {},
      {
        next: { revalidate: REVALIDATE_TIME },
      }
    );

    // Ensure we always return an array
    return Array.isArray(rooms) ? rooms : [];
  } catch (error) {
    console.error("Error fetching rooms:", error);
    // Return empty array instead of throwing during build time
    return [];
  }
}

// Room management functions
export async function createRoom(roomData: {
  roomNo: number;
  capacity: number;
}): Promise<Room> {
  try {
    const result = await client.create({
      _type: "room",
      roomNo: roomData.roomNo.toString(),
      capacity: roomData.capacity,
      occupied: 0,
      available: roomData.capacity,
    });

    if (!isValidRoom(result)) {
      throw new Error("Invalid room data returned from server");
    }

    return result;
  } catch (error) {
    console.error("Error creating room:", error);
    throw new Error("Failed to create room");
  }
}

export async function updateRoom(
  id: string,
  updates: Partial<Room>
): Promise<Room> {
  try {
    const result = await client.patch(id).set(updates).commit();

    if (!isValidRoom(result)) {
      throw new Error("Invalid room data returned from server");
    }

    return result;
  } catch (error) {
    console.error("Error updating room:", error);
    throw new Error("Failed to update room");
  }
}

export async function deleteRoom(id: string): Promise<void> {
  try {
    await client.delete(id);
  } catch (error) {
    console.error("Error deleting room:", error);
    throw new Error("Failed to delete room");
  }
}

export async function getParticipantById(
  id: string
): Promise<Participant | null> {
  try {
    const participant = await client.fetch(
      `*[_type == "participant" && _id == $id][0]{
        ...,
        "roomNo": roomNo->roomNo
      }`,
      { id },
      {
        next: { revalidate: REVALIDATE_TIME },
      }
    );
    return participant || null;
  } catch (error) {
    console.error("Error fetching participant by ID:", error);
    throw new Error("Failed to fetch participant");
  }
}

// Client-side data mutations
export async function createParticipant(
  participantData: Omit<Participant, "_id">
): Promise<Participant> {
  try {
    const result = await client.create({
      ...participantData,
      _type: "participant",
    });

    if (!isValidParticipant(result)) {
      throw new Error("Invalid participant data returned from server");
    }

    return result;
  } catch (error) {
    console.error("Error creating participant:", error);
    throw new Error("Failed to create participant");
  }
}

export async function updateParticipant(
  id: string,
  updates: Partial<Participant>
): Promise<Participant> {
  try {
    console.log("Updating participant:", id, "with updates:", updates);

    const result = await client.patch(id).set(updates).commit();

    console.log("Update result:", result);

    if (!isValidParticipant(result)) {
      console.log("Validation failed for participant:", {
        _id: typeof result._id,
        name: typeof result.name,
        contact: typeof result.contact,
        fellowshipName: typeof result.fellowshipName,
        present: typeof result.present,
        gender: typeof result.gender,
      });
      throw new Error(
        "Invalid participant data returned from server - validation failed"
      );
    }

    return result;
  } catch (error) {
    console.error("Error updating participant:", error);

    // Provide more detailed error information
    if (error instanceof Error) {
      if (
        error.message.includes("network") ||
        error.message.includes("ERR_NAME_NOT_RESOLVED")
      ) {
        throw new Error(
          "Network error: Please check your internet connection and try again"
        );
      }
      throw new Error(`Update failed: ${error.message}`);
    }
    throw new Error("Failed to update participant");
  }
}

export async function deleteParticipant(id: string): Promise<void> {
  try {
    console.log("Deleting participant:", id);
    await client.delete(id);
    console.log("Participant deleted successfully:", id);
  } catch (error) {
    console.error("Error deleting participant:", error);

    // Provide more detailed error information
    if (error instanceof Error) {
      if (
        error.message.includes("network") ||
        error.message.includes("ERR_NAME_NOT_RESOLVED")
      ) {
        throw new Error(
          "Network error: Please check your internet connection and try again"
        );
      }
      throw new Error(`Delete failed: ${error.message}`);
    }
    throw new Error("Failed to delete participant");
  }
}

export async function updateParticipantRoom(
  participantId: string,
  roomId: string | null
): Promise<Participant> {
  try {
    const roomRef = roomId ? { _ref: roomId, _type: "reference" } : null;
    const result = await client
      .patch(participantId)
      .set({ roomNo: roomRef })
      .commit();

    if (!isValidParticipant(result)) {
      throw new Error("Invalid participant data returned from server");
    }

    return result;
  } catch (error) {
    console.error("Error updating participant room:", error);
    throw new Error("Failed to update participant room");
  }
}

// Utility functions for cache management
export function revalidateFellowshipData(fellowshipName: string) {
  // This would be used with Next.js revalidateTag or revalidatePath
  // Implementation depends on your specific caching strategy
  console.log(`Revalidating data for fellowship: ${fellowshipName}`);
}

export function revalidateAllData() {
  console.log("Revalidating all application data");
}

// Type guards and validation
export function isValidParticipant(data: any): data is Participant {
  // Temporarily make this validation very permissive to debug the issue
  return (
    typeof data === "object" && data !== null && typeof data._id === "string"
  );
}

export function isValidRoom(data: any): data is Room {
  return (
    typeof data === "object" &&
    data !== null &&
    typeof data._id === "string" &&
    typeof data.roomNo === "string" &&
    typeof data.capacity === "number" &&
    typeof data.occupied === "number"
  );
}

// Fellowship data fetching functions
export async function getAllFellowships(): Promise<Fellowship[]> {
  try {
    const fellowships = await client.fetch(
      `*[_type == "fellowship"] | order(fellowship asc) {
        _id,
        _type,
        _createdAt,
        _updatedAt,
        fellowship,
        slug,
        incharge,
        leaders,
        description,
        division
      }`,
      {},
      {
        next: { revalidate: REVALIDATE_TIME },
      }
    );

    return Array.isArray(fellowships) ? fellowships : [];
  } catch (error) {
    console.error("Error fetching fellowships:", error);
    return [];
  }
}

export async function getFellowshipBySlug(
  slug: string
): Promise<Fellowship | null> {
  try {
    const fellowship = await client.fetch(
      `*[_type == "fellowship" && slug.current == $slug][0] {
        _id,
        _type,
        _createdAt,
        _updatedAt,
        fellowship,
        slug,
        incharge,
        leaders,
        description,
        division
      }`,
      { slug },
      {
        next: { revalidate: REVALIDATE_TIME },
      }
    );

    return fellowship || null;
  } catch (error) {
    console.error("Error fetching fellowship by slug:", error);
    return null;
  }
}

export async function getFellowshipParticipantsBySlug(
  slug: string
): Promise<Participant[]> {
  try {
    // First get the fellowship name from the slug
    const fellowship = await getFellowshipBySlug(slug);
    if (!fellowship) {
      return [];
    }

    // Then fetch participants using the fellowship name
    const participants = await client.fetch(
      `*[_type == "participant" && fellowshipName == $fellowshipName && present == "present"]{
        _id,
        regNo,
        name,
        contact,
        guardianName,
        guardianContact,
        gender,
        department,
        fellowshipName,
        present,
        isSaved,
        salvationDate,
        birthYear,
        "roomNo": roomNo->roomNo,
        _createdAt
      } | order(_createdAt desc)`,
      { fellowshipName: fellowship.fellowship },
      {
        next: { revalidate: REVALIDATE_TIME },
      }
    );

    return Array.isArray(participants) ? participants : [];
  } catch (error) {
    console.error("Error fetching fellowship participants by slug:", error);
    return [];
  }
}

export function isValidFellowship(data: any): data is Fellowship {
  return (
    typeof data === "object" &&
    data !== null &&
    typeof data._id === "string" &&
    typeof data.fellowship === "string" &&
    typeof data.slug === "object" &&
    typeof data.slug.current === "string" &&
    typeof data.division === "string"
  );
}

// Connection utility functions (no longer needed for UI)
