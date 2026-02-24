import bcrypt from "bcryptjs";
import xlsx from "xlsx";
import fs from "fs";
import User from "../models/User.js";
import Student from "../models/Student.js";
import UserRole from "../models/UserRole.js";
import Employee from "../models/Employee.js";
import EmployeePosting from "../models/EmployeePosting.js";
import ExamAttempt from "../models/ExamAttempt.js";
import Exam from "../models/Exam.js";
import Question from "../models/Question.js";
// Helper function to get employee's school
const getEmployeeSchool = async (userId) => {
  const employee = await Employee.findOne({ user: userId });

  if (!employee) {
    throw new Error("Employee profile not found");
  }

  const posting = await EmployeePosting.findOne({
    employee: employee._id,
    isActive: true,
  });

  if (!posting) {
    throw new Error("Employee not assigned to any school");
  }

  return {
    employeeId: employee._id,
    schoolId: posting.school,
  };
};

// Register single student
export const registerStudent = async (req, res) => {
  try {
    if (req.user.role !== "employee") {
      return res.status(403).json({
        message: "Only employees can register students",
      });
    }

    const { name, email, password, grade } = req.body;

    // Validation
    if (!name || !email || !password || !grade) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    // Check if email exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // Get employee's school
    const { employeeId, schoolId } = await getEmployeeSchool(req.user._id);

    const user = await User.create({
      name,
      email,
      passwordHash: password, // raw password
      role: "student",
    });

    // Create student profile
    const student = await Student.create({
      user: user._id,
      grade,
      school: schoolId,
      createdByEmployee: employeeId,
    });

    // Create user role
    await UserRole.create({
      user: user._id,
      role: "student",
      assignedBy: req.user._id,
      isActive: true,
    });

    // Populate user data for response
    const populatedStudent = await Student.findById(student._id)
      .populate("user", "name email")
      .populate("school", "name");

    res.status(201).json({
      success: true,
      message: "Student registered successfully",
      student: populatedStudent,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Bulk register students from Excel
export const bulkRegisterStudentsExcel = async (req, res) => {
  try {
    if (req.user.role !== "employee") {
      return res.status(403).json({
        message: "Only employees can register students",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Excel file is required",
      });
    }

    // Get employee's school
    const { employeeId, schoolId } = await getEmployeeSchool(req.user._id);

    // Read Excel file
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json(worksheet);

    let created = 0;
    let failed = [];

    // Process each row
    for (const row of rows) {
      try {
        const name = String(row.Name || row.name || row.NAME || "").trim();
        const email = String(row.Email || row.email || row.EMAIL || "")
          .trim()
          .toLowerCase();
        const password = String(
          row.Password || row.password || row.PASSWORD || "",
        ).trim();
        const grade = String(row.Grade || row.grade || row.GRADE || "").trim();

        // Validate
        if (!name || !email || !password || !grade) {
          failed.push({
            name: name || "Unknown",
            email: email || "No email",
            grade: grade || "N/A",
            reason: "Missing required fields",
          });
          continue;
        }

        if (password.length < 6) {
          failed.push({
            name,
            email,
            grade,
            reason: "Password too short (min 6 characters)",
          });
          continue;
        }

        // Check if email exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          failed.push({
            name,
            email,
            grade,
            reason: "Email already exists",
          });
          continue;
        }

        const user = await User.create({
          name,
          email,
          passwordHash: password, // raw password
          role: "student",
        });

        // Create student profile
        await Student.create({
          user: user._id,
          grade,
          school: schoolId,
          createdByEmployee: employeeId,
        });

        // Create user role
        await UserRole.create({
          user: user._id,
          role: "student",
          assignedBy: req.user._id,
          isActive: true,
        });

        created++;
      } catch (err) {
        failed.push({
          name: row.name || "Unknown",
          email: row.email || "No email",
          grade: row.grade || "N/A",
          reason: "Creation failed: " + err.message,
        });
      }
    }

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      message: `Successfully registered ${created} students`,
      total: rows.length,
      created,
      failedCount: failed.length,
      failed: failed.slice(0, 20), // Return first 20 failures to avoid huge response
    });
  } catch (error) {
    // Clean up file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    res.status(400).json({ message: error.message });
  }
};

