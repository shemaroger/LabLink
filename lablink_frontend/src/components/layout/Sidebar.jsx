import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FlaskConical, LayoutDashboard, FileText,
  Users, Bell, Shield, LogOut, User,
  Upload, ClipboardList,
} from 'lucide-react';
import toast from 'react-hot-toast';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const patientLinks = [
    { to: '/patient/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/patient/results',   icon: FileText,         label: 'My Results' },
    { to: '/patient/profile',   icon: User,             label: 'My Profile' },
  ];

  const staffLinks = [
    { to: '/staff/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/staff/upload',    icon: Upload,           label: 'Upload Result' },
    { to: '/staff/patients',  icon: Users,            label: 'Patients' },
  ];

  const adminLinks = [
    { to: '/admin/dashboard',   icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/users',       icon: Users,           label: 'Users' },
    { to: '/admin/audit-logs',  icon: Shield,          label: 'Audit Logs' },
  ];

  const links =
    user?.role === 'patient'  ? patientLinks :
    user?.role === 'lab_staff' ? staffLinks  : adminLinks;

  const roleLabel = {
    patient:   'Patient',
    lab_staff: 'Lab Staff',
    admin:     'Administrator',
  };

  const roleColor = {
    patient:   'bg-blue-100 text-blue-700',
    lab_staff: 'bg-green-100 text-green-700',
    admin:     'bg-purple-100 text-purple-700',
  };

  return (
    <aside className="w-64 min-h-screen bg-white border-r
                      border-gray-100 flex flex-col">

      {/* Logo */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary-600 rounded-xl
                          flex items-center justify-center">
            <FlaskConical className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-bold text-gray-900 text-base leading-none">
              LabLink
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              Results System
            </p>
          </div>
        </div>
      </div>

      {/* User info */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary-100 rounded-full
                          flex items-center justify-center flex-shrink-0">
            <span className="text-primary-700 font-semibold text-sm">
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">
              {user?.first_name} {user?.last_name}
            </p>
            <span className={`text-xs px-2 py-0.5 rounded-full
                              font-medium ${roleColor[user?.role]}`}>
              {roleLabel[user?.role]}
            </span>
          </div>
        </div>
      </div>

      {/* Nav links */}
      <nav className="flex-1 p-4 space-y-1">
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg
               text-sm font-medium transition-colors duration-150
               ${isActive
                 ? 'bg-primary-50 text-primary-700'
                 : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
               }`
            }
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-gray-100">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg
                     text-sm font-medium text-red-500 hover:bg-red-50
                     transition-colors duration-150 w-full"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>

    </aside>
  );
};

export default Sidebar;