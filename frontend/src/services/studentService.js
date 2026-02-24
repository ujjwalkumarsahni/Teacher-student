// services/studentService.js

import api from "./api";

export const registerStudent = (data) =>
  api.post("/students/register", data);

export const bulkUploadStudents = (file) => {
  const formData = new FormData();
  formData.append("file", file);

  return api.post("/students/bulk-upload", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const getStudents = (params) =>
  api.get("/students", { params });