import mongoose from "mongoose";

const examSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  school: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "School",
    required: true
  },
  grade: {
    type: String,
    required: true,
    enum: [
      "Nursery", "LKG", "UKG",
      "1","2","3","4","5",
      "6","7","8","9","10",
      "11","12"
    ]
  },
  subject: {
    type: String,
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  duration: {
    type: Number, // in minutes
    required: true
  },
  description: {
    type: String
  },
  status: {
    type: String,
    enum: ["draft", "published", "ongoing", "completed"],
    default: "draft"
  },
  createdByEmployee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true
  },
  totalMarks: {
    type: Number,
    default: 0
  },
  totalQuestions: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Prevent model overwrite
const Exam = mongoose.models.Exam || mongoose.model("Exam", examSchema);

export default Exam;