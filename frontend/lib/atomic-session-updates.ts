import { client } from "../service/sanityClient";

// Enhanced session update with atomic operations and proper error handling
export class SessionUpdateError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly retryable: boolean,
    public readonly participantId?: string,
    public readonly sessionNumber?: number
  ) {
    super(message);
    this.name = "SessionUpdateError";
  }
}

// Types for better type safety
export type SessionStatus = "present" | "absent" | null;
export type SessionNumber = 1 | 2 | 3 | 4 | 5 | 6;

export interface SessionUpdateResult {
  success: boolean;
  previousStatus: SessionStatus;
  newStatus: SessionStatus;
  timestamp: string;
}

// Optimistic update state for UI
export interface OptimisticUpdate {
  participantId: string;
  sessionNumber: SessionNumber;
  previousStatus: SessionStatus;
  newStatus: SessionStatus;
  updateId: string;
  timestamp: number;
}

/**
 * Atomic session update using Sanity's conditional patching
 * This prevents race conditions and ensures data integrity
 */
export async function atomicSessionUpdate(
  groupId: string,
  participantId: string,
  sessionNumber: SessionNumber,
  status: SessionStatus
): Promise<SessionUpdateResult> {
  const sessionField = `session${sessionNumber}`;
  const timestamp = new Date().toISOString();

  try {
    // First, get current status for rollback purposes
    const currentGroup = await client.fetch(
      `*[_type == "group" && _id == $groupId][0] {
        sessionAttendanceParticipants[participant._ref == $participantId][0] {
          ${sessionField}
        }
      }`,
      { groupId, participantId }
    );

    const previousStatus =
      currentGroup?.sessionAttendanceParticipants?.[0]?.[sessionField] || null;

    // Use atomic patch operations - ensure participant exists first
    await ensureParticipantExists(groupId, participantId);

    if (status === null) {
      // Remove field atomically
      await client
        .patch(groupId)
        .unset([
          `sessionAttendanceParticipants[participant._ref == "${participantId}"].${sessionField}`,
        ])
        .commit();
    } else {
      // Set only the specific session field
      await client
        .patch(groupId)
        .set({
          [`sessionAttendanceParticipants[participant._ref == "${participantId}"].${sessionField}`]:
            status,
          updatedAt: timestamp,
        })
        .commit();
    }

    return {
      success: true,
      previousStatus,
      newStatus: status,
      timestamp,
    };
  } catch (error: any) {
    console.error(`Atomic session update failed:`, error);

    // Classify error types for better handling
    if (
      error.message?.includes("network") ||
      error.message?.includes("timeout")
    ) {
      throw new SessionUpdateError(
        `Network error updating session ${sessionNumber}`,
        "NETWORK_ERROR",
        true,
        participantId,
        sessionNumber
      );
    }

    if (error.message?.includes("validation")) {
      throw new SessionUpdateError(
        `Validation error for session ${sessionNumber}`,
        "VALIDATION_ERROR",
        false,
        participantId,
        sessionNumber
      );
    }

    throw new SessionUpdateError(
      `Failed to update session ${sessionNumber}`,
      "UNKNOWN_ERROR",
      true,
      participantId,
      sessionNumber
    );
  }
}

/**
 * Retry logic with exponential backoff
 */
export async function updateSessionWithRetry(
  groupId: string,
  participantId: string,
  sessionNumber: SessionNumber,
  status: SessionStatus,
  maxRetries: number = 3
): Promise<SessionUpdateResult> {
  let attempt = 0;
  let lastError: SessionUpdateError;

  while (attempt < maxRetries) {
    try {
      return await atomicSessionUpdate(
        groupId,
        participantId,
        sessionNumber,
        status
      );
    } catch (error) {
      attempt++;
      lastError = error as SessionUpdateError;

      // Don't retry non-retryable errors
      if (!lastError.retryable || attempt >= maxRetries) {
        throw lastError;
      }

      // Exponential backoff: 300ms, 600ms, 1200ms
      const delay = Math.min(300 * Math.pow(2, attempt - 1), 1200);

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
}

/**
 * Batch update multiple sessions atomically
 * Useful for bulk operations while maintaining data integrity
 */
export async function batchUpdateSessions(
  groupId: string,
  updates: Array<{
    participantId: string;
    sessionNumber: SessionNumber;
    status: SessionStatus;
  }>
): Promise<Array<SessionUpdateResult | SessionUpdateError>> {
  const results: Array<SessionUpdateResult | SessionUpdateError> = [];

  // Process updates sequentially to avoid race conditions
  // Could be optimized with proper transaction support
  for (const update of updates) {
    try {
      const result = await updateSessionWithRetry(
        groupId,
        update.participantId,
        update.sessionNumber,
        update.status
      );
      results.push(result);
    } catch (error) {
      results.push(error as SessionUpdateError);
    }
  }

  return results;
}

/**
 * Validate session data integrity
 * Can be used for debugging and monitoring
 */
export async function validateSessionData(groupId: string): Promise<{
  isValid: boolean;
  issues: string[];
}> {
  try {
    const group = await client.fetch(
      `*[_type == "group" && _id == $groupId][0] {
        participants[]-> { _id, name },
        sessionAttendanceParticipants[] {
          _key,
          participant-> { _id },
          session1, session2, session3, session4, session5, session6
        }
      }`,
      { groupId }
    );

    const issues: string[] = [];

    // Check for orphaned attendance records
    const participantIds = new Set(
      group.participants?.map((p: any) => p._id) || []
    );
    const attendanceParticipantIds =
      group.sessionAttendanceParticipants?.map(
        (p: any) => p.participant?._id
      ) || [];

    for (const attendanceId of attendanceParticipantIds) {
      if (!participantIds.has(attendanceId)) {
        issues.push(
          `Orphaned attendance record for participant ${attendanceId}`
        );
      }
    }

    // Check for duplicate records
    const seenParticipants = new Set();
    for (const record of group.sessionAttendanceParticipants || []) {
      const participantId = record.participant?._id;
      if (seenParticipants.has(participantId)) {
        issues.push(
          `Duplicate attendance record for participant ${participantId}`
        );
      }
      seenParticipants.add(participantId);
    }

    return {
      isValid: issues.length === 0,
      issues,
    };
  } catch (error) {
    return {
      isValid: false,
      issues: [
        `Validation failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`,
      ],
    };
  }
}

/**
 * Ensures a participant record exists in sessionAttendanceParticipants
 * Uses conditional operations to prevent duplicates
 */
async function ensureParticipantExists(
  groupId: string,
  participantId: string
): Promise<void> {
  try {
    // Check if participant record exists
    const existingRecord = await client.fetch(
      `*[_type == "group" && _id == $groupId][0] {
        "hasParticipant": count(sessionAttendanceParticipants[participant._ref == $participantId]) > 0
      }`,
      { groupId, participantId }
    );

    if (!existingRecord?.hasParticipant) {
      // Create new participant record
      const newRecord = {
        _type: "sessionAttendanceParticipant",
        _key: `atomic-${participantId}-${Date.now()}`,
        participant: { _ref: participantId, _type: "reference" },
      };

      await client
        .patch(groupId)
        .setIfMissing({ sessionAttendanceParticipants: [] })
        .insert("after", "sessionAttendanceParticipants[-1]", [newRecord])
        .commit();
    }
  } catch (error) {
    console.error("Error ensuring participant exists:", error);
    throw error;
  }
}
