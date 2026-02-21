// pages/Employees.jsx
import React, { useState } from 'react';
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EnvelopeIcon,
  PhoneIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

const Employees = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const employees = [
    { id: 1, name: 'Dr. Rajesh Kumar', email: 'rajesh@school.com', department: 'Teaching', designation: 'Principal', phone: '9876543001', joinDate: '2020-01-15', status: 'active' },
    { id: 2, name: 'Mrs. Sunita Sharma', email: 'sunita@school.com', department: 'Teaching', designation: 'Senior Teacher', phone: '9876543002', joinDate: '2020-03-20', status: 'active' },
    { id: 3, name: 'Mr. Amit Verma', email: 'amit@school.com', department: 'Teaching', designation: 'Math Teacher', phone: '9876543003', joinDate: '2021-06-10', status: 'active' },
    { id: 4, name: 'Ms. Priya Gupta', email: 'priya@school.com', department: 'Administration', designation: 'Accountant', phone: '9876543004', joinDate: '2021-08-15', status: 'inactive' },
    { id: 5, name: 'Mr. Suresh Patel', email: 'suresh@school.com', department: 'Support', designation: 'Librarian', phone: '9876543005', joinDate: '2022-02-01', status: 'active' },
  ];

  const departments = ['all', 'Teaching', 'Administration', 'Support', 'Management'];

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = selectedDepartment === 'all' || emp.department === selectedDepartment;
    return matchesSearch && matchesDept;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employees Management</h1>
          <p className="text-gray-600">Manage all staff members and their details</p>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-[#0B234A] text-white rounded-lg hover:bg-[#0B234A]/90 transition flex items-center"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Employee
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Employees</p>
              <p className="text-2xl font-bold text-gray-900">45</p>
            </div>
            <div className="bg-[#0B234A] p-3 rounded-lg">
              <UserGroupIcon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Teaching Staff</p>
              <p className="text-2xl font-bold text-gray-900">28</p>
            </div>
            <div className="bg-[#EA8E0A] p-3 rounded-lg">
              <UserGroupIcon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Administration</p>
              <p className="text-2xl font-bold text-gray-900">12</p>
            </div>
            <div className="bg-[#0B234A] p-3 rounded-lg">
              <UserGroupIcon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Support Staff</p>
              <p className="text-2xl font-bold text-gray-900">5</p>
            </div>
            <div className="bg-[#E22213] p-3 rounded-lg">
              <UserGroupIcon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-3 md:space-y-0">
          <div className="flex-1 max-w-md relative">
            <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search employees by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EA8E0A] focus:border-transparent"
            />
          </div>
          <div className="flex items-center space-x-3">
            <FunnelIcon className="h-5 w-5 text-gray-400" />
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EA8E0A] focus:border-transparent"
            >
              {departments.map(dept => (
                <option key={dept} value={dept}>
                  {dept === 'all' ? 'All Departments' : dept}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Employee</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Department</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Designation</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Contact</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Join Date</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((emp) => (
                <tr key={emp.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <div className="h-8 w-8 bg-[#0B234A] rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {emp.name.charAt(0)}
                        </span>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{emp.name}</p>
                        <p className="text-xs text-gray-500">{emp.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">{emp.department}</td>
                  <td className="py-3 px-4 text-sm text-gray-600">{emp.designation}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <EnvelopeIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{emp.phone}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">{emp.joinDate}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      emp.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {emp.status}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <button className="p-1 hover:bg-gray-100 rounded" title="Edit">
                        <PencilIcon className="h-4 w-4 text-[#EA8E0A]" />
                      </button>
                      <button className="p-1 hover:bg-gray-100 rounded" title="Delete">
                        <TrashIcon className="h-4 w-4 text-[#E22213]" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Employees;