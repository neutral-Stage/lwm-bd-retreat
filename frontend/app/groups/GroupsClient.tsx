"use client";

import { useState, useEffect } from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
  Divider,
  IconButton,
  Alert,
  Snackbar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Autocomplete,
} from "@mui/material";
import {
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  People as PeopleIcon,
  PersonAdd as PersonAddIcon,
} from "@mui/icons-material";
import { Group, Participant } from "../../types";
import {
  createGroup,
  updateGroup,
  deleteGroup,
  getAvailableParticipants,
  getAvailableVolunteers,
} from "../../lib/data-fetching";

interface GroupsClientProps {
  groups: Group[];
}

export default function GroupsClient({ groups: initialGroups }: GroupsClientProps) {
  const [groups, setGroups] = useState<Group[]>(initialGroups);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);
  const [availableParticipants, setAvailableParticipants] = useState<Participant[]>([]);
  const [availableVolunteers, setAvailableVolunteers] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

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
        participants: formData.participants.map(p => p._id),
        volunteers: formData.volunteers.map(v => v._id),
      });

      setGroups([...groups, newGroup]);
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
      const updatedGroup = await updateGroup(selectedGroup._id, {
        name: formData.name,
        description: formData.description,
        participants: formData.participants,
        volunteers: formData.volunteers,
      });

      setGroups(groups.map(g => g._id === selectedGroup._id ? updatedGroup : g));
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
      setGroups(groups.filter(g => g._id !== selectedGroup._id));
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

  return (
    <Box sx={{ padding: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" component="h1">
          Groups Management
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenCreateDialog(true)}
          size="large"
        >
          Create Group
        </Button>
      </Box>

      {groups.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: "center", py: 8 }}>
            <PeopleIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No groups found
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Create your first group to get started with organizing participants and volunteers.
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
            <Grid item xs={12} md={6} lg={4} key={group._id}>
              <Card sx={{ height: "100%" }}>
                <CardContent>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                    <Typography variant="h6" component="h2" gutterBottom>
                      {group.name}
                    </Typography>
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => openEditGroupDialog(group)}
                        title="Edit Group"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => openDeleteGroupDialog(group)}
                        title="Delete Group"
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>

                  {group.description && (
                    <Typography color="text.secondary" sx={{ mb: 2 }}>
                      {group.description}
                    </Typography>
                  )}

                  <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                    <Chip
                      icon={<PeopleIcon />}
                      label={`${group.participants?.length || 0} Participants`}
                      color="primary"
                      variant="outlined"
                    />
                    <Chip
                      icon={<PersonAddIcon />}
                      label={`${group.volunteers?.length || 0} Volunteers`}
                      color="secondary"
                      variant="outlined"
                    />
                  </Box>

                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="subtitle2">View Members</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      {group.participants && group.participants.length > 0 && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" color="primary" gutterBottom>
                            Participants
                          </Typography>
                          {group.participants.map((participant) => (
                            <Chip
                              key={participant._id}
                              label={participant.name}
                              size="small"
                              sx={{ mr: 1, mb: 1 }}
                            />
                          ))}
                        </Box>
                      )}

                      {group.volunteers && group.volunteers.length > 0 && (
                        <Box>
                          <Typography variant="subtitle2" color="secondary" gutterBottom>
                            Volunteers
                          </Typography>
                          {group.volunteers.map((volunteer) => (
                            <Chip
                              key={volunteer._id}
                              label={volunteer.name}
                              size="small"
                              color="secondary"
                              sx={{ mr: 1, mb: 1 }}
                            />
                          ))}
                        </Box>
                      )}

                      {(!group.participants || group.participants.length === 0) &&
                        (!group.volunteers || group.volunteers.length === 0) && (
                          <Typography color="text.secondary" variant="body2">
                            No members assigned to this group yet.
                          </Typography>
                        )}
                    </AccordionDetails>
                  </Accordion>
                </CardContent>
              </Card>
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
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
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
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              sx={{ mb: 3 }}
            />

            <Autocomplete
              multiple
              options={availableParticipants}
              getOptionLabel={(option) => `${option.name} (${option.fellowshipName})`}
              value={formData.participants}
              onChange={(_, newValue) => setFormData({ ...formData, participants: newValue })}
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
              getOptionLabel={(option) => `${option.name} (${option.fellowshipName})`}
              value={formData.volunteers}
              onChange={(_, newValue) => setFormData({ ...formData, volunteers: newValue })}
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
            {loading ? "Saving..." : openCreateDialog ? "Create Group" : "Update Group"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Delete Group</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the group "{selectedGroup?.name}"? This action cannot be undone.
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