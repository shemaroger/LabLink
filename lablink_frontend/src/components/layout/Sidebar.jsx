import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard, FileText,
  Users, Shield, LogOut, User,
  Upload, ChevronDown, ChevronRight,
  Plus, List, Activity, UserPlus,
  Clock, Stethoscope, BarChart2,
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate         = useNavigate();
  const location         = useLocation();

  const [usersOpen, setUsersOpen] = useState(
    location.pathname.startsWith('/admin/users')
  );
  const [patientsOpen, setPatientsOpen] = useState(
    location.pathname.startsWith('/admin/patients')
  );
  const [receptionistPatientsOpen, setReceptionistPatientsOpen] = useState(
    location.pathname.startsWith('/receptionist/patients')
  );

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const patientLinks = [
    { to: '/patient/dashboard', icon: LayoutDashboard, label: 'Dashboard'  },
    { to: '/patient/results',   icon: FileText,        label: 'My Results' },
    { to: '/patient/profile',   icon: User,            label: 'My Profile' },
  ];

  const staffLinks = [
    { to: '/staff/dashboard', icon: LayoutDashboard, label: 'Dashboard'     },
    { to: '/staff/upload',    icon: Upload,           label: 'Upload Result' },
    { to: '/staff/patients',  icon: Users,            label: 'Patients'      },
  ];

  const doctorLinks = [
    { to: '/doctor/dashboard', icon: LayoutDashboard, label: 'Dashboard'   },
    { to: '/doctor/patients',  icon: Users,           label: 'Patients'    },
    { to: '/doctor/results',   icon: FileText,        label: 'Lab Results' },
  ];

  const nurseLinks = [
    { to: '/nurse/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/nurse/patients',  icon: Users,           label: 'Patients'  },
    { to: '/nurse/triage',    icon: Activity,        label: 'Triage'    },
  ];

  const links =
    user?.role === 'patient'   ? patientLinks :
    user?.role === 'lab_staff' ? staffLinks   :
    user?.role === 'doctor'    ? doctorLinks  :
    user?.role === 'nurse'     ? nurseLinks   : null;

  const roleLabel = {
    patient:      'Patient',
    lab_staff:    'Lab Staff',
    doctor:       'Doctor',
    nurse:        'Nurse',
    receptionist: 'Receptionist',
    admin:        'Administrator',
  };

  const roleBannerColor = {
    patient:      'linear-gradient(135deg, #7b86c8 0%, #6b77c0 100%)',
    lab_staff:    'linear-gradient(135deg, #8a96ce 0%, #7b86c8 100%)',
    doctor:       'linear-gradient(135deg, #9ba4d4 0%, #6b77c0 100%)',
    nurse:        'linear-gradient(135deg, #9ba4d4 0%, #6b77c0 100%)',
    receptionist: 'linear-gradient(135deg, #7b86c8 0%, #6b77c0 100%)',
    admin:        'linear-gradient(135deg, #5f6bbf 0%, #4f5aaf 100%)',
  };

  const activeColor = '#6b77c0';
  const activeBg    = '#eeeffa';

  const isUsersActive                = location.pathname.startsWith('/admin/users');
  const isPatientsActive             = location.pathname.startsWith('/admin/patients');
  const isReceptionistPatientsActive = location.pathname.startsWith('/receptionist/patients');

  const navStyle = (isActive) => ({
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '10px 12px', borderRadius: '10px',
    fontSize: '14px', fontWeight: 500,
    textDecoration: 'none', marginBottom: '2px',
    transition: 'all 0.15s ease',
    backgroundColor: isActive ? activeBg : 'transparent',
    color: isActive ? activeColor : '#6b7280',
  });

  const subLinkStyle = (isActive) => ({
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '8px 12px 8px 36px',
    borderRadius: '8px', fontSize: '13px',
    fontWeight: isActive ? 600 : 400,
    textDecoration: 'none', marginBottom: '2px',
    transition: 'all 0.15s ease',
    backgroundColor: isActive ? activeBg : 'transparent',
    color: isActive ? activeColor : '#9ca3af',
  });

  const iconWrap = (isActive) => ({
    padding: '4px', borderRadius: '6px',
    backgroundColor: isActive
      ? 'rgba(107,119,192,0.15)'
      : 'transparent',
    display: 'flex', alignItems: 'center',
    justifyContent: 'center', transition: 'all 0.15s ease',
    flexShrink: 0,
  });

  const dropdownParentStyle = (isActive) => ({
    display: 'flex', alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%', padding: '10px 12px',
    borderRadius: '10px', fontSize: '14px',
    fontWeight: 500, border: 'none', cursor: 'pointer',
    transition: 'all 0.15s ease',
    backgroundColor: isActive ? activeBg : 'transparent',
    color: isActive ? activeColor : '#6b7280',
  });

  const dropdownContainer = {
    marginTop: '2px',
    borderLeft: '2px solid #eeeffa',
    marginLeft: '20px',
    paddingLeft: '4px',
  };

  return (
    <aside style={{
      width: '256px', minHeight: '100vh',
      backgroundColor: '#ffffff',
      borderRight: '1px solid #f3f4f6',
      display: 'flex', flexDirection: 'column',
      fontFamily: 'Inter, sans-serif',
    }}>

      {/* ── Logo ── */}
      <div style={{ padding: '20px', borderBottom: '1px solid #f3f4f6' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src="/logo.png" alt="TechQuest Logo"
               style={{ height: '40px', width: 'auto', objectFit: 'contain' }} />
          <div>
            <p style={{
              fontWeight: 700, fontSize: '15px',
              color: '#111827', lineHeight: 1, margin: 0,
            }}>
              LabLink
            </p>
            <p style={{
              fontSize: '11px', color: '#9ca3af',
              marginTop: '3px', margin: 0,
            }}>
              by TechQuest Ltd
            </p>
          </div>
        </div>
      </div>

      {/* ── User banner ── */}
      <div style={{ padding: '16px', borderBottom: '1px solid #f3f4f6' }}>
        <div style={{
          background: roleBannerColor[user?.role] ||
                      'linear-gradient(135deg, #7b86c8 0%, #6b77c0 100%)',
          borderRadius: '12px', padding: '12px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px', height: '36px',
              backgroundColor: 'rgba(255,255,255,0.2)',
              borderRadius: '50%', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}>
              <span style={{ color: 'white', fontWeight: 600, fontSize: '13px' }}>
                {user?.first_name?.[0]}{user?.last_name?.[0]}
              </span>
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{
                fontSize: '13px', fontWeight: 600,
                color: 'white', margin: 0,
                overflow: 'hidden', textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>
                {user?.role === 'doctor' ? 'Dr. ' : ''}
                {user?.first_name} {user?.last_name}
              </p>
              <p style={{
                fontSize: '11px', color: 'rgba(255,255,255,0.8)',
                margin: 0, marginTop: '2px',
              }}>
                {roleLabel[user?.role]}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Nav ── */}
      <nav style={{ flex: 1, padding: '16px', overflowY: 'auto' }}>
        <p style={{
          fontSize: '11px', fontWeight: 500, color: '#9ca3af',
          textTransform: 'uppercase', letterSpacing: '0.08em',
          padding: '0 12px', marginBottom: '8px', marginTop: 0,
        }}>
          Navigation
        </p>

        {/* Patient / Staff / Doctor / Nurse flat links */}
        {links && links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to} to={to}
            style={({ isActive }) => navStyle(isActive)}
          >
            {({ isActive }) => (
              <>
                <div style={iconWrap(isActive)}>
                  <Icon style={{ width: '16px', height: '16px' }} />
                </div>
                {label}
              </>
            )}
          </NavLink>
        ))}

        {/* ── Receptionist links ── */}
        {user?.role === 'receptionist' && (
          <>
            <NavLink
              to="/receptionist/dashboard"
              style={({ isActive }) => navStyle(isActive)}
            >
              {({ isActive }) => (
                <>
                  <div style={iconWrap(isActive)}>
                    <LayoutDashboard style={{ width: '16px', height: '16px' }} />
                  </div>
                  Dashboard
                </>
              )}
            </NavLink>

            <NavLink
              to="/receptionist/queue"
              style={({ isActive }) => navStyle(isActive)}
            >
              {({ isActive }) => (
                <>
                  <div style={iconWrap(isActive)}>
                    <Clock style={{ width: '16px', height: '16px' }} />
                  </div>
                  Queue
                </>
              )}
            </NavLink>

            {/* Patients dropdown */}
            <div style={{ marginBottom: '2px' }}>
              <button
                onClick={() => setReceptionistPatientsOpen((o) => !o)}
                style={dropdownParentStyle(isReceptionistPatientsActive)}
                onMouseEnter={(e) => {
                  if (!isReceptionistPatientsActive)
                    e.currentTarget.style.backgroundColor = '#f9fafb';
                }}
                onMouseLeave={(e) => {
                  if (!isReceptionistPatientsActive)
                    e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={iconWrap(isReceptionistPatientsActive)}>
                    <Users style={{ width: '16px', height: '16px' }} />
                  </div>
                  Patients
                </div>
                {receptionistPatientsOpen
                  ? <ChevronDown style={{ width: '14px', height: '14px', color: '#9ca3af' }} />
                  : <ChevronRight style={{ width: '14px', height: '14px', color: '#9ca3af' }} />}
              </button>

              {receptionistPatientsOpen && (
                <div style={dropdownContainer}>
                  <NavLink
                    to="/receptionist/patients" end
                    style={({ isActive }) => subLinkStyle(isActive)}
                    onMouseEnter={(e) => {
                      if (location.pathname !== '/receptionist/patients')
                        e.currentTarget.style.backgroundColor = '#f9fafb';
                    }}
                    onMouseLeave={(e) => {
                      if (location.pathname !== '/receptionist/patients')
                        e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    {({ isActive }) => (
                      <>
                        <List style={{ width: '13px', height: '13px', flexShrink: 0 }} />
                        All patients
                      </>
                    )}
                  </NavLink>

                  <NavLink
                    to="/receptionist/patients/create"
                    style={({ isActive }) => subLinkStyle(isActive)}
                    onMouseEnter={(e) => {
                      if (location.pathname !== '/receptionist/patients/create')
                        e.currentTarget.style.backgroundColor = '#f9fafb';
                    }}
                    onMouseLeave={(e) => {
                      if (location.pathname !== '/receptionist/patients/create')
                        e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    {({ isActive }) => (
                      <>
                        <UserPlus style={{ width: '13px', height: '13px', flexShrink: 0 }} />
                        Register patient
                      </>
                    )}
                  </NavLink>
                </div>
              )}
            </div>
          </>
        )}

        {/* ── Admin links ── */}
        {(user?.role === 'admin' || user?.role === 'hospital_admin') && (
          <>
            {/* Dashboard */}
            <NavLink
              to="/admin/dashboard"
              style={({ isActive }) => navStyle(isActive)}
            >
              {({ isActive }) => (
                <>
                  <div style={iconWrap(isActive)}>
                    <LayoutDashboard style={{ width: '16px', height: '16px' }} />
                  </div>
                  Dashboard
                </>
              )}
            </NavLink>

            {/* ── Users dropdown ── */}
            <div style={{ marginBottom: '2px' }}>
              <button
                onClick={() => setUsersOpen((o) => !o)}
                style={dropdownParentStyle(isUsersActive)}
                onMouseEnter={(e) => {
                  if (!isUsersActive)
                    e.currentTarget.style.backgroundColor = '#f9fafb';
                }}
                onMouseLeave={(e) => {
                  if (!isUsersActive)
                    e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={iconWrap(isUsersActive)}>
                    <Users style={{ width: '16px', height: '16px' }} />
                  </div>
                  Users
                </div>
                {usersOpen
                  ? <ChevronDown style={{ width: '14px', height: '14px', color: '#9ca3af' }} />
                  : <ChevronRight style={{ width: '14px', height: '14px', color: '#9ca3af' }} />}
              </button>

              {usersOpen && (
                <div style={dropdownContainer}>
                  <NavLink
                    to="/admin/users" end
                    style={({ isActive }) => subLinkStyle(isActive)}
                    onMouseEnter={(e) => {
                      if (location.pathname !== '/admin/users')
                        e.currentTarget.style.backgroundColor = '#f9fafb';
                    }}
                    onMouseLeave={(e) => {
                      if (location.pathname !== '/admin/users')
                        e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    {({ isActive }) => (
                      <>
                        <List style={{ width: '13px', height: '13px', flexShrink: 0 }} />
                        All users
                      </>
                    )}
                  </NavLink>

                  <NavLink
                    to="/admin/users/create"
                    style={({ isActive }) => subLinkStyle(isActive)}
                    onMouseEnter={(e) => {
                      if (location.pathname !== '/admin/users/create')
                        e.currentTarget.style.backgroundColor = '#f9fafb';
                    }}
                    onMouseLeave={(e) => {
                      if (location.pathname !== '/admin/users/create')
                        e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    {({ isActive }) => (
                      <>
                        <Plus style={{ width: '13px', height: '13px', flexShrink: 0 }} />
                        Create user
                      </>
                    )}
                  </NavLink>
                </div>
              )}
            </div>

            {/* ── Patients dropdown ── */}
            <div style={{ marginBottom: '2px' }}>
              <button
                onClick={() => setPatientsOpen((o) => !o)}
                style={dropdownParentStyle(isPatientsActive)}
                onMouseEnter={(e) => {
                  if (!isPatientsActive)
                    e.currentTarget.style.backgroundColor = '#f9fafb';
                }}
                onMouseLeave={(e) => {
                  if (!isPatientsActive)
                    e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={iconWrap(isPatientsActive)}>
                    <Activity style={{ width: '16px', height: '16px' }} />
                  </div>
                  Patients
                </div>
                {patientsOpen
                  ? <ChevronDown style={{ width: '14px', height: '14px', color: '#9ca3af' }} />
                  : <ChevronRight style={{ width: '14px', height: '14px', color: '#9ca3af' }} />}
              </button>

              {patientsOpen && (
                <div style={dropdownContainer}>
                  <NavLink
                    to="/admin/patients" end
                    style={({ isActive }) => subLinkStyle(isActive)}
                    onMouseEnter={(e) => {
                      if (location.pathname !== '/admin/patients')
                        e.currentTarget.style.backgroundColor = '#f9fafb';
                    }}
                    onMouseLeave={(e) => {
                      if (location.pathname !== '/admin/patients')
                        e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    {({ isActive }) => (
                      <>
                        <List style={{ width: '13px', height: '13px', flexShrink: 0 }} />
                        All patients
                      </>
                    )}
                  </NavLink>

                  <NavLink
                    to="/admin/patients/create"
                    style={({ isActive }) => subLinkStyle(isActive)}
                    onMouseEnter={(e) => {
                      if (location.pathname !== '/admin/patients/create')
                        e.currentTarget.style.backgroundColor = '#f9fafb';
                    }}
                    onMouseLeave={(e) => {
                      if (location.pathname !== '/admin/patients/create')
                        e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    {({ isActive }) => (
                      <>
                        <Plus style={{ width: '13px', height: '13px', flexShrink: 0 }} />
                        Create patient
                      </>
                    )}
                  </NavLink>
                </div>
              )}
            </div>

            {/* ── Audit Logs ── */}
            <NavLink
              to="/admin/audit-logs"
              style={({ isActive }) => navStyle(isActive)}
            >
              {({ isActive }) => (
                <>
                  <div style={iconWrap(isActive)}>
                    <Shield style={{ width: '16px', height: '16px' }} />
                  </div>
                  Audit Logs
                </>
              )}
            </NavLink>

            {/* ── General Report ── */}
            <NavLink
              to="/admin/general-report"
              style={({ isActive }) => navStyle(isActive)}
            >
              {({ isActive }) => (
                <>
                  <div style={iconWrap(isActive)}>
                    <BarChart2 style={{ width: '16px', height: '16px' }} />
                  </div>
                  General Report
                </>
              )}
            </NavLink>

          </>
        )}
      </nav>

      {/* ── Bottom ── */}
      <div style={{ padding: '16px', borderTop: '1px solid #f3f4f6' }}>
        <div style={{
          padding: '8px 12px', borderRadius: '8px',
          backgroundColor: '#f9fafb', marginBottom: '8px',
        }}>
          <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>
            Signed in as
          </p>
          <p style={{
            fontSize: '11px', fontWeight: 500, color: '#6b7280',
            margin: 0, marginTop: '2px',
            overflow: 'hidden', textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>
            {user?.email}
          </p>
        </div>

        <button
          onClick={handleLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: '10px',
            width: '100%', padding: '10px 12px',
            borderRadius: '10px', fontSize: '14px', fontWeight: 500,
            color: '#ef4444', backgroundColor: 'transparent',
            border: 'none', cursor: 'pointer',
            transition: 'background-color 0.15s ease',
          }}
          onMouseEnter={(e) =>
            e.currentTarget.style.backgroundColor = '#fef2f2'
          }
          onMouseLeave={(e) =>
            e.currentTarget.style.backgroundColor = 'transparent'
          }
        >
          <LogOut style={{ width: '16px', height: '16px' }} />
          Sign out
        </button>
      </div>

    </aside>
  );
};

export default Sidebar;