// pages/employee/ViewExamResults.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Layout from "../../components/Layout";
import { getExamResults } from "../../services/examService";

const ViewExamResults = () => {
  const { examId } = useParams();
  const [results, setResults] = useState([]);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    const res = await getExamResults(examId);
    setResults(res.data.results);
  };

  return (
    <Layout title="Exam Results">
      <div className="bg-white p-6 rounded-xl shadow">
        <table className="w-full">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Score</th>
              <th>Percentage</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r, i) => (
              <tr key={i}>
                <td>{r.name}</td>
                <td>{r.email}</td>
                <td>{r.score}</td>
                <td>{r.percentage}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Layout>
  );
};

export default ViewExamResults;