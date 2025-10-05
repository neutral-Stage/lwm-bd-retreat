"use client";

import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Alert,
  LinearProgress,
  useTheme,
  alpha,
  Paper,
  Stack,
  Tooltip,
} from "@mui/material";
import {
  Close as CloseIcon,
  CheckCircle as PresentIcon,
  Cancel as AbsentIcon,
  SelectAll as SelectAllIcon,
  DeselectOutlined as DeselectAllIcon,
  Save as SaveIcon,
  CalendarToday as SessionIcon,
  Person as PersonIcon,
  Analytics as StatsIcon,
} from "@mui/icons-material";
import { Group, Participant, SessionAttendanceParticipant } from "../types";

interface AttendanceDialogProps {
  open: boolean;
  onClose: () => void;
  group: Group;
  onSaveAttendance: (attendanceData: {
    sessionNumber: number;
    participantAttendance: { participantId: string; status: "present" | "absent" }[];
  }) => Promise<void>;
}

interface ParticipantAttendanceState {
  participantId: string;
  participant: Participant;
  status: "present" | "absent" | "unmarked";
}

export default function AttendanceDialog({
  open,
  onClose,
  group,
  onSaveAttendance,
}: AttendanceDialogProps) {
  const theme = useTheme();
  const [selectedSession, setSelectedSession] = useState<number>(1);
  const [loading, setSaving] = useState(false);
  const [attendanceState, setAttendanceState] = useState<ParticipantAttendanceState[]>([]);

  // Initialize attendance state when session changes
  React.useEffect(() => {
    if (!group.participants) return;

    const newState: ParticipantAttendanceState[] = group.participants
      .filter(participant => participant?._id) // Filter out any null/undefined participants
      .map((participant) => {
        // Get current attendance status for this participant and session
        const attendanceParticipant = group.sessionAttendanceParticipants?.find(
          (sap) => sap?.participant?._id === participant._id
        );

        const sessionKey = `session${selectedSession}` as keyof SessionAttendanceParticipant;
        const existingStatus = attendanceParticipant?.[sessionKey];

        return {
          participantId: participant._id,
          participant,
          status: (existingStatus === "present" || existingStatus === "absent") ? existingStatus : "unmarked" as const,
        };
      });

    setAttendanceState(newState);
  }, [selectedSession, group]);

  const statistics = useMemo(() => {
    const total = attendanceState.length;
    const present = attendanceState.filter(p => p.status === "present").length;
    const absent = attendanceState.filter(p => p.status === "absent").length;
    const unmarked = total - present - absent;
    const attendanceRate = total > 0 ? (present / total) * 100 : 0;

    return { total, present, absent, unmarked, attendanceRate };
  }, [attendanceState]);

  const handleStatusChange = (participantId: string, status: "present" | "absent") => {
    setAttendanceState(prev =>
      prev.map(p =>
        p.participantId === participantId ? { ...p, status } : p
      )
    );
  };

  const handleBulkAction = (action: "all-present" | "all-absent" | "clear-all") => {
    setAttendanceState(prev =>
      prev.map(p => ({
        ...p,
        status: action === "all-present" ? "present" : action === "all-absent" ? "absent" : "unmarked"
      }))
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const participantAttendance = attendanceState
        .filter(p => p.status !== "unmarked")
        .map(p => ({
          participantId: p.participantId,
          status: p.status as "present" | "absent",
        }));

      await onSaveAttendance({
        sessionNumber: selectedSession,
        participantAttendance,
      });

      onClose();
    } catch (error) {
      console.error("Error saving attendance:", error);
    } finally {
      setSaving(false);
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

  const getStatusIcon = (status: "present" | "absent" | "unmarked") => {
    switch (status) {
      case "present":
        return <PresentIcon sx={{ color: theme.palette.success.main }} />;
      case "absent":
        return <AbsentIcon sx={{ color: theme.palette.error.main }} />;
      case "unmarked":
        return (
          <Box
            sx={{
              width: 24,
              height: 24,
              borderRadius: "50%",
              border: `2px solid ${theme.palette.grey[300]}`,
              backgroundColor: theme.palette.grey[100],
            }}
          />
        );
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      sx={{
        "& .MuiDialog-paper": {
          borderRadius: 3,
          minHeight: "70vh",
        },
      }}
    >
      <DialogTitle
        sx={{
          background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
          borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <SessionIcon sx={{ color: "primary.main" }} />
          <Box>
            <Typography variant="h6" fontWeight="600" color="primary.main">
              Session Attendance Management
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {group.name} - Track participant attendance
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} sx={{ color: "text.secondary" }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ p: 0 }}>
        <Box sx={{ p: 3 }}>
          {/* Session Selection */}
          <Box sx={{ mb: 3 }}>
            <FormControl fullWidth>
              <InputLabel>Select Session</InputLabel>
              <Select
                value={selectedSession}
                label="Select Session"
                onChange={(e) => setSelectedSession(Number(e.target.value))}
                sx={{ borderRadius: 2 }}
              >
                {Array.from({ length: 6 }, (_, i) => i + 1).map((sessionNum) => (
                  <MenuItem key={sessionNum} value={sessionNum}>
                    Session {sessionNum}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          {/* Statistics Card */}
          <Card
            sx={{
              mb: 3,
              background: `linear-gradient(135deg, ${alpha(theme.palette.info.main, 0.1)} 0%, ${alpha(theme.palette.info.main, 0.05)} 100%)`,
              border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
              borderRadius: 2,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <StatsIcon sx={{ color: "info.main", mr: 1.5 }} />
                <Typography variant="h6" fontWeight="600" color="info.main">
                  Session {selectedSession} Statistics
                </Typography>
              </Box>

              <Grid container spacing={2}>
                <Grid item xs={3}>
                  <Box sx={{ textAlign: "center" }}>
                    <Typography variant="h4" fontWeight="700" color="success.main">
                      {statistics.present}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Present
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={3}>
                  <Box sx={{ textAlign: "center" }}>
                    <Typography variant="h4" fontWeight="700" color="error.main">
                      {statistics.absent}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Absent
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={3}>
                  <Box sx={{ textAlign: "center" }}>
                    <Typography variant="h4" fontWeight="700" color="text.secondary">
                      {statistics.unmarked}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Unmarked
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={3}>
                  <Box sx={{ textAlign: "center" }}>
                    <Typography variant="h4" fontWeight="700" color="primary.main">
                      {Math.round(statistics.attendanceRate)}%
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Attendance
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              <Box sx={{ mt: 2 }}>
                <LinearProgress
                  variant="determinate"
                  value={statistics.attendanceRate}
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
              </Box>
            </CardContent>
          </Card>

          {/* Bulk Actions */}
          <Paper
            sx={{
              p: 2,
              mb: 3,
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.grey[300], 0.5)}`,
            }}
          >
            <Typography variant="subtitle1" fontWeight="600" gutterBottom>
              Quick Actions
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Button
                variant="outlined"
                color="success"
                startIcon={<SelectAllIcon />}
                onClick={() => handleBulkAction("all-present")}
                size="small"
                sx={{ borderRadius: 2 }}
              >
                Mark All Present
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<DeselectAllIcon />}
                onClick={() => handleBulkAction("all-absent")}
                size="small"
                sx={{ borderRadius: 2 }}
              >
                Mark All Absent
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => handleBulkAction("clear-all")}
                size="small"
                sx={{ borderRadius: 2 }}
              >
                Clear All
              </Button>
            </Stack>
          </Paper>

          {/* Participants List */}
          <Card sx={{ borderRadius: 2, boxShadow: theme.shadows[2] }}>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ p: 2, borderBottom: `1px solid ${alpha(theme.palette.grey[300], 0.5)}` }}>
                <Typography variant="h6" fontWeight="600" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <PersonIcon />
                  Participants ({attendanceState.length})
                </Typography>
              </Box>
              <List sx={{ maxHeight: 400, overflow: "auto" }}>
                {attendanceState.map((participant, index) => (
                  <React.Fragment key={participant.participantId}>
                    <ListItem
                      sx={{
                        py: 2,
                        "&:hover": {
                          backgroundColor: alpha(theme.palette.primary.main, 0.02),
                        },
                      }}
                    >
                      <ListItemIcon>
                        {getStatusIcon(participant.status)}
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="body1" fontWeight="600">
                            {participant.participant.name}
                          </Typography>
                        }
                        secondary={
                          <Typography variant="body2" color="text.secondary">
                            {participant.participant.fellowshipName}
                          </Typography>
                        }
                      />
                      <ListItemSecondaryAction>
                        <Stack direction="row" spacing={1}>
                          <Tooltip title="Mark Present">
                            <Button
                              variant={participant.status === "present" ? "contained" : "outlined"}
                              color="success"
                              size="small"
                              onClick={() => handleStatusChange(participant.participantId, "present")}
                              sx={{
                                minWidth: 80,
                                borderRadius: 2,
                                fontWeight: 600,
                                textTransform: "none",
                              }}
                            >
                              Present
                            </Button>
                          </Tooltip>
                          <Tooltip title="Mark Absent">
                            <Button
                              variant={participant.status === "absent" ? "contained" : "outlined"}
                              color="error"
                              size="small"
                              onClick={() => handleStatusChange(participant.participantId, "absent")}
                              sx={{
                                minWidth: 80,
                                borderRadius: 2,
                                fontWeight: 600,
                                textTransform: "none",
                              }}
                            >
                              Absent
                            </Button>
                          </Tooltip>
                        </Stack>
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < attendanceState.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>

          {statistics.unmarked > 0 && (
            <Alert
              severity="warning"
              sx={{ mt: 2, borderRadius: 2 }}
            >
              {statistics.unmarked} participant(s) have unmarked attendance.
              Only marked participants will be saved.
            </Alert>
          )}
        </Box>
      </DialogContent>

      <DialogActions
        sx={{
          p: 3,
          borderTop: `1px solid ${alpha(theme.palette.grey[300], 0.5)}`,
          background: alpha(theme.palette.grey[50], 0.5),
        }}
      >
        <Button
          onClick={onClose}
          sx={{
            borderRadius: 2,
            px: 3,
            fontWeight: 600,
            textTransform: "none",
          }}
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={loading || statistics.present + statistics.absent === 0}
          startIcon={loading ? undefined : <SaveIcon />}
          sx={{
            borderRadius: 2,
            px: 3,
            fontWeight: 600,
            textTransform: "none",
            boxShadow: theme.shadows[4],
            "&:hover": {
              boxShadow: theme.shadows[8],
            },
          }}
        >
          {loading ? "Saving..." : `Save Session ${selectedSession} Attendance`}
        </Button>
      </DialogActions>
    </Dialog>
  );
}