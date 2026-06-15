import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';

import LoginPage             from './pages/auth/LoginPage';
import ChangePasswordPage    from './pages/auth/ChangePasswordPage';
import Unauthorized          from './pages/Unauthorized';

import PatientDashboard      from './pages/patient/PatientDashboard';
import MyResults             from './pages/patient/MyResults';
import MyProfile             from './pages/patient/MyProfile';

import StaffDashboard        from './pages/staff/StaffDashboard';
import UploadResult          from './pages/staff/UploadResult';
import PatientsList          from './pages/staff/PatientsList';

import AdminDashboard        from './pages/admin/AdminDashboard';
import AuditLogs             from './pages/admin/AuditLogs';
import GeneralReport         from './pages/admin/GeneralReport';
import UsersList             from './pages/admin/user/UsersList';
import CreateUser            from './pages/admin/user/CreateUser';
import EditUser              from './pages/admin/user/EditUser';
import ViewUser              from './pages/admin/user/ViewUser';
import AdminPatientsList     from './pages/admin/patient/PatientsList';
import ViewPatient           from './pages/admin/patient/ViewPatient';
import EditPatient           from './pages/admin/patient/EditPatient';
import CreatePatient         from './pages/admin/patient/CreatePatient';

import DoctorDashboard       from './pages/doctor/DoctorDashboard';
import DoctorResultsList     from './pages/doctor/DoctorResultsList';
import DoctorResultReview    from './pages/doctor/DoctorResultReview';
import ConsultationForm      from './pages/doctor/ConsultationForm';
import ConsultationView      from './pages/doctor/ConsultationView';

import NurseDashboard        from './pages/nurse/NurseDashboard';
import TriageForm            from './pages/nurse/TriageForm';
import TriageList            from './pages/nurse/TriageList';
import TriageView            from './pages/nurse/TriageView';

