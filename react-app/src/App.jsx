import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register'; // build from Login.jsx pattern + the registration
// stepper markup in /proto/app.js (renderRegister) — same field set, same validation rules.

import DashboardLayout from './layouts/DashboardLayout';

// Student pages
import StudentDashboard from './pages/student/StudentDashboard';
import MyProjects from './pages/student/MyProjects';
import AddProject from './pages/student/AddProject';
import SearchProjects from './pages/student/SearchProjects';
import Wishlist from './pages/student/Wishlist';
import InnovationAssistant from './pages/student/InnovationAssistant';
import FacultyFeedbackList from './pages/student/FacultyFeedbackList';
import StudentProfile from './pages/student/StudentProfile';

// Faculty pages
import FacultyDashboard from './pages/faculty/FacultyDashboard';
import FacultyProjects from './pages/faculty/FacultyProjects';
import FacultyStudents from './pages/faculty/FacultyStudents';
import FacultyProfile from './pages/faculty/FacultyProfile';

// Shared
import ProjectDetails from './pages/shared/ProjectDetails';

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            <Route path="/student" element={<DashboardLayout role="student" />}>
              <Route path="dashboard" element={<StudentDashboard />} />
              <Route path="projects/:id" element={<MyProjects />} />
              <Route path="projects/add" element={<AddProject />} />
              <Route path="search" element={<SearchProjects />} />
              <Route path="wishlist" element={<Wishlist />} />
              <Route path="assistant" element={<InnovationAssistant />} />
              <Route  te path="feedback" element={<FacultyFeedbackList />} />
              <Route path="profile" element={<StudentProfile />} />
            </Route>

            <Route path="/faculty" element={<DashboardLayout role="faculty" />}>
              <Route path="dashboard" element={<FacultyDashboard />} />
              <Route path="projects" element={<FacultyProjects />} />
              <Route path="search" element={<SearchProjects />} />
              <Route path="students" element={<FacultyStudents />} />
              <Route path="profile" element={<FacultyProfile />} />
            </Route>

            {/* <Route path="/project/:id" element={<ProjectDetailsLayout />}> shared, role-aware page */}
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
