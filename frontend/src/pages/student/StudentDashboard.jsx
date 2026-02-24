// src/pages/student/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Clock,
  BookOpen,
  AlertCircle,
  Play,
  Calendar,
  ChevronRight,
  Timer,
  GraduationCap,
  FileText,
  CheckCircle,
  XCircle,
  Sparkles,
  TrendingUp,
  Award,
  Zap,
  Shield,
  Brain,
  ChevronDown,
  Bell,
  Search,
  Filter,
  Star,
  Rocket,
  Target,
  BarChart3,
  Users,
  Globe,
  Coffee,
  Sun,
  Moon,
  Cloud,
  CloudRain,
  Wind,
  Battery
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
  const [showWelcomeAnimation, setShowWelcomeAnimation] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [weatherEffect, setWeatherEffect] = useState("sunny");
  
  const navigate = useNavigate();
  const { user } = useAuth();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startingExamId, setStartingExamId] = useState(null);
  const [filter, setFilter] = useState("all");

  // Weather effects for ambient background
  const weatherIcons = {
    sunny: <Sun className="h-5 w-5 text-yellow-500" />,
    cloudy: <Cloud className="h-5 w-5 text-gray-500" />,
    rainy: <CloudRain className="h-5 w-5 text-blue-500" />,
    windy: <Wind className="h-5 w-5 text-teal-500" />,
  };

  useEffect(() => {
    fetchAvailableExams();
    // Hide welcome animation after 3 seconds
    const timer = setTimeout(() => setShowWelcomeAnimation(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Dynamic greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    if (hour < 20) return "Good Evening";
    return "Good Night";
  };

  // Get motivational quote
  const getMotivationalQuote = () => {
    const quotes = [
      { text: "Your attitude, not your aptitude, determines your altitude.", author: "Zig Ziglar" },
      { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
      { text: "The expert in anything was once a beginner.", author: "Helen Hayes" },
      { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
      { text: "The future depends on what you do today.", author: "Mahatma Gandhi" },
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  };

  const quote = getMotivationalQuote();

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
    if (diff <= 0) return "border-gray-200 bg-gray-50";
    if (diff < 30 * 60 * 1000) return "border-red-200 bg-red-50";
    if (diff < 60 * 60 * 1000) return "border-yellow-200 bg-yellow-50";
    return "border-green-200 bg-green-50";
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
        toast.success("Exam started successfully! Best of luck! 🚀");
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

  // Filter and search exams
  const getFilteredExams = () => {
    let filtered = exams;

    // Apply category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter(e => e.subject?.toLowerCase().includes(selectedCategory.toLowerCase()));
    }

    // Apply time filter
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

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(e => 
        e.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.subject?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredExams = getFilteredExams();

  // Stats calculation with animations
  const stats = {
    total: exams.length,
    available: exams.filter((e) => new Date(e.endTime).getTime() > currentTime).length,
    expiring: exams.filter((e) => {
      const diff = new Date(e.endTime).getTime() - currentTime;
      return diff > 0 && diff < 60 * 60 * 1000;
    }).length,
    totalDuration: exams.reduce((acc, exam) => acc + exam.duration, 0),
    completed: exams.filter(e => e.status === 'completed').length,
  };

  // Categories for filter
  const categories = [
    { id: "all", name: "All Subjects", icon: BookOpen },
    { id: "mathematics", name: "Mathematics", icon: Brain },
    { id: "physics", name: "Physics", icon: Zap },
    { id: "chemistry", name: "Chemistry", icon: Wind },
    { id: "biology", name: "Biology", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Welcome Animation Overlay */}
      {showWelcomeAnimation && (
        <div className="fixed inset-0 bg-gradient-to-r from-[#0B234A] to-[#1a3a6e] z-50 flex items-center justify-center animate-fadeOut">
          <div className="text-center">
            <Rocket className="h-20 w-20 text-[#EA8E0A] mx-auto mb-4 animate-bounce" />
            <h2 className="text-4xl font-bold text-white mb-2 animate-slideUp">
              Welcome back, {user?.name?.split(' ')[0]}!
            </h2>
            <p className="text-white/80 text-lg animate-slideUp delay-200">
              Ready to ace your exams? 🚀
            </p>
          </div>
        </div>
      )}

      {/* Floating Background Elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float"></div>
        <div className="absolute bottom-20 right-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-float delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#EA8E0A] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Header with Weather and Search */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-br from-[#0B234A] to-[#1a3a6e] rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-110 transition-transform">
                  <GraduationCap className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h1 className="text-3xl font-bold text-[#0B234A]">
                    {getGreeting()}, {user?.name || "Student"}!
                  </h1>
                  <Sparkles className="h-6 w-6 text-[#EA8E0A] animate-pulse" />
                </div>
                <div className="flex items-center space-x-4 mt-1">
                  <div className="flex items-center space-x-1 text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm">
                      {new Date().toLocaleDateString("en-US", {
                        weekday: "long",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 text-gray-600">
                    {weatherIcons[weatherEffect]}
                    <span className="text-sm">24°C • Partly Cloudy</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Search and Filter Bar */}
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search exams..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EA8E0A] focus:border-transparent w-64"
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

          {/* Motivational Quote Card */}
          <div className="mt-6 bg-gradient-to-r from-[#0B234A] to-[#1a3a6e] rounded-xl p-6 text-white shadow-xl">
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-white/20 rounded-lg">
                <Star className="h-6 w-6 text-yellow-300" />
              </div>
              <div>
                <p className="text-lg italic">"{quote.text}"</p>
                <p className="text-sm text-white/80 mt-1">— {quote.author}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards with Icons and Animations */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {[
            { label: "Total Exams", value: stats.total, icon: BookOpen, color: "blue", trend: "+12%" },
            { label: "Available", value: stats.available, icon: CheckCircle, color: "green", trend: "+5" },
            { label: "Expiring Soon", value: stats.expiring, icon: Timer, color: "orange", trend: "Urgent" },
            { label: "Completed", value: stats.completed, icon: Award, color: "purple", trend: "83%" },
            { label: "Total Hours", value: formatTime(stats.totalDuration), icon: Clock, color: "teal", trend: "This week" },
          ].map((stat, index) => (
            <div
              key={index}
              className="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2 bg-${stat.color}-50 rounded-lg group-hover:scale-110 transition-transform`}>
                    <stat.icon className={`h-5 w-5 text-${stat.color}-600`} />
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full bg-${stat.color}-100 text-${stat.color}-700`}>
                    {stat.trend}
                  </span>
                </div>
                <p className="text-2xl font-bold text-[#0B234A] group-hover:text-[#EA8E0A] transition-colors">
                  {stat.value}
                </p>
                <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
              </div>
              <div className={`h-1 bg-gradient-to-r from-${stat.color}-500 to-${stat.color}-300 transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left`}></div>
            </div>
          ))}
        </div>

        {/* Filter Tabs with Categories */}
        <div className="mb-6 space-y-4">
          {/* Category Pills */}
          <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                    selectedCategory === category.id
                      ? "bg-[#0B234A] text-white shadow-lg scale-105"
                      : "bg-white text-gray-600 hover:bg-gray-100 hover:scale-105"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{category.name}</span>
                </button>
              );
            })}
          </div>

          {/* Time Filter Pills */}
          <div className="flex space-x-2 overflow-x-auto pb-2">
            {[
              { id: "all", label: "All Exams", icon: Globe },
              { id: "available", label: "Available Now", icon: CheckCircle },
              { id: "expiring", label: "Expiring Soon", icon: Timer },
            ].map((filterOption) => {
              const Icon = filterOption.icon;
              return (
                <button
                  key={filterOption.id}
                  onClick={() => setFilter(filterOption.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    filter === filterOption.id
                      ? "bg-[#EA8E0A] text-white shadow-lg scale-105"
                      : "bg-white text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{filterOption.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Loading State with Animation */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="relative">
              <div className="animate-spin rounded-full h-20 w-20 border-4 border-gray-200 border-t-[#EA8E0A]"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Brain className="h-8 w-8 text-[#EA8E0A] animate-pulse" />
              </div>
            </div>
            <p className="mt-6 text-gray-600 animate-pulse">Loading your personalized dashboard...</p>
          </div>
        ) : filteredExams.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-16 text-center">
            <div className="relative">
              <div className="w-32 h-32 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Coffee className="h-16 w-16 text-gray-400" />
              </div>
              <div className="absolute top-0 right-1/2 transform translate-x-16">
                <Cloud className="h-8 w-8 text-gray-300 animate-float" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-700 mb-3">
              No Exams Found
            </h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              {searchQuery || filter !== "all" || selectedCategory !== "all"
                ? "Try adjusting your filters or search query"
                : "Time to take a break! No exams scheduled at the moment."}
            </p>
            {(searchQuery || filter !== "all" || selectedCategory !== "all") && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setFilter("all");
                  setSelectedCategory("all");
                }}
                className="px-6 py-3 bg-gradient-to-r from-[#EA8E0A] to-[#d17e08] text-white rounded-lg hover:shadow-lg transition-all transform hover:scale-105"
              >
                Clear All Filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredExams.map((exam, index) => {
              const isExpiring =
                new Date(exam.endTime).getTime() - currentTime < 60 * 60 * 1000;
              const hasStarted =
                new Date(exam.startTime).getTime() <= currentTime;
              const isExpired = new Date(exam.endTime).getTime() <= currentTime;
              const canStart = hasStarted && !isExpired;

              return (
                <div
                  key={exam._id}
                  className="group bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 animate-slideIn"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  {/* Card Header with Progress */}
                  <div className="relative h-2 bg-gray-100">
                    <div
                      className={`absolute top-0 left-0 h-full transition-all duration-1000 ${
                        isExpiring ? "bg-gradient-to-r from-red-500 to-orange-500" : "bg-gradient-to-r from-green-500 to-teal-500"
                      }`}
                      style={{
                        width: `${Math.min(100, ((new Date(exam.endTime).getTime() - currentTime) / (1000 * 60 * 60)) * 100)}%`,
                      }}
                    />
                  </div>

                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="text-xl font-bold text-[#0B234A] group-hover:text-[#EA8E0A] transition-colors">
                            {exam.title}
                          </h3>
                          {isExpiring && !isExpired && (
                            <span className="flex items-center space-x-1 px-2 py-1 bg-red-100 text-red-600 text-xs font-medium rounded-full animate-pulse">
                              <Zap className="h-3 w-3" />
                              <span>Urgent</span>
                            </span>
                          )}
                          {exam.difficulty === "hard" && (
                            <span className="px-2 py-1 bg-purple-100 text-purple-600 text-xs font-medium rounded-full">
                              Advanced
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 flex items-center">
                          <BookOpen className="h-4 w-4 mr-1" />
                          {exam.subject || "General"}
                        </p>
                      </div>
                      <div
                        className={`px-3 py-1.5 rounded-xl border ${getTimeStatusColor(exam.endTime)}`}
                      >
                        <span className="text-sm font-medium">
                          {getRemainingTime(exam.endTime)}
                        </span>
                      </div>
                    </div>

                    {/* Exam Details Grid */}
                    <div className="grid grid-cols-3 gap-3 mb-6">
                      <div className="bg-gray-50 rounded-xl p-3 group-hover:bg-[#0B234A]/5 transition-colors">
                        <Clock className="h-4 w-4 text-gray-400 mb-1" />
                        <p className="text-xs text-gray-500">Duration</p>
                        <p className="font-semibold text-[#0B234A]">{exam.duration}m</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3 group-hover:bg-[#0B234A]/5 transition-colors">
                        <FileText className="h-4 w-4 text-gray-400 mb-1" />
                        <p className="text-xs text-gray-500">Questions</p>
                        <p className="font-semibold text-[#0B234A]">{exam.totalQuestions || "N/A"}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3 group-hover:bg-[#0B234A]/5 transition-colors">
                        <Target className="h-4 w-4 text-gray-400 mb-1" />
                        <p className="text-xs text-gray-500">Marks</p>
                        <p className="font-semibold text-[#0B234A]">{exam.totalMarks || "N/A"}</p>
                      </div>
                    </div>

                    {/* Footer with Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Calendar className="h-4 w-4" />
                        <span>Ends {new Date(exam.endTime).toLocaleTimeString()}</span>
                      </div>
                      <button
                        onClick={() => handleStartExamClick(exam)}
                        disabled={startingExamId === exam._id || !canStart}
                        className={`relative px-6 py-2.5 rounded-xl font-medium flex items-center space-x-2 transition-all overflow-hidden group/btn ${
                          !canStart
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-gradient-to-r from-[#EA8E0A] to-[#d17e08] text-white hover:shadow-lg hover:scale-105"
                        }`}
                      >
                        <span className="absolute inset-0 bg-white/20 transform -translate-x-full group-hover/btn:translate-x-0 transition-transform duration-300"></span>
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
                            <span>Start Exam</span>
                            <ChevronRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
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

        {/* Enhanced Instructions Modal */}
        {showInstructionsModal && selectedExam && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scaleIn">
              {/* Modal Header with Gradient */}
              <div className="px-6 py-5 bg-gradient-to-r from-[#0B234A] via-[#1a3a6e] to-[#234a8c]">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-white/20 rounded-xl animate-pulse">
                    <Shield className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">
                      Exam Instructions
                    </h2>
                    <p className="text-white/80 text-sm mt-1">
                      {selectedExam.title}
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Exam Summary Card */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
                  <h3 className="font-semibold text-[#0B234A] mb-4 flex items-center">
                    <Award className="h-5 w-5 mr-2 text-[#EA8E0A]" />
                    Exam Summary
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { label: "Duration", value: `${selectedExam.duration} min`, icon: Clock },
                      { label: "Questions", value: selectedExam.totalQuestions || "N/A", icon: FileText },
                      { label: "Max Marks", value: selectedExam.totalMarks || "N/A", icon: Award },
                    ].map((item, idx) => (
                      <div key={idx} className="bg-white/80 rounded-lg p-3">
                        <item.icon className="h-4 w-4 text-gray-500 mb-1" />
                        <p className="text-xs text-gray-500">{item.label}</p>
                        <p className="font-bold text-[#0B234A]">{item.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Instructions List with Interactive Checkboxes */}
                <div>
                  <h3 className="font-semibold text-[#0B234A] mb-4 flex items-center">
                    <AlertCircle className="h-5 w-5 mr-2 text-[#EA8E0A]" />
                    Please read and confirm each instruction:
                  </h3>
                  <div className="space-y-3">
                    {[
                      "You cannot pause the exam once started.",
                      "Do not refresh or close the browser during the exam.",
                      "Each question may have negative marking (if applicable).",
                      "The exam will auto-submit when time expires.",
                      "Ensure stable internet connection throughout the exam.",
                      "Answers are saved automatically as you progress.",
                      "You can navigate between questions using the question palette.",
                    ].map((instruction, index) => (
                      <div
                        key={index}
                        className={`flex items-start space-x-3 p-3 rounded-lg transition-all ${
                          instructionsChecked[index] ? "bg-green-50 border border-green-200" : "bg-gray-50"
                        }`}
                      >
                        <div className="relative">
                          <input
                            type="checkbox"
                            id={`instruction-${index}`}
                            checked={instructionsChecked[index] || false}
                            onChange={(e) => {
                              const newChecked = {
                                ...instructionsChecked,
                                [index]: e.target.checked,
                              };
                              setInstructionsChecked(newChecked);
                              setAgreedToInstructions(
                                Object.values(newChecked).length === 7 && 
                                Object.values(newChecked).every(v => v)
                              );
                            }}
                            className="w-5 h-5 text-[#EA8E0A] rounded focus:ring-[#EA8E0A]"
                          />
                        </div>
                        <label
                          htmlFor={`instruction-${index}`}
                          className="text-gray-700 flex-1 cursor-pointer"
                        >
                          {instruction}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Agreement Checkbox */}
                <div className="border-t pt-4">
                  <div className="flex items-center space-x-3 bg-gradient-to-r from-[#EA8E0A]/10 to-transparent p-4 rounded-lg">
                    <input
                      type="checkbox"
                      id="agree-all"
                      checked={agreedToInstructions}
                      onChange={(e) => {
                        setAgreedToInstructions(e.target.checked);
                        const newCheckedState = {};
                        if (e.target.checked) {
                          for (let i = 0; i < 7; i++) {
                            newCheckedState[i] = true;
                          }
                        }
                        setInstructionsChecked(newCheckedState);
                      }}
                      className="w-5 h-5 text-[#EA8E0A] rounded focus:ring-[#EA8E0A]"
                    />
                    <label
                      htmlFor="agree-all"
                      className="text-gray-700 font-medium cursor-pointer"
                    >
                      I have read and agree to all the instructions
                    </label>
                  </div>
                </div>

                {/* Important Notes */}
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-5">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <AlertCircle className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div>
                      <p className="font-bold text-yellow-800 mb-2">
                        ⚡ Important Notes:
                      </p>
                      <ul className="text-sm text-yellow-700 space-y-2">
                        <li className="flex items-center">
                          <Zap className="h-3 w-3 mr-2" />
                          Once started, you cannot restart the exam
                        </li>
                        <li className="flex items-center">
                          <Clock className="h-3 w-3 mr-2" />
                          Make sure you have at least {selectedExam.duration} minutes of free time
                        </li>
                        <li className="flex items-center">
                          <Battery className="h-3 w-3 mr-2" />
                          Keep your system charged and connected to power
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t bg-gray-50 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={() => setShowInstructionsModal(false)}
                  className="px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-100 transition-all transform hover:scale-105 font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmStartExam}
                  disabled={!agreedToInstructions || startingExamId}
                  className="px-8 py-3 bg-gradient-to-r from-[#EA8E0A] to-[#d17e08] text-white rounded-xl hover:shadow-lg transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-2 font-medium"
                >
                  {startingExamId ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>Starting Exam...</span>
                    </>
                  ) : (
                    <>
                      <Rocket className="h-5 w-5" />
                      <span>Start Exam & Begin Journey</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes fadeOut {
          0% { opacity: 1; }
          70% { opacity: 1; }
          100% { opacity: 0; visibility: hidden; }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        .animate-fadeOut {
          animation: fadeOut 3s ease-in-out forwards;
        }
        
        .animate-slideUp {
          animation: slideUp 0.5s ease-out;
        }
        
        .animate-slideIn {
          animation: slideIn 0.5s ease-out forwards;
          opacity: 0;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .delay-200 {
          animation-delay: 200ms;
        }
        
        .delay-1000 {
          animation-delay: 1000ms;
        }
        
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default StudentDashboard;