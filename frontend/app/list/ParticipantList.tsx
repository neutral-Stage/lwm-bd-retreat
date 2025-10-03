"use client";

import { useState, useRef } from "react";
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
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import { Participant } from "../../types";
import { updateParticipant, deleteParticipant } from "../../lib/data-fetching";
// Simplified inline edit modal will be created below

interface ParticipantListProps {
  participants: Participant[];
}

export default function ParticipantList({
  participants,
}: ParticipantListProps) {
  const [statusFilter, setStatusFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [fellowshipFilter, setFellowshipFilter] = useState("all");
  const [groupBy, setGroupBy] = useState("none");

  // Edit and delete states
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedParticipant, setSelectedParticipant] =
    useState<Participant | null>(null);
  const [participantState, setParticipantState] =
    useState<Participant[]>(participants);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });


  // Clean the data (remove any remaining Unicode issues)
  const cleanedParticipants = participantState.map((p) => ({
    ...p,
    regNo: cleanText(p.regNo || ""),
    name: cleanText(p.name || ""),
    fellowshipName: cleanText(p.fellowshipName || ""),
    department: cleanText(p.department || ""),
    gender: cleanText(p.gender || "male") as "male" | "female",
    present: cleanText(p.present || "present") as "present" | "absent",
  }));


  // Clean text function
  function cleanText(text: string) {
    if (!text || typeof text !== "string") return text;
    return text
      .replace(/[\u200B-\u200D\u2060\uFEFF]/g, "")
      .replace(/\s+/g, " ") // Replace multiple spaces with single space
      .trim();
  }

  // Edit and delete handlers
  const handleEdit = (participant: Participant) => {
    setSelectedParticipant(participant);
    setEditOpen(true);
  };

  const handleDelete = (participant: Participant) => {
    setSelectedParticipant(participant);
    setDeleteOpen(true);
  };

  const handleEditClose = () => {
    setEditOpen(false);
    setSelectedParticipant(null);
  };

  const handleDeleteClose = () => {
    setDeleteOpen(false);
    setSelectedParticipant(null);
  };

  const handleSaveParticipant = async (updatedParticipant: Participant) => {
    try {
      const savedParticipant = await updateParticipant(
        selectedParticipant!._id,
        updatedParticipant
      );

      // Update local state
      setParticipantState((prev) =>
        prev.map((p) =>
          p._id === selectedParticipant!._id ? savedParticipant : p
        )
      );

      setEditOpen(false);
      setSelectedParticipant(null);
      setSnackbar({
        open: true,
        message: `Successfully updated ${savedParticipant.name}`,
        severity: "success",
      });
    } catch (error) {
      console.error("Error updating participant:", error);
      setSnackbar({
        open: true,
        message: `Failed to update participant: ${error}`,
        severity: "error",
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedParticipant) return;

    try {
      await deleteParticipant(selectedParticipant._id);

      // Update local state
      setParticipantState((prev) =>
        prev.filter((p) => p._id !== selectedParticipant._id)
      );

      setDeleteOpen(false);
      setSelectedParticipant(null);
      setSnackbar({
        open: true,
        message: `Successfully deleted ${selectedParticipant.name}`,
        severity: "success",
      });
    } catch (error) {
      console.error("Error deleting participant:", error);
      setSnackbar({
        open: true,
        message: `Failed to delete participant: ${error}`,
        severity: "error",
      });
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  // Export participants to XLSX grouped by fellowship
  const handleExportToXLSX = async () => {
    try {
      // Import xlsx dynamically
      const XLSX = await import("xlsx");

      // Group participants by fellowship
      const groupedByFellowship = cleanedParticipants.reduce(
        (groups, participant) => {
          const fellowship = participant.fellowshipName || "No Fellowship";
          if (!groups[fellowship]) {
            groups[fellowship] = [];
          }
          groups[fellowship].push(participant);
          return groups;
        },
        {} as Record<string, Participant[]>
      );

      // Create single workbook
      const workbook = XLSX.utils.book_new();

      // Create main data array with grouped participants
      const mainData: any[][] = [];

      // Add header row
      mainData.push([
        "No.",
        "Registration No",
        "Name",
        "Gender",
        "Department",
        "Fellowship",
        "Area",
        "Age",
        "Contact",
        "Guardian Name",
        "Guardian Contact",
        "Present Status",
        "Fee Paid",
      ]);

      // Add participants grouped by fellowship
      let sequentialNumber = 1;

      Object.entries(groupedByFellowship)
        .sort(([a], [b]) => a.localeCompare(b)) // Sort fellowships alphabetically
        .forEach(([fellowship, participants]) => {
          // Add fellowship header row
          mainData.push([
            `=== ${fellowship} (${participants.length} participants) ===`,
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
            "",
          ]);

          // Add participants under this fellowship
          participants
            .sort((a, b) => (a.name || "").localeCompare(b.name || "")) // Sort participants alphabetically
            .forEach((participant) => {
              mainData.push([
                sequentialNumber++,
                participant.regNo || "",
                participant.name || "",
                participant.gender || "",
                participant.department || "",
                participant.fellowshipName || "",
                participant.area || "",
                participant.age?.toString() || "",
                participant.contact || "",
                participant.guardianName || "",
                participant.guardianContact || "",
                participant.present || "",
                participant.feePaid ? "Yes" : "No",
              ]);
            });

          // Add empty row between fellowships
          mainData.push(["", "", "", "", "", "", "", "", "", "", "", "", ""]);
        });

      // Create the sheet
      const sheet = XLSX.utils.aoa_to_sheet(mainData);

      // Style the fellowship header rows (they will be in column A)
      const range = XLSX.utils.decode_range(sheet["!ref"] || "A1");
      for (let row = range.s.r; row <= range.e.r; row++) {
        const cellAddress = XLSX.utils.encode_cell({ r: row, c: 0 });
        if (
          mainData[row] &&
          mainData[row][0] &&
          typeof mainData[row][0] === "string" &&
          mainData[row][0].includes("===")
        ) {
          // Fellowship header row - make it bold
          if (!sheet[cellAddress]) sheet[cellAddress] = { v: mainData[row][0] };
          sheet[cellAddress].s = {
            font: { bold: true },
            fill: { fgColor: { rgb: "E3F2FD" } },
          };
        }
      }

      // Add the sheet to workbook
      XLSX.utils.book_append_sheet(
        workbook,
        sheet,
        "Participants by Fellowship"
      );

      // Generate filename with timestamp
      const timestamp = new Date()
        .toISOString()
        .slice(0, 19)
        .replace(/[-T:]/g, "");
      const filename = `Participants_by_Fellowship_${timestamp}.xlsx`;

      // Save file
      XLSX.writeFile(workbook, filename);

      setSnackbar({
        open: true,
        message: `✅ Exported ${cleanedParticipants.length} participants grouped by fellowship to ${filename}`,
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

  // Filter participants based on selected filters
  const filteredParticipants = cleanedParticipants.filter((participant) => {
    // Status filter (present/absent/all)
    if (statusFilter !== "all" && participant.present !== statusFilter) {
      return false;
    }

    // Department filter
    if (
      departmentFilter !== "all" &&
      participant.department !== departmentFilter
    ) {
      return false;
    }

    // Fellowship filter
    if (
      fellowshipFilter !== "all" &&
      participant.fellowshipName !== fellowshipFilter
    ) {
      return false;
    }

    return true;
  });

  // Get unique values for dropdowns
  const uniqueFellowships = Array.from(
    new Set(cleanedParticipants.map((p) => p.fellowshipName).filter(Boolean))
  ).sort();

  // Calculate statistics
  const totalParticipants = cleanedParticipants.length;
  const presentCount = cleanedParticipants.filter(
    (p) => p.present === "present"
  ).length;
  const absentCount = cleanedParticipants.filter(
    (p) => p.present === "absent"
  ).length;

  const departmentCounts = cleanedParticipants.reduce((acc, p) => {
    acc[p.department] = (acc[p.department] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const fellowshipCounts = cleanedParticipants.reduce((acc, p) => {
    acc[p.fellowshipName] = (acc[p.fellowshipName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Group participants when groupBy is not "none"
  const groupedParticipants =
    groupBy !== "none" && groupBy === "fellowshipName"
      ? filteredParticipants.reduce((groups, participant) => {
          const key = participant.fellowshipName;

          if (!groups[key]) {
            groups[key] = [];
          }
          groups[key].push(participant);
          return groups;
        }, {} as Record<string, Participant[]>)
      : { "All Participants": filteredParticipants };

  // Edit Participant Form Component
  const EditParticipantForm = ({
    participant,
    onSave,
    onCancel,
    fellowshipOptions,
  }: {
    participant: Participant;
    onSave: (participant: Participant) => void;
    onCancel: () => void;
    fellowshipOptions: string[];
  }) => {
    const [formData, setFormData] = useState<Participant>(participant);

    const handleChange = (field: keyof Participant, value: any) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSave(formData);
    };

    return (
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Registration Number"
              value={formData.regNo || ""}
              onChange={(e) => handleChange("regNo", e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              required
              label="Name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Contact"
              value={formData.contact || ""}
              onChange={(e) => handleChange("contact", e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Age"
              type="number"
              value={formData.age || ""}
              onChange={(e) =>
                handleChange("age", parseInt(e.target.value) || null)
              }
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Gender</InputLabel>
              <Select
                value={formData.gender}
                onChange={(e) => handleChange("gender", e.target.value)}
                label="Gender"
              >
                <MenuItem value="male">Male</MenuItem>
                <MenuItem value="female">Female</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Department</InputLabel>
              <Select
                value={formData.department || ""}
                onChange={(e) => handleChange("department", e.target.value)}
                label="Department"
              >
                <MenuItem value="adult">Adult</MenuItem>
                <MenuItem value="child">Child</MenuItem>
                <MenuItem value="youth">Youth</MenuItem>
                <MenuItem value="volunteer">Volunteer</MenuItem>
                <MenuItem value="senior">Senior</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Fellowship</InputLabel>
              <Select
                value={formData.fellowshipName}
                onChange={(e) => handleChange("fellowshipName", e.target.value)}
                label="Fellowship"
              >
                {fellowshipOptions.map((fellowship) => (
                  <MenuItem key={fellowship} value={fellowship}>
                    {fellowship}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Area"
              value={formData.area || ""}
              onChange={(e) => handleChange("area", e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={formData.present}
                onChange={(e) => handleChange("present", e.target.value)}
                label="Status"
              >
                <MenuItem value="present">Present</MenuItem>
                <MenuItem value="absent">Absent</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Guardian Name"
              value={formData.guardianName || ""}
              onChange={(e) => handleChange("guardianName", e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              label="Guardian Contact"
              value={formData.guardianContact || ""}
              onChange={(e) => handleChange("guardianContact", e.target.value)}
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

  return (
    <Box sx={{ p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h4">Participant Management System</Typography>
        <Button
          variant="contained"
          onClick={handleExportToXLSX}
          size="large"
          startIcon={<FileDownloadIcon />}
        >
          Export to Excel
        </Button>
      </Box>

      {/* Statistics Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total
              </Typography>
              <Typography variant="h4">{totalParticipants}</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Present
              </Typography>
              <Typography variant="h4" color="success.main">
                {presentCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Absent
              </Typography>
              <Typography variant="h4" color="error.main">
                {absentCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary">
                <Chip
                  label={`${
                    groupedParticipants["All Participants"]?.length ||
                    filteredParticipants.length
                  }`}
                  color="primary"
                />
              </Typography>
              <Typography variant="subtitle1">Filtered Results</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filter Controls */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Filters
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="present">Present</MenuItem>
                <MenuItem value="absent">Absent</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Department</InputLabel>
              <Select
                value={departmentFilter}
                label="Department"
                onChange={(e) => setDepartmentFilter(e.target.value)}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="adult">Adult</MenuItem>
                <MenuItem value="senior">Senior</MenuItem>
                <MenuItem value="youth">Youth</MenuItem>
                <MenuItem value="volunteer">Volunteer</MenuItem>
                <MenuItem value="child">Child</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
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

          <Grid item xs={12} sm={6} md={3}>
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
          {statusFilter !== "all" && (
            <Chip
              label={`Status: ${statusFilter}`}
              onDelete={() => setStatusFilter("all")}
              sx={{ mr: 1, mb: 1 }}
            />
          )}
          {departmentFilter !== "all" && (
            <Chip
              label={`Department: ${departmentFilter}`}
              onDelete={() => setDepartmentFilter("all")}
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

      {/* Statistics Summary */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Department Breakdown
        </Typography>
        <Grid container spacing={1}>
          {Object.entries(departmentCounts).map(([dept, count]) => (
            <Grid item key={dept}>
              <Chip
                label={`${dept}: ${count}`}
                variant={departmentFilter === dept ? "filled" : "outlined"}
              />
            </Grid>
          ))}
        </Grid>

        <Divider sx={{ my: 2 }} />

        <Typography variant="h6" gutterBottom>
          Top Fellowships
        </Typography>
        <Grid container spacing={1}>
          {Object.entries(fellowshipCounts)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 10)
            .map(([fellowship, count]) => (
              <Grid item key={fellowship}>
                <Chip
                  label={`${fellowship}: ${count}`}
                  variant={
                    fellowshipFilter === fellowship ? "filled" : "outlined"
                  }
                />
              </Grid>
            ))}
        </Grid>
      </Paper>

      {/* Participants Table */}
      {Object.entries(groupedParticipants).map(
        ([groupName, groupParticipants]) => (
          <Accordion
            key={groupName}
            defaultExpanded={groupBy === "none"}
            sx={{ mb: 2 }}
          >
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="h6">
                {groupName} ({groupParticipants.length} participants)
              </Typography>
            </AccordionSummary>
            <AccordionDetails>
              <TableContainer component={Paper}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Reg No</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Gender</TableCell>
                      <TableCell>Department</TableCell>
                      <TableCell>Fellowship</TableCell>
                      <TableCell>Area</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Age</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {groupParticipants.map((participant) => (
                      <TableRow key={participant.regNo || participant._id}>
                        <TableCell>
                          <Chip
                            label={participant.regNo}
                            color={
                              participant.department === "volunteer"
                                ? "primary"
                                : "default"
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{participant.name}</TableCell>
                        <TableCell>
                          <Chip
                            label={participant.gender}
                            color={
                              participant.gender === "male"
                                ? "info"
                                : "secondary"
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{participant.department}</TableCell>
                        <TableCell>{participant.fellowshipName}</TableCell>
                        <TableCell>{participant.area || "N/A"}</TableCell>
                        <TableCell>
                          <Chip
                            label={participant.present}
                            color={
                              participant.present === "present"
                                ? "success"
                                : "error"
                            }
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{participant.age || "N/A"}</TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", gap: 1 }}>
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleEdit(participant)}
                              title="Edit participant"
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDelete(participant)}
                              title="Delete participant"
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
            </AccordionDetails>
          </Accordion>
        )
      )}

      {/* Debug info during development */}
      {process.env.NODE_ENV === "development" && (
        <Paper sx={{ p: 2, mt: 3 }}>
          <Typography variant="subtitle2" color="textSecondary">
            Debug Info: Filtered {filteredParticipants.length} of{" "}
            {totalParticipants} participants
          </Typography>
        </Paper>
      )}
      <Dialog open={editOpen} onClose={handleEditClose} maxWidth="md" fullWidth>
        <DialogTitle>Edit Participant</DialogTitle>
        <DialogContent>
          {selectedParticipant && (
            <EditParticipantForm
              participant={selectedParticipant}
              onSave={handleSaveParticipant}
              onCancel={handleEditClose}
              fellowshipOptions={uniqueFellowships}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onClose={handleDeleteClose}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {selectedParticipant?.name}? This
            action cannot be undone.
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
