import express, { Router } from "express";

import {
  getStudentsBySchool,
  getSchoolExams,
  getAdminDashboard,
  getGradeWiseStudents,
  getExamDetailsAdmin,
  getSchoolResults,
  getStudentDetailsAdmin,
  getAllSchools,
  getAllExams,
  getAllStudents,
  getAllResults
} from "../controllers/adminPanelController.js";

import { authenticate } from "../middleware/auth.js";

const router = express.Router();
router.use(authenticate)
router.get("/dashboard", authenticate, getAdminDashboard);

router.get("/schools/:schoolId/students", authenticate, getStudentsBySchool);

router.get("/schools/:schoolId/exams", authenticate, getSchoolExams);

router.get("/schools/:schoolId/grades", authenticate, getGradeWiseStudents);

router.get("/exams/:examId", getExamDetailsAdmin);


// School wise student results
router.get(
  "/schools/:schoolId/results",
  getSchoolResults
);

router.get(
  "/students/:studentId",
  getStudentDetailsAdmin
);



router.get("/schools", getAllSchools);

router.get("/exams", getAllExams);

router.get("/students", getAllStudents);

router.get("/results", getAllResults);


export default router;