// src/components/Layout/MainLayout.jsx
import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  HomeIcon,
  UserGroupIcon,
  AcademicCapIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  ArrowLeftOnRectangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  UsersIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';

const MainLayout = ({ children }) => {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    {
      path: '/dashboard',
      name: 'Dashboard',
      icon: HomeIcon,
      roles: ['admin', 'employee', 'student']
    },
    {
      path: '/students',
      name: 'Students',
      icon: UserGroupIcon,
      roles: ['admin', 'employee']
    },
    {
      path: '/exams',
      name: 'Exams',
      icon: AcademicCapIcon,
      roles: ['admin', 'employee']
    },
    {
      path: '/available-exams',
      name: 'Available Exams',
      icon: BookOpenIcon,
      roles: ['student']
    },
    {
      path: '/results',
      name: 'Results',
      icon: ChartBarIcon,
      roles: ['admin', 'employee', 'student']
    },
    {
      path: '/employees',
      name: 'Employees',
      icon: UsersIcon,
      roles: ['admin']
    },
    {
      path: '/reports',
      name: 'Reports',
      icon: DocumentTextIcon,
      roles: ['admin', 'employee']
    }
  ];

  const filteredMenu = menuItems.filter(item => 
    item.roles.includes(user?.role)
  );

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div 
        className={`bg-[#0B234A] text-white transition-all duration-300 flex flex-col ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Logo */}
        <div className="p-4 flex items-center justify-between border-b border-[#EA8E0A]/20">
          <div className="flex items-center space-x-2">
            <div className="bg-[#EA8E0A] p-2 rounded-lg">
              <BuildingOfficeIcon className="h-6 w-6 text-[#0B234A]" />
            </div>
            {!collapsed && (
              <span className="font-bold text-lg">EduExam Pro</span>
            )}
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1 rounded-lg hover:bg-[#EA8E0A] hover:text-[#0B234A] transition-colors"
          >
            {collapsed ? (
              <ChevronRightIcon className="h-5 w-5" />
            ) : (
              <ChevronLeftIcon className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* User Info */}
        <div className="p-4 border-b border-[#EA8E0A]/20">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-[#EA8E0A] flex items-center justify-center">
              <span className="text-[#0B234A] font-bold text-lg">
                {user?.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            {!collapsed && (
              <div>
                <p className="font-medium">{user?.name}</p>
                <p className="text-xs text-gray-300 capitalize">{user?.role}</p>
              </div>
            )}
          </div>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 p-4 space-y-1">
          {filteredMenu.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-2 p-3 rounded-lg transition-colors ${
                  isActive 
                    ? 'bg-[#EA8E0A] text-[#0B234A]' 
                    : 'hover:bg-[#EA8E0A]/20'
                }`}
              >
                <Icon className="h-5 w-5" />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-[#EA8E0A]/20">
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 p-3 rounded-lg hover:bg-[#E22213] transition-colors w-full"
          >
            <ArrowLeftOnRectangleIcon className="h-5 w-5" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-800">
              {menuItems.find(item => item.path === location.pathname)?.name || 'Dashboard'}
            </h1>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default MainLayout;