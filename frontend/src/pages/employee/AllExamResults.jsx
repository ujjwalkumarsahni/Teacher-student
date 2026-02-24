// pages/employee/AllExamResults.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Calendar, Users, Search, Eye } from 'lucide-react';
import Layout from '../../components/Layout';
import api from '../../services/api';

const AllExamResults = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filteredExams, setFilteredExams] = useState([]);

  useEffect(() => {
    fetchExams();
  }, []);

  useEffect(() => {
    filterExams();
  }, [search, exams]);

  const fetchExams = async () => {
    try {
      // You might need to create this API endpoint
      const response = await api.get('/exams/employee/all');
      setExams(response.data.exams || []);
      setFilteredExams(response.data.exams || []);
    } catch (error) {
      console.error('Error fetching exams:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterExams = () => {
    if (!search.trim()) {
      setFilteredExams(exams);
      return;
    }

    const filtered = exams.filter(exam => 
      exam.title.toLowerCase().includes(search.toLowerCase()) ||
      exam.subject.toLowerCase().includes(search.toLowerCase()) ||
      exam.grade.toLowerCase().includes(search.toLowerCase())
    );
    setFilteredExams(filtered);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'published': return 'bg-green-100 text-green-700';
      case 'draft': return 'bg-gray-100 text-gray-700';
      case 'completed': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (loading) {
    return (
      <Layout title="Exam Results">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#EA8E0A' }}></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Exam Results">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h2 className="text-xl font-semibold" style={{ color: '#0B234A' }}>
            Select an Exam to View Results
          </h2>
          
          {/* Search */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search exams..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2"
              style={{ borderColor: '#E5E7EB', focusRingColor: '#EA8E0A' }}
            />
          </div>
        </div>
      </div>

      {/* Exams Grid */}
      {filteredExams.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <FileText className="h-16 w-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Exams Found</h3>
          <p className="text-gray-500">
            {search ? 'No exams match your search criteria' : 'No exams have been created yet'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredExams.map((exam) => (
            <div key={exam._id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-1" style={{ color: '#0B234A' }}>
                      {exam.title}
                    </h3>
                    <p className="text-sm text-gray-600">{exam.subject} • Grade {exam.grade}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(exam.status)}`}>
                    {exam.status}
                  </span>
                </div>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" style={{ color: '#EA8E0A' }} />
                    <span>{new Date(exam.startTime).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Users className="h-4 w-4" style={{ color: '#EA8E0A' }} />
                    <span>{exam.totalStudents || 0} students</span>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/employee/exam-results/${exam._id}`)}
                  disabled={exam.status === 'draft'}
                  className="w-full py-2 rounded-lg font-medium flex items-center justify-center gap-2 transition hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ 
                    backgroundColor: exam.status === 'draft' ? '#E5E7EB' : '#0B234A',
                    color: exam.status === 'draft' ? '#9CA3AF' : '#FFFFFF'
                  }}
                >
                  <Eye className="h-4 w-4" />
                  {exam.status === 'draft' ? 'Not Published' : 'View Results'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
};

export default AllExamResults;