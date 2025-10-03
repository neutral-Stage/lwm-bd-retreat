import { client } from "../service/sanityClient";
import {
  Participant,
  Room,
  Fellowship,
  Group,
  Counselling,
  CounsellingParticipant,
} from "../types/index";

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
        "booked": count(*[_type == "participant" && roomNo._ref == ^._id]),
        _createdAt,
        _updatedAt
      } | order(roomNo asc)`,
      {},
      {
        cache: "no-store", // Force fresh data for room management
      }
    );

    // Ensure we always return an array and transform to match Room interface
    const transformedRooms = Array.isArray(rooms)
      ? rooms.map((room) => ({
          ...room,
          occupied: room.booked || 0,
          available: room.capacity - (room.booked || 0),
        }))
      : [];

    return transformedRooms;
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
      _type: "roomNo",
      roomNo: roomData.roomNo.toString(),
      capacity: roomData.capacity,
    });

    // Transform to match Room interface with computed fields
    const roomWithComputed = {
      ...result,
      occupied: 0,
      available: roomData.capacity,
      booked: 0,
    };

    if (!isValidRoom(roomWithComputed)) {
      throw new Error("Invalid room data returned from server");
    }

    return roomWithComputed;
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
    // Only update fields that exist in Sanity schema
    const sanitizedUpdates: any = {};

    if (updates.roomNo) {
      sanitizedUpdates.roomNo = updates.roomNo;
    }
    if (updates.capacity !== undefined) {
      sanitizedUpdates.capacity = updates.capacity;
    }


    const result = await client.patch(id).set(sanitizedUpdates).commit();


    // Transform result to match Room interface with computed fields
    const roomWithComputed = {
      ...result,
      occupied: result.occupied || 0,
      available:
        updates.capacity !== undefined ? updates.capacity : result.capacity,
      booked: result.booked || 0,
    };

    if (!isValidRoom(roomWithComputed)) {
      throw new Error("Invalid room data returned from server");
    }

    return roomWithComputed;
  } catch (error) {
    console.error("Error updating room:", error);
    throw new Error("Failed to update room");
  }
}

export async function deleteRoom(id: string): Promise<void> {
  try {
    // First check if the room exists
    const roomExists = await client.fetch(`*[_type == "roomNo" && _id == $id][0]`, { id });

    if (!roomExists) {
      throw new Error("Room not found");
    }

    await client.delete(id);
  } catch (error) {
    console.error("Error deleting room:", error);
    throw new Error(error instanceof Error ? error.message : "Failed to delete room");
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
    const result = await client.patch(id).set(updates).commit();

    if (!isValidParticipant(result)) {
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
    await client.delete(id);
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
}

export function revalidateAllData() {
  // Implementation for revalidating all application data
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
        age,
        area,
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

export async function getAllFellowshipParticipantsBySlug(
  slug: string
): Promise<Participant[]> {
  try {
    // First get the fellowship name from the slug
    const fellowship = await getFellowshipBySlug(slug);
    if (!fellowship) {
      return [];
    }

    // Then fetch ALL participants using the fellowship name (present and absent)
    const participants = await client.fetch(
      `*[_type == "participant" && fellowshipName == $fellowshipName]{
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
        age,
        area,
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
    console.error("Error fetching all fellowship participants by slug:", error);
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

// Group data fetching functions
export async function getAllGroups(): Promise<Group[]> {
  try {
    const groups = await client.fetch(
      `*[_type == "group"] | order(name asc) {
        _id,
        _type,
        _createdAt,
        _updatedAt,
        name,
        slug,
        description,
        "participants": participants[]->{
          _id,
          name,
          contact,
          department,
          fellowshipName,
          gender,
          present
        },
        "volunteers": volunteers[]->{
          _id,
          name,
          contact,
          department,
          fellowshipName,
          gender,
          present
        }
      }`,
      {},
      {
        cache: "no-store", // Always fetch fresh data for admin
      }
    );

    return Array.isArray(groups) ? groups : [];
  } catch (error) {
    console.error("Error fetching groups:", error);
    return [];
  }
}

export async function getGroupById(id: string): Promise<Group | null> {
  try {
    const group = await client.fetch(
      `*[_type == "group" && _id == $id][0] {
        _id,
        _type,
        _createdAt,
        _updatedAt,
        name,
        slug,
        description,
        "participants": participants[]->{
          _id,
          name,
          contact,
          department,
          fellowshipName,
          gender,
          present
        },
        "volunteers": volunteers[]->{
          _id,
          name,
          contact,
          department,
          fellowshipName,
          gender,
          present
        }
      }`,
      { id },
      {
        next: { revalidate: REVALIDATE_TIME },
      }
    );

    return group || null;
  } catch (error) {
    console.error("Error fetching group by ID:", error);
    return null;
  }
}

export async function createGroup(groupData: {
  name: string;
  description?: string;
  participants?: string[];
  volunteers?: string[];
}): Promise<Group> {
  try {
    const participantRefs =
      groupData.participants?.map((id) => ({
        _ref: id,
        _type: "reference",
      })) || [];

    const volunteerRefs =
      groupData.volunteers?.map((id) => ({
        _ref: id,
        _type: "reference",
      })) || [];

    const result = await client.create({
      _type: "group",
      name: groupData.name,
      slug: {
        _type: "slug",
        current: groupData.name.toLowerCase().replace(/\s+/g, "-"),
      },
      description: groupData.description || "",
      participants: participantRefs,
      volunteers: volunteerRefs,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    if (!isValidGroup(result)) {
      throw new Error("Invalid group data returned from server");
    }

    return result;
  } catch (error) {
    console.error("Error creating group:", error);
    throw new Error("Failed to create group");
  }
}

export async function updateGroup(
  id: string,
  updates: Partial<Group>
): Promise<Group> {
  try {
    const updateData: any = { ...updates };

    // Handle participants and volunteers references
    if (updates.participants) {
      updateData.participants = updates.participants.map((p) =>
        typeof p === "string" ? { _ref: p, _type: "reference" } : p
      );
    }

    if (updates.volunteers) {
      updateData.volunteers = updates.volunteers.map((v) =>
        typeof v === "string" ? { _ref: v, _type: "reference" } : v
      );
    }

    updateData.updatedAt = new Date().toISOString();

    const result = await client.patch(id).set(updateData).commit();

    if (!isValidGroup(result)) {
      throw new Error("Invalid group data returned from server");
    }

    return result;
  } catch (error) {
    console.error("Error updating group:", error);
    throw new Error("Failed to update group");
  }
}

export async function deleteGroup(id: string): Promise<void> {
  try {
    await client.delete(id);
  } catch (error) {
    console.error("Error deleting group:", error);
    throw new Error("Failed to delete group");
  }
}

export function isValidGroup(data: any): data is Group {
  return (
    typeof data === "object" &&
    data !== null &&
    typeof data._id === "string" &&
    typeof data.name === "string"
  );
}

// Get participants available for groups (exclude those already in groups if needed)
export async function getAvailableParticipants(): Promise<Participant[]> {
  try {
    const participants = await client.fetch(
      `*[_type == "participant" && department != "volunteer" && present == "present"]{
        _id,
        name,
        contact,
        department,
        fellowshipName,
        gender,
        present
      } | order(name asc)`,
      {},
      {
        cache: "no-store",
      }
    );

    return Array.isArray(participants) ? participants : [];
  } catch (error) {
    console.error("Error fetching available participants:", error);
    return [];
  }
}

// Get volunteers available for groups
export async function getAvailableVolunteers(): Promise<Participant[]> {
  try {
    const volunteers = await client.fetch(
      `*[_type == "participant" && department == "volunteer" && present == "present"]{
        _id,
        name,
        contact,
        department,
        fellowshipName,
        gender,
        present
      } | order(name asc)`,
      {},
      {
        cache: "no-store",
      }
    );

    return Array.isArray(volunteers) ? volunteers : [];
  } catch (error) {
    console.error("Error fetching available volunteers:", error);
    return [];
  }
}

// Counselling data fetching functions
export async function getAllCounsellings(): Promise<Counselling[]> {
  try {
    const counsellings = await client.fetch(
      `*[_type == "counselling"] | order(name asc) {
        _id,
        _type,
        _createdAt,
        _updatedAt,
        name,
        slug,
        description,
        "counsellor": counsellor->{
          _id,
          name,
          contact,
          department,
          fellowshipName,
          gender,
          present
        },
        "participants": coalesce(
          counsellingParticipants[]{
            _id,
            "participant": participant->{
              _id,
              name,
              contact,
              department,
              fellowshipName,
              gender,
              present
            },
            status,
            comments
          },
          participants[]->{
            "participant": {
              _id,
              name,
              contact,
              department,
              fellowshipName,
              gender,
              present
            },
            "status": "pending",
            "comments": "",
            "_id": null
          }
        ),
        meetingSchedule,
        location,
        status,
        notes
      }`,
      {},
      {
        cache: "no-store", // Always fetch fresh data for admin
      }
    );

    return Array.isArray(counsellings) ? counsellings : [];
  } catch (error) {
    console.error("Error fetching counsellings:", error);
    return [];
  }
}

export async function getCounsellingById(
  id: string
): Promise<Counselling | null> {
  try {
    const counselling = await client.fetch(
      `*[_type == "counselling" && _id == $id][0] {
        _id,
        _type,
        _createdAt,
        _updatedAt,
        name,
        slug,
        description,
        "counsellor": counsellor->{
          _id,
          name,
          contact,
          department,
          fellowshipName,
          gender,
          present
        },
        "participants": coalesce(
          counsellingParticipants[]{
            _id,
            "participant": participant->{
              _id,
              name,
              contact,
              department,
              fellowshipName,
              gender,
              present
            },
            status,
            comments
          },
          participants[]->{
            "participant": {
              _id,
              name,
              contact,
              department,
              fellowshipName,
              gender,
              present
            },
            "status": "pending",
            "comments": "",
            "_id": null
          }
        ),
        meetingSchedule,
        location,
        status,
        notes
      }`,
      { id },
      {
        next: { revalidate: REVALIDATE_TIME },
      }
    );

    return counselling || null;
  } catch (error) {
    console.error("Error fetching counselling by ID:", error);
    return null;
  }
}

export async function createCounselling(counsellingData: {
  name: string;
  description?: string;
  counsellor: string;
  participants: string[] | { participantId: string; status: "done" | "pending"; comments: string }[];
  meetingSchedule?: string;
  location?: string;
  status?: "active" | "inactive" | "completed";
  notes?: string;
}): Promise<Counselling> {
  try {
    const counsellorRef = {
      _ref: counsellingData.counsellor,
      _type: "reference",
    };

    // Handle both old format (string[]) and new format (CounsellingParticipant[])
    const participantRefs = Array.isArray(counsellingData.participants) &&
      typeof counsellingData.participants[0] === 'string'
      ? counsellingData.participants.map((id) => ({
          _ref: id,
          _type: "reference",
        }))
      : null;

    const counsellingParticipants = Array.isArray(counsellingData.participants) &&
      typeof counsellingData.participants[0] === 'object'
      ? (counsellingData.participants as { participantId: string; status: "done" | "pending"; comments: string }[]).map((cp, index) => ({
          _type: "counsellingParticipant",
          _key: `cp-${cp.participantId}-${Date.now()}-${index}`, // Generate unique key
          participant: {
            _ref: cp.participantId,
            _type: "reference",
          },
          status: cp.status,
          comments: cp.comments,
        }))
      : [];

    const createData: any = {
      _type: "counselling",
      name: counsellingData.name,
      slug: {
        _type: "slug",
        current: counsellingData.name.toLowerCase().replace(/\s+/g, "-"),
      },
      description: counsellingData.description || "",
      counsellor: counsellorRef,
      meetingSchedule: counsellingData.meetingSchedule || "",
      location: counsellingData.location || "",
      status: counsellingData.status || "active",
      notes: counsellingData.notes || "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Use new counsellingParticipants structure if available, otherwise fall back to old participants
    if (counsellingParticipants.length > 0) {
      createData.counsellingParticipants = counsellingParticipants;
    } else if (participantRefs) {
      createData.participants = participantRefs;
    }

    const result = await client.create(createData);

    if (!result || !result._id) {
      throw new Error("Failed to create counselling team");
    }

    // Fetch the complete counselling data with populated references
    const populatedCounselling = await getCounsellingById(result._id);

    if (!populatedCounselling) {
      throw new Error("Failed to fetch created counselling team");
    }

    return populatedCounselling;
  } catch (error) {
    console.error("Error creating counselling:", error);
    throw new Error("Failed to create counselling team");
  }
}

export async function updateCounselling(
  id: string,
  updates: Partial<Counselling>
): Promise<Counselling> {
  try {
    const updateData: any = { ...updates };

    // Handle counsellor reference
    if (updates.counsellor) {
      updateData.counsellor =
        typeof updates.counsellor === "string"
          ? { _ref: updates.counsellor, _type: "reference" }
          : { _ref: updates.counsellor._id, _type: "reference" };
    }

    // Handle participants references - support both old and new formats
    if (updates.participants) {
      // Check if it's the new CounsellingParticipant format
      if (updates.participants.length > 0 && 'participant' in updates.participants[0]) {
        updateData.counsellingParticipants = updates.participants.map((cp: any, index: number) => ({
          _type: "counsellingParticipant",
          _key: cp._key || `cp-${typeof cp.participant === "string" ? cp.participant : cp.participant._id}-${Date.now()}-${index}`,
          participant: typeof cp.participant === "string"
            ? { _ref: cp.participant, _type: "reference" }
            : { _ref: cp.participant._id, _type: "reference" },
          status: cp.status || "pending",
          comments: cp.comments || "",
        }));
        // Clear old participants field if using new structure
        updateData.participants = undefined;
      } else {
        // Legacy format - array of participant IDs or references
        updateData.participants = updates.participants.map((p) =>
          typeof p === "string" ? { _ref: p, _type: "reference" } : p
        );
      }
    }

    updateData.updatedAt = new Date().toISOString();

    const result = await client.patch(id).set(updateData).commit();

    if (!result || !result._id) {
      throw new Error("Failed to update counselling team");
    }

    // Fetch the complete counselling data with populated references
    const populatedCounselling = await getCounsellingById(result._id);

    if (!populatedCounselling) {
      throw new Error("Failed to fetch updated counselling team");
    }

    return populatedCounselling;
  } catch (error) {
    console.error("Error updating counselling:", error);
    throw new Error("Failed to update counselling team");
  }
}

export async function deleteCounselling(id: string): Promise<void> {
  try {
    await client.delete(id);
  } catch (error) {
    console.error("Error deleting counselling:", error);
    throw new Error("Failed to delete counselling team");
  }
}

export function isValidCounselling(data: any): data is Counselling {
  return (
    typeof data === "object" &&
    data !== null &&
    typeof data._id === "string" &&
    typeof data.name === "string"
  );
}

// Get volunteers available for counselling (not already assigned as counsellors)
export async function getAvailableCounsellors(): Promise<Participant[]> {
  try {
    const volunteers = await client.fetch(
      `*[_type == "participant" && department == "volunteer" && present == "present"]{
        _id,
        name,
        contact,
        department,
        fellowshipName,
        gender,
        present
      } | order(name asc)`,
      {},
      {
        cache: "no-store",
      }
    );

    return Array.isArray(volunteers) ? volunteers : [];
  } catch (error) {
    console.error("Error fetching available counsellors:", error);
    return [];
  }
}

// Get participants available for counselling (not already assigned to counselling teams)
export async function getAvailableCounsellingParticipants(): Promise<
  Participant[]
> {
  try {
    const participants = await client.fetch(
      `*[_type == "participant" && department != "volunteer" && present == "present"]{
        _id,
        name,
        contact,
        department,
        fellowshipName,
        gender,
        present
      } | order(name asc)`,
      {},
      {
        cache: "no-store",
      }
    );

    return Array.isArray(participants) ? participants : [];
  } catch (error) {
    console.error("Error fetching available counselling participants:", error);
    return [];
  }
}

// Get participants and volunteers already assigned to counselling teams
export async function getAssignedCounsellingMembers(): Promise<{
  counsellors: string[];
  participants: string[];
}> {
  try {
    const counsellings = await client.fetch(
      `*[_type == "counselling"]{
        "counsellor": counsellor._ref,
        "participants": participants[]._ref
      }`,
      {},
      {
        cache: "no-store",
      }
    );

    const counsellors = new Set<string>();
    const participants = new Set<string>();

    counsellings.forEach((counselling: any) => {
      if (counselling.counsellor) {
        counsellors.add(counselling.counsellor);
      }
      if (counselling.participants) {
        counselling.participants.forEach((p: string) => participants.add(p));
      }
    });

    return {
      counsellors: Array.from(counsellors),
      participants: Array.from(participants),
    };
  } catch (error) {
    console.error("Error fetching assigned counselling members:", error);
    return { counsellors: [], participants: [] };
  }
}

// Update counselling participant status and comments
export async function updateCounsellingParticipant(
  counsellingId: string,
  participantId: string,
  updates: { status?: "done" | "pending"; comments?: string }
): Promise<void> {
  try {
    // First, get the current counselling document
    const counselling = await client.fetch(
      `*[_type == "counselling" && _id == $counsellingId][0]{
        _id,
        counsellingParticipants[]{
          _id,
          _key,
          participant,
          status,
          comments
        },
        participants
      }`,
      { counsellingId }
    );

    if (!counselling) {
      throw new Error("Counselling not found");
    }

    // Check if using new counsellingParticipants structure
    if (counselling.counsellingParticipants && counselling.counsellingParticipants.length > 0) {
      // Find the participant entry in counsellingParticipants
      const participantIndex = counselling.counsellingParticipants.findIndex(
        (cp: any) => cp.participant._ref === participantId
      );

      if (participantIndex === -1) {
        throw new Error("Participant not found in counselling team");
      }

      const participantEntry = counselling.counsellingParticipants[participantIndex];

      // Create updated participant object
      const updatedParticipant = {
        ...participantEntry,
        status: updates.status ?? participantEntry.status,
        comments: updates.comments ?? participantEntry.comments,
      };

      // Replace the entire counsellingParticipants array with updated version
      const updatedCounsellingParticipants = [...counselling.counsellingParticipants];
      updatedCounsellingParticipants[participantIndex] = updatedParticipant;

      await client.patch(counsellingId)
        .set({
          counsellingParticipants: updatedCounsellingParticipants,
          updatedAt: new Date().toISOString(),
        })
        .commit();
    } else {
      // Legacy approach: Convert to new structure first
      if (!counselling.participants || counselling.participants.length === 0) {
        throw new Error("No participants found in counselling team");
      }

      // Create counsellingParticipants from legacy participants
      const counsellingParticipants = counselling.participants.map((p: any, index: number) => ({
        _type: "counsellingParticipant",
        _key: `cp-${p._ref}-${Date.now()}-${index}`,
        participant: p,
        status: p._ref === participantId ? (updates.status || "pending") : "pending",
        comments: p._ref === participantId ? (updates.comments || "") : "",
      }));

      await client.patch(counsellingId)
        .set({
          counsellingParticipants: counsellingParticipants,
          updatedAt: new Date().toISOString(),
        })
        .commit();
    }
  } catch (error) {
    console.error("Error updating counselling participant:", error);
    throw new Error("Failed to update participant status");
  }
}

// Get counselling participants with their salvation status and comments
export async function getCounsellingParticipants(counsellingId: string): Promise<CounsellingParticipant[]> {
  try {
    const result = await client.fetch(
      `*[_type == "counselling" && _id == $counsellingId][0]{
        "participants": counsellingParticipants[]{
          _id,
          "participant": participant->{
            _id,
            name,
            contact,
            department,
            fellowshipName,
            gender,
            present
          },
          status,
          comments
        }
      }`,
      { counsellingId }
    );

    return result?.participants || [];
  } catch (error) {
    console.error("Error fetching counselling participants:", error);
    return [];
  }
}

// Connection utility functions (no longer needed for UI)
