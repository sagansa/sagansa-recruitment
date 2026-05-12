import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import VerifyEmailConfirm from './pages/VerifyEmailConfirm';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || '{}'));

  useEffect(() => {
    const handleStorageChange = () => {
      const token = localStorage.getItem('token');
      setIsAuthenticated(!!token);
      if (token) {
        setUser(JSON.parse(localStorage.getItem('user') || '{}'));
      }
    };
    window.addEventListener('storage', handleStorageChange);

    // Refresh user data if authenticated
    if (isAuthenticated) {
        import('./services/api').then(({ default: api }) => {
            api.get('/auth/user').then(res => {
                const updatedUser = res.data.user;
                setUser(updatedUser);
                localStorage.setItem('user', JSON.stringify(updatedUser));
            }).catch(() => {
                // If token invalid, logout
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                setIsAuthenticated(false);
            });
        });
    }

    return () => window.removeEventListener('storage', handleStorageChange);
  }, [isAuthenticated]);

  // Protected route wrapper that checks for verification
  const ProtectedRoute = ({ children }) => {
    if (!isAuthenticated) return <Navigate to="/login" />;
    if (!user?.email_verified_at) return <Navigate to="/verify-email" />;
    return children;
  };

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={!isAuthenticated ? <Login setAuth={setIsAuthenticated} /> : <Navigate to="/dashboard" />} 
        />
        <Route 
          path="/register" 
          element={!isAuthenticated ? <Register setAuth={setIsAuthenticated} /> : <Navigate to="/dashboard" />} 
        />
        <Route 
          path="/forgot-password" 
          element={<ForgotPassword />} 
        />
        <Route 
          path="/reset-password" 
          element={<ResetPassword />} 
        />
        <Route 
          path="/verify-email" 
          element={isAuthenticated ? <VerifyEmail setAuth={setIsAuthenticated} /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/verify-email/confirm" 
          element={<VerifyEmailConfirm />} 
        />
        <Route 
          path="/dashboard" 
          element={<ProtectedRoute><Dashboard setAuth={setIsAuthenticated} /></ProtectedRoute>} 
        />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </Router>
  );
}

export default App;
