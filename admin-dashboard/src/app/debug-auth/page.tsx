'use client';

import { useState } from 'react';

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api`;

export default function DebugAuthPage() {
  const [result, setResult] = useState<string>('');
  const [email, setEmail] = useState('admin@example.com');
  const [password, setPassword] = useState('password123');

  const showResult = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setResult(`[${timestamp}] ${message}`);
  };

  const showCurrentState = () => {
    const state = {
      localStorage: {
        authToken: localStorage.getItem('authToken') ? 'EXISTS' : 'MISSING',
        authTokenLength: localStorage.getItem('authToken')?.length || 0,
        refreshToken: localStorage.getItem('refreshToken') ? 'EXISTS' : 'MISSING',
        refreshTokenLength: localStorage.getItem('refreshToken')?.length || 0,
        user: localStorage.getItem('user') ? 'EXISTS' : 'MISSING'
      },
      cookies: {
        all: document.cookie || 'NO COOKIES',
        hasRefreshToken: document.cookie.includes('refreshToken='),
        hasToken: document.cookie.includes('token=')
      },
      apiUrl: API_BASE_URL,
      domain: window.location.host,
      currentTime: new Date().toISOString()
    };
    
    setResult(JSON.stringify(state, null, 2));
  };

  const testLogin = async () => {
    try {
      showResult('Testing admin login...', 'info');
      
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email,
          password
        })
      });

      const data = await response.json();
      console.log('🔑 Admin Login response:', data);

      if (data.success && data.data.token) {
        localStorage.setItem('authToken', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        
        if (data.data.refreshToken) {
          localStorage.setItem('refreshToken', data.data.refreshToken);
          console.log('💾 Admin: Refresh token stored');
        }
        
        showResult(`Login successful! Role: ${data.data.user.role}`, 'success');
      } else {
        showResult(`Login failed: ${data.message}`, 'error');
      }
      
    } catch (error: any) {
      console.error('❌ Admin Login error:', error);
      showResult(`Login error: ${error.message}`, 'error');
    }
  };

  const testRefresh = async () => {
    try {
      showResult('Testing token refresh...', 'info');
      
      const storedRefreshToken = localStorage.getItem('refreshToken');
      const requestBody = storedRefreshToken ? { refreshToken: storedRefreshToken } : {};
      
      console.log('🔄 Admin: Refresh token request:', { hasStoredToken: !!storedRefreshToken });
      
      const response = await fetch(`${API_BASE_URL}/auth/refresh-token`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      console.log('🔄 Admin Refresh response:', data);

      if (data.success && data.data.token) {
        localStorage.setItem('authToken', data.data.token);
        
        if (data.data.refreshToken) {
          localStorage.setItem('refreshToken', data.data.refreshToken);
        }
        
        showResult('Token refresh successful!', 'success');
      } else {
        showResult(`Token refresh failed: ${data.message}`, 'error');
      }
      
    } catch (error: any) {
      console.error('❌ Admin Refresh error:', error);
      showResult(`Refresh error: ${error.message}`, 'error');
    }
  };

  const testProfile = async () => {
    try {
      showResult('Testing profile request (should auto-refresh if needed)...', 'info');
      
      const authToken = localStorage.getItem('authToken');
      
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(authToken && { Authorization: `Bearer ${authToken}` })
        }
      });

      const data = await response.json();
      console.log('👤 Admin Profile response:', data);

      if (data.success) {
        showResult(`Profile successful! User: ${data.data.user.firstName} (${data.data.user.role})`, 'success');
      } else {
        showResult(`Profile failed: ${data.message}`, 'error');
      }
      
    } catch (error: any) {
      console.error('❌ Admin Profile error:', error);
      showResult(`Profile error: ${error.message}`, 'error');
    }
  };

  const clearTokens = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    showResult('All tokens cleared', 'info');
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">🔧 Admin Dashboard Auth Debug</h1>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-blue-800">
          <strong>Purpose:</strong> Test admin dashboard authentication with token refresh support
        </p>
      </div>

      <div className="grid gap-6">
        {/* Login Test */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">1. Login Test</h2>
          <div className="flex gap-4 mb-4">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="border rounded px-3 py-2 flex-1"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border rounded px-3 py-2 flex-1"
            />
            <button
              onClick={testLogin}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Login
            </button>
          </div>
        </div>

        {/* Token Tests */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">2. Token Tests</h2>
          <div className="flex gap-4">
            <button
              onClick={testRefresh}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Test Refresh
            </button>
            <button
              onClick={testProfile}
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
            >
              Test Profile (Auto-Refresh)
            </button>
            <button
              onClick={clearTokens}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Clear Tokens
            </button>
          </div>
        </div>

        {/* Current State */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">3. Current State</h2>
          <button
            onClick={showCurrentState}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 mb-4"
          >
            Show Current State
          </button>
        </div>

        {/* Results */}
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">4. Results</h2>
          <pre className="bg-gray-100 p-4 rounded border text-sm overflow-x-auto whitespace-pre-wrap">
            {result || 'Click "Show Current State" to see token status'}
          </pre>
        </div>
      </div>
    </div>
  );
}