"use client";

import React, { useState, useMemo } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Button,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  ChildCare as ChildrenIcon,
  Male as MaleIcon,
  Female as FemaleIcon,
  Psychology as CounsellingIcon,
  Save as SavedIcon,
  PersonOff as SinnerIcon,
  LocalOffer as BaptismIcon,
  FileDownload as FileDownloadIcon,
  Search as SearchIcon,
  Info as InfoIcon,
  Close as CloseIcon,
  ChildFriendly as PsychologyIcon,
} from "@mui/icons-material";
import { ChildParticipant } from "../../types";
import {
  getAllChildParticipants,
  getChildParticipantsByIsSaved,
  getChildParticipantsByBaptism,
} from "../../lib/data-fetching";

interface ChildrenReportsClientProps {
  childParticipants: ChildParticipant[];
}

interface ChildSalvationsAnalysis {
  childParticipantId: string;
  childName: string;
  fellowshipName: string;
  isSaved: "saved" | "bornAgain" | "confused" | "notSaved";
  baptism: boolean;
  comments: string;
  area: string;
  age: string;
  gender: "male" | "female";
}

export default function ChildrenReportsClient({
  childParticipants,
}: ChildrenReportsClientProps) {
  const [fellowshipFilter, setFellowshipFilter] = useState("all");
  const [isSavedFilter, setIsSavedFilter] = useState("all");
  const [baptismFilter, setBaptismFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChild, setSelectedChild] = useState<ChildParticipant | null>(
    null
  );
  const [showSearchDialog, setShowSearchDialog] = useState(false);
  const [searchResults, setSearchResults] = useState<ChildParticipant[]>([]);
  const [expandedSections, setExpandedSections] = useState({
    overview: true,
    salvation: false,
    baptism: false,
    demographics: false,
    search: false,
  });

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

  // Calculate comprehensive statistics
  const stats = useMemo(() => {
    const filteredChildren = childParticipants.filter((cp) => {
      if (
        fellowshipFilter !== "all" &&
        cp.participant.fellowshipName !== fellowshipFilter
      )
        return false;
      if (isSavedFilter !== "all" && cp.isSaved !== isSavedFilter) return false;
      if (baptismFilter !== "all") {
        if (baptismFilter === "baptized" && !cp.baptism) return false;
        if (baptismFilter === "notBaptized" && cp.baptism) return false;
      }
      if (searchQuery) {
        const searchLower = searchQuery.toLowerCase();
        const matchesName = cp.participant.name
          .toLowerCase()
          .includes(searchLower);
        const matchesRegNo =
          cp.participant.regNo?.toLowerCase().includes(searchLower) || false;
        const matchesComments =
          cp.comments?.toLowerCase().includes(searchLower) || false;

        if (!matchesName && !matchesRegNo && !matchesComments) {
          return false;
        }
      }
      return true;
    });

    const total = filteredChildren.length;
    const male = filteredChildren.filter(
      (cp) => cp.participant.gender === "male"
    ).length;
    const female = filteredChildren.filter(
      (cp) => cp.participant.gender === "female"
    ).length;

    // Salvation status breakdown
    const saved = filteredChildren.filter(
      (cp) => cp.isSaved === "saved"
    ).length;
    const bornAgain = filteredChildren.filter(
      (cp) => cp.isSaved === "bornAgain"
    ).length;
    const confused = filteredChildren.filter(
      (cp) => cp.isSaved === "confused"
    ).length;
    const notSaved = filteredChildren.filter(
      (cp) => cp.isSaved === "notSaved"
    ).length;

    // Baptism status
    const baptized = filteredChildren.filter((cp) => cp.baptism).length;
    const notBaptized = total - baptized;

    // Fellowship breakdown
    const fellowshipCounts = filteredChildren.reduce((acc, cp) => {
      acc[cp.participant.fellowshipName] =
        (acc[cp.participant.fellowshipName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Age groups (if age data available)
    const ageGroups = {
      under5: filteredChildren.filter((cp) => {
        const age = cp.participant.age;
        return (
          age && (age.includes("3") || age.includes("4") || parseInt(age) <= 5)
        );
      }).length,
      age6to10: filteredChildren.filter((cp) => {
        const age = cp.participant.age;
        return (
          age &&
          (age.includes("6") ||
            age.includes("7") ||
            age.includes("8") ||
            age.includes("9") ||
            age.includes("10"))
        );
      }).length,
      age11to15: filteredChildren.filter((cp) => {
        const age = cp.participant.age;
        return (
          age &&
          (age.includes("11") ||
            age.includes("12") ||
            age.includes("13") ||
            age.includes("14") ||
            age.includes("15"))
        );
      }).length,
      above15: filteredChildren.filter((cp) => {
        const age = cp.participant.age;
        return age && parseInt(age) > 15;
      }).length,
    };

    return {
      total,
      male,
      female,
      saved,
      bornAgain,
      confused,
      notSaved,
      baptized,
      notBaptized,
      fellowshipCounts,
      ageGroups,
      filteredChildren,
    };
  }, [
    childParticipants,
    fellowshipFilter,
    isSavedFilter,
    baptismFilter,
    searchQuery,
  ]);

  // Get unique fellowships for filter
  const uniqueFellowships = Array.from(
    new Set(
      childParticipants
        .map((cp) => cp.participant.fellowshipName)
        .filter(Boolean)
    )
  ).sort();

  // Search functionality
  const performSearch = (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const searchTerms = query.toLowerCase().trim().split(/\s+/);
    const results = childParticipants.filter((cp) => {
      const searchableText = [
        cp.participant.name,
        cp.participant.regNo,
        cp.participant.contact,
        cp.participant.fellowshipName,
        cp.participant.department,
        cp.participant.area,
        cp.participant.guardianName,
        cp.participant.area,
        cp.participant.age,
        cp.comments,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchTerms.every((term) => searchableText.includes(term));
    });

    setSearchResults(results);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);
    performSearch(query);
  };

  const handleViewChildDetails = (childParticipant: ChildParticipant) => {
    setSelectedChild(childParticipant);
    setShowSearchDialog(true);
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const exportChildrenReport = () => {
    try {
      // Create a comprehensive children report data structure
      const reportData = {
        overview: {
          totalChildren: stats.total,
          maleChildren: stats.male,
          femaleChildren: stats.female,
          savedChildren: stats.saved,
          bornAgainChildren: stats.bornAgain,
          confusedChildren: stats.confused,
          notSavedChildren: stats.notSaved,
          baptizedChildren: stats.baptized,
          notBaptizedChildren: stats.notBaptized,
        },
        demographics: {
          ageGroups: stats.ageGroups,
          fellowshipDistribution: stats.fellowshipCounts,
          genderDistribution: {
            male: stats.male,
            female: stats.female,
          },
        },
        spiritualStatus: {
          byIsSaved: {
            saved: stats.saved,
            bornAgain: stats.bornAgain,
            confused: stats.confused,
            notSaved: stats.notSaved,
          },
          byBaptism: {
            baptized: stats.baptized,
            notBaptized: stats.notBaptized,
          },
        },
        childrenDetails: stats.filteredChildren.map((cp) => ({
          name: cp.participant.name,
          regNo: cp.participant.regNo,
          fellowship: cp.participant.fellowshipName,
          gender: cp.participant.gender,
          age: cp.participant.age,
          guardianContact: cp.participant.area,
          isSaved: cp.isSaved,
          baptism: cp.baptism,
          comments: cp.comments,
        })),
        filters: {
          fellowship: fellowshipFilter,
          isSaved: isSavedFilter,
          baptism: baptismFilter,
          searchQuery: searchQuery,
        },
        generatedAt: new Date().toISOString(),
        generatedBy: "BLWM Retreat Children Management System",
      };

      // Convert to JSON and download
      const dataStr = JSON.stringify(reportData, null, 2);
      const dataUri =
        "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

      const exportFileDefaultName = `children-report-${
        new Date().toISOString().split("T")[0]
      }.json`;

      const linkElement = document.createElement("a");
      linkElement.setAttribute("href", dataUri);
      linkElement.setAttribute("download", exportFileDefaultName);
      linkElement.click();
    } catch (error) {
      console.error("Error exporting children report:", error);
      alert("Error exporting report. Please try again.");
    }
  };

  return (
    <Box sx={{ padding: { xs: 2, sm: 3 } }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h4" component="h1">
          Children Participants Reports
        </Typography>
        <Button
          variant="contained"
          startIcon={<FileDownloadIcon />}
          onClick={exportChildrenReport}
        >
          Export Children Report
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Filters
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Fellowship</InputLabel>
              <Select
                value={fellowshipFilter}
                label="Fellowship"
                onChange={(e) => setFellowshipFilter(e.target.value)}
              >
                <MenuItem value="all">All Fellowships</MenuItem>
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
          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>Baptism Status</InputLabel>
              <Select
                value={baptismFilter}
                label="Baptism Status"
                onChange={(e) => setBaptismFilter(e.target.value)}
              >
                <MenuItem value="all">All</MenuItem>
                <MenuItem value="baptized">Baptized</MenuItem>
                <MenuItem value="notBaptized">Not Baptized</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              label="Search"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search children..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
        </Grid>
      </Paper>

      {/* Search Results Section */}
      {searchQuery && (
        <Accordion
          expanded={expandedSections.search}
          onChange={() => toggleSection("search")}
          sx={{ mb: 2 }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="h6">
              <SearchIcon sx={{ mr: 1, verticalAlign: "middle" }} />
              Search Results ({searchResults.length} children found)
            </Typography>
          </AccordionSummary>
          <AccordionDetails>
            {searchResults.length === 0 ? (
              <Alert severity="info">
                No children found matching "{searchQuery}".
              </Alert>
            ) : (
              <TableContainer component={Paper}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Reg No</TableCell>
                      <TableCell>Age</TableCell>
                      <TableCell>Gender</TableCell>
                      <TableCell>Fellowship</TableCell>
                      <TableCell>Is Saved?</TableCell>
                      <TableCell>Baptized</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {searchResults.map((childParticipant) => (
                      <TableRow key={childParticipant._id}>
                        <TableCell>
                          {childParticipant.participant.name}
                        </TableCell>
                        <TableCell>
                          {childParticipant.participant.regNo || "N/A"}
                        </TableCell>
                        <TableCell>
                          {childParticipant.participant.age || "N/A"}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={formatGender(
                              childParticipant.participant.gender
                            )}
                            size="small"
                            color={
                              childParticipant.participant.gender === "male"
                                ? "info"
                                : "secondary"
                            }
                          />
                        </TableCell>
                        <TableCell>
                          {childParticipant.participant.fellowshipName}
                        </TableCell>
                        <TableCell>
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
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={childParticipant.baptism ? "Yes" : "No"}
                            size="small"
                            color={
                              childParticipant.baptism ? "success" : "error"
                            }
                          />
                        </TableCell>
                        <TableCell>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<InfoIcon />}
                            onClick={() =>
                              handleViewChildDetails(childParticipant)
                            }
                          >
                            View Details
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </AccordionDetails>
        </Accordion>
      )}

      {/* Overview Statistics */}
      <Accordion
        expanded={expandedSections.overview}
        onChange={() => toggleSection("overview")}
        sx={{ mb: 2 }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">
            <ChildrenIcon sx={{ mr: 1, verticalAlign: "middle" }} />
            Overview Statistics
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            {/* Total Children */}
            <Grid item xs={12} sm={6} md={2.4}>
              <Card>
                <CardContent sx={{ textAlign: "center" }}>
                  <ChildrenIcon
                    sx={{ fontSize: 40, color: "primary.main", mb: 1 }}
                  />
                  <Typography variant="h4" color="primary">
                    {stats.total}
                  </Typography>
                  <Typography variant="subtitle1">Total Children</Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Gender Distribution */}
            <Grid item xs={12} sm={6} md={2.4}>
              <Card>
                <CardContent sx={{ textAlign: "center" }}>
                  <MaleIcon sx={{ fontSize: 40, color: "info.main", mb: 1 }} />
                  <Typography variant="h4" color="info.main">
                    {stats.male}
                  </Typography>
                  <Typography variant="subtitle1">Boys</Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={2.4}>
              <Card>
                <CardContent sx={{ textAlign: "center" }}>
                  <FemaleIcon
                    sx={{ fontSize: 40, color: "secondary.main", mb: 1 }}
                  />
                  <Typography variant="h4" color="secondary.main">
                    {stats.female}
                  </Typography>
                  <Typography variant="subtitle1">Girls</Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Baptism Status */}
            <Grid item xs={12} sm={6} md={2.4}>
              <Card>
                <CardContent sx={{ textAlign: "center" }}>
                  <BaptismIcon
                    sx={{ fontSize: 40, color: "success.main", mb: 1 }}
                  />
                  <Typography variant="h4" color="success.main">
                    {stats.baptized}
                  </Typography>
                  <Typography variant="subtitle1">Baptized</Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={2.4}>
              <Card>
                <CardContent sx={{ textAlign: "center" }}>
                  <Typography variant="h4" color="error.main">
                    {stats.notBaptized}
                  </Typography>
                  <Typography variant="subtitle1">Not Baptized</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Salvation Analysis */}
      <Accordion
        expanded={expandedSections.salvation}
        onChange={() => toggleSection("salvation")}
        sx={{ mb: 2 }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">
            <CounsellingIcon sx={{ mr: 1, verticalAlign: "middle" }} />
            Spiritual Status Analysis
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            {/* Salvation Statistics */}
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: "center" }}>
                  <SavedIcon
                    sx={{ fontSize: 40, color: "success.main", mb: 1 }}
                  />
                  <Typography variant="h4" color="success.main">
                    {stats.saved}
                  </Typography>
                  <Typography variant="subtitle1">Saved</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stats.total > 0
                      ? ((stats.saved / stats.total) * 100).toFixed(1)
                      : 0}
                    % of total
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: "center" }}>
                  <PsychologyIcon
                    sx={{ fontSize: 40, color: "primary.main", mb: 1 }}
                  />
                  <Typography variant="h4" color="primary.main">
                    {stats.bornAgain}
                  </Typography>
                  <Typography variant="subtitle1">
                    Born Again (Before)
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stats.total > 0
                      ? ((stats.bornAgain / stats.total) * 100).toFixed(1)
                      : 0}
                    % of total
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: "center" }}>
                  <SinnerIcon
                    sx={{ fontSize: 40, color: "warning.main", mb: 1 }}
                  />
                  <Typography variant="h4" color="warning.main">
                    {stats.confused}
                  </Typography>
                  <Typography variant="subtitle1">Confused</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stats.total > 0
                      ? ((stats.confused / stats.total) * 100).toFixed(1)
                      : 0}
                    % of total
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: "center" }}>
                  <Typography variant="h4" color="error.main">
                    {stats.notSaved}
                  </Typography>
                  <Typography variant="subtitle1">Not Saved</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stats.total > 0
                      ? ((stats.notSaved / stats.total) * 100).toFixed(1)
                      : 0}
                    % of total
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Baptism Analysis */}
      <Accordion
        expanded={expandedSections.baptism}
        onChange={() => toggleSection("baptism")}
        sx={{ mb: 2 }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">
            <BaptismIcon sx={{ mr: 1, verticalAlign: "middle" }} />
            Baptism Analysis
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent sx={{ textAlign: "center" }}>
                  <Typography variant="h4" color="success.main">
                    {stats.baptized}
                  </Typography>
                  <Typography variant="subtitle1">Baptized Children</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stats.total > 0
                      ? ((stats.baptized / stats.total) * 100).toFixed(1)
                      : 0}
                    % of total
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card>
                <CardContent sx={{ textAlign: "center" }}>
                  <Typography variant="h4" color="error.main">
                    {stats.notBaptized}
                  </Typography>
                  <Typography variant="subtitle1">Not Baptized</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stats.total > 0
                      ? ((stats.notBaptized / stats.total) * 100).toFixed(1)
                      : 0}
                    % of total
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Demographics Breakdown */}
      <Accordion
        expanded={expandedSections.demographics}
        onChange={() => toggleSection("demographics")}
        sx={{ mb: 2 }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">
            Demographics & Fellowship Distribution
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            {/* Age Groups */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Age Groups
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Card>
                    <CardContent sx={{ textAlign: "center" }}>
                      <Typography variant="h5" color="warning.main">
                        {stats.ageGroups.under5}
                      </Typography>
                      <Typography variant="body2">Under 5</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card>
                    <CardContent sx={{ textAlign: "center" }}>
                      <Typography variant="h5" color="primary.main">
                        {stats.ageGroups.age6to10}
                      </Typography>
                      <Typography variant="body2">6-10 years</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card>
                    <CardContent sx={{ textAlign: "center" }}>
                      <Typography variant="h5" color="secondary.main">
                        {stats.ageGroups.age11to15}
                      </Typography>
                      <Typography variant="body2">11-15 years</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card>
                    <CardContent sx={{ textAlign: "center" }}>
                      <Typography variant="h5" color="info.main">
                        {stats.ageGroups.above15}
                      </Typography>
                      <Typography variant="body2">Above 15</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Grid>

            {/* Fellowship Distribution */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Fellowship Distribution
              </Typography>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Fellowship</TableCell>
                      <TableCell align="right">Count</TableCell>
                      <TableCell align="right">%</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(stats.fellowshipCounts)
                      .sort(([, a], [, b]) => b - a)
                      .map(([fellowship, count]) => (
                        <TableRow key={fellowship}>
                          <TableCell>{fellowship}</TableCell>
                          <TableCell align="right">{count}</TableCell>
                          <TableCell align="right">
                            {stats.total > 0
                              ? ((count / stats.total) * 100).toFixed(1)
                              : 0}
                            %
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Children Details Dialog */}
      <Dialog
        open={showSearchDialog}
        onClose={() => setShowSearchDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6">Child Details</Typography>
            <IconButton onClick={() => setShowSearchDialog(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedChild && (
            <Box>
              {/* Basic Information */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary">
                    Basic Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Name
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {selectedChild.participant.name}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Registration Number
                      </Typography>
                      <Typography variant="body1">
                        {selectedChild.participant.regNo || "N/A"}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Gender
                      </Typography>
                      <Chip
                        label={formatGender(selectedChild.participant.gender)}
                        size="small"
                        color={
                          selectedChild.participant.gender === "male"
                            ? "info"
                            : "secondary"
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Age
                      </Typography>
                      <Typography variant="body1">
                        {selectedChild.participant.age || "N/A"}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Fellowship & Contact */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary">
                    Fellowship & Contact
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Fellowship
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {selectedChild.participant.fellowshipName}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Area
                      </Typography>
                      <Typography variant="body1">
                        {selectedChild.participant.area || "N/A"}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Spiritual Information */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary">
                    Spiritual Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Is Saved?
                      </Typography>
                      <Chip
                        label={formatIsSaved(selectedChild.isSaved)}
                        size="small"
                        color={
                          selectedChild.isSaved === "saved"
                            ? "success"
                            : selectedChild.isSaved === "bornAgain"
                            ? "primary"
                            : selectedChild.isSaved === "notSaved"
                            ? "error"
                            : "warning"
                        }
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Baptism Status
                      </Typography>
                      <Chip
                        label={
                          selectedChild.baptism ? "Baptized" : "Not Baptized"
                        }
                        size="small"
                        color={selectedChild.baptism ? "success" : "error"}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="text.secondary">
                        Comments
                      </Typography>
                      <Paper sx={{ p: 2, mt: 1, backgroundColor: "grey.50" }}>
                        <Typography
                          variant="body2"
                          style={{ whiteSpace: "pre-wrap" }}
                        >
                          {selectedChild.comments || "No comments available"}
                        </Typography>
                      </Paper>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setShowSearchDialog(false)}
            variant="contained"
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
