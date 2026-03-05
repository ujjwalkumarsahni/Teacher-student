// src/pages/admin/AllStudentAdmin.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  GraduationCap,
  Mail,
  Calendar,
  School,
  MapPin,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  X
} from "lucide-react";
import { getAllStudents, getAllSchools } from "../../services/adminService";
import { format } from "date-fns";
import toast from "react-hot-toast";

const AllStudentAdmin = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    grade: "",
    school: "",
    search: ""
  });
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Available grades
  const grades = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"];

  useEffect(() => {
    fetchSchools();
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [filters.grade, filters.school]); // Refetch when grade or school changes

  const fetchSchools = async () => {
    try {
      const data = await getAllSchools();
      setSchools(data.schools || []);
    } catch (error) {
      console.error("Error fetching schools:", error);
      toast.error("Failed to load schools");
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const data = await getAllStudents({
        grade: filters.grade,
        school: filters.school,
        search: filters.search
      });
      setStudents(data.students || []);
      setCurrentPage(1); // Reset to first page on new search
    } catch (error) {
      console.error("Error fetching students:", error);
      toast.error("Failed to load students");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    fetchStudents();
  };

  const handleClearFilters = () => {
    setFilters({
      grade: "",
      school: "",
      search: ""
    });
    // Wait for state to update then fetch
    setTimeout(() => fetchStudents(), 0);
  };

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentStudents = students.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(students.length / itemsPerPage);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">All Students</h1>
          <p className="text-gray-600 mt-1">
            Manage and view all students across schools
          </p>
        </div>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 text-gray-700 hover:text-[#0B234A]"
          >
            <Filter size={18} />
            <span className="font-medium">Filters</span>
            <ChevronRight
              size={16}
              className={`transform transition-transform ${
                showFilters ? "rotate-90" : ""
              }`}
            />
          </button>
        </div>

        {showFilters && (
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B234A] focus:border-transparent"
                />
              </div>

              {/* Grade Filter */}
              <select
                value={filters.grade}
                onChange={(e) => setFilters({ ...filters, grade: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B234A]"
              >
                <option value="">All Grades</option>
                {grades.map((grade) => (
                  <option key={grade} value={grade}>
                    Grade {grade}
                  </option>
                ))}
              </select>

              {/* School Filter */}
              <select
                value={filters.school}
                onChange={(e) => setFilters({ ...filters, school: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0B234A]"
              >
                <option value="">All Schools</option>
                {schools.map((school) => (
                  <option key={school._id} value={school._id}>
                    {school.name}
                  </option>
                ))}
              </select>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={handleSearch}
                  className="flex-1 px-4 py-2 bg-[#0B234A] text-white rounded-lg hover:bg-[#0B234A]/90 flex items-center justify-center gap-2"
                >
                  <Search size={18} />
                  Search
                </button>
                <button
                  onClick={handleClearFilters}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center justify-center"
                  title="Clear filters"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          Showing <span className="font-medium">{currentStudents.length}</span> of{" "}
          <span className="font-medium">{students.length}</span> students
        </p>
        <button
          onClick={fetchStudents}
          className="p-2 text-gray-600 hover:text-[#0B234A] hover:bg-gray-100 rounded-lg"
          title="Refresh"
        >
          <RefreshCw size={18} />
        </button>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  School
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
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                    </div>
                  </td>
                </tr>
              ) : currentStudents.length > 0 ? (
                currentStudents.map((student) => (
                  <tr
                    key={student._id}
                    className="hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/admin/students/${student._id}`)}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-orange-600 font-medium">
                            {student.user?.name?.charAt(0) || "S"}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-800">
                            {student.user?.name || "N/A"}
                          </p>
                          <p className="text-xs text-gray-500">
                            ID: {student._id.slice(-8)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail size={14} className="text-gray-400" />
                          <span className="truncate max-w-[200px]">
                            {student.user?.email || "N/A"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          <School size={14} className="text-gray-400" />
                          <span className="text-gray-800">
                            {student.school?.name || "N/A"}
                          </span>
                        </div>
                        {student.school?.city && (
                          <div className="flex items-center gap-2 text-xs text-gray-500">
                            <MapPin size={12} className="text-gray-400" />
                            <span>{student.school.city}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        Grade {student.grade}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar size={14} className="text-gray-400" />
                        <span>
                          {format(new Date(student.admissionDate), "MMM dd, yyyy")}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin/students/${student._id}`);
                          }}
                          className="p-2 hover:bg-gray-100 rounded-lg text-[#0B234A]"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <GraduationCap className="mx-auto text-gray-400 mb-3" size={48} />
                    <p className="text-gray-600 mb-2">No students found</p>
                    <p className="text-sm text-gray-500">
                      Try adjusting your filters or add a new student
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {students.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg ${
                  currentPage === 1
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <ChevronLeft size={18} />
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-lg ${
                  currentPage === totalPages
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Export Section */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Download size={18} className="text-gray-400" />
            <span className="text-sm text-gray-600">Export student data</span>
          </div>
          <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm">
            Download CSV
          </button>
        </div>
      </div>
    </div>
  );
};

export default AllStudentAdmin;