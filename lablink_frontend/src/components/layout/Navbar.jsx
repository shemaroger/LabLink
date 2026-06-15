import React, { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getUnreadCount } from '../../api/notifications';
import { Link } from 'react-router-dom';

const Navbar = ({ title }) => {
  const { user }            = useAuth();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (user?.role === 'patient') {
      getUnreadCount()
        .then((res) => setUnread(res.data.unread_count))
        .catch(() => {});
    }
  }, [user]);

  return (
    <header style={{
      height: '64px',
      backgroundColor: '#ffffff',
      borderBottom: '1px solid #f3f4f6',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      fontFamily: 'Inter, sans-serif',
    }}>

      {/* Page title */}
      <h1 style={{
        fontSize: '17px',
        fontWeight: 600,
        color: '#111827',
        margin: 0,
      }}>
        {title}
      </h1>

      {/* Right side */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
      }}>

        {/* Notification bell — patients only */}
        {user?.role === 'patient' && (
          <Link
            to="/patient/dashboard"
            style={{
              position: 'relative',
              padding: '8px',
              color: '#6b7280',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none',
              transition: 'background-color 0.15s ease',
              backgroundColor: 'transparent',
            }}
            onMouseEnter={(e) =>
              e.currentTarget.style.backgroundColor = '#f3f4f6'
            }
            onMouseLeave={(e) =>
              e.currentTarget.style.backgroundColor = 'transparent'
            }
          >
            <Bell style={{ width: '20px', height: '20px' }} />
            {unread > 0 && (
              <span style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                width: '18px',
                height: '18px',
                backgroundColor: '#ef4444',
                color: 'white',
                fontSize: '10px',
                fontWeight: 600,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {unread > 9 ? '9+' : unread}
              </span>
            )}
          </Link>
        )}

        {/* User avatar + name */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <div style={{
            width: '34px',
            height: '34px',
            background: 'linear-gradient(135deg, #9ba4d4 0%, #6b77c0 100%)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}>
            <span style={{
              color: 'white',
              fontWeight: 600,
              fontSize: '12px',
            }}>
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </span>
          </div>
          <span style={{
            fontSize: '14px',
            fontWeight: 500,
            color: '#374151',
          }}>
            {user?.first_name}
          </span>
        </div>

      </div>
    </header>
  );
};

export default Navbar;