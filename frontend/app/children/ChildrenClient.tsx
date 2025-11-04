"use client";

import { useState, useRef, useEffect } from "react";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import InputLabel from "@mui/material/InputLabel";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Divider from "@mui/material/Divider";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import DialogContentText from "@mui/material/DialogContentText";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import Autocomplete from "@mui/material/Autocomplete";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import AddIcon from "@mui/icons-material/Add";
import AssessmentIcon from "@mui/icons-material/Assessment";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import Stack from "@mui/material/Stack";
import { ChildParticipant } from "../../types";
import {
  getAllChildParticipants,
  getAvailableChildParticipants,
  createChildParticipant,
  updateChildParticipant,
  deleteChildParticipant,
} from "../../lib/data-fetching";
import ChildrenReportsClient from "./ChildrenReportsClient";

// Simplified inline edit modal will be created below

export default function ChildrenClient() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [isSavedFilter, setIsSavedFilter] = useState("all");
  const [baptismFilter, setBaptismFilter] = useState("all");
  const [fellowshipFilter, setFellowshipFilter] = useState("all");
  const [groupBy, setGroupBy] = useState("none");
  const [searchTerm, setSearchTerm] = useState("");
  const [tabValue, setTabValue] = useState(0);

  // Edit and delete states
  const [editOpen, setEditOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedChildParticipant, setSelectedChildParticipant] =
    useState<ChildParticipant | null>(null);
  const [childParticipantState, setChildParticipantState] = useState<
    ChildParticipant[]
  >([]);
  const [availableParticipants, setAvailableParticipants] = useState<any[]>([]);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });
  const [loading, setLoading] = useState(true);

  // Tab change handler
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [childParticipants, available] = await Promise.all([
        getAllChildParticipants(),
        getAvailableChildParticipants(),
      ]);
      setChildParticipantState(childParticipants);
      setAvailableParticipants(available);
    } catch (error) {
      console.error("Error loading data:", error);
      setSnackbar({
        open: true,
        message: `Failed to load data: ${error}`,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  // Clean the data (remove any remaining Unicode issues)
  const cleanedChildParticipants = childParticipantState.map((cp) => ({
    ...cp,
    participant: {
      ...cp.participant,
      name: cleanText(cp.participant.name || ""),
      fellowshipName: cleanText(cp.participant.fellowshipName || ""),
      contact: cleanText(cp.participant.contact || ""),
    },
  }));

  // Clean text function
  function cleanText(text: string) {
    if (!text || typeof text !== "string") return text;
    return text
      .replace(/[\u200B-\u200D\u2060\uFEFF]/g, "")
      .replace(/\s+/g, " ") // Replace multiple spaces with single space
      .trim();
  }

  // Format functions for display
  const formatIsSaved = (value: string) => {
    switch (value) {
      case "saved":
        return "Saved";
      case "bornAgain":
        return "Born Again (B)";
      case "confused":
        return "Confused";
      case "notSaved":
        return "Not Saved";
      default:
        return value;
    }
  };

  const formatGender = (value: string) => {
    switch (value?.toLowerCase()) {
      case "male":
        return "Male";
      case "female":
        return "Female";
      default:
        return value;
    }
  };

  // Add, Edit and delete handlers
  const handleAdd = () => {
    setAddOpen(true);
  };

  const handleEdit = (childParticipant: ChildParticipant) => {
    setSelectedChildParticipant(childParticipant);
    setEditOpen(true);
  };

  const handleDelete = (childParticipant: ChildParticipant) => {
    setSelectedChildParticipant(childParticipant);
    setDeleteOpen(true);
  };

  const handleAddClose = () => {
    setAddOpen(false);
    setSelectedChildParticipant(null);
  };

  const handleEditClose = () => {
    setEditOpen(false);
    setSelectedChildParticipant(null);
  };

  const handleDeleteClose = () => {
    setDeleteOpen(false);
    setSelectedChildParticipant(null);
  };

  const handleSaveChildParticipant = async (
    newData: any,
    isEdit: boolean = false
  ) => {
    try {
      if (isEdit && selectedChildParticipant) {
        const savedChildParticipant = await updateChildParticipant(
          selectedChildParticipant._id,
          newData
        );

        // Update local state
        setChildParticipantState((prev) =>
          prev.map((cp) =>
            cp._id === selectedChildParticipant._id ? savedChildParticipant : cp
          )
        );

        setEditOpen(false);
        setSelectedChildParticipant(null);
        setSnackbar({
          open: true,
          message: `Successfully updated ${savedChildParticipant.participant.name}`,
          severity: "success",
        });
      } else {
        const savedChildParticipant = await createChildParticipant(newData);

        // Update local state
        setChildParticipantState((prev) => [savedChildParticipant, ...prev]);

        setAddOpen(false);
        setSelectedChildParticipant(null);
        setSnackbar({
          open: true,
          message: `Successfully added ${savedChildParticipant.participant.name}`,
          severity: "success",
        });

        // Remove from available participants
        setAvailableParticipants((prev) =>
          prev.filter((p) => p._id !== newData.participant)
        );
      }
    } catch (error) {
      console.error("Error saving child participant:", error);
      setSnackbar({
        open: true,
        message: `Failed to save: ${error}`,
        severity: "error",
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedChildParticipant) return;

    try {
      await deleteChildParticipant(selectedChildParticipant._id);

      // Update local state
      setChildParticipantState((prev) =>
        prev.filter((cp) => cp._id !== selectedChildParticipant._id)
      );

      // Add back to available participants
      setAvailableParticipants((prev) => [
        ...prev,
        selectedChildParticipant.participant,
      ]);

      setDeleteOpen(false);
      setSelectedChildParticipant(null);
      setSnackbar({
        open: true,
        message: `Successfully deleted ${selectedChildParticipant.participant.name}`,
        severity: "success",
      });
    } catch (error) {
      console.error("Error deleting child participant:", error);
      setSnackbar({
        open: true,
        message: `Failed to delete: ${error}`,
        severity: "error",
      });
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // Filter child participants based on selected filters
  const filteredChildParticipants = cleanedChildParticipants.filter(
    (childParticipant) => {
      // IsSaved filter
      if (
        isSavedFilter !== "all" &&
        childParticipant.isSaved !== isSavedFilter
      ) {
        return false;
      }

      // Baptism filter
      if (baptismFilter !== "all") {
        if (baptismFilter === "baptized" && !childParticipant.baptism) {
          return false;
        }
        if (baptismFilter === "notBaptized" && childParticipant.baptism) {
          return false;
        }
      }

      // Fellowship filter
      if (
        fellowshipFilter !== "all" &&
        childParticipant.participant.fellowshipName !== fellowshipFilter
      ) {
        return false;
      }

      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesName = childParticipant.participant.name
          .toLowerCase()
          .includes(searchLower);
        const matchesRegNo =
          childParticipant.participant.regNo
            ?.toLowerCase()
            .includes(searchLower) || false;
        const matchesComments =
          childParticipant.comments?.toLowerCase().includes(searchLower) ||
          false;

        if (!matchesName && !matchesRegNo && !matchesComments) {
          return false;
        }
      }

      return true;
    }
  );

  // Get unique values for dropdowns
  const uniqueFellowships = Array.from(
    new Set(
      cleanedChildParticipants
        .map((cp) => cp.participant.fellowshipName)
        .filter(Boolean)
    )
  ).sort();

  // Calculate statistics
  const totalChildParticipants = cleanedChildParticipants.length;
  const savedCount = cleanedChildParticipants.filter(
    (cp) => cp.isSaved === "saved"
  ).length;
  const bornAgainCount = cleanedChildParticipants.filter(
    (cp) => cp.isSaved === "bornAgain"
  ).length;
  const confusedCount = cleanedChildParticipants.filter(
    (cp) => cp.isSaved === "confused"
  ).length;
  const notSavedCount = cleanedChildParticipants.filter(
    (cp) => cp.isSaved === "notSaved"
  ).length;
  const baptizedCount = cleanedChildParticipants.filter(
    (cp) => cp.baptism
  ).length;
  const notBaptizedCount = totalChildParticipants - baptizedCount;

  const fellowshipCounts = cleanedChildParticipants.reduce((acc, cp) => {
    acc[cp.participant.fellowshipName] =
      (acc[cp.participant.fellowshipName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Group participants when groupBy is not "none"
  const groupedChildParticipants =
    groupBy !== "none" && groupBy === "fellowshipName"
      ? filteredChildParticipants.reduce((groups, childParticipant) => {
          const key = childParticipant.participant.fellowshipName;

          if (!groups[key]) {
            groups[key] = [];
          }
          groups[key].push(childParticipant);
          return groups;
        }, {} as Record<string, ChildParticipant[]>)
      : { "All Children": filteredChildParticipants };

  // Export to XLSX (placeholder - would need to implement proper export)
  const handleExportToXLSX = () => {
    try {
      // TODO: Implement proper Excel export for children participants
      setSnackbar({
        open: true,
        message: `Export feature will be implemented soon! ${filteredChildParticipants.length} records ready.`,
        severity: "success",
      });
    } catch (error) {
      console.error("Export error:", error);
      setSnackbar({
        open: true,
        message: `❌ Export failed: ${error}`,
        severity: "error",
      });
    }
  };

  // Mobile Child Participant Card Component
  const MobileChildParticipantCard = ({
    childParticipant,
  }: {
    childParticipant: ChildParticipant;
  }) => {
    return (
      <Card sx={{ mb: 2 }}>
        <CardContent>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              mb: 2,
            }}
          >
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" gutterBottom>
                {childParticipant.participant.name}
              </Typography>
              <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1 }}>
                <Chip
                  label={childParticipant.participant.regNo}
                  size="small"
                  color="default"
                  sx={{ mr: 1 }}
                />
                <Chip
                  label={formatGender(childParticipant.participant.gender)}
                  size="small"
                  color={
                    childParticipant.participant.gender === "male"
                      ? "info"
                      : "secondary"
                  }
                />
                <Chip
                  label={formatIsSaved(childParticipant.isSaved)}
                  size="small"
                  color={
                    childParticipant.isSaved === "saved"
                      ? "success"
                      : childParticipant.isSaved === "bornAgain"
                      ? "primary"
                      : childParticipant.isSaved === "notSaved"
                      ? "error"
                      : "warning"
                  }
                />
                <Chip
                  label={childParticipant.baptism ? "Baptized" : "Not Baptized"}
                  size="small"
                  color={childParticipant.baptism ? "success" : "error"}
                />
              </Box>
            </Box>
            <Box sx={{ display: "flex", gap: 0.5 }}>
              <IconButton
                size="small"
                color="primary"
                onClick={() => handleEdit(childParticipant)}
                title="Edit child participant"
              >
                <EditIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                color="error"
                onClick={() => handleDelete(childParticipant)}
                title="Delete child participant"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>

          <Divider sx={{ my: 1.5 }} />

          <Grid container spacing={1.5}>
            <Grid item xs={12}>
              <Typography variant="caption" color="text.secondary">
                Fellowship
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {childParticipant.participant.fellowshipName}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                Age
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {childParticipant.participant.age || "N/A"}
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="caption" color="text.secondary">
                Area
              </Typography>
              <Typography variant="body2" sx={{ mt: 0.5 }}>
                {childParticipant.participant.area || "N/A"}
              </Typography>
            </Grid>
            {childParticipant.comments && (
              <Grid item xs={12}>
                <Typography variant="caption" color="text.secondary">
                  Comments
                </Typography>
                <Typography variant="body2" sx={{ mt: 0.5 }}>
                  {childParticipant.comments}
                </Typography>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>
    );
  };

  // Add Child Participant Form Component
  const AddChildParticipantForm = ({
    availableParticipants,
    onSave,
    onCancel,
  }: {
    availableParticipants: any[];
    onSave: (data: any) => void;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState({
      participant: null as any,
      isSaved: "confused" as "saved" | "bornAgain" | "confused" | "notSaved",
      baptism: false,
      comments: "",
    });

    const handleChange = (field: string, value: any) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!formData.participant) {
        setSnackbar({
          open: true,
          message: "Please select a participant",
          severity: "error",
        });
        return;
      }
      onSave({
        ...formData,
        participant: formData.participant._id,
      });
    };

    return (
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Autocomplete
              options={availableParticipants}
              getOptionLabel={(option) =>
                `${option.name} (${option.regNo}) - ${option.fellowshipName}`
              }
              value={formData.participant}
              onChange={(_, newValue) =>
                setFormData({ ...formData, participant: newValue })
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Select Child Participant"
                  placeholder="Search and select participant..."
                  required
                />
              )}
              renderOption={(props, option) => (
                <Box component="li" {...props}>
                  <Box>
                    <Typography variant="body1">
                      {option.name} ({option.regNo})
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {option.fellowshipName}{" "}
                      {option.area && `• ${option.area}`}
                    </Typography>
                  </Box>
                </Box>
              )}
              sx={{ mb: 2 }}
            />

            {/* Show participant details when selected */}
            {formData.participant && (
              <Card sx={{ mb: 3, p: 2, backgroundColor: "grey.50" }}>
                <Typography variant="h6" gutterBottom color="primary">
                  Selected Participant Information
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
                      Fellowship
                    </Typography>
                    <Typography variant="body1" fontWeight={500}>
                      {formData.participant.fellowshipName}
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
                      {formData.participant.gender === "male"
                        ? "Male"
                        : "Female"}
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
                </Grid>
              </Card>
            )}
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Is Saved?</InputLabel>
              <Select
                value={formData.isSaved}
                onChange={(e) => handleChange("isSaved", e.target.value)}
                label="Is Saved?"
              >
                <MenuItem value="saved">Saved</MenuItem>
                <MenuItem value="bornAgain">Born Again (Before)</MenuItem>
                <MenuItem value="confused">Confused</MenuItem>
                <MenuItem value="notSaved">Not Saved</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Baptism Status</InputLabel>
              <Select
                value={formData.baptism ? "baptized" : "notBaptized"}
                onChange={(e) =>
                  handleChange("baptism", e.target.value === "baptized")
                }
                label="Baptism Status"
              >
                <MenuItem value="notBaptized">Not Baptized</MenuItem>
                <MenuItem value="baptized">Baptized</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Comments"
              multiline
              rows={3}
              value={formData.comments}
              onChange={(e) => handleChange("comments", e.target.value)}
              placeholder="Any additional comments about the child participant..."
            />
          </Grid>
        </Grid>
        <Box
          sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3 }}
        >
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="submit" variant="contained">
            Save
          </Button>
        </Box>
      </Box>
    );
  };

  // Edit Child Participant Form Component
  const EditChildParticipantForm = ({
    childParticipant,
    onSave,
    onCancel,
  }: {
    childParticipant: ChildParticipant;
    onSave: (data: any) => void;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState({
      isSaved: childParticipant.isSaved,
      baptism: childParticipant.baptism,
      comments: childParticipant.comments || "",
    });

    const handleChange = (field: string, value: any) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSave(formData);
    };

    return (
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Edit: {childParticipant.participant.name}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Is Saved?</InputLabel>
              <Select
                value={formData.isSaved}
                onChange={(e) => handleChange("isSaved", e.target.value)}
                label="Is Saved?"
              >
                <MenuItem value="saved">Saved</MenuItem>
                <MenuItem value="bornAgain">Born Again (Before)</MenuItem>
                <MenuItem value="confused">Confused</MenuItem>
                <MenuItem value="notSaved">Not Saved</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Baptism Status</InputLabel>
              <Select
                value={formData.baptism ? "baptized" : "notBaptized"}
                onChange={(e) =>
                  handleChange("baptism", e.target.value === "baptized")
                }
                label="Baptism Status"
              >
                <MenuItem value="notBaptized">Not Baptized</MenuItem>
                <MenuItem value="baptized">Baptized</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Comments"
              multiline
              rows={3}
              value={formData.comments}
              onChange={(e) => handleChange("comments", e.target.value)}
              placeholder="Any additional comments about the child participant..."
            />
          </Grid>
        </Grid>
        <Box
          sx={{ display: "flex", justifyContent: "flex-end", gap: 2, mt: 3 }}
        >
          <Button onClick={onCancel}>Cancel</Button>
          <Button type="submit" variant="contained">
            Save Changes
          </Button>
        </Box>
      </Box>
    );
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="h6">Loading children participants...</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          gap: 2,
          mb: 3,
        }}
      >
        <Typography variant={isMobile ? "h5" : "h4"}>
          Children Participants Management
        </Typography>
      </Box>

      {/* Tab Navigation */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Reports" icon={<AssessmentIcon />} />
          <Tab label="Management" icon={<AddIcon />} />
        </Tabs>
      </Box>

      {/* Tab Content */}
      {tabValue === 0 && (
        <ChildrenReportsClient childParticipants={childParticipantState} />
      )}

      {tabValue === 1 && (
        <Box>
          {/* Action Buttons */}
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 3 }}>
            <Button
              variant="contained"
              onClick={handleAdd}
              startIcon={<AddIcon />}
              size={isMobile ? "medium" : "large"}
              disabled={availableParticipants.length === 0}
              fullWidth={isMobile}
            >
              Add Child Participant ({availableParticipants.length} available)
            </Button>
            <Button
              variant="outlined"
              onClick={handleExportToXLSX}
              size={isMobile ? "medium" : "large"}
              startIcon={<FileDownloadIcon />}
              disabled={filteredChildParticipants.length === 0}
              fullWidth={isMobile}
            >
              Export Filtered ({filteredChildParticipants.length})
            </Button>
          </Box>

          {/* Statistics Cards */}
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Total
                  </Typography>
                  <Typography variant="h4">{totalChildParticipants}</Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Saved
                  </Typography>
                  <Typography variant="h4" color="success.main">
                    {savedCount}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Born Again (Before)
                  </Typography>
                  <Typography variant="h4" color="primary.main">
                    {bornAgainCount}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Confused
                  </Typography>
                  <Typography variant="h4" color="warning.main">
                    {confusedCount}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={2.4}>
              <Card>
                <CardContent>
                  <Typography color="textSecondary" gutterBottom>
                    Baptized
                  </Typography>
                  <Typography variant="h4" color="info.main">
                    {baptizedCount}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Search and Filter Controls */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Search & Filters
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  label="Search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name, reg no, or comments..."
                />
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Is Saved?</InputLabel>
                  <Select
                    value={isSavedFilter}
                    label="Is Saved?"
                    onChange={(e) => setIsSavedFilter(e.target.value)}
                  >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="saved">Saved</MenuItem>
                    <MenuItem value="bornAgain">Born Again (Before)</MenuItem>
                    <MenuItem value="confused">Confused</MenuItem>
                    <MenuItem value="notSaved">Not Saved</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Baptism</InputLabel>
                  <Select
                    value={baptismFilter}
                    label="Baptism"
                    onChange={(e) => setBaptismFilter(e.target.value)}
                  >
                    <MenuItem value="all">All</MenuItem>
                    <MenuItem value="baptized">Baptized</MenuItem>
                    <MenuItem value="notBaptized">Not Baptized</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Fellowship</InputLabel>
                  <Select
                    value={fellowshipFilter}
                    label="Fellowship"
                    onChange={(e) => setFellowshipFilter(e.target.value)}
                  >
                    <MenuItem value="all">All</MenuItem>
                    {uniqueFellowships.map((fellowship) => (
                      <MenuItem key={fellowship} value={fellowship}>
                        {fellowship}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Group By</InputLabel>
                  <Select
                    value={groupBy}
                    label="Group By"
                    onChange={(e) => setGroupBy(e.target.value)}
                  >
                    <MenuItem value="none">No Grouping</MenuItem>
                    <MenuItem value="fellowshipName">By Fellowship</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>

            {/* Show active filters */}
            <Box sx={{ mt: 2 }}>
              {searchTerm && (
                <Chip
                  label={`Search: ${searchTerm}`}
                  onDelete={() => setSearchTerm("")}
                  sx={{ mr: 1, mb: 1 }}
                />
              )}
              {isSavedFilter !== "all" && (
                <Chip
                  label={`Is Saved: ${isSavedFilter}`}
                  onDelete={() => setIsSavedFilter("all")}
                  sx={{ mr: 1, mb: 1 }}
                />
              )}
              {baptismFilter !== "all" && (
                <Chip
                  label={`Baptism: ${baptismFilter}`}
                  onDelete={() => setBaptismFilter("all")}
                  sx={{ mr: 1, mb: 1 }}
                />
              )}
              {fellowshipFilter !== "all" && (
                <Chip
                  label={`Fellowship: ${fellowshipFilter}`}
                  onDelete={() => setFellowshipFilter("all")}
                  sx={{ mr: 1, mb: 1 }}
                />
              )}
            </Box>
          </Paper>

          {/* Fellowship Breakdown */}
          <Paper sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Fellowship Breakdown
            </Typography>
            <Grid container spacing={1}>
              {Object.entries(fellowshipCounts)
                .sort(([, a], [, b]) => b - a)
                .map(([fellowship, count]) => (
                  <Grid item key={fellowship}>
                    <Chip
                      label={`${fellowship}: ${count}`}
                      variant={
                        fellowshipFilter === fellowship ? "filled" : "outlined"
                      }
                      onClick={() =>
                        setFellowshipFilter(
                          fellowshipFilter === fellowship ? "all" : fellowship
                        )
                      }
                    />
                  </Grid>
                ))}
            </Grid>
          </Paper>

          {/* Children Participants Table */}
          {Object.entries(groupedChildParticipants).map(
            ([groupName, groupChildParticipants]) => (
              <Accordion
                key={groupName}
                defaultExpanded={groupBy === "none"}
                sx={{ mb: 2 }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="h6">
                    {groupName} ({groupChildParticipants.length} children)
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  {isMobile ? (
                    // Mobile: Card-based layout
                    <Box>
                      {groupChildParticipants.map((childParticipant) => (
                        <MobileChildParticipantCard
                          key={childParticipant._id}
                          childParticipant={childParticipant}
                        />
                      ))}
                    </Box>
                  ) : (
                    // Desktop: Table layout
                    <TableContainer
                      component={Paper}
                      sx={{ overflowX: "auto" }}
                    >
                      <Table stickyHeader>
                        <TableHead>
                          <TableRow>
                            <TableCell>Reg No</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Gender</TableCell>
                            <TableCell>Age</TableCell>
                            <TableCell>Fellowship</TableCell>
                            <TableCell>Area</TableCell>
                            <TableCell>Is Saved?</TableCell>
                            <TableCell>Baptism</TableCell>
                            <TableCell>Comments</TableCell>
                            <TableCell>Actions</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {groupChildParticipants.map((childParticipant) => (
                            <TableRow key={childParticipant._id}>
                              <TableCell>
                                <Chip
                                  label={childParticipant.participant.regNo}
                                  color="default"
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>
                                {childParticipant.participant.name}
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={formatGender(
                                    childParticipant.participant.gender
                                  )}
                                  color={
                                    childParticipant.participant.gender ===
                                    "male"
                                      ? "info"
                                      : "secondary"
                                  }
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>
                                {childParticipant.participant.age || "N/A"}
                              </TableCell>
                              <TableCell>
                                {childParticipant.participant.fellowshipName}
                              </TableCell>
                              <TableCell>
                                {childParticipant.participant.area || "N/A"}
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={formatIsSaved(
                                    childParticipant.isSaved
                                  )}
                                  color={
                                    childParticipant.isSaved === "saved"
                                      ? "success"
                                      : childParticipant.isSaved === "bornAgain"
                                      ? "primary"
                                      : childParticipant.isSaved === "notSaved"
                                      ? "error"
                                      : "warning"
                                  }
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>
                                <Chip
                                  label={
                                    childParticipant.baptism
                                      ? "Baptized"
                                      : "Not Baptized"
                                  }
                                  color={
                                    childParticipant.baptism
                                      ? "success"
                                      : "error"
                                  }
                                  size="small"
                                />
                              </TableCell>
                              <TableCell>
                                <Box sx={{ maxWidth: 200 }}>
                                  <Typography variant="body2" noWrap>
                                    {childParticipant.comments || "N/A"}
                                  </Typography>
                                </Box>
                              </TableCell>
                              <TableCell>
                                <Box sx={{ display: "flex", gap: 1 }}>
                                  <IconButton
                                    size="small"
                                    color="primary"
                                    onClick={() => handleEdit(childParticipant)}
                                    title="Edit child participant"
                                  >
                                    <EditIcon />
                                  </IconButton>
                                  <IconButton
                                    size="small"
                                    color="error"
                                    onClick={() =>
                                      handleDelete(childParticipant)
                                    }
                                    title="Delete child participant"
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
                  )}
                </AccordionDetails>
              </Accordion>
            )
          )}
        </Box>
      )}

      {/* Add Child Participant Dialog */}
      <Dialog open={addOpen} onClose={handleAddClose} maxWidth="md" fullWidth>
        <DialogTitle>Add New Child Participant</DialogTitle>
        <DialogContent>
          {availableParticipants.length > 0 ? (
            <AddChildParticipantForm
              availableParticipants={availableParticipants}
              onSave={(data) => handleSaveChildParticipant(data, false)}
              onCancel={handleAddClose}
            />
          ) : (
            <Alert severity="info">
              No available children participants to add. All children already
              have child participant records.
            </Alert>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Child Participant Dialog */}
      <Dialog open={editOpen} onClose={handleEditClose} maxWidth="md" fullWidth>
        <DialogTitle>Edit Child Participant</DialogTitle>
        <DialogContent>
          {selectedChildParticipant && (
            <EditChildParticipantForm
              childParticipant={selectedChildParticipant}
              onSave={(data) => handleSaveChildParticipant(data, true)}
              onCancel={handleEditClose}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onClose={handleDeleteClose}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete{" "}
            {selectedChildParticipant?.participant.name} from the children
            participants list? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteClose}>Cancel</Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
