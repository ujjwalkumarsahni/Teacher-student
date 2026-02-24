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
// import EmployeeDashboard from "./pages/employee/Dashboard";
// import StudentCreationPage from "./pages/employee/StudentCreationPage";
// import ExamCreationPage from "./pages/employee/ExamCreationPage";

// // Student Pages
// import StudentDashboard from "./pages/student/Dashboard";
// import ExamPage from "./pages/student/ExamPage";

// import Layout from "./components/Layout";
// import ProtectedRoute from "./components/ProtectedRoute";
// import ExamResultsVerification from "./pages/employee/ExamResultsVerification";

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
//           <Route path="students-result" element={<ExamResultsVerification />} />
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

// src/App.jsx
import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";

import Login from "./pages/auth/Login";
import EmployeeDashboard from "./pages/employee/Dashboard.jsx";
import StudentCreationPage from "./pages/employee/StudentCreationPage.jsx";
import ExamCreationPage from "./pages/employee/ExamCreationPage.jsx";
import ExamsList from "./pages/employee/ExamsList.jsx";
import ExamResultsVerification from "./pages/employee/ExamResultsVerification.jsx";

// Student Pages
import StudentDashboard from "./pages/student/StudentDashboard.jsx";
import ExamPage from "./pages/student/ExamPage.jsx";
import MyResults from "./pages/student/MyResults.jsx";

import Layout from "./components/Layout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";

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