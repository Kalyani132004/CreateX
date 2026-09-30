// import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
// import { AuthProvider } from './context/AuthContext';
// import { ToastProvider } from './context/ToastContext';

// import Login from './pages/auth/Login';
// import Register from './pages/auth/Register'; // build from Login.jsx pattern + the registration
// // stepper markup in /proto/app.js (renderRegister) — same field set, same validation rules.

// import DashboardLayout from './layouts/DashboardLayout';

// // Student pages
// import AddProject from './pages/student/AddProject';
// import FacultyFeedbackList from './pages/student/FacultyFeedbackList';
// import InnovationAssistant from './pages/student/InnovationAssistant';
// import MyProjects from './pages/student/MyProjects';
// import SearchProjects from './pages/student/SearchProjects';
// import StudentDashboard from './pages/student/StudentDashboard';
// import StudentProfile from './pages/student/StudentProfile';
// import Wishlist from './pages/student/Wishlist';

// // Faculty pages
// import FacultyDashboard from './pages/faculty/FacultyDashboard';
// import FacultyProfile from './pages/faculty/FacultyProfile';
// import FacultyProjects from './pages/faculty/FacultyProjects';
// import FacultyStudents from './pages/faculty/FacultyStudents';

// // Shared
// import ProjectDetails from './pages/shared/ProjectDetails';
// import ProjectDetailsEdit from './pages/student/ProjectDetailsEdit';

// export default function App() {
//   return (
//     <AuthProvider>
//       <ToastProvider>
//         <BrowserRouter>
//           <Routes>
//             <Route path="/" element={<Navigate to="/login" replace />} />
//             <Route path="/login" element={<Login />} />
//             <Route path="/register" element={<Register />} />

//             <Route path="/student" element={<DashboardLayout role="student" />}>
//               <Route path="dashboard" element={<StudentDashboard />} />
//               <Route path="projects/:id" element={<MyProjects />} />
//               <Route path="projects/view/:id" element={<ProjectDetails />} />
//               <Route path="projects/edit/:id" element={<ProjectDetailsEdit />} />
//               <Route path="projects/add" element={<AddProject />} />
//               <Route path="search" element={<SearchProjects />} />
//               <Route path="wishlist" element={<Wishlist />} />
//               <Route path="assistant" element={<InnovationAssistant />} />
//               <Route path="feedback" element={<FacultyFeedbackList />} />
//               <Route path="profile" element={<StudentProfile />} />
//             </Route>

//             <Route path="/faculty" element={<DashboardLayout role="faculty" />}>
//               <Route path="dashboard" element={<FacultyDashboard />} />
//               <Route path="projects" element={<FacultyProjects />} />
//               <Route path="search" element={<SearchProjects />} />
//               <Route path="students" element={<FacultyStudents />} />
//               <Route path="profile" element={<FacultyProfile />} />
//             </Route>

//             {/* <Route path="/project/:id" element={<ProjectDetailsLayout />}> shared, role-aware page */}
//           </Routes>
//         </BrowserRouter>
//       </ToastProvider>
//     </AuthProvider>
//   );
// }
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';

import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

import DashboardLayout from './layouts/DashboardLayout';

// ==================== Student Pages ====================
import AddProject from './pages/student/AddProject';
import FacultyFeedbackList from './pages/student/FacultyFeedbackList';
import InnovationAssistant from './pages/student/InnovationAssistant';
import MyProjects from './pages/student/MyProjects';
import ProjectDetailsEdit from './pages/student/ProjectDetailsEdit';
import SearchProjects from './pages/student/SearchProjects';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentProfile from './pages/student/StudentProfile';
import Wishlist from './pages/student/Wishlist';

// ==================== Faculty Pages ====================
import FacultyDashboard from './pages/faculty/FacultyDashboard';
import FacultyProfile from './pages/faculty/FacultyProfile';
import FacultyProjects from './pages/faculty/FacultyProjects';
import FacultyStudents from './pages/faculty/FacultyStudents';

// ==================== Shared Pages ====================
import ProjectDetails from './pages/shared/ProjectDetails';

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            {/* ==================== Public Routes ==================== */}

            <Route path="/" element={<Navigate to="/login" replace />} />

            <Route path="/login" element={<Login />} />

            <Route path="/register" element={<Register />} />

            {/* ==================== Student Routes ==================== */}

            <Route path="/student" element={<DashboardLayout role="student" />}>
              {/* Dashboard */}
              <Route path="dashboard" element={<StudentDashboard />} />

              {/* My Projects */}
              <Route path="projects" element={<MyProjects />} />

              {/* View Project */}
              <Route path="projects/view/:id" element={<ProjectDetails />} />

              {/* Edit Project */}
              <Route path="projects/edit/:id" element={<ProjectDetailsEdit />} />

              {/* Add Project */}
              <Route path="projects/add" element={<AddProject />} />

              {/* Search Projects */}
              <Route path="search" element={<SearchProjects />} />

              {/* Wishlist */}
              <Route path="wishlist" element={<Wishlist />} />

              {/* Innovation Assistant */}
              <Route path="assistant" element={<InnovationAssistant />} />

              {/* Faculty Feedback */}
              <Route path="feedback" element={<FacultyFeedbackList />} />

              {/* Student Profile */}
              <Route path="profile" element={<StudentProfile />} />
            </Route>

            {/* ==================== Faculty Routes ==================== */}

            <Route path="/faculty" element={<DashboardLayout role="faculty" />}>
              {/* Dashboard */}
              <Route path="dashboard" element={<FacultyDashboard />} />

              {/* All Projects */}
              <Route path="projects" element={<FacultyProjects />} />

              {/* Search Projects */}
              <Route path="search" element={<SearchProjects />} />

              {/* Students */}
              <Route path="students" element={<FacultyStudents />} />

              {/* Faculty Profile */}
              <Route path="profile" element={<FacultyProfile />} />
            </Route>

            {/* ==================== Fallback ==================== */}

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
