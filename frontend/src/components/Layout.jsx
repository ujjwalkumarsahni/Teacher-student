// // src/components/Layout.jsx
// import React from "react";
// import { useNavigate, useLocation, Outlet } from "react-router-dom";
// import { LogOut, Menu, X, BookOpen, Layout as LayoutIcon, Users } from "lucide-react";
// import { logoutUser } from "../services/authService";
// import { useAuth } from "../hooks/useAuth";

// const Layout = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { user } = useAuth();
//   const [sidebarOpen, setSidebarOpen] = React.useState(false);

//   const handleLogout = () => {
//     logoutUser();
//     navigate("/login");
//   };

//   const getMenuItems = () => {
//     if (user?.role === "employee") {
//       return [
//         { name: "Dashboard", path: "/employee", icon: LayoutIcon },
//         { name: "Create Exam", path: "/employee/create-exam", icon: BookOpen },
//         { name: "Manage Students", path: "/employee/manage-students", icon: Users },
//         { name: "Students Result", path: "/employee/students-result", icon: LayoutIcon },
//       ];
//     } else if (user?.role === "student") {
//       return [
//         { name: "My Exams", path: "/student", icon: BookOpen },
//       ];
//     }
//     return [];
//   };

//   const menuItems = getMenuItems();

//   return (
//     <div className="min-h-screen flex bg-gray-100">
//       {/* Sidebar */}
//       <div
//         className={`
//           fixed inset-y-0 left-0 transform
//           ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
//           lg:relative lg:translate-x-0
//           transition duration-200 ease-in-out
//           w-64 z-30
//         `}
//         style={{ backgroundColor: "#0B234A" }}
//       >
//         <div className="flex items-center justify-between p-4 border-b border-orange-500">
//           <h1 className="text-xl font-bold text-orange-400">
//             {user?.role === "employee" ? "ExamSystem" : "Student Portal"}
//           </h1>

//           <button
//             onClick={() => setSidebarOpen(false)}
//             className="lg:hidden text-orange-400"
//           >
//             <X size={22} />
//           </button>
//         </div>

//         <nav className="mt-6">
//           {menuItems.map((item) => {
//             const isActive = location.pathname === item.path;
//             const Icon = item.icon;

//             return (
//               <button
//                 key={item.name}
//                 onClick={() => {
//                   navigate(item.path);
//                   setSidebarOpen(false);
//                 }}
//                 className={`w-full text-left px-4 py-3 transition flex items-center gap-3 ${
//                   isActive
//                     ? "bg-orange-500 text-white"
//                     : "text-white hover:bg-white/10"
//                 }`}
//               >
//                 <Icon size={18} />
//                 {item.name}
//               </button>
//             );
//           })}
//         </nav>

//         {/* User info */}
//         <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-orange-500/30">
//           <p className="text-sm text-gray-300">Logged in as</p>
//           <p className="text-white font-medium truncate">{user?.name || user?.email}</p>
//           <p className="text-xs text-orange-300 capitalize">{user?.role}</p>
//         </div>
//       </div>

//       {/* Main Content */}
//       <div className="flex-1 flex flex-col">
//         {/* Header */}
//         <header className="bg-white shadow-sm p-4 flex justify-between items-center">
//           <button
//             onClick={() => setSidebarOpen(true)}
//             className="lg:hidden text-[#0B234A]"
//           >
//             <Menu size={22} />
//           </button>

//           <div className="flex-1"></div>

//           <button
//             onClick={handleLogout}
//             className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white hover:opacity-90 transition"
//           >
//             <LogOut size={16} />
//             Logout
//           </button>
//         </header>

//         {/* Page Content */}
//         <main className="p-6 flex-1 overflow-auto">
//           <Outlet />
//         </main>
//       </div>

//       {/* Overlay */}
//       {sidebarOpen && (
//         <div
//           className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 lg:hidden"
//           onClick={() => setSidebarOpen(false)}
//         />
//       )}
//     </div>
//   );
// };

// export default Layout;


// src/components/Layout.jsx
import React from "react";
import { useNavigate, useLocation, Outlet } from "react-router-dom";
import { 
  LogOut, 
  Menu, 
  X, 
  BookOpen, 
  Layout as LayoutIcon, 
  Users,
  Award,
  FileText,
  BarChart3,
  School 
} from "lucide-react";
import { logoutUser } from "../services/authService";
import { useAuth } from "../hooks/useAuth";

