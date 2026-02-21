import express from "express";
import { authenticate } from "../middleware/auth.js";
import {
  registerStudent,
  bulkRegisterStudentsExcel,
  getAllStudents
} from "../controllers/studentController.js";
import upload from "../middleware/upload.js"; // multer config

const router = express.Router();

/* ================= STUDENT ROUTES ================= */

// Employee registers single student
router.post(
  "/register",
  authenticate,
  registerStudent
);

// Employee bulk upload
router.post(
  "/bulk-upload",
  authenticate,
  upload.single("file"),
  bulkRegisterStudentsExcel
);

// Get students (role-based: employee/admin)
router.get(
  "/",
  authenticate,
  getAllStudents
);

export default router;