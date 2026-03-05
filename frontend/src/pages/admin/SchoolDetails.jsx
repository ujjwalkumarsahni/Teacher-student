// src/pages/admin/SchoolDetails.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  FileText,
  BookOpen,
  Award,
  Download,
  Filter,
  Search,
  Calendar,
  TrendingUp,
  Mail,
  Phone,
  MapPin,
  Edit,
  Trash2,
  Eye,
  ChevronDown,
  BarChart3,
  PieChart,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react";
import {
  getStudentsBySchool,
  getSchoolExams,
  getGradeWiseStudents,
  getSchoolResults
} from "../../services/adminService";
import { format } from "date-fns";

const SchoolDetails = () => {
  const { schoolId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [schoolData, setSchoolData] = useState(null);
  const [students, setStudents] = useState([]);
  const [exams, setExams] = useState([]);
  const [gradeData, setGradeData] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    grade: "",
    examId: "",
    search: ""
  });

  useEffect(() => {
    fetchSchoolData();
  }, [schoolId]);

  const fetchSchoolData = async () => {
    try {
      setLoading(true);
      const [studentsRes, examsRes, gradesRes, resultsRes] = await Promise.all([
        getStudentsBySchool(schoolId),
        getSchoolExams(schoolId),
        getGradeWiseStudents(schoolId),
        getSchoolResults(schoolId)
      ]);

      setStudents(studentsRes.students || []);
      setExams(examsRes.exams || []);
      setGradeData(gradesRes.grades || []);
      setResults(resultsRes.results || []);
      
      // Mock school data - replace with actual API call
      setSchoolData({
        id: schoolId,
        name: "City Public School",
        address: "123 Education Street, New York, NY 10001",
        phone: "+1 (555) 123-4567",
        email: "info@citypublic.edu",
        principal: "Dr. Sarah Johnson",
        established: "1985",
        totalStudents: 1250,
        totalTeachers: 85,
        totalExams: 48,
        averagePerformance: 78.5
      });
    } catch (error) {
      console.error("Error fetching school data:", error);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "students", label: "Students", icon: Users },
    { id: "exams", label: "Exams", icon: FileText },
    { id: "results", label: "Results", icon: Award },
    { id: "analytics", label: "Analytics", icon: TrendingUp }
  ];

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
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/admin")}
          className="p-2 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{schoolData?.name}</h1>
          <p className="text-gray-600 mt-1">School ID: {schoolId}</p>
        </div>
      </div>

      {/* School Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="text-[#0B234A]" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-800">{schoolData?.totalStudents}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <FileText className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Exams</p>
              <p className="text-2xl font-bold text-gray-800">{schoolData?.totalExams}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Award className="text-purple-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Avg. Performance</p>
              <p className="text-2xl font-bold text-gray-800">{schoolData?.averagePerformance}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Calendar className="text-orange-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Established</p>
              <p className="text-2xl font-bold text-gray-800">{schoolData?.established}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Contact Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <MapPin size={18} className="text-gray-400" />
            <span className="text-gray-600">{schoolData?.address}</span>
          </div>
          <div className="flex items-center gap-3">
            <Phone size={18} className="text-gray-400" />
            <span className="text-gray-600">{schoolData?.phone}</span>
          </div>
          <div className="flex items-center gap-3">
            <Mail size={18} className="text-gray-400" />
            <span className="text-gray-600">{schoolData?.email}</span>
          </div>
          <div className="flex items-center gap-3">
            <Users size={18} className="text-gray-400" />
            <span className="text-gray-600">Principal: {schoolData?.principal}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-4 px-2 flex items-center gap-2 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-[#0B234A] text-[#0B234A]"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Grade Distribution */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Grade Distribution</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {gradeData.map((grade) => (
                  <div key={grade._id} className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">Grade {grade._id}</p>
                    <p className="text-2xl font-bold text-gray-800 mt-1">{grade.count}</p>
                    <p className="text-xs text-gray-500 mt-2">students</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Exams */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Exams</h3>
              <div className="space-y-4">
                {exams.slice(0, 5).map((exam) => (
                  <div key={exam._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-800">{exam.title}</h4>
                      <p className="text-sm text-gray-600 mt-1">
                        {exam.subject} • Grade {exam.grade} • {exam.questionCount} questions
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-800">
                        {exam.startTime ? format(new Date(exam.startTime), "MMM dd, yyyy") : "Date TBD"}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {exam.status === "published" ? (
                          <span className="text-green-600 flex items-center gap-1">
                            <CheckCircle size={12} /> Published
                          </span>
                        ) : (
                          <span className="text-orange-600 flex items-center gap-1">
                            <Clock size={12} /> Draft
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === "students" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">Students List</h3>
                <div className="flex gap-3">
                  <select
                    value={filters.grade}
                    onChange={(e) => setFilters({ ...filters, grade: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B234A]"
                  >
                    <option value="">All Grades</option>
                    {gradeData.map((g) => (
                      <option key={g._id} value={g._id}>Grade {g._id}</option>
                    ))}
                  </select>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                    <input
                      type="text"
                      placeholder="Search students..."
                      value={filters.search}
                      onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B234A]"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Grade
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Exams Taken
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Avg. Score
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {students.map((student) => (
                    <tr key={student._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                            <span className="text-orange-600 font-medium">
                              {student.user?.name?.charAt(0) || "S"}
                            </span>
                          </div>
                          <span className="font-medium text-gray-800">{student.user?.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">Grade {student.grade}</td>
                      <td className="px-6 py-4 text-gray-600">{student.user?.email}</td>
                      <td className="px-6 py-4">12</td>
                      <td className="px-6 py-4">
                        <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                          78%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => navigate(`/admin/students/${student._id}`)}
                          className="text-[#0B234A] hover:text-[#0B234A]/80 font-medium"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "exams" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">School Exams</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {exams.map((exam) => (
                <div key={exam._id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800">{exam.title}</h4>
                      <div className="flex gap-4 mt-2 text-sm text-gray-600">
                        <span>Subject: {exam.subject}</span>
                        <span>Grade: {exam.grade}</span>
                        <span>Questions: {exam.questionCount}</span>
                        <span>Duration: {exam.duration} mins</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        exam.status === "published"
                          ? "bg-green-100 text-green-700"
                          : "bg-orange-100 text-orange-700"
                      }`}>
                        {exam.status}
                      </span>
                      <button
                        onClick={() => navigate(`/admin/exams/${exam._id}`)}
                        className="px-4 py-2 bg-[#0B234A] text-white rounded-lg hover:bg-[#0B234A]/90"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === "results" && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-6 border-b border-gray-100">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-800">Exam Results</h3>
                <div className="flex gap-3">
                  <select
                    value={filters.examId}
                    onChange={(e) => setFilters({ ...filters, examId: e.target.value })}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B234A]"
                  >
                    <option value="">All Exams</option>
                    {exams.map((exam) => (
                      <option key={exam._id} value={exam._id}>{exam.title}</option>
                    ))}
                  </select>
                  <button className="px-4 py-2 bg-[#0B234A] text-white rounded-lg hover:bg-[#0B234A]/90">
                    Export Results
                  </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Exam
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
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {results.map((result, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                            <span className="text-orange-600 font-medium">
                              {result.studentName?.charAt(0) || "S"}
                            </span>
                          </div>
                          <span className="font-medium text-gray-800">{result.studentName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">{result.examTitle}</td>
                      <td className="px-6 py-4">Grade {result.grade}</td>
                      <td className="px-6 py-4">{result.score}/{result.totalMarks}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-full text-sm ${
                          result.percentage >= 75
                            ? "bg-green-100 text-green-700"
                            : result.percentage >= 40
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                        }`}>
                          {result.percentage}%
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {result.percentage >= 40 ? (
                          <span className="flex items-center gap-1 text-green-600">
                            <CheckCircle size={16} /> Pass
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-red-600">
                            <XCircle size={16} /> Fail
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === "analytics" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Performance Trends</h3>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Chart coming soon...</p>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Subject-wise Performance</h3>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Chart coming soon...</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SchoolDetails;