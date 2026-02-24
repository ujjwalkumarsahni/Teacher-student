// src/pages/employee/ExamResults.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  CheckCircle,
  XCircle,
  Clock,
  Award,
  Users,
  TrendingUp,
  Download,
  CheckSquare,
  FileText,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  UserCheck,
  UserX
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import {
  getExamResultsForVerification,
  verifyStudentResult,
  verifyAllResults
} from "../../services/resultService";
import toast from "react-hot-toast";

const ExamResults = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [examData, setExamData] = useState(null);
  const [results, setResults] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all"); // all, verified, pending, passed, failed
  const [verifyingId, setVerifyingId] = useState(null);
  const [remarks, setRemarks] = useState({});
  const [expandedRows, setExpandedRows] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: "studentName", direction: "asc" });

  useEffect(() => {
    fetchResults();
  }, [examId]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const response = await getExamResultsForVerification(examId);
      setExamData(response.exam);
      setResults(response.results);
      setStatistics(response.statistics);
      
      // Initialize remarks object
      const remarksObj = {};
      response.results.forEach(r => {
        remarksObj[r.attemptId] = r.remarks || "";
      });
      setRemarks(remarksObj);
    } catch (error) {
      toast.error(error.message || "Failed to fetch results");
      navigate("/employee/exams");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (attemptId) => {
    try {
      setVerifyingId(attemptId);
      await verifyStudentResult(attemptId, remarks[attemptId]);
      toast.success("Result verified successfully");
      fetchResults(); // Refresh data
    } catch (error) {
      toast.error(error.message || "Failed to verify result");
    } finally {
      setVerifyingId(null);
    }
  };

  const handleVerifyAll = async () => {
    const pendingCount = results.filter(r => !r.isVerified).length;
    if (pendingCount === 0) {
      toast.error("No pending results to verify");
      return;
    }

    if (!window.confirm(`Are you sure you want to verify all ${pendingCount} pending results?`)) {
      return;
    }

    try {
      const response = await verifyAllResults(examId);
      toast.success(response.message);
      fetchResults();
    } catch (error) {
      toast.error(error.message || "Failed to verify all results");
    }
  };

  const handleRemarksChange = (attemptId, value) => {
    setRemarks(prev => ({
      ...prev,
      [attemptId]: value
    }));
  };

  const toggleRowExpand = (attemptId) => {
    setExpandedRows(prev => ({
      ...prev,
      [attemptId]: !prev[attemptId]
    }));
  };

  const handleSort = (key) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === "asc" ? "desc" : "asc"
    });
  };

  // Filter and sort results
  const filteredResults = results.filter(result => {
    const matchesSearch = 
      result.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      result.studentEmail?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filter === "verified") return matchesSearch && result.isVerified;
    if (filter === "pending") return matchesSearch && !result.isVerified;
    if (filter === "passed") return matchesSearch && parseFloat(result.percentage) >= 33;
    if (filter === "failed") return matchesSearch && parseFloat(result.percentage) < 33;
    return matchesSearch;
  }).sort((a, b) => {
    const aVal = a[sortConfig.key];
    const bVal = b[sortConfig.key];
    
    if (sortConfig.key === "percentage") {
      return sortConfig.direction === "asc" 
        ? parseFloat(a.percentage) - parseFloat(b.percentage)
        : parseFloat(b.percentage) - parseFloat(a.percentage);
    }
    
    if (typeof aVal === "string") {
      return sortConfig.direction === "asc" 
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }
    
    return sortConfig.direction === "asc" ? aVal - bVal : bVal - aVal;
  });

  const getScoreColor = (percentage) => {
    if (percentage >= 75) return "text-green-600";
    if (percentage >= 33) return "text-yellow-600";
    return "text-red-600";
  };

  const getStatusBadge = (percentage) => {
    if (percentage >= 33) {
      return {
        text: "PASS",
        bg: "bg-green-100",
        textColor: "text-green-800",
        icon: CheckCircle
      };
    }
    return {
      text: "FAIL",
      bg: "bg-red-100",
      textColor: "text-red-800",
      icon: XCircle
    };
  };

  const exportToCSV = () => {
    const headers = [
      "Student Name",
      "Email",
      "Score",
      "Total Marks",
      "Percentage",
      "Status",
      "Verified",
      "Verified Date",
      "Remarks"
    ];
    
    const csvData = filteredResults.map(r => [
      r.studentName,
      r.studentEmail || "",
      r.score,
      r.totalMarks,
      r.percentage + "%",
      parseFloat(r.percentage) >= 33 ? "PASS" : "FAIL",
      r.isVerified ? "Yes" : "No",
      r.verifiedAt ? new Date(r.verifiedAt).toLocaleDateString() : "",
      r.remarks || ""
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${examData?.title}_results_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#EA8E0A] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading results...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#0B234A] flex items-center gap-2">
              <Award className="h-8 w-8 text-[#EA8E0A]" />
              Exam Results
            </h1>
            <p className="text-gray-600 mt-2">
              {examData?.title} • Grade {examData?.grade} • {examData?.subject}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Total Marks: {examData?.totalMarks}
            </p>
          </div>
          <button
            onClick={() => navigate("/employee/exams")}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            ← Back to Exams
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-[#0B234A] to-[#1a3a6e] text-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300 mb-1">Total Students</p>
                <p className="text-3xl font-bold">{statistics.totalStudents}</p>
              </div>
              <div className="p-3 bg-white/10 rounded-full">
                <Users className="h-6 w-6 text-[#EA8E0A]" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-[#EA8E0A]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Average Score</p>
                <p className="text-3xl font-bold text-[#EA8E0A]">{statistics.averageScore}%</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <TrendingUp className="h-6 w-6 text-[#EA8E0A]" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Verified</p>
                <p className="text-3xl font-bold text-green-600">{statistics.verifiedCount}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <UserCheck className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {((statistics.verifiedCount / statistics.totalStudents) * 100).toFixed(1)}% complete
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Pending</p>
                <p className="text-3xl font-bold text-yellow-600">{statistics.pendingCount}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Need verification
            </p>
          </div>
        </div>
      )}

      {/* Actions Bar */}
      <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            {/* Search */}
            <div className="relative flex-1 min-w-[300px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-[#EA8E0A] focus:border-transparent"
              />
            </div>

            {/* Filter */}
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EA8E0A] min-w-[150px]"
            >
              <option value="all">All Results</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
              <option value="passed">Passed</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <div className="flex gap-3 w-full lg:w-auto">
            <button
              onClick={handleVerifyAll}
              disabled={statistics?.pendingCount === 0}
              className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <CheckSquare className="h-5 w-5" />
              Verify All ({statistics?.pendingCount})
            </button>

            <button
              onClick={exportToCSV}
              className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-[#0B234A] text-white rounded-lg hover:bg-[#0a1e3d] transition-colors"
            >
              <Download className="h-5 w-5" />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-10">
                  #
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("studentName")}
                >
                  <div className="flex items-center gap-2">
                    Student
                    {sortConfig.key === "studentName" && (
                      sortConfig.direction === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("score")}
                >
                  <div className="flex items-center gap-2">
                    Score
                    {sortConfig.key === "score" && (
                      sortConfig.direction === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </th>
                <th 
                  className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("percentage")}
                >
                  <div className="flex items-center gap-2">
                    Percentage
                    {sortConfig.key === "percentage" && (
                      sortConfig.direction === "asc" ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submitted
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Remarks
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Verification
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredResults.map((result, index) => {
                const status = getStatusBadge(result.percentage);
                const StatusIcon = status.icon;
                
                return (
                  <React.Fragment key={result.attemptId}>
                    <tr className={`hover:bg-gray-50 ${!result.isVerified ? 'bg-yellow-50/30' : ''}`}>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{result.studentName}</p>
                          <p className="text-sm text-gray-500">{result.studentEmail}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium">
                          {result.score}/{result.totalMarks}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`font-bold ${getScoreColor(result.percentage)}`}>
                          {result.percentage}%
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.textColor}`}>
                          <StatusIcon className="h-3 w-3" />
                          {status.text}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(result.submittedAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <input
                          type="text"
                          value={remarks[result.attemptId] || ""}
                          onChange={(e) => handleRemarksChange(result.attemptId, e.target.value)}
                          disabled={result.isVerified}
                          placeholder="Add remarks..."
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-[#EA8E0A] disabled:bg-gray-100 disabled:text-gray-500"
                        />
                      </td>
                      <td className="px-6 py-4">
                        {result.isVerified ? (
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle className="h-5 w-5" />
                            <span className="text-sm">
                              {new Date(result.verifiedAt).toLocaleDateString()}
                            </span>
                          </div>
                        ) : (
                          <span className="flex items-center gap-1 text-yellow-600">
                            <Clock className="h-4 w-4" />
                            <span className="text-sm">Pending</span>
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {!result.isVerified && (
                            <button
                              onClick={() => handleVerify(result.attemptId)}
                              disabled={verifyingId === result.attemptId}
                              className="flex items-center gap-1 px-3 py-1.5 bg-[#EA8E0A] text-white text-sm rounded-lg hover:bg-[#d17e08] disabled:opacity-50 transition-colors"
                            >
                              {verifyingId === result.attemptId ? (
                                <>
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                  Verifying...
                                </>
                              ) : (
                                <>
                                  <CheckCircle className="h-4 w-4" />
                                  Verify
                                </>
                              )}
                            </button>
                          )}
                          <button
                            onClick={() => toggleRowExpand(result.attemptId)}
                            className="p-1.5 text-gray-500 hover:text-[#0B234A] hover:bg-gray-100 rounded-lg"
                          >
                            {expandedRows[result.attemptId] ? (
                              <ChevronUp className="h-5 w-5" />
                            ) : (
                              <ChevronDown className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                    
                    {/* Expanded Row - Question Details */}
                    {expandedRows[result.attemptId] && (
                      <tr className="bg-gray-50">
                        <td colSpan="9" className="px-6 py-4">
                          <div className="border-l-4 border-[#EA8E0A] pl-4">
                            <h4 className="font-medium text-[#0B234A] mb-3">Question-wise Performance</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* This would need question details from API */}
                              <div className="bg-white p-3 rounded-lg shadow-sm">
                                <p className="text-sm text-gray-600">Question analysis would appear here</p>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}

              {filteredResults.length === 0 && (
                <tr>
                  <td colSpan="9" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center">
                      <FileText className="h-12 w-12 text-gray-400 mb-3" />
                      <p className="text-gray-500 font-medium">No results found</p>
                      <p className="text-sm text-gray-400 mt-1">
                        {searchTerm || filter !== "all" 
                          ? "Try adjusting your filters" 
                          : "No students have submitted this exam yet"}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Summary Footer */}
        {filteredResults.length > 0 && (
          <div className="bg-gray-50 px-6 py-4 border-t">
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <span className="text-gray-600">
                Showing <span className="font-medium">{filteredResults.length}</span> of{" "}
                <span className="font-medium">{results.length}</span> results
              </span>
              <span className="w-px h-4 bg-gray-300"></span>
              <span className="text-gray-600">
                Passed: <span className="font-medium text-green-600">
                  {results.filter(r => parseFloat(r.percentage) >= 33).length}
                </span>
              </span>
              <span className="text-gray-600">
                Failed: <span className="font-medium text-red-600">
                  {results.filter(r => parseFloat(r.percentage) < 33).length}
                </span>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      {statistics && statistics.pendingCount > 0 && (
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <p className="text-sm text-yellow-700">
              <span className="font-medium">{statistics.pendingCount}</span> result(s) pending verification. 
              Verify them to make results visible to students.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamResults;