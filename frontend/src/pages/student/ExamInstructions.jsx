// pages/student/ExamInstructions.jsx
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { startExam } from "../../services/examService";

const ExamInstructions = () => {
  const { examId } = useParams();
  const navigate = useNavigate();

  const handleStart = async () => {
    try {
      await startExam(examId);
      navigate(`/student/exam/${examId}/attempt`);
    } catch (err) {
      alert(err.response?.data?.message);
    }
  };

  return (
    <Layout title="Exam Instructions">
      <div className="bg-white p-6 rounded-xl shadow">
        <h2 className="text-xl font-semibold mb-4">
          Please read instructions carefully
        </h2>

        <ul className="list-disc ml-5 space-y-2">
          <li>No tab switching allowed.</li>
          <li>Exam auto submits after time ends.</li>
          <li>Each question has 4 options.</li>
        </ul>

        <button
          onClick={handleStart}
          className="mt-6 bg-green-600 text-white px-6 py-2 rounded"
        >
          Start Exam
        </button>
      </div>
    </Layout>
  );
};

export default ExamInstructions;