import ReceptionistDashboard from './pages/receptionist/ReceptionistDashboard';
import QueueManagement       from './pages/receptionist/QueueManagement';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              borderRadius: '10px',
              fontSize: '14px',
            },
            success: {
              iconTheme: {
                primary: '#6b77c0',
                secondary: '#fff',
              },
            },
          }}
        />
        <Routes>

          {/* ── Public ── */}
          <Route path="/"                element={<Navigate to="/login" replace />} />
          <Route path="/login"           element={<LoginPage />} />
          <Route path="/change-password" element={<ChangePasswordPage />} />
          <Route path="/unauthorized"    element={<Unauthorized />} />

          {/* ── Patient ── */}
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

          {/* ── Lab Staff ── */}
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

          {/* ── Doctor ── */}
          <Route path="/doctor/dashboard" element={
            <ProtectedRoute roles={['doctor']}>
              <DoctorDashboard />
            </ProtectedRoute>
          } />
          <Route path="/doctor/patients" element={
            <ProtectedRoute roles={['doctor']}>
              <AdminPatientsList />
            </ProtectedRoute>
          } />

          {/* ⚠️ /consult MUST come before /:id */}
          <Route path="/doctor/patients/:id/consult" element={
            <ProtectedRoute roles={['doctor']}>
              <ConsultationForm />
            </ProtectedRoute>
          } />
          <Route path="/doctor/patients/:id" element={
            <ProtectedRoute roles={['doctor']}>
              <ViewPatient />
            </ProtectedRoute>
          } />
          <Route path="/doctor/consultations/:id" element={
            <ProtectedRoute roles={['doctor']}>
              <ConsultationView />
            </ProtectedRoute>
          } />
          <Route path="/doctor/results" element={
            <ProtectedRoute roles={['doctor']}>
              <DoctorResultsList />
            </ProtectedRoute>
          } />
          <Route path="/doctor/results/:id" element={
            <ProtectedRoute roles={['doctor']}>
              <DoctorResultReview />
            </ProtectedRoute>
          } />

          {/* ── Nurse ── */}
          <Route path="/nurse/dashboard" element={
            <ProtectedRoute roles={['nurse']}>
              <NurseDashboard />
            </ProtectedRoute>
          } />
          <Route path="/nurse/triage" element={
            <ProtectedRoute roles={['nurse']}>
              <TriageList />
            </ProtectedRoute>
          } />
          <Route path="/nurse/triage/new" element={
            <ProtectedRoute roles={['nurse']}>
              <TriageForm />
            </ProtectedRoute>
          } />
          <Route path="/nurse/triage/:id" element={
            <ProtectedRoute roles={['nurse']}>
              <TriageView />
            </ProtectedRoute>
          } />
          <Route path="/nurse/patients" element={
            <ProtectedRoute roles={['nurse']}>
              <AdminPatientsList />
            </ProtectedRoute>
          } />
          <Route path="/nurse/patients/:id" element={
            <ProtectedRoute roles={['nurse']}>
              <ViewPatient />
            </ProtectedRoute>
          } />

          {/* ── Receptionist ── */}
          <Route path="/receptionist/dashboard" element={
            <ProtectedRoute roles={['receptionist']}>
              <ReceptionistDashboard />
            </ProtectedRoute>
          } />
          <Route path="/receptionist/queue" element={
            <ProtectedRoute roles={['receptionist', 'admin']}>
              <QueueManagement />
            </ProtectedRoute>
          } />
          <Route path="/receptionist/patients" element={
            <ProtectedRoute roles={['receptionist', 'admin']}>
              <AdminPatientsList />
            </ProtectedRoute>
          } />
          <Route path="/receptionist/patients/create" element={
            <ProtectedRoute roles={['receptionist', 'admin']}>
              <CreatePatient />
            </ProtectedRoute>
          } />
          <Route path="/receptionist/patients/:id" element={
            <ProtectedRoute roles={['receptionist', 'admin']}>
              <ViewPatient />
            </ProtectedRoute>
          } />
          <Route path="/receptionist/patients/:id/edit" element={
            <ProtectedRoute roles={['receptionist', 'admin']}>
              <EditPatient />
            </ProtectedRoute>
          } />

          {/* ── Admin ── */}
          <Route path="/admin/dashboard" element={
            <ProtectedRoute roles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          {/* Users CRUD */}
          <Route path="/admin/users" element={
            <ProtectedRoute roles={['admin']}>
              <UsersList />
            </ProtectedRoute>
          } />
          <Route path="/admin/users/create" element={
            <ProtectedRoute roles={['admin']}>
              <CreateUser />
            </ProtectedRoute>
          } />
          <Route path="/admin/users/:id" element={
            <ProtectedRoute roles={['admin']}>
              <ViewUser />
            </ProtectedRoute>
          } />
          <Route path="/admin/users/:id/edit" element={
            <ProtectedRoute roles={['admin']}>
              <EditUser />
            </ProtectedRoute>
          } />

          {/* Patients CRUD */}
          <Route path="/admin/patients" element={
            <ProtectedRoute roles={['admin']}>
              <AdminPatientsList />
            </ProtectedRoute>
          } />
          <Route path="/admin/patients/create" element={
            <ProtectedRoute roles={['admin']}>
              <CreatePatient />
            </ProtectedRoute>
          } />
          <Route path="/admin/patients/:id" element={
            <ProtectedRoute roles={['admin']}>
              <ViewPatient />
            </ProtectedRoute>
          } />
          <Route path="/admin/patients/:id/edit" element={
            <ProtectedRoute roles={['admin']}>
              <EditPatient />
            </ProtectedRoute>
          } />

          {/* Audit logs */}
          <Route path="/admin/audit-logs" element={
            <ProtectedRoute roles={['admin']}>
              <AuditLogs />
            </ProtectedRoute>
          } />

          {/* General report */}
          <Route path="/admin/general-report" element={
            <ProtectedRoute roles={['admin']}>
              <GeneralReport />
            </ProtectedRoute>
          } />

          {/* ── Fallback ── */}
          <Route path="*" element={<Navigate to="/login" replace />} />

        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;