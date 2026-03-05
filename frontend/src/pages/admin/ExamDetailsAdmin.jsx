// src/pages/admin/ExamDetailsAdmin.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Clock,
  Calendar,
  Users,
  FileText,
  Award,
  Download,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertCircle,
  BarChart3,
  PieChart,
  TrendingUp,
  Eye
} from "lucide-react";
import { getExamDetails } from "../../services/adminService";
import { format } from "date-fns";

const ExamDetailsAdmin = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const [examData, setExamData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    fetchExamDetails();
  }, [examId]);

  const fetchExamDetails = async () => {
    try {
      setLoading(true);
      const data = await getExamDetails(examId);
      setExamData(data);
    } catch (error) {
      console.error("Error fetching exam details:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!examData) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Exam not found</p>
        </div>
      </div>
    );
  }

  const { exam, stats, questions } = examData;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{exam.title}</h1>
            <p className="text-gray-600 mt-1">Exam ID: {examId}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2">
            <Edit size={18} />
            Edit Exam
          </button>
          <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2">
            <Trash2 size={18} />
            Delete
          </button>
        </div>
      </div>

      {/* Status Banner */}
      <div className={`rounded-lg p-4 ${
        exam.status === "published" 
          ? "bg-green-50 border border-green-200" 
          : "bg-orange-50 border border-orange-200"
      }`}>
        <div className="flex items-center gap-3">
          {exam.status === "published" ? (
            <CheckCircle className="text-green-600" size={24} />
          ) : (
            <AlertCircle className="text-orange-600" size={24} />
          )}
          <div>
            <p className={`font-medium ${
              exam.status === "published" ? "text-green-800" : "text-orange-800"
            }`}>
              Exam Status: {exam.status.charAt(0).toUpperCase() + exam.status.slice(1)}
            </p>
            <p className={`text-sm ${
              exam.status === "published" ? "text-green-600" : "text-orange-600"
            }`}>
              {exam.status === "published" 
                ? "This exam is live and available for students" 
                : "This exam is in draft mode and not visible to students"}
            </p>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="text-[#0B234A]" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Questions</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalQuestions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Award className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Marks</p>
              <p className="text-2xl font-bold text-gray-800">{stats.totalMarks}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="text-purple-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Students Attempted</p>
              <p className="text-2xl font-bold text-gray-800">45</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="text-orange-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg. Score</p>
              <p className="text-2xl font-bold text-gray-800">78%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Exam Details */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Exam Details</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-600">Subject</p>
            <p className="font-medium text-gray-800 mt-1">{exam.subject}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Grade</p>
            <p className="font-medium text-gray-800 mt-1">Grade {exam.grade}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Duration</p>
            <p className="font-medium text-gray-800 mt-1 flex items-center gap-1">
              <Clock size={16} className="text-gray-400" />
              {exam.duration} minutes
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Start Time</p>
            <p className="font-medium text-gray-800 mt-1 flex items-center gap-1">
              <Calendar size={16} className="text-gray-400" />
              {exam.startTime ? format(new Date(exam.startTime), "MMM dd, yyyy hh:mm a") : "Not set"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">End Time</p>
            <p className="font-medium text-gray-800 mt-1 flex items-center gap-1">
              <Calendar size={16} className="text-gray-400" />
              {exam.endTime ? format(new Date(exam.endTime), "MMM dd, yyyy hh:mm a") : "Not set"}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Created By</p>
            <p className="font-medium text-gray-800 mt-1">{exam.createdBy || "Unknown"}</p>
          </div>
        </div>
        {exam.description && (
          <div className="mt-4">
            <p className="text-sm text-gray-600">Description</p>
            <p className="text-gray-800 mt-1">{exam.description}</p>
          </div>
        )}
      </div>

      {/* Questions Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">Questions</h2>
            <button className="px-4 py-2 bg-[#0B234A] text-white rounded-lg hover:bg-[#0B234A]/90">
              Add Question
            </button>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {questions.map((question, index) => (
            <div key={question._id} className="p-6 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-6 h-6 bg-[#0B234A] text-white rounded-full flex items-center justify-center text-sm">
                      {index + 1}
                    </span>
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                      {question.type}
                    </span>
                    <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">
                      {question.marks} marks
                    </span>
                  </div>
                  <p className="text-gray-800 font-medium">{question.text}</p>
                  
                  {question.type === "multiple_choice" && question.options && (
                    <div className="mt-3 space-y-2">
                      {question.options.map((option, optIndex) => (
                        <div key={optIndex} className="flex items-center gap-2">
                          <span className={`w-5 h-5 rounded-full border flex items-center justify-center text-xs ${
                            optIndex === question.correctOption
                              ? "border-green-500 bg-green-50 text-green-600"
                              : "border-gray-300"
                          }`}>
                            {String.fromCharCode(65 + optIndex)}
                          </span>
                          <span className={optIndex === question.correctOption ? "text-green-600 font-medium" : "text-gray-600"}>
                            {option}
                          </span>
                          {optIndex === question.correctOption && (
                            <CheckCircle size={14} className="text-green-600" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2 ml-4">
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <Edit size={18} className="text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg">
                    <Trash2 size={18} className="text-red-600" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Results Summary */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Results Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Highest Score</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">98%</p>
            <p className="text-xs text-gray-500 mt-2">Student: John Doe</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Lowest Score</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">35%</p>
            <p className="text-xs text-gray-500 mt-2">Student: Jane Smith</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">Pass Rate</p>
            <p className="text-2xl font-bold text-gray-800 mt-1">82%</p>
            <p className="text-xs text-gray-500 mt-2">37 out of 45 students</p>
          </div>
        </div>
        <button
          onClick={() => navigate(`/admin/exam-results/${examId}`)}
          className="w-full px-4 py-3 bg-[#0B234A] text-white rounded-lg hover:bg-[#0B234A]/90 flex items-center justify-center gap-2"
        >
          <Eye size={18} />
          View Detailed Results
        </button>
      </div>
    </div>
  );
};

export default ExamDetailsAdmin;