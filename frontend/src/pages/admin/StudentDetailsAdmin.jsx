// src/pages/admin/StudentDetailsAdmin.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  BookOpen,
  Award,
  Calendar,
  TrendingUp,
  Download,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  Clock,
  User
} from "lucide-react";
import { getStudentDetails } from "../../services/adminService";
import { format } from "date-fns";

const StudentDetailsAdmin = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [studentData, setStudentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("all");

  useEffect(() => {
    fetchStudentDetails();
  }, [studentId]);

  const fetchStudentDetails = async () => {
    try {
      setLoading(true);
      const data = await getStudentDetails(studentId);
      setStudentData(data);
    } catch (error) {
      console.error("Error fetching student details:", error);
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

  if (!studentData) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Student not found</p>
        </div>
      </div>
    );
  }

  const { student, examHistory, totalExams } = studentData;

  // Calculate statistics
  const averageScore = examHistory.length > 0
    ? (examHistory.reduce((sum, exam) => sum + parseFloat(exam.percentage), 0) / examHistory.length).toFixed(2)
    : 0;

  const passedExams = examHistory.filter(exam => parseFloat(exam.percentage) >= 40).length;
  const failedExams = examHistory.length - passedExams;

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
            <h1 className="text-2xl font-bold text-gray-800">{student.name}</h1>
            <p className="text-gray-600 mt-1">Student ID: {studentId}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2">
            <Edit size={18} />
            Edit
          </button>
          <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2">
            <Trash2 size={18} />
            Delete
          </button>
        </div>
      </div>

      {/* Student Info Card */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex items-start gap-6">
          <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center">
            <span className="text-3xl font-bold text-orange-600">
              {student.name?.charAt(0) || "S"}
            </span>
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-800">{student.name}</h2>
            <p className="text-gray-600 mt-1">{student.email}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="flex items-center gap-2">
                <BookOpen size={18} className="text-gray-400" />
                <span className="text-gray-600">Grade {student.grade}</span>
              </div>
              <div className="flex items-center gap-2">
                <User size={18} className="text-gray-400" />
                <span className="text-gray-600">{student.school}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-gray-400" />
                <span className="text-gray-600">Joined: Jan 2024</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <BookOpen className="text-[#0B234A]" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Exams Taken</p>
              <p className="text-2xl font-bold text-gray-800">{totalExams}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Award className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Average Score</p>
              <p className="text-2xl font-bold text-gray-800">{averageScore}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Passed</p>
              <p className="text-2xl font-bold text-gray-800">{passedExams}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="text-red-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Failed</p>
              <p className="text-2xl font-bold text-gray-800">{failedExams}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Exam History */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">Exam History</h2>
            <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2">
              <Download size={18} />
              Export History
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Exam
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Subject
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Grade
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Score
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Percentage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {examHistory.map((exam, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-800">{exam.examTitle}</td>
                  <td className="px-6 py-4 text-gray-600">{exam.subject}</td>
                  <td className="px-6 py-4">Grade {exam.grade}</td>
                  <td className="px-6 py-4">{exam.score}/{exam.totalMarks}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-sm ${
                      exam.percentage >= 75
                        ? "bg-green-100 text-green-700"
                        : exam.percentage >= 40
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}>
                      {exam.percentage}%
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {exam.percentage >= 40 ? (
                      <span className="flex items-center gap-1 text-green-600">
                        <CheckCircle size={16} /> Pass
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-red-600">
                        <XCircle size={16} /> Fail
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {format(new Date(exam.submittedAt), "MMM dd, yyyy")}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => navigate(`/admin/exams/${exam._id}`)}
                      className="text-[#0B234A] hover:text-[#0B234A]/80 font-medium"
                    >
                      View Exam
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {examHistory.length === 0 && (
          <div className="p-12 text-center">
            <BookOpen className="mx-auto text-gray-400 mb-3" size={48} />
            <p className="text-gray-600">No exam history found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDetailsAdmin;