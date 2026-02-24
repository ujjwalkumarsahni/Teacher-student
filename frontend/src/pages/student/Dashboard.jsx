// // src/pages/student/Dashboard.jsx
// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { Clock, BookOpen, AlertCircle, Play } from "lucide-react";
// import { useAuth } from "../../hooks/useAuth";
// import {
//   getAvailableExams,
//   startExam,
// } from "../../services/studentExamService";
// import toast from "react-hot-toast";

// const StudentDashboard = () => {
//   const [currentTime, setCurrentTime] = useState(Date.now());
//   const [showInstructionsModal, setShowInstructionsModal] = useState(false);
//   const [selectedExam, setSelectedExam] = useState(null);
//   const [agreedToInstructions, setAgreedToInstructions] = useState(false);
//   const navigate = useNavigate();
//   const { user } = useAuth();
//   const [exams, setExams] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [startingExamId, setStartingExamId] = useState(null);

//   useEffect(() => {
//     fetchAvailableExams();
//   }, []);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setCurrentTime(Date.now());
//     }, 1000);

//     return () => clearInterval(interval);
//   }, []);

//   const getRemainingTime = (endTime) => {
//     const diff = new Date(endTime).getTime() - currentTime;

//     if (diff <= 0) return "Expired";

//     const totalSeconds = Math.floor(diff / 1000);
//     const minutes = Math.floor(totalSeconds / 60);
//     const seconds = totalSeconds % 60;

//     return `${minutes}m ${seconds}s`;
//   };

//   const fetchAvailableExams = async () => {
//     try {
//       setLoading(true);
//       const data = await getAvailableExams();
//       setExams(data.exams || []);
//     } catch (error) {
//       toast.error(error.message || "Failed to fetch exams");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleStartExamClick = (exam) => {
//     setSelectedExam(exam);
//     setAgreedToInstructions(false);
//     setShowInstructionsModal(true);
//   };

//   const confirmStartExam = async () => {
//     if (!agreedToInstructions) {
//       toast.error("Please accept the instructions to continue");
//       return;
//     }

//     try {
//       setStartingExamId(selectedExam._id);

//       const response = await startExam(selectedExam._id);

//       if (response.success) {
//         toast.success("Exam started successfully!");
//         navigate(`/student/exam/${selectedExam._id}`);
//       }
//     } catch (error) {
//       toast.error(error.message || "Failed to start exam");
//     } finally {
//       setStartingExamId(null);
//       setShowInstructionsModal(false);
//     }
//   };

//   const formatTime = (minutes) => {
//     if (minutes < 60) return `${minutes} min`;
//     const hours = Math.floor(minutes / 60);
//     const mins = minutes % 60;
//     return `${hours}h ${mins}m`;
//   };

//   return (
//     <div className="max-w-7xl mx-auto">
//       {/* Header */}
//       <div className="mb-8">
//         <h1 className="text-3xl font-bold text-[#0B234A]">My Exams</h1>
//         <p className="text-gray-600 mt-2">
//           Welcome back! You have {exams.length} available exam(s)
//         </p>
//       </div>

//       {/* Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//         <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-[#EA8E0A]">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-gray-600">Available Exams</p>
//               <p className="text-2xl font-bold text-[#0B234A]">
//                 {exams.length}
//               </p>
//             </div>
//             <div className="p-3 bg-orange-100 rounded-full">
//               <BookOpen className="h-6 w-6 text-[#EA8E0A]" />
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-[#0B234A]">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-gray-600">Total Duration</p>
//               <p className="text-2xl font-bold text-[#0B234A]">
//                 {formatTime(
//                   exams.reduce((acc, exam) => acc + exam.duration, 0),
//                 )}
//               </p>
//             </div>
//             <div className="p-3 bg-blue-100 rounded-full">
//               <Clock className="h-6 w-6 text-[#0B234A]" />
//             </div>
//           </div>
//         </div>

//         <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-[#E22213]">
//           <div className="flex items-center justify-between">
//             <div>
//               <p className="text-sm text-gray-600">Expiring Soon</p>
//               <p className="text-2xl font-bold text-[#E22213]">
//                 {
//                   exams.filter(
//                     (e) =>
//                       new Date(e.endTime).getTime() - currentTime <
//                       60 * 60 * 1000,
//                   ).length
//                 }
//               </p>
//             </div>
//             <div className="p-3 bg-red-100 rounded-full">
//               <AlertCircle className="h-6 w-6 text-[#E22213]" />
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Exams List */}
//       {loading ? (
//         <div className="flex justify-center py-12">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#EA8E0A]"></div>
//         </div>
//       ) : exams.length === 0 ? (
//         <div className="bg-white rounded-xl shadow-sm p-12 text-center">
//           <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
//           <h3 className="text-xl font-semibold text-gray-700 mb-2">
//             No Exams Available
//           </h3>
//           <p className="text-gray-500">
//             You don't have any exams scheduled at the moment.
//           </p>
//         </div>
//       ) : (
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//           {exams.map((exam) => (
//             <div
//               key={exam._id}
//               className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
//             >
//               <div className="p-6">
//                 <div className="flex justify-between items-start mb-4">
//                   <div>
//                     <h3 className="text-xl font-semibold text-[#0B234A] mb-1">
//                       {exam.title}
//                     </h3>
//                     <p className="text-gray-600">{exam.subject}</p>
//                   </div>
//                   <span
//                     className={`px-3 py-1 rounded-full text-sm font-medium ${
//                       exam.remainingTimeInMinutes < 30
//                         ? "bg-red-100 text-[#E22213]"
//                         : "bg-green-100 text-green-700"
//                     }`}
//                   >
//                     {getRemainingTime(exam.endTime)}
//                   </span>
//                 </div>

