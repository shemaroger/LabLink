import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

// Total inactivity allowed before logout, and how long before that the warning appears.
const IDLE_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes
const WARNING_BEFORE_MS = 60 * 1000;    // warn 1 minute before logout
const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'scroll', 'touchstart'];
const ACTIVITY_THROTTLE_MS = 5000;

const SessionTimeoutWarning = () => {
  const { user, logout } = useAuth();
  const [secondsLeft, setSecondsLeft] = useState(null); // null = warning hidden

  const warnTimerRef     = useRef(null);
  const logoutTimerRef   = useRef(null);
  const countdownRef     = useRef(null);
  const lastActivityRef  = useRef(Date.now());

  const clearAllTimers = useCallback(() => {
    clearTimeout(warnTimerRef.current);
    clearTimeout(logoutTimerRef.current);
    clearInterval(countdownRef.current);
  }, []);

  const scheduleTimers = useCallback(() => {
    clearAllTimers();
    setSecondsLeft(null);

    warnTimerRef.current = setTimeout(() => {
      setSecondsLeft(Math.round(WARNING_BEFORE_MS / 1000));
      countdownRef.current = setInterval(() => {
        setSecondsLeft((prev) => (prev !== null && prev > 1 ? prev - 1 : 0));
      }, 1000);
    }, IDLE_TIMEOUT_MS - WARNING_BEFORE_MS);

    logoutTimerRef.current = setTimeout(() => {
      clearAllTimers();
      setSecondsLeft(null);
      logout();
    }, IDLE_TIMEOUT_MS);
  }, [clearAllTimers, logout]);

  const handleActivity = useCallback(() => {
    const now = Date.now();
    // Once the warning is showing, only the explicit "Stay logged in" button should reset it.
    if (secondsLeft !== null) return;
    if (now - lastActivityRef.current < ACTIVITY_THROTTLE_MS) return;
    lastActivityRef.current = now;
    scheduleTimers();
  }, [scheduleTimers, secondsLeft]);

  useEffect(() => {
    if (!user) {
      clearAllTimers();
      setSecondsLeft(null);
      return;
    }

    scheduleTimers();
    ACTIVITY_EVENTS.forEach((evt) => window.addEventListener(evt, handleActivity));

    return () => {
      ACTIVITY_EVENTS.forEach((evt) => window.removeEventListener(evt, handleActivity));
      clearAllTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const stayLoggedIn = () => {
    lastActivityRef.current = Date.now();
    scheduleTimers();
  };

  if (!user || secondsLeft === null) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: 'rgba(15, 17, 26, 0.55)',
    }}>
      <div style={{
        background: '#fff', borderRadius: 12, padding: '28px 32px',
        maxWidth: 380, width: '90%', textAlign: 'center',
        boxShadow: '0 20px 50px rgba(0,0,0,0.25)', fontFamily: 'Inter, sans-serif',
      }}>
        <h2 style={{ margin: '0 0 8px', fontSize: 18, color: '#1f2937' }}>
          You're about to be logged out
        </h2>
        <p style={{ margin: '0 0 20px', fontSize: 14, color: '#6b7280' }}>
          Due to inactivity, you'll be signed out in <strong>{secondsLeft}s</strong>.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button
            onClick={logout}
            style={{
              padding: '10px 18px', borderRadius: 8, border: '1px solid #e5e7eb',
              background: '#fff', color: '#374151', fontWeight: 600, cursor: 'pointer',
            }}
          >
            Log out now
          </button>
          <button
            onClick={stayLoggedIn}
            style={{
              padding: '10px 18px', borderRadius: 8, border: 'none',
              background: '#6b77c0', color: '#fff', fontWeight: 600, cursor: 'pointer',
            }}
          >
            Stay logged in
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionTimeoutWarning;
