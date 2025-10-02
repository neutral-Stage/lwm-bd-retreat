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
  CircularProgress,
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
  CheckCircle as DoneIcon,
  RadioButtonUnchecked as PendingIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import { Counselling, Participant, CounsellingParticipant } from "../../types";
import {
  createCounselling,
  updateCounselling,
  deleteCounselling,
  getAvailableCounsellors,
  getAvailableCounsellingParticipants,
  getAssignedCounsellingMembers,
  updateCounsellingParticipant,
  getCounsellingParticipants,
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

// Component for managing individual participant status
interface ParticipantStatusCardProps {
  counsellingId: string;
  counsellingParticipant: CounsellingParticipant;
  onUpdate: () => void;
}

function ParticipantStatusCard({ counsellingId, counsellingParticipant, onUpdate }: ParticipantStatusCardProps) {
  const [status, setStatus] = useState(counsellingParticipant.status);
  const [comments, setComments] = useState(counsellingParticipant.comments);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Auto-save status when toggled
  const handleToggleStatus = async () => {
    const newStatus = status === "done" ? "pending" : "done";
    setStatus(newStatus);
    setIsUpdating(true);

    try {
      await updateCounsellingParticipant(
        counsellingId,
        counsellingParticipant.participant._id,
        { status: newStatus }
      );
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      onUpdate(); // Update parent to reflect changes
    } catch (error) {
      console.error("Error updating status:", error);
      // Revert on error
      setStatus(status === "done" ? "pending" : "done");
    } finally {
      setIsUpdating(false);
    }
  };

  // Auto-save comments when focus is lost (debounced)
  const handleCommentsBlur = async () => {
    if (comments === counsellingParticipant.comments) return; // No change

    setIsUpdating(true);
    try {
      await updateCounsellingParticipant(
        counsellingId,
        counsellingParticipant.participant._id,
        { comments }
      );
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      onUpdate(); // Update parent to reflect changes
    } catch (error) {
      console.error("Error updating comments:", error);
      // Revert on error
      setComments(counsellingParticipant.comments);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Box
      sx={{
        mb: 2,
        p: 2,
        border: 1,
        borderColor: status === "done" ? "success.light" : "warning.light",
        borderRadius: 2,
        backgroundColor: status === "done" ? "success.50" : "warning.50",
        transition: "all 0.3s ease",
        position: "relative"
      }}
    >
      {/* Success indicator */}
      {showSuccess && (
        <Box
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            color: "success.main",
            display: "flex",
            alignItems: "center",
            gap: 0.5
          }}
        >
          <SaveIcon fontSize="small" />
          <Typography variant="caption">Saved</Typography>
        </Box>
      )}

      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Box>
          <Typography variant="subtitle1" fontWeight="bold">
            {counsellingParticipant.participant.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {counsellingParticipant.participant.fellowshipName}
          </Typography>
        </Box>

        {/* Clickable status toggle */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            cursor: "pointer",
            padding: 1,
            borderRadius: 1,
            "&:hover": { backgroundColor: "action.hover" },
            transition: "background-color 0.2s"
          }}
          onClick={handleToggleStatus}
        >
          {isUpdating ? (
            <CircularProgress size={20} />
          ) : (
            <IconButton
              size="small"
              color={status === "done" ? "success" : "warning"}
              sx={{ pointerEvents: "none" }} // Prevent double clicks
            >
              {status === "done" ? <DoneIcon /> : <PendingIcon />}
            </IconButton>
          )}
          <Typography
            variant="body2"
            color={status === "done" ? "success.main" : "warning.main"}
            fontWeight={status === "done" ? "bold" : "normal"}
          >
            {status === "done" ? "Done" : "Pending"}
          </Typography>
        </Box>
      </Box>

      {/* Inline editable comments */}
      <TextField
        fullWidth
        multiline
        rows={2}
        label="Comments (click to edit)"
        value={comments}
        onChange={(e) => setComments(e.target.value)}
        onBlur={handleCommentsBlur}
        placeholder="Click here to add comments about this participant..."
        variant="outlined"
        sx={{
          "& .MuiOutlinedInput-root": {
            "&:hover fieldset": {
              borderColor: "primary.main",
            },
          },
        }}
      />

      {isUpdating && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
          <CircularProgress size={16} />
          <Typography variant="caption" color="text.secondary">
            Saving...
          </Typography>
        </Box>
      )}
    </Box>
  );
}

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
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    counsellor: null as Participant | null,
    participants: [] as Participant[], // Keep as Participant[] for form, convert when saving
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
        participants: formData.participants.map(p => ({
          participantId: p._id,
          status: "pending" as const,
          comments: ""
        })),
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
        participants: formData.participants.map(p => ({
          participant: p,
          status: "pending" as const,
          comments: ""
        })) as any, // Temporary type assertion for backward compatibility
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
      participants: counselling.participants?.map(cp => cp.participant) || [],
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

  const toggleCardExpanded = (counsellingId: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(counsellingId)) {
        newSet.delete(counsellingId);
      } else {
        newSet.add(counsellingId);
      }
      return newSet;
    });
  };

  const refreshCounsellingData = async () => {
    try {
      const { getAllCounsellings } = await import("../../lib/data-fetching");
      const freshCounsellings = await getAllCounsellings();
      setCounsellings(freshCounsellings);
    } catch (error) {
      console.error("Error refreshing counselling data:", error);
    }
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
            <Grid item xs={12} key={counselling._id}>
              <Accordion
                expanded={expandedCards.has(counselling._id)}
                onChange={() => toggleCardExpanded(counselling._id)}
                sx={{
                  boxShadow: 2,
                  '&:before': { display: 'none' },
                  borderRadius: 2,
                  mb: 1
                }}
              >
                <AccordionSummary
                  expandIcon={<ExpandMoreIcon />}
                  sx={{
                    cursor: 'pointer',
                    '& .MuiAccordionSummary-content': {
                      alignItems: 'center'
                    }
                  }}
                >
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2, flex: 1 }}>
                      <Typography variant="h6" component="h2">
                        {counselling.name}
                      </Typography>
                      <Chip
                        label={statusLabels[counselling.status]}
                        color={statusColors[counselling.status]}
                        size="small"
                      />
                      <Chip
                        label={`${counselling.counsellor.name} (Counsellor)`}
                        color="primary"
                        variant="outlined"
                        size="small"
                      />
                      <Chip
                        label={`${counselling.participants?.length || 0} participants`}
                        color="secondary"
                        variant="outlined"
                        size="small"
                      />
                      {/* Progress indicator */}
                      {counselling.participants && counselling.participants.length > 0 && (
                        <Chip
                          label={`${counselling.participants.filter(p => p.status === "done").length}/${counselling.participants.length} done`}
                          color={counselling.participants.filter(p => p.status === "done").length === counselling.participants.length ? "success" : "warning"}
                          size="small"
                        />
                      )}
                    </Box>
                    <Box sx={{ display: "flex", gap: 1 }} onClick={(e) => e.stopPropagation()}>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditCounsellingDialog(counselling);
                        }}
                        title="Edit Team"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeleteCounsellingDialog(counselling);
                        }}
                        title="Delete Team"
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </AccordionSummary>

                <AccordionDetails>
                  <Box>
                    {counselling.description && (
                      <Typography color="text.secondary" sx={{ mb: 3 }}>
                        {counselling.description}
                      </Typography>
                    )}

                    {(counselling.meetingSchedule || counselling.location) && (
                      <Box sx={{ mb: 3, p: 2, backgroundColor: "grey.50", borderRadius: 1 }}>
                        {counselling.meetingSchedule && (
                          <Typography variant="body2" color="text.secondary" sx={{ display: "flex", alignItems: "center", mb: 0.5 }}>
                            <ScheduleIcon sx={{ fontSize: 16, mr: 1 }} />
                            {counselling.meetingSchedule}
                          </Typography>
                        )}
                        {counselling.location && (
                          <Typography variant="body2" color="text.secondary" sx={{ display: "flex", alignItems: "center" }}>
                            <LocationIcon sx={{ fontSize: 16, mr: 1 }} />
                            {counselling.location}
                          </Typography>
                        )}
                      </Box>
                    )}

                    {/* Participant Management */}
                    <Box>
                      <Typography variant="h6" color="secondary" gutterBottom sx={{ mb: 2 }}>
                        <GroupIcon sx={{ fontSize: 20, mr: 1, verticalAlign: "middle" }} />
                        Participant Progress ({counselling.participants?.length || 0})
                      </Typography>
                      {counselling.participants && counselling.participants.length > 0 ? (
                        <Box>
                          {counselling.participants.map((counsellingParticipant) => (
                            <ParticipantStatusCard
                              key={counsellingParticipant.participant._id}
                              counsellingId={counselling._id}
                              counsellingParticipant={counsellingParticipant}
                              onUpdate={refreshCounsellingData}
                            />
                          ))}
                        </Box>
                      ) : (
                        <Box sx={{ textAlign: "center", py: 4, color: "text.secondary" }}>
                          <GroupIcon sx={{ fontSize: 48, mb: 1 }} />
                          <Typography variant="body2">
                            No participants assigned yet.
                          </Typography>
                        </Box>
                      )}
                    </Box>

                    {counselling.notes && (
                      <Box sx={{ mt: 3, p: 2, backgroundColor: "info.50", borderRadius: 1 }}>
                        <Typography variant="subtitle2" color="info.main" gutterBottom>
                          Notes
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {counselling.notes}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </AccordionDetails>
              </Accordion>
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