// src/pages/admin/AdminDashboard.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  School,
  Users,
  FileText,
  TrendingUp,
  Calendar,
  ArrowRight,
  Download,
  Filter,
  Search,
  BookOpen,
  Award,
  Clock,
  CheckCircle,
  Trophy,
  UserPlus,
  Mail,
  GraduationCap
} from "lucide-react";
import { getAdminDashboard } from "../../services/adminService";
import { format, formatDistanceToNow } from "date-fns";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSchool, setSelectedSchool] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const data = await getAdminDashboard();
      setDashboardData(data);
    } catch (err) {
      setError(err.message);
      console.error("Dashboard error:", err);
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

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">Error: {error}</p>
        </div>
      </div>
    );
  }

  const { overview, schools, topRankers, recentStudents, recentExams } = dashboardData || {
    overview: { totalSchools: 0, totalStudents: 0, totalExams: 0 },
    schools: [],
    topRankers: [],
    recentStudents: [],
    recentExams: []
  };

  // Filter schools based on search
  const filteredSchools = schools.filter(school =>
    school.schoolName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (school.city && school.city.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Create a map of rankers by school for easy access
  const rankersMap = {};
  topRankers.forEach(schoolRanker => {
    rankersMap[schoolRanker.schoolId] = schoolRanker.rankers;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back! Here's what's happening across all schools.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2">
            <Download size={18} />
            Export Report
          </button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Schools</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{overview.totalSchools}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <School className="text-[#0B234A]" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Students</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{overview.totalStudents}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="text-green-600" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Exams</p>
              <p className="text-3xl font-bold text-gray-800 mt-1">{overview.totalExams}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <FileText className="text-orange-600" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Schools List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-800">Schools Overview</h2>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Search schools..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B234A] focus:border-transparent"
              />
            </div>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {filteredSchools.map((school) => {
            const schoolRankers = rankersMap[school.schoolId] || [];
            
            return (
              <div
                key={school.schoolId}
                className="p-6 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => navigate(`/admin/schools/${school.schoolId}`)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800">{school.schoolName}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {school.city || "City not specified"} • School ID: {school.schoolId.slice(-6)}
                    </p>
                    
                    {/* Top Rankers Preview */}
                    {schoolRankers.length > 0 && (
                      <div className="mt-3 flex items-center gap-2">
                        <Trophy size={16} className="text-yellow-500" />
                        <span className="text-xs text-gray-600">Top Scorers:</span>
                        <div className="flex -space-x-2">
                          {schoolRankers.slice(0, 3).map((ranker, idx) => (
                            <div
                              key={idx}
                              className="w-6 h-6 rounded-full bg-orange-100 border-2 border-white flex items-center justify-center"
                              title={`${ranker.studentName} - ${ranker.score} marks`}
                            >
                              <span className="text-xs font-medium text-orange-600">
                                {ranker.studentName?.charAt(0) || '?'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Students</p>
                      <p className="text-xl font-semibold text-gray-800">{school.totalStudents}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-600">Exams</p>
                      <p className="text-xl font-semibold text-gray-800">{school.totalExams}</p>
                    </div>
                    <button className="p-2 hover:bg-gray-200 rounded-lg">
                      <ArrowRight size={18} className="text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredSchools.length === 0 && (
            <div className="p-12 text-center">
              <School className="mx-auto text-gray-400 mb-3" size={48} />
              <p className="text-gray-600">No schools found</p>
            </div>
          )}
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Students */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800">Recent Students</h2>
              <UserPlus size={18} className="text-gray-400" />
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {recentStudents.map((student, index) => (
              <div key={index} className="p-4 hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-orange-600 font-medium">
                      {student.name?.charAt(0) || 'S'}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate">{student.name}</p>
                    <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                      <Mail size={12} />
                      <span className="truncate">{student.email}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs">
                      <span className="text-gray-500">{student.school}</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-500">Grade {student.grade}</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-500">
                        {formatDistanceToNow(new Date(student.registeredAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {recentStudents.length === 0 && (
              <div className="p-8 text-center">
                <Users className="mx-auto text-gray-400 mb-2" size={32} />
                <p className="text-gray-600">No recent students</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Exams */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-800">Recent Exams</h2>
              <BookOpen size={18} className="text-gray-400" />
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {recentExams.map((exam, index) => (
              <div key={index} className="p-4 hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <FileText className="text-[#0B234A]" size={20} />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-800">{exam.title}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs">
                      <span className="text-gray-600">{exam.subject}</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-600">Grade {exam.grade}</span>
                      <span className="text-gray-400">•</span>
                      <span className="text-gray-600">{exam.school}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Created {formatDistanceToNow(new Date(exam.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {recentExams.length === 0 && (
              <div className="p-8 text-center">
                <FileText className="mx-auto text-gray-400 mb-2" size={32} />
                <p className="text-gray-600">No recent exams</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Top Rankers Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Trophy className="text-yellow-500" size={20} />
            <h2 className="text-lg font-semibold text-gray-800">Top Performers Across Schools</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
          {topRankers.map((schoolRanker) => (
            schoolRanker.rankers.length > 0 && (
              <div key={schoolRanker.schoolId} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-800 mb-3">{schoolRanker.schoolName}</h3>
                <div className="space-y-3">
                  {schoolRanker.rankers.slice(0, 3).map((ranker, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                        ${idx === 0 ? 'bg-yellow-100 text-yellow-700' : 
                          idx === 1 ? 'bg-gray-100 text-gray-700' : 
                          'bg-orange-100 text-orange-700'}`}>
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{ranker.studentName}</p>
                        <p className="text-xs text-gray-600">{ranker.examTitle} • {ranker.subject}</p>
                      </div>
                      <div className="text-sm font-semibold text-[#0B234A]">
                        {ranker.score}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )
          ))}

          {topRankers.every(sr => sr.rankers.length === 0) && (
            <div className="col-span-full p-8 text-center">
              <Trophy className="mx-auto text-gray-400 mb-2" size={32} />
              <p className="text-gray-600">No rankers data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;