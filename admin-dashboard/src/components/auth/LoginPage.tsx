'use client';

import { useState, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { loginUser, clearError } from '@/store/slices/authSlice';

interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export function LoginPage() {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false
  });
  const [showPassword, setShowPassword] = useState(false);

  // Clear error when component mounts or when user starts typing
  useEffect(() => {
    if (error) {
      dispatch(clearError());
    }
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error when user starts typing
    if (error) dispatch(clearError());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(loginUser(formData));
  };

  // Force light mode for login page
  useEffect(() => {
    // Create a style element
    const style = document.createElement('style');
    style.textContent = `
      /* Force light mode */
      html, body {
        background-color: white !important;
        color-scheme: light !important;
      }
      
      /* Force text colors */
      .text-gray-400 {
        color: #9ca3af !important;
      }
      
      .text-gray-600 {
        color: #4b5563 !important;
      }
      
      .text-gray-700 {
        color: #374151 !important;
      }
      
      .text-red-700 {
        color: #b91c1c !important;
      }
      
      .text-indigo-600 {
        color: #4f46e5 !important;
      }
      
      /* Fix input text color */
      input[type="email"], 
      input[type="password"],
      input[type="text"] {
        color: #333333 !important;
        -webkit-text-fill-color: #333333 !important;
        background-color: white !important;
      }
    `;
    document.head.appendChild(style);
    
    // Direct DOM manipulation to fix input colors
    const fixInputColors = () => {
      const inputs = document.querySelectorAll('input');
      inputs.forEach(input => {
        if (input.type === 'email' || input.type === 'password' || input.type === 'text') {
          input.style.color = '#333333';
          input.style.backgroundColor = 'white';
          // @ts-ignore
          input.style.webkitTextFillColor = '#333333';
        }
      });
    };
    
    // Run immediately
    fixInputColors();
    
    // Also run after a short delay to ensure it applies after any other scripts
    setTimeout(fixInputColors, 100);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-indigo-600 text-white p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <i className="fas fa-gavel text-2xl text-white"></i>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">AuctionPro Admin</h1>
          <p className="text-gray-600">Sign in to access the admin dashboard</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6 login-form">
            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
                <div className="flex items-center">
                  <i className="fas fa-exclamation-circle mr-2 text-red-700"></i>
                  {error}
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="login-input w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="admin@example.com"
                  style={{color: '#333333', backgroundColor: 'white', WebkitTextFillColor: '#333333'}}
                />
                <i className="fas fa-envelope absolute left-4 top-4 text-gray-400" style={{color: '#9ca3af'}}></i>
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="login-input w-full px-4 py-3 pl-12 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
                  placeholder="Enter your password"
                  style={{color: '#333333', backgroundColor: 'white', WebkitTextFillColor: '#333333'}}
                />
                <i className="fas fa-lock absolute left-4 top-4 text-gray-400" style={{color: '#9ca3af'}}></i>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
                  style={{color: '#9ca3af'}}
                >
                  <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`} style={{color: '#9ca3af'}}></i>
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">Remember me</span>
              </label>
              <button
                type="button"
                className="text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
                style={{color: '#4f46e5'}}
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Signing in...
                </div>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          {/* Demo Credentials */}
          {/* <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Demo Credentials:</h4>
            <p className="text-xs text-gray-600" style={{color: '#4b5563'}}>Email: admin@auction.com</p>
            <p className="text-xs text-gray-600" style={{color: '#4b5563'}}>Password: admin123</p>
          </div> */}
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500" style={{color: '#6b7280'}}>
            Secure admin access to AuctionPro platform
          </p>
        </div>
      </div>
    </div>
  );
} 