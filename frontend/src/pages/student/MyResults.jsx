// frontend/src/pages/student/MyResults.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  Download,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Calendar,
  Award,
  TrendingUp,
  BarChart3,
  X,
  ChevronRight,
  BookOpen,
  Brain,
  Star,
  Trophy,
  Check,
  Minus,
} from "lucide-react";
import { format } from "date-fns";
import api from "../../services/api.js";
import { useAuth } from "../../hooks/useAuth";
import toast from "react-hot-toast";
import { generateResultPDF } from "../../utils/resultPdfGenerator.js";

const MyResults = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [selectedResult, setSelectedResult] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [sortBy, setSortBy] = useState("latest");

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const response = await api.get("/student/results");
      setData(response.data);
    } catch (error) {
      console.error("Failed to fetch results:", error);
      toast.error("Failed to load results");
    } finally {
      setLoading(false);
    }
  };

  const fetchDetailedResult = async (examId) => {
    try {
      const response = await api.get(`/student/results/${examId}`);
      setSelectedResult(response.data);
      setShowDetails(true);
    } catch (error) {
      console.error("Failed to fetch details:", error);
      toast.error("Failed to load result details");
    }
  };

  const handleDownloadPDF = () => {
    if (!selectedResult || selectedResult.result.status !== "PASS") {
      toast.error("Certificate available only for passed exams");
      return;
    }

    generateResultPDF({
      student: selectedResult.student,
      exam: selectedResult.exam,
      result: selectedResult.result,
    });

    toast.success("PDF downloaded successfully!");
  };

  const getFilteredResults = () => {
    if (!data?.results) return [];

    let filtered = [...data.results];

    if (searchTerm) {
      filtered = filtered.filter((r) =>
        r.examTitle.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter((r) =>
        filterStatus === "pass" ? r.status === "PASS" : r.status === "FAIL",
      );
    }

    filtered.sort((a, b) => {
      if (sortBy === "latest") {
        return new Date(b.submittedAt) - new Date(a.submittedAt);
      } else {
        return parseFloat(b.percentage) - parseFloat(a.percentage);
      }
    });

    return filtered;
  };

  const getScoreColor = (percentage) => {
    if (percentage >= 75) return "text-green-600";
    if (percentage >= 33) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBg = (percentage) => {
    if (percentage >= 75) return "bg-green-100";
    if (percentage >= 33) return "bg-yellow-100";
    return "bg-red-100";
  };

  const filteredResults = getFilteredResults();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#0B234A] border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your results...</p>
        </div>
      </div>
    );
  }

  if (!data || data.results.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-md mx-auto mt-20">
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="h-10 w-10 text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              No Results Yet
            </h2>
            <p className="text-gray-600 mb-6">
              You haven't taken any exams yet. Start your first exam to see
              results here.
            </p>
            <button
              onClick={() => navigate("/student/dashboard")}
              className="px-6 py-3 bg-[#0B234A] text-white rounded-lg hover:bg-[#1a3a6e] transition-colors"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-[#0B234A]">
            My Results
          </h1>
          <p className="text-gray-600 mt-1">Track your exam performance</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <span className="text-xs text-gray-500">Total</span>
            </div>
            <p className="text-2xl font-bold text-[#0B234A]">
              {data.statistics.totalExams}
            </p>
            <p className="text-xs text-gray-500">Exams Taken</p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <span className="text-xs text-gray-500">Passed</span>
            </div>
            <p className="text-2xl font-bold text-green-600">
              {data.statistics.passedExams}
            </p>
            <p className="text-xs text-gray-500">Exams Passed</p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <XCircle className="h-5 w-5 text-red-600" />
              <span className="text-xs text-gray-500">Failed</span>
            </div>
            <p className="text-2xl font-bold text-red-600">
              {data.statistics.failedExams}
            </p>
            <p className="text-xs text-gray-500">Exams Failed</p>
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="h-5 w-5 text-yellow-600" />
              <span className="text-xs text-gray-500">Average</span>
            </div>
            <p className="text-2xl font-bold text-yellow-600">
              {data.statistics.averagePercentage}%
            </p>
            <p className="text-xs text-gray-500">Avg. Score</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 shadow-sm mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search exams..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B234A] focus:border-transparent"
              />
            </div>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B234A]"
            >
              <option value="all">All Results</option>
              <option value="pass">Passed Only</option>
              <option value="fail">Failed Only</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B234A]"
            >
              <option value="latest">Latest First</option>
              <option value="highest">Highest Score</option>
            </select>
          </div>
        </div>

        {/* Results Grid */}
        {filteredResults.length === 0 ? (
          <div className="bg-white rounded-xl p-8 text-center">
            <Filter className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              No matching results
            </h3>
            <p className="text-gray-500">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredResults.map((result, index) => {
              const percentage = parseFloat(result.percentage);
              const scoreColor = getScoreColor(percentage);
              const scoreBg = getScoreBg(percentage);

              return (
                <div
                  key={result.attemptId}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                >
                  <div
                    className={`h-1.5 ${
                      result.status === "PASS" ? "bg-green-500" : "bg-red-500"
                    }`}
                  ></div>

                  <div className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-[#0B234A] line-clamp-1">
                          {result.examTitle}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {result.subject || "General"}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          result.status === "PASS"
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {result.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-sm text-gray-500">Score</p>
                        <p className="text-xl font-bold text-[#0B234A]">
                          {result.score}/{result.totalMarks}
                        </p>
                      </div>
                      <div
                        className={`w-16 h-16 rounded-full flex items-center justify-center ${scoreBg}`}
                      >
                        <span className={`text-lg font-bold ${scoreColor}`}>
                          {result.percentage}%
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center text-sm text-gray-500 mb-4">
                      <Calendar className="h-4 w-4 mr-1" />
                      {format(new Date(result.submittedAt), "dd MMM yyyy")}
                    </div>

                    <button
                      onClick={() => fetchDetailedResult(result.examId)}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors text-[#0B234A]"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View Details</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showDetails && selectedResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-[#0B234A] to-[#1a3a6e] text-white p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Award className="h-6 w-6" />
                  <div>
                    <h2 className="text-xl font-semibold">
                      {selectedResult.exam.title}
                    </h2>
                    <p className="text-sm text-white/80">
                      {selectedResult.exam.subject}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetails(false)}
                  className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-5 space-y-5">
              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-500 mb-1">Your Score</p>
                  <p className="text-2xl font-bold text-[#0B234A]">
                    {selectedResult.result.score}/
                    {selectedResult.result.totalMarks}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-500 mb-1">Percentage</p>
                  <p
                    className={`text-2xl font-bold ${getScoreColor(selectedResult.result.percentage)}`}
                  >
                    {selectedResult.result.percentage}%
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-500 mb-1">Status</p>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      selectedResult.result.status === "PASS"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {selectedResult.result.status}
                  </span>
                </div>
              </div>

              {/* Statistics */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-green-50 rounded-lg p-4 text-center border border-green-200">
                  <CheckCircle className="h-6 w-6 text-green-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-green-600">
                    {selectedResult.statistics.correctAnswers}
                  </p>
                  <p className="text-sm text-gray-600">Correct</p>
                </div>
                <div className="bg-red-50 rounded-lg p-4 text-center border border-red-200">
                  <XCircle className="h-6 w-6 text-red-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-red-600">
                    {selectedResult.statistics.wrongAnswers}
                  </p>
                  <p className="text-sm text-gray-600">Wrong</p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4 text-center border border-yellow-200">
                  <Minus className="h-6 w-6 text-yellow-600 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-yellow-600">
                    {selectedResult.statistics.unattempted}
                  </p>
                  <p className="text-sm text-gray-600">Skipped</p>
                </div>
              </div>

              {/* Question-wise Analysis with Detailed Options */}
              <div>
                <h3 className="font-semibold text-[#0B234A] mb-4 flex items-center text-lg">
                  <Brain className="h-5 w-5 mr-2 text-[#EA8E0A]" />
                  Question-wise Analysis
                </h3>
                <div className="space-y-4">
                  {selectedResult.detailedAnswers.map((answer, idx) => {
                    const studentAnswer =
                      answer.selectedOption !== undefined
                        ? answer.options[answer.selectedOption]
                        : null;
                    const correctAnswer = answer.options[answer.correctAnswer];

                    return (
                      <div
                        key={idx}
                        className={`border-2 rounded-xl overflow-hidden ${
                          answer.isCorrect
                            ? "border-green-200"
                            : answer.selectedOption
                              ? "border-red-200"
                              : "border-yellow-200"
                        }`}
                      >
                        {/* Question Header */}
                        <div
                          className={`p-4 ${
                            answer.isCorrect
                              ? "bg-green-50"
                              : answer.selectedOption
                                ? "bg-red-50"
                                : "bg-yellow-50"
                          }`}
                        >
                          <div className="flex items-start space-x-3">
                            <div
                              className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-white ${
                                answer.isCorrect
                                  ? "bg-green-500"
                                  : answer.selectedOption
                                    ? "bg-red-500"
                                    : "bg-yellow-500"
                              }`}
                            >
                              {idx + 1}
                            </div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-800">
                                {answer.questionText}
                              </p>
                              <div className="flex items-center space-x-4 mt-2">
                                <span className="text-xs px-2 py-1 bg-white rounded-full">
                                  Marks: {answer.marks}/{answer.questionMarks}
                                </span>
                                {answer.negativeMarks > 0 && (
                                  <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full">
                                    Negative: {answer.negativeMarks}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Options Grid */}
                        <div className="p-4 bg-white space-y-2">
                          {answer.options.map((option, optIndex) => {
                            const isCorrectOption =
                              optIndex === answer.correctAnswer;
                            const isSelectedOption =
                              answer.selectedOption === optIndex;

                            let optionBg = "bg-gray-50";
                            let optionBorder = "border-gray-200";
                            let optionText = "text-gray-700";
                            let indicator = null;

                            if (isCorrectOption && isSelectedOption) {
                              // Student selected correct answer
                              optionBg = "bg-green-100";
                              optionBorder = "border-green-500";
                              optionText = "text-green-700";
                              indicator = (
                                <span className="flex items-center text-green-600 text-xs font-medium">
                                  <Check className="h-4 w-4 mr-1" />
                                  Your Answer (Correct)
                                </span>
                              );
                            } else if (isCorrectOption && !isSelectedOption) {
                              // Correct answer but student didn't select it
                              optionBg = "bg-green-50";
                              optionBorder = "border-green-300 border-dashed";
                              optionText = "text-green-700";
                              indicator = (
                                <span className="flex items-center text-green-600 text-xs font-medium">
                                  <Check className="h-4 w-4 mr-1" />
                                  Correct Answer
                                </span>
                              );
                            } else if (isSelectedOption && !isCorrectOption) {
                              // Student selected wrong answer
                              optionBg = "bg-red-100";
                              optionBorder = "border-red-500";
                              optionText = "text-red-700";
                              indicator = (
                                <span className="flex items-center text-red-600 text-xs font-medium">
                                  <XCircle className="h-4 w-4 mr-1" />
                                  Your Answer (Wrong)
                                </span>
                              );
                            }

                            return (
                              <div
                                key={optIndex}
                                className={`p-3 border-2 rounded-lg ${optionBg} ${optionBorder} ${optionText}`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-3">
                                    <span
                                      className={`w-6 h-6 rounded-full flex items-center justify-center text-sm font-medium ${
                                        isCorrectOption || isSelectedOption
                                          ? "bg-white"
                                          : "bg-gray-200"
                                      }`}
                                    >
                                      {String.fromCharCode(65 + optIndex)}
                                    </span>
                                    <span
                                      className={
                                        isCorrectOption || isSelectedOption
                                          ? "font-medium"
                                          : ""
                                      }
                                    >
                                      {option}
                                    </span>
                                  </div>
                                  {indicator}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Explanation if available */}
                        {answer.explanation && (
                          <div className="p-4 bg-blue-50 border-t border-blue-200">
                            <p className="text-sm text-blue-800">
                              <span className="font-medium">Explanation:</span>{" "}
                              {answer.explanation}
                            </p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Teacher's Remarks */}
              {selectedResult.result.remarks && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="font-medium text-blue-800 mb-1">
                    Teacher's Remarks:
                  </p>
                  <p className="text-sm text-blue-700">
                    {selectedResult.result.remarks}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 p-4 border-t flex justify-end space-x-3">
              <button
                onClick={() => setShowDetails(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
              >
                Close
              </button>
              {selectedResult.result.status === "PASS" && (
                <button
                  onClick={handleDownloadPDF}
                  className="px-4 py-2 bg-[#0B234A] text-white rounded-lg hover:bg-[#1a3a6e] transition-colors flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Download PDF</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyResults;
