import express from "express";
import { authenticate } from "../middleware/auth.js";
import {
  createExam,
  updateExam,          // ✅ add
  deleteExam,          // ✅ add
  getMyExams,
  getExamDetails,
  createQuestion,
  deleteQuestion,
  publishExam,
  getExamResults,
  getEmployeeExams
} from "../controllers/ExamController.js";

const router = express.Router();

router.use(authenticate);

/* ================= EMPLOYEE EXAM ROUTES ================= */

// Create exam
router.post("/", createExam);

// Get all exams (dashboard list with stats)
router.get("/", getEmployeeExams);

// Get exams (older version if needed)
router.get("/my-exams", getMyExams);

// Update exam
router.put("/:examId", updateExam);

// Delete exam (also deletes questions + attempts)
router.delete("/:examId", deleteExam);

// Get single exam details with questions
router.get("/:examId", getExamDetails);

// Add question
router.post("/question", createQuestion);

// Delete question
router.delete("/question/:questionId", deleteQuestion);

// Publish exam
router.post("/publish", publishExam);

// Get exam results
router.get("/:examId/results", getExamResults);

export default router;