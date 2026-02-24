import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Clock,
  BookOpen,
  Calendar,
  Award,
  PlayCircle,
  CheckCircle,
  AlertCircle,
  Loader,
  LogOut,
  FileText,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import api from '../../services/api.js';
import toast from 'react-hot-toast';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [availableExams, setAvailableExams] = useState([]);
  const [attemptedExams, setAttemptedExams] = useState([]);
  const [studentInfo, setStudentInfo] = useState(null);
  const [stats, setStats] = useState({
    totalExams: 0,
    completedExams: 0,
    averageScore: 0,
    pendingExams: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch available exams
      const availableRes = await api.get('/student/exams/available');
      setAvailableExams(availableRes.data.exams || []);

      // Fetch attempted exams (you'll need to create this endpoint)
      const attemptedRes = await api.get('/student/exams/attempted');
      setAttemptedExams(attemptedRes.data.exams || []);

      // Get student info from localStorage
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      setStudentInfo(user);

      // Calculate stats
      const completed = attemptedRes.data.exams?.length || 0;
      const total = availableRes.data.exams?.length || 0;
      const avgScore = attemptedRes.data.exams?.reduce((acc, exam) => acc + (exam.score || 0), 0) / (completed || 1);

      setStats({
        totalExams: total + completed,
        completedExams: completed,
        averageScore: Math.round(avgScore),
        pendingExams: total
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleStartExam = async (examId) => {
    try {
      const response = await api.post('/student/exams/start', { examId });
      
      if (response.data.success) {
        toast.success('Starting exam...');
        navigate(`/student/exam/${examId}`);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to start exam');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader className="h-12 w-12 animate-spin mx-auto" style={{ color: '#0B234A' }} />
          <p className="mt-4 text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b" style={{ borderColor: '#0B234A' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="p-2 rounded-lg" style={{ backgroundColor: '#0B234A' }}>
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div className="ml-3">
                <h1 className="text-xl font-bold" style={{ color: '#0B234A' }}>
                  Student Dashboard
                </h1>
                <p className="text-sm text-gray-600">
                  Welcome back, {studentInfo?.name || 'Student'}!
                </p>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg" style={{ backgroundColor: '#0B234A' }}>
                <BookOpen className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Exams</p>
                <p className="text-2xl font-bold" style={{ color: '#0B234A' }}>
                  {stats.totalExams}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg" style={{ backgroundColor: '#EA8E0A' }}>
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Completed</p>
                <p className="text-2xl font-bold" style={{ color: '#0B234A' }}>
                  {stats.completedExams}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg" style={{ backgroundColor: '#10B981' }}>
                <Award className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Avg. Score</p>
                <p className="text-2xl font-bold" style={{ color: '#0B234A' }}>
                  {stats.averageScore}%
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg" style={{ backgroundColor: '#E22213' }}>
                <Clock className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Pending</p>
                <p className="text-2xl font-bold" style={{ color: '#0B234A' }}>
                  {stats.pendingExams}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Available Exams Section */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4 flex items-center" style={{ color: '#0B234A' }}>
            <PlayCircle className="h-5 w-5 mr-2" />
            Available Exams ({availableExams.length})
          </h2>

          {availableExams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableExams.map((exam) => (
                <div key={exam._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-gray-900">{exam.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{exam.subject}</p>
                      </div>
                      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                        Available
                      </span>
                    </div>

                    <div className="mt-4 space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-2" />
                        Duration: {formatTime(exam.duration)}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="h-4 w-4 mr-2" />
                        Ends: {new Date(exam.endTime).toLocaleString()}
                      </div>
                      {exam.remainingTimeInMinutes > 0 && (
                        <div className="flex items-center text-sm text-orange-600">
                          <AlertCircle className="h-4 w-4 mr-2" />
                          {exam.remainingTimeInMinutes} mins remaining
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => handleStartExam(exam._id)}
                      className="mt-4 w-full px-4 py-2 text-white font-medium rounded-md hover:opacity-90 transition-opacity flex items-center justify-center"
                      style={{ backgroundColor: '#0B234A' }}
                    >
                      <PlayCircle className="h-4 w-4 mr-2" />
                      Start Exam
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-md p-8 text-center">
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-3" />
              <h3 className="text-lg font-medium text-gray-900">No Exams Available</h3>
              <p className="text-sm text-gray-600 mt-1">
                You don't have any pending exams at the moment.
              </p>
            </div>
          )}
        </div>

        {/* Attempted Exams Section */}
        {attemptedExams.length > 0 && (
          <div>
            <h2 className="text-lg font-semibold mb-4 flex items-center" style={{ color: '#0B234A' }}>
              <BarChart3 className="h-5 w-5 mr-2" />
              Recent Attempts
            </h2>

            <div className="bg-white rounded-lg shadow-md overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead style={{ backgroundColor: '#0B234A' }}>
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Exam
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Subject
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Score
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {attemptedExams.map((exam) => (
                    <tr key={exam._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {exam.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {exam.subject}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          exam.score >= 70 ? 'bg-green-100 text-green-800' :
                          exam.score >= 40 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {exam.score}%
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <span className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
                          Completed
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(exam.submittedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default StudentDashboard;