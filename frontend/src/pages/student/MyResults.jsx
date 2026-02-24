// frontend/src/pages/student/MyResults.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  LinearProgress,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tooltip,
  Container,
  Fade,
  Grow,
  Zoom,
  Badge,
  alpha,
  useTheme,
} from "@mui/material";
import {
  School as SchoolIcon,
  CheckCircle as PassIcon,
  Cancel as FailIcon,
  Visibility as ViewIcon,
  Assessment as ResultIcon,
  EmojiEvents as TrophyIcon,
  Timeline as TimelineIcon,
  Close as CloseIcon,
  Download as DownloadIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Star as StarIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  MenuBook as BookIcon,
  Psychology as PsychologyIcon,
  CheckCircleOutline as CorrectIcon,
  HighlightOff as IncorrectIcon,
  RemoveCircleOutline as UnattemptedIcon,
  Share as ShareIcon,
  Print as PrintIcon,
  BarChart as ChartIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
} from "@mui/icons-material";
import { styled } from "@mui/material/styles";
import { format } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as ChartTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import api from "../../services/api.js";
import { useAuth } from "../../hooks/useAuth";

// Enhanced Styled Components
const StyledContainer = styled(Box)(({ theme }) => ({
  background: "linear-gradient(135deg, #f5f7fa 0%, #e9ecef 100%)",
  minHeight: "100vh",
  padding: theme.spacing(3),
}));

const HeaderPaper = styled(Paper)(({ theme }) => ({
  background: "linear-gradient(135deg, #0B234A 0%, #1a3a6e 100%)",
  color: "white",
  padding: theme.spacing(3),
  borderRadius: 16,
  marginBottom: theme.spacing(4),
  boxShadow: "0 10px 30px rgba(11, 35, 74, 0.3)",
}));

const ResultCard = styled(Card)(({ theme, passed }) => ({
  position: "relative",
  overflow: "hidden",
  transition: "all 0.3s ease-in-out",
  borderRadius: 16,
  height: "100%",
  display: "flex",
  flexDirection: "column",
  "&:hover": {
    transform: "translateY(-8px)",
    boxShadow: theme.shadows[12],
  },
  "&::before": {
    content: '""',
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 6,
    background: passed
      ? "linear-gradient(90deg, #4caf50, #81c784, #4caf50)"
      : "linear-gradient(90deg, #f44336, #e57373, #f44336)",
    backgroundSize: "200% 100%",
    animation: "gradient 3s ease infinite",
  },
  "@keyframes gradient": {
    "0%": { backgroundPosition: "0% 50%" },
    "50%": { backgroundPosition: "100% 50%" },
    "100%": { backgroundPosition: "0% 50%" },
  },
}));

const ScoreCircle = styled(Box)(({ theme, percentage }) => {
  const score = parseFloat(percentage);
  const color = score >= 75 ? "#4caf50" : score >= 33 ? "#ff9800" : "#f44336";

  return {
    width: 100,
    height: 100,
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: `conic-gradient(${color} ${score * 3.6}deg, #f0f0f0 0deg)`,
    position: "relative",
    transition: "transform 0.3s ease",
    "&:hover": {
      transform: "scale(1.05)",
    },
    "&::before": {
      content: '""',
      position: "absolute",
      width: 80,
      height: 80,
      borderRadius: "50%",
      backgroundColor: "white",
    },
  };
});

const ScoreText = styled(Typography)(({ theme, percentage }) => {
  const score = parseFloat(percentage);
  const color = score >= 75 ? "#4caf50" : score >= 33 ? "#ff9800" : "#f44336";

  return {
    position: "relative",
    zIndex: 1,
    fontWeight: "bold",
    fontSize: "1.3rem",
    color: color,
  };
});

const StatCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: "center",
  background: "white",
  borderRadius: 12,
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-4px)",
    boxShadow: theme.shadows[6],
  },
}));

const COLORS = ["#4caf50", "#f44336", "#ff9800", "#2196f3"];

