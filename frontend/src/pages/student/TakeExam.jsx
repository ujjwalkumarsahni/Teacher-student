// pages/student/TakeExam.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import {
  getExamQuestions,
  submitExam,
} from "../../services/examService";

const TakeExam = () => {
  const { examId } = useParams();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    fetchQuestions();
  }, []);

  useEffect(() => {
    if (!timeLeft) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const fetchQuestions = async () => {
    const res = await getExamQuestions(examId);
    setQuestions(res.data.questions);

    const endTime = new Date(res.data.exam.endTime);
    const now = new Date();
    setTimeLeft(Math.floor((endTime - now) / 1000));
  };

  const handleSelect = (questionId, optionIndex) => {
    const updated = answers.filter(
      (a) => a.question !== questionId
    );

    updated.push({
      question: questionId,
      selectedOption: optionIndex,
    });

    setAnswers(updated);
  };

  const handleSubmit = async () => {
    try {
      const res = await submitExam(examId, answers);
      navigate(
        `/student/result/${examId}`,
        { state: { score: res.data.score } }
      );
    } catch (err) {
      alert(err.response?.data?.message);
    }
  };

  return (
    <Layout title="Exam">
      <div className="flex justify-between mb-4">
        <h2>Time Left: {timeLeft}s</h2>
        <button
          onClick={handleSubmit}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          Submit
        </button>
      </div>

      {questions.map((q, index) => (
        <div key={q._id} className="bg-white p-6 mb-4 rounded-xl shadow">
          <h3 className="font-semibold">
            Q{index + 1}. {q.questionText}
          </h3>

          <div className="mt-3 space-y-2">
            {q.options.map((opt, i) => (
              <label key={i} className="block">
                <input
                  type="radio"
                  name={q._id}
                  onChange={() =>
                    handleSelect(q._id, i)
                  }
                />{" "}
                {opt.text}
              </label>
            ))}
          </div>
        </div>
      ))}
    </Layout>
  );
};

export default TakeExam;