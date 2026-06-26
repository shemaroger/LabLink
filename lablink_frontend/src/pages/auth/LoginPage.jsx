import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';

const LoginPage = () => {
  const { login, completeMfaLogin } = useAuth();
  const navigate               = useNavigate();
  const [showPw, setShowPw]    = useState(false);
  const [loading, setLoading]  = useState(false);
  const [mfaEmail, setMfaEmail] = useState(null);
  const [mfaCode, setMfaCode]   = useState('');
  const { register, handleSubmit, formState: { errors } } = useForm();

  const redirectAfterLogin = (user) => {
    if (user.must_change_password) {
      navigate('/change-password');
      return;
    }

    if      (user.role === 'patient')      navigate('/patient/dashboard');
    else if (user.role === 'lab_staff')    navigate('/staff/dashboard');
    else if (user.role === 'doctor')       navigate('/doctor/dashboard');
    else if (user.role === 'receptionist') navigate('/receptionist/dashboard');
    else if (user.role === 'nurse')        navigate('/nurse/dashboard');
    else if (user.role === 'admin')        navigate('/admin/dashboard');
    else if (user.role === 'hospital_admin') navigate('/admin/dashboard');
    else navigate('/unauthorized');
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const result = await login(data);

      if (result?.mfaRequired) {
        setMfaEmail(result.email);
        toast.success('A verification code has been sent to your email.');
        return;
      }

      redirectAfterLogin(result);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const onSubmitMfaCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await completeMfaLogin(mfaEmail, mfaCode);
      redirectAfterLogin(user);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Invalid or expired code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#c5c9e8',
      padding: '20px',
      fontFamily: 'Inter, sans-serif',
    }}>

      {/* OUTER CARD */}
      <div style={{
        display: 'flex',
        width: '100%',
        maxWidth: '880px',
        minHeight: '560px',
        borderRadius: '28px',
        overflow: 'hidden',
        boxShadow: '0 24px 80px rgba(0,0,0,0.15)',
      }}>

        {/* ════ LEFT PURPLE PANEL ════ */}
        <div style={{
          width: '44%',
          background: 'linear-gradient(160deg, #9ba4d4 0%, #7b86c8 40%, #6b77c0 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '36px 32px 0',
          position: 'relative',
          overflow: 'hidden',
        }}>

          {/* Top content */}
          <div>
            <div style={{
              width: '80px', height: '80px',
              backgroundColor: 'white', borderRadius: '20px',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', marginBottom: '24px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)', padding: '8px',
            }}>
              <img src="/logo.png" alt="TechQuest LabLink"
                   style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
            </div>

            <p style={{
              color: 'white', fontSize: '20px', fontWeight: 600,
              lineHeight: 1.45, fontStyle: 'italic',
              maxWidth: '210px', margin: 0,
            }}>
              LabLink — secure access to your laboratory results.
            </p>
          </div>

          {/* Bottom illustration */}
          <div style={{
            display: 'flex', justifyContent: 'center',
            alignItems: 'flex-end', position: 'relative', marginTop: '24px',
          }}>
            <div style={{
              position: 'absolute', bottom: '-30px', left: '50%',
              transform: 'translateX(-50%)', width: '260px', height: '100px',
              borderRadius: '50%',
              background: 'linear-gradient(180deg, #8a96ce 0%, #5f6bbf 100%)',
              zIndex: 0,
            }} />
            <svg viewBox="0 0 160 200" xmlns="http://www.w3.org/2000/svg"
                 style={{
                   width: '180px', height: '200px',
                   position: 'relative', zIndex: 1,
                   filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.25))',
                 }}>
              <rect x="55" y="8" width="50" height="14" rx="6"
                    fill="rgba(255,255,255,0.9)"
                    stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
              <path
                d="M55 22 L55 80 L20 145 Q12 162 25 168 L135 168 Q148 162 140 145 L105 80 L105 22 Z"
                fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.7)"
                strokeWidth="2.5" strokeLinejoin="round" />
              <path
                d="M28 148 L46 110 L114 110 L132 148 Q140 160 130 165 L30 165 Q20 160 28 148 Z"
                fill="rgba(255,255,255,0.22)" />
              <circle cx="55" cy="138" r="6" fill="rgba(255,255,255,0.45)" />
              <circle cx="80" cy="148" r="4" fill="rgba(255,255,255,0.38)" />
              <circle cx="100" cy="135" r="5" fill="rgba(255,255,255,0.32)" />
              <circle cx="70" cy="128" r="3" fill="rgba(255,255,255,0.28)" />
              <line x1="68" y1="28" x2="68" y2="78"
                    stroke="rgba(255,255,255,0.35)"
                    strokeWidth="3" strokeLinecap="round" />
              <text x="18" y="55" fill="rgba(255,255,255,0.55)"
                    fontSize="20" fontWeight="bold">+</text>
              <text x="122" y="70" fill="rgba(255,255,255,0.40)"
                    fontSize="16" fontWeight="bold">+</text>
              <text x="130" y="40" fill="rgba(255,255,255,0.30)"
                    fontSize="12" fontWeight="bold">+</text>
            </svg>
          </div>

        </div>

        {/* ════ RIGHT WHITE PANEL ════ */}
        <div style={{
          flex: 1, backgroundColor: '#ffffff',
          display: 'flex', flexDirection: 'column',
          justifyContent: 'center', padding: '48px 52px',
          position: 'relative',
        }}>

          {/* Language selector */}
          <div style={{
            position: 'absolute', top: '22px', right: '28px',
            fontSize: '12px', color: '#9ca3af',
            cursor: 'pointer', userSelect: 'none',
          }}>
            English(US) ▾
          </div>

          {/* Heading */}
          <h2 style={{
            fontSize: '28px', fontWeight: 800,
            color: '#111827', marginBottom: '36px', marginTop: 0,
          }}>
            {mfaEmail ? 'Enter verification code' : 'Sign In'}
          </h2>

          {mfaEmail ? (
            <form onSubmit={onSubmitMfaCode} style={{ width: '100%' }}>
              <p style={{ fontSize: '14px', color: '#6b7280', marginTop: 0, marginBottom: '24px' }}>
                We sent a 6-digit code to <strong>{mfaEmail}</strong>. Enter it below to finish signing in.
              </p>

              <div style={{ marginBottom: '28px' }}>
                <label style={{ display: 'block', fontSize: '14px', color: '#6b7280', marginBottom: '8px' }}>
                  Verification code:
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                  autoFocus
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '8px 0', fontSize: '20px', letterSpacing: '6px',
                    color: '#111827', background: 'transparent', border: 'none',
                    borderBottom: '1.5px solid #d1d5db', outline: 'none',
                  }}
                />
              </div>

              <button type="submit" disabled={loading || mfaCode.length !== 6}
                style={{
                  width: '100%', padding: '16px',
                  backgroundColor: '#6b77c0', color: '#ffffff',
                  fontWeight: 700, fontSize: '16px',
                  borderRadius: '12px', border: 'none',
                  cursor: (loading || mfaCode.length !== 6) ? 'not-allowed' : 'pointer',
                  opacity: (loading || mfaCode.length !== 6) ? 0.7 : 1,
                  boxShadow: '0 4px 20px rgba(107,119,192,0.40)',
                  marginBottom: '16px', boxSizing: 'border-box',
                }}>
                {loading ? 'Verifying...' : 'Verify and sign in'}
              </button>

              <button type="button" onClick={() => { setMfaEmail(null); setMfaCode(''); }}
                style={{
                  width: '100%', padding: '8px', background: 'none', border: 'none',
                  color: '#6b7280', fontSize: '13px', cursor: 'pointer',
                }}>
                ← Back to login
              </button>
            </form>
          ) : (
          <form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%' }}>

            {/* Email */}
            <div style={{ marginBottom: '28px' }}>
              <label style={{
                display: 'block', fontSize: '14px',
                color: '#6b7280', marginBottom: '8px',
              }}>
                Email:
              </label>
              <input
                type="email"
                style={{
                  width: '100%', boxSizing: 'border-box',
                  padding: '8px 0', fontSize: '15px', color: '#111827',
                  background: 'transparent', border: 'none',
                  borderBottom: '1.5px solid #d1d5db', outline: 'none',
                }}
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^\S+@\S+\.\S+$/,
                    message: 'Enter a valid email',
                  },
                })}
              />
              {errors.email && (
                <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password */}
            <div style={{ marginBottom: '40px' }}>
              <label style={{
                display: 'block', fontSize: '14px',
                color: '#6b7280', marginBottom: '8px',
              }}>
                Password:
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '8px 36px 8px 0', fontSize: '15px',
                    color: '#111827', background: 'transparent',
                    border: 'none', borderBottom: '1.5px solid #d1d5db',
                    outline: 'none',
                  }}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 6, message: 'Min 6 characters' },
                  })}
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  style={{
                    position: 'absolute', right: '0',
                    top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none',
                    cursor: 'pointer', color: '#9ca3af',
                    display: 'flex', alignItems: 'center', padding: 0,
                  }}>
                  {showPw
                    ? <EyeOff style={{ width: '18px', height: '18px' }} />
                    : <Eye style={{ width: '18px', height: '18px' }} />}
                </button>
              </div>
              {errors.password && (
                <p style={{ color: '#ef4444', fontSize: '12px', marginTop: '4px' }}>
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              style={{
                width: '100%', padding: '16px',
                backgroundColor: '#6b77c0', color: '#ffffff',
                fontWeight: 700, fontSize: '16px',
                borderRadius: '12px', border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                boxShadow: '0 4px 20px rgba(107,119,192,0.40)',
                marginBottom: '20px', boxSizing: 'border-box',
              }}>
              {loading ? (
                <span style={{
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center', gap: '8px',
                }}>
                  <span style={{
                    width: '16px', height: '16px',
                    border: '2px solid white', borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                    display: 'inline-block',
                  }} />
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>

            <div style={{ textAlign: 'center', marginBottom: '4px' }}>
              <Link to="/forgot-password" style={{ fontSize: '13px', color: '#6b77c0', textDecoration: 'none' }}>
                Forgot password?
              </Link>
            </div>

          </form>
          )}

          {/* No self-registration — admin creates all accounts */}
          {!mfaEmail && (
            <p style={{
              fontSize: '13px', color: '#9ca3af',
              margin: '16px 0 0', textAlign: 'center',
            }}>
              Contact your administrator to get access.
            </p>
          )}

        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default LoginPage;