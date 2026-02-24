// pages/student/AvailableExams.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, Calendar, Filter } from 'lucide-react';
import Layout from '../../components/Layout';
import { getAvailableExams } from '../../services/examService';

const AvailableExams = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [filteredExams, setFilteredExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('');

  useEffect(() => {
    fetchExams();
  }, []);

  useEffect(() => {
    filterExams();
  }, [search, subjectFilter, exams]);

  const fetchExams = async () => {
    try {
      const response = await getAvailableExams();
      setExams(response.data.exams || []);
    } catch (error) {
      console.error('Error fetching exams:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterExams = () => {
    let filtered = [...exams];

    if (search) {
      filtered = filtered.filter(exam => 
        exam.title.toLowerCase().includes(search.toLowerCase()) ||
        exam.subject.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (subjectFilter) {
      filtered = filtered.filter(exam => exam.subject === subjectFilter);
    }

    setFilteredExams(filtered);
  };

  const subjects = [...new Set(exams.map(exam => exam.subject))];

  const getTimeRemaining = (endTime) => {
    const remaining = new Date(endTime) - new Date();
    const hours = Math.floor(remaining / (1000 * 60 * 60));
    const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) return `${hours}h ${minutes}m remaining`;
    if (minutes > 0) return `${minutes}m remaining`;
    return 'Expiring soon';
  };

  if (loading) {
    return (
      <Layout title="Available Exams">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: '#EA8E0A' }}></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Available Exams">
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search exams..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2"
              style={{ borderColor: '#E5E7EB', focusRingColor: '#EA8E0A' }}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" style={{ color: '#0B234A' }} />
            <select
              value={subjectFilter}
              onChange={(e) => setSubjectFilter(e.target.value)}
              className="p-3 border rounded-lg focus:outline-none focus:ring-2"
              style={{ borderColor: '#E5E7EB', focusRingColor: '#EA8E0A' }}
            >
              <option value="">All Subjects</option>
              {subjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Exams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredExams.length === 0 ? (
          <div className="col-span-full text-center py-12 bg-white rounded-xl">
            <p className="text-gray-500">No exams match your filters</p>
          </div>
        ) : (
          filteredExams.map((exam) => (
            <div key={exam._id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition">
              <div className="p-6">
                <h3 className="text-lg font-semibold mb-2" style={{ color: '#0B234A' }}>{exam.title}</h3>
                <p className="text-sm text-gray-600 mb-4">{exam.subject}</p>
                
                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4" style={{ color: '#EA8E0A' }} />
                    <span className="text-gray-600">Duration: {exam.duration} minutes</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4" style={{ color: '#EA8E0A' }} />
                    <span className="text-gray-600">Ends: {new Date(exam.endTime).toLocaleString()}</span>
                  </div>
                  <div className="text-sm font-medium" style={{ color: exam.isActive ? '#10B981' : '#E22213' }}>
                    {exam.isActive ? getTimeRemaining(exam.endTime) : 'Exam ended'}
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/student/take-exam/${exam._id}`)}
                  disabled={!exam.isActive}
                  className="w-full py-3 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ 
                    backgroundColor: exam.isActive ? '#EA8E0A' : '#E5E7EB',
                    color: exam.isActive ? '#FFFFFF' : '#9CA3AF'
                  }}
                >
                  {exam.isActive ? 'Start Exam' : 'Not Available'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </Layout>
  );
};

export default AvailableExams;