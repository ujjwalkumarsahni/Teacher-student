import mongoose from "mongoose";

const examSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true,
      index: true,
    },

    grade: {
      type: String,
      required: true,
      index: true,
    },

    subject: {
      type: String,
      required: true,
    },

    startTime: {
      type: Date,
      required: true,
    },

    endTime: {
      type: Date,
      required: true,
    },

    duration: {
      type: Number,
      required: true,
    },

    totalMarks: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["draft", "published", "completed"],
      default: "draft",
    },

    createdByEmployee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
  },
  { timestamps: true },
);

examSchema.index({ school: 1, grade: 1, status: 1 });

export default mongoose.model("Exam", examSchema);
