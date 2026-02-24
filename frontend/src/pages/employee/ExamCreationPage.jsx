import React, { useState, useEffect } from "react";
import {
  FileText,
  Plus,
  Trash2,
  Save,
  Send,
  X,
  Loader,
  CheckCircle,
  AlertCircle,
  BookOpen,
  Clock,
  Calendar,
  Award,
  HelpCircle,
  ChevronRight,
  Eye,
  Edit,
} from "lucide-react";
import api from "../../services/api";
import toast from "react-hot-toast";

const ExamCreationPage = () => {
  const [showEditModal, setShowEditModal] = useState(false);
const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [activeTab, setActiveTab] = useState("create");
  const [loading, setLoading] = useState(false);
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [showQuestionModal, setShowQuestionModal] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showExamDetails, setShowExamDetails] = useState(false);

  // Exam Form State
  const [examForm, setExamForm] = useState({
    title: "",
    grade: "",
    subject: "",
    startTime: "",
    duration: "",
    description: "",
  });

  // Question Form State
  const [questionForm, setQuestionForm] = useState({
    questionText: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
    marks: 1,
    negativeMarks: 0,
    difficultyLevel: "medium",
    topic: "",
    explanation: "",
  });

  const [currentExamQuestions, setCurrentExamQuestions] = useState([]);

  const grades = [
    "Nursery",
    "LKG",
    "UKG",
    "1",
    "2",
    "3",
    "4",
    "5",
    "6",
    "7",
    "8",
    "9",
    "10",
    "11",
    "12",
  ];

  const subjects = [
    "Mathematics",
    "Science",
    "English",
    "Hindi",
    "Social Studies",
    "Physics",
    "Chemistry",
    "Biology",
    "Computer Science",
    "General Knowledge",
  ];

  const difficultyLevels = ["easy", "medium", "hard"];

  // Fetch exams on component mount
  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const response = await api.get("/exams/my-exams");
      setExams(response.data.exams);
    } catch (error) {
      console.error("Error fetching exams:", error);
    }
  };

  const fetchExamDetails = async (examId) => {
    try {
      setLoading(true);
      const response = await api.get(`/exams/${examId}`);
      setSelectedExam(response.data.exam);
      console.log("Exam Details Response:", response.data); 
      setCurrentExamQuestions(response.data.questions || []);
      setShowExamDetails(true);
    } catch (error) {
      toast.error("Failed to fetch exam details");
    } finally {
      setLoading(false);
    }
  };

  // Handle Exam Creation
  const handleCreateExam = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post("/exams", examForm);
      toast.success("Exam created successfully!");

      // Reset form and switch to questions tab
      setExamForm({
        title: "",
        grade: "",
        subject: "",
        startTime: "",
        duration: "",
        description: "",
      });

      setSelectedExam(response.data.exam);
      setShowQuestionModal(true);
      fetchExams();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to create exam");
    } finally {
      setLoading(false);
    }
  };

  // Handle Add Question
  const handleAddQuestion = async () => {
    // Validation
    if (!questionForm.questionText.trim()) {
      toast.error("Please enter question text");
      return;
    }

    if (questionForm.options.some((opt) => !opt.trim())) {
      toast.error("All options must be filled");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/exams/question", {
        examId: selectedExam._id,
        ...questionForm,
      });

      toast.success("Question added successfully!");

      // Add to local questions list
      setCurrentExamQuestions([
        ...currentExamQuestions,
        response.data.question,
      ]);

      // Reset question form
      setQuestionForm({
        questionText: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
        marks: 1,
        negativeMarks: 0,
        difficultyLevel: "medium",
        topic: "",
        explanation: "",
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to add question");
    } finally {
      setLoading(false);
    }
  };

  // Handle Publish Exam
  const handlePublishExam = async () => {
    setLoading(true);

    try {
      const response = await api.post("/exams/publish", {
        examId: selectedExam._id,
      });

      toast.success("Exam published successfully!");
      setShowPublishModal(false);
      setShowExamDetails(false);
      fetchExams();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to publish exam");
    } finally {
      setLoading(false);
    }
  };

  // Handle option change in question form
  const handleOptionChange = (index, value) => {
    const newOptions = [...questionForm.options];
    newOptions[index] = value;
    setQuestionForm({ ...questionForm, options: newOptions });
  };


  const handleUpdateExam = async () => {
  try {
    setLoading(true);

    await api.put(`/exams/${selectedExam._id}`, examForm);

    toast.success("Exam updated successfully");

    setShowEditModal(false);
    setSelectedExam(null);
    fetchExams();
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to update exam");
  } finally {
    setLoading(false);
  }
};

