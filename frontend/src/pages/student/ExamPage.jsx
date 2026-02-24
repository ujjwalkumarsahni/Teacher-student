// src/pages/student/ExamPage.jsx
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Clock, AlertCircle, CheckCircle, Save, ChevronLeft, ChevronRight } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { 
  getExamQuestions, 
  saveAnswer, 
  submitExam 
} from "../../services/studentExamService";
import toast from "react-hot-toast";

const ExamPage = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [examData, setExamData] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [savedAnswers, setSavedAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [autoSaveStatus, setAutoSaveStatus] = useState("");
  
  const autoSaveTimerRef = useRef(null);
  const questionStatusRef = useRef({});

  useEffect(() => {
    fetchExamQuestions();
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

  const fetchExamQuestions = async () => {
    try {
      setLoading(true);
      const data = await getExamQuestions(examId);
      
      setExamData(data.exam);
      setQuestions(data.questions);
      setTimeLeft(data.remainingTimeInSeconds);
      
      // Initialize answers from saved answers
      const savedAnswersMap = {};
      data.savedAnswers.forEach(ans => {
        savedAnswersMap[ans.question] = ans.selectedOption;
      });
      setAnswers(savedAnswersMap);
      setSavedAnswers(data.savedAnswers);
      
    } catch (error) {
      if (error.message === "Exam time expired") {
        toast.error("Exam time has expired!");
        navigate("/student");
      } else {
        toast.error(error.message || "Failed to load exam");
      }
    } finally {
      setLoading(false);
    }
  };

  // Timer effect
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleTimeExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleTimeExpired = async () => {
    toast.error("Time's up! Submitting exam...");
    await handleSubmitExam(true);
  };

  // Auto-save function
  const triggerAutoSave = useCallback((questionId, selectedOption) => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    setAutoSaveStatus("Saving...");

    autoSaveTimerRef.current = setTimeout(async () => {
      try {
        await saveAnswer(examId, questionId, selectedOption);
        setAutoSaveStatus("Saved");
        setTimeout(() => setAutoSaveStatus(""), 2000);
      } catch (error) {
        setAutoSaveStatus("Save failed");
        console.error("Auto-save error:", error);
      }
    }, 2000);
  }, [examId]);

  const handleOptionSelect = (questionId, optionIndex) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
    
    triggerAutoSave(questionId, optionIndex);
  };

  const handleSubmitExam = async (isAutoSubmit = false) => {
    try {
      setSubmitting(true);
      
      // Format answers for submission
      const answersArray = Object.entries(answers).map(([question, selectedOption]) => ({
        question,
        selectedOption
      }));

      const result = await submitExam(examId, answersArray);
      
      if (result.success) {
        toast.success(
          <div>
            <p className="font-bold">Exam Submitted Successfully!</p>
          </div>,
          { duration: 5000 }
        );
        
        // Navigate after showing success message
        setTimeout(() => {
          navigate("/student");
        }, 3000);
      }
    } catch (error) {
      toast.error(error.message || "Failed to submit exam");
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getQuestionStatus = (questionId, index) => {
    if (answers[questionId] !== undefined) {
      return "answered";
    }
    return "pending";
  };

  const getTimerColor = () => {
    if (timeLeft < 300) return "text-[#E22213]"; // Less than 5 minutes
    if (timeLeft < 600) return "text-[#EA8E0A]"; // Less than 10 minutes
    return "text-green-600";
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#EA8E0A]"></div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-[#0B234A] text-white sticky top-0 z-10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold">{examData?.title}</h1>
              <p className="text-sm text-gray-300">Duration: {examData?.duration} minutes</p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Timer */}
              <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-lg">
                <Clock className={`h-5 w-5 ${getTimerColor()}`} />
                <span className={`font-mono text-xl font-bold ${getTimerColor()}`}>
                  {formatTime(timeLeft)}
                </span>
              </div>
              
              {/* Auto-save status */}
              {autoSaveStatus && (
                <div className="flex items-center gap-2 text-sm">
                  {autoSaveStatus === "Saving..." ? (
                    <>
                      <Save className="h-4 w-4 animate-pulse" />
                      <span>Saving...</span>
                    </>
                  ) : autoSaveStatus === "Saved" ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      <span>Saved</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 text-red-400" />
                      <span>Save failed</span>
                    </>
                  )}
                </div>
              )}
              
              {/* Submit button */}
              <button
                onClick={() => {
                  if (window.confirm("Are you sure you want to submit the exam?")) {
                    handleSubmitExam();
                  }
                }}
                disabled={submitting}
                className="bg-[#EA8E0A] hover:bg-[#d17e08] px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {submitting ? "Submitting..." : "Submit Exam"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Question Panel */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-xl shadow-sm p-6">
              {/* Question navigation */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b">
                <button
                  onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentQuestionIndex === 0}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </button>
                
                <span className="text-lg font-semibold text-[#0B234A]">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </span>
                
                <button
                  onClick={() => setCurrentQuestionIndex(prev => Math.min(questions.length - 1, prev + 1))}
                  disabled={currentQuestionIndex === questions.length - 1}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Question */}
              <div className="mb-8">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="bg-[#0B234A] text-white text-sm px-3 py-1 rounded-full">
                      {currentQuestion.marks} Mark{currentQuestion.marks > 1 ? 's' : ''}
                    </span>
                    {currentQuestion.negativeMarks > 0 && (
                      <span className="bg-[#E22213] text-white text-sm px-3 py-1 rounded-full">
                        -{currentQuestion.negativeMarks} for wrong
                      </span>
                    )}
                  </div>
                </div>
                
                <p className="text-lg text-gray-800 mb-6">{currentQuestion.questionText}</p>

                {/* Options */}
                <div className="space-y-3">
                  {currentQuestion.options.map((option, idx) => (
                    <label
                      key={idx}
                      className={`block p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        answers[currentQuestion._id] === idx
                          ? "border-[#EA8E0A] bg-orange-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name={`question-${currentQuestion._id}`}
                          value={idx}
                          checked={answers[currentQuestion._id] === idx}
                          onChange={() => handleOptionSelect(currentQuestion._id, idx)}
                          className="h-4 w-4 text-[#EA8E0A] focus:ring-[#EA8E0A]"
                        />
                        <span className="ml-3 text-gray-700">{option}</span>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Question Palette */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
              <h3 className="font-semibold text-[#0B234A] mb-4">Questions</h3>
              
              <div className="grid grid-cols-5 gap-2">
                {questions.map((q, idx) => {
                  const status = getQuestionStatus(q._id, idx);
                  return (
                    <button
                      key={q._id}
                      onClick={() => setCurrentQuestionIndex(idx)}
                      className={`
                        aspect-square rounded-lg font-medium text-sm
                        ${currentQuestionIndex === idx ? 'ring-2 ring-[#EA8E0A]' : ''}
                        ${status === 'answered' 
                          ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }
                      `}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-4 h-4 bg-green-100 rounded"></div>
                  <span className="text-sm text-gray-600">Answered</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-100 rounded"></div>
                  <span className="text-sm text-gray-600">Not Answered</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <div className="text-sm text-gray-600 mb-2">
                  Progress: {Object.keys(answers).length}/{questions.length}
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-[#EA8E0A] h-2 rounded-full transition-all"
                    style={{ width: `${(Object.keys(answers).length / questions.length) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamPage;