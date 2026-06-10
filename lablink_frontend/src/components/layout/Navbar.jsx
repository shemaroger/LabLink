import { Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useEffect, useState } from 'react';
import { getUnreadCount } from '../../api/notifications';
import { Link } from 'react-router-dom';

const Navbar = ({ title }) => {
  const { user } = useAuth();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (user?.role === 'patient') {
      getUnreadCount()
        .then((res) => setUnread(res.data.unread_count))
        .catch(() => {});
    }
  }, [user]);

  return (
    <header className="h-16 bg-white border-b border-gray-100
                       flex items-center justify-between px-6">
      <h1 className="text-lg font-semibold text-gray-800">
        {title}
      </h1>

      <div className="flex items-center gap-4">
        {user?.role === 'patient' && (
          <Link
            to="/patient/dashboard"
            className="relative p-2 text-gray-500 hover:text-gray-700
                       hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Bell className="w-5 h-5" />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5
                               bg-red-500 text-white text-xs rounded-full
                               flex items-center justify-center font-medium">
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </Link>
        )}

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary-100 rounded-full
                          flex items-center justify-center">
            <span className="text-primary-700 font-semibold text-xs">
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </span>
          </div>
          <span className="text-sm text-gray-600 font-medium">
            {user?.first_name}
          </span>
        </div>
      </div>
    </header>
  );
};

export default Navbar;