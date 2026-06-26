import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();

  // Still loading — always show spinner, never redirect
  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#c5c9e8',
        fontFamily: 'Inter, sans-serif',
      }}>
        <div style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', gap: '16px',
        }}>
          <div style={{
            width: '40px', height: '40px',
            border: '3px solid #6b77c0',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
          <p style={{
            fontSize: '14px', color: '#6b7280',
            fontWeight: 500, margin: 0,
          }}>
            Loading...
          </p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Hospital Admin has identical access to Admin — treat it as satisfying any admin-gated route.
  const effectiveRoles = user.role === 'hospital_admin' ? [user.role, 'admin'] : [user.role];

  // Wrong role
  if (roles && !roles.some((r) => effectiveRoles.includes(r))) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;