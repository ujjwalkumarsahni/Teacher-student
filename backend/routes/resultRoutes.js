// backend/routes/resultRoutes.js
import express from "express";
import { authenticate } from "../middleware/auth.js";
import {
  getExamResultsForVerification,
  verifyStudentResult,
  verifyAllResults,
  getStudentResults,
  getStudentExamResult,
  getAttemptDetails
} from "../controllers/resultController.js";

const router = express.Router();

/* ================= COMMON MIDDLEWARE ================= */
router.use(authenticate);

/* =======================================================
   👨‍🏫 EMPLOYEE RESULT VERIFICATION ROUTES
======================================================= */

// Get all submitted results for verification
// GET /api/employee/exams/:examId/results
router.get(
  "/employee/exams/:examId/results",
  getExamResultsForVerification
);

// Verify single student result
// POST /api/employee/results/verify
router.post(
  "/employee/results/verify",
  verifyStudentResult
);

// Verify all results for an exam
// POST /api/employee/results/verify-all
router.post(
  "/employee/results/verify-all",
  verifyAllResults
);

/* =======================================================
   🎓 STUDENT RESULT ROUTES
======================================================= */

// Get all verified results of logged-in student
// GET /api/student/results
router.get(
  "/student/results",
  getStudentResults
);

// Get detailed result of specific exam
// GET /api/student/results/:examId
router.get( 
  "/student/results/:examId",
  getStudentExamResult
);

router.get(
  "/employee/attempt/:attemptId/details",
  getAttemptDetails
);

export default router;