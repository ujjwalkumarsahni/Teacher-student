import mongoose from "mongoose";

const optionSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false },
);

const questionSchema = new mongoose.Schema(
  {
    // Reference to exam
    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
      index: true,
    },

    // Question text
    questionText: {
      type: String,
      required: true,
      trim: true,
    },

    // Options (A, B, C, D)
    options: {
      type: [optionSchema],
      required: true,
      validate: {
        validator: function (v) {
          return v && v.length === 4; // Exactly 4 options
        },
        message: "Question must have exactly 4 options",
      },
    },

    // Correct answer
    correctAnswer: {
      type: Number, // 0-3 index in options array
      required: true,
      min: 0,
      max: 3,
    },

    // Marks and negative marks
    marks: {
      type: Number,
      required: true,
      min: 0,
      default: 1,
    },

    negativeMarks: {
      type: Number,
      min: 0,
      default: 0,
    },

    // Additional metadata
    difficultyLevel: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
      index: true,
    },

    topic: {
      type: String,
      trim: true,
      index: true,
    },

    createdByEmployee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    orderIndex: {
      type: Number,
      default: 0,
    },

    // Timestamps
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  },
);

// Index for faster queries
questionSchema.index({ exam: 1, difficultyLevel: 1 });
questionSchema.index({ exam: 1, topic: 1 });
questionSchema.index({ exam: 1, createdByEmployee: 1 });
export default mongoose.model("Question", questionSchema);
