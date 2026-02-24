// src/pages/student/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Clock,
  BookOpen,
  Play,
  Calendar,
  ChevronRight,
  Timer,
  GraduationCap,
  FileText,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  AlertCircle,
  Award,
  Zap,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import {
  getAvailableExams,
  startExam,
} from "../../services/studentExamService";
import toast from "react-hot-toast";

const StudentDashboard = () => {
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [agreedToInstructions, setAgreedToInstructions] = useState(false);
  const [instructionsChecked, setInstructionsChecked] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  const navigate = useNavigate();
  const { user } = useAuth();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startingExamId, setStartingExamId] = useState(null);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchAvailableExams();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const getRemainingTime = (endTime) => {
    const diff = new Date(endTime).getTime() - currentTime;
    if (diff <= 0) return "Expired";

    const totalSeconds = Math.floor(diff / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m ${seconds}s`;
  };

  const getTimeStatusColor = (endTime) => {
    const diff = new Date(endTime).getTime() - currentTime;
    if (diff <= 0) return "bg-gray-100 text-gray-600";
    if (diff < 30 * 60 * 1000) return "bg-red-100 text-red-600";
    if (diff < 60 * 60 * 1000) return "bg-yellow-100 text-yellow-600";
    return "bg-green-100 text-green-600";
  };

  const fetchAvailableExams = async () => {
    try {
      setLoading(true);
      const data = await getAvailableExams();
      setExams(data.exams || []);
    } catch (error) {
      toast.error(error.message || "Failed to fetch exams");
    } finally {
      setLoading(false);
    }
  };

  const handleStartExamClick = (exam) => {
    setSelectedExam(exam);
    setAgreedToInstructions(false);
    setInstructionsChecked({});
    setShowInstructionsModal(true);
  };

  const confirmStartExam = async () => {
    if (!agreedToInstructions) {
      toast.error("Please accept all instructions to continue");
      return;
    }

    try {
      setStartingExamId(selectedExam._id);
      const response = await startExam(selectedExam._id);
      if (response.success) {
        toast.success("Exam started successfully! Good luck! 🍀");
        navigate(`/student/exam/${selectedExam._id}`);
      }
    } catch (error) {
      toast.error(error.message || "Failed to start exam");
    } finally {
      setStartingExamId(null);
      setShowInstructionsModal(false);
    }
  };

  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getFilteredExams = () => {
    let filtered = exams;

    if (selectedCategory !== "all") {
      filtered = filtered.filter(e => 
        e.subject?.toLowerCase().includes(selectedCategory.toLowerCase())
      );
    }

    switch (filter) {
      case "available":
        filtered = filtered.filter((e) => new Date(e.endTime).getTime() > currentTime);
        break;
      case "expiring":
        filtered = filtered.filter((e) => {
          const diff = new Date(e.endTime).getTime() - currentTime;
          return diff > 0 && diff < 60 * 60 * 1000;
        });
        break;
      default:
        break;
    }

    if (searchQuery) {
      filtered = filtered.filter(e =>
        e.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.subject?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredExams = getFilteredExams();

  const stats = {
    total: exams.length,
    available: exams.filter((e) => new Date(e.endTime).getTime() > currentTime).length,
    expiring: exams.filter((e) => {
      const diff = new Date(e.endTime).getTime() - currentTime;
      return diff > 0 && diff < 60 * 60 * 1000;
    }).length,
    totalDuration: exams.reduce((acc, exam) => acc + exam.duration, 0),
  };

  const categories = [
    { id: "all", name: "All Subjects" },
    { id: "mathematics", name: "Mathematics" },
    { id: "physics", name: "Physics" },
    { id: "chemistry", name: "Chemistry" },
    { id: "biology", name: "Biology" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-[#0B234A]">
                {getGreeting()}, {user?.name?.split(' ')[0] || "Student"}!
              </h1>
              <p className="text-gray-600 mt-1">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            {/* Search and Filter */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search exams..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B234A] focus:border-transparent"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="p-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors relative"
              >
                <Filter className="h-5 w-5 text-gray-600" />
                {filter !== "all" && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#EA8E0A] rounded-full"></span>
                )}
              </button>
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-4 bg-white rounded-lg shadow-lg p-4 border border-gray-200">
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === category.id
                        ? "bg-[#0B234A] text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <span className="text-xs text-gray-500">Total</span>
            </div>
            <p className="text-xl font-bold text-[#0B234A]">{stats.total}</p>
            <p className="text-xs text-gray-500">Exams</p>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-xs text-gray-500">Available</span>
            </div>
            <p className="text-xl font-bold text-green-600">{stats.available}</p>
            <p className="text-xs text-gray-500">Now</p>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <Timer className="h-5 w-5 text-yellow-600" />
              <span className="text-xs text-gray-500">Expiring</span>
            </div>
            <p className="text-xl font-bold text-yellow-600">{stats.expiring}</p>
            <p className="text-xs text-gray-500">Soon</p>
          </div>

          <div className="bg-white rounded-lg p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <Clock className="h-5 w-5 text-purple-600" />
              <span className="text-xs text-gray-500">Duration</span>
            </div>
            <p className="text-xl font-bold text-[#0B234A]">{formatTime(stats.totalDuration)}</p>
            <p className="text-xs text-gray-500">Total</p>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: "all", label: "All Exams" },
            { id: "available", label: "Available" },
            { id: "expiring", label: "Expiring Soon" },
          ].map((filterOption) => (
            <button
              key={filterOption.id}
              onClick={() => setFilter(filterOption.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                filter === filterOption.id
                  ? "bg-[#EA8E0A] text-white"
                  : "bg-white text-gray-600 hover:bg-gray-100"
              }`}
            >
              {filterOption.label}
            </button>
          ))}
        </div>

        {/* Exams Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#0B234A] border-t-transparent"></div>
          </div>
        ) : filteredExams.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <GraduationCap className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Exams Found</h3>
            <p className="text-gray-500">
              {searchQuery || filter !== "all" || selectedCategory !== "all"
                ? "Try adjusting your filters"
                : "No exams scheduled at the moment"}
            </p>
            {(searchQuery || filter !== "all" || selectedCategory !== "all") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setFilter("all");
                  setSelectedCategory("all");
                }}
                className="mt-4 text-[#EA8E0A] hover:text-[#d17e08] font-medium"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredExams.map((exam, index) => {
              const isExpiring = new Date(exam.endTime).getTime() - currentTime < 60 * 60 * 1000;
              const hasStarted = new Date(exam.startTime).getTime() <= currentTime;
              const isExpired = new Date(exam.endTime).getTime() <= currentTime;
              const canStart = hasStarted && !isExpired;

              return (
                <div
                  key={exam._id}
                  className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                >
                  {/* Progress Bar */}
                  <div className="h-1 bg-gray-100">
                    <div
                      className={`h-full ${
                        isExpiring ? "bg-yellow-500" : "bg-green-500"
                      }`}
                      style={{
                        width: `${Math.min(100, ((new Date(exam.endTime).getTime() - currentTime) / (1000 * 60 * 60)) * 100)}%`,
                      }}
                    />
                  </div>

                  <div className="p-4">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-[#0B234A]">{exam.title}</h3>
                        <p className="text-sm text-gray-600">{exam.subject || "General"}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTimeStatusColor(exam.endTime)}`}>
                        {getRemainingTime(exam.endTime)}
                      </span>
                    </div>

                    {/* Details */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="bg-gray-50 rounded p-2">
                        <Clock className="h-4 w-4 text-gray-400 mb-1" />
                        <p className="text-xs text-gray-500">Duration</p>
                        <p className="text-sm font-medium text-[#0B234A]">{exam.duration}m</p>
                      </div>
                      <div className="bg-gray-50 rounded p-2">
                        <FileText className="h-4 w-4 text-gray-400 mb-1" />
                        <p className="text-xs text-gray-500">Questions</p>
                        <p className="text-sm font-medium text-[#0B234A]">{exam.totalQuestions || "N/A"}</p>
                      </div>
                      <div className="bg-gray-50 rounded p-2">
                        <Award className="h-4 w-4 text-gray-400 mb-1" />
                        <p className="text-xs text-gray-500">Marks</p>
                        <p className="text-sm font-medium text-[#0B234A]">{exam.totalMarks || "N/A"}</p>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        Ends {new Date(exam.endTime).toLocaleTimeString()}
                      </span>
                      <button
                        onClick={() => handleStartExamClick(exam)}
                        disabled={startingExamId === exam._id || !canStart}
                        className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center space-x-1 transition-colors ${
                          !canStart
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-[#EA8E0A] text-white hover:bg-[#d17e08]"
                        }`}
                      >
                        {startingExamId === exam._id ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                            <span>Starting...</span>
                          </>
                        ) : !hasStarted ? (
                          <>
                            <Clock className="h-4 w-4" />
                            <span>Not Started</span>
                          </>
                        ) : isExpired ? (
                          <>
                            <XCircle className="h-4 w-4" />
                            <span>Expired</span>
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4" />
                            <span>Start</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Instructions Modal */}
        {showInstructionsModal && selectedExam && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="bg-[#0B234A] text-white p-4">
                <h2 className="text-lg font-semibold">Exam Instructions</h2>
                <p className="text-sm text-white/80">{selectedExam.title}</p>
              </div>

              {/* Modal Content */}
              <div className="p-4 space-y-4">
                {/* Exam Summary */}
                <div className="bg-blue-50 rounded-lg p-3">
                  <h3 className="font-medium text-[#0B234A] mb-2">Exam Summary</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium ml-2">{selectedExam.duration} min</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Questions:</span>
                      <span className="font-medium ml-2">{selectedExam.totalQuestions || "N/A"}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Max Marks:</span>
                      <span className="font-medium ml-2">{selectedExam.totalMarks || "N/A"}</span>
                    </div>
                  </div>
                </div>

                {/* Instructions */}
                <div>
                  <h3 className="font-medium text-[#0B234A] mb-2">Please read carefully:</h3>
                  <div className="space-y-2">
                    {[
                      "You cannot pause the exam once started.",
                      "Do not refresh or close the browser during the exam.",
                      "The exam will auto-submit when time expires.",
                      "Ensure stable internet connection throughout the exam.",
                      "Answers are saved automatically as you progress.",
                    ].map((instruction, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <input
                          type="checkbox"
                          id={`inst-${index}`}
                          checked={instructionsChecked[index] || false}
                          onChange={(e) => {
                            const newChecked = { ...instructionsChecked, [index]: e.target.checked };
                            setInstructionsChecked(newChecked);
                            setAgreedToInstructions(
                              Object.values(newChecked).length === 5 && 
                              Object.values(newChecked).every(v => v)
                            );
                          }}
                          className="mt-1"
                        />
                        <label htmlFor={`inst-${index}`} className="text-sm text-gray-700">
                          {instruction}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Agreement */}
                <div className="border-t pt-3">
                  <div className="flex items-center space-x-2 bg-gray-50 p-3 rounded">
                    <input
                      type="checkbox"
                      id="agree-all"
                      checked={agreedToInstructions}
                      onChange={(e) => {
                        setAgreedToInstructions(e.target.checked);
                        const newChecked = {};
                        if (e.target.checked) {
                          for (let i = 0; i < 5; i++) newChecked[i] = true;
                        }
                        setInstructionsChecked(newChecked);
                      }}
                    />
                    <label htmlFor="agree-all" className="text-sm font-medium">
                      I have read and agree to all instructions
                    </label>
                  </div>
                </div>

                {/* Note */}
                <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                    <p className="text-sm text-yellow-800">
                      Once started, you cannot restart the exam. Make sure you have {selectedExam.duration} minutes free.
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="border-t p-4 flex justify-end space-x-2">
                <button
                  onClick={() => setShowInstructionsModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmStartExam}
                  disabled={!agreedToInstructions || startingExamId}
                  className="px-4 py-2 bg-[#EA8E0A] text-white rounded hover:bg-[#d17e08] transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm flex items-center space-x-1"
                >
                  {startingExamId ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Starting...</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      <span>Start Exam</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;