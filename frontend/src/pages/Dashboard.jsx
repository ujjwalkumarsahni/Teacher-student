// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  AcademicCapIcon,
  UserGroupIcon,
  DocumentCheckIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import api from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalExams: 0,
    completedExams: 0,
    upcomingExams: 0
  });
  const [loading, setLoading] = useState(true);
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      if (user.role === 'student') {
        const examsRes = await api.get('/exams/available');
        const resultsRes = await api.get('/results/my-results');
        
        setStats({
          availableExams: examsRes.data.count || 0,
          completedExams: resultsRes.data.results?.length || 0,
          averageScore: calculateAverage(resultsRes.data.results)
        });
      } else {
        const studentsRes = await api.get('/students');
        const examsRes = await api.get('/exams');
        
        setStats({
          totalStudents: studentsRes.data.total || 0,
          totalExams: examsRes.data.total || 0,
          activeExams: examsRes.data.active || 0
        });
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-800">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-[#0B234A] to-[#1a3a6e] rounded-xl p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">
          Welcome back, {user?.name}!
        </h2>
        <p className="text-gray-200">
          {user.role === 'student' 
            ? 'Ready for your next exam?'
            : 'Manage your exams and students efficiently.'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {user.role === 'student' ? (
          <>
            <StatCard
              title="Available Exams"
              value={stats.availableExams || 0}
              icon={AcademicCapIcon}
              color="bg-[#EA8E0A]"
            />
            <StatCard
              title="Completed"
              value={stats.completedExams || 0}
              icon={DocumentCheckIcon}
              color="bg-green-600"
            />
            <StatCard
              title="Average Score"
              value={`${stats.averageScore || 0}%`}
              icon={ClockIcon}
              color="bg-blue-600"
            />
          </>
        ) : (
          <>
            <StatCard
              title="Total Students"
              value={stats.totalStudents}
              icon={UserGroupIcon}
              color="bg-[#EA8E0A]"
            />
            <StatCard
              title="Total Exams"
              value={stats.totalExams}
              icon={AcademicCapIcon}
              color="bg-green-600"
            />
            <StatCard
              title="Active Exams"
              value={stats.activeExams}
              icon={ClockIcon}
              color="bg-blue-600"
            />
            <StatCard
              title="Completed"
              value="24"
              icon={DocumentCheckIcon}
              color="bg-[#E22213]"
            />
          </>
        )}
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Recent Activity
        </h3>
        <div className="space-y-4">
          {recentActivities.map((activity, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className={`w-2 h-2 rounded-full ${
                activity.type === 'exam' ? 'bg-[#EA8E0A]' : 'bg-[#0B234A]'
              }`} />
              <p className="text-sm text-gray-600">{activity.message}</p>
              <span className="text-xs text-gray-400 ml-auto">{activity.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;