const handleDeleteExam = async () => {
  try {
    setLoading(true);

    await api.delete(`/exams/${selectedExam._id}`);

    toast.success("Exam deleted successfully");

    setShowDeleteModal(false);
    setSelectedExam(null);
    fetchExams();
  } catch (error) {
    toast.error(error.response?.data?.message || "Failed to delete exam");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div
        className="bg-white shadow-sm border-b"
        style={{ borderColor: "#0B234A" }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center">
            <BookOpen className="h-8 w-8 mr-3" style={{ color: "#EA8E0A" }} />
            <h1 className="text-2xl font-bold" style={{ color: "#0B234A" }}>
              Exam Management
            </h1>
          </div>
          <p className="mt-1 text-sm text-gray-600">
            Create exams, add questions, and publish for students
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="flex space-x-1 mb-6">
          <button
            onClick={() => setActiveTab("create")}
            className={`flex-1 py-3 px-4 text-sm font-medium rounded-md transition-colors ${
              activeTab === "create"
                ? "text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            style={activeTab === "create" ? { backgroundColor: "#0B234A" } : {}}
          >
            Create New Exam
          </button>
          <button
            onClick={() => setActiveTab("my-exams")}
            className={`flex-1 py-3 px-4 text-sm font-medium rounded-md transition-colors ${
              activeTab === "my-exams"
                ? "text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            style={
              activeTab === "my-exams" ? { backgroundColor: "#EA8E0A" } : {}
            }
          >
            My Exams
          </button>
        </div>

        {activeTab === "create" ? (
          /* Create Exam Form */
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2
              className="text-lg font-semibold mb-4"
              style={{ color: "#0B234A" }}
            >
              Exam Details
            </h2>

            <form onSubmit={handleCreateExam} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Exam Title
                  </label>
                  <input
                    type="text"
                    required
                    value={examForm.title}
                    onChange={(e) =>
                      setExamForm({ ...examForm, title: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                    style={{ focusRingColor: "#0B234A" }}
                    placeholder="e.g., Final Term Examination"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject
                  </label>
                  <select
                    required
                    value={examForm.subject}
                    onChange={(e) =>
                      setExamForm({ ...examForm, subject: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                    style={{ focusRingColor: "#0B234A" }}
                  >
                    <option value="">Select Subject</option>
                    {subjects.map((subject) => (
                      <option key={subject} value={subject}>
                        {subject}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Grade
                  </label>
                  <select
                    required
                    value={examForm.grade}
                    onChange={(e) =>
                      setExamForm({ ...examForm, grade: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                    style={{ focusRingColor: "#0B234A" }}
                  >
                    <option value="">Select Grade</option>
                    {grades.map((grade) => (
                      <option key={grade} value={grade}>
                        {grade}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Duration (minutes)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={examForm.duration}
                    onChange={(e) =>
                      setExamForm({ ...examForm, duration: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                    style={{ focusRingColor: "#0B234A" }}
                    placeholder="60"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={examForm.startTime}
                    onChange={(e) =>
                      setExamForm({ ...examForm, startTime: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                    style={{ focusRingColor: "#0B234A" }}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (Optional)
                  </label>
                  <textarea
                    rows="3"
                    value={examForm.description}
                    onChange={(e) =>
                      setExamForm({ ...examForm, description: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                    style={{ focusRingColor: "#0B234A" }}
                    placeholder="Additional instructions or notes..."
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 text-white font-medium rounded-md hover:opacity-90 disabled:opacity-50 flex items-center"
                  style={{ backgroundColor: "#0B234A" }}
                >
                  {loading ? (
                    <>
                      <Loader className="h-5 w-5 animate-spin mr-2" />{" "}
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="h-5 w-5 mr-2" /> Create Exam & Add
                      Questions
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* My Exams List */
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div
              className="px-6 py-4 border-b"
              style={{ backgroundColor: "#0B234A" }}
            >
              <h2 className="text-lg font-semibold text-white">My Exams</h2>
            </div>

            <div className="divide-y">
              {exams.length > 0 ? (
                exams.map((exam) => (
                  <div key={exam._id} className="px-6 py-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {exam.title}
                        </h3>
                        <div className="flex items-center mt-1 text-sm text-gray-600">
                          <BookOpen className="h-4 w-4 mr-1" />
                          {exam.subject} • Grade {exam.grade}
                          <Clock className="h-4 w-4 ml-3 mr-1" />
                          {exam.duration} mins
                          <span
                            className={`ml-3 px-2 py-0.5 text-xs rounded-full ${
                              exam.status === "published"
                                ? "bg-green-100 text-green-800"
                                : exam.status === "draft"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {exam.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">

                        {exam.status === "draft" && (<><button
  onClick={() => {
    setSelectedExam(exam);
    setExamForm({
      title: exam.title,
      grade: exam.grade,
      subject: exam.subject,
      startTime: exam.startTime?.slice(0, 16),
      duration: exam.duration,
      description: exam.description || "",
    });
    setShowEditModal(true);
  }}
  className="p-2 text-purple-600 hover:bg-purple-50 rounded-md"
>
  <Edit className="h-4 w-4" />
</button>

<button
  onClick={() => {
    setSelectedExam(exam);
    setShowDeleteModal(true);
  }}
  className="p-2 text-red-600 hover:bg-red-50 rounded-md"
>
  <Trash2 className="h-4 w-4" />
</button></>)}
                        <button
                          onClick={() => fetchExamDetails(exam._id)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {exam.status === "draft" && (
                          <>
                            <button
                              onClick={() => {
                                setSelectedExam(exam);
                                setShowQuestionModal(true);
                              }}
                              className="p-2 text-orange-600 hover:bg-orange-50 rounded-md"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedExam(exam);
                                setShowPublishModal(true);
                              }}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-md"
                            >
                              <Send className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-6 py-8 text-center text-gray-500">
                  No exams created yet
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Question Modal */}
      {showQuestionModal && selectedExam && (
        <div className="fixed inset-0 bg-white/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div
              className="px-6 py-4 border-b flex items-center justify-between"
              style={{ backgroundColor: "#0B234A" }}
            >
              <h2 className="text-lg font-semibold text-white flex items-center">
                <HelpCircle className="h-5 w-5 mr-2" />
                Add Questions - {selectedExam.title}
              </h2>
              <button
                onClick={() => setShowQuestionModal(false)}
                className="text-white hover:text-gray-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              {/* Questions List */}
              {currentExamQuestions.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">
                    Added Questions ({currentExamQuestions.length})
                  </h3>
                  <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                    {Array.isArray(currentExamQuestions) &&
                      currentExamQuestions.map((q, idx) => (
                        <div
                          key={q._id || idx}
                          className="mb-3 pb-3 border-b last:border-0"
                        >
                          <p className="text-sm font-medium">
                            {idx + 1}. {q.questionText}
                          </p>
                          <div className="flex items-center mt-1 text-xs text-gray-600">
                            <span className="mr-3">Marks: {q.marks}</span>
                            <span className="mr-3">
                              Difficulty: {q.difficultyLevel}
                            </span>
                            <span>Topic: {q.topic || "General"}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Add Question Form */}
              <h3
                className="text-md font-medium mb-3"
                style={{ color: "#0B234A" }}
              >
                Add New Question
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Question Text
                  </label>
                  <textarea
                    rows="2"
                    value={questionForm.questionText}
                    onChange={(e) =>
                      setQuestionForm({
                        ...questionForm,
                        questionText: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                    style={{ focusRingColor: "#0B234A" }}
                    placeholder="Enter your question here..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {[0, 1, 2, 3].map((idx) => (
                    <div key={idx}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Option {idx + 1}
                      </label>
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name="correctAnswer"
                          checked={questionForm.correctAnswer === idx}
                          onChange={() =>
                            setQuestionForm({
                              ...questionForm,
                              correctAnswer: idx,
                            })
                          }
                          className="mr-2"
                        />
                        <input
                          type="text"
                          value={questionForm.options[idx]}
                          onChange={(e) =>
                            handleOptionChange(idx, e.target.value)
                          }
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                          style={{ focusRingColor: "#0B234A" }}
                          placeholder={`Option ${idx + 1}`}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Marks
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={questionForm.marks}
                      onChange={(e) =>
                        setQuestionForm({
                          ...questionForm,
                          marks: parseFloat(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                      style={{ focusRingColor: "#0B234A" }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Negative Marks
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.25"
                      value={questionForm.negativeMarks}
                      onChange={(e) =>
                        setQuestionForm({
                          ...questionForm,
                          negativeMarks: parseFloat(e.target.value),
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                      style={{ focusRingColor: "#0B234A" }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Difficulty
                    </label>
                    <select
                      value={questionForm.difficultyLevel}
                      onChange={(e) =>
                        setQuestionForm({
                          ...questionForm,
                          difficultyLevel: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                      style={{ focusRingColor: "#0B234A" }}
                    >
                      {difficultyLevels.map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Topic
                    </label>
                    <input
                      type="text"
                      value={questionForm.topic}
                      onChange={(e) =>
                        setQuestionForm({
                          ...questionForm,
                          topic: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                      style={{ focusRingColor: "#0B234A" }}
                      placeholder="e.g., Algebra"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Explanation (Optional)
                  </label>
                  <textarea
                    rows="2"
                    value={questionForm.explanation}
                    onChange={(e) =>
                      setQuestionForm({
                        ...questionForm,
                        explanation: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                    style={{ focusRingColor: "#0B234A" }}
                    placeholder="Explain the correct answer..."
                  />
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setSelectedExam(null);
                      setShowQuestionModal(false);
                    }}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Close
                  </button>
                  <button
                    onClick={handleAddQuestion}
                    disabled={loading}
                    className="px-4 py-2 text-white font-medium rounded-md hover:opacity-90 disabled:opacity-50 flex items-center"
                    style={{ backgroundColor: "#EA8E0A" }}
                  >
                    {loading ? (
                      <>
                        <Loader className="h-4 w-4 animate-spin mr-2" />{" "}
                        Adding...
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4 mr-2" /> Add Question
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Publish Exam Modal */}
      {showPublishModal && selectedExam && (
        <div className="fixed inset-0 bg-white/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div
              className="px-6 py-4 border-b"
              style={{ backgroundColor: "#0B234A" }}
            >
              <h2 className="text-lg font-semibold text-white">Publish Exam</h2>
            </div>

            <div className="p-6">
              <div className="text-center mb-4">
                <Send
                  className="h-12 w-12 mx-auto mb-3"
                  style={{ color: "#EA8E0A" }}
                />
                <h3 className="text-lg font-medium text-gray-900">
                  Ready to publish?
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Are you sure you want to publish "{selectedExam.title}"? Once
                  published, you cannot modify the exam.
                </p>
              </div>

              <div className="bg-yellow-50 p-3 rounded-md mb-4">
                <p className="text-xs text-yellow-800 flex items-center">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  Students will be able to see and attempt this exam once
                  published.
                </p>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowPublishModal(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePublishExam}
                  disabled={loading}
                  className="px-4 py-2 text-white font-medium rounded-md hover:opacity-90 disabled:opacity-50 flex items-center"
                  style={{ backgroundColor: "#E22213" }}
                >
                  {loading ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin mr-2" />{" "}
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-2" /> Publish Exam
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Exam Details Modal */}
      {showExamDetails && selectedExam && (
        <div className="fixed inset-0 bg-white/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div
              className="px-6 py-4 border-b flex items-center justify-between"
              style={{ backgroundColor: "#0B234A" }}
            >
              <h2 className="text-lg font-semibold text-white">Exam Details</h2>
              <button
                onClick={() => {
                  setShowExamDetails(false);
                  setSelectedExam(null);
                }}
                className="text-white hover:text-gray-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6">
              {/* Exam Info */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-sm text-gray-600">Title</p>
                  <p className="font-medium">{selectedExam.title}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status</p>
                  <span
                    className={`inline-block px-2 py-1 text-xs rounded-full ${
                      selectedExam.status === "published"
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {selectedExam.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Subject</p>
                  <p>{selectedExam.subject}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Grade</p>
                  <p>{selectedExam.grade}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Duration</p>
                  <p>{selectedExam.duration} minutes</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Start Time</p>
                  <p>{new Date(selectedExam.startTime).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">End Time</p>
                  <p>{new Date(selectedExam.endTime).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Questions</p>
                  <p>{currentExamQuestions.length}</p>
                </div>
              </div>

              {/* Questions List */}
              <h3 className="font-medium mb-3" style={{ color: "#0B234A" }}>
                Questions ({currentExamQuestions.length})
              </h3>

              {currentExamQuestions.length > 0 ? (
                <div className="space-y-4">
                  {currentExamQuestions.map((q, idx) => (
                    <div key={q._id} className="border rounded-lg p-4">
                      <div className="flex justify-between">
                        <p className="font-medium">
                          Q{idx + 1}. {q.questionText}
                        </p>
                        <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {q.marks} marks
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {Array.isArray(q.options) && q.options.length > 0 ? (
                          q.options.map((opt, optIdx) => (
                            <div
                              key={optIdx}
                              className={`text-sm p-2 rounded ${
                                q.correctAnswer === optIdx
                                  ? "bg-green-100 border border-green-300"
                                  : "bg-gray-50"
                              }`}
                            >
                              {String.fromCharCode(65 + optIdx)}.{" "}
                              {typeof opt === "string" ? opt : opt?.text || ""}
                              {q.correctAnswer === optIdx && (
                                <CheckCircle className="h-4 w-4 text-green-600 inline ml-2" />
                              )}
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-400 text-sm">
                            No options available
                          </p>
                        )}
                      </div>

                      {q.explanation && (
                        <div className="mt-2 text-sm text-gray-600 bg-blue-50 p-2 rounded">
                          <span className="font-medium">Explanation:</span>{" "}
                          {q.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500 py-4">
                  No questions added yet
                </p>
              )}

              {selectedExam.status === "draft" && (
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => {
                      setShowExamDetails(false);
                      setShowQuestionModal(true);
                    }}
                    className="px-4 py-2 text-orange-600 border border-orange-300 rounded-md hover:bg-orange-50"
                  >
                    <Plus className="h-4 w-4 inline mr-1" /> Add More Questions
                  </button>
                  <button
                    onClick={() => {
                      setShowExamDetails(false);
                      setShowPublishModal(true);
                    }}
                    className="px-4 py-2 text-white font-medium rounded-md hover:opacity-90"
                    style={{ backgroundColor: "#0B234A" }}
                  >
                    <Send className="h-4 w-4 inline mr-1" /> Publish Exam
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}


      {/* Edit Exam Modal */}
{showEditModal && selectedExam && (
  <div className="fixed inset-0 bg-white/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
      <h2 className="text-lg font-semibold mb-4">Edit Exam</h2>

      <div className="space-y-4">

  <div>
    <label className="block text-sm mb-1">Title</label>
    <input
      type="text"
      value={examForm.title}
      onChange={(e) =>
        setExamForm({ ...examForm, title: e.target.value })
      }
      className="w-full border p-2 rounded"
    />
  </div>

  <div>
    <label className="block text-sm mb-1">Start Time</label>
    <input
      type="datetime-local"
      value={examForm.startTime}
      onChange={(e) =>
        setExamForm({ ...examForm, startTime: e.target.value })
      }
      className="w-full border p-2 rounded"
    />
  </div>

  <div>
    <label className="block text-sm mb-1">Duration (minutes)</label>
    <input
      type="number"
      min="1"
      value={examForm.duration}
      onChange={(e) =>
        setExamForm({ ...examForm, duration: e.target.value })
      }
      className="w-full border p-2 rounded"
    />
  </div>

  <div>
    <label className="block text-sm mb-1">Description</label>
    <textarea
      value={examForm.description}
      onChange={(e) =>
        setExamForm({ ...examForm, description: e.target.value })
      }
      className="w-full border p-2 rounded"
    />
  </div>

</div>

      <div className="flex justify-end mt-4 space-x-3">
        <button
          onClick={() => setShowEditModal(false)}
          className="px-4 py-2 border rounded"
        >
          Cancel
        </button>
        <button
          onClick={handleUpdateExam}
          className="px-4 py-2 text-white rounded"
          style={{ backgroundColor: "#0B234A" }}
        >
          Update
        </button>
      </div>
    </div>
  </div>
)}

{/* Delete Exam Modal */}
{showDeleteModal && selectedExam && (
  <div className="fixed inset-0 bg-white/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
      <h2 className="text-lg font-semibold text-red-600 mb-3">
        Delete Exam
      </h2>
      <p className="text-sm text-gray-600 mb-4">
        Are you sure you want to delete "{selectedExam.title}"?
        This will also delete all questions and attempts.
      </p>

      <div className="flex justify-end space-x-3">
        <button
          onClick={() => setShowDeleteModal(false)}
          className="px-4 py-2 border rounded"
        >
          Cancel
        </button>
        <button
          onClick={handleDeleteExam}
          className="px-4 py-2 text-white rounded bg-red-600"
        >
          Delete
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
};

export default ExamCreationPage;
