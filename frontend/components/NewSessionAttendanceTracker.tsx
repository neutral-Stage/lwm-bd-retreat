"use client";

import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  alpha,
  Snackbar,
  Alert,
  useTheme,
} from "@mui/material";
import {
  CheckCircle as PresentIcon,
  Cancel as AbsentIcon,
  RadioButtonUnchecked as UnmarkedIcon,
} from "@mui/icons-material";
import { Group } from "../types";
import { getSimpleSessionStatus } from "../lib/simple-session";
import { useOptimisticSessionUpdates } from "../hooks/useOptimisticSessionUpdates";
import { SessionStatus, SessionNumber } from "../lib/atomic-session-updates";

interface NewSessionAttendanceTrackerProps {
  group: Group;
  onDataUpdate: () => void; // Callback to refresh parent data
}

const SESSIONS = [1, 2, 3, 4, 5, 6] as const;

const NewSessionAttendanceTracker = React.memo(function NewSessionAttendanceTracker({
  group,
  onDataUpdate,
}: NewSessionAttendanceTrackerProps) {
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  // Safely get theme with fallback
  let theme;
  try {
    theme = useTheme();
  } catch (error) {
    console.warn("Theme context not available, using fallback theme:", error);
    // Fallback theme object
    theme = {
      palette: {
        primary: { main: "#1976d2" },
        success: { main: "#4caf50" },
        error: { main: "#f44336" },
        info: { main: "#2196f3" },
        grey: { 50: "#fafafa", 300: "#e0e0e0", 400: "#bdbdbd", 500: "#9e9e9e" },
      },
      shadows: ["", "", "", "", "0 2px 8px rgba(0,0,0,0.1)"],
    };
  }

  // Use optimistic updates hook for better UX and data integrity
  const {
    cycleSessionStatus,
    getOptimisticStatus,
    isSessionUpdating,
    error,
    clearError,
  } = useOptimisticSessionUpdates({
    groupId: group._id,
    onSuccess: (participantId, sessionNumber, newStatus) => {
      setSnackbar({
        open: true,
        message: `Session ${sessionNumber} updated successfully`,
        severity: "success",
      });
    },
    onError: (error) => {
      console.error("Session update error:", error);
      setSnackbar({
        open: true,
        message: error.retryable
          ? `Failed to update session. Click to retry.`
          : `Failed to update session. Please refresh and try again.`,
        severity: "error",
      });
    },
    onDataRefresh: onDataUpdate,
  });

  const handleSessionClick = async (
    participantId: string,
    sessionNumber: SessionNumber
  ) => {
    try {
      // Get current status (including any optimistic updates)
      const baseStatus = getSimpleSessionStatus(
        group.sessionAttendanceParticipants || [],
        participantId,
        sessionNumber
      );

      const currentStatus: SessionStatus =
        baseStatus === "unmarked" ? null : (baseStatus as SessionStatus);

      // Use optimistic update that handles race conditions
      await cycleSessionStatus(participantId, sessionNumber, currentStatus);
    } catch (error) {
      console.error("Error in handleSessionClick:", error);
      // Error handling is done by the hook
    }
  };

  const getStatusIcon = (
    status: "present" | "absent" | "unmarked",
    isUpdating: boolean
  ) => {
    if (isUpdating) {
      return (
        <Box
          sx={{
            width: { xs: 16, sm: 20 },
            height: { xs: 16, sm: 20 },
            borderRadius: "50%",
            border: `2px solid ${theme.palette.primary.main}`,
            backgroundColor: alpha(theme.palette.primary.main, 0.1),
            animation: "pulse 1s infinite",
          }}
        />
      );
    }

    const iconSize = { xs: 20, sm: 24 };

    switch (status) {
      case "present":
        return (
          <PresentIcon
            sx={{ color: theme.palette.success.main, fontSize: iconSize }}
          />
        );
      case "absent":
        return (
          <AbsentIcon sx={{ color: theme.palette.error.main, fontSize: iconSize }} />
        );
      case "unmarked":
        return (
          <UnmarkedIcon sx={{ color: theme.palette.grey[400], fontSize: iconSize }} />
        );
    }
  };

  const getStatusColor = (status: "present" | "absent" | "unmarked") => {
    switch (status) {
      case "present":
        return theme.palette.success.main;
      case "absent":
        return theme.palette.error.main;
      case "unmarked":
        return theme.palette.grey[400];
    }
  };

  if (!group.participants || group.participants.length === 0) {
    return (
      <Card sx={{ mt: 3 }}>
        <CardContent sx={{
          textAlign: "center",
          py: { xs: 4, sm: 6 },
          px: { xs: 2, sm: 3 }
        }}>
          <Typography
            variant="h6"
            color="text.secondary"
            gutterBottom
            sx={{
              fontSize: { xs: "1.125rem", sm: "1.25rem" }
            }}
          >
            No Participants Found
          </Typography>
          <Typography
            color="text.secondary"
            sx={{
              fontSize: { xs: "0.875rem", sm: "1rem" },
              lineHeight: { xs: 1.4, sm: 1.5 }
            }}
          >
            Add participants to this group to start tracking session attendance.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Typography
        variant="h5"
        fontWeight="600"
        color="primary.main"
        sx={{
          mb: 3,
          fontSize: { xs: "1.25rem", sm: "1.5rem" },
          textAlign: { xs: "center", sm: "left" }
        }}
      >
        📊 Session Attendance Tracking
      </Typography>

      <Card sx={{
        borderRadius: 3,
        boxShadow: theme.shadows[4],
        overflow: "hidden"
      }}>
        <CardContent sx={{ p: 0 }}>
          <TableContainer sx={{
            overflowX: "auto",
            maxWidth: "100%",
            // Improve scroll on mobile
            "&::-webkit-scrollbar": {
              height: 8,
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: alpha(theme.palette.grey[300], 0.3),
            },
            "&::-webkit-scrollbar-thumb": {
              backgroundColor: alpha(theme.palette.primary.main, 0.5),
              borderRadius: 4,
            },
          }}>
            <Table
              stickyHeader
              sx={{
                minWidth: { xs: 800, sm: "100%" }, // Ensure minimum width on mobile
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      backgroundColor: alpha(theme.palette.primary.main, 0.05),
                      borderBottom: `2px solid ${alpha(
                        theme.palette.primary.main,
                        0.1
                      )}`,
                      minWidth: { xs: 150, sm: 200 },
                      fontSize: { xs: "0.875rem", sm: "1rem" },
                      padding: { xs: "8px", sm: "16px" },
                    }}
                  >
                    Participant
                  </TableCell>
                  {SESSIONS.map((sessionNumber) => (
                    <TableCell
                      key={sessionNumber}
                      align="center"
                      sx={{
                        fontWeight: 600,
                        backgroundColor: alpha(
                          theme.palette.primary.main,
                          0.05
                        ),
                        borderBottom: `2px solid ${alpha(
                          theme.palette.primary.main,
                          0.1
                        )}`,
                        minWidth: { xs: 80, sm: 100 },
                        fontSize: { xs: "0.75rem", sm: "0.875rem" },
                        padding: { xs: "4px", sm: "16px" },
                      }}
                    >
                      <Box sx={{ display: { xs: "block", sm: "inline" } }}>
                        <Box sx={{ display: { xs: "none", sm: "inline" } }}>
                          Session {sessionNumber}
                        </Box>
                        <Box sx={{ display: { xs: "inline", sm: "none" } }}>
                          S{sessionNumber}
                        </Box>
                      </Box>
                    </TableCell>
                  ))}
                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: 600,
                      backgroundColor: alpha(theme.palette.success.main, 0.05),
                      borderBottom: `2px solid ${alpha(
                        theme.palette.success.main,
                        0.1
                      )}`,
                      minWidth: { xs: 100, sm: 120 },
                      fontSize: { xs: "0.75rem", sm: "0.875rem" },
                      padding: { xs: "4px", sm: "16px" },
                    }}
                  >
                    <Box sx={{ display: { xs: "block", sm: "inline" } }}>
                      <Box sx={{ display: { xs: "none", sm: "inline" } }}>
                        Attendance Rate
                      </Box>
                      <Box sx={{ display: { xs: "inline", sm: "none" } }}>
                        Rate
                      </Box>
                    </Box>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {group.participants.map((participant, index) => {
                  // Calculate attendance summary using optimistic updates
                  const presentCount = SESSIONS.filter((sessionNum) => {
                    const baseStatus = getSimpleSessionStatus(
                      group.sessionAttendanceParticipants || [],
                      participant._id,
                      sessionNum
                    );
                    const optimisticSessionStatus: SessionStatus =
                      baseStatus === "unmarked"
                        ? null
                        : (baseStatus as SessionStatus);
                    const currentStatus = getOptimisticStatus(
                      participant._id,
                      sessionNum,
                      optimisticSessionStatus
                    );
                    return currentStatus === "present";
                  }).length;

                  const attendanceSummary = {
                    presentSessions: presentCount,
                    totalSessions: 6,
                    attendanceRate: (presentCount / 6) * 100,
                  };

                  return (
                    <TableRow
                      key={participant._id}
                      sx={{
                        "&:hover": {
                          backgroundColor: alpha(
                            theme.palette.primary.main,
                            0.02
                          ),
                        },
                        backgroundColor:
                          index % 2 === 0
                            ? "transparent"
                            : alpha(theme.palette.grey[50], 0.5),
                      }}
                    >
                      <TableCell sx={{
                        py: { xs: 1, sm: 2 },
                        px: { xs: 1, sm: 2 }
                      }}>
                        <Box>
                          <Typography
                            variant="body1"
                            fontWeight="600"
                            sx={{
                              fontSize: { xs: "0.875rem", sm: "1rem" },
                              lineHeight: { xs: 1.2, sm: 1.5 }
                            }}
                          >
                            {participant.name}
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              fontSize: { xs: "0.75rem", sm: "0.875rem" },
                              display: { xs: "block", sm: "block" }
                            }}
                          >
                            {participant.fellowshipName}
                          </Typography>
                        </Box>
                      </TableCell>
                      {SESSIONS.map((sessionNumber) => {
                        // Get status with optimistic updates
                        const baseStatus = getSimpleSessionStatus(
                          group.sessionAttendanceParticipants || [],
                          participant._id,
                          sessionNumber
                        );
                        const optimisticSessionStatus: SessionStatus =
                          baseStatus === "unmarked"
                            ? null
                            : (baseStatus as SessionStatus);
                        const displayStatus = getOptimisticStatus(
                          participant._id,
                          sessionNumber,
                          optimisticSessionStatus
                        );
                        const finalStatus =
                          displayStatus === null ? "unmarked" : displayStatus;

                        const isUpdating = isSessionUpdating(
                          participant._id,
                          sessionNumber
                        );

                        return (
                          <TableCell
                            key={sessionNumber}
                            align="center"
                            sx={{
                              py: { xs: 1, sm: 2 },
                              px: { xs: 0.5, sm: 1 }
                            }}
                          >
                            <Tooltip
                              title={`Click to cycle: ${finalStatus} → ${
                                finalStatus === "unmarked"
                                  ? "present"
                                  : finalStatus === "present"
                                  ? "absent"
                                  : "unmarked"
                              }`}
                            >
                              <IconButton
                                onClick={() =>
                                  handleSessionClick(
                                    participant._id,
                                    sessionNumber
                                  )
                                }
                                disabled={isUpdating}
                                sx={{
                                  padding: { xs: 0.5, sm: 1 },
                                  borderRadius: 2,
                                  transition: "all 0.2s ease",
                                  minWidth: { xs: 32, sm: 40 },
                                  minHeight: { xs: 32, sm: 40 },
                                  "&:hover": {
                                    backgroundColor: alpha(
                                      getStatusColor(finalStatus),
                                      0.1
                                    ),
                                    transform: { xs: "scale(1.05)", sm: "scale(1.1)" },
                                  },
                                  "&:disabled": {
                                    opacity: 0.7,
                                  },
                                }}
                              >
                                {getStatusIcon(finalStatus, isUpdating)}
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        );
                      })}
                      <TableCell align="center" sx={{
                        py: { xs: 1, sm: 2 },
                        px: { xs: 0.5, sm: 1 }
                      }}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: { xs: 0.5, sm: 1 },
                            flexDirection: { xs: "column", sm: "row" },
                          }}
                        >
                          <Typography
                            variant="body1"
                            fontWeight="600"
                            color={
                              attendanceSummary.attendanceRate >= 80
                                ? "success.main"
                                : attendanceSummary.attendanceRate >= 60
                                ? "warning.main"
                                : "error.main"
                            }
                            sx={{
                              fontSize: { xs: "0.875rem", sm: "1rem" }
                            }}
                          >
                            {attendanceSummary.attendanceRate.toFixed(0)}%
                          </Typography>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                              fontSize: { xs: "0.75rem", sm: "0.875rem" }
                            }}
                          >
                            ({attendanceSummary.presentSessions}/
                            {attendanceSummary.totalSessions})
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>

      <style jsx>{`
        @keyframes pulse {
          0% {
            opacity: 0.5;
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 0.5;
          }
        }
      `}</style>
    </Box>
  );
});

export default NewSessionAttendanceTracker;
