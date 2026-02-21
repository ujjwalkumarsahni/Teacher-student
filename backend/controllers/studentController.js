import Employee from "../models/Employee.js";
import EmployeePosting from "../models/EmployeePosting.js";
import Student from "../models/student.js";
import User from "../models/User.js";
import UserRole from "../models/UserRole.js";
import XLSX from "xlsx";
import fs from "fs";
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

export const registerStudent = async (req, res) => {
  try {
    if (req.user.role !== "employee") {
      return res.status(403).json({
        message: "Only employees can register students",
      });
    }

    const { name, email, password, grade } = req.body;

    if (!name || !email || !password || !grade) {
      return res.status(400).json({ message: "All fields required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password too short" });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: "Email already exists" });
    }

    // ✅ Get employee school safely
    const { employeeId, schoolId } = await getEmployeeSchool(req.user._id);

    // TODO: hash password properly
    const user = await User.create({
      name,
      email,
      passwordHash: password, // hash karo yaha
      role: "student",
    });

    const student = await Student.create({
      user: user._id,
      grade,
      school: schoolId,
      createdByEmployee: employeeId,
    });

    await UserRole.create({
      user: user._id,
      role: "student",
      assignedBy: req.user._id,
      isActive: true,
    });

    res.json({
      success: true,
      message: "Student registered successfully",
      student,
    });

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
}; 

export const bulkRegisterStudentsExcel = async (req, res) => {
  try {
    if (req.user.role !== "employee") {
      return res.status(403).json({
        message: "Only employees can register students",
      });
    }

    if (!req.file) {
      return res.status(400).json({
        message: "Excel file required",
      });
    }

    // Secure employee + school fetch
    const { employeeId, schoolId } = await getEmployeeSchool(req.user._id);

    const workbook = XLSX.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    let created = 0;
    let failed = [];

    for (const row of rows) {
      try {
        const { name, email, password, grade } = row;

        if (!name || !email || !password || !grade) {
          failed.push({ ...row, reason: "Missing fields" });
          continue;
        }

        if (password.length < 6) {
          failed.push({ ...row, reason: "Weak password" });
          continue;
        }

        const exists = await User.findOne({ email });
        if (exists) {
          failed.push({ ...row, reason: "Email exists" });
          continue;
        }

        const user = await User.create({
          name,
          email,
          passwordHash: password, // hash karo
          role: "student",
        });

        await Student.create({
          user: user._id,
          grade,
          school: schoolId,   // always employee school
          createdByEmployee: employeeId,
        });

        await UserRole.create({
          user: user._id,
          role: "student",
          assignedBy: req.user._id,
          isActive: true,
        });

        created++;

      } catch (err) {
        failed.push({ ...row, reason: "Creation failed" });
      }
    }

    fs.unlinkSync(req.file.path);

    res.json({
      success: true,
      total: rows.length,
      created,
      failedCount: failed.length,
      failed,
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
    }

    else if (req.user.role === "admin" || req.user.role === "superadmin") {
      // If admin passes school in query, filter that school
      if (school) {
        schoolFilter.school = school;
      }
      // Otherwise no filter → all schools
    }

    else {
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

    const filtered = students.filter(s => s.user);

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