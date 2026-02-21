import Employee from "../models/Employee.js";
import EmployeePosting from "../models/EmployeePosting.js";
import Exam from "../models/Exam.js";
import Question from "../models/Question.js";
import Student from "../models/student.js";
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

export const createExam = async (req, res) => {
  try {
    if (req.user.role !== "employee") {
      return res
        .status(403)
        .json({ message: "Only employees can create exams" });
    }

    const { title, grade, subject, startTime, duration } = req.body;

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

    // 🔥 Auto calculate endTime
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
      status: "draft",
      createdByEmployee: employeeId,
    });

    res.json({
      success: true,
      message: "Exam created successfully",
      exam,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

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
      marks,
      negativeMarks,
      difficultyLevel,
      topic,
      createdByEmployee: employeeId,
    });

    res.json({
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

    const { schoolId } = await getEmployeeSchool(req.user._id);

    const exam = await Exam.findById(examId);

    if (!exam) return res.status(404).json({ message: "Exam not found" });

    if (exam.school.toString() !== schoolId.toString()) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const questionCount = await Question.countDocuments({ exam: examId });

    if (questionCount === 0) {
      return res.status(400).json({ message: "Add at least one question" });
    }

    exam.status = "published";
    await exam.save();

    res.json({ success: true, message: "Exam published successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

export const getAvailableExams = async (req, res) => {
  try {
    // 1️⃣ Role validation
    if (req.user.role !== "student") {
      return res.status(403).json({
        success: false,
        message: "Only students allowed",
      });
    }

    // 2️⃣ Get student profile
    const student = await Student.findOne({ user: req.user._id }).lean();

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student profile not found",
      });
    }

    const now = new Date();

    // 3️⃣ Production-safe query
    const exams = await Exam.find({
      school: student.school,              // ObjectId match
      grade: String(student.grade),        // Type safety
      status: "published",
      startTime: { $lte: now },            // Already started
      endTime: { $gte: now },              // Not expired
    })
      .select("title subject startTime endTime duration")
      .sort({ startTime: 1 })
      .lean();

    // 4️⃣ Format response safely
    const formatted = exams.map((exam) => {
      const remainingMs = new Date(exam.endTime) - now;

      return {
        _id: exam._id,
        title: exam.title,
        subject: exam.subject,
        startTime: exam.startTime,
        endTime: exam.endTime,
        duration: exam.duration,
        remainingTimeInMinutes: Math.max(
          0,
          Math.floor(remainingMs / 60000)
        ),
        isActive: remainingMs > 0,
      };
    });

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

    const questions = await Question.find({ exam: examId }).select(
      "-correctAnswer -options.isCorrect",
    );

    res.json({
      success: true,
      exam: {
        title: exam.title,
        duration: exam.duration,
        endTime: exam.endTime,
      },
      questions,
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
        message: "Resuming exam",
      });
    }

    const attempt = await ExamAttempt.create({
      exam: examId,
      student: student._id,
      startedAt: new Date(),
      status: "in_progress",
    });

    res.json({
      success: true,
      attemptId: attempt._id,
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
      return res
        .status(400)
        .json({ message: "Exam not started or already submitted" });
    }

    // Attempt timeout check
    const attemptEndTime = new Date(
      attempt.startedAt.getTime() + exam.duration * 60000,
    );

    if (now > attemptEndTime) {
      attempt.status = "submitted";
      attempt.submittedAt = attemptEndTime;
      attempt.score = 0; // or calculate partial if you store answers live
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
        select: "name email",
      })
      .lean();

    const totalStudents = attempts.length;

    // Calculate total marks
    const questions = await Question.find({ exam: examId });
    const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);

    const results = attempts.map((attempt) => ({
      studentId: attempt.student?._id,
      name: attempt.student?.name,
      email: attempt.student?.email,
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