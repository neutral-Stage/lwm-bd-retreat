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
  Grid,
  IconButton,
  Alert,
  Snackbar,
  Autocomplete,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import {
  Add as AddIcon,
  ExpandMore as ExpandMoreIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Psychology as PersonCheckIcon,
  Group as GroupIcon,
  Schedule as ScheduleIcon,
  LocationOn as LocationIcon,
} from "@mui/icons-material";
import { Counselling, Participant } from "../../types";
import {
  createCounselling,
  updateCounselling,
  deleteCounselling,
  getAvailableCounsellors,
  getAvailableCounsellingParticipants,
  getAssignedCounsellingMembers,
} from "../../lib/data-fetching";

interface CounsellingClientProps {
  counsellings: Counselling[];
}

const statusColors = {
  active: "success",
  inactive: "default",
  completed: "info",
} as const;

const statusLabels = {
  active: "Active",
  inactive: "Inactive",
  completed: "Completed",
};

export default function CounsellingClient({ counsellings: initialCounsellings }: CounsellingClientProps) {
  const [counsellings, setCounsellings] = useState<Counselling[]>(initialCounsellings);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedCounselling, setSelectedCounselling] = useState<Counselling | null>(null);
  const [availableCounsellors, setAvailableCounsellors] = useState<Participant[]>([]);
  const [availableParticipants, setAvailableParticipants] = useState<Participant[]>([]);
  const [assignedMembers, setAssignedMembers] = useState<{
    counsellors: string[];
    participants: string[];
  }>({ counsellors: [], participants: [] });
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
    counsellor: null as Participant | null,
    participants: [] as Participant[],
    meetingSchedule: "",
    location: "",
    status: "active" as "active" | "inactive" | "completed",
    notes: "",
  });

  useEffect(() => {
    loadAvailableData();
  }, []);

  const loadAvailableData = async () => {
    try {
      const [counsellors, participants, assigned] = await Promise.all([
        getAvailableCounsellors(),
        getAvailableCounsellingParticipants(),
        getAssignedCounsellingMembers(),
      ]);
      setAvailableCounsellors(counsellors);
      setAvailableParticipants(participants);
      setAssignedMembers(assigned);
    } catch (error) {
      console.error("Error loading available data:", error);
      setSnackbar({
        open: true,
        message: "Error loading counsellors and participants",
        severity: "error",
      });
    }
  };

  // Filter available counsellors to exclude already assigned ones (except current selection)
  const getFilteredCounsellors = () => {
    return availableCounsellors.filter(counsellor =>
      !assignedMembers.counsellors.includes(counsellor._id) ||
      (selectedCounselling && selectedCounselling.counsellor._id === counsellor._id)
    );
  };

  // Filter available participants to exclude already assigned ones (except current selection)
  const getFilteredParticipants = () => {
    const currentlySelectedIds = selectedCounselling?.participants.map(p => p._id) || [];
    return availableParticipants.filter(participant =>
      !assignedMembers.participants.includes(participant._id) ||
      currentlySelectedIds.includes(participant._id)
    );
  };

  const handleCreateCounselling = async () => {
    if (!formData.name.trim()) {
      setSnackbar({
        open: true,
        message: "Team name is required",
        severity: "error",
      });
      return;
    }

    if (!formData.counsellor) {
      setSnackbar({
        open: true,
        message: "Please select a counsellor",
        severity: "error",
      });
      return;
    }

    if (formData.participants.length === 0) {
      setSnackbar({
        open: true,
        message: "Please select at least one participant",
        severity: "error",
      });
      return;
    }

    // Validate uniqueness
    if (assignedMembers.counsellors.includes(formData.counsellor._id)) {
      setSnackbar({
        open: true,
        message: "This counsellor is already assigned to another team",
        severity: "error",
      });
      return;
    }

    const duplicateParticipants = formData.participants.filter(p =>
      assignedMembers.participants.includes(p._id)
    );
    if (duplicateParticipants.length > 0) {
      setSnackbar({
        open: true,
        message: `These participants are already assigned: ${duplicateParticipants.map(p => p.name).join(", ")}`,
        severity: "error",
      });
      return;
    }

    setLoading(true);
    try {
      const newCounselling = await createCounselling({
        name: formData.name,
        description: formData.description,
        counsellor: formData.counsellor._id,
        participants: formData.participants.map(p => p._id),
        meetingSchedule: formData.meetingSchedule,
        location: formData.location,
        status: formData.status,
        notes: formData.notes,
      });

      setCounsellings([...counsellings, newCounselling]);
      setOpenCreateDialog(false);
      resetForm();
      await loadAvailableData(); // Refresh assigned members
      setSnackbar({
        open: true,
        message: "Counselling team created successfully",
        severity: "success",
      });
    } catch (error) {
      console.error("Error creating counselling:", error);
      setSnackbar({
        open: true,
        message: "Error creating counselling team",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCounselling = async () => {
    if (!selectedCounselling || !formData.name.trim()) {
      setSnackbar({
        open: true,
        message: "Team name is required",
        severity: "error",
      });
      return;
    }

    if (!formData.counsellor) {
      setSnackbar({
        open: true,
        message: "Please select a counsellor",
        severity: "error",
      });
      return;
    }

    if (formData.participants.length === 0) {
      setSnackbar({
        open: true,
        message: "Please select at least one participant",
        severity: "error",
      });
      return;
    }

    setLoading(true);
    try {
      const updatedCounselling = await updateCounselling(selectedCounselling._id, {
        name: formData.name,
        description: formData.description,
        counsellor: formData.counsellor,
        participants: formData.participants,
        meetingSchedule: formData.meetingSchedule,
        location: formData.location,
        status: formData.status,
        notes: formData.notes,
      });

      setCounsellings(counsellings.map(c => c._id === selectedCounselling._id ? updatedCounselling : c));
      setOpenEditDialog(false);
      resetForm();
      await loadAvailableData(); // Refresh assigned members
      setSnackbar({
        open: true,
        message: "Counselling team updated successfully",
        severity: "success",
      });
    } catch (error) {
      console.error("Error updating counselling:", error);
      setSnackbar({
        open: true,
        message: "Error updating counselling team",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCounselling = async () => {
    if (!selectedCounselling) return;

    setLoading(true);
    try {
      await deleteCounselling(selectedCounselling._id);
      setCounsellings(counsellings.filter(c => c._id !== selectedCounselling._id));
      setOpenDeleteDialog(false);
      setSelectedCounselling(null);
      await loadAvailableData(); // Refresh assigned members
      setSnackbar({
        open: true,
        message: "Counselling team deleted successfully",
        severity: "success",
      });
    } catch (error) {
      console.error("Error deleting counselling:", error);
      setSnackbar({
        open: true,
        message: "Error deleting counselling team",
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
      counsellor: null,
      participants: [],
      meetingSchedule: "",
      location: "",
      status: "active",
      notes: "",
    });
    setSelectedCounselling(null);
  };

  const openEditCounsellingDialog = (counselling: Counselling) => {
    setSelectedCounselling(counselling);
    setFormData({
      name: counselling.name,
      description: counselling.description || "",
      counsellor: counselling.counsellor,
      participants: counselling.participants || [],
      meetingSchedule: counselling.meetingSchedule || "",
      location: counselling.location || "",
      status: counselling.status,
      notes: counselling.notes || "",
    });
    setOpenEditDialog(true);
  };

  const openDeleteCounsellingDialog = (counselling: Counselling) => {
    setSelectedCounselling(counselling);
    setOpenDeleteDialog(true);
  };

  return (
    <Box sx={{ padding: 3 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" component="h1">
          Counselling Teams
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            resetForm();
            setOpenCreateDialog(true);
          }}
          size="large"
        >
          Create Team
        </Button>
      </Box>

      {counsellings.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: "center", py: 8 }}>
            <PersonCheckIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No counselling teams found
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Create your first counselling team to get started with organizing counsellors and participants.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                resetForm();
                setOpenCreateDialog(true);
              }}
            >
              Create First Team
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {counsellings.map((counselling) => (
            <Grid item xs={12} md={6} lg={4} key={counselling._id}>
              <Card sx={{ height: "100%" }}>
                <CardContent>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="h6" component="h2" gutterBottom>
                        {counselling.name}
                      </Typography>
                      <Chip
                        label={statusLabels[counselling.status]}
                        color={statusColors[counselling.status]}
                        size="small"
                        sx={{ mb: 1 }}
                      />
                    </Box>
                    <Box>
                      <IconButton
                        size="small"
                        onClick={() => openEditCounsellingDialog(counselling)}
                        title="Edit Team"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => openDeleteCounsellingDialog(counselling)}
                        title="Delete Team"
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>

                  {counselling.description && (
                    <Typography color="text.secondary" sx={{ mb: 2 }}>
                      {counselling.description}
                    </Typography>
                  )}

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="primary" gutterBottom>
                      <PersonCheckIcon sx={{ fontSize: 16, mr: 1, verticalAlign: "middle" }} />
                      Counsellor
                    </Typography>
                    <Chip
                      label={`${counselling.counsellor.name} (${counselling.counsellor.fellowshipName})`}
                      color="primary"
                      variant="outlined"
                      size="small"
                    />
                  </Box>

                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="secondary" gutterBottom>
                      <GroupIcon sx={{ fontSize: 16, mr: 1, verticalAlign: "middle" }} />
                      Participants ({counselling.participants?.length || 0})
                    </Typography>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      {counselling.participants?.slice(0, 3).map((participant) => (
                        <Chip
                          key={participant._id}
                          label={participant.name}
                          size="small"
                          sx={{ fontSize: "0.7rem" }}
                        />
                      ))}
                      {counselling.participants && counselling.participants.length > 3 && (
                        <Chip
                          label={`+${counselling.participants.length - 3} more`}
                          size="small"
                          color="secondary"
                          variant="outlined"
                          sx={{ fontSize: "0.7rem" }}
                        />
                      )}
                    </Box>
                  </Box>

                  {(counselling.meetingSchedule || counselling.location) && (
                    <Box sx={{ mb: 2 }}>
                      {counselling.meetingSchedule && (
                        <Typography variant="body2" color="text.secondary" sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
                          <ScheduleIcon sx={{ fontSize: 14, mr: 1 }} />
                          {counselling.meetingSchedule}
                        </Typography>
                      )}
                      {counselling.location && (
                        <Typography variant="body2" color="text.secondary" sx={{ display: "flex", alignItems: "center" }}>
                          <LocationIcon sx={{ fontSize: 14, mr: 1 }} />
                          {counselling.location}
                        </Typography>
                      )}
                    </Box>
                  )}

                  <Accordion>
                    <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                      <Typography variant="subtitle2">View All Members</Typography>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="primary" gutterBottom>
                          Counsellor
                        </Typography>
                        <Typography variant="body2">
                          {counselling.counsellor.name} ({counselling.counsellor.fellowshipName})
                        </Typography>
                      </Box>

                      <Box>
                        <Typography variant="subtitle2" color="secondary" gutterBottom>
                          Participants
                        </Typography>
                        {counselling.participants && counselling.participants.length > 0 ? (
                          counselling.participants.map((participant) => (
                            <Chip
                              key={participant._id}
                              label={`${participant.name} (${participant.fellowshipName})`}
                              size="small"
                              sx={{ mr: 1, mb: 1 }}
                            />
                          ))
                        ) : (
                          <Typography color="text.secondary" variant="body2">
                            No participants assigned yet.
                          </Typography>
                        )}
                      </Box>
                    </AccordionDetails>
                  </Accordion>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Create/Edit Counselling Dialog */}
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
          {openCreateDialog ? "Create New Counselling Team" : "Edit Counselling Team"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <TextField
              autoFocus
              label="Team Name"
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
              rows={2}
              variant="outlined"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              sx={{ mb: 3 }}
            />

            <Autocomplete
              options={getFilteredCounsellors()}
              getOptionLabel={(option) => `${option.name} (${option.fellowshipName})`}
              value={formData.counsellor}
              onChange={(_, newValue) => setFormData({ ...formData, counsellor: newValue })}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Counsellor"
                  placeholder="Choose a volunteer as counsellor..."
                  required
                />
              )}
              sx={{ mb: 3 }}
            />

            <Autocomplete
              multiple
              options={getFilteredParticipants()}
              getOptionLabel={(option) => `${option.name} (${option.fellowshipName})`}
              value={formData.participants}
              onChange={(_, newValue) => setFormData({ ...formData, participants: newValue })}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Participants"
                  placeholder="Choose participants..."
                  required
                />
              )}
              sx={{ mb: 3 }}
            />

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Meeting Schedule"
                  fullWidth
                  variant="outlined"
                  value={formData.meetingSchedule}
                  onChange={(e) => setFormData({ ...formData, meetingSchedule: e.target.value })}
                  placeholder="e.g., Daily at 9 AM"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Location"
                  fullWidth
                  variant="outlined"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Room 101"
                />
              </Grid>
            </Grid>

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                label="Status"
                onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Notes"
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes about the team..."
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
            onClick={openCreateDialog ? handleCreateCounselling : handleUpdateCounselling}
            variant="contained"
            disabled={loading}
          >
            {loading ? "Saving..." : openCreateDialog ? "Create Team" : "Update Team"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Delete Counselling Team</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the counselling team "{selectedCounselling?.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteCounselling}
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