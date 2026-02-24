// src/pages/employee/ExamsList.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Eye, 
  Search, 
  Calendar,
  Users,
  Clock,
  Award,
  BookOpen,
  Filter,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ExamsList = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      console.log('Fetching exams...');
      // Try both possible endpoints
      let response;
      try {
        // First try the new endpoint
        response = await api.get('/exams');
      } catch (error) {
        // If that fails, try the old endpoint
        console.log('Trying alternative endpoint...');
        response = await api.get('/exams/my-exams');
      }
      
      console.log('Exams response:', response.data);
      
      // Handle different response structures
      const examsData = response.data.exams || response.data.data || response.data;
      setExams(Array.isArray(examsData) ? examsData : []);
    } catch (error) {
      console.error('Fetch exams error:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch exams');
    } finally {
      setLoading(false);
    }
  };

  const viewExamResults = (examId) => {
    navigate(`/employee/exam-results/${examId}`);
  };

  const getStatusColor = (status) => {
    switch(status?.toLowerCase()) {
      case 'published':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'draft':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'ongoing':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredExams = exams.filter(exam => 
    exam.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exam.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    exam.grade?.toLowerCase().includes(searchTerm.toLowerCase())
  ).filter(exam => 
    statusFilter === 'all' || exam.status?.toLowerCase() === statusFilter.toLowerCase()
  );

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#EA8E0A] mb-4"></div>
        <p className="text-gray-600">Loading exams...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[#0B234A] flex items-center gap-2">
          <Award className="h-8 w-8 text-[#EA8E0A]" />
          Exam Results
        </h1>
        <p className="text-gray-600 mt-2">
          Select an exam to view and verify student results
        </p>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search exams by title, subject, or grade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-[#EA8E0A] focus:border-transparent"
            />
          </div>
          
          {/* Status Filter */}
          <div className="md:w-48 relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg w-full focus:ring-2 focus:ring-[#EA8E0A] appearance-none bg-white"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="draft">Draft</option>
            </select>
          </div>
        </div>

        {/* Active Filters */}
        {(searchTerm || statusFilter !== 'all') && (
          <div className="mt-3 flex items-center gap-2 text-sm">
            <span className="text-gray-500">Active filters:</span>
            {searchTerm && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full flex items-center gap-1">
                Search: {searchTerm}
                <button onClick={() => setSearchTerm('')} className="hover:text-blue-600">×</button>
              </span>
            )}
            {statusFilter !== 'all' && (
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full flex items-center gap-1">
                Status: {statusFilter}
                <button onClick={() => setStatusFilter('all')} className="hover:text-green-600">×</button>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Exams Grid */}
      {filteredExams.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-xl p-16 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <BookOpen className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-700 mb-3">No Exams Found</h3>
            <p className="text-gray-500 mb-8">
              {searchTerm || statusFilter !== 'all' 
                ? "No exams match your search criteria. Try adjusting your filters."
                : "You haven't created any exams yet. Create your first exam to start viewing results."}
            </p>
            {(searchTerm || statusFilter !== 'all') ? (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('all');
                }}
                className="px-6 py-3 bg-[#EA8E0A] text-white rounded-lg hover:bg-[#d17e08] transition-colors"
              >
                Clear All Filters
              </button>
            ) : (
              <button
                onClick={() => navigate('/employee/create-exam')}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#EA8E0A] text-white rounded-lg hover:bg-[#d17e08] transition-colors"
              >
                <BookOpen className="h-5 w-5" />
                Create Your First Exam
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExams.map((exam) => (
            <div
              key={exam._id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group"
              onClick={() => viewExamResults(exam._id)}
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-[#0B234A] mb-2 group-hover:text-[#EA8E0A] transition-colors line-clamp-2">
                      {exam.title}
                    </h3>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(exam.status)}`}>
                      {exam.status || 'Draft'}
                    </span>
                  </div>
                  <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-[#EA8E0A] transition-colors">
                    <Award className="h-5 w-5 text-[#EA8E0A] group-hover:text-white" />
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <BookOpen className="h-4 w-4 mr-2 text-gray-400" />
                    <span className="font-medium">{exam.subject || 'N/A'}</span>
                    <span className="mx-2">•</span>
                    <span>Grade {exam.grade || 'N/A'}</span>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                    {exam.startTime ? new Date(exam.startTime).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    }) : 'Date not set'}
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="h-4 w-4 mr-2 text-gray-400" />
                    {exam.duration ? `${exam.duration} minutes` : 'Duration not set'}
                  </div>

                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="h-4 w-4 mr-2 text-gray-400" />
                    {exam.studentCount || 0} Students
                  </div>
                </div>

                {/* Question Count and Marks */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className="text-sm text-gray-500">
                    {exam.questionCount || 0} Questions
                  </span>
                  <span className="text-sm font-medium text-[#0B234A]">
                    {exam.totalMarks || 0} Marks
                  </span>
                </div>

                {/* Pending Verification Badge */}
                {exam.pendingVerifications > 0 && (
                  <div className="mt-3 flex items-center gap-1 text-xs text-yellow-600 bg-yellow-50 px-2 py-1 rounded">
                    <AlertCircle className="h-3 w-3" />
                    <span>{exam.pendingVerifications} result(s) pending verification</span>
                  </div>
                )}

                {/* View Results Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    viewExamResults(exam._id);
                  }}
                  className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 bg-[#0B234A] text-white rounded-lg hover:bg-[#0a1e3d] transition-colors group-hover:bg-[#EA8E0A] group-hover:hover:bg-[#d17e08]"
                >
                  <Eye className="h-4 w-4" />
                  View Results
                  <ChevronRight className="h-4 w-4 ml-auto" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Results Count */}
      {filteredExams.length > 0 && (
        <div className="mt-6 text-sm text-gray-500 text-center">
          Showing {filteredExams.length} of {exams.length} exams
        </div>
      )}
    </div>
  );
};

export default ExamsList;