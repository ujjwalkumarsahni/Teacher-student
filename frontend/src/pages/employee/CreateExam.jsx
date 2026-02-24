// // pages/employee/CreateExam.jsx
// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { Calendar, Clock, BookOpen, Users, ArrowRight } from 'lucide-react';
// import Layout from '../../components/Layout';
// import { createExam } from '../../services/examService';

// const CreateExam = () => {
//   const navigate = useNavigate();
//   const [formData, setFormData] = useState({
//     title: '',
//     grade: '',
//     subject: '',
//     startTime: '',
//     duration: 60
//   });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   const grades = ['Nursery', 'LKG', 'UKG', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
//   const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'English', 'History', 'Geography'];

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');

//     try {
//       const response = await createExam(formData);
//       navigate(`/employee/add-questions/${response.data.exam._id}`);
//     } catch (err) {
//       setError(err.response?.data?.message || 'Failed to create exam');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <Layout title="Create New Exam">
//       <div className="max-w-3xl mx-auto">
//         <div className="bg-white rounded-xl shadow-sm p-8">
//           <div className="flex items-center gap-3 mb-6">
//             <div className="p-2 rounded-lg" style={{ backgroundColor: '#0B234A', opacity: 0.1 }}>
//               <BookOpen className="h-6 w-6" style={{ color: '#0B234A' }} />
//             </div>
//             <h2 className="text-2xl font-bold" style={{ color: '#0B234A' }}>Exam Details</h2>
//           </div>

//           {error && (
//             <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: '#FEE', color: '#E22213' }}>
//               {error}
//             </div>
//           )}

//           <form onSubmit={handleSubmit} className="space-y-6">
//             {/* Exam Title */}
//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-2">
//                 Exam Title <span className="text-red-500">*</span>
//               </label>
//               <input
//                 type="text"
//                 value={formData.title}
//                 onChange={(e) => setFormData({ ...formData, title: e.target.value })}
//                 className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2"
//                 style={{ borderColor: '#E5E7EB', focusRingColor: '#EA8E0A' }}
//                 placeholder="e.g., Mathematics Mid-Term Examination"
//                 required
//               />
//             </div>

//             {/* Grade and Subject */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Grade <span className="text-red-500">*</span>
//                 </label>
//                 <select
//                   value={formData.grade}
//                   onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
//                   className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2"
//                   style={{ borderColor: '#E5E7EB', focusRingColor: '#EA8E0A' }}
//                   required
//                 >
//                   <option value="">Select Grade</option>
//                   {grades.map(grade => (
//                     <option key={grade} value={grade}>{grade}</option>
//                   ))}
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Subject <span className="text-red-500">*</span>
//                 </label>
//                 <select
//                   value={formData.subject}
//                   onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
//                   className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2"
//                   style={{ borderColor: '#E5E7EB', focusRingColor: '#EA8E0A' }}
//                   required
//                 >
//                   <option value="">Select Subject</option>
//                   {subjects.map(subject => (
//                     <option key={subject} value={subject}>{subject}</option>
//                   ))}
//                 </select>
//               </div>
//             </div>

//             {/* Start Time and Duration */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Start Time <span className="text-red-500">*</span>
//                 </label>
//                 <div className="relative">
//                   <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5" style={{ color: '#0B234A' }} />
//                   <input
//                     type="datetime-local"
//                     value={formData.startTime}
//                     onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
//                     className="pl-10 w-full p-3 border rounded-lg focus:outline-none focus:ring-2"
//                     style={{ borderColor: '#E5E7EB', focusRingColor: '#EA8E0A' }}
//                     required
//                   />
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 mb-2">
//                   Duration (minutes) <span className="text-red-500">*</span>
//                 </label>
//                 <div className="relative">
//                   <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5" style={{ color: '#0B234A' }} />
//                   <input
//                     type="number"
//                     value={formData.duration}
//                     onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
//                     className="pl-10 w-full p-3 border rounded-lg focus:outline-none focus:ring-2"
//                     style={{ borderColor: '#E5E7EB', focusRingColor: '#EA8E0A' }}
//                     min="1"
//                     required
//                   />
//                 </div>
//               </div>
//             </div>

//             {/* Submit Button */}
//             <div className="flex justify-end pt-4">
//               <button
//                 type="submit"
//                 disabled={loading}
//                 className="px-6 py-3 rounded-lg font-medium flex items-center gap-2 transition hover:opacity-90 disabled:opacity-50"
//                 style={{ backgroundColor: '#EA8E0A', color: '#FFFFFF' }}
//               >
//                 {loading ? (
//                   <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
//                 ) : (
//                   <>
//                     Continue to Add Questions
//                     <ArrowRight className="h-5 w-5" />
//                   </>
//                 )}
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </Layout>
//   );
// };

// export default CreateExam;


// pages/employee/CreateExam.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../../components/Layout";
import { createExam } from "../../services/examService";

const CreateExam = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    grade: "",
    subject: "",
    startTime: "",
    duration: 60,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await createExam(form);
      navigate(`/employee/add-questions/${res.data.exam._id}`);
    } catch (err) {
      alert(err.response?.data?.message);
    }
  };

  return (
    <Layout title="Create Exam">
      <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-xl shadow">
        <input placeholder="Title" onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <input placeholder="Grade" onChange={(e) => setForm({ ...form, grade: e.target.value })} />
        <input placeholder="Subject" onChange={(e) => setForm({ ...form, subject: e.target.value })} />
        <input type="datetime-local" onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
        <input type="number" placeholder="Duration (minutes)" onChange={(e) => setForm({ ...form, duration: e.target.value })} />
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Create Exam</button>
      </form>
    </Layout>
  );
};

export default CreateExam;