const MyResults = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [selectedResult, setSelectedResult] = useState(null);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [analyticsDialog, setAnalyticsDialog] = useState(false);
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const response = await api.get("/student/results");
      setData(response.data);
      console.log("fetchResults", response.data);
    } catch (error) {
      console.error("Failed to fetch results:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDetailedResult = async (examId) => {
    try {
      const response = await api.get(`/student/results/${examId}`);
      setSelectedResult(response.data);
      console.log("fetchDetailedResult", response.data);
      setDetailsDialog(true);
    } catch (error) {
      console.error("Failed to fetch detailed result:", error);
    }
  };

  const prepareChartData = () => {
    if (!data?.results) return [];

    return data.results.map((result) => ({
      name:
        result.examTitle.length > 15
          ? result.examTitle.substring(0, 12) + "..."
          : result.examTitle,
      percentage: parseFloat(result.percentage),
      date: format(new Date(result.submittedAt), "dd MMM"),
      fullTitle: result.examTitle,
      score: result.score,
      totalMarks: result.totalMarks,
    }));
  };

  const getPerformanceMessage = (average) => {
    if (average >= 75) return "Excellent Performance! Keep it up! 🌟";
    if (average >= 60) return "Good Performance! Room for improvement! 📈";
    if (average >= 33) return "Satisfactory! Work harder! 💪";
    return "Need Improvement! Don't give up! 🎯";
  };

  const getScoreColor = (percentage) => {
    const p = parseFloat(percentage);
    if (p >= 75) return "#4caf50";
    if (p >= 33) return "#ff9800";
    return "#f44336";
  };

  const downloadResultAsPDF = (result) => {
    console.log("PDF DATA:", result);
    if (!result) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Header
    doc.setFillColor(11, 35, 74);
    doc.rect(0, 0, pageWidth, 40, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("EXAM RESULT CARD", pageWidth / 2, 25, { align: "center" });

    doc.setTextColor(0, 0, 0);

    // ---------------- Exam Details ----------------
    let yPos = 60;
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Exam Details", 14, yPos); 

    yPos += 10;

    const examDetails = [
      ["Exam Title:", result?.exam?.title ?? "-"],
      ["Subject:", result?.exam?.subject ?? "-"],
      ["Grade:", result?.exam?.grade ?? "-"],
      [
        "Date:",
        format(
          new Date(result?.exam?.date || result?.result?.submittedAt),
          "dd MMMM yyyy",
        ),
      ],
      ["Duration:", `${result?.exam?.duration ?? 60} minutes`],
    ];

    examDetails.forEach((detail, index) => {
      doc.setTextColor(80, 80, 80);
      doc.setFont("helvetica", "normal");
      doc.text(detail[0], 20, yPos + index * 7);

      doc.setTextColor(0, 0, 0);
      doc.setFont("helvetica", "bold");
      doc.text(detail[1].toString(), 60, yPos + index * 7);
    });

    // ---------------- Result Summary ----------------
    yPos += 50;

    doc.setFillColor(240, 247, 255);
    doc.roundedRect(14, yPos, pageWidth - 28, 40, 3, 3, "F");

    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(11, 35, 74);
    doc.text("Result Summary", pageWidth / 2, yPos + 10, { align: "center" });

    doc.setFontSize(20);
    const statusColor =
      result?.result?.status === "PASS" ? [76, 175, 80] : [244, 67, 54];

    doc.setTextColor(...statusColor);
    doc.text(result?.result?.status ?? "-", pageWidth / 2, yPos + 25, {
      align: "center",
    });

    // ---------------- Score Cards ----------------
    yPos += 50;

    const boxWidth = (pageWidth - 40) / 3;

    doc.setDrawColor(200, 200, 200);
    doc.setFillColor(255, 255, 255);

    for (let i = 0; i < 3; i++) {
      doc.roundedRect(14 + i * (boxWidth + 6), yPos, boxWidth, 35, 3, 3, "FD");
    }

    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);

    doc.text("Score Obtained", 14 + boxWidth / 2, yPos + 10, {
      align: "center",
    });
    doc.text("Total Marks", 14 + boxWidth / 2 + boxWidth + 6, yPos + 10, {
      align: "center",
    });
    doc.text("Percentage", 14 + boxWidth / 2 + 2 * (boxWidth + 6), yPos + 10, {
      align: "center",
    });

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);

    doc.text(
      (result?.result?.score ?? 0).toString(),
      14 + boxWidth / 2,
      yPos + 25,
      { align: "center" },
    );

    doc.text(
      (result?.result?.totalMarks ?? 0).toString(),
      14 + boxWidth / 2 + boxWidth + 6,
      yPos + 25,
      { align: "center" },
    );

    doc.text(
      `${result?.result?.percentage ?? 0}%`,
      14 + boxWidth / 2 + 2 * (boxWidth + 6),
      yPos + 25,
      { align: "center" },
    );

    // ---------------- Footer ----------------
    const pageCount = doc.internal.getNumberOfPages();

    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);

      doc.setDrawColor(200, 200, 200);
      doc.line(14, 280, pageWidth - 14, 280);

      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);

      doc.text(
        `Generated on: ${format(new Date(), "dd MMM yyyy, hh:mm a")}`,
        14,
        290,
      );

      doc.text("(Authorized Signature)", pageWidth / 2, 290, {
        align: "center",
      });
    }

    doc.save(
      `${result?.exam?.title ?? "Exam"}_Result_${format(
        new Date(),
        "yyyyMMdd_HHmm",
      )}.pdf`,
    );
  };

  if (loading) {
    return (
      <StyledContainer>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            height: "80vh",
          }}
        >
          <CircularProgress
            size={60}
            thickness={4}
            sx={{ color: "#0B234A", mb: 3 }}
          />
          <Typography variant="h6" color="textSecondary" gutterBottom>
            Loading your results...
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Please wait while we fetch your performance data
          </Typography>
        </Box>
      </StyledContainer>
    );
  }

  if (!data || data.results.length === 0) {
    return (
      <StyledContainer>
        <Fade in={true}>
          <Container maxWidth="md" sx={{ mt: 8, textAlign: "center" }}>
            <Zoom in={true}>
              <Paper
                elevation={3}
                sx={{
                  p: 6,
                  borderRadius: 4,
                  background:
                    "linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%)",
                }}
              >
                <ResultIcon sx={{ fontSize: 100, color: "#ccc", mb: 3 }} />
                <Typography
                  variant="h4"
                  gutterBottom
                  color="textSecondary"
                  sx={{ fontWeight: 600 }}
                >
                  No Results Found
                </Typography>
                <Typography
                  variant="body1"
                  color="textSecondary"
                  paragraph
                  sx={{ mb: 4, fontSize: "1.1rem" }}
                >
                  You haven't taken any exams yet or your results are still
                  being verified.
                </Typography>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => navigate("/student/dashboard")}
                  sx={{
                    bgcolor: "#0B234A",
                    "&:hover": { bgcolor: "#1a3a6e" },
                    px: 4,
                    py: 1.5,
                    borderRadius: 2,
                  }}
                >
                  Go to Dashboard
                </Button>
              </Paper>
            </Zoom>
          </Container>
        </Fade>
      </StyledContainer>
    );
  }

  const chartData = prepareChartData();
  const pieData = [
    { name: "Passed", value: data.statistics.passedExams },
    { name: "Failed", value: data.statistics.failedExams },
  ];

  return (
    <StyledContainer>
      {/* Header Section */}
      <HeaderPaper elevation={3}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={8}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
              <Avatar
                sx={{
                  width: 60,
                  height: 60,
                  bgcolor: "#EA8E0A",
                  boxShadow: "0 4px 10px rgba(234, 142, 10, 0.3)",
                }}
              >
                <SchoolIcon sx={{ fontSize: 30 }} />
              </Avatar>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
                  My Exam Results
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Track your academic progress and performance analytics
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={4} sx={{ textAlign: "right" }}>
            <Tooltip title="View Detailed Analytics">
              <IconButton
                onClick={() => setAnalyticsDialog(true)}
                sx={{
                  bgcolor: "rgba(255,255,255,0.2)",
                  color: "white",
                  "&:hover": { bgcolor: "rgba(255,255,255,0.3)" },
                  width: 48,
                  height: 48,
                }}
              >
                <ChartIcon />
              </IconButton>
            </Tooltip>
          </Grid>
        </Grid>
      </HeaderPaper>
      {/* Welcome Message */}
      <Paper sx={{ p: 3, mb: 4, borderRadius: 2, bgcolor: "#f8f9fa" }}>
        <Typography
          variant="h6"
          gutterBottom
          sx={{ color: "#0B234A", fontWeight: 600 }}
        >
          Welcome back, {user?.name}! 👋
        </Typography>
        <Typography variant="body1" color="textSecondary">
          {getPerformanceMessage(data.statistics.averagePercentage)}
        </Typography>
      </Paper>
      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Grow in={true} timeout={300}>
            <StatCard>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 1,
                }}
              >
                <Badge
                  overlap="circular"
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  badgeContent={
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        bgcolor: "#4caf50",
                        borderRadius: "50%",
                        border: "2px solid white",
                      }}
                    />
                  }
                >
                  <Avatar sx={{ bgcolor: "#0B234A", width: 50, height: 50 }}>
                    <SchoolIcon />
                  </Avatar>
                </Badge>
              </Box>
              <Typography
                variant="h4"
                sx={{ color: "#0B234A", fontWeight: 700 }}
              >
                {data.statistics.totalExams}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Total Exams Taken
              </Typography>
            </StatCard>
          </Grow>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Grow in={true} timeout={450}>
            <StatCard>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 1,
                }}
              >
                <Avatar sx={{ bgcolor: "#4caf50", width: 50, height: 50 }}>
                  <PassIcon />
                </Avatar>
              </Box>
              <Typography
                variant="h4"
                sx={{ color: "#4caf50", fontWeight: 700 }}
              >
                {data.statistics.passedExams}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Exams Passed
              </Typography>
              <Typography variant="caption" color="success.main">
                {(
                  (data.statistics.passedExams / data.statistics.totalExams) *
                  100
                ).toFixed(1)}
                % Success Rate
              </Typography>
            </StatCard>
          </Grow>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Grow in={true} timeout={600}>
            <StatCard>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 1,
                }}
              >
                <Avatar sx={{ bgcolor: "#f44336", width: 50, height: 50 }}>
                  <FailIcon />
                </Avatar>
              </Box>
              <Typography
                variant="h4"
                sx={{ color: "#f44336", fontWeight: 700 }}
              >
                {data.statistics.failedExams}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Exams Failed
              </Typography>
            </StatCard>
          </Grow>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Grow in={true} timeout={750}>
            <StatCard>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mb: 1,
                }}
              >
                <Avatar sx={{ bgcolor: "#ff9800", width: 50, height: 50 }}>
                  <TrendingUpIcon />
                </Avatar>
              </Box>
              <Typography
                variant="h4"
                sx={{ color: "#ff9800", fontWeight: 700 }}
              >
                {data.statistics.averagePercentage}%
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Average Score
              </Typography>
            </StatCard>
          </Grow>
        </Grid>
      </Grid>
      {/* Performance Summary Card */}
      <Paper
        sx={{
          p: 3,
          mb: 4,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          borderRadius: 3,
        }}
      >
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} md={4}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <TrophyIcon sx={{ fontSize: 48, mr: 2 }} />
              <Box>
                <Typography variant="h3" sx={{ fontWeight: 700 }}>
                  {data.statistics.averagePercentage}%
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Average Score
                </Typography>
              </Box>
            </Box>
          </Grid>
          <Grid item xs={12} md={8}>
            <Typography
              variant="body2"
              sx={{
                opacity: 0.9,
                mb: 1,
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <PsychologyIcon fontSize="small" />
              Overall Performance
            </Typography>
            <LinearProgress
              variant="determinate"
              value={parseFloat(data.statistics.averagePercentage)}
              sx={{
                height: 12,
                borderRadius: 6,
                backgroundColor: "rgba(255,255,255,0.2)",
                "& .MuiLinearProgress-bar": {
                  backgroundColor: "#fff",
                  borderRadius: 6,
                },
              }}
            />
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}
            >
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                0%
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                33% (Pass)
              </Typography>
              <Typography variant="caption" sx={{ opacity: 0.8 }}>
                100%
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Paper>
      {/* Results List Header */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 600, color: "#0B234A" }}>
          Exam History
        </Typography>
        <Chip
          icon={<BookIcon />}
          label={`${data.results.length} Exams`}
          sx={{ bgcolor: "#e9ecef", fontWeight: 500 }}
        />
      </Box>
      {/* Results Grid */}
      <Grid container spacing={3}>
        {data.results.map((result, index) => {
          const percentage = parseFloat(result.percentage);
          const scoreColor = getScoreColor(percentage);

          return (
            <Grid item xs={12} md={6} lg={4} key={result.attemptId}>
              <Zoom in={true} style={{ transitionDelay: `${index * 100}ms` }}>
                <ResultCard
                  passed={result.status === "PASS"}
                  onMouseEnter={() => setHoveredCard(result.attemptId)}
                  onMouseLeave={() => setHoveredCard(null)}
                >
                  <CardContent sx={{ flex: 1 }}>
                    {/* Header */}
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        mb: 2,
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Avatar
                          sx={{
                            bgcolor:
                              result.status === "PASS" ? "#4caf50" : "#f44336",
                            width: 45,
                            height: 45,
                          }}
                        >
                          {result.status === "PASS" ? (
                            <PassIcon />
                          ) : (
                            <FailIcon />
                          )}
                        </Avatar>
                        <Box>
                          <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: 600 }}
                          >
                            {result.examTitle}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {result.subject} • Grade {result.grade}
                          </Typography>
                        </Box>
                      </Box>
                      <Chip
                        label={result.status}
                        color={result.status === "PASS" ? "success" : "error"}
                        size="small"
                        sx={{ fontWeight: 600 }}
                      />
                    </Box>

                    <Divider sx={{ my: 2 }} />

                    {/* Score Section */}
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={5}>
                        <Box sx={{ display: "flex", justifyContent: "center" }}>
                          <ScoreCircle percentage={percentage}>
                            <ScoreText percentage={percentage}>
                              {result.percentage}%
                            </ScoreText>
                          </ScoreCircle>
                        </Box>
                      </Grid>
                      <Grid item xs={7}>
                        <Box sx={{ mb: 1.5 }}>
                          <Typography variant="caption" color="textSecondary">
                            Score
                          </Typography>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>
                            {result.score}/{result.totalMarks}
                          </Typography>
                        </Box>
                        <Box>
                          <Typography variant="caption" color="textSecondary">
                            Submitted
                          </Typography>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 0.5,
                            }}
                          >
                            <CalendarIcon
                              sx={{ fontSize: 14, color: "text.secondary" }}
                            />
                            <Typography variant="body2">
                              {format(
                                new Date(result.submittedAt),
                                "dd MMM yyyy",
                              )}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    </Grid>

                    {/* Progress Bar */}
                    <Box sx={{ mt: 2 }}>
                      <LinearProgress
                        variant="determinate"
                        value={percentage}
                        sx={{
                          height: 6,
                          borderRadius: 3,
                          backgroundColor: "#e0e0e0",
                          "& .MuiLinearProgress-bar": {
                            backgroundColor: scoreColor,
                            borderRadius: 3,
                          },
                        }}
                      />
                    </Box>
                  </CardContent>

                  <CardActions sx={{ justifyContent: "flex-end", p: 2, pt: 0 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<ViewIcon />}
                      onClick={() => fetchDetailedResult(result.examId)}
                      sx={{
                        borderColor: "#0B234A",
                        color: "#0B234A",
                        "&:hover": {
                          borderColor: "#EA8E0A",
                          bgcolor: alpha("#EA8E0A", 0.04),
                        },
                      }}
                    >
                      View Details
                    </Button>
                  </CardActions>

                  {/* Hover Effect Badge */}
                  {hoveredCard === result.attemptId && (
                    <Fade in={true}>
                      <Box
                        sx={{
                          position: "absolute",
                          top: 8,
                          right: 8,
                          bgcolor: alpha("#fff", 0.9),
                          borderRadius: 4,
                          px: 1,
                          py: 0.5,
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                        }}
                      >
                        <StarIcon sx={{ fontSize: 14, color: "#ff9800" }} />
                        <Typography variant="caption" sx={{ fontWeight: 600 }}>
                          {result.status === "PASS"
                            ? "Achievement Unlocked"
                            : "Try Again"}
                        </Typography>
                      </Box>
                    </Fade>
                  )}
                </ResultCard>
              </Zoom>
            </Grid>
          );
        })}
      </Grid>
      {/* Detailed Result Dialog */}
      <Dialog
        open={detailsDialog}
        onClose={() => setDetailsDialog(false)}
        maxWidth="md"
        fullWidth
        scroll="paper"
        TransitionComponent={Zoom}
      >
        {selectedResult && (
          <>
            <DialogTitle
              sx={{
                background: "linear-gradient(135deg, #0B234A 0%, #1a3a6e 100%)",
                color: "white",
                py: 3,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box>
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    {selectedResult.exam.title}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
                    <Chip
                      label={selectedResult.exam.subject}
                      size="small"
                      sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white" }}
                    />
                    <Chip
                      label={`Grade ${selectedResult.exam.grade}`}
                      size="small"
                      sx={{ bgcolor: "rgba(255,255,255,0.2)", color: "white" }}
                    />
                  </Box>
                </Box>
                <IconButton
                  onClick={() => setDetailsDialog(false)}
                  sx={{ color: "white" }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>
            </DialogTitle>

            <DialogContent dividers sx={{ bgcolor: "#f8f9fa" }}>
              {/* Result Summary */}
              <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={4} sx={{ textAlign: "center" }}>
                    <ScoreCircle percentage={selectedResult.result.percentage}>
                      <ScoreText percentage={selectedResult.result.percentage}>
                        {selectedResult.result.percentage}%
                      </ScoreText>
                    </ScoreCircle>
                    <Typography
                      variant="body2"
                      color="textSecondary"
                      sx={{ mt: 1 }}
                    >
                      Percentage
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4} sx={{ textAlign: "center" }}>
                    <Box sx={{ py: 2 }}>
                      <Typography
                        variant="h3"
                        sx={{ color: "#0B234A", fontWeight: 700 }}
                      >
                        {selectedResult.result.score}
                      </Typography>
                      <Typography variant="body1" color="textSecondary">
                        out of {selectedResult.result.totalMarks}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} md={4} sx={{ textAlign: "center" }}>
                    <Chip
                      label={selectedResult.result.status}
                      color={
                        selectedResult.result.status === "PASS"
                          ? "success"
                          : "error"
                      }
                      sx={{
                        fontWeight: "bold",
                        fontSize: "1.2rem",
                        py: 2,
                        px: 3,
                        "& .MuiChip-label": { px: 2 },
                      }}
                    />
                  </Grid>
                </Grid>
              </Paper>

              {/* Statistics Cards */}
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={4}>
                  <Paper sx={{ p: 2, textAlign: "center", bgcolor: "#e8f5e9" }}>
                    <CorrectIcon
                      sx={{ color: "#4caf50", fontSize: 30, mb: 1 }}
                    />
                    <Typography
                      variant="h5"
                      sx={{ color: "#2e7d32", fontWeight: 700 }}
                    >
                      {selectedResult.statistics.correctAnswers}
                    </Typography>
                    <Typography variant="body2">Correct</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={4}>
                  <Paper sx={{ p: 2, textAlign: "center", bgcolor: "#ffebee" }}>
                    <IncorrectIcon
                      sx={{ color: "#f44336", fontSize: 30, mb: 1 }}
                    />
                    <Typography
                      variant="h5"
                      sx={{ color: "#c62828", fontWeight: 700 }}
                    >
                      {selectedResult.statistics.wrongAnswers}
                    </Typography>
                    <Typography variant="body2">Wrong</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={4}>
                  <Paper sx={{ p: 2, textAlign: "center", bgcolor: "#fff3e0" }}>
                    <UnattemptedIcon
                      sx={{ color: "#ff9800", fontSize: 30, mb: 1 }}
                    />
                    <Typography
                      variant="h5"
                      sx={{ color: "#ed6c02", fontWeight: 700 }}
                    >
                      {selectedResult.statistics.unattempted}
                    </Typography>
                    <Typography variant="body2">Unattempted</Typography>
                  </Paper>
                </Grid>
              </Grid>

              {/* Detailed Answers */}
              <Typography
                variant="h6"
                gutterBottom
                sx={{ display: "flex", alignItems: "center", gap: 1 }}
              >
                <PsychologyIcon color="primary" />
                Question-wise Analysis
              </Typography>

              <List
                sx={{ bgcolor: "white", borderRadius: 2, overflow: "hidden" }}
              >
                {selectedResult.detailedAnswers.map((answer, index) => {
                  // Find the student's selected option text
                  const studentSelectedText =
                    answer.selectedOption !== undefined
                      ? answer.options[answer.selectedOption]
                      : null;

                  // Find the correct option text
                  const correctAnswerText =
                    answer.options[answer.correctAnswer];

                  return (
                    <ListItem
                      key={answer.questionId}
                      divider={
                        index < selectedResult.detailedAnswers.length - 1
                      }
                      sx={{
                        display: "block",
                        bgcolor: answer.isCorrect
                          ? alpha("#4caf50", 0.08)
                          : answer.selectedOption
                            ? alpha("#f44336", 0.08)
                            : alpha("#ff9800", 0.08),
                        "&:hover": {
                          bgcolor: answer.isCorrect
                            ? alpha("#4caf50", 0.12)
                            : answer.selectedOption
                              ? alpha("#f44336", 0.12)
                              : alpha("#ff9800", 0.12),
                        },
                      }}
                    >
                      {/* Question Header */}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "flex-start",
                          gap: 2,
                          mb: 2,
                        }}
                      >
                        <Badge badgeContent={index + 1} color="primary">
                          <Avatar
                            sx={{
                              bgcolor: answer.isCorrect
                                ? "#4caf50"
                                : answer.selectedOption
                                  ? "#f44336"
                                  : "#ff9800",
                              width: 36,
                              height: 36,
                            }}
                          >
                            {answer.isCorrect ? (
                              <CorrectIcon sx={{ fontSize: 20 }} />
                            ) : answer.selectedOption ? (
                              <IncorrectIcon sx={{ fontSize: 20 }} />
                            ) : (
                              <UnattemptedIcon sx={{ fontSize: 20 }} />
                            )}
                          </Avatar>
                        </Badge>
                        <Box sx={{ flex: 1 }}>
                          <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: 600 }}
                          >
                            {answer.questionText}
                          </Typography>
                          <Box sx={{ display: "flex", gap: 2, mt: 0.5 }}>
                            <Chip
                              label={`Marks: ${answer.marks}/${answer.questionMarks}`}
                              size="small"
                              color={
                                answer.marks > 0
                                  ? "success"
                                  : answer.marks < 0
                                    ? "error"
                                    : "default"
                              }
                              sx={{ height: 20, fontSize: "0.7rem" }}
                            />
                            {answer.negativeMarks > 0 && (
                              <Chip
                                label={`Negative: ${answer.negativeMarks}`}
                                size="small"
                                color="warning"
                                sx={{ height: 20, fontSize: "0.7rem" }}
                              />
                            )}
                          </Box>
                        </Box>
                      </Box>

                      {/* Options Grid */}
                      <Grid container spacing={1} sx={{ pl: 7 }}>
                        {answer.options.map((option, optIndex) => {
                          const isCorrectAnswer =
                            optIndex === answer.correctAnswer;
                          const isStudentAnswer =
                            answer.selectedOption === optIndex;

                          let bgColor = "transparent";
                          let borderColor = "transparent";
                          let textColor = "text.primary";

                          if (isCorrectAnswer && isStudentAnswer) {
                            // Student selected correct answer
                            bgColor = alpha("#4caf50", 0.15);
                            borderColor = "#4caf50";
                            textColor = "#2e7d32";
                          } else if (isCorrectAnswer && !isStudentAnswer) {
                            // Correct answer but student didn't select it
                            bgColor = alpha("#4caf50", 0.08);
                            borderColor = "#4caf50";
                            textColor = "#2e7d32";
                          } else if (isStudentAnswer && !isCorrectAnswer) {
                            // Student selected wrong answer
                            bgColor = alpha("#f44336", 0.15);
                            borderColor = "#f44336";
                            textColor = "#c62828";
                          }

                          return (
                            <Grid item xs={12} key={optIndex}>
                              <Paper
                                variant="outlined"
                                sx={{
                                  p: 1.5,
                                  bgcolor: bgColor,
                                  borderColor: borderColor,
                                  borderWidth:
                                    isCorrectAnswer || isStudentAnswer ? 2 : 1,
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 1.5,
                                  transition: "all 0.2s ease",
                                }}
                              >
                                {/* Option Indicator */}
                                <Box
                                  sx={{
                                    position: "relative",
                                    width: 24,
                                    height: 24,
                                  }}
                                >
                                  {/* Radio button background */}
                                  <Box
                                    sx={{
                                      width: 20,
                                      height: 20,
                                      borderRadius: "50%",
                                      border: `2px solid ${
                                        isCorrectAnswer
                                          ? "#4caf50"
                                          : isStudentAnswer
                                            ? "#f44336"
                                            : "#bdbdbd"
                                      }`,
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      bgcolor: "white",
                                    }}
                                  >
                                    {/* Option letter */}
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        fontWeight: "bold",
                                        color: isCorrectAnswer
                                          ? "#4caf50"
                                          : isStudentAnswer
                                            ? "#f44336"
                                            : "#757575",
                                      }}
                                    >
                                      {String.fromCharCode(65 + optIndex)}
                                    </Typography>
                                  </Box>

                                  {/* Check/Cross indicators */}
                                  {isCorrectAnswer && (
                                    <CheckCircleIcon
                                      sx={{
                                        position: "absolute",
                                        top: -4,
                                        right: -4,
                                        fontSize: 14,
                                        color: "#4caf50",
                                        bgcolor: "white",
                                        borderRadius: "50%",
                                      }}
                                    />
                                  )}
                                  {isStudentAnswer && !isCorrectAnswer && (
                                    <CancelIcon
                                      sx={{
                                        position: "absolute",
                                        top: -4,
                                        right: -4,
                                        fontSize: 14,
                                        color: "#f44336",
                                        bgcolor: "white",
                                        borderRadius: "50%",
                                      }}
                                    />
                                  )}
                                </Box>

                                {/* Option Text */}
                                <Typography
                                  variant="body2"
                                  sx={{
                                    flex: 1,
                                    fontWeight: isStudentAnswer ? 600 : 400,
                                    color: textColor,
                                  }}
                                >
                                  {option}
                                </Typography>

                                {/* Status Badges */}
                                <Box sx={{ display: "flex", gap: 0.5 }}>
                                  {isCorrectAnswer && (
                                    <Chip
                                      label="Correct Answer"
                                      size="small"
                                      sx={{
                                        height: 20,
                                        fontSize: "0.65rem",
                                        bgcolor: "#4caf50",
                                        color: "white",
                                      }}
                                    />
                                  )}
                                  {isStudentAnswer && !isCorrectAnswer && (
                                    <Chip
                                      label="Your Answer"
                                      size="small"
                                      sx={{
                                        height: 20,
                                        fontSize: "0.65rem",
                                        bgcolor: "#f44336",
                                        color: "white",
                                      }}
                                    />
                                  )}
                                  {isStudentAnswer && isCorrectAnswer && (
                                    <Chip
                                      label="Correct ✓"
                                      size="small"
                                      sx={{
                                        height: 20,
                                        fontSize: "0.65rem",
                                        bgcolor: "#4caf50",
                                        color: "white",
                                      }}
                                    />
                                  )}
                                </Box>
                              </Paper>
                            </Grid>
                          );
                        })}
                      </Grid>

                      {/* Question Summary */}
                      {!answer.selectedOption && (
                        <Box sx={{ pl: 7, mt: 1 }}>
                          <Alert
                            severity="warning"
                            sx={{ py: 0, "& .MuiAlert-message": { py: 0.5 } }}
                          >
                            <Typography variant="caption">
                              You did not attempt this question
                            </Typography>
                          </Alert>
                        </Box>
                      )}
                    </ListItem>
                  );
                })}
              </List>

              {selectedResult.result.remarks && (
                <Alert severity="info" sx={{ mt: 3, borderRadius: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Teacher's Remarks:
                  </Typography>
                  <Typography variant="body2">
                    {selectedResult.result.remarks}
                  </Typography>
                </Alert>
              )}
            </DialogContent>

            <DialogActions sx={{ p: 2, bgcolor: "#f8f9fa" }}>
              <Button
                onClick={() => setDetailsDialog(false)}
                variant="outlined"
              >
                Close
              </Button>
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={() => downloadResultAsPDF(selectedResult)}
                sx={{ bgcolor: "#0B234A", "&:hover": { bgcolor: "#1a3a6e" } }}
              >
                Download Result
              </Button>
              <Tooltip title="Share Result">
                <IconButton color="primary">
                  <ShareIcon />
                </IconButton>
              </Tooltip>
            </DialogActions>
          </>
        )}
      </Dialog>
      {/* Analytics Dialog */}
      <Dialog
        open={analyticsDialog}
        onClose={() => setAnalyticsDialog(false)}
        maxWidth="lg"
        fullWidth
        TransitionComponent={Zoom}
      >
        <DialogTitle
          sx={{
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            color: "white",
          }}
        >
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              Performance Analytics
            </Typography>
            <IconButton
              onClick={() => setAnalyticsDialog(false)}
              sx={{ color: "white" }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent sx={{ bgcolor: "#f8f9fa", pt: 3 }}>
          <Grid container spacing={3}>
            {/* Performance Trend Chart */}
            <Grid item xs={12} md={8}>
              <Paper sx={{ p: 3, borderRadius: 2 }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                  <TimelineIcon color="primary" />
                  Performance Trend
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                    <ChartTooltip
                      contentStyle={{
                        backgroundColor: "white",
                        borderRadius: 8,
                        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="percentage"
                      stroke="#8884d8"
                      strokeWidth={3}
                      dot={{
                        r: 6,
                        fill: "#8884d8",
                        stroke: "white",
                        strokeWidth: 2,
                      }}
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            {/* Pass/Fail Ratio */}
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, borderRadius: 2, height: "100%" }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                  <PieChart />
                  Pass/Fail Ratio
                </Typography>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <ChartTooltip />
                  </PieChart>
                </ResponsiveContainer>
                <Box
                  sx={{
                    mt: 2,
                    display: "flex",
                    justifyContent: "center",
                    gap: 3,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        bgcolor: "#4caf50",
                        borderRadius: "50%",
                        mr: 1,
                      }}
                    />
                    <Typography variant="body2">
                      Passed ({data.statistics.passedExams})
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <Box
                      sx={{
                        width: 12,
                        height: 12,
                        bgcolor: "#f44336",
                        borderRadius: "50%",
                        mr: 1,
                      }}
                    />
                    <Typography variant="body2">
                      Failed ({data.statistics.failedExams})
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>

            {/* Score Distribution */}
            <Grid item xs={12}>
              <Paper sx={{ p: 3, borderRadius: 2 }}>
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                  <BarChart />
                  Score Distribution
                </Typography>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                    <ChartTooltip />
                    <Bar dataKey="percentage" fill="#8884d8">
                      {chartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={getScoreColor(entry.percentage)}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Paper>
            </Grid>

            {/* Performance Insights */}
            <Grid item xs={12}>
              <Paper
                sx={{
                  p: 3,
                  borderRadius: 2,
                  bgcolor: "#0B234A",
                  color: "white",
                }}
              >
                <Typography
                  variant="h6"
                  gutterBottom
                  sx={{ display: "flex", alignItems: "center", gap: 1 }}
                >
                  <PsychologyIcon />
                  Performance Insights
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ textAlign: "center" }}>
                      <Typography
                        variant="h3"
                        sx={{ fontWeight: 700, color: "#4caf50" }}
                      >
                        {data.statistics.passedExams}
                      </Typography>
                      <Typography variant="body2">Exams Passed</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ textAlign: "center" }}>
                      <Typography
                        variant="h3"
                        sx={{ fontWeight: 700, color: "#ff9800" }}
                      >
                        {data.statistics.averagePercentage}%
                      </Typography>
                      <Typography variant="body2">Average Score</Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Box sx={{ textAlign: "center" }}>
                      <Typography
                        variant="h3"
                        sx={{ fontWeight: 700, color: "#2196f3" }}
                      >
                        {chartData.length}
                      </Typography>
                      <Typography variant="body2">Total Attempts</Typography>
                    </Box>
                  </Grid>
                </Grid>
                <Box sx={{ mt: 2, textAlign: "center" }}>
                  <Typography variant="body1" sx={{ opacity: 0.9 }}>
                    {getPerformanceMessage(data.statistics.averagePercentage)}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </DialogContent>
      </Dialog>
    </StyledContainer>
  );
};

export default MyResults;