const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  // Update the getMenuItems function in Layout.jsx
const getMenuItems = () => {
  if (user?.role === "employee") {
    return [
      { name: "Dashboard", path: "/employee", icon: LayoutIcon },
      { name: "Create Exam", path: "/employee/create-exam", icon: BookOpen },
      { name: "Manage Students", path: "/employee/manage-students", icon: Users },
      { name: "All Exams", path: "/employee/exams", icon: FileText },
    ];
  } else if (user?.role === "student") {
    return [
      { name: "My Exams", path: "/student", icon: BookOpen },
      { name: "My Results", path: "/student/results", icon: Award },
    ];
  } else if (user?.role === "admin") {
    return [
      { name: "Dashboard", path: "/admin", icon: LayoutIcon },
      { name: "All Exams", path: "/admin/all-exams", icon: FileText },
      { name: "All Student", path: "/admin/all-student", icon: FileText },
      { name: "Results", path: "/admin/results", icon: Award },
      { name: "Schools", path: "/admin/schools", icon: School },
      { name: "Analytics", path: "/admin/analytics", icon: BarChart3 },
    ];
  }
  return [];
};

  const menuItems = getMenuItems();

  // Check if current path matches menu item (including nested routes)
  const isActivePath = (itemPath) => {
    const currentPath = location.pathname;
    
    // Exact match
    if (currentPath === itemPath) {
      return true;
    }
    
    // For dashboard, only exact match
    if (itemPath === "/employee") {
      return currentPath === "/employee";
    }
    
    if (itemPath === "/student") {
      return currentPath === "/student";
    }
    
    // For All Exams - match /employee/exams only, not /employee/exam-results
    if (itemPath === "/employee/exams") {
      return currentPath === "/employee/exams" || 
             (currentPath.startsWith("/employee/exams/") && !currentPath.includes("/exam-results/"));
    }
    
    // For Results - match /employee/exam-results and /employee/exam-results/*
    if (itemPath === "/employee/exam-results") {
      return currentPath === "/employee/exam-results" || 
             currentPath.startsWith("/employee/exam-results/");
    }
    
    // For other items, check if current path starts with item path
    return currentPath.startsWith(itemPath + "/");
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <div
        className={`
          fixed inset-y-0 left-0 transform
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
          lg:relative lg:translate-x-0
          transition duration-200 ease-in-out
          w-64 z-30
        `}
        style={{ backgroundColor: "#0B234A" }}
      >
        {/* Logo Area */}
        <div className="flex items-center justify-between p-4 border-b border-orange-500">
          <div className="flex items-center gap-2">
            <Award className="h-6 w-6 text-orange-400" />
            <h1 className="text-xl font-bold text-orange-400">
              {user?.role === "employee" ? "ExamSystem" : "Student Portal"}
            </h1>
          </div>

          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-orange-400 hover:text-orange-300"
          >
            <X size={22} />
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="mt-6 space-y-1 px-2">
          {menuItems.map((item) => {
            const isActive = isActivePath(item.path);
            const Icon = item.icon;

            return (
              <button
                key={item.name}
                onClick={() => {
                  navigate(item.path);
                  setSidebarOpen(false);
                }}
                className={`
                  w-full text-left px-4 py-3 rounded-lg transition-all duration-200 
                  flex items-center gap-3 group relative
                  ${isActive
                    ? "bg-orange-500 text-white shadow-lg"
                    : "text-gray-300 hover:bg-white/10 hover:text-white"
                  }
                `}
              >
                <Icon size={18} className={isActive ? "text-white" : "text-gray-400 group-hover:text-white"} />
                <span className="flex-1">{item.name}</span>
                
                {/* Active Indicator */}
                {isActive && (
                  <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-white"></div>
                )}
              </button>
            );
          })}
        </nav>

        {/* User Info Section */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-orange-500/30 bg-[#0B234A]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-lg">
              {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{user?.name || "User"}</p>
              <p className="text-xs text-orange-300 capitalize flex items-center gap-1">
                <span className={`w-2 h-2 rounded-full ${user?.role === "employee" ? "bg-green-400" : "bg-blue-400"}`}></span>
                {user?.role}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm px-4 py-3 flex justify-between items-center sticky top-0 z-20">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-[#0B234A]"
            >
              <Menu size={22} />
            </button>
            
            {/* Breadcrumb */}
            <div className="hidden md:flex items-center gap-2 text-sm">
              <span className="text-gray-500">{user?.role === "employee" ? "Employee" : "Student"}</span>
              <span className="text-gray-400">/</span>
              <span className="text-[#0B234A] font-medium capitalize">
                {location.pathname.split('/').pop() || 'Dashboard'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors"
            >
              <LogOut size={16} />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6 flex-1 overflow-auto bg-gray-50">
          <Outlet />
        </main>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Layout;