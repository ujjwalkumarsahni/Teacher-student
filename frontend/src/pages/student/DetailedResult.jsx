// src/pages/student/DetailedResult.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Award,
  Clock,
  Calendar,
  Download,
  ArrowLeft,
  BarChart3,
  BookOpen,
  GraduationCap,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { getStudentExamResult } from "../../services/resultService";
import toast from "react-hot-toast";

const DetailedResult = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [resultData, setResultData] = useState(null);
  const [expandedQuestions, setExpandedQuestions] = useState({});

  useEffect(() => {
    fetchDetailedResult();
  }, [examId]);

  const fetchDetailedResult = async () => {
    try {
      setLoading(true);
      const data = await getStudentExamResult(examId);
      setResultData(data);
    } catch (error) {
      toast.error(error.message || "Failed to fetch result details");
      navigate("/student/results");
    } finally {
      setLoading(false);
    }
  };

  const toggleQuestion = (questionId) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  const downloadResult = () => {
    if (!resultData) return;

    let content = `📋 EXAM RESULT REPORT
══════════════════════════════════════════

📌 EXAM DETAILS
────────────────
Exam: ${resultData.exam.title}
Subject: ${resultData.exam.subject}
Grade: ${resultData.exam.grade}
Date: ${new Date(resultData.exam.date).toLocaleDateString()}

📊 RESULT SUMMARY
────────────────
Score: ${resultData.result.score}/${resultData.result.totalMarks}
Percentage: ${resultData.result.percentage}%
Status: ${resultData.result.status}
Submitted: ${new Date(resultData.result.submittedAt).toLocaleString()}
Verified: ${new Date(resultData.result.verifiedAt).toLocaleString()}
${resultData.result.remarks ? `Remarks: ${resultData.result.remarks}` : ''}

📈 STATISTICS
────────────────
Total Questions: ${resultData.statistics.totalQuestions}
Correct Answers: ${resultData.statistics.correctAnswers}
Wrong Answers: ${resultData.statistics.wrongAnswers}
Unattempted: ${resultData.statistics.unattempted}

❓ QUESTION WISE ANALYSIS
────────────────
`;

    resultData.detailedAnswers.forEach((answer, index) => {
      content += `
Q${index + 1}: ${answer.questionText}
   Your Answer: ${answer.selectedOption !== undefined ? answer.options[answer.selectedOption] : 'Not Attempted'}
   Correct Answer: ${answer.options[answer.correctAnswer]}
   Result: ${answer.isCorrect ? '✓ Correct' : answer.selectedOption !== undefined ? '✗ Wrong' : '○ Unattempted'}
   Marks: ${answer.isCorrect ? `+${answer.questionMarks}` : answer.selectedOption !== undefined ? `-${answer.negativeMarks}` : '0'}
   ${'-'.repeat(40)}
`;
    });

    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${resultData.exam.title}_detailed_result.txt`;
    a.click();
  };

  const getOptionLetter = (index) => {
    return String.fromCharCode(65 + index); // A, B, C, D
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#EA8E0A] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your result details...</p>
        </div>
      </div>
    );
  }

  if (!resultData) return null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate("/student/results")}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 mb-6 group"
      >
        <div className="p-2 rounded-full bg-gray-100 group-hover:bg-gray-200 transition-colors">
          <ArrowLeft className="h-4 w-4" />
        </div>
        <span>Back to Results</span>
      </button>

      {/* Header Card */}
      <div className="bg-gradient-to-br from-[#0B234A] to-[#1a3a6e] text-white rounded-2xl shadow-xl p-8 mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-white/10 rounded-2xl">
              <GraduationCap className="h-10 w-10 text-[#EA8E0A]" />
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-2">{resultData.exam.title}</h1>
              <div className="flex flex-wrap gap-4 text-sm text-gray-300">
                <span className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  {resultData.exam.subject}
                </span>
                <span className="flex items-center gap-1">
                  <BarChart3 className="h-4 w-4" />
                  Grade {resultData.exam.grade}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {new Date(resultData.exam.date).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={downloadResult}
            className="flex items-center gap-2 px-6 py-3 bg-white text-[#0B234A] rounded-xl hover:bg-gray-100 transition-colors font-medium"
          >
            <Download className="h-5 w-5" />
            Download Report
          </button>
        </div>
      </div>

      {/* Result Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-[#0B234A]">
          <p className="text-sm text-gray-600 mb-1">Your Score</p>
          <p className="text-3xl font-bold text-[#0B234A]">
            {resultData.result.score}/{resultData.result.totalMarks}
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-[#EA8E0A]">
          <p className="text-sm text-gray-600 mb-1">Percentage</p>
          <p className={`text-3xl font-bold ${
            resultData.result.percentage >= 75 ? "text-green-600" :
            resultData.result.percentage >= 33 ? "text-yellow-600" : "text-red-600"
          }`}>
            {resultData.result.percentage}%
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-green-500">
          <p className="text-sm text-gray-600 mb-1">Status</p>
          <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${
            resultData.result.status === "PASS"
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}>
            {resultData.result.status}
          </span>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 border-l-4 border-purple-500">
          <p className="text-sm text-gray-600 mb-1">Verified On</p>
          <p className="font-semibold text-gray-800">
            {new Date(resultData.result.verifiedAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 text-center">
          <div className="inline-flex p-3 bg-green-200 rounded-full mb-3">
            <CheckCircle className="h-6 w-6 text-green-700" />
          </div>
          <p className="text-3xl font-bold text-green-700 mb-1">
            {resultData.statistics.correctAnswers}
          </p>
          <p className="text-sm text-green-600">Correct Answers</p>
          <p className="text-xs text-green-500 mt-1">
            +{resultData.statistics.correctAnswers * (resultData.result.totalMarks / resultData.statistics.totalQuestions)} marks
          </p>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 text-center">
          <div className="inline-flex p-3 bg-red-200 rounded-full mb-3">
            <XCircle className="h-6 w-6 text-red-700" />
          </div>
          <p className="text-3xl font-bold text-red-700 mb-1">
            {resultData.statistics.wrongAnswers}
          </p>
          <p className="text-sm text-red-600">Wrong Answers</p>
          <p className="text-xs text-red-500 mt-1">
            -{resultData.statistics.wrongAnswers * 0.25} marks (negative)
          </p>
        </div>

        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-6 text-center">
          <div className="inline-flex p-3 bg-gray-200 rounded-full mb-3">
            <AlertCircle className="h-6 w-6 text-gray-700" />
          </div>
          <p className="text-3xl font-bold text-gray-700 mb-1">
            {resultData.statistics.unattempted}
          </p>
          <p className="text-sm text-gray-600">Unattempted</p>
          <p className="text-xs text-gray-500 mt-1">No marks</p>
        </div>
      </div>

      {/* Teacher's Remarks */}
      {resultData.result.remarks && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-[#EA8E0A] rounded-xl p-6 mb-8">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-[#EA8E0A]/10 rounded-lg">
              <Award className="h-5 w-5 text-[#EA8E0A]" />
            </div>
            <div>
              <p className="font-semibold text-[#0B234A] mb-1">Teacher's Remarks</p>
              <p className="text-gray-700">{resultData.result.remarks}</p>
            </div>
          </div>
        </div>
      )}

      {/* Detailed Answers */}
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-white border-b">
          <h2 className="text-lg font-bold text-[#0B234A] flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-[#EA8E0A]" />
            Question-wise Analysis
          </h2>
        </div>

        <div className="divide-y divide-gray-200">
          {resultData.detailedAnswers.map((answer, index) => (
            <div key={answer.questionId} className="hover:bg-gray-50 transition-colors">
              {/* Question Header */}
              <div 
                className="p-6 cursor-pointer"
                onClick={() => toggleQuestion(answer.questionId)}
              >
                <div className="flex items-start gap-4">
                  {/* Status Icon */}
                  <div className={`flex-shrink-0 p-2 rounded-full ${
                    answer.isCorrect ? 'bg-green-100' :
                    answer.selectedOption !== undefined ? 'bg-red-100' : 'bg-gray-100'
                  }`}>
                    {answer.isCorrect ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : answer.selectedOption !== undefined ? (
                      <XCircle className="h-5 w-5 text-red-600" />
                    ) : (
                      <AlertCircle className="h-5 w-5 text-gray-400" />
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-500">
                        Question {index + 1}
                      </span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-gray-600">
                          Marks: {answer.questionMarks}
                        </span>
                        {answer.negativeMarks > 0 && (
                          <span className="text-xs px-2 py-1 bg-red-50 text-red-600 rounded-full">
                            -{answer.negativeMarks} negative
                          </span>
                        )}
                        {expandedQuestions[answer.questionId] ? (
                          <ChevronUp className="h-5 w-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                    </div>

                    <p className="text-gray-800 font-medium">{answer.questionText}</p>

                    {/* Quick Answer Summary */}
                    <div className="mt-2 flex items-center gap-4 text-sm">
                      <span className="text-gray-600">
                        Your answer: <span className="font-medium">
                          {answer.selectedOption !== undefined 
                            ? getOptionLetter(answer.selectedOption)
                            : 'Not attempted'}
                        </span>
                      </span>
                      <span className="text-gray-400">|</span>
                      <span className="text-green-600">
                        Correct: {getOptionLetter(answer.correctAnswer)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedQuestions[answer.questionId] && (
                <div className="px-6 pb-6 pl-16">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h4 className="font-medium text-[#0B234A] mb-3">Options:</h4>
                    <div className="space-y-2">
                      {answer.options.map((option, optIndex) => (
                        <div
                          key={optIndex}
                          className={`p-3 rounded-lg border-2 transition-all ${
                            optIndex === answer.correctAnswer
                              ? "border-green-500 bg-green-50"
                              : optIndex === answer.selectedOption && !answer.isCorrect
                              ? "border-red-500 bg-red-50"
                              : optIndex === answer.selectedOption && answer.isCorrect
                              ? "border-green-500 bg-green-50"
                              : "border-gray-200"
                          }`}
                        >
                          <div className="flex items-center">
                            <span className={`w-8 h-8 flex items-center justify-center rounded-full font-medium mr-3 ${
                              optIndex === answer.correctAnswer
                                ? "bg-green-500 text-white"
                                : optIndex === answer.selectedOption && !answer.isCorrect
                                ? "bg-red-500 text-white"
                                : "bg-gray-200 text-gray-700"
                            }`}>
                              {getOptionLetter(optIndex)}
                            </span>
                            <span className="text-gray-700 flex-1">{option}</span>
                            {optIndex === answer.correctAnswer && (
                              <span className="text-xs font-medium text-green-600 bg-green-100 px-2 py-1 rounded-full">
                                Correct Answer
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Marks Obtained */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Marks Obtained:</span>
                        <span className={`font-bold ${
                          answer.isCorrect ? 'text-green-600' :
                          answer.selectedOption !== undefined ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {answer.isCorrect 
                            ? `+${answer.questionMarks}`
                            : answer.selectedOption !== undefined
                            ? `-${answer.negativeMarks}`
                            : '0'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DetailedResult;