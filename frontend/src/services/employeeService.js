// src/services/employeeService.js
import api from "./api";

export const getRecentExams = async () => {
  try {
    const response = await api.get('/students/recent');
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch exams" };
  }
};

export const getAllExams = async () => {
  try {
    const response = await api.get("/employees/exams");
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch exams" };
  }
};