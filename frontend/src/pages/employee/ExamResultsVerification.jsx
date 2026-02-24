// frontend/src/pages/employee/ExamResultsVerification.jsx (updated part)

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  IconButton,
  Tooltip,
  Avatar,
  LinearProgress,
  Snackbar,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Badge,
} from "@mui/material";
import {
  CheckCircle as VerifiedIcon,
  Pending as PendingIcon,
  Visibility as ViewIcon,
  VerifiedUser as VerifyIcon,
  DoneAll as VerifyAllIcon,
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Assessment as StatsIcon,
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CorrectIcon,
  Cancel as WrongIcon,
  RemoveCircle as UnattemptedIcon,
  ExpandMore as ExpandMoreIcon,
  School as SchoolIcon,
  Timer as TimerIcon,
  Grade as GradeIcon,
  EmojiEvents as EmojiEventsIcon,
  RadioButtonUnchecked as RadioButtonUncheckedIcon,
  CheckCircle as CheckCircleIcon, // Added for tick marks
  Cancel as CancelIcon, // Added for cross marks
  Check as CheckIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { format } from "date-fns";
import * as XLSX from "xlsx";

import api from "../../services/api.js";
import { useAuth } from "../../hooks/useAuth";

// Styled Components (keep existing ones)
const StyledCard = styled(Card)(({ theme }) => ({
  background: "linear-gradient(135deg, #0B234A 0%, #1a3a6e 100%)",
  color: "white",
  marginBottom: theme.spacing(3),
}));

const StatusChip = styled(Chip)(({ theme, verified }) => ({
  backgroundColor: verified ? "#4caf50" : "#ff9800",
  color: "white",
  fontWeight: "bold",
  "& .MuiChip-icon": {
    color: "white",
  },
}));

const QuestionStatusChip = styled(Chip)(({ status }) => ({
  backgroundColor:
    status === "correct"
      ? "#4caf20"
      : status === "wrong"
        ? "#f44336"
        : "#9e9e9e",
  color: "white",
  fontSize: "0.75rem",
  height: 24,
}));

const ExamResultsVerification = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [data, setData] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const [verifyDialogOpen, setVerifyDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [attemptDetails, setAttemptDetails] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [statsDialogOpen, setStatsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all"); // all, verified, pending

  useEffect(() => {
    if (!examId) {
      navigate("/employee/exams");
      return;
    }
    fetchResults();
  }, [examId]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      console.log("Fetching results for exam:", examId);
      const response = await api.get(`/employee/exams/${examId}/results`);
      console.log("Results data:", response.data);
      setData(response.data);
    } catch (error) {
      console.error("Fetch error:", error);
      showSnackbar(
        error.response?.data?.message ||
          error.message ||
          "Failed to fetch results",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchAttemptDetails = async (attemptId) => {
    try {
      setDetailsLoading(true);
      console.log("Fetching attempt details:", attemptId);
      const response = await api.get(`/employee/attempt/${attemptId}/details`);
      console.log("Attempt details:", response.data);

      if (response.data.success) {
        setAttemptDetails(response.data.data);
        setDetailsDialogOpen(true);
      } else {
        showSnackbar("Failed to load attempt details", "error");
      }
    } catch (error) {
      console.error("Fetch details error:", error);
      showSnackbar(
        error.response?.data?.message || "Failed to load attempt details",
        "error",
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleVerify = async () => {
    if (!selectedAttempt) return;

    try {
      setVerifying(true);
      const response = await api.post("/employee/results/verify", {
        attemptId: selectedAttempt.attemptId,
        remarks,
      });

      showSnackbar(
        response.data.message || "Result verified successfully",
        "success",
      );
      setVerifyDialogOpen(false);
      setRemarks("");
      fetchResults(); // Refresh data
    } catch (error) {
      console.error("Verify error:", error);
      showSnackbar(
        error.response?.data?.message || "Verification failed",
        "error",
      );
    } finally {
      setVerifying(false);
    }
  };

  const handleViewDetails = async (result) => {
    setSelectedAttempt(result);
    await fetchAttemptDetails(result.attemptId);
  };

  const handleVerifyAll = async () => {
    const pendingCount = data?.statistics?.pendingCount || 0;
    if (pendingCount === 0) {
      showSnackbar("No pending results to verify", "info");
      return;
    }

    if (
      !window.confirm(
        `Are you sure you want to verify all ${pendingCount} pending results?`,
      )
    ) {
      return;
    }

    try {
      setVerifying(true);
      const response = await api.post("/employee/results/verify-all", {
        examId,
      });

      showSnackbar(response.data.message, "success");
      fetchResults();
    } catch (error) {
      console.error("Verify all error:", error);
      showSnackbar(
        error.response?.data?.message || "Failed to verify all",
        "error",
      );
    } finally {
      setVerifying(false);
    }
  };

  const handleExportExcel = () => {
    if (!data?.results || data.results.length === 0) {
      showSnackbar("No data to export", "warning");
      return;
    }

    try {
      const exportData = data.results.map((result) => ({
        "Student Name": result.studentName,
        Email: result.studentEmail || "-",
        Score: `${result.score}/${result.totalMarks}`,
        Percentage: `${result.percentage}%`,
        Status: result.isVerified ? "Verified" : "Pending",
        Result: parseFloat(result.percentage) >= 33 ? "PASS" : "FAIL",
        "Submitted At": format(
          new Date(result.submittedAt),
          "dd/MM/yyyy HH:mm",
        ),
        "Verified At": result.verifiedAt
          ? format(new Date(result.verifiedAt), "dd/MM/yyyy HH:mm")
          : "-",
        Remarks: result.remarks || "-",
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(exportData);
      XLSX.utils.book_append_sheet(wb, ws, "Results");
      XLSX.writeFile(
        wb,
        `${data.exam.title}_results_${format(new Date(), "yyyyMMdd_HHmm")}.xlsx`,
      );

      showSnackbar("Export successful", "success");
    } catch (error) {
      console.error("Export error:", error);
      showSnackbar("Failed to export data", "error");
    }
  };

  // Filter results
  const filteredResults =
    data?.results?.filter((result) => {
      const matchesSearch =
        (result.studentName?.toLowerCase() || "").includes(
          searchTerm.toLowerCase(),
        ) ||
        (result.studentEmail?.toLowerCase() || "").includes(
          searchTerm.toLowerCase(),
        );

      const matchesFilter =
        filter === "all"
          ? true
          : filter === "verified"
            ? result.isVerified
            : !result.isVerified;

      return matchesSearch && matchesFilter;
    }) || [];

  // Pagination
  const paginatedResults = filteredResults.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getScoreColor = (percentage) => {
    const p = parseFloat(percentage);
    if (p >= 75) return "#4caf50";
    if (p >= 33) return "#ff9800";
    return "#f44336";
  };

  const getQuestionStatusIcon = (isAttempted, isCorrect) => {
    if (!isAttempted) return <UnattemptedIcon color="disabled" />;
    return isCorrect ? (
      <CorrectIcon color="success" />
    ) : (
      <WrongIcon color="error" />
    );
  };

  const formatTime = (dateString) => {
    if (!dateString) return "-";
    return format(new Date(dateString), "dd/MM/yyyy hh:mm a");
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!data) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() => navigate("/employee/exams")}
            >
              Go Back
            </Button>
          }
        >
          Failed to load results. Please try again.
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      {/* Header Section - Keep existing */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <IconButton
            onClick={() => navigate("/employee/exams")}
            color="primary"
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4" component="h1">
            Result Verification
          </Typography>
        </Box>
        <Box>
          <Tooltip title="Export to Excel">
            <IconButton
              onClick={handleExportExcel}
              color="primary"
              sx={{ mr: 1 }}
              disabled={!data.results || data.results.length === 0}
            >
              <DownloadIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Refresh">
            <IconButton onClick={fetchResults} color="primary" sx={{ mr: 1 }}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Statistics">
            <IconButton
              onClick={() => setStatsDialogOpen(true)}
              color="primary"
            >
              <StatsIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      {/* Exam Info Card - Keep existing */}
      <StyledCard>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={3}>
              <Typography variant="h6">{data.exam.title}</Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Exam Title
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="h6">{data.exam.subject}</Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Subject
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="h6">Grade {data.exam.grade}</Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Grade
              </Typography>
            </Grid>
            <Grid item xs={12} md={3}>
              <Typography variant="h6">{data.exam.totalMarks} Marks</Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Total Marks
              </Typography>
            </Grid>
          </Grid>
        </CardContent>
      </StyledCard>

      {/* Statistics Cards - Keep existing */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Students
              </Typography>
              <Typography variant="h4">
                {data.statistics.totalStudents}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Average Score
              </Typography>
              <Typography variant="h4" color="primary">
                {data.statistics.averageScore}%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Verified
              </Typography>
              <Typography variant="h4" color="success.main">
                {data.statistics.verifiedCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Pending
              </Typography>
              <Typography variant="h4" color="warning.main">
                {data.statistics.pendingCount}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters and Actions - Keep existing */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              size="small"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <Box sx={{ display: "flex", gap: 1 }}>
              <Chip
                label="All"
                onClick={() => setFilter("all")}
                color={filter === "all" ? "primary" : "default"}
                variant={filter === "all" ? "filled" : "outlined"}
              />
              <Chip
                label="Verified"
                onClick={() => setFilter("verified")}
                color={filter === "verified" ? "success" : "default"}
                variant={filter === "verified" ? "filled" : "outlined"}
              />
              <Chip
                label="Pending"
                onClick={() => setFilter("pending")}
                color={filter === "pending" ? "warning" : "default"}
                variant={filter === "pending" ? "filled" : "outlined"}
              />
            </Box>
          </Grid>
          <Grid item xs={12} md={5} sx={{ textAlign: "right" }}>
            <Button
              variant="contained"
              color="success"
              startIcon={<VerifyAllIcon />}
              onClick={handleVerifyAll}
              disabled={verifying || data.statistics.pendingCount === 0}
              sx={{ mr: 1 }}
            >
              Verify All ({data.statistics.pendingCount})
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Results Table - Updated with View Details functionality */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Student Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell align="center">Score</TableCell>
              <TableCell align="center">Percentage</TableCell>
              <TableCell align="center">Status</TableCell>
              <TableCell>Submitted At</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedResults.map((result) => (
              <TableRow
                key={result.attemptId}
                sx={{
                  "&:hover": { backgroundColor: "#f5f5f5" },
                  backgroundColor: result.isVerified ? "#f1f8e9" : "#fff3e0",
                }}
              >
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Avatar
                      sx={{
                        mr: 2,
                        bgcolor: result.isVerified ? "#4caf50" : "#ff9800",
                      }}
                    >
                      {result.studentName?.charAt(0) || "?"}
                    </Avatar>
                    <Typography variant="body2">
                      {result.studentName}
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>{result.studentEmail || "-"}</TableCell>
                <TableCell align="center">
                  <Typography fontWeight="bold">
                    {result.score}/{result.totalMarks}
                  </Typography>
                </TableCell>
                <TableCell align="center">
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Typography
                      fontWeight="bold"
                      sx={{ mr: 1, color: getScoreColor(result.percentage) }}
                    >
                      {result.percentage}%
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={parseFloat(result.percentage)}
                      sx={{
                        width: 60,
                        height: 8,
                        borderRadius: 5,
                        backgroundColor: "#e0e0e0",
                        "& .MuiLinearProgress-bar": {
                          backgroundColor: getScoreColor(result.percentage),
                        },
                      }}
                    />
                  </Box>
                </TableCell>
                <TableCell align="center">
                  <StatusChip
                    icon={
                      result.isVerified ? <VerifiedIcon /> : <PendingIcon />
                    }
                    label={result.isVerified ? "Verified" : "Pending"}
                    verified={result.isVerified}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {result.submittedAt
                    ? format(new Date(result.submittedAt), "dd/MM/yyyy HH:mm")
                    : "-"}
                </TableCell>
                <TableCell align="center">
                  {!result.isVerified && (
                    <Tooltip title="Verify Result">
                      <IconButton
                        color="success"
                        onClick={() => {
                          setSelectedAttempt(result);
                          setVerifyDialogOpen(true);
                        }}
                        disabled={verifying}
                      >
                        <VerifyIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                  <Tooltip title="View Details">
                    <IconButton
                      color="primary"
                      onClick={() => handleViewDetails(result)}
                    >
                      <ViewIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
            {paginatedResults.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 3 }}>
                  <Typography color="textSecondary">
                    No results found
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredResults.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>

      {/* Verify Dialog - Keep existing */}
      <Dialog
        open={verifyDialogOpen}
        onClose={() => setVerifyDialogOpen(false)}
        maxWidth="sm"
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
            Verify Student Result
            <IconButton onClick={() => setVerifyDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedAttempt && (
            <Box sx={{ mt: 2 }}>
              <Alert severity="info" sx={{ mb: 3 }}>
                Verifying result for{" "}
                <strong>{selectedAttempt.studentName}</strong>
              </Alert>

              <Paper sx={{ p: 2, mb: 3, bgcolor: "#f5f5f5" }}>
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Score
                    </Typography>
                    <Typography variant="h6">
                      {selectedAttempt.score}/{selectedAttempt.totalMarks}
                    </Typography>
                  </Grid>
                  <Grid item xs={6}>
                    <Typography variant="body2" color="textSecondary">
                      Percentage
                    </Typography>
                    <Typography
                      variant="h6"
                      sx={{ color: getScoreColor(selectedAttempt.percentage) }}
                    >
                      {selectedAttempt.percentage}%
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

              <TextField
                fullWidth
                multiline
                rows={4}
                label="Remarks (Optional)"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Add any comments or remarks about this result..."
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVerifyDialogOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            color="success"
            onClick={handleVerify}
            disabled={verifying}
            startIcon={
              verifying ? <CircularProgress size={20} /> : <VerifiedIcon />
            }
          >
            {verifying ? "Verifying..." : "Verify Result"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* NEW: Attempt Details Dialog */}
      <Dialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="lg"
        fullWidth
        scroll="paper"
      >
        <DialogTitle>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <SchoolIcon color="primary" />
              <Typography variant="h6">Attempt Details</Typography>
            </Box>
            <IconButton onClick={() => setDetailsDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent dividers>
          {detailsLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          ) : attemptDetails ? (
            <Box>
              {/* Student Info */}
              <Paper sx={{ p: 2, mb: 3, bgcolor: "#f8f9fa" }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Student Name
                    </Typography>
                    <Typography variant="h6">
                      {attemptDetails.student.name}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Email
                    </Typography>
                    <Typography>
                      {attemptDetails.student.email || "-"}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Roll Number
                    </Typography>
                    <Typography>
                      {attemptDetails.student.rollNumber || "-"}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

              {/* Exam Info */}
              <Paper sx={{ p: 2, mb: 3, bgcolor: "#f8f9fa" }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={3}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Exam Title
                    </Typography>
                    <Typography>{attemptDetails.exam.title}</Typography>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Subject
                    </Typography>
                    <Typography>{attemptDetails.exam.subject}</Typography>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Grade
                    </Typography>
                    <Typography>Grade {attemptDetails.exam.grade}</Typography>
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <Typography variant="subtitle2" color="textSecondary">
                      Total Marks
                    </Typography>
                    <Typography>{attemptDetails.exam.totalMarks}</Typography>
                  </Grid>
                </Grid>
              </Paper>

              {/* Attempt Stats */}
              <Paper sx={{ p: 2, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Performance Summary
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={6} md={3}>
                    <Card sx={{ bgcolor: "#e8f5e8", p: 2 }}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Total Questions
                      </Typography>
                      <Typography variant="h4">
                        {attemptDetails.statistics.totalQuestions}
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Card sx={{ bgcolor: "#fff3e0", p: 2 }}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Attempted
                      </Typography>
                      <Typography variant="h4">
                        {attemptDetails.statistics.attempted}
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Card sx={{ bgcolor: "#e8f5e9", p: 2 }}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Correct
                      </Typography>
                      <Typography variant="h4" color="success.main">
                        {attemptDetails.statistics.correct}
                      </Typography>
                    </Card>
                  </Grid>
                  <Grid item xs={6} md={3}>
                    <Card sx={{ bgcolor: "#ffebee", p: 2 }}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Incorrect
                      </Typography>
                      <Typography variant="h4" color="error.main">
                        {attemptDetails.statistics.incorrect}
                      </Typography>
                    </Card>
                  </Grid>
                </Grid>

                <Box
                  sx={{
                    mt: 2,
                    display: "flex",
                    gap: 2,
                    justifyContent: "space-around",
                  }}
                >
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">
                      Score Obtained
                    </Typography>
                    <Typography variant="h5" color="primary">
                      {attemptDetails.attempt.score}/
                      {attemptDetails.statistics.totalPossibleMarks}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">
                      Percentage
                    </Typography>
                    <Typography
                      variant="h5"
                      sx={{
                        color: getScoreColor(
                          (
                            (attemptDetails.attempt.score /
                              attemptDetails.statistics.totalPossibleMarks) *
                            100
                          ).toFixed(2),
                        ),
                      }}
                    >
                      {(
                        (attemptDetails.attempt.score /
                          attemptDetails.statistics.totalPossibleMarks) *
                        100
                      ).toFixed(2)}
                      %
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" color="textSecondary">
                      Submitted
                    </Typography>
                    <Typography>
                      {formatTime(attemptDetails.attempt.submittedAt)}
                    </Typography>
                  </Box>
                </Box>
              </Paper>

              {/* Questions Details */}
              <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
                Question-wise Analysis
              </Typography>

              {attemptDetails.detailedAnswers.map((question, index) => (
                <Accordion key={question.questionId || index} sx={{ mb: 1 }}>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        width: "100%",
                        gap: 2,
                      }}
                    >
                      <Badge
                        badgeContent={index + 1}
                        color="primary"
                        sx={{ mr: 2 }}
                      />
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="subtitle2"
                          noWrap
                          sx={{ maxWidth: 500 }}
                        >
                          {question.questionText}
                        </Typography>
                      </Box>
                      <Box
                        sx={{ display: "flex", gap: 1, alignItems: "center" }}
                      >
                        {getQuestionStatusIcon(
                          question.isAttempted,
                          question.isCorrect,
                        )}
                        <QuestionStatusChip
                          label={
                            !question.isAttempted
                              ? "Not Attempted"
                              : question.isCorrect
                                ? "Correct"
                                : "Wrong"
                          }
                          status={
                            !question.isAttempted
                              ? "unattempted"
                              : question.isCorrect
                                ? "correct"
                                : "wrong"
                          }
                          size="small"
                        />
                        <Chip
                          label={`${question.marksObtained > 0 ? "+" : ""}${question.marksObtained}`}
                          color={
                            question.marksObtained > 0
                              ? "success"
                              : question.marksObtained < 0
                                ? "error"
                                : "default"
                          }
                          size="small"
                        />
                      </Box>
                    </Box>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={2}>
                      <Grid item xs={12}>
                        <Typography
                          variant="subtitle2"
                          color="textSecondary"
                          gutterBottom
                        >
                          Options:
                        </Typography>
                        <List dense>
                          {question.options &&
                            question.options.map((option, optIndex) => {
                              // Compare using indices since selectedOption and correctAnswer are indices
                              const isCorrectAnswer =
                                optIndex === question.correctAnswer;
                              const isStudentAnswer =
                                question.isAttempted &&
                                optIndex === question.selectedOption;
                              const isCorrectSelection =
                                isStudentAnswer && isCorrectAnswer;
                              const isWrongSelection =
                                isStudentAnswer && !isCorrectAnswer;

                              return (
                                <ListItem
                                  key={optIndex}
                                  sx={{
                                    bgcolor: isCorrectAnswer
                                      ? "#e8f5e9" // Light green for correct answer
                                      : isWrongSelection
                                        ? "#ffebee" // Light red for wrong selection
                                        : "transparent",
                                    borderRadius: 1,
                                    mb: 0.5,
                                    border: isStudentAnswer
                                      ? "2px solid"
                                      : "none",
                                    borderColor: isCorrectSelection
                                      ? "#4caf50"
                                      : isWrongSelection
                                        ? "#f44336"
                                        : "transparent",
                                  }}
                                >
                                  <ListItemIcon>
                                    {isCorrectAnswer && isStudentAnswer ? (
                                      // Student selected the correct answer
                                      <CheckCircleIcon
                                        sx={{ color: "#4caf50" }}
                                      />
                                    ) : isCorrectAnswer && !isStudentAnswer ? (
                                      // Correct answer but student didn't select it
                                      <Box
                                        sx={{
                                          position: "relative",
                                          display: "inline-flex",
                                        }}
                                      >
                                        <RadioButtonUncheckedIcon
                                          sx={{ color: "#4caf50" }}
                                        />
                                        <CheckIcon
                                          sx={{
                                            position: "absolute",
                                            left: "50%",
                                            top: "50%",
                                            transform: "translate(-50%, -50%)",
                                            fontSize: "14px",
                                            color: "#4caf50",
                                            fontWeight: "bold",
                                          }}
                                        />
                                      </Box>
                                    ) : isWrongSelection ? (
                                      // Student selected wrong answer
                                      <CancelIcon sx={{ color: "#f44336" }} />
                                    ) : (
                                      // Unselected option
                                      <RadioButtonUncheckedIcon
                                        sx={{ color: "#9e9e9e" }}
                                      />
                                    )}
                                  </ListItemIcon>
                                  <ListItemText
                                    primary={
                                      <Box
                                        sx={{
                                          display: "flex",
                                          alignItems: "center",
                                          gap: 1,
                                          flexWrap: "wrap",
                                        }}
                                      >
                                        <Typography
                                          variant="body2"
                                          sx={{
                                            fontWeight: isStudentAnswer
                                              ? 600
                                              : 400,
                                            color: isCorrectAnswer
                                              ? "success.main"
                                              : isWrongSelection
                                                ? "error.main"
                                                : "text.primary",
                                          }}
                                        >
                                          {option}
                                        </Typography>

                                        {/* Status Tags */}
                                        {isCorrectAnswer && isStudentAnswer && (
                                          <Chip
                                            label="Correct Answer ✓"
                                            size="small"
                                            sx={{
                                              height: 20,
                                              fontSize: "0.7rem",
                                              bgcolor: "#4caf50",
                                              color: "white",
                                            }}
                                          />
                                        )}
                                        {isCorrectAnswer &&
                                          !isStudentAnswer && (
                                            <Chip
                                              label="Correct Answer"
                                              size="small"
                                              variant="outlined"
                                              sx={{
                                                height: 20,
                                                fontSize: "0.7rem",
                                                color: "#4caf50",
                                                borderColor: "#4caf50",
                                              }}
                                            />
                                          )}
                                        {isWrongSelection && (
                                          <Chip
                                            label="Your Answer ✗"
                                            size="small"
                                            sx={{
                                              height: 20,
                                              fontSize: "0.7rem",
                                              bgcolor: "#f44336",
                                              color: "white",
                                            }}
                                          />
                                        )}
                                        {!isStudentAnswer &&
                                          !isCorrectAnswer &&
                                          question.isAttempted && (
                                            <Chip
                                              label="Available"
                                              size="small"
                                              variant="outlined"
                                              sx={{
                                                height: 20,
                                                fontSize: "0.7rem",
                                                color: "#757575",
                                                borderColor: "#757575",
                                              }}
                                            />
                                          )}
                                      </Box>
                                    }
                                  />
                                </ListItem>
                              );
                            })}
                        </List>

                        {/* Summary for this question */}
                        <Box sx={{ mt: 1, display: "flex", gap: 2 }}>
                          <Typography variant="caption" color="textSecondary">
                            Student selected: Option{" "}
                            {question.selectedOption !== undefined
                              ? question.selectedOption + 1
                              : "None"}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            Correct answer: Option{" "}
                            {question.correctAnswer !== undefined
                              ? question.correctAnswer + 1
                              : "N/A"}
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="textSecondary">
                          Marks: {question.marks} | Negative:{" "}
                          {question.negativeMarks}
                        </Typography>
                      </Grid>
                      <Grid item xs={6}>
                        <Typography variant="caption" color="textSecondary">
                          Difficulty: {question.difficultyLevel || "N/A"} |
                          Topic: {question.topic || "General"}
                        </Typography>
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              ))}
            </Box>
          ) : (
            <Alert severity="error">Failed to load attempt details</Alert>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
          {!attemptDetails?.attempt?.isVerified && (
            <Button
              variant="contained"
              color="success"
              startIcon={<VerifiedIcon />}
              onClick={() => {
                setDetailsDialogOpen(false);
                setVerifyDialogOpen(true);
              }}
            >
              Verify This Result
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Statistics Dialog - Keep existing */}
      <Dialog
        open={statsDialogOpen}
        onClose={() => setStatsDialogOpen(false)}
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
            Detailed Statistics
            <IconButton onClick={() => setStatsDialogOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {/* Score Distribution */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3, bgcolor: "#f5f5f5" }}>
                <Typography variant="h6" gutterBottom>
                  Score Distribution
                </Typography>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-around",
                    mt: 2,
                    flexWrap: "wrap",
                  }}
                >
                  {[
                    { range: "0-20%", color: "#f44336" },
                    { range: "21-40%", color: "#ff9800" },
                    { range: "41-60%", color: "#2196f3" },
                    { range: "61-80%", color: "#4caf50" },
                    { range: "81-100%", color: "#2e7d32" },
                  ].map((item) => {
                    const count = data.results.filter((r) => {
                      const p = parseFloat(r.percentage);
                      const [min, max] = item.range
                        .replace("%", "")
                        .split("-")
                        .map(Number);
                      return p >= min && p <= max;
                    }).length;

                    return (
                      <Box key={item.range} sx={{ textAlign: "center", m: 1 }}>
                        <Typography variant="h4" sx={{ color: item.color }}>
                          {count}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {item.range}
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              </Paper>
            </Grid>

            {/* Pass/Fail Stats */}
            <Grid item xs={12} sm={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="textSecondary">
                  Pass Rate
                </Typography>
                <Typography variant="h4" color="success.main">
                  {(
                    ((data.statistics.passedCount || 0) /
                      data.statistics.totalStudents) *
                    100
                  ).toFixed(1)}
                  %
                </Typography>
                <Typography variant="body2">
                  {data.statistics.passedCount || 0} students passed
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="textSecondary">
                  Fail Rate
                </Typography>
                <Typography variant="h4" color="error.main">
                  {(
                    ((data.statistics.failedCount || 0) /
                      data.statistics.totalStudents) *
                    100
                  ).toFixed(1)}
                  %
                </Typography>
                <Typography variant="body2">
                  {data.statistics.failedCount || 0} students failed
                </Typography>
              </Paper>
            </Grid>

            {/* Highest/Lowest Scores */}
            <Grid item xs={12} sm={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="textSecondary">
                  Highest Score
                </Typography>
                <Typography variant="h4" color="success.main">
                  {data.statistics.highestScore}%
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="textSecondary">
                  Lowest Score
                </Typography>
                <Typography variant="h4" color="error.main">
                  {data.statistics.lowestScore}%
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>

      {/* Snackbar - Keep existing */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ExamResultsVerification;
