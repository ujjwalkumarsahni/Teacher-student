// import api from "./api";

// /* =============================
//    ADMIN DASHBOARD
// ============================= */

// export const getAdminDashboard = async () => {
//   const res = await api.get("/admin/dashboard");
//   return res.data;
// };


// /* =============================
//    SCHOOL STUDENTS
// ============================= */

// // Get students of a school
// export const getStudentsBySchool = async (schoolId, grade = null) => {

//   let url = `/admin/schools/${schoolId}/students`;

//   if (grade) {
//     url += `?grade=${grade}`;
//   }

//   const res = await api.get(url);

//   return res.data;
// };


// // Grade wise student count
// export const getGradeWiseStudents = async (schoolId) => {

//   const res = await api.get(`/admin/schools/${schoolId}/grades`);

//   return res.data;
// };


// /* =============================
//    SCHOOL EXAMS
// ============================= */

// export const getSchoolExams = async (schoolId) => {

//   const res = await api.get(`/admin/schools/${schoolId}/exams`);

//   return res.data;
// };


// // Exam detail + questions
// export const getExamDetails = async (examId) => {

//   const res = await api.get(`/admin/exams/${examId}`);

//   return res.data;
// };


// /* =============================
//    SCHOOL RESULTS
// ============================= */

// export const getSchoolResults = async (
//   schoolId,
//   { examId = null, grade = null } = {}
// ) => {

//   let url = `/admin/schools/${schoolId}/results`;

//   const params = [];

//   if (examId) params.push(`examId=${examId}`);
//   if (grade) params.push(`grade=${grade}`);

//   if (params.length) {
//     url += `?${params.join("&")}`;
//   }

//   const res = await api.get(url);

//   return res.data;
// };


// /* =============================
//    STUDENT DETAILS + HISTORY
// ============================= */

// export const getStudentDetails = async (studentId) => {

//   const res = await api.get(`/admin/students/${studentId}`);

//   return res.data;
// };



// src/services/adminService.js
import api from "./api";

/* =============================
   ADMIN DASHBOARD
============================= */

export const getAdminDashboard = async () => {
  const res = await api.get("/admin/dashboard");
  return res.data;
};

/* =============================
   SCHOOL MANAGEMENT
============================= */

// Get all schools (if you need this endpoint)
export const getAllSchools = async () => {
  const res = await api.get("/admin/schools");
  return res.data;
};

// Get students of a school
export const getStudentsBySchool = async (schoolId, grade = null) => {
  let url = `/admin/schools/${schoolId}/students`;
  if (grade) {
    url += `?grade=${grade}`;
  }
  const res = await api.get(url);
  return res.data;
};

// Grade wise student count
export const getGradeWiseStudents = async (schoolId) => {
  const res = await api.get(`/admin/schools/${schoolId}/grades`);
  return res.data;
};

// Get school exams
export const getSchoolExams = async (schoolId) => {
  const res = await api.get(`/admin/schools/${schoolId}/exams`);
  return res.data;
};

// Get school results
export const getSchoolResults = async (schoolId, { examId = null, grade = null } = {}) => {
  let url = `/admin/schools/${schoolId}/results`;
  const params = [];
  if (examId) params.push(`examId=${examId}`);
  if (grade) params.push(`grade=${grade}`);
  if (params.length) {
    url += `?${params.join("&")}`;
  }
  const res = await api.get(url);
  return res.data;
};

/* =============================
   EXAM MANAGEMENT
============================= */

// Get all exams (if you need this endpoint)
export const getAllExams = async () => {
  const res = await api.get("/admin/exams");
  return res.data;
};

// Get exam details with questions
export const getExamDetails = async (examId) => {
  const res = await api.get(`/admin/exams/${examId}`);
  return res.data;
};

/* =============================
   STUDENT MANAGEMENT
============================= */

// Get student details with exam history
export const getStudentDetails = async (studentId) => {
  const res = await api.get(`/admin/students/${studentId}`);
  return res.data;
};

// Get all students (if you need this endpoint)
export const getAllStudents = async (filters = {}) => {
  let url = "/admin/students";
  const params = [];
  if (filters.grade) params.push(`grade=${filters.grade}`);
  if (filters.school) params.push(`school=${filters.school}`);
  if (filters.search) params.push(`search=${filters.search}`);
  if (params.length) {
    url += `?${params.join("&")}`;
  }
  const res = await api.get(url);
  return res.data;
};

/* =============================
   RESULTS MANAGEMENT
============================= */

// Get all results with filters
export const getAllResults = async (filters = {}) => {
  let url = "/admin/results";
  const params = [];
  if (filters.school) params.push(`school=${filters.school}`);
  if (filters.exam) params.push(`exam=${filters.exam}`);
  if (filters.grade) params.push(`grade=${filters.grade}`);
  if (filters.status) params.push(`status=${filters.status}`);
  if (filters.fromDate) params.push(`fromDate=${filters.fromDate}`);
  if (filters.toDate) params.push(`toDate=${filters.toDate}`);
  if (params.length) {
    url += `?${params.join("&")}`;
  }
  const res = await api.get(url);
  return res.data;
};

// Export results
export const exportResults = async (filters = {}) => {
  let url = "/admin/results/export";
  const params = [];
  if (filters.school) params.push(`school=${filters.school}`);
  if (filters.exam) params.push(`exam=${filters.exam}`);
  if (filters.grade) params.push(`grade=${filters.grade}`);
  if (filters.fromDate) params.push(`fromDate=${filters.fromDate}`);
  if (filters.toDate) params.push(`toDate=${filters.toDate}`);
  if (params.length) {
    url += `?${params.join("&")}`;
  }
  const res = await api.get(url, { responseType: 'blob' });
  return res.data;
};