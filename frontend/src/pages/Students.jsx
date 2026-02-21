// src/pages/Students.jsx
import React, { useState, useEffect } from 'react';
import api from '../services/api';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  CloudArrowUpIcon
} from '@heroicons/react/24/outline';
import Button from '../components/Common/Button';
import Modal from '../components/Common/Modal';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    grade: ''
  });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 1
  });

  useEffect(() => {
    fetchStudents();
  }, [pagination.page, search]);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/students', {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          search
        }
      });
      
      setStudents(response.data.data);
      setPagination({
        ...pagination,
        total: response.data.total,
        pages: response.data.pages
      });
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      await api.post('/students/register', formData);
      setShowAddModal(false);
      setFormData({ name: '', email: '', password: '', grade: '' });
      fetchStudents();
    } catch (error) {
      console.error('Error adding student:', error);
      alert(error.response?.data?.message || 'Error adding student');
    }
  };

  const handleBulkUpload = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setUploading(true);
      const response = await api.post('/students/bulk-upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      alert(`Successfully created ${response.data.created} students. Failed: ${response.data.failedCount}`);
      setShowBulkModal(false);
      setFile(null);
      fetchStudents();
    } catch (error) {
      console.error('Error bulk uploading:', error);
      alert(error.response?.data?.message || 'Error uploading file');
    } finally {
      setUploading(false);
    }
  };

  const grades = [
    'Nursery', 'LKG', 'UKG', '1', '2', '3', '4', '5',
    '6', '7', '8', '9', '10', '11', '12'
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Students Management</h2>
        <div className="flex space-x-3">
          <Button
            onClick={() => setShowBulkModal(true)}
            variant="secondary"
            icon={<CloudArrowUpIcon className="h-5 w-5" />}
          >
            Bulk Upload
          </Button>
          <Button
            onClick={() => setShowAddModal(true)}
            variant="primary"
            icon={<PlusIcon className="h-5 w-5" />}
          >
            Add Student
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="relative">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search students by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EA8E0A] focus:border-transparent"
          />
        </div>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Grade
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Admission Date
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : students.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-4 text-center text-gray-500">
                  No students found
                </td>
              </tr>
            ) : (
              students.map((student) => (
                <tr key={student._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {student.user?.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {student.user?.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-[#EA8E0A]/10 text-[#EA8E0A]">
                      {student.grade}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(student.admissionDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-[#0B234A] hover:text-[#EA8E0A] mr-3">
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button className="text-[#E22213] hover:text-red-700">
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <Button
              onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
              disabled={pagination.page === 1}
              variant="secondary"
            >
              Previous
            </Button>
            <Button
              onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
              disabled={pagination.page === pagination.pages}
              variant="secondary"
            >
              Next
            </Button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing page <span className="font-medium">{pagination.page}</span> of{' '}
                <span className="font-medium">{pagination.pages}</span>
              </p>
            </div>
            <div className="flex space-x-2">
              <Button
                onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                disabled={pagination.page === 1}
                variant="secondary"
                size="sm"
              >
                Previous
              </Button>
              <Button
                onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                disabled={pagination.page === pagination.pages}
                variant="secondary"
                size="sm"
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Add Student Modal */}
      {showAddModal && (
        <Modal
          title="Add New Student"
          onClose={() => setShowAddModal(false)}
        >
          <form onSubmit={handleAddStudent} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EA8E0A]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EA8E0A]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                minLength="6"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#EA8E0A]"
              />
            </div>
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
            <div className="flex justify-end space-x-3 mt-6">
              <Button
                type="button"
                onClick={() => setShowAddModal(false)}
                variant="secondary"
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary">
                Add Student
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Bulk Upload Modal */}
      {showBulkModal && (
        <Modal
          title="Bulk Upload Students"
          onClose={() => setShowBulkModal(false)}
        >
          <form onSubmit={handleBulkUpload} className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => setFile(e.target.files[0])}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer text-[#EA8E0A] hover:text-[#0B234A]"
              >
                <CloudArrowUpIcon className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <span className="block">Click to upload Excel file</span>
                <span className="text-sm text-gray-500">.xlsx or .xls</span>
              </label>
            </div>
            
            {file && (
              <p className="text-sm text-gray-600">
                Selected file: {file.name}
              </p>
            )}

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-medium text-blue-800 mb-2">File Format Required:</h4>
              <p className="text-sm text-blue-600">
                Excel file must have columns: name, email, password, grade
              </p>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <Button
                type="button"
                onClick={() => setShowBulkModal(false)}
                variant="secondary"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={uploading}
                disabled={!file}
              >
                Upload
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};

export default Students;