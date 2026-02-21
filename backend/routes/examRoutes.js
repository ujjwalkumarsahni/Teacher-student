import express from "express";
import { authenticate } from "../middleware/auth.js";
import { createExam, createQuestion, getAvailableExams, getExamQuestions, getExamResults, publishExam, startExam, submitExam } from "../controllers/ExamController.js";
const router = express.Router();

/* ===========================
   EMPLOYEE ROUTES
=========================== */

// Create new exam
router.post(
  "/",
  authenticate,
  createExam
);

// Add question to exam
router.post(
  "/question",
  authenticate,
  createQuestion
);

// Publish exam
router.post(
  "/publish",
  authenticate,
  publishExam
);


/* ===========================
   STUDENT ROUTES
=========================== */

// Get available exams for logged in student
router.get(
  "/available",
  authenticate,
  getAvailableExams
);

// Start exam
router.post(
  "/start",
  authenticate,
  startExam
);

// Get exam questions (after start)
router.get(
  "/:examId/questions",
  authenticate,
  getExamQuestions
);

// Submit exam
router.post(
  "/submit",
  authenticate,
  submitExam
);


router.get(
  "/:examId/results",
  authenticate,
  getExamResults
);

export default router;