//                 <div className="space-y-3 mb-6">
//                   <div className="flex items-center text-gray-600">
//                     <Clock className="h-4 w-4 mr-2" />
//                     <span>Duration: {exam.duration} minutes</span>
//                   </div>
//                   <div className="flex items-center text-gray-600">
//                     <BookOpen className="h-4 w-4 mr-2" />
//                     <span>
//                       Available until: {new Date(exam.endTime).toLocaleString()}
//                     </span>
//                   </div>
//                 </div>

//                 <button
//                   onClick={() => handleStartExamClick(exam)}
//                   disabled={startingExamId === exam._id}
//                   className="w-full bg-[#EA8E0A] hover:bg-[#d17e08] text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   {startingExamId === exam._id ? (
//                     <>
//                       <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
//                       Starting...
//                     </>
//                   ) : (
//                     <>
//                       <Play className="h-5 w-5" />
//                       Start Exam
//                     </>
//                   )}
//                 </button>
//               </div>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* Instructions Modal */}
//       {showInstructionsModal && selectedExam && (
//         <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
//           <div className="bg-white rounded-xl shadow-xl max-w-lg w-full">
//             <div className="px-6 py-4 border-b">
//               <h2 className="text-lg font-semibold text-[#0B234A]">
//                 Exam Instructions
//               </h2>
//             </div>

//             <div className="p-6 space-y-4 text-sm text-gray-700">
//               <p>
//                 Please read the following instructions carefully before starting
//                 the exam:
//               </p>

//               <ul className="list-disc pl-5 space-y-2">
//                 <li>
//                   The exam duration is{" "}
//                   <strong>{selectedExam.duration} minutes</strong>.
//                 </li>
//                 <li>You cannot pause the exam once started.</li>
//                 <li>Do not refresh or close the browser during the exam.</li>
//                 <li>
//                   Each question may have negative marking (if applicable).
//                 </li>
//                 <li>The exam will auto-submit when time expires.</li>
//               </ul>

//               <div className="flex items-center mt-4">
//                 <input
//                   type="checkbox"
//                   checked={agreedToInstructions}
//                   onChange={(e) => setAgreedToInstructions(e.target.checked)}
//                   className="mr-2"
//                 />
//                 <label>I have read and agree to the instructions.</label>
//               </div>
//             </div>

//             <div className="px-6 py-4 border-t flex justify-end space-x-3">
//               <button
//                 onClick={() => setShowInstructionsModal(false)}
//                 className="px-4 py-2 border rounded-md"
//               >
//                 Cancel
//               </button>

