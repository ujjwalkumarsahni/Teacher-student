// src/pages/Exams.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  PlayIcon
} from '@heroicons/react/24/outline';
import Button from '../components/Common/Button';
import Modal from '../components/Common/Modal';

const Exams = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showQuestionsModal, setShowQuestionsModal] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    grade: '',
    subject: '',
    startTime: '',
    duration: ''
  });

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const response = await api.get('/exams');
      setExams(response.data.exams || []);
    } catch (error) {
      console.error('Error fetching exams:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateExam = async (e) => {
    e.preventDefault();
    try {
      await api.post('/exams', formData);
      setShowCreateModal(false);
      setFormData({ title: '', grade: '', subject: '', startTime: '', duration: '' });
      fetchExams();
    } catch (error) {
      console.error('Error creating exam:', error);
      alert(error.response?.data?.message || 'Error creating exam');
    }
  };

  const handlePublishExam = async (examId) => {
    try {
      await api.post('/exams/publish', { examId });
      fetchExams();
    } catch (error) {
      console.error('Error publishing exam:', error);
      alert(error.response?.data?.message || 'Error publishing exam');
    }
  };

  const grades = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
  const subjects = ['Mathematics', 'Science', 'English', 'History', 'Geography', 'Computer Science'];

  const getStatusBadge = (status) => {
    const colors = {
      draft: 'bg-gray-100 text-gray-800',
      published: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800'
    };
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${colors[status]}`}>
        {status}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Exams Management</h2>
        <Button
          onClick={() => setShowCreateModal(true)}
          variant="primary"
          icon={<PlusIcon className="h-5 w-5" />}
        >
          Create Exam
        </Button>
      </div>

      {/* Exams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {exams.map((exam) => (
          <div key={exam._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-semibold text-gray-800">{exam.title}</h3>
                {getStatusBadge(exam.status)}
              </div>
              
              <div className="space-y-2 text-sm text-gray-600">
                <p><span className="font-medium">Subject:</span> {exam.subject}</p>
                <p><span className="font-medium">Grade:</span> {exam.grade}</p>
                <p><span className="font-medium">Duration:</span> {exam.duration} minutes</p>
                <p><span className="font-medium">Start:</span> {new Date(exam.startTime).toLocaleString()}</p>
                <p><span className="font-medium">End:</span> {new Date(exam.endTime).toLocaleString()}</p>
              </div>
            </div>
            
            <div className="border-t border-gray-100 p-4 bg-gray-50 flex justify-end space-x-2">
              <button
                onClick={() => {
                  setSelectedExam(exam);
                  setShowQuestionsModal(true);
                }}
                className="p-2 text-gray-600 hover:text-[#0B234A] rounded-lg hover:bg-white"
                title="Add Questions"
              >
                <PencilIcon className="h-5 w-5" />
              </button>
              
              {exam.status === 'draft' && (
                <button
                  onClick={() => handlePublishExam(exam._id)}
                  className="p-2 text-gray-600 hover:text-green-600 rounded-lg hover:bg-white"
                  title="Publish Exam"
                >
                  <PlayIcon className="h-5 w-5" />
                </button>
              )}
              
              <button
                className="p-2 text-gray-600 hover:text-[#EA8E0A] rounded-lg hover:bg-white"
                title="View Results"
              >
                <EyeIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Create Exam Modal */}
      {showCreateModal && (
        <Modal
          title="Create New Exam"
          onClose={() => setShowCreateModal(false)}
        >
          <form onSubmit={handleCreateExam} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Exam Title
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EA8E0A]"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Grade
                </label>
                <select
                  required
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EA8E0A]"
                >
                  <option value="">Select Grade</option>
                  {grades.map(grade => (
                    <option key={grade} value={grade}>{grade}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject
                </label>
                <select
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EA8E0A]"
                >
                  <option value="">Select Subject</option>
                  {subjects.map(subject => (
                    <option key={subject} value={subject}>{subject}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Start Time
              </label>
              <input
                type="datetime-local"
                required
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EA8E0A]"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (minutes)
              </label>
              <input
                type="number"
                required
                min="1"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EA8E0A]"
              />
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                type="button"
                onClick={() => setShowCreateModal(false)}
                variant="secondary"
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Create Exam
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Exams;