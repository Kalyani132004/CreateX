import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Sidebar, MobileSidebar } from '../components/Sidebar/Sidebar';
import Navbar from '../components/Navbar/Navbar';
import { useAuth } from '../context/AuthContext';

/**
 * Shared shell for every authenticated page (student + faculty).
 * Handles the responsive breakpoint behavior from the brief:
 * desktop -> persistent sidebar; mobile -> offcanvas drawer.
 */
export default function DashboardLayout({ role }) {
  const { user, loading, logout } = useAuth();

  if (loading) return null; // could render a full-page skeleton here
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) return <Navigate to={`/${user.role}/dashboard`} replace />;

  return (
    <div className="cx-app">
      <Sidebar role={role} user={user} />
      <MobileSidebar role={role} />
      <div className="cx-main">
        <Navbar role={role} user={user} onLogout={logout} />
        <main className="cx-page cx-container py-4 py-lg-5">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
