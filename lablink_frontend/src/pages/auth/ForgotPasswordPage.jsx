import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { requestPasswordReset, confirmPasswordReset } from '../../api/auth';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [step, setStep]         = useState('request'); // 'request' | 'confirm'
  const [identifier, setIdentifier] = useState('');
  const [code, setCode]         = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading]   = useState(false);

  const onRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await requestPasswordReset(identifier);
      toast.success(res.data?.detail || 'If an account exists, a reset code has been sent.');
      setStep('confirm');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const onConfirm = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await confirmPasswordReset({ identifier, code, new_password: newPassword });
      toast.success('Password reset. Please log in with your new password.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Invalid or expired code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: '#c5c9e8', padding: '20px', fontFamily: 'Inter, sans-serif',
    }}>
      <div style={{
        width: '100%', maxWidth: '420px', background: '#fff', borderRadius: '20px',
        padding: '40px 36px', boxShadow: '0 24px 80px rgba(0,0,0,0.15)',
      }}>
        <h2 style={{ fontSize: '24px', fontWeight: 800, color: '#111827', marginTop: 0, marginBottom: '12px' }}>
          Reset your password
        </h2>

        {step === 'request' ? (
          <>
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '28px' }}>
              Enter the email or phone number on your account. We'll send a reset code by
              email, or by SMS if you don't have an email on file.
            </p>
            <form onSubmit={onRequest}>
              <div style={{ marginBottom: '28px' }}>
                <label style={{ display: 'block', fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                  Email or phone number:
                </label>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  style={{
                    width: '100%', boxSizing: 'border-box', padding: '8px 0', fontSize: '15px',
                    color: '#111827', background: 'transparent', border: 'none',
                    borderBottom: '1.5px solid #d1d5db', outline: 'none',
                  }}
                />
              </div>
              <button type="submit" disabled={loading} style={submitBtnStyle(loading)}>
                {loading ? 'Sending...' : 'Send reset code'}
              </button>
            </form>
          </>
        ) : (
          <>
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '28px' }}>
              Enter the code you received along with your new password.
            </p>
            <form onSubmit={onConfirm}>
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                  Reset code:
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  style={{
                    width: '100%', boxSizing: 'border-box', padding: '8px 0', fontSize: '20px',
                    letterSpacing: '6px', color: '#111827', background: 'transparent', border: 'none',
                    borderBottom: '1.5px solid #d1d5db', outline: 'none',
                  }}
                />
              </div>
              <div style={{ marginBottom: '28px' }}>
                <label style={{ display: 'block', fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                  New password:
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  style={{
                    width: '100%', boxSizing: 'border-box', padding: '8px 0', fontSize: '15px',
                    color: '#111827', background: 'transparent', border: 'none',
                    borderBottom: '1.5px solid #d1d5db', outline: 'none',
                  }}
                />
              </div>
              <button type="submit" disabled={loading} style={submitBtnStyle(loading)}>
                {loading ? 'Resetting...' : 'Reset password'}
              </button>
              <button type="button" onClick={() => setStep('request')}
                style={{ width: '100%', padding: '8px', background: 'none', border: 'none', color: '#6b7280', fontSize: '13px', cursor: 'pointer', marginTop: '12px' }}>
                ← Use a different email or phone number
              </button>
            </form>
          </>
        )}

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Link to="/login" style={{ fontSize: '13px', color: '#6b77c0', textDecoration: 'none' }}>
            ← Back to login
          </Link>
        </div>
      </div>
    </div>
  );
};

const submitBtnStyle = (loading) => ({
  width: '100%', padding: '16px', backgroundColor: '#6b77c0', color: '#ffffff',
  fontWeight: 700, fontSize: '16px', borderRadius: '12px', border: 'none',
  cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1,
  boxShadow: '0 4px 20px rgba(107,119,192,0.40)', boxSizing: 'border-box',
});

export default ForgotPasswordPage;
