// src/pages/employee/PendingVerifications.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, Eye, ChevronRight, AlertCircle } from "lucide-react";
import { getPendingVerifications } from "../../services/employeeService";
import toast from "react-hot-toast";

const PendingVerifications = () => {
  const navigate = useNavigate();
  const [pendingExams, setPendingExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingVerifications();
  }, []);

  const fetchPendingVerifications = async () => {
    try {
      setLoading(true);
      const data = await getPendingVerifications();
      setPendingExams(data);
    } catch (error) {
      toast.error(error.message || "Failed to fetch pending verifications");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#EA8E0A]"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0B234A] flex items-center gap-2">
          <Clock className="h-8 w-8 text-[#EA8E0A]" />
          Pending Verifications
        </h1>
        <p className="text-gray-600 mt-2">
          Review and verify student exam results
        </p>
      </div>

      {pendingExams.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="h-10 w-10 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">All Caught Up!</h3>
          <p className="text-gray-500">No pending verifications at the moment.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {pendingExams.map((exam) => (
            <div
              key={exam._id}
              className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-[#0B234A] mb-2">
                      {exam.title}
                    </h3>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <span>Subject: {exam.subject}</span>
                      <span>Grade: {exam.grade}</span>
                      <span className="flex items-center gap-1 text-[#EA8E0A]">
                        <Clock className="h-4 w-4" />
                        {exam.pendingCount} pending
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => navigate(`/employee/exam-results/${exam._id}`)}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0B234A] text-white rounded-lg hover:bg-[#0a1e3d] transition-colors"
                  >
                    Review
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-1 text-sm">
                    <span className="text-gray-600">Verification Progress</span>
                    <span className="font-medium text-[#0B234A]">
                      {exam.verifiedCount}/{exam.totalStudents}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-green-600 h-2 rounded-full transition-all"
                      style={{ width: `${(exam.verifiedCount / exam.totalStudents) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingVerifications;