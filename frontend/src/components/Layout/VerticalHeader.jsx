// components/Layout/VerticalHeader.jsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  HomeIcon,
  UsersIcon,
  AcademicCapIcon,
  DocumentTextIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
  BuildingOfficeIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  BookOpenIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';

const VerticalHeader = () => {
  const { user, logout } = useAuth();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Students', href: '/students', icon: UsersIcon },
    { name: 'Employees', href: '/employees', icon: UserGroupIcon },
    { name: 'Exams', href: '/exams', icon: AcademicCapIcon },
    { name: 'Questions', href: '/questions', icon: ClipboardDocumentListIcon },
    { name: 'Invoices', href: '/invoices', icon: DocumentTextIcon },
    { name: 'Payments', href: '/payments', icon: CurrencyDollarIcon },
    { name: 'Reports', href: '/reports', icon: ChartBarIcon },
    { name: 'Calendar', href: '/calendar', icon: CalendarIcon },
    { name: 'Settings', href: '/settings', icon: Cog6ToothIcon },
  ];

  const employeeNavigation = [
    { name: 'My Classes', href: '/employee/classes', icon: BookOpenIcon },
    { name: 'My Students', href: '/employee/students', icon: UsersIcon },
    { name: 'Create Exam', href: '/employee/exams/create', icon: ClipboardDocumentListIcon },
  ];

  const studentNavigation = [
    { name: 'My Exams', href: '/student/exams', icon: AcademicCapIcon },
    { name: 'Results', href: '/student/results', icon: ChartBarIcon },
  ];

  const getNavigation = () => {
    if (!user) return [];
    
    switch(user.role) {
      case 'admin':
      case 'superadmin':
        return navigation;
      case 'employee':
        return [...navigation.filter(item => 
          ['Dashboard', 'Students', 'Exams', 'Questions', 'Reports'].includes(item.name)
        ), ...employeeNavigation];
      case 'student':
        return studentNavigation;
      default:
        return [];
    }
  };

  return (
    <div className="fixed inset-y-0 left-0 w-64 bg-[#0B234A] shadow-xl flex flex-col z-30">
      {/* Logo Section */}
      <div className="flex items-center justify-center h-20 border-b border-[#EA8E0A]/20">
        <div className="flex items-center space-x-2">
          <div className="h-10 w-10 bg-[#EA8E0A] rounded-lg flex items-center justify-center">
            <BuildingOfficeIcon className="h-6 w-6 text-white" />
          </div>
          <span className="text-white font-bold text-xl">EduInvoice</span>
        </div>
      </div>

      {/* User Info */}
      {user && (
        <div className="p-4 border-b border-[#EA8E0A]/20">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 bg-[#E22213] rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">
                {user.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white font-medium truncate">{user.name}</p>
              <p className="text-[#EA8E0A] text-sm capitalize">{user.role}</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="px-3 space-y-1">
          {getNavigation().map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors duration-200 ${
                  isActive
                    ? 'bg-[#EA8E0A] text-white'
                    : 'text-gray-300 hover:bg-[#EA8E0A]/10 hover:text-white'
                }`
              }
            >
              <item.icon className="h-5 w-5 mr-3" />
              {item.name}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Logout Button */}
      <div className="p-4 border-t border-[#EA8E0A]/20">
        <button
          onClick={logout}
          className="flex items-center w-full px-3 py-2.5 text-sm font-medium text-gray-300 rounded-lg hover:bg-[#E22213] hover:text-white transition-colors duration-200"
        >
          <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-3" />
          Logout
        </button>
      </div>

      {/* Footer */}
      <div className="p-4 text-center">
        <p className="text-xs text-gray-400">
          © 2024 EduInvoice
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Version 1.0.0
        </p>
      </div>
    </div>
  );
};

export default VerticalHeader;