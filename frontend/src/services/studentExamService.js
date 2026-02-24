// src/services/studentExamService.js
import api from "./api";

export const getAvailableExams = async () => {
  try {
    const response = await api.get("/student/exams/available");
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const startExam = async (examId) => {
  try {
    const response = await api.post("/student/exams/start", { examId });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const getExamQuestions = async (examId) => {
  try {
    const response = await api.get(`/student/exams/${examId}/questions`);
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const saveAnswer = async (examId, questionId, selectedOption) => {
  try {
    const response = await api.post("/student/exams/save-answer", {
      examId,
      questionId,
      selectedOption
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};

export const submitExam = async (examId, answers) => {
  try {
    const response = await api.post("/student/exams/submit", {
      examId,
      answers
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};



export const getAttemptedExams = async () => {
  try {
    const response = await api.get("/student/exams/attempted");
    return response.data;
  } catch (error) {
    throw error.response?.data || error.message;
  }
};