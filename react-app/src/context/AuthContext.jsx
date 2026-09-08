import React, { createContext, useContext, useEffect, useState } from 'react';

import { authService } from '../services/authService';

// Create authentication context
const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  // Store the logged-in user
  const [user, setUser] = useState(null);

  // Show loading while checking login
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('cx_token');

    // No token means user is not logged in
    if (!token) {
      setLoading(false);
      return;
    }

    // Get current user details. If the access token has expired, the
    // api.js interceptor will transparently redeem the refresh token
    // and retry this call before we ever see a rejection here.
    authService
      .me()
      .then((res) => setUser(res.data))
      .catch(() => {
        localStorage.removeItem('cx_token');
        localStorage.removeItem('cx_refresh_token');
      })
      .finally(() => setLoading(false));
  }, []);

  // Student login
  async function loginStudent(uid, password) {
    const res = await authService.studentLogin(uid, password);

    localStorage.setItem('cx_token', res.data.access_token);
    localStorage.setItem('cx_refresh_token', res.data.refresh_token);

    setUser({
      ...res.data.student,
      role: 'student',
    });
  }

  // Faculty login
  async function loginFaculty(staffId, password) {
    const res = await authService.facultyLogin(staffId, password);

    // Save faculty tokens
    localStorage.setItem('cx_token', res.data.access_token ?? res.data.token);
    if (res.data.refresh_token) {
      localStorage.setItem('cx_refresh_token', res.data.refresh_token);
    }

    // Set logged-in faculty
    setUser({
      ...(res.data.user ?? res.data.faculty),
      role: 'faculty',
    });
  }

  // Logout the current user
  function logout() {
    localStorage.removeItem('cx_token');
    localStorage.removeItem('cx_refresh_token');
    setUser(null);
  }

  return (
    <AuthCtx.Provider
      value={{
        user,
        loading,
        loginStudent,
        loginFaculty,
        logout,
      }}
    >
      {children}
    </AuthCtx.Provider>
  );
}

// Custom hook to use authentication
export function useAuth() {
  const ctx = useContext(AuthCtx);

  // Make sure hook is used inside AuthProvider
  if (!ctx) {
    throw new Error('useAuth must be used within <AuthProvider>');
  }

  return ctx;
}
