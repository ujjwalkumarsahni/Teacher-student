import mongoose from "mongoose";

const answerSchema = new mongoose.Schema(
  {
    question: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Question",
    },
    selectedOption: Number,
  },
  { _id: false },
);

const examAttemptSchema = new mongoose.Schema(
  {
    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Student",
      required: true,
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    submittedAt: {
      type: Date,
    },
    answers: [
      {
        question: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Question",
        },
        selectedOption: {
          type: Number,
          min: 0,
          max: 3,
        },
      },
    ],
    endsAt: {
      type: Date,
      required: true,
    },
    score: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["in_progress", "submitted"],
      default: "in_progress",
    },

    certificateId: {
  type: String,
  unique: true,
  index: true
},
    // New fields for result verification
    isVerified: {
      type: Boolean,
      default: false,
    },
    verifiedAt: {
      type: Date,
    },
    remarks: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

examAttemptSchema.index({ exam: 1, student: 1 }, { unique: true });

export default mongoose.model("ExamAttempt", examAttemptSchema);
