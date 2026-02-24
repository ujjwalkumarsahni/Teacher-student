import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Award,
  CheckCircle,
  XCircle,
  BarChart3,
  Home,
  Download,
  Clock,
  BookOpen
} from 'lucide-react';
import toast from 'react-hot-toast';

const ExamResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const result = location.state;

  if (!result) {
    navigate('/student/dashboard');
    return null;
  }

  const { examTitle, score, totalQuestions, answers, questions } = result;
  const percentage = Math.round((score / (totalQuestions * (questions[0]?.marks || 1))) * 100);

  const getGrade = () => {
    if (percentage >= 90) return { grade: 'A+', color: 'text-green-600' };
    if (percentage >= 80) return { grade: 'A', color: 'text-green-600' };
    if (percentage >= 70) return { grade: 'B+', color: 'text-blue-600' };
    if (percentage >= 60) return { grade: 'B', color: 'text-blue-600' };
    if (percentage >= 50) return { grade: 'C', color: 'text-yellow-600' };
    if (percentage >= 40) return { grade: 'D', color: 'text-orange-600' };
    return { grade: 'F', color: 'text-red-600' };
  };

  const grade = getGrade();

  const handleDownloadResult = () => {
    // In a real app, this would generate a PDF
    toast.success('Downloading result...');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-3 rounded-full mb-4" style={{ backgroundColor: '#0B234A' }}>
            <Award className="h-12 w-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold" style={{ color: '#0B234A' }}>
            Exam Completed!
          </h1>
          <p className="text-gray-600 mt-2">{examTitle}</p>
        </div>

        {/* Score Card */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Your Score</p>
              <p className="text-4xl font-bold" style={{ color: '#0B234A' }}>
                {score}
              </p>
              <p className="text-sm text-gray-500">out of {totalQuestions * (questions[0]?.marks || 1)}</p>
            </div>

            <div className="text-center border-l border-r border-gray-200">
              <p className="text-sm text-gray-600 mb-1">Percentage</p>
              <p className="text-4xl font-bold" style={{ color: '#EA8E0A' }}>
                {percentage}%
              </p>
              <p className="text-sm text-gray-500">overall performance</p>
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Grade</p>
              <p className={`text-4xl font-bold ${grade.color}`}>
                {grade.grade}
              </p>
              <p className="text-sm text-gray-500">achievement level</p>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Correct Answers</p>
                <p className="text-2xl font-bold text-green-600">
                  {answers.filter(a => {
                    const q = questions.find(q => q._id === a.question);
                    return q && a.selectedOption === q.correctAnswer;
                  }).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-red-100">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Incorrect Answers</p>
                <p className="text-2xl font-bold text-red-600">
                  {answers.filter(a => {
                    const q = questions.find(q => q._id === a.question);
                    return q && a.selectedOption !== q.correctAnswer;
                  }).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-gray-100">
                <Clock className="h-6 w-6 text-gray-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Unanswered</p>
                <p className="text-2xl font-bold text-gray-600">
                  {totalQuestions - answers.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Analysis */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center" style={{ color: '#0B234A' }}>
            <BarChart3 className="h-5 w-5 mr-2" />
            Detailed Analysis
          </h2>

          <div className="space-y-4">
            {questions.map((q, idx) => {
              const answer = answers.find(a => a.question === q._id);
              const isCorrect = answer && answer.selectedOption === q.correctAnswer;
              const isAttempted = !!answer;

              return (
                <div key={q._id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium mb-2">
                        Q{idx + 1}. {q.questionText}
                      </p>
                      
                      <div className="grid grid-cols-2 gap-2">
                        {q.options.map((opt, optIdx) => (
                          <div
                            key={optIdx}
                            className={`text-sm p-2 rounded ${
                              optIdx === q.correctAnswer
                                ? 'bg-green-100 border border-green-300'
                                : answer?.selectedOption === optIdx && optIdx !== q.correctAnswer
                                ? 'bg-red-100 border border-red-300'
                                : 'bg-gray-50'
                            }`}
                          >
                            {String.fromCharCode(65 + optIdx)}. {opt}
                            {optIdx === q.correctAnswer && (
                              <CheckCircle className="h-4 w-4 text-green-600 inline ml-2" />
                            )}
                          </div>
                        ))}
                      </div>

                      {q.explanation && (
                        <div className="mt-2 text-sm text-gray-600 bg-blue-50 p-2 rounded">
                          <span className="font-medium">Explanation:</span> {q.explanation}
                        </div>
                      )}
                    </div>

                    <div className="ml-4 text-right">
                      <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                        isCorrect ? 'bg-green-100 text-green-800' :
                        isAttempted ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {isCorrect ? 'Correct' : isAttempted ? 'Incorrect' : 'Not Attempted'}
                      </span>
                      <p className="text-sm mt-1">
                        Marks: {isCorrect ? q.marks : isAttempted ? -q.negativeMarks : 0}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => navigate('/student/dashboard')}
            className="px-6 py-3 text-white font-medium rounded-md hover:opacity-90 flex items-center"
            style={{ backgroundColor: '#0B234A' }}
          >
            <Home className="h-5 w-5 mr-2" />
            Go to Dashboard
          </button>
          
          <button
            onClick={handleDownloadResult}
            className="px-6 py-3 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center"
          >
            <Download className="h-5 w-5 mr-2" />
            Download Result
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExamResultPage;