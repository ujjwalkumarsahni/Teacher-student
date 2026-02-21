// pages/Login.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  BuildingOfficeIcon, 
  AcademicCapIcon,
  UserGroupIcon,
  ShieldCheckIcon 
} from '@heroicons/react/24/outline';
import Button from '../components/Common/Button';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDemo, setShowDemo] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const result = await login(email, password);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error || 'Invalid email or password');
    }
    
    setLoading(false);
  };

  const fillDemoCredentials = (role) => {
    switch(role) {
      case 'admin':
        setEmail('admin@test.com');
        setPassword('123456');
        break;
      case 'employee':
        setEmail('employee@test.com');
        setPassword('123456');
        break;
      case 'student':
        setEmail('student@test.com');
        setPassword('123456');
        break;
      default:
        break;
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Section - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0B234A] relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-[#EA8E0A] rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-[#E22213] rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-[#EA8E0A] rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col items-center justify-center w-full px-12 text-white">
          <div className="max-w-md">
            <div className="flex items-center space-x-3 mb-8">
              <div className="h-16 w-16 bg-[#EA8E0A] rounded-xl flex items-center justify-center">
                <BuildingOfficeIcon className="h-10 w-10 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">EduInvoice</h1>
                <p className="text-[#EA8E0A]">School Management System</p>
              </div>
            </div>

            <h2 className="text-3xl font-bold mb-6">
              Streamline Your School Management
            </h2>

            <div className="space-y-4 mb-8">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-6 w-6 bg-[#EA8E0A] rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                </div>
                <p className="text-gray-300">Student registration and management</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-6 w-6 bg-[#EA8E0A] rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                </div>
                <p className="text-gray-300">Online exam system with auto-grading</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-6 w-6 bg-[#EA8E0A] rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                </div>
                <p className="text-gray-300">Invoice and payment tracking</p>
              </div>
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="h-6 w-6 bg-[#EA8E0A] rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✓</span>
                  </div>
                </div>
                <p className="text-gray-300">Comprehensive reporting and analytics</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-[#EA8E0A]">500+</div>
                <div className="text-sm text-gray-400">Schools</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#EA8E0A]">50K+</div>
                <div className="text-sm text-gray-400">Students</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-[#EA8E0A]">98%</div>
                <div className="text-sm text-gray-400">Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Section - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-md w-full">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="h-16 w-16 bg-[#0B234A] rounded-xl flex items-center justify-center">
              <BuildingOfficeIcon className="h-10 w-10 text-[#EA8E0A]" />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
            <p className="text-gray-600 mb-8">Sign in to access your dashboard</p>

            {error && (
              <div className="mb-4 p-3 bg-[#E22213]/10 border border-[#E22213]/20 rounded-lg">
                <p className="text-[#E22213] text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EA8E0A] focus:border-transparent transition duration-200"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#EA8E0A] focus:border-transparent transition duration-200"
                  placeholder="Enter your password"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-[#EA8E0A] focus:ring-[#EA8E0A] border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Remember me
                  </label>
                </div>

                <a href="#" className="text-sm text-[#EA8E0A] hover:text-[#0B234A] transition">
                  Forgot password?
                </a>
              </div>

              <Button
                type="submit"
                variant="primary"
                loading={loading}
                className="w-full bg-[#0B234A] hover:bg-[#0B234A]/90 text-white py-3 rounded-lg font-medium transition duration-200"
              >
                Sign In
              </Button>
            </form>

            {/* Demo Credentials Toggle */}
            <div className="mt-6">
              <button
                onClick={() => setShowDemo(!showDemo)}
                className="text-sm text-[#EA8E0A] hover:text-[#0B234A] transition flex items-center justify-center w-full"
              >
                <span>Show Demo Credentials</span>
                <svg
                  className={`ml-1 h-4 w-4 transform transition-transform ${showDemo ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showDemo && (
                <div className="mt-4 space-y-2 animate-fadeIn">
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => fillDemoCredentials('admin')}
                      className="p-2 border border-[#0B234A]/20 rounded-lg hover:bg-[#0B234A] hover:text-white transition group"
                    >
                      <ShieldCheckIcon className="h-5 w-5 mx-auto mb-1 text-[#0B234A] group-hover:text-white" />
                      <span className="text-xs">Admin</span>
                    </button>
                    <button
                      onClick={() => fillDemoCredentials('employee')}
                      className="p-2 border border-[#EA8E0A]/20 rounded-lg hover:bg-[#EA8E0A] hover:text-white transition group"
                    >
                      <UserGroupIcon className="h-5 w-5 mx-auto mb-1 text-[#EA8E0A] group-hover:text-white" />
                      <span className="text-xs">Employee</span>
                    </button>
                    <button
                      onClick={() => fillDemoCredentials('student')}
                      className="p-2 border border-[#E22213]/20 rounded-lg hover:bg-[#E22213] hover:text-white transition group"
                    >
                      <AcademicCapIcon className="h-5 w-5 mx-auto mb-1 text-[#E22213] group-hover:text-white" />
                      <span className="text-xs">Student</span>
                    </button>
                  </div>
                  <p className="text-xs text-gray-500 text-center mt-2">
                    Click any role to auto-fill credentials
                  </p>
                </div>
              )}
            </div>
          </div>

          <p className="text-center text-sm text-gray-600 mt-8">
            © 2024 EduInvoice. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;