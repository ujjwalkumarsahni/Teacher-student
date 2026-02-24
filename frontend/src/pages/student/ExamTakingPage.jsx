import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader,
  Save,
  Send,
  ChevronLeft,
  ChevronRight,
  BookOpen
} from 'lucide-react';
import api from '../../services/api.js';
import toast from 'react-hot-toast';

const ExamTakingPage = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [remainingTime, setRemainingTime] = useState(0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState('saved');

  // Load exam questions
  useEffect(() => {
    loadExam();
  }, [examId]);

  // Auto-save answers every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (Object.keys(answers).length > 0) {
        saveAnswers();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [answers]);

  // Timer countdown
  useEffect(() => {
    if (remainingTime <= 0) return;

    const timer = setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeUp();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [remainingTime]);

  const loadExam = async () => {
    try {
      const response = await api.get(`/student/exams/${examId}/questions`);
      setExam(response.data.exam);
      setQuestions(response.data.questions);
      setRemainingTime(response.data.remainingTimeInSeconds);
      
      // Convert saved answers to object for easy access
      const savedAnswers = {};
      response.data.savedAnswers.forEach(ans => {
        savedAnswers[ans.question] = ans.selectedOption;
      });
      setAnswers(savedAnswers);
      
    } catch (error) {
      if (error.response?.status === 400) {
        toast.error(error.response.data.message);
        navigate('/student/dashboard');
      } else {
        toast.error('Failed to load exam');
      }
    } finally {
      setLoading(false);
    }
  };

  const saveAnswers = async () => {
    setAutoSaveStatus('saving');
    
    try {
      // Save each answer individually
      const promises = Object.entries(answers).map(([questionId, selectedOption]) => {
        return api.post('/student/exams/save-answer', {
          examId,
          questionId,
          selectedOption
        });
      });

      await Promise.all(promises);
      setAutoSaveStatus('saved');
      
      // Show saved indicator briefly
      setTimeout(() => setAutoSaveStatus('saved'), 2000);
      
    } catch (error) {
      console.error('Auto-save failed:', error);
      setAutoSaveStatus('error');
    }
  };

  const handleAnswerSelect = (questionId, optionIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
    setAutoSaveStatus('unsaved');
  };

  const handleTimeUp = async () => {
    toast.error('Time is up! Submitting exam...');
    await handleSubmitExam(true);
  };

  const handleSubmitExam = async (isAutoSubmit = false) => {
    setSubmitting(true);
    
    try {
      // Convert answers object to array format expected by backend
      const answersArray = Object.entries(answers).map(([question, selectedOption]) => ({
        question,
        selectedOption
      }));

      const response = await api.post('/student/exams/submit', {
        examId,
        answers: answersArray
      });

      if (response.data.success) {
        toast.success(isAutoSubmit ? 'Exam auto-submitted!' : 'Exam submitted successfully!');
        navigate('/student/exam/result', {
          state: {
            examTitle: exam?.title,
            score: response.data.score,
            totalQuestions: questions.length,
            answers: answersArray,
            questions: questions
          }
        });
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit exam');
    } finally {
      setSubmitting(false);
      setShowSubmitModal(false);
    }
  };

  const getSaveStatusIcon = () => {
    switch (autoSaveStatus) {
      case 'saving':
        return <Loader className="h-4 w-4 animate-spin text-orange-500" />;
      case 'saved':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-12 w-12 animate-spin mx-auto" style={{ color: '#0B234A' }} />
          <p className="mt-4 text-gray-600">Loading exam...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <BookOpen className="h-6 w-6 mr-2" style={{ color: '#0B234A' }} />
              <h1 className="text-lg font-semibold" style={{ color: '#0B234A' }}>
                {exam?.title}
              </h1>
            </div>

            <div className="flex items-center space-x-4">
              {/* Auto-save status */}
              <div className="flex items-center text-sm text-gray-600">
                {getSaveStatusIcon()}
                <span className="ml-1">
                  {autoSaveStatus === 'saving' ? 'Saving...' :
                   autoSaveStatus === 'saved' ? 'All saved' :
                   autoSaveStatus === 'error' ? 'Save failed' :
                   'Unsaved changes'}
                </span>
              </div>

              {/* Timer */}
              <div className={`flex items-center px-3 py-1 rounded-full ${
                remainingTime < 300 ? 'bg-red-100 text-red-800 animate-pulse' : 'bg-gray-100'
              }`}>
                <Clock className="h-4 w-4 mr-1" />
                <span className="font-mono font-medium">{formatTime(remainingTime)}</span>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%`, backgroundColor: '#0B234A' }}
            />
          </div>
          <div className="mt-1 text-xs text-gray-600 text-right">
            Question {currentQuestionIndex + 1} of {questions.length}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentQuestion && (
          <div className="bg-white rounded-lg shadow-md p-6">
            {/* Question */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium px-2 py-1 rounded" style={{ backgroundColor: '#0B234A', color: 'white' }}>
                  {currentQuestion.difficultyLevel?.toUpperCase()}
                </span>
                <span className="text-sm text-gray-600">
                  Marks: {currentQuestion.marks} | Negative: {currentQuestion.negativeMarks}
                </span>
              </div>
              <h2 className="text-lg font-medium text-gray-900">
                {currentQuestion.questionText}
              </h2>
            </div>

            {/* Options */}
            <div className="space-y-3 mb-8">
              {currentQuestion.options.map((option, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAnswerSelect(currentQuestion._id, idx)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    answers[currentQuestion._id] === idx
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 text-sm ${
                      answers[currentQuestion._id] === idx
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-700'
                    }`}>
                      {String.fromCharCode(65 + idx)}
                    </span>
                    <span className="text-gray-800">{option}</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                disabled={currentQuestionIndex === 0}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={saveAnswers}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center"
                >
                  <Save className="h-4 w-4 mr-1" />
                  Save
                </button>

                <button
                  onClick={() => setShowSubmitModal(true)}
                  className="px-4 py-2 text-white font-medium rounded-md hover:opacity-90 flex items-center"
                  style={{ backgroundColor: '#0B234A' }}
                >
                  <Send className="h-4 w-4 mr-1" />
                  Submit
                </button>
              </div>

              <button
                onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
                disabled={currentQuestionIndex === questions.length - 1}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </button>
            </div>
          </div>
        )}

        {/* Question Palette */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Question Palette</h3>
          <div className="flex flex-wrap gap-2">
            {questions.map((q, idx) => (
              <button
                key={q._id}
                onClick={() => setCurrentQuestionIndex(idx)}
                className={`w-10 h-10 rounded-md text-sm font-medium transition-colors ${
                  currentQuestionIndex === idx
                    ? 'text-white'
                    : answers[q._id] !== undefined
                    ? 'bg-green-100 text-green-800 border border-green-300'
                    : 'bg-gray-100 text-gray-800'
                }`}
                style={currentQuestionIndex === idx ? { backgroundColor: '#0B234A' } : {}}
              >
                {idx + 1}
              </button>
            ))}
          </div>
        </div>
      </main>

      {/* Submit Confirmation Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b" style={{ backgroundColor: '#0B234A' }}>
              <h2 className="text-lg font-semibold text-white">Submit Exam</h2>
            </div>
            
            <div className="p-6">
              <div className="text-center mb-4">
                <Send className="h-12 w-12 mx-auto mb-3" style={{ color: '#EA8E0A' }} />
                <h3 className="text-lg font-medium text-gray-900">Ready to submit?</h3>
                <p className="text-sm text-gray-600 mt-1">
                  You have answered {Object.keys(answers).length} out of {questions.length} questions.
                </p>
                {Object.keys(answers).length < questions.length && (
                  <p className="text-sm text-red-600 mt-2 flex items-center justify-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {questions.length - Object.keys(answers).length} questions unanswered
                  </p>
                )}
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowSubmitModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleSubmitExam()}
                  disabled={submitting}
                  className="px-4 py-2 text-white font-medium rounded-md hover:opacity-90 disabled:opacity-50 flex items-center"
                  style={{ backgroundColor: '#0B234A' }}
                >
                  {submitting ? (
                    <><Loader className="h-4 w-4 animate-spin mr-2" /> Submitting...</>
                  ) : (
                    <><Send className="h-4 w-4 mr-2" /> Submit Exam</>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamTakingPage;