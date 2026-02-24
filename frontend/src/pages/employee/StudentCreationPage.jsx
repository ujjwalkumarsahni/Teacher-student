import React, { useState, useEffect } from 'react';
import { 
  UserPlus, 
  Upload, 
  X, 
  Download, 
  CheckCircle, 
  AlertCircle,
  Mail,
  Lock,
  GraduationCap,
  Users,
  FileSpreadsheet,
  Loader,
  Trash2,
  Eye
} from 'lucide-react';
import api from '../../services/api.js'; // Import your API instance
import * as XLSX from 'xlsx';

const StudentCreationPage = () => {
  const [activeTab, setActiveTab] = useState('single');
  const [showPopup, setShowPopup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recentStudents, setRecentStudents] = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(false);
  
  // Single registration form
  const [singleForm, setSingleForm] = useState({
    name: '',
    email: '',
    password: '',
    grade: ''
  });

  // Bulk upload state
  const [bulkData, setBulkData] = useState({
    file: null,
    previewData: [],
    fileName: ''
  });

  // Results state
  const [results, setResults] = useState({
    show: false,
    success: [],
    failed: []
  });

  const grades = [
    "Nursery", "LKG", "UKG",
    "1","2","3","4","5",
    "6","7","8","9","10",
    "11","12"
  ];

  // Fetch recent registrations
  const fetchRecentStudents = async () => {
    setLoadingRecent(true);
    try {
      const response = await api.get('/students/recent');
      setRecentStudents(response.data.students || []);
    } catch (error) {
      console.error('Error fetching recent students:', error);
    } finally {
      setLoadingRecent(false);
    }
  };

  useEffect(() => {
    fetchRecentStudents();
  }, []);

  // Single student registration
  const handleSingleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await api.post('/students/register', singleForm);
      
      setResults({
        show: true,
        success: [{ 
          name: response.data.student.user.name, 
          email: singleForm.email 
        }],
        failed: []
      });
      
      // Reset form and close popup
      setSingleForm({ name: '', email: '', password: '', grade: '' });
      setShowPopup(false);
      
      // Refresh recent students
      fetchRecentStudents();
      
    } catch (error) {
      setResults({
        show: true,
        success: [],
        failed: [{
          name: singleForm.name,
          email: singleForm.email,
          reason: error.response?.data?.message || 'Registration failed'
        }]
      });
    } finally {
      setLoading(false);
    }
  };

  // Handle file upload and parse Excel
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    
    try {
      const data = await readExcelFile(file);
      
      // Validate data structure
      const validatedData = data.map(row => ({
        name: row.Name || row.name || '',
        email: row.Email || row.email || '',
        password: row.Password || row.password || '',
        grade: row.Grade || row.grade || ''
      })).filter(row => row.name && row.email && row.password && row.grade);

      setBulkData({
        file,
        previewData: validatedData,
        fileName: file.name
      });
      
    } catch (error) {
      alert('Error reading file: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  // Read Excel file
  const readExcelFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[sheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = (error) => reject(error);
      reader.readAsArrayBuffer(file);
    });
  };

  // Bulk registration submit
  const handleBulkSubmit = async () => {
    if (!bulkData.file) return;
    
    setLoading(true);
    
    const formData = new FormData();
    formData.append('file', bulkData.file);

    try {
      const response = await api.post('/students/bulk-upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setResults({
        show: true,
        success: response.data.created > 0 ? [{ 
          count: response.data.created,
          message: `${response.data.created} students registered successfully`
        }] : [],
        failed: response.data.failed || []
      });
      
      // Reset bulk data
      setBulkData({ file: null, previewData: [], fileName: '' });
      setShowPopup(false);
      
      // Refresh recent students
      fetchRecentStudents();
      
    } catch (error) {
      setResults({
        show: true,
        success: [],
        failed: [{
          name: 'Bulk Upload',
          email: '',
          reason: error.response?.data?.message || 'Bulk upload failed'
        }]
      });
    } finally {
      setLoading(false);
    }
  };

  // Download template
  const downloadTemplate = () => {
    const template = [
      ['Name', 'Email', 'Password', 'Grade'],
      ['John Doe', 'john@example.com', 'password123', '10'],
      ['Jane Smith', 'jane@example.com', 'password123', '12']
    ];
    
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(template);
    XLSX.utils.book_append_sheet(wb, ws, 'Template');
    XLSX.writeFile(wb, 'student_registration_template.xlsx');
  };

  // Clear file
  const clearFile = () => {
    setBulkData({ file: null, previewData: [], fileName: '' });
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F3F4F6' }}>
      {/* Main Content */}
      <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <button
            onClick={() => {
              setShowPopup(true);
              setActiveTab('single');
            }}
            className="group relative bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-200 border-2 border-transparent hover:border-orange-500"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-lg" style={{ backgroundColor: '#0B234A' }}>
                <UserPlus className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4 text-left">
                <h3 className="text-lg font-semibold" style={{ color: '#0B234A' }}>
                  Single Registration
                </h3>
                <p className="text-sm text-gray-600">
                  Register one student at a time with complete details
                </p>
              </div>
            </div>
          </button>

          <button
            onClick={() => {
              setShowPopup(true);
              setActiveTab('bulk');
            }}
            className="group relative bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-all duration-200 border-2 border-transparent hover:border-red-500"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-lg" style={{ backgroundColor: '#EA8E0A' }}>
                <Upload className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4 text-left">
                <h3 className="text-lg font-semibold" style={{ color: '#0B234A' }}>
                  Bulk Registration
                </h3>
                <p className="text-sm text-gray-600">
                  Upload Excel file to register multiple students at once
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* Results Display */}
        {results.show && (
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
            <div className="px-6 py-4" style={{ backgroundColor: '#0B234A' }}>
              <h2 className="text-lg font-semibold text-white">Registration Results</h2>
            </div>
            
            {results.success.length > 0 && (
              <div className="p-6 border-b">
                <h3 className="text-md font-medium mb-3 flex items-center" style={{ color: '#10B981' }}>
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Successful Registrations ({results.success.length})
                </h3>
                <div className="bg-green-50 rounded-lg p-4 max-h-40 overflow-y-auto">
                  {results.success.map((item, idx) => (
                    <div key={idx} className="text-sm text-gray-700 mb-1">
                      {item.count ? item.message : `${item.name} - ${item.email}`}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {results.failed.length > 0 && (
              <div className="p-6">
                <h3 className="text-md font-medium mb-3 flex items-center" style={{ color: '#E22213' }}>
                  <AlertCircle className="h-5 w-5 mr-2" />
                  Failed Registrations ({results.failed.length})
                </h3>
                <div className="bg-red-50 rounded-lg p-4 max-h-40 overflow-y-auto">
                  {results.failed.map((item, idx) => (
                    <div key={idx} className="text-sm text-gray-700 mb-1">
                      {item.name} - {item.email} 
                      <span className="text-red-600 ml-2">({item.reason})</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="px-6 py-4 bg-gray-50 text-right">
              <button
                onClick={() => setResults({ show: false, success: [], failed: [] })}
                className="px-4 py-2 text-sm font-medium rounded-md"
                style={{ backgroundColor: '#0B234A', color: 'white' }}
              >
                Clear Results
              </button>
            </div>
          </div>
        )}

        {/* Recent Registrations */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b" style={{ backgroundColor: '#0B234A' }}>
            <h2 className="text-lg font-semibold text-white flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Recent Registrations
              <button 
                onClick={fetchRecentStudents}
                className="ml-auto text-white hover:text-gray-200"
              >
                <Eye className="h-4 w-4" />
              </button>
            </h2>
          </div>
          
          {loadingRecent ? (
            <div className="px-6 py-8 text-center">
              <Loader className="h-8 w-8 animate-spin mx-auto" style={{ color: '#0B234A' }} />
              <p className="mt-2 text-sm text-gray-600">Loading recent registrations...</p>
            </div>
          ) : (
            <div className="divide-y">
              {recentStudents.length > 0 ? (
                recentStudents.map((student) => (
                  <div key={student._id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#EA8E0A' }}>
                        <GraduationCap className="h-5 w-5 text-white" />
                      </div>
                      <div className="ml-4">
                        <p className="text-sm font-medium text-gray-900">{student.user?.name || 'Unknown'}</p>
                        <p className="text-sm text-gray-600">
                          Grade {student.grade} • {student.user?.email || 'No email'}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(student.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))
              ) : (
                <div className="px-6 py-8 text-center text-gray-500">
                  No recent registrations found
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Registration Popup */}
      {showPopup && (
        <div className="fixed inset-0 bg-white/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Popup Header */}
            <div className="px-6 py-4 border-b flex items-center justify-between" style={{ backgroundColor: '#0B234A' }}>
              <h2 className="text-lg font-semibold text-white flex items-center">
                {activeTab === 'single' ? (
                  <><UserPlus className="h-5 w-5 mr-2" /> Single Student Registration</>
                ) : (
                  <><Upload className="h-5 w-5 mr-2" /> Bulk Student Registration</>
                )}
              </h2>
              <button
                onClick={() => setShowPopup(false)}
                className="text-white hover:text-gray-200"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Popup Body */}
            <div className="p-6">
              {/* Tabs */}
              <div className="flex space-x-1 mb-6">
                <button
                  onClick={() => setActiveTab('single')}
                  className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'single'
                      ? 'text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  style={activeTab === 'single' ? { backgroundColor: '#0B234A' } : {}}
                >
                  Single Registration
                </button>
                <button
                  onClick={() => setActiveTab('bulk')}
                  className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                    activeTab === 'bulk'
                      ? 'text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                  style={activeTab === 'bulk' ? { backgroundColor: '#EA8E0A' } : {}}
                >
                  Bulk Upload
                </button>
              </div>

              {activeTab === 'single' ? (
                <form onSubmit={handleSingleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      value={singleForm.name}
                      onChange={(e) => setSingleForm({...singleForm, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                      style={{ focusRingColor: '#0B234A' }}
                      placeholder="Enter student's full name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <input
                        type="email"
                        required
                        value={singleForm.email}
                        onChange={(e) => setSingleForm({...singleForm, email: e.target.value})}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                        style={{ focusRingColor: '#0B234A' }}
                        placeholder="student@example.com"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                      <input
                        type="password"
                        required
                        minLength="6"
                        value={singleForm.password}
                        onChange={(e) => setSingleForm({...singleForm, password: e.target.value})}
                        className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                        style={{ focusRingColor: '#0B234A' }}
                        placeholder="Minimum 6 characters"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Grade
                    </label>
                    <select
                      required
                      value={singleForm.grade}
                      onChange={(e) => setSingleForm({...singleForm, grade: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2"
                      style={{ focusRingColor: '#0B234A' }}
                    >
                      <option value="">Select Grade</option>
                      {grades.map(grade => (
                        <option key={grade} value={grade}>{grade}</option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full mt-6 px-4 py-2 text-white font-medium rounded-md hover:opacity-90 disabled:opacity-50 flex items-center justify-center"
                    style={{ backgroundColor: '#0B234A' }}
                  >
                    {loading ? (
                      <><Loader className="h-5 w-5 animate-spin mr-2" /> Registering...</>
                    ) : (
                      <><UserPlus className="h-5 w-5 mr-2" /> Register Student</>
                    )}
                  </button>
                </form>
              ) : (
                <div className="space-y-6">
                  {/* Template Download */}
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <FileSpreadsheet className="h-6 w-6 text-green-600 mr-2" />
                        <div>
                          <h3 className="text-sm font-medium text-gray-900">Download Template</h3>
                          <p className="text-xs text-gray-600">Use our Excel template for bulk upload</p>
                        </div>
                      </div>
                      <button
                        onClick={downloadTemplate}
                        className="px-3 py-1 text-sm font-medium rounded-md flex items-center"
                        style={{ backgroundColor: '#0B234A', color: 'white' }}
                      >
                        <Download className="h-4 w-4 mr-1" /> Template
                      </button>
                    </div>
                  </div>

                  {/* File Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Upload Excel File
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                      {bulkData.file ? (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <FileSpreadsheet className="h-8 w-8 text-green-600 mr-2" />
                            <div>
                              <p className="text-sm font-medium text-gray-900">{bulkData.fileName}</p>
                              <p className="text-xs text-gray-500">{bulkData.previewData.length} students found</p>
                            </div>
                          </div>
                          <button
                            onClick={clearFile}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <input
                            type="file"
                            accept=".xlsx,.xls,.csv"
                            onChange={handleFileUpload}
                            className="hidden"
                            id="file-upload"
                          />
                          <label
                            htmlFor="file-upload"
                            className="cursor-pointer flex flex-col items-center"
                          >
                            <Upload className="h-8 w-8 text-gray-400 mb-2" />
                            <span className="text-sm text-gray-600">
                              Click to upload or drag and drop
                            </span>
                            <span className="text-xs text-gray-500 mt-1">
                              Excel files only (.xlsx, .xls, .csv)
                            </span>
                          </label>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Preview Data */}
                  {bulkData.previewData.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Preview ({bulkData.previewData.length} students)</h3>
                      <div className="bg-gray-50 rounded-lg p-4 max-h-60 overflow-y-auto">
                        {bulkData.previewData.map((row, idx) => (
                          <div key={idx} className="text-xs text-gray-600 mb-2 pb-2 border-b last:border-0">
                            {row.name} - {row.email} (Grade {row.grade})
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleBulkSubmit}
                    disabled={!bulkData.file || loading}
                    className="w-full px-4 py-2 text-white font-medium rounded-md hover:opacity-90 disabled:opacity-50 flex items-center justify-center"
                    style={{ backgroundColor: '#EA8E0A' }}
                  >
                    {loading ? (
                      <><Loader className="h-5 w-5 animate-spin mr-2" /> Uploading...</>
                    ) : (
                      <><Upload className="h-5 w-5 mr-2" /> Upload & Register Students</>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentCreationPage;