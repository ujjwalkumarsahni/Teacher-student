import express from "express";
import { authenticate } from '../middleware/auth.js';
import { requireAdminOrHR } from '../middleware/profileCompletion.js';
import {bulkRegisterStudentsExcel, createEmployee, getAllEmployees, getAllStudents, getEmployeeById, registerStudent } from "../controllers/employeeController.js";
import upload from "../middleware/upload.js";

const router = express.Router();

router.post('/hr/create', authenticate, requireAdminOrHR, createEmployee);
router.get('/hr/employees', authenticate, requireAdminOrHR, getAllEmployees);
router.get(
  '/hr/employees/:id',
  authenticate,
  requireAdminOrHR,
  getEmployeeById
);


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
