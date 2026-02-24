import express from "express";
import { authenticate } from "../middleware/auth.js";
import {
  getAvailableExams,
  getExamQuestions,
  startExam,
  saveAnswer,
  submitExam,
  getAttemptedExams,
} from "../controllers/studentController.js";
import upload from "../middleware/upload.js"; 

const router = express.Router();
router.use(authenticate);
/* ================= STUDENT EXAM ROUTES ================= */

// Get available exams
router.get("/available", getAvailableExams);

// Start exam
router.post("/start", startExam);

// Get questions for active exam
router.get("/:examId/questions", getExamQuestions);

// Save answer (auto save)
router.post("/save-answer", saveAnswer);

// Submit exam
router.post("/submit", submitExam);

router.get("/attempted", getAttemptedExams);


export default router;