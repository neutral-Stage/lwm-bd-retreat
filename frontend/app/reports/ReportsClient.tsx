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
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
} from "@mui/material";
import {
  ExpandMore as ExpandMoreIcon,
  People as PeopleIcon,
  Male as MaleIcon,
  Female as FemaleIcon,
  ChildCare as ChildIcon,
  Person as AdultIcon,
  Psychology as CounsellingIcon,
  Save as SavedIcon,
  PersonOff as SinnerIcon,
  FileDownload as FileDownloadIcon,
  Search as SearchIcon,
  Info as InfoIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { Participant, Counselling, CounsellingParticipant } from "../../types";

interface ReportsClientProps {
  participants: Participant[];
  counsellings: Counselling[];
}

interface SalvationAnalysis {
  participantId: string;
  participantName: string;
  fellowshipName: string;
  counsellorName: string;
  status: "done" | "pending";
  comments: string;
  salvationStatus: "saved" | "sinner" | "unknown";
  salvationKeywords: string[];
}

const SALVATION_KEYWORDS = [
  "love of god",
  "love of God",
  "Love of God",
  "saved",
  "salvation",
  "accept",
  "accepted",
  "jesus",
  "Jesus",
  "christ",
  "Christ",
  "lord",
  "Lord",
  "savior",
  "saviour",
  "born again",
  "eternal life",
  "forgiveness",
  "redeemed",
  "grace",
  "blessed",
  "faith",
  "believe",
  "believed",
  "prayer",
  "prayed",
  "confessed",
  "commit",
  "committed",
  "surrender",
  "surrendered",
  "repent",
  "repented",
  "repentance",
  "holy spirit",
  "Holy Spirit",
  "baptized",
  "baptism",
  "new life",
  "new birth",
  "transformed",
  "changed",
  "peace",
  "joy",
  "hope",
  "eternal",
  "heaven",
  "righteous",
  "righteousness",
  "sin forgiven",
  "sins forgiven",
  "testimony",
  "witness",
  "gospel",
  "good news",
  "praise",
  "worship",
  "hallelujah",
  "amen",
  "blessing",
  "miracle",
  "healing",
  "delivered",
  "deliverance"
];

export default function ReportsClient({
  participants,
  counsellings,
}: ReportsClientProps) {
  const [fellowshipFilter, setFellowshipFilter] = useState("all");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [searchResults, setSearchResults] = useState<Participant[]>([]);
  const [showSearchDialog, setShowSearchDialog] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    overview: true,
    demographics: false,
    salvation: false,
    comments: false,
    search: false,
  });

  // Helper function to detect salvation status from comments
  const detectSalvationStatus = (comments: string): {
    status: "saved" | "sinner" | "unknown";
    keywords: string[];
  } => {
    if (!comments || comments.trim() === "") {
      return { status: "unknown", keywords: [] };
    }

    const lowerComments = comments.toLowerCase();
    const foundKeywords = SALVATION_KEYWORDS.filter(keyword =>
      lowerComments.includes(keyword.toLowerCase())
    );

    if (foundKeywords.length > 0) {
      return { status: "saved", keywords: foundKeywords };
    }

    return { status: "sinner", keywords: [] };
  };

  // Get all participants connected to counselling teams with salvation analysis
  const salvationAnalysis: SalvationAnalysis[] = useMemo(() => {
    const analysis: SalvationAnalysis[] = [];

    counsellings.forEach((counselling) => {
      if (counselling.participants && counselling.participants.length > 0) {
        counselling.participants.forEach((cp: CounsellingParticipant) => {
          if (cp.status === "done" && cp.comments) {
            const { status, keywords } = detectSalvationStatus(cp.comments);
            analysis.push({
              participantId: cp.participant._id,
              participantName: cp.participant.name,
              fellowshipName: cp.participant.fellowshipName,
              counsellorName: counselling.counsellor.name,
              status: cp.status,
              comments: cp.comments,
              salvationStatus: status,
              salvationKeywords: keywords,
            });
          }
        });
      }
    });

    return analysis;
  }, [counsellings]);

  // Calculate comprehensive statistics
  const stats = useMemo(() => {
    const filteredParticipants = participants.filter(p => {
      if (fellowshipFilter !== "all" && p.fellowshipName !== fellowshipFilter) return false;
      if (departmentFilter !== "all" && p.department !== departmentFilter) return false;
      return true;
    });

    const total = filteredParticipants.length;
    const male = filteredParticipants.filter(p => p.gender === "male").length;
    const female = filteredParticipants.filter(p => p.gender === "female").length;
    const children = filteredParticipants.filter(p => p.department === "child").length;
    const adults = filteredParticipants.filter(p => p.department === "adult").length;
    const youth = filteredParticipants.filter(p => p.department === "youth").length;
    const seniors = filteredParticipants.filter(p => p.department === "senior").length;
    const volunteers = filteredParticipants.filter(p => p.department === "volunteer").length;
    const present = filteredParticipants.filter(p => p.present === "present").length;
    const absent = filteredParticipants.filter(p => p.present === "absent").length;

    // Counselling-related stats
    const counsellingParticipants = salvationAnalysis.filter(sa => {
      if (fellowshipFilter !== "all" && sa.fellowshipName !== fellowshipFilter) return false;
      return true;
    });

    const saved = counsellingParticipants.filter(p => p.salvationStatus === "saved").length;
    const sinners = counsellingParticipants.filter(p => p.salvationStatus === "sinner").length;
    const unknownSalvation = counsellingParticipants.filter(p => p.salvationStatus === "unknown").length;

    // Fellowship breakdown
    const fellowshipCounts = filteredParticipants.reduce((acc, p) => {
      acc[p.fellowshipName] = (acc[p.fellowshipName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Department age groups
    const ageGroups = {
      children: children,
      youth: youth,
      adults: adults,
      seniors: seniors,
      volunteers: volunteers,
    };

    return {
      total,
      male,
      female,
      children,
      adults,
      youth,
      seniors,
      volunteers,
      present,
      absent,
      saved,
      sinners,
      unknownSalvation,
      counsellingParticipants: counsellingParticipants.length,
      fellowshipCounts,
      ageGroups,
    };
  }, [participants, fellowshipFilter, departmentFilter, salvationAnalysis]);

  // Get unique fellowships for filter
  const uniqueFellowships = Array.from(
    new Set(participants.map(p => p.fellowshipName).filter(Boolean))
  ).sort();

  // Search functionality
  const performSearch = (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const searchTerms = query.toLowerCase().trim().split(/\s+/);
    const results = participants.filter(participant => {
      const searchableText = [
        participant.name,
        participant.regNo,
        participant.contact,
        participant.fellowshipName,
        participant.department,
        participant.area,
        participant.guardianName,
        participant.guardianContact,
      ].filter(Boolean).join(' ').toLowerCase();

      return searchTerms.every(term => searchableText.includes(term));
    });

    setSearchResults(results);
  };

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const query = event.target.value;
    setSearchQuery(query);
    performSearch(query);
  };

  const getParticipantCounsellingInfo = (participantId: string) => {
    return salvationAnalysis.find(sa => sa.participantId === participantId);
  };

  const handleViewParticipantDetails = (participant: Participant) => {
    setSelectedParticipant(participant);
    setShowSearchDialog(true);
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const exportReport = () => {
    try {
      // Create a comprehensive report data structure
      const reportData = {
        overview: stats,
        salvationAnalysis: salvationAnalysis.filter(sa => {
          if (fellowshipFilter !== "all" && sa.fellowshipName !== fellowshipFilter) return false;
          return true;
        }),
        participants: participants.filter(p => {
          if (fellowshipFilter !== "all" && p.fellowshipName !== fellowshipFilter) return false;
          if (departmentFilter !== "all" && p.department !== departmentFilter) return false;
          return true;
        }),
        filters: {
          fellowship: fellowshipFilter,
          department: departmentFilter,
        },
        generatedAt: new Date().toISOString(),
        generatedBy: "BLWM Retreat Management System",
      };

      // Convert to JSON and download
      const dataStr = JSON.stringify(reportData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

      const exportFileDefaultName = `participant-report-${new Date().toISOString().split('T')[0]}.json`;

      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } catch (error) {
      console.error('Error exporting report:', error);
      alert('Error exporting report. Please try again.');
    }
  };

  return (
    <Box sx={{ padding: { xs: 2, sm: 3 } }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h4" component="h1">
          Participant Reports
        </Typography>
        <Button
          variant="contained"
          startIcon={<FileDownloadIcon />}
          onClick={exportReport}
        >
          Export Report
        </Button>
      </Box>

      {/* Filters */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Filters
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
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
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Department</InputLabel>
              <Select
                value={departmentFilter}
                label="Department"
                onChange={(e) => setDepartmentFilter(e.target.value)}
              >
                <MenuItem value="all">All Departments</MenuItem>
                <MenuItem value="child">Children</MenuItem>
                <MenuItem value="youth">Youth</MenuItem>
                <MenuItem value="adult">Adults</MenuItem>
                <MenuItem value="senior">Seniors</MenuItem>
                <MenuItem value="volunteer">Volunteers</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>

      {/* Search Section */}
      <Accordion
        expanded={expandedSections.search}
        onChange={() => toggleSection("search")}
        sx={{ mb: 2 }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">
            <SearchIcon sx={{ mr: 1, verticalAlign: "middle" }} />
            Search Participants ({searchResults.length} results)
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Box sx={{ mb: 3 }}>
            <TextField
              fullWidth
              placeholder="Search by name, registration number, contact, fellowship, department, area, or guardian details..."
              value={searchQuery}
              onChange={handleSearchChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
          </Box>

          {searchQuery.trim() && (
            <Box>
              {searchResults.length === 0 ? (
                <Alert severity="info">
                  No participants found matching "{searchQuery}". Try different search terms.
                </Alert>
              ) : (
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Name</TableCell>
                        <TableCell>Reg No</TableCell>
                        <TableCell>Fellowship</TableCell>
                        <TableCell>Department</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {searchResults.map((participant) => (
                        <TableRow key={participant._id}>
                          <TableCell>{participant.name}</TableCell>
                          <TableCell>{participant.regNo || "N/A"}</TableCell>
                          <TableCell>{participant.fellowshipName}</TableCell>
                          <TableCell>
                            <Chip
                              label={participant.department}
                              size="small"
                              color={participant.department === "volunteer" ? "primary" : "default"}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              label={participant.present}
                              size="small"
                              color={participant.present === "present" ? "success" : "error"}
                            />
                          </TableCell>
                          <TableCell>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<InfoIcon />}
                              onClick={() => handleViewParticipantDetails(participant)}
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
            </Box>
          )}
        </AccordionDetails>
      </Accordion>

      {/* Overview Statistics */}
      <Accordion
        expanded={expandedSections.overview}
        onChange={() => toggleSection("overview")}
        sx={{ mb: 2 }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">
            <PeopleIcon sx={{ mr: 1, verticalAlign: "middle" }} />
            Overview Statistics
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            {/* Total Participants */}
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: "center" }}>
                  <PeopleIcon sx={{ fontSize: 40, color: "primary.main", mb: 1 }} />
                  <Typography variant="h4" color="primary">
                    {stats.total}
                  </Typography>
                  <Typography variant="subtitle1">Total Participants</Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Gender Distribution */}
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: "center" }}>
                  <MaleIcon sx={{ fontSize: 40, color: "info.main", mb: 1 }} />
                  <Typography variant="h4" color="info.main">
                    {stats.male}
                  </Typography>
                  <Typography variant="subtitle1">Male</Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: "center" }}>
                  <FemaleIcon sx={{ fontSize: 40, color: "secondary.main", mb: 1 }} />
                  <Typography variant="h4" color="secondary.main">
                    {stats.female}
                  </Typography>
                  <Typography variant="subtitle1">Female</Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Attendance */}
            <Grid item xs={12} sm={6} md={3}>
              <Card>
                <CardContent sx={{ textAlign: "center" }}>
                  <Typography variant="h4" color="success.main">
                    {stats.present}
                  </Typography>
                  <Typography variant="subtitle1">Present</Typography>
                  <Typography variant="body2" color="error.main">
                    {stats.absent} Absent
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
            <AdultIcon sx={{ mr: 1, verticalAlign: "middle" }} />
            Demographics Breakdown
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
                      <ChildIcon sx={{ fontSize: 30, color: "warning.main", mb: 1 }} />
                      <Typography variant="h5" color="warning.main">
                        {stats.children}
                      </Typography>
                      <Typography variant="body2">Children</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card>
                    <CardContent sx={{ textAlign: "center" }}>
                      <Typography variant="h5" color="info.main">
                        {stats.youth}
                      </Typography>
                      <Typography variant="body2">Youth</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card>
                    <CardContent sx={{ textAlign: "center" }}>
                      <AdultIcon sx={{ fontSize: 30, color: "primary.main", mb: 1 }} />
                      <Typography variant="h5" color="primary.main">
                        {stats.adults}
                      </Typography>
                      <Typography variant="body2">Adults</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={6}>
                  <Card>
                    <CardContent sx={{ textAlign: "center" }}>
                      <Typography variant="h5" color="secondary.main">
                        {stats.seniors}
                      </Typography>
                      <Typography variant="body2">Seniors</Typography>
                    </CardContent>
                  </Card>
                </Grid>
                <Grid item xs={12}>
                  <Card>
                    <CardContent sx={{ textAlign: "center" }}>
                      <Typography variant="h5" color="success.main">
                        {stats.volunteers}
                      </Typography>
                      <Typography variant="body2">Volunteers</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Grid>

            {/* Fellowship Distribution */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Top Fellowships
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
                      .slice(0, 10)
                      .map(([fellowship, count]) => (
                        <TableRow key={fellowship}>
                          <TableCell>{fellowship}</TableCell>
                          <TableCell align="right">{count}</TableCell>
                          <TableCell align="right">
                            {((count / stats.total) * 100).toFixed(1)}%
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

      {/* Salvation Analysis */}
      <Accordion
        expanded={expandedSections.salvation}
        onChange={() => toggleSection("salvation")}
        sx={{ mb: 2 }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">
            <CounsellingIcon sx={{ mr: 1, verticalAlign: "middle" }} />
            Salvation Analysis ({stats.counsellingParticipants} counselled)
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            {/* Salvation Statistics */}
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent sx={{ textAlign: "center" }}>
                  <SavedIcon sx={{ fontSize: 40, color: "success.main", mb: 1 }} />
                  <Typography variant="h4" color="success.main">
                    {stats.saved}
                  </Typography>
                  <Typography variant="subtitle1">Saved</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stats.counsellingParticipants > 0
                      ? ((stats.saved / stats.counsellingParticipants) * 100).toFixed(1)
                      : 0}% of counselled
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent sx={{ textAlign: "center" }}>
                  <SinnerIcon sx={{ fontSize: 40, color: "error.main", mb: 1 }} />
                  <Typography variant="h4" color="error.main">
                    {stats.sinners}
                  </Typography>
                  <Typography variant="subtitle1">Not Yet Saved</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stats.counsellingParticipants > 0
                      ? ((stats.sinners / stats.counsellingParticipants) * 100).toFixed(1)
                      : 0}% of counselled
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent sx={{ textAlign: "center" }}>
                  <Typography variant="h4" color="warning.main">
                    {stats.unknownSalvation}
                  </Typography>
                  <Typography variant="subtitle1">Status Unknown</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {stats.counsellingParticipants > 0
                      ? ((stats.unknownSalvation / stats.counsellingParticipants) * 100).toFixed(1)
                      : 0}% of counselled
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            {/* Salvation Analysis Alert */}
            <Grid item xs={12}>
              <Alert severity="info" sx={{ mb: 2 }}>
                <Typography variant="body2">
                  <strong>Salvation Detection:</strong> Participants marked as "saved" have comments containing
                  keywords like "love of God", "saved", "salvation", "Jesus", "accepted Christ", etc.
                  Those without such keywords are classified as "not yet saved".
                  Only participants with completed counselling sessions (status: done) and comments are analyzed.
                </Typography>
              </Alert>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Comments and Details */}
      <Accordion
        expanded={expandedSections.comments}
        onChange={() => toggleSection("comments")}
        sx={{ mb: 2 }}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="h6">
            Counselling Comments & Details
          </Typography>
        </AccordionSummary>
        <AccordionDetails>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Participant</TableCell>
                  <TableCell>Fellowship</TableCell>
                  <TableCell>Counsellor</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Salvation Status</TableCell>
                  <TableCell>Comments</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {salvationAnalysis
                  .filter(sa => {
                    if (fellowshipFilter !== "all" && sa.fellowshipName !== fellowshipFilter) return false;
                    return true;
                  })
                  .map((analysis, index) => (
                    <TableRow key={`${analysis.participantId}-${index}`}>
                      <TableCell>{analysis.participantName}</TableCell>
                      <TableCell>{analysis.fellowshipName}</TableCell>
                      <TableCell>{analysis.counsellorName}</TableCell>
                      <TableCell>
                        <Chip
                          label={analysis.status}
                          color={analysis.status === "done" ? "success" : "warning"}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={analysis.salvationStatus}
                          color={
                            analysis.salvationStatus === "saved"
                              ? "success"
                              : analysis.salvationStatus === "sinner"
                              ? "error"
                              : "warning"
                          }
                          size="small"
                        />
                        {analysis.salvationKeywords.length > 0 && (
                          <Typography variant="caption" display="block" sx={{ mt: 0.5 }}>
                            Keywords: {analysis.salvationKeywords.join(", ")}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell sx={{ maxWidth: 300 }}>
                        <Typography variant="body2" sx={{
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: "vertical"
                        }}>
                          {analysis.comments}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>

          {salvationAnalysis.length === 0 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              No completed counselling sessions with comments found.
              Participants need to be assigned to counselling teams and have their status marked as "done" with comments to appear in this analysis.
            </Alert>
          )}
        </AccordionDetails>
      </Accordion>

      {/* Participant Details Dialog */}
      <Dialog
        open={showSearchDialog}
        onClose={() => setShowSearchDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="h6">Participant Details</Typography>
            <IconButton onClick={() => setShowSearchDialog(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedParticipant && (
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
                        {selectedParticipant.name}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Registration Number
                      </Typography>
                      <Typography variant="body1">
                        {selectedParticipant.regNo || "N/A"}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Gender
                      </Typography>
                      <Chip
                        label={selectedParticipant.gender}
                        size="small"
                        color={selectedParticipant.gender === "male" ? "info" : "secondary"}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Age
                      </Typography>
                      <Typography variant="body1">
                        {selectedParticipant.age || "N/A"}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Department
                      </Typography>
                      <Chip
                        label={selectedParticipant.department}
                        size="small"
                        color={selectedParticipant.department === "volunteer" ? "primary" : "default"}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Attendance Status
                      </Typography>
                      <Chip
                        label={selectedParticipant.present}
                        size="small"
                        color={selectedParticipant.present === "present" ? "success" : "error"}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card sx={{ mb: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary">
                    Contact Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Fellowship
                      </Typography>
                      <Typography variant="body1" fontWeight="bold">
                        {selectedParticipant.fellowshipName}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Area
                      </Typography>
                      <Typography variant="body1">
                        {selectedParticipant.area || "N/A"}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Contact
                      </Typography>
                      <Typography variant="body1">
                        {selectedParticipant.contact || "N/A"}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Room Number
                      </Typography>
                      <Typography variant="body1">
                        {selectedParticipant.roomNo
                          ? typeof selectedParticipant.roomNo === "string"
                            ? selectedParticipant.roomNo
                            : selectedParticipant.roomNo.roomNo
                          : "Not assigned"}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>

              {/* Guardian Information */}
              {(selectedParticipant.guardianName || selectedParticipant.guardianContact) && (
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom color="primary">
                      Guardian Information
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          Guardian Name
                        </Typography>
                        <Typography variant="body1">
                          {selectedParticipant.guardianName || "N/A"}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="text.secondary">
                          Guardian Contact
                        </Typography>
                        <Typography variant="body1">
                          {selectedParticipant.guardianContact || "N/A"}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              )}

              {/* Counselling Information */}
              {(() => {
                const counsellingInfo = getParticipantCounsellingInfo(selectedParticipant._id);
                if (counsellingInfo) {
                  return (
                    <Card sx={{ mb: 3 }}>
                      <CardContent>
                        <Typography variant="h6" gutterBottom color="primary">
                          Counselling Information
                        </Typography>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="text.secondary">
                              Counsellor
                            </Typography>
                            <Typography variant="body1" fontWeight="bold">
                              {counsellingInfo.counsellorName}
                            </Typography>
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="text.secondary">
                              Counselling Status
                            </Typography>
                            <Chip
                              label={counsellingInfo.status}
                              size="small"
                              color={counsellingInfo.status === "done" ? "success" : "warning"}
                            />
                          </Grid>
                          <Grid item xs={12} sm={6}>
                            <Typography variant="body2" color="text.secondary">
                              Salvation Status
                            </Typography>
                            <Chip
                              label={counsellingInfo.salvationStatus}
                              size="small"
                              color={
                                counsellingInfo.salvationStatus === "saved"
                                  ? "success"
                                  : counsellingInfo.salvationStatus === "sinner"
                                  ? "error"
                                  : "warning"
                              }
                            />
                          </Grid>
                          {counsellingInfo.salvationKeywords.length > 0 && (
                            <Grid item xs={12} sm={6}>
                              <Typography variant="body2" color="text.secondary">
                                Keywords Found
                              </Typography>
                              <Typography variant="body2" color="success.main">
                                {counsellingInfo.salvationKeywords.join(", ")}
                              </Typography>
                            </Grid>
                          )}
                          <Grid item xs={12}>
                            <Typography variant="body2" color="text.secondary">
                              Counselling Comments
                            </Typography>
                            <Paper sx={{ p: 2, mt: 1, backgroundColor: "grey.50" }}>
                              <Typography variant="body2" style={{ whiteSpace: "pre-wrap" }}>
                                {counsellingInfo.comments || "No comments available"}
                              </Typography>
                            </Paper>
                          </Grid>
                        </Grid>
                      </CardContent>
                    </Card>
                  );
                }
                return (
                  <Alert severity="info" sx={{ mb: 3 }}>
                    This participant has not been assigned to any counselling team or has not completed counselling yet.
                  </Alert>
                );
              })()}

              {/* Spiritual Information */}
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom color="primary">
                    Spiritual Information
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Salvation Status
                      </Typography>
                      <Typography variant="body1">
                        {selectedParticipant.isSaved ? "Saved" : "Unknown"}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="text.secondary">
                        Salvation Date
                      </Typography>
                      <Typography variant="body1">
                        {selectedParticipant.salvationDate || "N/A"}
                      </Typography>
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowSearchDialog(false)} variant="contained">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}