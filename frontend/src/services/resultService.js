import api from "./api";

/* ======================================================
   👨‍🏫 EMPLOYEE RESULT APIs
====================================================== */

// Get all submitted results for verification
export const getExamResultsForVerification = async (examId) => {
  const { data } = await api.get(
    `/employee/exams/${examId}/results`
  );
  return data;
};

// Verify single student result
export const verifyStudentResult = async (attemptId, remarks = "") => {
  const { data } = await api.post(
    `/employee/results/verify`,
    { attemptId, remarks }
  );
  return data;
};

// Verify all results
export const verifyAllResults = async (examId) => {
  const { data } = await api.post(
    `/employee/results/verify-all`,
    { examId }
  );
  return data;
};


/* ======================================================
   🎓 STUDENT RESULT APIs
====================================================== */

// Get all verified results (student dashboard)
export const getStudentResults = async () => {
  const { data } = await api.get(`/student/results`);
  return data;
};

// Get detailed result of specific exam
export const getStudentExamResult = async (examId) => {
  const { data } = await api.get(
    `/student/results/${examId}`
  );
  return data;
};