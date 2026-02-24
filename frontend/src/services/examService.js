import api from "./api";

/* ================= EMPLOYEE ================= */

// Create exam
export const createExam = (data) => api.post("/exams", data);

// Get all employee exams (dashboard list)
export const getEmployeeExams = () => api.get("/exams");

// Get single exam details
export const getExamDetails = (examId) =>
  api.get(`/exams/${examId}`);

// Update exam
export const updateExam = (examId, data) =>
  api.put(`/exams/${examId}`, data);

// Delete exam (cascade delete questions + attempts)
export const deleteExam = (examId) =>
  api.delete(`/exams/${examId}`);

// Add question
export const addQuestion = (data) => {
  const formattedData = {
    examId: data.examId,
    questionText: data.questionText,
    options: data.options,
    correctAnswer: data.correctAnswer,
    marks: data.marks || 1,
    negativeMarks: data.negativeMarks || 0,
    difficultyLevel: data.difficultyLevel || "medium",
    topic: data.topic || "",
    explanation: data.explanation || "",
  };

  return api.post("/exams/question", formattedData);
};

// Delete question
export const deleteQuestion = (questionId) =>
  api.delete(`/exams/question/${questionId}`);

// Publish exam
export const publishExam = (examId) =>
  api.post("/exams/publish", { examId });   // ⚠️ FIXED (must send object)

// Get exam results (employee)
export const getExamResults = (examId) =>
  api.get(`/exams/${examId}/results`);


/* ================= STUDENT ================= */

// Get available exams
export const getAvailableExams = () =>
  api.get("/exams/available");

// Start exam
export const startExam = (examId) =>
  api.post("/exams/start", { examId });

// Get exam questions
export const getExamQuestions = (examId) =>
  api.get(`/exams/${examId}/questions`);

// Submit exam
export const submitExam = (examId, answers) =>
  api.post("/exams/submit", { examId, answers });