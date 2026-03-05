// src/pages/admin/ResultsAdmin.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Award,
  TrendingUp,
  BarChart3,
  Calendar,
  Users,
  School
} from "lucide-react";
import { format } from "date-fns";

const ResultsAdmin = () => {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    school: "",
    exam: "",
    grade: "",
    status: "",
    search: ""
  });

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      const mockResults = [
        {
          id: "1",
          studentName: "John Doe",
          studentEmail: "john@example.com",
          examTitle: "Mathematics Final Exam",
          subject: "Mathematics",
          grade: "10",
          score: 85,
          totalMarks: 100,
          percentage: 85,
          status: "pass",
          submittedAt: "2024-01-15T11:45:00Z",
          school: "City Public School"
        },
        {
          id: "2",
          studentName: "Jane Smith",
          studentEmail: "jane@example.com",
          examTitle: "Science Mid-Term",
          subject: "Science",
          grade: "9",
          score: 42,
          totalMarks: 75,
          percentage: 56,
          status: "pass",
          submittedAt: "2024-01-14T10:30:00Z",
          school: "Green Valley School"
        },
        {
          id: "3",
          studentName: "Mike Johnson",
          studentEmail: "mike@example.com",
          examTitle: "English Literature Test",
          subject: "English",
          grade: "11",
          score: 18,
          totalMarks: 50,
          percentage: 36,
          status: "fail",
          submittedAt: "2024-01-13T15:15:00Z",
          school: "Riverside Academy"
        }
      ];
      setResults(mockResults);
    } catch (error) {
      console.error("Error fetching results:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredResults = results.filter(result => {
    if (filters.school && result.school !== filters.school) return false;
    if (filters.grade && result.grade !== filters.grade) return false;
    if (filters.status && result.status !== filters.status) return false;
    if (filters.search && !result.studentName.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  const schools = [...new Set(results.map(r => r.school))];
  const grades = [...new Set(results.map(r => r.grade))];

  // Calculate statistics
  const totalResults = results.length;
  const passedResults = results.filter(r => r.status === "pass").length;
  const failedResults = results.filter(r => r.status === "fail").length;
  const passRate = totalResults > 0 ? ((passedResults / totalResults) * 100).toFixed(1) : 0;
  const averagePercentage = results.length > 0
    ? (results.reduce((sum, r) => sum + r.percentage, 0) / results.length).toFixed(1)
    : 0;

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
          <h1 className="text-2xl font-bold text-gray-800">Exam Results</h1>
          <p className="text-gray-600 mt-1">View and analyze student performance across all schools</p>
        </div>
        <button className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2">
          <Download size={18} />
          Export All Results
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="text-[#0B234A]" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Results</p>
              <p className="text-2xl font-bold text-gray-800">{totalResults}</p>
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
              <p className="text-2xl font-bold text-gray-800">{passedResults}</p>
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
              <p className="text-2xl font-bold text-gray-800">{failedResults}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <Award className="text-purple-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Pass Rate</p>
              <p className="text-2xl font-bold text-gray-800">{passRate}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Performance Overview</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Pass Rate</span>
                <span className="font-medium text-gray-800">{passRate}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 rounded-full h-2"
                  style={{ width: `${passRate}%` }}
                ></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Average Score</span>
                <span className="font-medium text-gray-800">{averagePercentage}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 rounded-full h-2"
                  style={{ width: `${averagePercentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <button className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 text-left">
              <BarChart3 size={20} className="text-[#0B234A] mb-2" />
              <p className="font-medium text-gray-800">Analytics</p>
              <p className="text-xs text-gray-600">View detailed analytics</p>
            </button>
            <button className="p-3 bg-gray-50 rounded-lg hover:bg-gray-100 text-left">
              <Download size={20} className="text-[#0B234A] mb-2" />
              <p className="font-medium text-gray-800">Export</p>
              <p className="text-xs text-gray-600">Download all results</p>
            </button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search by student name..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B234A]"
            />
          </div>
          <select
            value={filters.school}
            onChange={(e) => setFilters({ ...filters, school: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B234A]"
          >
            <option value="">All Schools</option>
            {schools.map(school => (
              <option key={school} value={school}>{school}</option>
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
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B234A]"
          >
            <option value="">All Status</option>
            <option value="pass">Pass</option>
            <option value="fail">Fail</option>
          </select>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
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
                  School
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
              {filteredResults.map((result) => (
                <tr key={result.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-800">{result.studentName}</p>
                      <p className="text-xs text-gray-600">{result.studentEmail}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-800">{result.examTitle}</p>
                      <p className="text-xs text-gray-600">{result.subject}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">{result.school}</td>
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
                    {result.status === "pass" ? (
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
                    {format(new Date(result.submittedAt), "MMM dd, yyyy")}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => navigate(`/admin/students/${result.id}`)}
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

        {filteredResults.length === 0 && (
          <div className="p-12 text-center">
            <Award className="mx-auto text-gray-400 mb-3" size={48} />
            <p className="text-gray-600">No results found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultsAdmin;