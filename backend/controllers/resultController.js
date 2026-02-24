// backend/controllers/resultController.js
import Exam from "../models/Exam.js";
import ExamAttempt from "../models/ExamAttempt.js";
import Question from "../models/Question.js";
import Student from "../models/Student.js";

// @desc    Get exam results for employee (with verification status)
// @route   GET /api/employee/exams/:examId/results
export const getExamResultsForVerification = async (req, res) => {
  try {
    const { examId } = req.params;
    
    const exam = await Exam.findById(examId);
    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found"
      });
    }

    // Get all submitted attempts
    const attempts = await ExamAttempt.find({
      exam: examId,
      status: "submitted"
    })
      .populate({
        path: "student",
        populate: {
          path: "user",
          select: "name email"
        }
      })
      .sort({ submittedAt: -1 });

    // Get total marks
    const questions = await Question.find({ exam: examId });
    const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);

    // Format results
    const results = attempts.map(attempt => ({
      attemptId: attempt._id,
      studentId: attempt.student?._id,
      studentName: attempt.student?.user?.name || "Unknown",
      studentEmail: attempt.student?.user?.email,
      score: attempt.score || 0,
      totalMarks,
      percentage: totalMarks ? ((attempt.score / totalMarks) * 100).toFixed(2) : 0,
      submittedAt: attempt.submittedAt,
      isVerified: attempt.isVerified || false,
      verifiedAt: attempt.verifiedAt,
      remarks: attempt.remarks || ""
    }));

    // Calculate statistics
    const statistics = {
      totalStudents: results.length,
      averageScore: results.length > 0 
        ? (results.reduce((sum, r) => sum + parseFloat(r.percentage), 0) / results.length).toFixed(2)
        : 0,
      highestScore: results.length > 0 
        ? Math.max(...results.map(r => parseFloat(r.percentage)))
        : 0,
      lowestScore: results.length > 0 
        ? Math.min(...results.map(r => parseFloat(r.percentage)))
        : 0,
      verifiedCount: results.filter(r => r.isVerified).length,
      pendingCount: results.filter(r => !r.isVerified).length
    };

    res.json({
      success: true,
      exam: {
        id: exam._id,
        title: exam.title,
        subject: exam.subject,
        grade: exam.grade,
        totalMarks
      },
      statistics,
      results
    });

  } catch (error) {
    console.error("getExamResultsForVerification error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// @desc    Verify individual student result
// @route   POST /api/employee/results/verify
export const verifyStudentResult = async (req, res) => {
  try {
    const { attemptId, remarks } = req.body;

    const attempt = await ExamAttempt.findById(attemptId)
      .populate("exam")
      .populate({
        path: "student",
        populate: {
          path: "user",
          select: "name email"
        }
      });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Attempt not found"
      });
    }

    // Update verification status
    attempt.isVerified = true;
    attempt.verifiedAt = new Date();
    if (remarks) attempt.remarks = remarks;
    
    await attempt.save();

    // Get total marks for percentage calculation
    const questions = await Question.find({ exam: attempt.exam._id });
    const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);
    const percentage = totalMarks ? ((attempt.score / totalMarks) * 100).toFixed(2) : 0;

    res.json({
      success: true,
      message: "Result verified successfully",
      data: {
        attemptId: attempt._id,
        studentName: attempt.student?.user?.name,
        score: attempt.score,
        totalMarks,
        percentage,
        verifiedAt: attempt.verifiedAt
      }
    });

  } catch (error) {
    console.error("verifyStudentResult error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

// @desc    Verify all results at once
// @route   POST /api/employee/results/verify-all
export const verifyAllResults = async (req, res) => {
  try {
    const { examId } = req.body;

    const result = await ExamAttempt.updateMany(
      { 
        exam: examId, 
        status: "submitted",
        isVerified: { $ne: true }
      },
      {
        $set: {
          isVerified: true,
          verifiedAt: new Date()
        }
      }
    );

    res.json({
      success: true,
      message: `Verified ${result.modifiedCount} results successfully`,
      verifiedCount: result.modifiedCount
    });

  } catch (error) {
    console.error("verifyAllResults error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};

  // @desc    Get student's verified results
  // @route   GET /api/student/results
  export const getStudentResults = async (req, res) => {
    try {
      // Find student profile
      const student = await Student.findOne({ user: req.user._id });
      
      if (!student) {
        return res.status(404).json({
          success: false,
          message: "Student profile not found"
        });
      }

      // Get all verified attempts for this student
      const attempts = await ExamAttempt.find({
        student: student._id,
        status: "submitted",
        isVerified: true
      })
        .populate("exam", "title subject grade totalMarks startTime endTime")
        .sort({ verifiedAt: -1 });

      // Format results
      const results = await Promise.all(attempts.map(async (attempt) => {
        // Get questions for this exam to calculate total marks
        const questions = await Question.find({ exam: attempt.exam._id });
        const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);
        
        return {
          attemptId: attempt._id,
          examId: attempt.exam._id,
          examTitle: attempt.exam.title,
          subject: attempt.exam.subject,
          grade: attempt.exam.grade,
          score: attempt.score,
          totalMarks,
          percentage: totalMarks ? ((attempt.score / totalMarks) * 100).toFixed(2) : 0,
          submittedAt: attempt.submittedAt,
          verifiedAt: attempt.verifiedAt,
          remarks: attempt.remarks,
          status: attempt.score >= (totalMarks * 0.33) ? "PASS" : "FAIL" // 33% passing criteria
        };
      }));

      // Calculate overall statistics
      const statistics = {
        totalExams: results.length,
        averagePercentage: results.length > 0
          ? (results.reduce((sum, r) => sum + parseFloat(r.percentage), 0) / results.length).toFixed(2)
          : 0,
        passedExams: results.filter(r => r.status === "PASS").length,
        failedExams: results.filter(r => r.status === "FAIL").length
      };

      res.json({
        success: true,
        statistics,
        results
      });

    } catch (error) {
      console.error("getStudentResults error:", error);
      res.status(500).json({
        success: false,
        message: "Server error"
      });
    }
  };

  // @desc    Get detailed result for a specific exam (student view)
  // @route   GET /api/student/results/:examId
  export const getStudentExamResult = async (req, res) => {
    try {
      const { examId } = req.params;

      // Find student profile
      const student = await Student.findOne({ user: req.user._id });
      
      if (!student) {
        return res.status(404).json({
          success: false,
          message: "Student profile not found"
        });
      }

      // Find the verified attempt
      const attempt = await ExamAttempt.findOne({
        exam: examId,
        student: student._id,
        status: "submitted",
        isVerified: true
      })
        .populate("exam", "title subject grade description startTime endTime")
        .populate({
          path: "answers.question",
          model: "Question",
          select: "questionText options marks negativeMarks correctAnswer"
        });

      if (!attempt) {
        return res.status(404).json({
          success: false,
          message: "Result not found or not yet verified"
        });
      }

      // Get all questions for this exam
      const questions = await Question.find({ exam: examId });
      const totalMarks = questions.reduce((sum, q) => sum + q.marks, 0);

      // Prepare detailed answers with correct/incorrect status
      const detailedAnswers = attempt.answers.map(answer => {
        const question = answer.question;
        const isCorrect = answer.selectedOption === question.correctAnswer;
        
        return {
          questionId: question._id,
          questionText: question.questionText,
          options: question.options,
          selectedOption: answer.selectedOption,
          correctAnswer: question.correctAnswer,
          isCorrect,
          marks: isCorrect ? question.marks : - (question.negativeMarks || 0),
          questionMarks: question.marks,
          negativeMarks: question.negativeMarks || 0
        };
      });

      // Calculate section-wise performance
      const correctAnswers = detailedAnswers.filter(a => a.isCorrect).length;
      const wrongAnswers = detailedAnswers.filter(a => !a.isCorrect && a.selectedOption !== undefined).length;
      const unattempted = questions.length - detailedAnswers.length;

      res.json({
        success: true,
        exam: {
          title: attempt.exam.title,
          subject: attempt.exam.subject,
          grade: attempt.exam.grade,
          date: attempt.exam.startTime
        },
        result: {
          score: attempt.score,
          totalMarks,
          percentage: ((attempt.score / totalMarks) * 100).toFixed(2),
          status: attempt.score >= (totalMarks * 0.33) ? "PASS" : "FAIL",
          submittedAt: attempt.submittedAt,
          verifiedAt: attempt.verifiedAt,
          remarks: attempt.remarks
        },
        statistics: {
          totalQuestions: questions.length,
          correctAnswers,
          wrongAnswers,
          unattempted
        },
        detailedAnswers
      });

    } catch (error) {
      console.error("getStudentExamResult error:", error);
      res.status(500).json({
        success: false,
        message: "Server error"
      });
    }
  };


// @desc    Get detailed attempt for verification (employee view)
// @route   GET /api/employee/attempt/:attemptId/details
export const getAttemptDetails = async (req, res) => {
  try {
    const { attemptId } = req.params;

    // Find attempt with populated data
    const attempt = await ExamAttempt.findById(attemptId)
      .populate({
        path: "student",
        populate: {
          path: "user",
          select: "name email"
        }
      })
      .populate({
        path: "answers.question",
        model: "Question",
        select: "questionText options marks negativeMarks correctAnswer difficultyLevel topic"
      })
      .populate("exam", "title subject grade totalMarks");

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Attempt not found"
      });
    }

    // Get all questions for this exam (for unattempted questions)
    const allQuestions = await Question.find({ exam: attempt.exam._id })
      .select("questionText options marks negativeMarks correctAnswer difficultyLevel topic");

    // Create a map of answered questions
    const answeredMap = {};
    attempt.answers.forEach(ans => {
      answeredMap[ans.question._id.toString()] = ans;
    });

    // Prepare detailed answers
    const detailedAnswers = allQuestions.map(question => {
      const answered = answeredMap[question._id.toString()];
      const isCorrect = answered && answered.selectedOption === question.correctAnswer;
      
      return {
        questionId: question._id,
        questionText: question.questionText,
        options: question.options,
        selectedOption: answered ? answered.selectedOption : undefined,
        correctAnswer: question.correctAnswer,
        isCorrect: !!isCorrect,
        isAttempted: !!answered,
        marks: question.marks,
        negativeMarks: question.negativeMarks || 0,
        marksObtained: isCorrect ? question.marks : (answered ? -(question.negativeMarks || 0) : 0),
        difficultyLevel: question.difficultyLevel,
        topic: question.topic
      };
    });

    // Calculate statistics
    const statistics = {
      totalQuestions: allQuestions.length,
      attempted: attempt.answers.length,
      unattempted: allQuestions.length - attempt.answers.length,
      correct: detailedAnswers.filter(a => a.isCorrect).length,
      incorrect: detailedAnswers.filter(a => a.isAttempted && !a.isCorrect).length,
      totalMarks: attempt.score || 0,
      totalPossibleMarks: allQuestions.reduce((sum, q) => sum + q.marks, 0)
    };

    res.json({
      success: true,
      data: {
        student: {
          name: attempt.student?.user?.name || "Unknown",
          email: attempt.student?.user?.email,
          rollNumber: attempt.student?.rollNumber
        },
        exam: {
          title: attempt.exam.title,
          subject: attempt.exam.subject,
          grade: attempt.exam.grade,
          totalMarks: attempt.exam.totalMarks
        },
        attempt: {
          startedAt: attempt.startedAt,
          submittedAt: attempt.submittedAt,
          score: attempt.score,
          isVerified: attempt.isVerified,
          verifiedAt: attempt.verifiedAt,
          remarks: attempt.remarks
        },
        statistics,
        detailedAnswers
      }
    });

  } catch (error) {
    console.error("getAttemptDetails error:", error);
    res.status(500).json({
      success: false,
      message: "Server error"
    });
  }
};