// Get recent student registrations
export const getRecentStudents = async (req, res) => {
  try {
    if (req.user.role !== "employee") {
      return res.status(403).json({
        message: "Only employees can view students",
      });
    }

    // Get employee's school
    const { schoolId } = await getEmployeeSchool(req.user._id);

    // Find recent students from this school
    const students = await Student.find({ school: schoolId })
      .populate("user", "name email")
      .populate("school", "name")
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      students,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getAllStudents = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", grade, school } = req.query;

    let schoolFilter = {};

    /* ================= ROLE BASED SCHOOL FILTER ================= */

    if (req.user.role === "employee") {
      const employee = await Employee.findOne({ user: req.user._id });

      if (!employee) {
        return res.status(400).json({
          message: "Employee profile not found",
        });
      }

      const posting = await EmployeePosting.findOne({
        employee: employee._id,
        isActive: true,
      });

      if (!posting) {
        return res.status(400).json({
          message: "Employee not assigned to any school",
        });
      }

      schoolFilter.school = posting.school;
    } else if (req.user.role === "admin" || req.user.role === "superadmin") {
      // If admin passes school in query, filter that school
      if (school) {
        schoolFilter.school = school;
      }
      // Otherwise no filter → all schools
    } else {
      return res.status(403).json({
        message: "Unauthorized access",
      });
    }

    /* ================= BASE QUERY ================= */

    if (grade) {
      schoolFilter.grade = grade;
    }

    /* ================= SEARCH FILTER ================= */

    let userFilter = {};

    if (search) {
      userFilter = {
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      };
    }

    /* ================= FETCH ================= */

    const students = await Student.find(schoolFilter)
      .populate({
        path: "user",
        match: userFilter,
        select: "name email",
      })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    const filtered = students.filter((s) => s.user);

    const total = await Student.countDocuments(schoolFilter);

    res.json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: filtered,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

export const saveAnswer = async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({ message: "Only students allowed" });
    }

    const { examId, questionId, selectedOption } = req.body;

    if (selectedOption < 0 || selectedOption > 3) {
      return res.status(400).json({
        message: "Invalid option",
      });
    }
    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return res.status(400).json({ message: "Student not found" });
    }
    const question = await Question.findOne({
      _id: questionId,
      exam: examId,
    });

    if (!question) {
      return res.status(400).json({
        message: "Invalid question",
      });
    }

    const attempt = await ExamAttempt.findOne({
      exam: examId,
      student: student._id,
      status: "in_progress",
    });

    if (!attempt) {
      return res.status(400).json({ message: "Exam not started" });
    }

    const exam = await Exam.findById(examId);

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    if (
      exam.school.toString() !== student.school.toString() ||
      exam.grade !== student.grade ||
      exam.status !== "published"
    ) {
      return res.status(403).json({
        message: "Unauthorized access",
      });
    }

    const attemptEndTime = new Date(
      attempt.startedAt.getTime() + exam.duration * 60000,
    );

    if (new Date() > attemptEndTime) {
      const questions = await Question.find({ exam: examId }).select(
        "marks correctAnswer negativeMarks",
      );

      let score = 0;

      for (const q of questions) {
        const studentAnswer = attempt.answers.find(
          (a) => String(a.question) === String(q._id),
        );

        if (!studentAnswer) continue;

        if (Number(studentAnswer.selectedOption) === Number(q.correctAnswer)) {
          score += q.marks;
        } else {
          score -= q.negativeMarks || 0;
        }
      }

      attempt.status = "submitted";
      attempt.submittedAt = attemptEndTime;
      attempt.score = score;

      await attempt.save();

      return res.status(400).json({
        message: "Exam time expired. Auto submitted.",
      });
    }

    const existingAnswerIndex = attempt.answers.findIndex(
      (a) => String(a.question) === String(questionId),
    );

    if (existingAnswerIndex > -1) {
      attempt.answers[existingAnswerIndex].selectedOption = selectedOption;
    } else {
      attempt.answers.push({
        question: questionId,
        selectedOption,
      });
    }

    await attempt.save();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getAvailableExams = async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({
        success: false,
        message: "Only students allowed",
      });
    }

    const student = await Student.findOne({ user: req.user._id }).lean();
    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
      });
    }

    const submittedAttempts = await ExamAttempt.find({
      student: student._id,
      status: "submitted",
    }).select("exam");

    const submittedExamIds = submittedAttempts.map((a) =>
      a.exam.toString()
    );

    const now = new Date();

    // Step 1: Get all valid exams
    const exams = await Exam.find({
      school: student.school,
      grade: String(student.grade),
      status: "published",
      endTime: { $gte: now },
      _id: { $nin: submittedExamIds },
    })
      .sort({ startTime: 1 })
      .lean();

    if (!exams.length) {
      return res.json({
        success: true,
        count: 0,
        exams: [],
      });
    }

    const examIds = exams.map((e) => e._id);

    // Step 2: Get question counts in ONE query (optimized)
    const questionStats = await Question.aggregate([
      { $match: { exam: { $in: examIds } } },
      {
        $group: {
          _id: "$exam",
          totalQuestions: { $sum: 1 },
          totalMarks: { $sum: "$marks" },
        },
      },
    ]);

    const statsMap = {};
    questionStats.forEach((q) => {
      statsMap[q._id.toString()] = q;
    });

    // Step 3: Attach stats and filter exams with 0 questions
    const formatted = exams
      .map((exam) => {
        const stats = statsMap[exam._id.toString()];

        if (!stats || stats.totalQuestions === 0) {
          return null; // 🚫 No questions → hide exam
        }

        const remainingMs = new Date(exam.endTime) - now;
        const notStarted = new Date(exam.startTime) > now;

        return {
          _id: exam._id,
          title: exam.title,
          subject: exam.subject,
          startTime: exam.startTime,
          endTime: exam.endTime,
          duration: exam.duration,
          totalQuestions: stats.totalQuestions,
          totalMarks: stats.totalMarks,
          passingMarks: exam.passingMarks || null,

          isUpcoming: notStarted,
          isExpired: remainingMs <= 0,
          isStarted: !notStarted && remainingMs > 0,

          remainingTimeInMinutes: Math.max(
            0,
            Math.floor(remainingMs / 60000)
          ),
        };
      })
      .filter(Boolean);

    return res.status(200).json({
      success: true,
      count: formatted.length,
      exams: formatted,
    });

  } catch (err) {
    console.error("getAvailableExams error:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getExamQuestions = async (req, res) => {
  try {
    const { examId } = req.params;
    if (!examId) {
      return res.status(403).json({ message: "exam id not found" });
    }
    if (req.user.role !== "student") {
      return res.status(403).json({ message: "Only students allowed" });
    }

    const student = await Student.findOne({ user: req.user._id });

    if (!student) {
      return res.status(400).json({ message: "Student profile not found" });
    }

    const exam = await Exam.findById(examId);

    if (!exam) return res.status(404).json({ message: "Exam not found" });

    const now = new Date();

    // Security checks
    if (
      exam.school.toString() !== student.school.toString() ||
      exam.grade !== student.grade ||
      exam.status !== "published" ||
      now < exam.startTime ||
      now > exam.endTime
    ) {
      return res.status(403).json({ message: "Exam not accessible" });
    }

    // Attempt must exist
    const attempt = await ExamAttempt.findOne({
      exam: examId,
      student: student._id,
      status: "in_progress",
    });

    if (!attempt) {
      return res.status(400).json({ message: "Start exam first" });
    }

    const nowTime = new Date();
    const attemptEndTime = new Date(attempt.endsAt);

    const remainingTimeInSeconds = Math.max(
      0,
      Math.floor((attemptEndTime - nowTime) / 1000),
    );
    if (nowTime >= attemptEndTime) {
      const questions = await Question.find({ exam: examId }).select(
        "marks correctAnswer negativeMarks",
      );

      let score = 0;

      for (const q of questions) {
        const studentAnswer = attempt.answers.find(
          (a) => String(a.question) === String(q._id),
        );

        if (!studentAnswer) continue;

        if (Number(studentAnswer.selectedOption) === Number(q.correctAnswer)) {
          score += q.marks;
        } else {
          score -= q.negativeMarks || 0;
        }
      }

      attempt.status = "submitted";
      attempt.submittedAt = attemptEndTime;
      attempt.score = score;

      await attempt.save();

      return res.status(400).json({
        message: "Exam time expired",
      });
    }

    const questions = await Question.find({ exam: examId }).select(
      "-correctAnswer",
    );

    res.json({
      success: true,
      exam: {
        title: exam.title,
        duration: exam.duration,
        endTime: exam.endTime,
      },
      questions,
      savedAnswers: attempt.answers,
      remainingTimeInSeconds,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const startExam = async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({ message: "Only students allowed" });
    }

    const { examId } = req.body;
    if (!examId) {
      return res.status(400).json({ message: "Exam id required" });
    }

    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return res.status(400).json({ message: "Student profile not found" });
    }

    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    const now = new Date();

    // Access checks
    if (
      exam.school.toString() !== student.school.toString() ||
      exam.grade !== student.grade ||
      exam.status !== "published" ||
      now < exam.startTime ||
      now >= exam.endTime
    ) {
      return res.status(403).json({ message: "Exam not accessible" });
    }

    const existing = await ExamAttempt.findOne({
      exam: examId,
      student: student._id,
    });

    if (existing && existing.status === "submitted") {
      return res.status(400).json({ message: "Exam already submitted" });
    }

    if (existing && existing.status === "in_progress") {
      return res.json({
        success: true,
        attemptId: existing._id,
        endsAt: existing.endsAt,
        message: "Resuming exam",
      });
    }

    // 🔥 IMPORTANT TIME LOGIC
    const examEndTime = new Date(exam.endTime);
    const durationEndTime = new Date(now.getTime() + exam.duration * 60000);

    // Pick earlier time
    const finalEndTime =
      durationEndTime < examEndTime ? durationEndTime : examEndTime;

    if (finalEndTime <= now) {
      return res.status(400).json({
        message: "Exam time is over",
      });
    }

    const attempt = await ExamAttempt.create({
      exam: examId,
      student: student._id,
      startedAt: now,
      endsAt: finalEndTime,
      status: "in_progress",
    });

    res.json({
      success: true,
      attemptId: attempt._id,
      endsAt: finalEndTime,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const submitExam = async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({ message: "Only students allowed" });
    }

    const { examId, answers } = req.body;

    if (!Array.isArray(answers)) {
      return res.status(400).json({ message: "Invalid answers format" });
    }

    const student = await Student.findOne({ user: req.user._id });
    if (!student) {
      return res.status(400).json({ message: "Student profile not found" });
    }

    const exam = await Exam.findById(examId);
    if (!exam) return res.status(404).json({ message: "Exam not found" });

    const now = new Date();

    if (
      exam.school.toString() !== student.school.toString() ||
      exam.grade !== student.grade ||
      exam.status !== "published" ||
      now < exam.startTime ||
      now > exam.endTime
    ) {
      return res.status(403).json({ message: "Exam not accessible" });
    }

    const attempt = await ExamAttempt.findOne({
      exam: examId,
      student: student._id,
      status: "in_progress",
    });

    if (!attempt) {
      return res.status(400).json({
        message: "Exam not started or already submitted",
      });
    }

    if (attempt.status === "submitted") {
      return res.status(400).json({
        message: "Already submitted",
      });
    }

    // Attempt timeout check
    const attemptEndTime = new Date(
      attempt.startedAt.getTime() + exam.duration * 60000,
    );

    if (now > attemptEndTime) {
      const questions = await Question.find({ exam: examId }).select(
        "marks correctAnswer negativeMarks",
      );

      let score = 0;

      for (const q of questions) {
        const studentAnswer = attempt.answers.find(
          (a) => String(a.question) === String(q._id),
        );

        if (!studentAnswer) continue;

        if (Number(studentAnswer.selectedOption) === Number(q.correctAnswer)) {
          score += q.marks;
        } else {
          score -= q.negativeMarks || 0;
        }
      }

      attempt.status = "submitted";
      attempt.submittedAt = attemptEndTime;
      attempt.score = score;

      await attempt.save();

      return res.status(400).json({
        message: "Exam time expired. Auto submitted.",
      });
    }

    const questions = await Question.find({ exam: examId });

    // ADD THIS VALIDATION HERE
    const questionIds = questions.map((q) => String(q._id));

    for (const ans of answers) {
      if (!questionIds.includes(String(ans.question))) {
        return res.status(400).json({ message: "Invalid question in answers" });
      }

      if (ans.selectedOption < 0 || ans.selectedOption > 3) {
        return res.status(400).json({ message: "Invalid option selected" });
      }
    }

    let score = 0;

    for (const q of questions) {
      const studentAnswer = answers.find(
        (a) => String(a.question) === String(q._id),
      );

      if (!studentAnswer) continue;

      if (Number(studentAnswer.selectedOption) === Number(q.correctAnswer)) {
        score += q.marks;
      } else {
        score -= q.negativeMarks || 0;
      }
    }

    attempt.answers = answers;
    attempt.score = score;
    attempt.submittedAt = new Date();
    attempt.status = "submitted";

    await attempt.save();

    res.json({
      success: true,
      message: "Exam submitted successfully",
      score,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getAttemptedExams = async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({ message: "Only students allowed" });
    }

    const student = await Student.findOne({ user: req.user._id });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    const attempts = await ExamAttempt.find({
      student: student._id,
      status: "submitted",
    })
      .populate({
        path: "exam",
        select: "title subject grade",
      })
      .sort({ submittedAt: -1 })
      .limit(10);

    const exams = attempts.map((attempt) => ({
      _id: attempt.exam._id,
      title: attempt.exam.title,
      subject: attempt.exam.subject,
      grade: attempt.exam.grade,
      score: attempt.score,
      submittedAt: attempt.submittedAt,
      totalMarks: attempt.totalMarks,
    }));

    res.json({
      success: true,
      exams,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
