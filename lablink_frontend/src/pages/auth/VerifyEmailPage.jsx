import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { verifyEmail } from '../../api/auth';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('verifying'); // 'verifying' | 'success' | 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('Missing verification token.');
      return;
    }
    verifyEmail(token)
      .then((res) => {
        setStatus('success');
        setMessage(res.data?.detail || 'Email verified successfully.');
      })
      .catch((err) => {
        setStatus('error');
        setMessage(err.response?.data?.detail || 'Invalid or expired verification link.');
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: '#c5c9e8', padding: '20px', fontFamily: 'Inter, sans-serif',
    }}>
      <div style={{
        width: '100%', maxWidth: '420px', background: '#fff', borderRadius: '20px',
        padding: '40px 36px', textAlign: 'center', boxShadow: '0 24px 80px rgba(0,0,0,0.15)',
      }}>
        {status === 'verifying' && (
          <p style={{ fontSize: '15px', color: '#6b7280' }}>Verifying your email...</p>
        )}
        {status === 'success' && (
          <>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#16a34a', marginBottom: '12px' }}>
              Email verified
            </h2>
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px' }}>{message}</p>
          </>
        )}
        {status === 'error' && (
          <>
            <h2 style={{ fontSize: '22px', fontWeight: 800, color: '#dc2626', marginBottom: '12px' }}>
              Verification failed
            </h2>
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px' }}>{message}</p>
          </>
        )}
        {status !== 'verifying' && (
          <Link to="/login" style={{ fontSize: '14px', color: '#6b77c0', textDecoration: 'none', fontWeight: 600 }}>
            Go to login →
          </Link>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;
