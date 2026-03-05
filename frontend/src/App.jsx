// // src/App.jsx
// import React from "react";
// import {
//   BrowserRouter as Router,
//   Routes,
//   Route,
//   Navigate,
// } from "react-router-dom";
// import { Toaster } from "react-hot-toast";

// import Login from "./pages/auth/Login";
// import EmployeeDashboard from "./pages/employee/Dashboard.jsx";
// import StudentCreationPage from "./pages/employee/StudentCreationPage.jsx";
// import ExamCreationPage from "./pages/employee/ExamCreationPage.jsx";
// import ExamsList from "./pages/employee/ExamsList.jsx";
// import ExamResultsVerification from "./pages/employee/ExamResultsVerification.jsx";

// // Student Pages
// import StudentDashboard from "./pages/student/StudentDashboard.jsx";
// import ExamPage from "./pages/student/ExamPage.jsx";
// import MyResults from "./pages/student/MyResults.jsx";

// import Layout from "./components/Layout.jsx";
// import ProtectedRoute from "./components/ProtectedRoute.jsx";

// function App() {
//   return (
//     <Router>
//       <Toaster 
//         position="top-right"
//         toastOptions={{
//           success: {
//             style: {
//               background: "#10b981",
//               color: "white",
//             },
//           },
//           error: {
//             style: {
//               background: "#E22213",
//               color: "white",
//             },
//           },
//         }}
//       />

//       <Routes>
//         {/* LOGIN */}
//         <Route path="/login" element={<Login />} />

//         {/* EMPLOYEE ROUTES */}
//         <Route
//           path="/employee"
//           element={
//             <ProtectedRoute role="employee">
//               <Layout />
//             </ProtectedRoute>
//           }
//         >
//           <Route index element={<EmployeeDashboard />} />
//           <Route path="create-exam" element={<ExamCreationPage />} />
//           <Route path="manage-students" element={<StudentCreationPage />} />
//           <Route path="exams" element={<ExamsList />} />
//           <Route path="exam-results/:examId" element={<ExamResultsVerification />} />
//         </Route>

//         {/* STUDENT ROUTES */}
//         <Route
//           path="/student"
//           element={
//             <ProtectedRoute role="student">
//               <Layout />
//             </ProtectedRoute>
//           }
//         >
//           <Route index element={<StudentDashboard />} />
//           <Route path="results" element={<MyResults />} />
//         </Route>
        
//         {/* Separate route for exam taking (no layout) */}
//         <Route
//           path="/student/exam/:examId"
//           element={
//             <ProtectedRoute role="student">
//               <ExamPage />
//             </ProtectedRoute>
//           }
//         />

//         {/* DEFAULT */}
//         <Route path="/" element={<Navigate to="/login" replace />} />
//         <Route path="*" element={<h1>404 - Page Not Found</h1>} />
//       </Routes>
//     </Router>
//   );
// }

// export default App;

// src/App.jsx (Updated with Admin Routes)
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Login from "./pages/auth/Login";

// Employee Pages
import EmployeeDashboard from "./pages/employee/Dashboard.jsx";
import StudentCreationPage from "./pages/employee/StudentCreationPage.jsx";
import ExamCreationPage from "./pages/employee/ExamCreationPage.jsx";
import ExamsList from "./pages/employee/ExamsList.jsx";
import ExamResultsVerification from "./pages/employee/ExamResultsVerification.jsx";

// Student Pages
import StudentDashboard from "./pages/student/StudentDashboard.jsx";
import ExamPage from "./pages/student/ExamPage.jsx";
import MyResults from "./pages/student/MyResults.jsx";

// Admin Pages
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import SchoolDetails from "./pages/admin/SchoolDetails.jsx";
import ExamDetailsAdmin from "./pages/admin/ExamDetailsAdmin.jsx";
import StudentDetailsAdmin from "./pages/admin/StudentDetailsAdmin.jsx";
import AllExamsAdmin from "./pages/admin/AllExamsAdmin.jsx";
import ResultsAdmin from "./pages/admin/ResultsAdmin.jsx";

import Layout from "./components/Layout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AllStudentAdmin from "./pages/admin/AllStudentAdmin.jsx";

function App() {
  return (
    <Router>
      <Toaster 
        position="top-right"
        toastOptions={{
          success: {
            style: {
              background: "#10b981",
              color: "white",
            },
          },
          error: {
            style: {
              background: "#E22213",
              color: "white",
            },
          },
        }}
      />

      <Routes>
        {/* LOGIN */}
        <Route path="/login" element={<Login />} />

        {/* EMPLOYEE ROUTES */}
        <Route
          path="/employee"
          element={
            <ProtectedRoute role="employee">
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<EmployeeDashboard />} />
          <Route path="create-exam" element={<ExamCreationPage />} />
          <Route path="manage-students" element={<StudentCreationPage />} />
          <Route path="exams" element={<ExamsList />} />
          <Route path="exam-results/:examId" element={<ExamResultsVerification />} />
        </Route>

        {/* STUDENT ROUTES */}
        <Route
          path="/student"
          element={
            <ProtectedRoute role="student">
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<StudentDashboard />} />
          <Route path="results" element={<MyResults />} />
        </Route>
        
        {/* ADMIN ROUTES */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="schools/:schoolId" element={<SchoolDetails />} />
          <Route path="exams/:examId" element={<ExamDetailsAdmin />} />
          <Route path="students/:studentId" element={<StudentDetailsAdmin />} />
          <Route path="all-exams" element={<AllExamsAdmin />} />
          <Route path="all-student" element={<AllStudentAdmin />} />
          <Route path="results" element={<ResultsAdmin />} />
        </Route>
        
        {/* Separate route for exam taking (no layout) */}
        <Route
          path="/student/exam/:examId"
          element={
            <ProtectedRoute role="student">
              <ExamPage />
            </ProtectedRoute>
          }
        />

        {/* DEFAULT */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="*" element={<h1>404 - Page Not Found</h1>} />
      </Routes>
    </Router>
  );
}

export default App;


