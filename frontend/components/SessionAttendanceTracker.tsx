"use client";

import React, { useState, useMemo } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Tooltip,
  Stack,
  Badge,
  useTheme,
  alpha,
  Divider,
  LinearProgress,
} from "@mui/material";
import {
  CheckCircle as PresentIcon,
  Cancel as AbsentIcon,
  PersonAdd as AddAttendanceIcon,
  Analytics as AnalyticsIcon,
  Groups as GroupIcon,
  CalendarToday as SessionIcon,
  TrendingUp as TrendingIcon,
} from "@mui/icons-material";
import { Group, SessionAttendanceParticipant } from "../types";

interface SessionAttendanceTrackerProps {
  group: Group;
  onOpenAttendanceDialog: () => void;
  onUpdateAttendance?: (participantId: string, sessionNumber: number, status: "present" | "absent") => void;
}

const TOTAL_SESSIONS = 6;
const SESSION_NUMBERS = Array.from({ length: TOTAL_SESSIONS }, (_, i) => i + 1);

export default function SessionAttendanceTracker({
  group,
  onOpenAttendanceDialog,
  onUpdateAttendance,
}: SessionAttendanceTrackerProps) {
  const theme = useTheme();

  // Helper function to get attendance status for a participant in a session
  const getAttendanceStatus = (participant: any, sessionNumber: number): "present" | "absent" | "unmarked" => {
    if (!participant?._id || !group.sessionAttendanceParticipants) return "unmarked";

    const attendanceParticipant = group.sessionAttendanceParticipants.find(
      (sap) => sap?.participant?._id === participant._id
    );

    if (!attendanceParticipant) return "unmarked";

    const sessionKey = `session${sessionNumber}` as keyof SessionAttendanceParticipant;
    const status = attendanceParticipant[sessionKey];

    return (status === "present" || status === "absent") ? status : "unmarked";
  };

  // Calculate statistics
  const statistics = useMemo(() => {
    const totalParticipants = group.participants?.length || 0;
    const sessionStats = SESSION_NUMBERS.map(sessionNumber => {
      const presentCount = group.participants?.filter(p =>
        getAttendanceStatus(p, sessionNumber) === "present"
      ).length || 0;
      const absentCount = group.participants?.filter(p =>
        getAttendanceStatus(p, sessionNumber) === "absent"
      ).length || 0;
      const unmarkedCount = totalParticipants - presentCount - absentCount;

      return {
        sessionNumber,
        present: presentCount,
        absent: absentCount,
        unmarked: unmarkedCount,
        attendanceRate: totalParticipants > 0 ? (presentCount / totalParticipants) * 100 : 0,
      };
    });

    const overallAttendance = group.participants?.map(participant => {
      const presentSessions = SESSION_NUMBERS.filter(sessionNumber =>
        getAttendanceStatus(participant, sessionNumber) === "present"
      ).length;
      const markedSessions = SESSION_NUMBERS.filter(sessionNumber =>
        getAttendanceStatus(participant, sessionNumber) !== "unmarked"
      ).length;

      return {
        participant,
        presentSessions,
        totalMarkedSessions: markedSessions,
        attendanceRate: markedSessions > 0 ? (presentSessions / markedSessions) * 100 : 0,
      };
    }) || [];

    return {
      sessionStats,
      overallAttendance,
      totalParticipants,
    };
  }, [group]);

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

  const getStatusIcon = (status: "present" | "absent" | "unmarked") => {
    switch (status) {
      case "present":
        return <PresentIcon sx={{ color: theme.palette.success.main, fontSize: 20 }} />;
      case "absent":
        return <AbsentIcon sx={{ color: theme.palette.error.main, fontSize: 20 }} />;
      case "unmarked":
        return (
          <Box
            sx={{
              width: 20,
              height: 20,
              borderRadius: "50%",
              border: `2px solid ${theme.palette.grey[300]}`,
              backgroundColor: theme.palette.grey[100],
            }}
          />
        );
    }
  };

  const handleToggleAttendance = (participantId: string, sessionNumber: number) => {
    const participant = group.participants?.find(p => p._id === participantId);
    if (!participant) return;

    const currentStatus = getAttendanceStatus(participant, sessionNumber);

    let newStatus: "present" | "absent";
    if (currentStatus === "present") {
      newStatus = "absent";
    } else {
      newStatus = "present";
    }

    onUpdateAttendance?.(participantId, sessionNumber, newStatus);
  };

  if (!group.participants || group.participants.length === 0) {
    return (
      <Card sx={{ mt: 3 }}>
        <CardContent sx={{ textAlign: "center", py: 6 }}>
          <GroupIcon sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Participants Found
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Add participants to this group to start tracking session attendance.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Box sx={{ mt: 4 }}>
      {/* Header Section */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <SessionIcon sx={{ color: "primary.main" }} />
          <Typography variant="h5" fontWeight="600" color="primary.main">
            Session Attendance Tracking
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddAttendanceIcon />}
          onClick={onOpenAttendanceDialog}
          sx={{
            borderRadius: 2,
            px: 3,
            py: 1.5,
            fontWeight: 600,
            textTransform: "none",
            boxShadow: theme.shadows[4],
            "&:hover": {
              boxShadow: theme.shadows[8],
              transform: "translateY(-2px)",
            },
            transition: "all 0.3s ease",
          }}
        >
          Manage Sessions
        </Button>
      </Box>

      {/* Statistics Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              borderRadius: 3,
              height: "100%",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <GroupIcon sx={{ color: "primary.main", mr: 1.5 }} />
                <Typography variant="h6" fontWeight="600" color="primary.main">
                  Total Participants
                </Typography>
              </Box>
              <Typography variant="h3" fontWeight="700" color="primary.main">
                {statistics.totalParticipants}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Active in this group
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card
            sx={{
              background: `linear-gradient(135deg, ${alpha(theme.palette.success.main, 0.1)} 0%, ${alpha(theme.palette.success.main, 0.05)} 100%)`,
              border: `1px solid ${alpha(theme.palette.success.main, 0.2)}`,
              borderRadius: 3,
              height: "100%",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <TrendingIcon sx={{ color: "success.main", mr: 1.5 }} />
                <Typography variant="h6" fontWeight="600" color="success.main">
                  Average Attendance
                </Typography>
              </Box>
              <Typography variant="h3" fontWeight="700" color="success.main">
                {statistics.sessionStats.length > 0
                  ? Math.round(statistics.sessionStats.reduce((acc, stat) => acc + stat.attendanceRate, 0) / statistics.sessionStats.length)
                  : 0}%
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Across all sessions
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card
            sx={{
              background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)} 0%, ${alpha(theme.palette.info.main, 0.05)} 100%)`,
              border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
              borderRadius: 3,
              height: "100%",
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <AnalyticsIcon sx={{ color: "info.main", mr: 1.5 }} />
                <Typography variant="h6" fontWeight="600" color="info.main">
                  Sessions Tracked
                </Typography>
              </Box>
              <Typography variant="h3" fontWeight="700" color="info.main">
                {statistics.sessionStats.filter(stat => stat.present + stat.absent > 0).length}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Out of {TOTAL_SESSIONS} total
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Session Statistics */}
      <Card sx={{ mb: 4, borderRadius: 3, boxShadow: theme.shadows[4] }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ p: 3, pb: 2 }}>
            <Typography variant="h6" fontWeight="600" color="text.primary">
              Session Overview
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Attendance statistics for each session
            </Typography>
          </Box>
          <Divider />
          <Box sx={{ p: 3 }}>
            <Grid container spacing={2}>
              {statistics.sessionStats.map((stat) => (
                <Grid item xs={12} sm={6} md={4} lg={2} key={stat.sessionNumber}>
                  <Paper
                    sx={{
                      p: 2.5,
                      textAlign: "center",
                      borderRadius: 2,
                      background: stat.present + stat.absent === 0
                        ? alpha(theme.palette.grey[500], 0.05)
                        : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
                      border: `1px solid ${stat.present + stat.absent === 0
                        ? alpha(theme.palette.grey[300], 0.5)
                        : alpha(theme.palette.primary.main, 0.1)}`,
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: theme.shadows[4],
                      },
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight="600" color="primary.main" gutterBottom>
                      Session {stat.sessionNumber}
                    </Typography>

                    <Box sx={{ mb: 2 }}>
                      <LinearProgress
                        variant="determinate"
                        value={stat.attendanceRate}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          backgroundColor: alpha(theme.palette.grey[300], 0.3),
                          "& .MuiLinearProgress-bar": {
                            borderRadius: 4,
                            background: `linear-gradient(45deg, ${theme.palette.success.main} 0%, ${theme.palette.success.light} 100%)`,
                          },
                        }}
                      />
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {stat.attendanceRate.toFixed(0)}% attendance
                      </Typography>
                    </Box>

                    <Stack direction="row" spacing={1} justifyContent="center">
                      <Chip
                        label={`${stat.present} Present`}
                        color="success"
                        size="small"
                        variant="outlined"
                      />
                      <Chip
                        label={`${stat.absent} Absent`}
                        color="error"
                        size="small"
                        variant="outlined"
                      />
                    </Stack>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        </CardContent>
      </Card>

      {/* Attendance Grid */}
      <Card sx={{ borderRadius: 3, boxShadow: theme.shadows[4] }}>
        <CardContent sx={{ p: 0 }}>
          <Box sx={{ p: 3, pb: 2 }}>
            <Typography variant="h6" fontWeight="600" color="text.primary">
              Individual Attendance
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Click on any cell to toggle attendance status
            </Typography>
          </Box>
          <Divider />
          <TableContainer>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      fontWeight: 600,
                      backgroundColor: alpha(theme.palette.primary.main, 0.05),
                      borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                      minWidth: 200,
                    }}
                  >
                    Participant
                  </TableCell>
                  {SESSION_NUMBERS.map((sessionNumber) => (
                    <TableCell
                      key={sessionNumber}
                      align="center"
                      sx={{
                        fontWeight: 600,
                        backgroundColor: alpha(theme.palette.primary.main, 0.05),
                        borderBottom: `2px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                        minWidth: 100,
                      }}
                    >
                      Session {sessionNumber}
                    </TableCell>
                  ))}
                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: 600,
                      backgroundColor: alpha(theme.palette.success.main, 0.05),
                      borderBottom: `2px solid ${alpha(theme.palette.success.main, 0.1)}`,
                      minWidth: 120,
                    }}
                  >
                    Attendance Rate
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {group.participants.map((participant, index) => {
                  const participantStats = statistics.overallAttendance.find(
                    (stat) => stat.participant?._id === participant._id
                  );

                  return (
                    <TableRow
                      key={participant._id}
                      sx={{
                        "&:hover": {
                          backgroundColor: alpha(theme.palette.primary.main, 0.02),
                        },
                        backgroundColor: index % 2 === 0 ? "transparent" : alpha(theme.palette.grey[50], 0.5),
                      }}
                    >
                      <TableCell sx={{ py: 2 }}>
                        <Box>
                          <Typography variant="body1" fontWeight="600">
                            {participant.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {participant.fellowshipName}
                          </Typography>
                        </Box>
                      </TableCell>
                      {SESSION_NUMBERS.map((sessionNumber) => {
                        const status = getAttendanceStatus(participant, sessionNumber);
                        return (
                          <TableCell key={sessionNumber} align="center" sx={{ py: 2 }}>
                            <Tooltip title={`Click to toggle attendance for Session ${sessionNumber}`}>
                              <IconButton
                                onClick={() => handleToggleAttendance(participant._id, sessionNumber)}
                                sx={{
                                  padding: 1,
                                  borderRadius: 2,
                                  transition: "all 0.2s ease",
                                  "&:hover": {
                                    backgroundColor: alpha(getStatusColor(status), 0.1),
                                    transform: "scale(1.1)",
                                  },
                                }}
                              >
                                {getStatusIcon(status)}
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        );
                      })}
                      <TableCell align="center" sx={{ py: 2 }}>
                        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
                          <Typography
                            variant="body1"
                            fontWeight="600"
                            color={
                              participantStats && participantStats.attendanceRate >= 80
                                ? "success.main"
                                : participantStats && participantStats.attendanceRate >= 60
                                ? "warning.main"
                                : "error.main"
                            }
                          >
                            {participantStats ? `${participantStats.attendanceRate.toFixed(0)}%` : "0%"}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            ({participantStats?.presentSessions || 0}/{participantStats?.totalMarkedSessions || 0})
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
    </Box>
  );
}