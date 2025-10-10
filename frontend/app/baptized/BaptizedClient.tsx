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
  Grid,
  IconButton,
  Alert,
  Snackbar,
  Autocomplete,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tabs,
  Tab,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Water as WaterIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  FileDownload as FileDownloadIcon,
} from "@mui/icons-material";
import { Baptized, Participant } from "../../types";
import {
  createBaptized,
  updateBaptized,
  deleteBaptized,
  getAvailableBaptismParticipants,
} from "../../lib/data-fetching";
import { exportBaptizedToExcel } from "../../lib/excel-export";

interface BaptizedClientProps {
  baptized: Baptized[];
}

export default function BaptizedClient({
  baptized: initialBaptized,
}: BaptizedClientProps) {
  const [baptized, setBaptized] = useState<Baptized[]>(initialBaptized);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedBaptized, setSelectedBaptized] = useState<Baptized | null>(null);
  const [availableParticipants, setAvailableParticipants] = useState<
    Participant[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });
  const [currentTab, setCurrentTab] = useState(0);

  // Form state
  const [formData, setFormData] = useState({
    participant: null as Participant | null,
    status: "pending" as "done" | "pending",
    baptismDate: "",
    baptizedBy: "",
    location: "",
    notes: "",
  });

  useEffect(() => {
    loadAvailableParticipants();
  }, []);

  const loadAvailableParticipants = async () => {
    try {
      const participants = await getAvailableBaptismParticipants();
      setAvailableParticipants(participants);
    } catch (error) {
      console.error("Error loading available participants:", error);
      setSnackbar({
        open: true,
        message: "Error loading participants",
        severity: "error",
      });
    }
  };

  const handleCreateBaptized = async () => {
    if (!formData.participant) {
      setSnackbar({
        open: true,
        message: "Participant is required",
        severity: "error",
      });
      return;
    }

    setLoading(true);
    try {
      const newBaptized = await createBaptized({
        participant: formData.participant._id,
        status: formData.status,
        baptismDate: formData.baptismDate || undefined,
        baptizedBy: formData.baptizedBy || undefined,
        location: formData.location || undefined,
        notes: formData.notes || undefined,
      });

      setBaptized([newBaptized, ...baptized]);
      setOpenCreateDialog(false);
      resetForm();
      await loadAvailableParticipants(); // Refresh available participants
      setSnackbar({
        open: true,
        message: "Baptized record created successfully",
        severity: "success",
      });
    } catch (error) {
      console.error("Error creating baptized record:", error);
      setSnackbar({
        open: true,
        message: "Error creating baptized record",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateBaptized = async () => {
    if (!selectedBaptized) return;

    setLoading(true);
    try {
      const updatedBaptized = await updateBaptized(selectedBaptized._id, {
        status: formData.status,
        baptismDate: formData.baptismDate || undefined,
        baptizedBy: formData.baptizedBy || undefined,
        location: formData.location || undefined,
        notes: formData.notes || undefined,
      });

      setBaptized(
        baptized.map((b) => (b._id === selectedBaptized._id ? updatedBaptized : b))
      );
      setOpenEditDialog(false);
      resetForm();
      setSnackbar({
        open: true,
        message: "Baptized record updated successfully",
        severity: "success",
      });
    } catch (error) {
      console.error("Error updating baptized record:", error);
      setSnackbar({
        open: true,
        message: "Error updating baptized record",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBaptized = async () => {
    if (!selectedBaptized) return;

    setLoading(true);
    try {
      await deleteBaptized(selectedBaptized._id);
      setBaptized(baptized.filter((b) => b._id !== selectedBaptized._id));
      setOpenDeleteDialog(false);
      setSelectedBaptized(null);
      await loadAvailableParticipants(); // Refresh available participants
      setSnackbar({
        open: true,
        message: "Baptized record deleted successfully",
        severity: "success",
      });
    } catch (error) {
      console.error("Error deleting baptized record:", error);
      setSnackbar({
        open: true,
        message: "Error deleting baptized record",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      participant: null,
      status: "pending",
      baptismDate: "",
      baptizedBy: "",
      location: "",
      notes: "",
    });
    setSelectedBaptized(null);
  };

  const openEditBaptizedDialog = (baptizedRecord: Baptized) => {
    setSelectedBaptized(baptizedRecord);
    setFormData({
      participant: baptizedRecord.participant,
      status: baptizedRecord.status,
      baptismDate: baptizedRecord.baptismDate || "",
      baptizedBy: baptizedRecord.baptizedBy || "",
      location: baptizedRecord.location || "",
      notes: baptizedRecord.notes || "",
    });
    setOpenEditDialog(true);
  };

  const openDeleteBaptizedDialog = (baptizedRecord: Baptized) => {
    setSelectedBaptized(baptizedRecord);
    setOpenDeleteDialog(true);
  };

  const filteredBaptized = baptized.filter((b) => {
    if (currentTab === 0) return true; // All
    if (currentTab === 1) return b.status === "pending";
    if (currentTab === 2) return b.status === "done";
    return true;
  });

  const pendingCount = baptized.filter((b) => b.status === "pending").length;
  const doneCount = baptized.filter((b) => b.status === "done").length;

  const handleExportBaptized = () => {
    try {
      exportBaptizedToExcel(baptized);
      setSnackbar({
        open: true,
        message: "Baptized list exported to Excel successfully",
        severity: "success",
      });
    } catch (error) {
      console.error("Error exporting baptized list:", error);
      setSnackbar({
        open: true,
        message: "Error exporting baptized list to Excel",
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
          Baptized List
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
            onClick={handleExportBaptized}
            size="medium"
            disabled={baptized.length === 0}
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
            Add Participant
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={{ xs: 1, sm: 2 }} sx={{ mb: 3 }}>
        <Grid item xs={4} sm={6} md={3}>
          <Card sx={{ height: "100%" }}>
            <CardContent
              sx={{
                textAlign: "center",
                py: { xs: 1.5, sm: 2 },
                px: { xs: 1, sm: 2 }
              }}
            >
              <WaterIcon
                sx={{
                  fontSize: { xs: 24, sm: 32, md: 40 },
                  color: "primary.main",
                  mb: { xs: 0.5, sm: 1 }
                }}
              />
              <Typography
                variant="h6"
                sx={{
                  fontSize: { xs: "1rem", sm: "1.25rem" }
                }}
              >
                {baptized.length}
              </Typography>
              <Typography
                color="text.secondary"
                sx={{
                  fontSize: { xs: "0.75rem", sm: "0.875rem" }
                }}
              >
                Total
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={4} sm={6} md={3}>
          <Card sx={{ height: "100%" }}>
            <CardContent
              sx={{
                textAlign: "center",
                py: { xs: 1.5, sm: 2 },
                px: { xs: 1, sm: 2 }
              }}
            >
              <ScheduleIcon
                sx={{
                  fontSize: { xs: 24, sm: 32, md: 40 },
                  color: "warning.main",
                  mb: { xs: 0.5, sm: 1 }
                }}
              />
              <Typography
                variant="h6"
                sx={{
                  fontSize: { xs: "1rem", sm: "1.25rem" }
                }}
              >
                {pendingCount}
              </Typography>
              <Typography
                color="text.secondary"
                sx={{
                  fontSize: { xs: "0.75rem", sm: "0.875rem" }
                }}
              >
                Pending
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={4} sm={6} md={3}>
          <Card sx={{ height: "100%" }}>
            <CardContent
              sx={{
                textAlign: "center",
                py: { xs: 1.5, sm: 2 },
                px: { xs: 1, sm: 2 }
              }}
            >
              <CheckCircleIcon
                sx={{
                  fontSize: { xs: 24, sm: 32, md: 40 },
                  color: "success.main",
                  mb: { xs: 0.5, sm: 1 }
                }}
              />
              <Typography
                variant="h6"
                sx={{
                  fontSize: { xs: "1rem", sm: "1.25rem" }
                }}
              >
                {doneCount}
              </Typography>
              <Typography
                color="text.secondary"
                sx={{
                  fontSize: { xs: "0.75rem", sm: "0.875rem" }
                }}
              >
                Completed
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs
          value={currentTab}
          onChange={(_, newValue) => setCurrentTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            "& .MuiTab-root": {
              fontSize: { xs: "0.8rem", sm: "0.875rem" },
              minWidth: { xs: "auto", sm: 160 },
              px: { xs: 1, sm: 2 }
            }
          }}
        >
          <Tab label={`All (${baptized.length})`} />
          <Tab label={`Pending (${pendingCount})`} />
          <Tab label={`Done (${doneCount})`} />
        </Tabs>
      </Box>

      {filteredBaptized.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: "center", py: 8 }}>
            <WaterIcon sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No baptized participants found
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 3 }}>
              Add participants to start tracking baptisms.
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenCreateDialog(true)}
            >
              Add First Participant
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Desktop Table View */}
          <Box sx={{ display: { xs: "none", md: "block" } }}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Fellowship</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Baptism Date</TableCell>
                    <TableCell>Baptized By</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredBaptized.map((baptizedRecord) => (
                    <TableRow key={baptizedRecord._id}>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" fontWeight={500}>
                            {baptizedRecord.participant.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {baptizedRecord.participant.contact}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{baptizedRecord.participant.fellowshipName}</TableCell>
                      <TableCell>
                        <Chip
                          label={baptizedRecord.status}
                          color={baptizedRecord.status === "done" ? "success" : "warning"}
                          size="small"
                          icon={
                            baptizedRecord.status === "done" ? (
                              <CheckCircleIcon />
                            ) : (
                              <ScheduleIcon />
                            )
                          }
                        />
                      </TableCell>
                      <TableCell>
                        {baptizedRecord.baptismDate
                          ? new Date(baptizedRecord.baptismDate).toLocaleDateString()
                          : "-"}
                      </TableCell>
                      <TableCell>{baptizedRecord.baptizedBy || "-"}</TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <IconButton
                            size="small"
                            onClick={() => openEditBaptizedDialog(baptizedRecord)}
                            title="Edit"
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => openDeleteBaptizedDialog(baptizedRecord)}
                            title="Delete"
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>

          {/* Mobile Card View */}
          <Box sx={{ display: { xs: "block", md: "none" } }}>
            <Grid container spacing={2}>
              {filteredBaptized.map((baptizedRecord) => (
                <Grid item xs={12} key={baptizedRecord._id}>
                  <Card sx={{ position: "relative" }}>
                    <CardContent sx={{ pb: 1 }}>
                      {/* Header with Name and Status */}
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="h6" component="h3" sx={{ fontSize: "1.1rem", fontWeight: 600 }}>
                            {baptizedRecord.participant.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                            {baptizedRecord.participant.contact}
                          </Typography>
                        </Box>
                        <Chip
                          label={baptizedRecord.status}
                          color={baptizedRecord.status === "done" ? "success" : "warning"}
                          size="small"
                          icon={
                            baptizedRecord.status === "done" ? (
                              <CheckCircleIcon />
                            ) : (
                              <ScheduleIcon />
                            )
                          }
                        />
                      </Box>

                      {/* Fellowship */}
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                          Fellowship
                        </Typography>
                        <Typography variant="body2">
                          {baptizedRecord.participant.fellowshipName}
                        </Typography>
                      </Box>

                      {/* Baptism Details */}
                      <Grid container spacing={2} sx={{ mb: 2 }}>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                            Baptism Date
                          </Typography>
                          <Typography variant="body2">
                            {baptizedRecord.baptismDate
                              ? new Date(baptizedRecord.baptismDate).toLocaleDateString()
                              : "Not set"}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                            Baptized By
                          </Typography>
                          <Typography variant="body2">
                            {baptizedRecord.baptizedBy || "Not set"}
                          </Typography>
                        </Grid>
                      </Grid>

                      {/* Location */}
                      {baptizedRecord.location && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                            Location
                          </Typography>
                          <Typography variant="body2">
                            {baptizedRecord.location}
                          </Typography>
                        </Box>
                      )}

                      {/* Notes */}
                      {baptizedRecord.notes && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                            Notes
                          </Typography>
                          <Typography variant="body2">
                            {baptizedRecord.notes}
                          </Typography>
                        </Box>
                      )}

                      {/* Actions */}
                      <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, pt: 1 }}>
                        <IconButton
                          size="small"
                          onClick={() => openEditBaptizedDialog(baptizedRecord)}
                          title="Edit"
                          sx={{ color: "primary.main" }}
                        >
                          <EditIcon />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => openDeleteBaptizedDialog(baptizedRecord)}
                          title="Delete"
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        </>
      )}

      {/* Create Dialog */}
      <Dialog
        open={openCreateDialog}
        onClose={() => {
          setOpenCreateDialog(false);
          resetForm();
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Add Participant for Baptism</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Autocomplete
              options={availableParticipants}
              getOptionLabel={(option) =>
                `${option.name} (${option.fellowshipName})`
              }
              value={formData.participant}
              onChange={(_, newValue) =>
                setFormData({ ...formData, participant: newValue })
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Participant"
                  placeholder="Choose participant..."
                  required
                />
              )}
              sx={{ mb: 3 }}
            />

            {/* Show participant details when selected */}
            {formData.participant && (
              <Card sx={{ mb: 3, p: 2, backgroundColor: "grey.50" }}>
                <Typography variant="h6" gutterBottom color="primary">
                  Participant Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Registration Number
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {formData.participant.regNo || "Not assigned"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Name
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {formData.participant.name}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Contact
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {formData.participant.contact || "Not provided"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Age
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {formData.participant.age || "Not provided"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Gender
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {formData.participant.gender === "male" ? "Male" : "Female"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Fellowship
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {formData.participant.fellowshipName}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Area
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {formData.participant.area || "Not provided"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Department
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {formData.participant.department || "Not provided"}
                    </Typography>
                  </Grid>
                  {formData.participant.guardianName && (
                    <>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          Guardian Name
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {formData.participant.guardianName}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          Guardian Contact
                        </Typography>
                        <Typography variant="body1" fontWeight={500}>
                          {formData.participant.guardianContact || "Not provided"}
                        </Typography>
                      </Grid>
                    </>
                  )}
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Presence Status
                    </Typography>
                    <Chip
                      label={formData.participant.present === "present" ? "Present" : "Absent"}
                      color={formData.participant.present === "present" ? "success" : "error"}
                      size="small"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="text.secondary">
                      Salvation Status
                    </Typography>
                    <Chip
                      label={formData.participant.isSaved ? "Saved" : "Guest"}
                      color={formData.participant.isSaved ? "primary" : "default"}
                      size="small"
                    />
                  </Grid>
                  {formData.participant.isSaved && formData.participant.salvationDate && (
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Salvation Date
                      </Typography>
                      <Typography variant="body1" fontWeight={500}>
                        {new Date(formData.participant.salvationDate).toLocaleDateString()}
                      </Typography>
                    </Grid>
                  )}
                </Grid>
              </Card>
            )}

            {/* Baptism Details Section */}
            <Typography variant="h6" gutterBottom color="primary" sx={{ mt: 2, mb: 2 }}>
              Baptism Information (Optional)
            </Typography>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Baptism Date"
                  type="date"
                  fullWidth
                  value={formData.baptismDate}
                  onChange={(e) =>
                    setFormData({ ...formData, baptismDate: e.target.value })
                  }
                  InputLabelProps={{ shrink: true }}
                  helperText="When is the baptism scheduled?"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Baptized By"
                  fullWidth
                  value={formData.baptizedBy}
                  onChange={(e) =>
                    setFormData({ ...formData, baptizedBy: e.target.value })
                  }
                  placeholder="Name of the person performing baptism"
                  helperText="Who will perform the baptism?"
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Location"
                  fullWidth
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  placeholder="Where will the baptism take place?"
                  helperText="Baptism venue or location"
                />
              </Grid>
            </Grid>

            <TextField
              label="Notes"
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
              placeholder="Add any additional notes about this baptism..."
              helperText="Any special instructions or remarks"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenCreateDialog(false);
              resetForm();
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateBaptized}
            variant="contained"
            disabled={loading || !formData.participant}
          >
            {loading ? "Adding..." : "Add for Baptism"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        open={openEditDialog}
        onClose={() => {
          setOpenEditDialog(false);
          resetForm();
        }}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Update Baptism Record</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <Typography variant="subtitle1" sx={{ mb: 2 }}>
              Participant: {selectedBaptized?.participant.name}
            </Typography>

            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.status}
                label="Status"
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as "done" | "pending" })
                }
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="done">Done</MenuItem>
              </Select>
            </FormControl>

            {formData.status === "done" && (
              <>
                <TextField
                  label="Baptism Date"
                  type="date"
                  fullWidth
                  value={formData.baptismDate}
                  onChange={(e) =>
                    setFormData({ ...formData, baptismDate: e.target.value })
                  }
                  InputLabelProps={{ shrink: true }}
                  sx={{ mb: 3 }}
                />

                <TextField
                  label="Baptized By"
                  fullWidth
                  value={formData.baptizedBy}
                  onChange={(e) =>
                    setFormData({ ...formData, baptizedBy: e.target.value })
                  }
                  sx={{ mb: 3 }}
                />

                <TextField
                  label="Location"
                  fullWidth
                  value={formData.location}
                  onChange={(e) =>
                    setFormData({ ...formData, location: e.target.value })
                  }
                  sx={{ mb: 3 }}
                />
              </>
            )}

            <TextField
              label="Notes"
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              value={formData.notes}
              onChange={(e) =>
                setFormData({ ...formData, notes: e.target.value })
              }
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpenEditDialog(false);
              resetForm();
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdateBaptized}
            variant="contained"
            disabled={loading}
          >
            {loading ? "Updating..." : "Update"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={openDeleteDialog}
        onClose={() => setOpenDeleteDialog(false)}
      >
        <DialogTitle>Delete Baptism Record</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the baptism record for "
            {selectedBaptized?.participant.name}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteBaptized}
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