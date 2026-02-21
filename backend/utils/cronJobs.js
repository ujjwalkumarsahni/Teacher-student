import cron from "node-cron";
import Exam from "../models/Exam.js";
import ExamAttempt from "../models/ExamAttempt.js";

cron.schedule("*/1 * * * *", async () => {
  const now = new Date();

  const attempts = await ExamAttempt.find({
    status: "in_progress"
  }).populate("exam");

  for (const attempt of attempts) {
    const exam = attempt.exam;
    if (!exam) continue;

    const attemptEndTime = new Date(
      attempt.startedAt.getTime() + exam.duration * 60000
    );

    if (now > attemptEndTime) {
      attempt.status = "submitted";
      attempt.submittedAt = attemptEndTime;
      attempt.score = attempt.score || 0;
      await attempt.save();
    }
  }

  console.log("Expired attempts checked");
});