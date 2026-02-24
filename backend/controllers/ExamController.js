import Employee from "../models/Employee.js";
import EmployeePosting from "../models/EmployeePosting.js";
import Exam from "../models/Exam.js";
import Question from "../models/Question.js";
import Student from "../models/Student.js";
import ExamAttempt from "../models/ExamAttempt.js";

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

// Create exam
export const createExam = async (req, res) => {
  try {
    if (req.user.role !== "employee") {
      return res
        .status(403)
        .json({ message: "Only employees can create exams" });
    }

    const { title, grade, subject, startTime, duration, description } =
      req.body;

    if (!title || !grade || !subject || !startTime || !duration) {
      return res.status(400).json({ message: "All fields required" });
    }

    const start = new Date(startTime);

    if (isNaN(start.getTime())) {
      return res.status(400).json({ message: "Invalid start time" });
    }

    if (duration <= 0) {
      return res
        .status(400)
        .json({ message: "Duration must be greater than 0" });
    }

    // Auto calculate endTime
    const end = new Date(start.getTime() + duration * 60000);

    const { employeeId, schoolId } = await getEmployeeSchool(req.user._id);

    const exam = await Exam.create({
      title,
      school: schoolId,
      grade,
      subject,
      startTime: start,
      endTime: end,
      duration,
      description,
      status: "draft",
      createdByEmployee: employeeId,
    });

    res.status(201).json({
      success: true,
      message: "Exam created successfully",
      exam,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get my exams (for employee)
export const getMyExams = async (req, res) => {
  try {
    if (req.user.role !== "employee") {
      return res.status(403).json({ message: "Only employees can view exams" });
    }

    const { schoolId } = await getEmployeeSchool(req.user._id);

    const exams = await Exam.find({ school: schoolId })
      .sort({ createdAt: -1 })
      .populate("createdByEmployee", "user")
      .populate({
        path: "createdByEmployee",
        populate: {
          path: "user",
          select: "name",
        },
      });

    // Get question count for each exam
    const examsWithCount = await Promise.all(
      exams.map(async (exam) => {
        const questionCount = await Question.countDocuments({ exam: exam._id });
        return {
          ...exam.toObject(),
          questionCount,
        };
      }),
    );

    res.json({
      success: true,
      exams: examsWithCount,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Get exam details with questions
export const getExamDetails = async (req, res) => {
  try {
    const { examId } = req.params;

    const exam = await Exam.findById(examId)
      .populate("createdByEmployee", "user")
      .populate({
        path: "createdByEmployee",
        populate: {
          path: "user",
          select: "name",
        },
      });

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    // Check if employee has access to this exam
    if (req.user.role === "employee") {
      const { schoolId } = await getEmployeeSchool(req.user._id);
      if (exam.school.toString() !== schoolId.toString()) {
        return res.status(403).json({ message: "Unauthorized" });
      }
    }

    const questions = await Question.find({ exam: examId }).sort({
      createdAt: 1,
    });

    res.json({
      success: true,
      exam,
      questions,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Create question
export const createQuestion = async (req, res) => {
  try {
    if (req.user.role !== "employee") {
      return res
        .status(403)
        .json({ message: "Only employees can add questions" });
    }

    const {
      examId,
      questionText,
      options,
      correctAnswer,
      marks,
      negativeMarks,
      difficultyLevel,
      topic,
      explanation,
    } = req.body;

    if (!examId || !questionText || !options || correctAnswer === undefined) {
      return res.status(400).json({ message: "Required fields missing" });
    }

    if (correctAnswer < 0 || correctAnswer > 3) {
      return res.status(400).json({ message: "Invalid correct answer index" });
    }

    if (!Array.isArray(options) || options.length !== 4) {
      return res.status(400).json({ message: "Exactly 4 options required" });
    }

    // Get employee school
    const { employeeId, schoolId } = await getEmployeeSchool(req.user._id);

    const exam = await Exam.findById(examId);

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    if (exam.status === "published") {
      return res.status(400).json({
        message: "Cannot modify published exam",
      });
    }

    // SECURITY CHECK
    if (exam.school.toString() !== schoolId.toString()) {
      return res.status(403).json({ message: "You cannot modify this exam" });
    }

    const question = await Question.create({
      exam: examId,
      questionText,
      options,
      correctAnswer,
      marks: marks || 1,
      negativeMarks: negativeMarks || 0,
      difficultyLevel: difficultyLevel || "medium",
      topic: topic || "General",
      explanation,
      createdByEmployee: employeeId,
    });

    res.status(201).json({
      success: true,
      message: "Question added successfully",
      question,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const publishExam = async (req, res) => {
  try {
    if (req.user.role !== "employee") {
      return res.status(403).json({ message: "Only employees allowed" });
    }

    const { examId } = req.body;

    if (!examId) {
      return res.status(400).json({ message: "Exam ID required" });
    }

    const { schoolId } = await getEmployeeSchool(req.user._id);

    const exam = await Exam.findById(examId);

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    if (exam.school.toString() !== schoolId.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (exam.status === "published") {
      return res.status(400).json({ message: "Exam already published" });
    }

    const questionCount = await Question.countDocuments({
      exam: exam._id,
    });

    if (questionCount <= 0) {
      return res.status(400).json({
        message: "Add at least one question before publishing",
      });
    }

    const questions = await Question.find({ exam: examId });

    const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);

    exam.totalMarks = totalMarks;

    exam.status = "published";
    await exam.save();

    return res.json({
      success: true,
      message: "Exam published successfully",
      exam,
    });
  } catch (err) {
    console.error("Publish Exam Error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

export const deleteQuestion = async (req, res) => {
  try {
    const { questionId } = req.params;

    const question = await Question.findById(questionId).populate("exam");

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Check if exam is published
    if (question.exam.status === "published") {
      return res
        .status(400)
        .json({ message: "Cannot delete from published exam" });
    }

    // Check authorization
    const { schoolId } = await getEmployeeSchool(req.user._id);
    if (question.exam.school.toString() !== schoolId.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await question.deleteOne();

    res.json({
      success: true,
      message: "Question deleted successfully",
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const getExamResults = async (req, res) => {
  try {
    if (req.user.role !== "employee") {
      return res.status(403).json({
        success: false,
        message: "Only employees allowed",
      });
    }

    const { examId } = req.params;

    const { schoolId } = await getEmployeeSchool(req.user._id);

    const exam = await Exam.findById(examId);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found",
      });
    }

    // Security check
    if (exam.school.toString() !== schoolId.toString()) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized",
      });
    }

    // Get all submitted attempts
    const attempts = await ExamAttempt.find({
      exam: examId,
      status: "submitted",
    })
      .populate({
        path: "student",
        populate: {
          path: "user",
          select: "name email",
        },
      })
      .lean();

    const totalStudents = attempts.length;

    // Calculate total marks
    const questions = await Question.find({ exam: examId });
    const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);

    const results = attempts.map((attempt) => ({
      studentId: attempt.student?._id,
      name: attempt.student?.user?.name,
      email: attempt.student?.user?.email,
      score: attempt.score,
      totalMarks,
      percentage: totalMarks
        ? ((attempt.score / totalMarks) * 100).toFixed(2)
        : 0,
      submittedAt: attempt.submittedAt,
    }));

    return res.json({
      success: true,
      exam: {
        title: exam.title,
        totalMarks,
        totalStudents,
      },
      results,
    });
  } catch (err) {
    console.error("getExamResults error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getEmployeeExams = async (req, res) => {
  try {
    if (req.user.role !== "employee") {
      return res.status(403).json({ message: "Only employees allowed" });
    }

    // Get employee's school
    const employee = await Employee.findOne({ user: req.user._id });
    if (!employee) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const posting = await EmployeePosting.findOne({
      employee: employee._id,
      isActive: true
    });

    if (!posting) {
      return res.status(404).json({ message: "No active school posting found" });
    }

    // Get all exams for this school
    const exams = await Exam.find({ school: posting.school })
      .sort({ createdAt: -1 })
      .lean();

    // Get question counts and student counts for each exam
    const examsWithStats = await Promise.all(
      exams.map(async (exam) => {
        const questionCount = await Question.countDocuments({ exam: exam._id });
        const studentCount = await ExamAttempt.countDocuments({ exam: exam._id });
        const pendingVerifications = await ExamAttempt.countDocuments({
          exam: exam._id,
          status: "submitted",
          isVerified: { $ne: true }
        });

        return {
          ...exam,
          questionCount,
          studentCount,
          pendingVerifications
        };
      })
    );

    res.json({
      success: true,
      exams: examsWithStats
    });
  } catch (error) {
    console.error("getEmployeeExams error:", error);
    res.status(500).json({ message: error.message });
  }
};

export const updateExam = async (req, res) => {
  try {
    if (req.user.role !== "employee") {
      return res.status(403).json({ message: "Only employees allowed" });
    }

    const { examId } = req.params;
    const { title, grade, subject, startTime, duration, description } = req.body;

    const { schoolId } = await getEmployeeSchool(req.user._id);

    const exam = await Exam.findById(examId);

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    // Security check
    if (exam.school.toString() !== schoolId.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Prevent editing published exam (recommended)
    if (exam.status === "published") {
      return res.status(400).json({
        message: "Cannot edit published exam",
      });
    }

    // Update fields
    if (title) exam.title = title;
    if (grade) exam.grade = grade;
    if (subject) exam.subject = subject;
    if (description !== undefined) exam.description = description;

    if (startTime && duration) {
      const start = new Date(startTime);
      const end = new Date(start.getTime() + duration * 60000);
      exam.startTime = start;
      exam.endTime = end;
      exam.duration = duration;
    }

    await exam.save();

    res.json({
      success: true,
      message: "Exam updated successfully",
      exam,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deleteExam = async (req, res) => {
  try {
    if (req.user.role !== "employee") {
      return res.status(403).json({ message: "Only employees allowed" });
    }

    const { examId } = req.params;

    const { schoolId } = await getEmployeeSchool(req.user._id);

    const exam = await Exam.findById(examId);

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    // Security check
    if (exam.school.toString() !== schoolId.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Delete related data
    await Question.deleteMany({ exam: exam._id });
    await ExamAttempt.deleteMany({ exam: exam._id });

    await exam.deleteOne();

    res.json({
      success: true,
      message: "Exam and related data deleted successfully",
    });
  } catch (err) {
    console.error("Delete Exam Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};