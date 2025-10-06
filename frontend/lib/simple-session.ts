import { client } from "../service/sanityClient";

// Ultra-simple session attendance - updates ONE field at a time
export async function updateSingleSessionField(
  groupId: string,
  participantId: string,
  sessionNumber: 1 | 2 | 3 | 4 | 5 | 6,
  status: "present" | "absent" | null // null means unmarked/remove field
): Promise<void> {
  try {
    // Step 1: Get current group
    const group = await client.fetch(
      `*[_type == "group" && _id == $groupId][0] {
        _id,
        sessionAttendanceParticipants[] {
          _key,
          participant-> { _id },
          session1, session2, session3, session4, session5, session6
        }
      }`,
      { groupId }
    );

    if (!group) throw new Error("Group not found");

    let participants = group.sessionAttendanceParticipants || [];
    const sessionField = `session${sessionNumber}`;

    // Step 2: Find participant record
    let participantRecord = participants.find(
      (p: any) => p.participant?._id === participantId
    );

    // Step 3: Create record if doesn't exist
    if (!participantRecord) {
      participantRecord = {
        _type: "sessionAttendanceParticipant",
        _key: `simple-${participantId}-${Date.now()}`,
        participant: { _ref: participantId, _type: "reference" },
      };
      participants.push(participantRecord);
    }

    // Step 4: Update ONLY the specific session field
    if (status === null) {
      // Remove the field entirely for unmarked
      delete participantRecord[sessionField];
    } else {
      // Set only this session
      participantRecord[sessionField] = status;
    }

    // Step 5: Save back to Sanity
    await client
      .patch(groupId)
      .set({ sessionAttendanceParticipants: participants })
      .commit();
  } catch (error) {
    console.error("Simple session update error:", error);
    throw error;
  }
}

// Get session status - simple lookup
export function getSimpleSessionStatus(
  sessionAttendanceParticipants: any[],
  participantId: string,
  sessionNumber: 1 | 2 | 3 | 4 | 5 | 6
): "present" | "absent" | "unmarked" {
  const participant = sessionAttendanceParticipants?.find(
    (p) => p.participant?._id === participantId
  );

  if (!participant) return "unmarked";

  const sessionField = `session${sessionNumber}`;
  const value = participant[sessionField];

  return value === "present"
    ? "present"
    : value === "absent"
    ? "absent"
    : "unmarked";
}
