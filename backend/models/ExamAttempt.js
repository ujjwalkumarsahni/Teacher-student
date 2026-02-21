import mongoose from "mongoose";

const answerSchema = new mongoose.Schema({
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Question"
  },
  selectedOption: Number
}, { _id: false });

const examAttemptSchema = new mongoose.Schema({
  exam: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Exam"
  },
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Student"
  },
  answers: [answerSchema],
  score: Number,
  startedAt: Date,
  submittedAt: Date,
  status: {
    type: String,
    enum: ["in_progress", "submitted"],
    default: "in_progress"
  }
}, { timestamps: true });

examAttemptSchema.index({ exam: 1, student: 1 }, { unique: true });

export default mongoose.model("ExamAttempt", examAttemptSchema);