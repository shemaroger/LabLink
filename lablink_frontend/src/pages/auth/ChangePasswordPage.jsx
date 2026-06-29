import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import { setMfaEnabled as setMfaEnabledApi, resendVerificationEmail } from '../../api/auth';
import toast from 'react-hot-toast';
import { Lock, Eye, EyeOff, ShieldCheck, MailCheck } from 'lucide-react';

const ChangePasswordPage = () => {
  const { user, refreshUser }     = useAuth();
  const navigate                  = useNavigate();
  const [showOld, setShowOld]     = useState(false);
  const [showNew, setShowNew]     = useState(false);
  const [showNew2, setShowNew2]   = useState(false);
  const [loading, setLoading]     = useState(false);
  const [mfaLoading, setMfaLoading]       = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const {
    register, handleSubmit, watch, formState: { errors },
  } = useForm();
  const newPassword = watch('new_password');
  const isAdminRole = user?.role === 'admin' || user?.role === 'hospital_admin';

  const onToggleMfa = async (e) => {
    const enabled = e.target.checked;
    setMfaLoading(true);
    try {
      await setMfaEnabledApi(enabled);
      await refreshUser();
      toast.success(enabled ? 'Two-factor authentication enabled.' : 'Two-factor authentication disabled.');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not update two-factor authentication.');
    } finally {
      setMfaLoading(false);
    }
  };

  const onResendVerification = async () => {
    setResendLoading(true);
    try {
      const res = await resendVerificationEmail();
      toast.success(res.data?.detail || 'Verification email sent.');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not send verification email.');
    } finally {
      setResendLoading(false);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await api.post('/users/change-password/', {
        old_password:  data.old_password,
        new_password:  data.new_password,
        new_password2: data.new_password2,
      });

      toast.success('Password changed successfully.');

      // Refresh user to clear must_change_password flag
      const updatedUser = await refreshUser();

      // Redirect by role
      const role = updatedUser?.role || user?.role;
      if      (role === 'patient')      navigate('/patient/dashboard');
      else if (role === 'lab_staff')    navigate('/staff/dashboard');
      else if (role === 'doctor')       navigate('/doctor/dashboard');
      else if (role === 'receptionist') navigate('/receptionist/dashboard');
      else if (role === 'nurse')        navigate('/nurse/dashboard');
      else if (role === 'admin')        navigate('/admin/dashboard');
      else if (role === 'hospital_admin') navigate('/admin/dashboard');
      else navigate('/login');

    } catch (err) {
      const errs = err.response?.data;
      if (errs) {
        Object.values(errs).forEach((m) =>
          toast.error(Array.isArray(m) ? m[0] : m)
        );
      } else {
        toast.error('Failed to change password.');
      }
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (showIcon = false) => ({
    width: '100%', boxSizing: 'border-box',
    padding: showIcon ? '10px 42px 10px 42px' : '10px 42px 10px 42px',
    fontSize: '14px', color: '#111827',
    background: 'transparent', border: 'none',
    borderBottom: '1.5px solid #d1d5db', outline: 'none',
  });

  const errStyle = {
    color: '#ef4444', fontSize: '12px', marginTop: '4px',
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backgroundColor: '#c5c9e8',
      padding: '20px', fontFamily: 'Inter, sans-serif',
    }}>
      <div style={{
        display: 'flex', width: '100%', maxWidth: '880px',
        minHeight: '560px', borderRadius: '28px',
        overflow: 'hidden', boxShadow: '0 24px 80px rgba(0,0,0,0.15)',
      }}>

        {/* ── Left purple panel ── */}
        <div style={{
          width: '44%',
          background: 'linear-gradient(160deg, #9ba4d4 0%, #7b86c8 40%, #6b77c0 100%)',
          display: 'flex', flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '36px 32px 0',
          position: 'relative', overflow: 'hidden',
        }}>
          <div>
            <div style={{
              width: '80px', height: '80px',
              backgroundColor: 'white', borderRadius: '20px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '24px',
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
              Keep your account secure with a strong password.
            </p>

            {/* Info box */}
            <div style={{
              marginTop: '28px',
              backgroundColor: 'rgba(255,255,255,0.15)',
              borderRadius: '12px', padding: '16px',
            }}>
              <p style={{
                color: 'white', fontSize: '13px',
                fontWeight: 600, margin: 0, marginBottom: '8px',
              }}>
                Password requirements:
              </p>
              {[
                'At least 8 characters',
                'Mix of letters and numbers',
                'Different from temporary password',
              ].map((req) => (
                <div key={req} style={{
                  display: 'flex', alignItems: 'center',
                  gap: '8px', marginBottom: '6px',
                }}>
                  <div style={{
                    width: '6px', height: '6px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255,255,255,0.7)',
                    flexShrink: 0,
                  }} />
                  <p style={{
                    color: 'rgba(255,255,255,0.85)',
                    fontSize: '12px', margin: 0,
                  }}>
                    {req}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom circle decoration */}
          <div style={{
            display: 'flex', justifyContent: 'center',
            alignItems: 'flex-end', position: 'relative', marginTop: '24px',
          }}>
            <div style={{
              position: 'absolute', bottom: '-30px', left: '50%',
              transform: 'translateX(-50%)',
              width: '260px', height: '100px', borderRadius: '50%',
              background: 'linear-gradient(180deg, #8a96ce 0%, #5f6bbf 100%)',
              zIndex: 0,
            }} />
            <div style={{
              position: 'relative', zIndex: 1,
              marginBottom: '20px',
              filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.25))',
            }}>
              <ShieldCheck style={{
                width: '100px', height: '100px',
                color: 'rgba(255,255,255,0.6)',
              }} />
            </div>
          </div>
        </div>

        {/* ── Right white panel ── */}
        <div style={{
          flex: 1, backgroundColor: '#ffffff',
          display: 'flex', flexDirection: 'column',
          justifyContent: 'center', padding: '48px 52px',
          position: 'relative',
        }}>

          {/* First login badge */}
          {user?.must_change_password && (
            <div style={{
              position: 'absolute', top: '22px', right: '28px',
              backgroundColor: '#fef3c7',
              border: '1px solid #fde68a',
              borderRadius: '8px', padding: '6px 12px',
              fontSize: '12px', color: '#d97706', fontWeight: 600,
            }}>
              ⚠️ First login — password change required
            </div>
          )}

          <h2 style={{
            fontSize: '28px', fontWeight: 800,
            color: '#111827', marginBottom: '8px', marginTop: 0,
          }}>
            Change password
          </h2>
          <p style={{
            fontSize: '14px', color: '#9ca3af',
            marginBottom: '36px', marginTop: 0,
          }}>
            {user?.must_change_password
              ? 'You must set a new password before continuing.'
              : 'Update your account password below.'
            }
          </p>

          <form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%' }}>

            {/* Current / temporary password */}
            <div style={{ marginBottom: '28px' }}>
              <label style={{
                display: 'block', fontSize: '14px',
                color: '#6b7280', marginBottom: '8px',
              }}>
                {user?.must_change_password
                  ? 'Temporary password:'
                  : 'Current password:'}
              </label>
              <div style={{ position: 'relative' }}>
                <Lock style={{
                  position: 'absolute', left: '0',
                  top: '50%', transform: 'translateY(-50%)',
                  width: '16px', height: '16px', color: '#9ca3af',
                }} />
                <input
                  type={showOld ? 'text' : 'password'}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '8px 36px', fontSize: '15px',
                    color: '#111827', background: 'transparent',
                    border: 'none', borderBottom: '1.5px solid #d1d5db',
                    outline: 'none',
                  }}
                  {...register('old_password', {
                    required: 'Current password is required',
                  })}
                />
                <button type="button" onClick={() => setShowOld(!showOld)}
                  style={{
                    position: 'absolute', right: '0',
                    top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none',
                    cursor: 'pointer', color: '#9ca3af',
                    display: 'flex', alignItems: 'center', padding: 0,
                  }}>
                  {showOld
                    ? <EyeOff style={{ width: '16px', height: '16px' }} />
                    : <Eye style={{ width: '16px', height: '16px' }} />}
                </button>
              </div>
              {errors.old_password && (
                <p style={errStyle}>{errors.old_password.message}</p>
              )}
            </div>

            {/* New password */}
            <div style={{ marginBottom: '28px' }}>
              <label style={{
                display: 'block', fontSize: '14px',
                color: '#6b7280', marginBottom: '8px',
              }}>
                New password:
              </label>
              <div style={{ position: 'relative' }}>
                <Lock style={{
                  position: 'absolute', left: '0',
                  top: '50%', transform: 'translateY(-50%)',
                  width: '16px', height: '16px', color: '#9ca3af',
                }} />
                <input
                  type={showNew ? 'text' : 'password'}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '8px 36px', fontSize: '15px',
                    color: '#111827', background: 'transparent',
                    border: 'none', borderBottom: '1.5px solid #d1d5db',
                    outline: 'none',
                  }}
                  {...register('new_password', {
                    required: 'New password is required',
                    minLength: { value: 8, message: 'Min 8 characters' },
                  })}
                />
                <button type="button" onClick={() => setShowNew(!showNew)}
                  style={{
                    position: 'absolute', right: '0',
                    top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none',
                    cursor: 'pointer', color: '#9ca3af',
                    display: 'flex', alignItems: 'center', padding: 0,
                  }}>
                  {showNew
                    ? <EyeOff style={{ width: '16px', height: '16px' }} />
                    : <Eye style={{ width: '16px', height: '16px' }} />}
                </button>
              </div>
              {errors.new_password && (
                <p style={errStyle}>{errors.new_password.message}</p>
              )}
            </div>

            {/* Confirm new password */}
            <div style={{ marginBottom: '40px' }}>
              <label style={{
                display: 'block', fontSize: '14px',
                color: '#6b7280', marginBottom: '8px',
              }}>
                Confirm new password:
              </label>
              <div style={{ position: 'relative' }}>
                <Lock style={{
                  position: 'absolute', left: '0',
                  top: '50%', transform: 'translateY(-50%)',
                  width: '16px', height: '16px', color: '#9ca3af',
                }} />
                <input
                  type={showNew2 ? 'text' : 'password'}
                  style={{
                    width: '100%', boxSizing: 'border-box',
                    padding: '8px 36px', fontSize: '15px',
                    color: '#111827', background: 'transparent',
                    border: 'none', borderBottom: '1.5px solid #d1d5db',
                    outline: 'none',
                  }}
                  {...register('new_password2', {
                    required: 'Please confirm your new password',
                    validate: (v) =>
                      v === newPassword || 'Passwords do not match',
                  })}
                />
                <button type="button" onClick={() => setShowNew2(!showNew2)}
                  style={{
                    position: 'absolute', right: '0',
                    top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none',
                    cursor: 'pointer', color: '#9ca3af',
                    display: 'flex', alignItems: 'center', padding: 0,
                  }}>
                  {showNew2
                    ? <EyeOff style={{ width: '16px', height: '16px' }} />
                    : <Eye style={{ width: '16px', height: '16px' }} />}
                </button>
              </div>
              {errors.new_password2 && (
                <p style={errStyle}>{errors.new_password2.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit" disabled={loading}
              style={{
                width: '100%', padding: '16px',
                backgroundColor: '#6b77c0', color: '#ffffff',
                fontWeight: 700, fontSize: '16px',
                borderRadius: '12px', border: 'none',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1,
                boxShadow: '0 4px 20px rgba(107,119,192,0.40)',
                boxSizing: 'border-box',
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: '8px',
              }}
            >
              {loading ? (
                <>
                  <span style={{
                    width: '16px', height: '16px',
                    border: '2px solid white',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                    display: 'inline-block',
                  }} />
                  Saving...
                </>
              ) : (
                <>
                  <ShieldCheck style={{ width: '18px', height: '18px' }} />
                  Set new password
                </>
              )}
            </button>

          </form>

          {!user?.must_change_password && user?.email && (
            <div style={{
              marginTop: '32px', paddingTop: '24px',
              borderTop: '1px solid #e5e7eb',
            }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#111827', margin: '0 0 16px' }}>
                Account security
              </h3>

              {/* MFA toggle */}
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: '16px',
              }}>
                <div>
                  <p style={{ margin: 0, fontSize: '14px', color: '#111827', fontWeight: 600 }}>
                    Two-factor authentication
                  </p>
                  <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
                    {isAdminRole
                      ? 'Required for admin accounts and cannot be turned off.'
                      : 'Require a one-time code emailed to you at every login.'}
                  </p>
                </div>
                <label style={{
                  position: 'relative', display: 'inline-block', width: '44px', height: '24px',
                  opacity: isAdminRole ? 0.6 : 1,
                }}>
                  <input
                    type="checkbox"
                    checked={isAdminRole ? true : !!user?.mfa_enabled}
                    disabled={mfaLoading || isAdminRole}
                    onChange={onToggleMfa}
                    style={{ opacity: 0, width: 0, height: 0 }}
                  />
                  <span style={{
                    position: 'absolute', inset: 0, borderRadius: '24px',
                    backgroundColor: (isAdminRole || user?.mfa_enabled) ? '#6b77c0' : '#d1d5db',
                    transition: 'background-color 0.2s',
                    cursor: (mfaLoading || isAdminRole) ? 'not-allowed' : 'pointer',
                  }} />
                  <span style={{
                    position: 'absolute', top: '3px',
                    left: (isAdminRole || user?.mfa_enabled) ? '23px' : '3px',
                    width: '18px', height: '18px', borderRadius: '50%',
                    backgroundColor: '#fff', transition: 'left 0.2s',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                  }} />
                </label>
              </div>

              {/* Email verification status */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MailCheck style={{
                    width: '16px', height: '16px',
                    color: user?.email_verified ? '#16a34a' : '#d97706',
                  }} />
                  <p style={{ margin: 0, fontSize: '13px', color: '#374151' }}>
                    Email {user?.email_verified ? 'verified' : 'not verified'}
                  </p>
                </div>
                {!user?.email_verified && (
                  <button
                    type="button"
                    onClick={onResendVerification}
                    disabled={resendLoading}
                    style={{
                      background: 'none', border: 'none', color: '#6b77c0',
                      fontSize: '12px', fontWeight: 600, cursor: 'pointer', padding: 0,
                    }}
                  >
                    {resendLoading ? 'Sending...' : 'Resend verification email'}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
};

export default ChangePasswordPage;