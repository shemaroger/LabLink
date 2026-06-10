import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import PatientDashboard from './pages/patient/PatientDashboard';
import MyResults from './pages/patient/MyResults';
import MyProfile from './pages/patient/MyProfile';
import StaffDashboard from './pages/staff/StaffDashboard';
import UploadResult from './pages/staff/UploadResult';
import PatientsList from './pages/staff/PatientsList';
import AdminDashboard from './pages/admin/AdminDashboard';
import UsersList from './pages/admin/UsersList';
import AuditLogs from './pages/admin/AuditLogs';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Patient */}
          <Route path="/patient/dashboard" element={
            <ProtectedRoute roles={['patient']}>
              <PatientDashboard />
            </ProtectedRoute>
          } />
          <Route path="/patient/results" element={
            <ProtectedRoute roles={['patient']}>
              <MyResults />
            </ProtectedRoute>
          } />
          <Route path="/patient/profile" element={
            <ProtectedRoute roles={['patient']}>
              <MyProfile />
            </ProtectedRoute>
          } />

          {/* Lab Staff */}
          <Route path="/staff/dashboard" element={
            <ProtectedRoute roles={['lab_staff']}>
              <StaffDashboard />
            </ProtectedRoute>
          } />
          <Route path="/staff/upload" element={
            <ProtectedRoute roles={['lab_staff']}>
              <UploadResult />
            </ProtectedRoute>
          } />
          <Route path="/staff/patients" element={
            <ProtectedRoute roles={['lab_staff']}>
              <PatientsList />
            </ProtectedRoute>
          } />

          {/* Admin */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute roles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/admin/users" element={
            <ProtectedRoute roles={['admin']}>
              <UsersList />
            </ProtectedRoute>
          } />
          <Route path="/admin/audit-logs" element={
            <ProtectedRoute roles={['admin']}>
              <AuditLogs />
            </ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;