// src/pages/admin/AllExamsAdmin.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  Plus,
  Calendar,
  Clock,
  Users,
  FileText,
  Eye,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Download,
  Award 
} from "lucide-react";
import { format } from "date-fns";

const AllExamsAdmin = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "",
    subject: "",
    grade: "",
    search: ""
  });

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockExams = [
        {
          _id: "1",
          title: "Mathematics Final Exam",
          subject: "Mathematics",
          grade: "10",
          duration: 120,
          totalMarks: 100,
          questionCount: 25,
          status: "published",
          startTime: "2024-01-15T10:00:00Z",
          endTime: "2024-01-15T12:00:00Z",
          school: "City Public School",
          studentsAttempted: 45,
          averageScore: 78
        },
        {
          _id: "2",
          title: "Science Mid-Term",
          subject: "Science",
          grade: "9",
          duration: 90,
          totalMarks: 75,
          questionCount: 30,
          status: "draft",
          startTime: "2024-02-20T09:00:00Z",
          endTime: "2024-02-20T10:30:00Z",
          school: "Green Valley School",
          studentsAttempted: 0,
          averageScore: 0
        },
        {
          _id: "3",
          title: "English Literature Test",
          subject: "English",
          grade: "11",
          duration: 60,
          totalMarks: 50,
          questionCount: 20,
          status: "published",
          startTime: "2024-01-10T14:00:00Z",
          endTime: "2024-01-10T15:00:00Z",
          school: "Riverside Academy",
          studentsAttempted: 32,
          averageScore: 82
        },
        {
          _id: "4",
          title: "Physics Practical Exam",
          subject: "Physics",
          grade: "12",
          duration: 180,
          totalMarks: 150,
          questionCount: 15,
          status: "scheduled",
          startTime: "2024-03-05T13:00:00Z",
          endTime: "2024-03-05T16:00:00Z",
          school: "City Public School",
          studentsAttempted: 0,
          averageScore: 0
        },
        {
          _id: "5",
          title: "Chemistry Quiz",
          subject: "Chemistry",
          grade: "10",
          duration: 45,
          totalMarks: 30,
          questionCount: 15,
          status: "completed",
          startTime: "2024-01-05T11:00:00Z",
          endTime: "2024-01-05T11:45:00Z",
          school: "Green Valley School",
          studentsAttempted: 28,
          averageScore: 85
        }
      ];
      setExams(mockExams);
    } catch (error) {
      console.error("Error fetching exams:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-700";
      case "draft":
        return "bg-gray-100 text-gray-700";
      case "scheduled":
        return "bg-blue-100 text-blue-700";
      case "completed":
        return "bg-purple-100 text-purple-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const filteredExams = exams.filter(exam => {
    if (filters.status && exam.status !== filters.status) return false;
    if (filters.subject && exam.subject !== filters.subject) return false;
    if (filters.grade && exam.grade !== filters.grade) return false;
    if (filters.search && !exam.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  const subjects = [...new Set(exams.map(e => e.subject))];
  const grades = [...new Set(exams.map(e => e.grade))];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">All Exams</h1>
          <p className="text-gray-600 mt-1">Manage and monitor all exams across schools</p>
        </div>
        <button
          onClick={() => navigate("/employee/create-exam")}
          className="px-4 py-2 bg-[#0B234A] text-white rounded-lg hover:bg-[#0B234A]/90 flex items-center gap-2"
        >
          <Plus size={18} />
          Create New Exam
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search exams..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B234A]"
            />
          </div>
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B234A]"
          >
            <option value="">All Status</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
            <option value="scheduled">Scheduled</option>
            <option value="completed">Completed</option>
          </select>
          <select
            value={filters.subject}
            onChange={(e) => setFilters({ ...filters, subject: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B234A]"
          >
            <option value="">All Subjects</option>
            {subjects.map(subject => (
              <option key={subject} value={subject}>{subject}</option>
            ))}
          </select>
          <select
            value={filters.grade}
            onChange={(e) => setFilters({ ...filters, grade: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B234A]"
          >
            <option value="">All Grades</option>
            {grades.map(grade => (
              <option key={grade} value={grade}>Grade {grade}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Exams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExams.map((exam) => (
          <div
            key={exam._id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(exam.status)}`}>
                    {exam.status.charAt(0).toUpperCase() + exam.status.slice(1)}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <Edit size={16} className="text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <Trash2 size={16} className="text-red-600" />
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-800 mb-2">{exam.title}</h3>
              
              <div className="space-y-2 mb-4">
                <p className="text-sm text-gray-600">{exam.subject} • Grade {exam.grade}</p>
                <p className="text-sm text-gray-600">{exam.school}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-gray-50 rounded-lg p-2">
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <Clock size={12} />
                    Duration
                  </div>
                  <p className="font-medium text-gray-800">{exam.duration} min</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <FileText size={12} />
                    Questions
                  </div>
                  <p className="font-medium text-gray-800">{exam.questionCount}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <Users size={12} />
                    Attempted
                  </div>
                  <p className="font-medium text-gray-800">{exam.studentsAttempted}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <Award size={12} />
                    Avg. Score
                  </div>
                  <p className="font-medium text-gray-800">{exam.averageScore}%</p>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <Calendar size={12} />
                    {exam.startTime ? format(new Date(exam.startTime), "MMM dd, yyyy") : "Date TBD"}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-600">
                    <Clock size={12} />
                    {exam.startTime ? format(new Date(exam.startTime), "hh:mm a") : "Time TBD"}
                  </div>
                </div>
                <button
                  onClick={() => navigate(`/admin/exams/${exam._id}`)}
                  className="w-full px-4 py-2 bg-[#0B234A] text-white rounded-lg hover:bg-[#0B234A]/90 flex items-center justify-center gap-2"
                >
                  <Eye size={16} />
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredExams.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center border border-gray-100">
          <FileText className="mx-auto text-gray-400 mb-3" size={48} />
          <h3 className="text-lg font-medium text-gray-800 mb-2">No exams found</h3>
          <p className="text-gray-600 mb-4">Try adjusting your filters or create a new exam</p>
          <button
            onClick={() => navigate("/employee/create-exam")}
            className="px-4 py-2 bg-[#0B234A] text-white rounded-lg hover:bg-[#0B234A]/90 inline-flex items-center gap-2"
          >
            <Plus size={18} />
            Create New Exam
          </button>
        </div>
      )}
    </div>
  );
};

export default AllExamsAdmin;