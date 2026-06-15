import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { registerUser } from '../../api/auth';
import toast from 'react-hot-toast';
import { Eye, EyeOff } from 'lucide-react';

const RegisterPage = () => {
  const navigate              = useNavigate();
  const [showPw, setShowPw]   = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch('password');

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await registerUser(data);
      toast.success('Account created! Please sign in.');
      navigate('/login');
    } catch (err) {
      const errs = err.response?.data;
      if (errs) {
        Object.values(errs).forEach((m) =>
          toast.error(Array.isArray(m) ? m[0] : m)
        );
      } else {
        toast.error('Registration failed.');
      }
    } finally {
      setLoading(false);
    }
  };

  const labelStyle = {
    display: 'block',
    fontSize: '13px',
    color: '#6b7280',
    marginBottom: '6px',
  };

  const fieldStyle = {
    width: '100%',
    boxSizing: 'border-box',
    padding: '6px 0',
    fontSize: '14px',
    color: '#111827',
    background: 'transparent',
    border: 'none',
    borderBottom: '1.5px solid #d1d5db',
    outline: 'none',
  };

  const errStyle = {
    color: '#ef4444',
    fontSize: '11px',
    marginTop: '3px',
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
        maxWidth: '1100px',
        minHeight: '620px',
        borderRadius: '28px',
        overflow: 'hidden',
        boxShadow: '0 24px 80px rgba(0,0,0,0.15)',
      }}>

        {/* ════ LEFT PURPLE PANEL ════ */}
        <div style={{
          width: '42%',
          background: 'linear-gradient(160deg, #9ba4d4 0%, #7b86c8 40%, #6b77c0 100%)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '40px 40px 0',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div>
            {/* Logo box */}
            <div style={{
              width: '80px',
              height: '80px',
              backgroundColor: 'white',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '24px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
              padding: '8px',
            }}>
              <img
                src="/logo.png"
                alt="TechQuest LabLink"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                }}
              />
            </div>

            <p style={{
              color: 'white',
              fontSize: '20px',
              fontWeight: 600,
              lineHeight: 1.45,
              fontStyle: 'italic',
              maxWidth: '220px',
              margin: 0,
            }}>
              Join LabLink and access your results securely.
            </p>
          </div>

          {/* Illustration */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-end',
            position: 'relative',
            flex: 1,
            marginTop: '20px',
          }}>
            {/* Platform ellipse */}
            <div style={{
              position: 'absolute',
              bottom: '0px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '300px',
              height: '80px',
              borderRadius: '50%',
              background: 'linear-gradient(180deg, #8a96ce 0%, #5f6bbf 100%)',
              zIndex: 0,
            }} />
            {/* Flask */}
            <svg viewBox="0 0 160 200" xmlns="http://www.w3.org/2000/svg"
                 style={{
                   width: '200px',
                   height: '220px',
                   position: 'relative',
                   zIndex: 1,
                   marginBottom: '20px',
                   filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.25))',
                 }}>
              <rect x="55" y="8" width="50" height="14" rx="6"
                    fill="rgba(255,255,255,0.9)"
                    stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
              <path
                d="M55 22 L55 80 L20 145 Q12 162 25 168 L135 168 Q148 162 140 145 L105 80 L105 22 Z"
                fill="rgba(255,255,255,0.12)"
                stroke="rgba(255,255,255,0.7)"
                strokeWidth="2.5" strokeLinejoin="round"
              />
              <path
                d="M28 148 L46 110 L114 110 L132 148 Q140 160 130 165 L30 165 Q20 160 28 148 Z"
                fill="rgba(255,255,255,0.22)"
              />
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
          flex: 1,
          backgroundColor: '#ffffff',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '36px 72px',
          position: 'relative',
          overflowY: 'auto',
        }}>

          {/* Language selector */}
          <div style={{
            position: 'absolute',
            top: '20px',
            right: '28px',
            fontSize: '12px',
            color: '#9ca3af',
            cursor: 'pointer',
            userSelect: 'none',
          }}>
            English(US) ▾
          </div>

          {/* Heading */}
          <h2 style={{
            fontSize: '26px',
            fontWeight: 800,
            color: '#111827',
            marginBottom: '24px',
            marginTop: 0,
          }}>
            Create Account
          </h2>

          <form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%' }}>

            {/* Name row */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '32px',
              marginBottom: '20px',
            }}>
              <div>
                <label style={labelStyle}>First Name:</label>
                <input type="text" style={fieldStyle}
                       {...register('first_name', { required: 'Required' })} />
                {errors.first_name && (
                  <p style={errStyle}>{errors.first_name.message}</p>
                )}
              </div>
              <div>
                <label style={labelStyle}>Last Name:</label>
                <input type="text" style={fieldStyle}
                       {...register('last_name', { required: 'Required' })} />
                {errors.last_name && (
                  <p style={errStyle}>{errors.last_name.message}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Email:</label>
              <input type="email" style={fieldStyle}
                     {...register('email', {
                       required: 'Email is required',
                       pattern: {
                         value: /^\S+@\S+\.\S+$/,
                         message: 'Enter a valid email',
                       },
                     })} />
              {errors.email && (
                <p style={errStyle}>{errors.email.message}</p>
              )}
            </div>

            {/* Role */}
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Register as:</label>
              <select
                style={{ ...fieldStyle, color: '#6b7280', appearance: 'none' }}
                {...register('role', { required: 'Please select a role' })}
              >
                <option value="">Select role...</option>
                <option value="patient">Patient</option>
                <option value="lab_staff">Laboratory Staff</option>
              </select>
              {errors.role && (
                <p style={errStyle}>{errors.role.message}</p>
              )}
            </div>

            {/* Password */}
            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>Password:</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'}
                  style={{ ...fieldStyle, paddingRight: '32px' }}
                  {...register('password', {
                    required: 'Password is required',
                    minLength: { value: 8, message: 'Min 8 characters' },
                  })}
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  style={{
                    position: 'absolute', right: 0,
                    top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none',
                    cursor: 'pointer', color: '#9ca3af',
                    display: 'flex', alignItems: 'center', padding: 0,
                  }}>
                  {showPw
                    ? <EyeOff style={{ width: '17px', height: '17px' }} />
                    : <Eye style={{ width: '17px', height: '17px' }} />}
                </button>
              </div>
              {errors.password && (
                <p style={errStyle}>{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div style={{ marginBottom: '28px' }}>
              <label style={labelStyle}>Confirm Password:</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw2 ? 'text' : 'password'}
                  style={{ ...fieldStyle, paddingRight: '32px' }}
                  {...register('password2', {
                    required: 'Please confirm',
                    validate: (v) =>
                      v === password || 'Passwords do not match',
                  })}
                />
                <button type="button" onClick={() => setShowPw2(!showPw2)}
                  style={{
                    position: 'absolute', right: 0,
                    top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none',
                    cursor: 'pointer', color: '#9ca3af',
                    display: 'flex', alignItems: 'center', padding: 0,
                  }}>
                  {showPw2
                    ? <EyeOff style={{ width: '17px', height: '17px' }} />
                    : <Eye style={{ width: '17px', height: '17px' }} />}
                </button>
              </div>
              {errors.password2 && (
                <p style={errStyle}>{errors.password2.message}</p>
              )}
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading}
              style={{
                width: '100%',
                padding: '15px',
                backgroundColor: '#6b77c0',
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '16px',
                borderRadius: '12px',
                border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                boxShadow: '0 4px 20px rgba(107,119,192,0.40)',
                marginBottom: '16px',
                boxSizing: 'border-box',
              }}>
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center',
                               justifyContent: 'center', gap: '8px' }}>
                  <span style={{
                    width: '16px', height: '16px',
                    border: '2px solid white',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                    display: 'inline-block',
                  }} />
                  Creating...
                </span>
              ) : 'Create Account'}
            </button>

          </form>

          <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>
            Already have an Account?{' '}
            <Link to="/login" style={{
              color: '#6b77c0', fontWeight: 600, textDecoration: 'none',
            }}>
              Log in
            </Link>
          </p>

        </div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default RegisterPage;