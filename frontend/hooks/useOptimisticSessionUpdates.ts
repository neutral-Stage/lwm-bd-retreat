import { useState, useCallback, useRef } from "react";
import {
  SessionStatus,
  SessionNumber,
  OptimisticUpdate,
  updateSessionWithRetry,
  SessionUpdateError,
} from "../lib/atomic-session-updates";

interface UseOptimisticSessionUpdatesProps {
  groupId: string;
  onSuccess?: (
    participantId: string,
    sessionNumber: SessionNumber,
    newStatus: SessionStatus
  ) => void;
  onError?: (error: SessionUpdateError) => void;
  onDataRefresh?: () => void;
}

interface SessionUpdateState {
  isUpdating: boolean;
  pendingUpdates: Map<string, OptimisticUpdate>;
  error: SessionUpdateError | null;
}

/**
 * Custom hook for managing optimistic session updates with proper rollback
 * Provides immediate UI feedback while handling background updates safely
 */
export function useOptimisticSessionUpdates({
  groupId,
  onSuccess,
  onError,
  onDataRefresh,
}: UseOptimisticSessionUpdatesProps) {
  const [state, setState] = useState<SessionUpdateState>({
    isUpdating: false,
    pendingUpdates: new Map(),
    error: null,
  });

  // Track ongoing updates to prevent duplicate requests
  const activeUpdates = useRef(new Set<string>());

  const updateKey = useCallback(
    (participantId: string, sessionNumber: SessionNumber) =>
      `${participantId}-${sessionNumber}`,
    []
  );

  /**
   * Get the current status for a session, considering optimistic updates
   */
  const getOptimisticStatus = useCallback(
    (
      participantId: string,
      sessionNumber: SessionNumber,
      baseStatus: SessionStatus
    ): SessionStatus => {
      const key = updateKey(participantId, sessionNumber);
      const optimisticUpdate = state.pendingUpdates.get(key);
      return optimisticUpdate ? optimisticUpdate.newStatus : baseStatus;
    },
    [state.pendingUpdates, updateKey]
  );

  /**
   * Check if a specific session is currently being updated
   */
  const isSessionUpdating = useCallback(
    (participantId: string, sessionNumber: SessionNumber): boolean => {
      const key = updateKey(participantId, sessionNumber);
      return activeUpdates.current.has(key);
    },
    [updateKey]
  );

  /**
   * Add an optimistic update to the state
   */
  const addOptimisticUpdate = useCallback(
    (
      participantId: string,
      sessionNumber: SessionNumber,
      previousStatus: SessionStatus,
      newStatus: SessionStatus
    ) => {
      const key = updateKey(participantId, sessionNumber);
      const optimisticUpdate: OptimisticUpdate = {
        participantId,
        sessionNumber,
        previousStatus,
        newStatus,
        updateId: `${key}-${Date.now()}`,
        timestamp: Date.now(),
      };

      setState((prev) => ({
        ...prev,
        pendingUpdates: new Map(prev.pendingUpdates).set(key, optimisticUpdate),
        error: null,
      }));
    },
    [updateKey]
  );

  /**
   * Remove an optimistic update from the state
   */
  const removeOptimisticUpdate = useCallback(
    (participantId: string, sessionNumber: SessionNumber) => {
      const key = updateKey(participantId, sessionNumber);
      setState((prev) => {
        const newPendingUpdates = new Map(prev.pendingUpdates);
        newPendingUpdates.delete(key);
        return {
          ...prev,
          pendingUpdates: newPendingUpdates,
        };
      });
    },
    [updateKey]
  );

  /**
   * Rollback an optimistic update in case of error
   */
  const rollbackOptimisticUpdate = useCallback(
    (
      participantId: string,
      sessionNumber: SessionNumber,
      error: SessionUpdateError
    ) => {
      const key = updateKey(participantId, sessionNumber);
      setState((prev) => {
        const newPendingUpdates = new Map(prev.pendingUpdates);
        newPendingUpdates.delete(key);
        return {
          ...prev,
          pendingUpdates: newPendingUpdates,
          error,
        };
      });
    },
    [updateKey]
  );

  /**
   * Main function to update a session with optimistic updates
   */
  const updateSession = useCallback(
    async (
      participantId: string,
      sessionNumber: SessionNumber,
      currentStatus: SessionStatus,
      newStatus: SessionStatus
    ) => {
      const key = updateKey(participantId, sessionNumber);

      // Prevent duplicate updates
      if (activeUpdates.current.has(key)) {
        console.warn(`Update already in progress for ${key}`);
        return;
      }

      try {
        // Mark as updating
        activeUpdates.current.add(key);
        setState((prev) => ({ ...prev, isUpdating: true, error: null }));

        // Add optimistic update immediately
        addOptimisticUpdate(
          participantId,
          sessionNumber,
          currentStatus,
          newStatus
        );

        // Perform the actual update
        const result = await updateSessionWithRetry(
          groupId,
          participantId,
          sessionNumber,
          newStatus
        );

        // Remove optimistic update on success
        removeOptimisticUpdate(participantId, sessionNumber);

        // Notify success
        onSuccess?.(participantId, sessionNumber, newStatus);

        // Refresh data to ensure consistency
        onDataRefresh?.();
      } catch (error) {
        const sessionError = error as SessionUpdateError;
        console.error(`Session update failed:`, sessionError);

        // Rollback optimistic update
        rollbackOptimisticUpdate(participantId, sessionNumber, sessionError);

        // Notify error
        onError?.(sessionError);
      } finally {
        // Clean up
        activeUpdates.current.delete(key);
        setState((prev) => ({
          ...prev,
          isUpdating: activeUpdates.current.size > 0,
        }));
      }
    },
    [
      groupId,
      updateKey,
      addOptimisticUpdate,
      removeOptimisticUpdate,
      rollbackOptimisticUpdate,
      onSuccess,
      onError,
      onDataRefresh,
    ]
  );

  /**
   * Cycle through session statuses: unmarked → present → absent → unmarked
   */
  const cycleSessionStatus = useCallback(
    async (
      participantId: string,
      sessionNumber: SessionNumber,
      currentStatus: SessionStatus
    ) => {
      let newStatus: SessionStatus;

      switch (currentStatus) {
        case null: // unmarked
          newStatus = "present";
          break;
        case "present":
          newStatus = "absent";
          break;
        case "absent":
          newStatus = null; // back to unmarked
          break;
        default:
          newStatus = "present";
      }

      await updateSession(
        participantId,
        sessionNumber,
        currentStatus,
        newStatus
      );
    },
    [updateSession]
  );

  /**
   * Clear any error state
   */
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  /**
   * Get current update statistics
   */
  const getUpdateStats = useCallback(
    () => ({
      totalPending: state.pendingUpdates.size,
      isAnyUpdating: state.isUpdating,
      hasError: !!state.error,
      activeUpdateCount: activeUpdates.current.size,
    }),
    [state]
  );

  return {
    // Main functions
    updateSession,
    cycleSessionStatus,

    // Status functions
    getOptimisticStatus,
    isSessionUpdating,

    // State management
    clearError,
    getUpdateStats,

    // Current state
    isUpdating: state.isUpdating,
    error: state.error,
    pendingUpdates: state.pendingUpdates,
  };
}
