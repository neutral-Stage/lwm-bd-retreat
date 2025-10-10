"use client";

import { useState, useEffect } from "react";
import {
  Typography,
  Box,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Card,
  CardContent,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Grid,
  IconButton,
  Alert,
  Snackbar,
  Autocomplete,
} from "@mui/material";
import {
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  People as PeopleIcon,
  PersonAdd as PersonAddIcon,
  FileDownload as FileDownloadIcon,
} from "@mui/icons-material";
import { Group, Participant } from "../../types";
import {
  createGroup,
  updateGroup,
  deleteGroup,
  getAvailableParticipants,
  getAvailableVolunteers,
  getGroupSessionAttendance,
} from "../../lib/data-fetching";
import { exportGroupsToExcel } from "../../lib/excel-export";
import NewSessionAttendanceTracker from "../../components/NewSessionAttendanceTracker";

interface GroupsClientProps {
  groups: Group[];
}

export default function GroupsClient({
  groups: initialGroups,
}: GroupsClientProps) {
  const [groups, setGroups] = useState<Group[]>(initialGroups);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [availableParticipants, setAvailableParticipants] = useState<
    Participant[]
  >([]);
  const [availableVolunteers, setAvailableVolunteers] = useState<Participant[]>(
    []
  );
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });
  const [expandedCards, setExpandedCards] = useState<Record<string, boolean>>({});
  const [expandedAttendance, setExpandedAttendance] = useState<Record<string, boolean>>({});

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    participants: [] as Participant[],
    volunteers: [] as Participant[],
  });

  useEffect(() => {
    loadAvailableData();
  }, []);

  const loadAvailableData = async () => {
    try {
      const [participants, volunteers] = await Promise.all([
        getAvailableParticipants(),
        getAvailableVolunteers(),
      ]);
      setAvailableParticipants(participants);
      setAvailableVolunteers(volunteers);
    } catch (error) {
      console.error("Error loading available data:", error);
      setSnackbar({
        open: true,
        message: "Error loading participants and volunteers",
        severity: "error",
      });
    }
  };

  const handleCreateGroup = async () => {
    if (!formData.name.trim()) {
      setSnackbar({
        open: true,
        message: "Group name is required",
        severity: "error",
      });
      return;
    }

    setLoading(true);
    try {
      const newGroup = await createGroup({
        name: formData.name,
        description: formData.description,
        participants: formData.participants.map((p) => p._id),
        volunteers: formData.volunteers.map((v) => v._id),
      });

      // Fetch the complete group data with populated participants and volunteers
      const { getGroupById } = await import("../../lib/data-fetching");
      const completeGroup = await getGroupById(newGroup._id);

      if (completeGroup) {
        setGroups([...groups, completeGroup]);
      } else {
        // Fallback: manually construct the group with the data we have
        const groupWithParticipants = {
          ...newGroup,
          participants: formData.participants,
          volunteers: formData.volunteers,
        };
        setGroups([...groups, groupWithParticipants]);
      }

      setOpenCreateDialog(false);
      resetForm();
      setSnackbar({
        open: true,
        message: "Group created successfully",
        severity: "success",
      });
    } catch (error) {
      console.error("Error creating group:", error);
      setSnackbar({
        open: true,
        message: "Error creating group",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateGroup = async () => {
    if (!selectedGroup || !formData.name.trim()) {
      setSnackbar({
        open: true,
        message: "Group name is required",
        severity: "error",
      });
      return;
    }

    setLoading(true);
    try {
      await updateGroup(selectedGroup._id, {
        name: formData.name,
        description: formData.description,
        participants: formData.participants.map((p) => p._id),
        volunteers: formData.volunteers.map((v) => v._id),
      });

      // Fetch the complete group data with populated participants and volunteers
      const { getGroupById } = await import("../../lib/data-fetching");
      const completeGroup = await getGroupById(selectedGroup._id);

      if (completeGroup) {
        setGroups(
          groups.map((g) => (g._id === selectedGroup._id ? completeGroup : g))
        );
      } else {
        // Fallback: manually construct the group with the data we have
        const groupWithParticipants = {
          ...selectedGroup,
          name: formData.name,
          description: formData.description,
          participants: formData.participants,
          volunteers: formData.volunteers,
        };
        setGroups(
          groups.map((g) =>
            g._id === selectedGroup._id ? groupWithParticipants : g
          )
        );
      }

      setOpenEditDialog(false);
      resetForm();
      setSnackbar({
        open: true,
        message: "Group updated successfully",
        severity: "success",
      });
    } catch (error) {
      console.error("Error updating group:", error);
      setSnackbar({
        open: true,
        message: "Error updating group",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteGroup = async () => {
    if (!selectedGroup) return;

    setLoading(true);
    try {
      await deleteGroup(selectedGroup._id);
      setGroups(groups.filter((g) => g._id !== selectedGroup._id));
      setOpenDeleteDialog(false);
      setSelectedGroup(null);
      setSnackbar({
        open: true,
        message: "Group deleted successfully",
        severity: "success",
      });
    } catch (error) {
      console.error("Error deleting group:", error);
      setSnackbar({
        open: true,
        message: "Error deleting group",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      participants: [],
      volunteers: [],
    });
    setSelectedGroup(null);
  };

  const openEditGroupDialog = (group: Group) => {
    setSelectedGroup(group);
    setFormData({
      name: group.name,
      description: group.description || "",
      participants: group.participants || [],
      volunteers: group.volunteers || [],
    });
    setOpenEditDialog(true);
  };

  const openDeleteGroupDialog = (group: Group) => {
    setSelectedGroup(group);
    setOpenDeleteDialog(true);
  };

  const toggleCardExpanded = (groupId: string) => {
    setExpandedCards((prev) => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  const toggleAttendanceExpanded = (groupId: string) => {
    setExpandedAttendance((prev) => ({
      ...prev,
      [groupId]: !prev[groupId]
    }));
  };

  const handleDataRefresh = async () => {
    try {
      // Refresh groups data to show updated attendance
      const refreshedGroups = await Promise.all(
        groups.map(async (group) => {
          const updatedGroup = await getGroupSessionAttendance(group._id);
          return updatedGroup || group;
        })
      );
      setGroups(refreshedGroups);
    } catch (error) {
      console.error("Error refreshing data:", error);
    }
  };

  const handleExportGroups = () => {
    try {
      exportGroupsToExcel(groups);
      setSnackbar({
        open: true,
        message: "Groups exported to Excel successfully",
        severity: "success",
      });
    } catch (error) {
      console.error("Error exporting groups:", error);
      setSnackbar({
        open: true,
        message: "Error exporting groups to Excel",
        severity: "error",
      });
    }
  };

  return (
    <Box sx={{ padding: { xs: 2, sm: 3 } }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          mb: 3,
          flexDirection: { xs: "column", sm: "row" },
          gap: { xs: 2, sm: 0 },
        }}
      >
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontSize: { xs: "1.5rem", sm: "2.125rem" },
            fontWeight: { xs: 500, sm: 400 },
          }}
        >
          Groups Management
        </Typography>
        <Box
          sx={{
            display: "flex",
            gap: { xs: 1, sm: 2 },
            flexDirection: { xs: "column", sm: "row" },
            width: { xs: "100%", sm: "auto" },
          }}
        >
          <Button
            variant="outlined"
            startIcon={<FileDownloadIcon />}
            onClick={handleExportGroups}
            size="medium"
            disabled={groups.length === 0}
            sx={{
              fontSize: { xs: "0.875rem", sm: "1rem" },
              padding: { xs: "8px 16px", sm: "10px 20px" },
              width: { xs: "100%", sm: "auto" },
            }}
          >
            Export Excel
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenCreateDialog(true)}
            size="medium"
            sx={{
              fontSize: { xs: "0.875rem", sm: "1rem" },
              padding: { xs: "8px 16px", sm: "10px 20px" },
              width: { xs: "100%", sm: "auto" },
            }}
          >
            Create Group
          </Button>
        </Box>
      </Box>

      {groups.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: "center", py: 8 }}>
            <PeopleIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No groups found
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Create your first group to get started with organizing
              participants and volunteers.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenCreateDialog(true)}
            >
              Create First Group
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {groups.map((group) => (
            <Grid item xs={12} key={group._id}>
              <Accordion
                expanded={!!expandedCards[group._id]}
                onChange={() => toggleCardExpanded(group._id)}
                sx={{
                  boxShadow: 2,
                  "&:before": { display: "none" },
                  borderRadius: 2,
                  mb: 1,
                  overflow: "hidden",
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{
                    cursor: "pointer",
                    px: { xs: 2, sm: 3 },
                    py: { xs: 1.5, sm: 2 },
                    "& .MuiAccordionSummary-content": {
                      alignItems: { xs: "flex-start", sm: "center" },
                      margin: { xs: "8px 0", sm: "12px 0" },
                    },
                    "& .MuiAccordionSummary-expandIconWrapper": {
                      color: "primary.main",
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: { xs: "flex-start", sm: "center" },
                      width: "100%",
                      flexDirection: { xs: "column", sm: "row" },
                      gap: { xs: 2, sm: 0 },
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: { xs: "flex-start", sm: "center" },
                        gap: { xs: 1, sm: 2 },
                        flex: 1,
                        flexDirection: { xs: "column", sm: "row" },
                        width: { xs: "100%", sm: "auto" },
                      }}
                    >
                      <Typography
                        variant="h6"
                        component="h2"
                        sx={{
                          fontWeight: { xs: 500, sm: 600 },
                          fontSize: { xs: "1rem", sm: "1.25rem" }
                        }}
                      >
                        {group.name}
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          gap: 1,
                          flexWrap: "wrap",
                          width: { xs: "100%", sm: "auto" },
                        }}
                      >
                        <Chip
                          icon={<PeopleIcon />}
                          label={`${
                            group.participants?.length || 0
                          } Participants`}
                          color="primary"
                          variant="outlined"
                          size="small"
                          sx={{ fontSize: { xs: "0.7rem", sm: "0.8125rem" } }}
                        />
                        {group.volunteers && group.volunteers.length > 0 ? (
                          group.volunteers.map((volunteer) => (
                            <Chip
                              key={volunteer._id}
                              icon={<PersonAddIcon />}
                              label={`${volunteer.name} (Volunteer)`}
                              color="secondary"
                              variant="outlined"
                              size="small"
                              sx={{ fontSize: { xs: "0.7rem", sm: "0.8125rem" } }}
                            />
                          ))
                        ) : (
                          <Chip
                            icon={<PersonAddIcon />}
                            label="No Volunteers"
                            color="secondary"
                            variant="outlined"
                            size="small"
                            sx={{ fontSize: { xs: "0.7rem", sm: "0.8125rem" } }}
                          />
                        )}
                      </Box>
                    </Box>
                    <Box
                      sx={{
                        display: "flex",
                        gap: 1,
                        alignSelf: { xs: "flex-end", sm: "center" },
                        mt: { xs: 0, sm: 0 },
                      }}
                    >
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditGroupDialog(group);
                        }}
                        title="Edit Group"
                        sx={{
                          padding: { xs: 1, sm: 1 },
                        }}
                      >
                        <EditIcon sx={{ fontSize: { xs: "1.2rem", sm: "1.5rem" } }} />
                      </IconButton>
                    </Box>
                  </Box>
                </AccordionSummary>

                <AccordionDetails
                  sx={{
                    px: { xs: 2, sm: 3 },
                    pb: { xs: 2, sm: 3 },
                  }}
                >
                  <Box>
                    {group.description && (
                      <Typography
                        color="text.secondary"
                        sx={{
                          mb: 3,
                          fontSize: { xs: "0.9rem", sm: "1rem" },
                          lineHeight: { xs: 1.4, sm: 1.5 },
                        }}
                      >
                        {group.description}
                      </Typography>
                    )}

                    {/* Members Section */}
                    <Box sx={{ mb: 3 }}>
                      <Typography
                        variant="subtitle1"
                        color="primary"
                        gutterBottom
                        sx={{ fontWeight: 600, mb: 2 }}
                      >
                        Group Members
                      </Typography>

                      {group.participants && group.participants.length > 0 && (
                        <Box sx={{ mb: 2 }}>
                          <Typography
                            variant="subtitle2"
                            color="primary"
                            gutterBottom
                            sx={{ fontSize: "0.875rem" }}
                          >
                            Participants ({group.participants.length})
                          </Typography>
                          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                            {group.participants.map((participant) => (
                              <Chip
                                key={participant._id}
                                label={participant.name}
                                size="small"
                                variant="outlined"
                              />
                            ))}
                          </Box>
                        </Box>
                      )}

                      {group.volunteers && group.volunteers.length > 0 && (
                        <Box sx={{ mb: 2 }}>
                          <Typography
                            variant="subtitle2"
                            color="secondary"
                            gutterBottom
                            sx={{ fontSize: "0.875rem" }}
                          >
                            Volunteers ({group.volunteers.length})
                          </Typography>
                          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                            {group.volunteers.map((volunteer) => (
                              <Chip
                                key={volunteer._id}
                                label={volunteer.name}
                                size="small"
                                color="secondary"
                                variant="outlined"
                              />
                            ))}
                          </Box>
                        </Box>
                      )}

                      {(!group.participants || group.participants.length === 0) &&
                        (!group.volunteers || group.volunteers.length === 0) && (
                          <Typography color="text.secondary" variant="body2">
                            No members assigned to this group yet.
                          </Typography>
                        )}
                    </Box>

                    {/* Attendance Section with Lazy Loading */}
                    <Accordion
                      expanded={!!expandedAttendance[group._id]}
                      onChange={() => toggleAttendanceExpanded(group._id)}
                      sx={{
                        boxShadow: 1,
                        "&:before": { display: "none" },
                        borderRadius: 1
                      }}
                    >
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        sx={{
                          backgroundColor: "rgba(0, 0, 0, 0.02)",
                          "&:hover": { backgroundColor: "rgba(0, 0, 0, 0.04)" }
                        }}
                      >
                        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                          Session Attendance Tracker
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails sx={{ p: 0 }}>
                        {expandedAttendance[group._id] && (
                          <NewSessionAttendanceTracker
                            group={group}
                            onDataUpdate={handleDataRefresh}
                          />
                        )}
                      </AccordionDetails>
                    </Accordion>
                  </Box>
                </AccordionDetails>
              </Accordion>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create/Edit Group Dialog */}
      <Dialog
        open={openCreateDialog || openEditDialog}
        onClose={() => {
          setOpenCreateDialog(false);
          setOpenEditDialog(false);
          resetForm();
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {openCreateDialog ? "Create New Group" : "Edit Group"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              autoFocus
              label="Group Name"
              fullWidth
              variant="outlined"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              sx={{ mb: 3 }}
              required
            />

            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              sx={{ mb: 3 }}
            />

            <Autocomplete
              multiple
              options={availableParticipants}
              getOptionLabel={(option) =>
                `${option.name} (${option.fellowshipName})`
              }
              value={formData.participants}
              onChange={(_, newValue) =>
                setFormData({ ...formData, participants: newValue })
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Participants"
                  placeholder="Choose participants..."
                />
              )}
              sx={{ mb: 3 }}
            />

            <Autocomplete
              multiple
              options={availableVolunteers}
              getOptionLabel={(option) =>
                `${option.name} (${option.fellowshipName})`
              }
              value={formData.volunteers}
              onChange={(_, newValue) =>
                setFormData({ ...formData, volunteers: newValue })
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Volunteers"
                  placeholder="Choose volunteers..."
                />
              )}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenCreateDialog(false);
              setOpenEditDialog(false);
              resetForm();
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={openCreateDialog ? handleCreateGroup : handleUpdateGroup}
            variant="contained"
            disabled={loading}
          >
            {loading
              ? "Saving..."
              : openCreateDialog
              ? "Create Group"
              : "Update Group"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Delete Group</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the group "{selectedGroup?.name}"?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteGroup}
            color="error"
            variant="contained"
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
