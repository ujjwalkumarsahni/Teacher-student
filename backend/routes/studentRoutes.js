import express from "express";
import { authenticate } from "../middleware/auth.js";
import {
  registerStudent,
  bulkRegisterStudentsExcel,
  getAllStudents,
  getRecentStudents
} from "../controllers/studentController.js";
import upload from "../middleware/upload.js"; 

const router = express.Router();
router.use(authenticate);
/* ================= STUDENT ROUTES ================= */

router.post('/register', registerStudent);
router.post('/bulk-upload', upload.single('file'), bulkRegisterStudentsExcel);
router.get('/recent', getRecentStudents);
router.get("/", getAllStudents);

export default router;