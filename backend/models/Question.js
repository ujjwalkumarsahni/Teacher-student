import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Exam",
    required: true
  },
  questionText: {
    type: String,
    required: true
  },
  options: [{
    type: String,
    required: true
  }],
  correctAnswer: {
    type: Number, // index of correct option (0-3)
    required: true
  },
  marks: {
    type: Number,
    default: 1
  },
  negativeMarks: {
    type: Number,
    default: 0
  },
  difficultyLevel: {
    type: String,
    enum: ["easy", "medium", "hard"],
    default: "medium"
  },
  topic: {
    type: String,
    default: "General"
  },
  explanation: {
    type: String
  },
  createdByEmployee: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Employee",
    required: true
  }
}, { timestamps: true });

// Prevent model overwrite
const Question = mongoose.models.Question || mongoose.model("Question", questionSchema);

export default Question;