//               <button
//                 onClick={confirmStartExam}
//                 disabled={!agreedToInstructions}
//                 className="px-4 py-2 bg-[#EA8E0A] text-white rounded-md disabled:opacity-50"
//               >
//                 Start Exam
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default StudentDashboard;

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
  const navigate = useNavigate();
  const { user } = useAuth();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startingExamId, setStartingExamId] = useState(null);
  const [filter, setFilter] = useState("all"); // all, available, expiring

  useEffect(() => {
    fetchAvailableExams();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Format time remaining
  const getRemainingTime = (endTime) => {
    const diff = new Date(endTime).getTime() - currentTime;

    if (diff <= 0) return "Expired";

    const totalSeconds = Math.floor(diff / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    }
    return `${minutes}m ${seconds}s`;
  };

  // Get status color based on remaining time
  const getTimeStatusColor = (endTime) => {
    const diff = new Date(endTime).getTime() - currentTime;
    if (diff <= 0) return "bg-gray-100 text-gray-600";
    if (diff < 30 * 60 * 1000) return "bg-red-100 text-[#E22213]";
    if (diff < 60 * 60 * 1000) return "bg-yellow-100 text-yellow-700";
    return "bg-green-100 text-green-700";
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

  // Filter exams based on selected filter
  const getFilteredExams = () => {
    switch (filter) {
      case "available":
        return exams.filter((e) => new Date(e.endTime).getTime() > currentTime);
      case "expiring":
        return exams.filter((e) => {
          const diff = new Date(e.endTime).getTime() - currentTime;
          return diff > 0 && diff < 60 * 60 * 1000;
        });
      default:
        return exams;
    }
  };

  const filteredExams = getFilteredExams();

  // Stats calculation
  const stats = {
    total: exams.length,
    available: exams.filter((e) => new Date(e.endTime).getTime() > currentTime)
      .length,
    expiring: exams.filter((e) => {
      const diff = new Date(e.endTime).getTime() - currentTime;
      return diff > 0 && diff < 60 * 60 * 1000;
    }).length,
    totalDuration: exams.reduce((acc, exam) => acc + exam.duration, 0),
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[#0B234A]">
                Welcome back, {user?.name || "Student"}! 👋
              </h1>
              <p className="text-gray-600 mt-2">
                Here's what's waiting for you today
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center space-x-2 text-sm text-gray-600">
              <Calendar className="h-4 w-4" />
              <span>
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Exams</p>
                <p className="text-3xl font-bold text-[#0B234A]">
                  {stats.total}
                </p>
                <p className="text-xs text-gray-500 mt-1">Scheduled exams</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <BookOpen className="h-6 w-6 text-[#0B234A]" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Available Now</p>
                <p className="text-3xl font-bold text-green-600">
                  {stats.available}
                </p>
                <p className="text-xs text-gray-500 mt-1">Ready to start</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Expiring Soon</p>
                <p className="text-3xl font-bold text-[#EA8E0A]">
                  {stats.expiring}
                </p>
                <p className="text-xs text-gray-500 mt-1">Within 1 hour</p>
              </div>
              <div className="p-3 bg-orange-50 rounded-lg">
                <Timer className="h-6 w-6 text-[#EA8E0A]" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Duration</p>
                <p className="text-3xl font-bold text-[#0B234A]">
                  {formatTime(stats.totalDuration)}
                </p>
                <p className="text-xs text-gray-500 mt-1">Combined time</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        {exams.length > 0 && (
          <div className="mb-6 flex space-x-2 overflow-x-auto pb-2">
            {["all", "available", "expiring"].map((filterOption) => (
              <button
                key={filterOption}
                onClick={() => setFilter(filterOption)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  filter === filterOption
                    ? "bg-[#0B234A] text-white"
                    : "bg-white text-gray-600 hover:bg-gray-100"
                }`}
              >
                {filterOption === "all" && "All Exams"}
                {filterOption === "available" && "Available Now"}
                {filterOption === "expiring" && "Expiring Soon"}
              </button>
            ))}
          </div>
        )}

        {/* Exams Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#EA8E0A] border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Loading your exams...</p>
          </div>
        ) : filteredExams.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <GraduationCap className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              No Exams Available
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              {filter === "all"
                ? "You don't have any exams scheduled at the moment. Check back later!"
                : filter === "available"
                  ? "No exams are currently available to start."
                  : "No exams are expiring within the next hour."}
            </p>
            {filter !== "all" && (
              <button
                onClick={() => setFilter("all")}
                className="mt-4 text-[#EA8E0A] hover:text-[#d17e08] font-medium"
              >
                View all exams →
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredExams.map((exam) => {
              const isExpiring =
                new Date(exam.endTime).getTime() - currentTime < 60 * 60 * 1000;

              const hasStarted =
                new Date(exam.startTime).getTime() <= currentTime;

              const isExpired = new Date(exam.endTime).getTime() <= currentTime;

              const canStart = hasStarted && !isExpired;

              return (
                <div
                  key={exam._id}
                  className="group bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300"
                >
                  {/* Progress Bar (if any) - Optional */}
                  <div className="h-1 bg-gray-100">
                    <div
                      className={`h-full transition-all duration-500 ${
                        isExpiring ? "bg-[#EA8E0A]" : "bg-green-500"
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
                            <span className="px-2 py-1 bg-red-100 text-[#E22213] text-xs font-medium rounded-full animate-pulse">
                              Urgent
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 flex items-center">
                          <BookOpen className="h-4 w-4 mr-1" />
                          {exam.subject}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1.5 rounded-full text-sm font-medium ${getTimeStatusColor(exam.endTime)}`}
                      >
                        {getRemainingTime(exam.endTime)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">Duration</p>
                        <p className="font-medium text-[#0B234A] flex items-center">
                          <Clock className="h-4 w-4 mr-1 text-gray-400" />
                          {exam.duration} min
                        </p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-500 mb-1">Questions</p>
                        <p className="font-medium text-[#0B234A] flex items-center">
                          <FileText className="h-4 w-4 mr-1 text-gray-400" />
                          {exam.totalQuestions || "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-500">
                        Ends: {new Date(exam.endTime).toLocaleTimeString()}
                      </div>
                      <button
                        onClick={() => handleStartExamClick(exam)}
                        disabled={startingExamId === exam._id || !canStart}
                        className={`px-6 py-2.5 rounded-lg font-medium flex items-center space-x-2 transition-all ${
                          !canStart
                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "bg-[#EA8E0A] hover:bg-[#d17e08] text-white hover:shadow-lg hover:scale-105"
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
                            <span>Start Exam</span>
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
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-slideUp">
              {/* Modal Header */}
              <div className="px-6 py-4 border-b bg-gradient-to-r from-[#0B234A] to-[#1a3a6e]">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <FileText className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">
                      Exam Instructions
                    </h2>
                    <p className="text-white/80 text-sm">
                      {selectedExam.title}
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-6">
                {/* Exam Summary */}
                <div className="bg-blue-50 rounded-lg p-4">
                  <h3 className="font-semibold text-[#0B234A] mb-3">
                    Exam Summary
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Duration</p>
                      <p className="font-medium text-[#0B234A]">
                        {selectedExam.duration} minutes
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Questions</p>
                      <p className="font-medium text-[#0B234A]">
                        {selectedExam.totalQuestions || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Maximum Marks</p>
                      <p className="font-medium text-[#0B234A]">
                        {selectedExam.totalMarks || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Instructions List */}
                <div>
                  <h3 className="font-semibold text-[#0B234A] mb-3">
                    Please read carefully:
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
                      <div key={index} className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          id={`instruction-${index}`}
                          checked={instructionsChecked[index] || false}
                          onChange={(e) => {
                            setInstructionsChecked({
                              ...instructionsChecked,
                              [index]: e.target.checked,
                            });
                            // Check if all instructions are checked
                            const allChecked =
                              Object.keys(instructionsChecked).length === 6 &&
                              Object.values(instructionsChecked).every(
                                (v) => v,
                              );
                            setAgreedToInstructions(allChecked);
                          }}
                          className="mt-1"
                        />
                        <label
                          htmlFor={`instruction-${index}`}
                          className="text-gray-700"
                        >
                          {instruction}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Agreement Checkbox */}
                <div className="border-t pt-4">
                  <div className="flex items-center space-x-3 bg-gray-50 p-4 rounded-lg">
                    <input
                      type="checkbox"
                      id="agree-all"
                      checked={agreedToInstructions}
                      onChange={(e) => {
                        setAgreedToInstructions(e.target.checked);
                        // Check/uncheck all instructions
                        const newCheckedState = {};
                        if (e.target.checked) {
                          for (let i = 0; i < 7; i++) {
                            newCheckedState[i] = true;
                          }
                        }
                        setInstructionsChecked(newCheckedState);
                      }}
                      className="w-5 h-5"
                    />
                    <label
                      htmlFor="agree-all"
                      className="text-gray-700 font-medium"
                    >
                      I have read and agree to all the instructions
                    </label>
                  </div>
                </div>

                {/* Important Notes */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-yellow-800">
                        Important Notes:
                      </p>
                      <ul className="text-sm text-yellow-700 mt-1 space-y-1 list-disc list-inside">
                        <li>Once started, you cannot restart the exam</li>
                        <li>
                          Make sure you have at least {selectedExam.duration}{" "}
                          minutes of free time
                        </li>
                        <li>Keep your system charged and connected to power</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t bg-gray-50 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                <button
                  onClick={() => setShowInstructionsModal(false)}
                  className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmStartExam}
                  disabled={!agreedToInstructions || startingExamId}
                  className="px-6 py-2.5 bg-[#EA8E0A] text-white rounded-lg hover:bg-[#d17e08] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                >
                  {startingExamId ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Starting...</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-4 w-4" />
                      <span>Start Exam Now</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add animation styles */}
      <style jsx>{`
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
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default StudentDashboard;
