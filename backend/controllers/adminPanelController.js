import Student from "../models/Student.js";
import School from "../models/School.js";
import Exam from "../models/Exam.js";
import Question from "../models/Question.js";
import ExamAttempt from "../models/ExamAttempt.js";
import mongoose from "mongoose";


export const getAdminDashboard = async (req, res) => {
  try {

    /* =============================
       BASIC OVERVIEW
    ============================= */

    const totalSchools = await School.countDocuments();
    const totalStudents = await Student.countDocuments();
    const totalExams = await Exam.countDocuments();

    /* =============================
       SCHOOL WISE DATA
    ============================= */

    const schools = await School.find().lean();

    const schoolStats = await Promise.all(
      schools.map(async (school) => {

        const studentCount = await Student.countDocuments({
          school: school._id
        });

        const examCount = await Exam.countDocuments({
          school: school._id
        });

        return {
          schoolId: school._id,
          schoolName: school.name,
          city: school.city,
          totalStudents: studentCount,
          totalExams: examCount
        };

      })
    );

    /* =============================
   SCHOOL WISE TOP RANKERS
============================= */

const schoolsList = await School.find().lean();

const schoolTopRankers = [];

for (const school of schoolsList) {

  const students = await Student.find({
    school: school._id
  }).select("_id");

  const studentIds = students.map(s => s._id);

  const attempts = await ExamAttempt.find({
    student: { $in: studentIds },
    status: "submitted"
  })
  .sort({ score: -1 })
  .populate({
    path: "student",
    populate: {
      path: "user",
      select: "name email"
    }
  })
  .populate("exam","title subject")
  .lean();

  if (!attempts.length) {
    schoolTopRankers.push({
      schoolId: school._id,
      schoolName: school.name,
      rankers: []
    });
    continue;
  }

  // Top 3 attempts
  const topThree = attempts.slice(0,3);

  const thirdScore = topThree[topThree.length - 1]?.score;

  // Include all with same score
  const rankers = attempts.filter(a => a.score >= thirdScore);

  schoolTopRankers.push({
    schoolId: school._id,
    schoolName: school.name,
    rankers: rankers.map(r => ({
      studentName: r.student?.user?.name,
      email: r.student?.user?.email,
      examTitle: r.exam?.title,
      subject: r.exam?.subject,
      score: r.score
    }))
  });

}


    /* =============================
       RECENT STUDENTS
    ============================= */

    const recentStudents = await Student.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("user", "name email")
      .populate("school", "name")
      .lean();

    const recentStudentList = recentStudents.map(s => ({
      name: s.user?.name,
      email: s.user?.email,
      school: s.school?.name,
      grade: s.grade,
      registeredAt: s.createdAt
    }));


    /* =============================
       RECENT EXAMS
    ============================= */

    const recentExams = await Exam.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate("school", "name")
      .lean();

    const recentExamList = recentExams.map(e => ({
      title: e.title,
      subject: e.subject,
      grade: e.grade,
      school: e.school?.name,
      createdAt: e.createdAt
    }));


    /* =============================
       FINAL RESPONSE
    ============================= */

    res.json({
      success: true,

      overview: {
        totalSchools,
        totalStudents,
        totalExams
      },

      schools: schoolStats,

      topRankers: schoolTopRankers,

      recentStudents: recentStudentList,

      recentExams: recentExamList
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};



export const getStudentsBySchool = async (req, res) => {
  try {
    const { schoolId } = req.params;
    const { grade } = req.query;

    const school = await School.findById(schoolId);

    if (!school) {
      return res.status(404).json({
        success: false,
        message: "School not found"
      });
    }

    let query = { school: schoolId };

    if (grade) {
      query.grade = grade;
    }

    const students = await Student.find(query)
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: students.length,
      students
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};


export const getSchoolExams = async (req, res) => {
  try {
    const { schoolId } = req.params;

    const exams = await Exam.find({ school: schoolId })
      .sort({ createdAt: -1 })
      .lean();

    const examsWithStats = await Promise.all(
      exams.map(async (exam) => {

        const questionCount = await Question.countDocuments({
          exam: exam._id
        });

        return {
          ...exam,
          questionCount
        };

      })
    );

    res.json({
      success: true,
      exams: examsWithStats
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

export const getGradeWiseStudents = async (req, res) => {

  const { schoolId } = req.params;

  const grades = await Student.aggregate([
    {
      $match: {
        school: new mongoose.Types.ObjectId(schoolId)
      }
    },
    {
      $group: {
        _id: "$grade",
        count: { $sum: 1 }
      }
    },
    {
      $sort: { _id: 1 }
    }
  ]);

  res.json({
    success: true,
    grades
  });

};

export const getExamDetailsAdmin = async (req, res) => {
  try {

    const { examId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(examId)) {
      return res.status(400).json({
        success:false,
        message:"Invalid exam id"
      });
    }

    const exam = await Exam.findById(examId)
      .populate({
        path:"createdByEmployee",
        populate:{
          path:"user",
          select:"name email"
        }
      });

    if(!exam){
      return res.status(404).json({
        success:false,
        message:"Exam not found"
      });
    }

    const questions = await Question.find({ exam: examId })
      .sort({ createdAt:1 });

    const totalMarks = questions.reduce(
      (sum,q)=>sum + q.marks,
      0
    );

    res.json({
      success:true,
      exam:{
        id: exam._id,
        title: exam.title,
        subject: exam.subject,
        grade: exam.grade,
        description: exam.description,
        startTime: exam.startTime,
        endTime: exam.endTime,
        duration: exam.duration,
        status: exam.status,
        createdBy: exam.createdByEmployee?.user?.name
      },
      stats:{
        totalQuestions: questions.length,
        totalMarks
      },
      questions
    });

  } catch(error){
    console.error(error);

    res.status(500).json({
      success:false,
      message:"Server error"
    });
  }
};


export const getSchoolResults = async (req, res) => {
  try {

    const { schoolId } = req.params;
    const { examId, grade } = req.query;

    if (!mongoose.Types.ObjectId.isValid(schoolId)) {
      return res.status(400).json({
        success:false,
        message:"Invalid school id"
      });
    }

    let studentFilter = { school: schoolId };

    if (grade) {
      studentFilter.grade = grade;
    }

    const students = await Student.find(studentFilter)
      .populate("user","name email");

    const studentIds = students.map(s => s._id);

    let attemptFilter = {
      student: { $in: studentIds },
      status: "submitted"
    };

    if (examId) {
      attemptFilter.exam = examId;
    }

    const attempts = await ExamAttempt.find(attemptFilter)
      .populate("exam","title subject grade")
      .populate({
        path:"student",
        populate:{
          path:"user",
          select:"name email"
        }
      })
      .sort({ submittedAt:-1 })
      .lean();

    const examIds = attempts.map(a => a.exam._id);

    const questions = await Question.find({
      exam: { $in: examIds }
    }).select("exam marks");

    const marksMap = {};

    questions.forEach(q=>{
      marksMap[q.exam] = (marksMap[q.exam] || 0) + q.marks;
    });

    const results = attempts.map(attempt => {

      const totalMarks = marksMap[attempt.exam._id] || 0;

      const percentage = totalMarks
        ? ((attempt.score / totalMarks) * 100).toFixed(2)
        : 0;

      return {
        studentName: attempt.student?.user?.name,
        email: attempt.student?.user?.email,
        examTitle: attempt.exam.title,
        subject: attempt.exam.subject,
        grade: attempt.exam.grade,
        score: attempt.score,
        totalMarks,
        percentage,
        submittedAt: attempt.submittedAt
      };

    });

    res.json({
      success:true,
      totalResults: results.length,
      results
    });

  } catch(error){

    console.error(error);

    res.status(500).json({
      success:false,
      message:"Server error"
    });

  }
};

export const getStudentDetailsAdmin = async (req, res) => {
  try {

    const { studentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return res.status(400).json({
        success:false,
        message:"Invalid student id"
      });
    }

    const student = await Student.findById(studentId)
      .populate("user","name email")
      .populate("school","name city");

    if(!student){
      return res.status(404).json({
        success:false,
        message:"Student not found"
      });
    }

    const attempts = await ExamAttempt.find({
      student: studentId,
      status: "submitted"
    })
    .populate("exam","title subject grade")
    .sort({ submittedAt:-1 })
    .lean();

    const examIds = attempts.map(a => a.exam._id);

    const questions = await Question.find({
      exam: { $in: examIds }
    }).select("exam marks");

    const marksMap = {};

    questions.forEach(q=>{
      marksMap[q.exam] = (marksMap[q.exam] || 0) + q.marks;
    });

    const history = attempts.map(attempt => {

      const totalMarks = marksMap[attempt.exam._id] || 0;

      const percentage = totalMarks
        ? ((attempt.score / totalMarks) * 100).toFixed(2)
        : 0;

      return {
        examTitle: attempt.exam.title,
        subject: attempt.exam.subject,
        grade: attempt.exam.grade,
        score: attempt.score,
        totalMarks,
        percentage,
        submittedAt: attempt.submittedAt
      };

    });

    res.json({
      success:true,
      student:{
        id: student._id,
        name: student.user?.name,
        email: student.user?.email,
        grade: student.grade,
        school: student.school?.name
      },
      totalExams: history.length,
      examHistory: history
    });

  } catch(error){

    console.error(error);

    res.status(500).json({
      success:false,
      message:"Server error"
    });

  }
};


export const getAllSchools = async (req, res) => {
  try {

    const schools = await School.find()
      .select("name city")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: schools.length,
      schools
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};

export const getAllExams = async (req, res) => {
  try {

    const exams = await Exam.find()
      .populate("school","name")
      .sort({ createdAt: -1 });

    res.json({
      success:true,
      count: exams.length,
      exams
    });

  } catch(error){

    res.status(500).json({
      success:false,
      message:error.message
    });

  }
};

export const getAllStudents = async (req, res) => {
  try {

    const { grade, school, search } = req.query;

    const filter = {};

    if (grade) {
      filter.grade = grade;
    }

    if (school) {
      filter.school = school;
    }

    const students = await Student.find(filter)
      .populate("user", "name email")
      .populate("school", "name city")
      .sort({ createdAt: -1 })
      .lean();

    let filteredStudents = students;

    if (search) {

      const keyword = search.toLowerCase();

      filteredStudents = students.filter(s =>
        s.user?.name?.toLowerCase().includes(keyword) ||
        s.user?.email?.toLowerCase().includes(keyword)
      );

    }

    res.json({
      success: true,
      count: filteredStudents.length,
      students: filteredStudents
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    });

  }
};


export const getAllResults = async (req,res)=>{

  try{

    const attempts = await ExamAttempt.find({
      status:"submitted"
    })
    .populate({
      path:"student",
      populate:{ path:"user", select:"name email"}
    })
    .populate("exam","title subject");

    res.json({
      success:true,
      count:attempts.length,
      results:attempts
    });

  }catch(error){

    res.status(500).json({
      success:false,
      message:error.message
    });

  }

};