import React, { useEffect, useState } from 'react';
import Layout from '../../../components/layout/Layout';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../../../api/axios';
import toast from 'react-hot-toast';
import {
  User, Mail, Phone, UserCheck,
  ArrowLeft, Save,
} from 'lucide-react';

const EditUser = () => {
  const { id }                  = useParams();
  const navigate                = useNavigate();
  const [loading, setLoading]   = useState(false);
  const [fetching, setFetching] = useState(true);
  const {
    register, handleSubmit, reset, formState: { errors },
  } = useForm();

  useEffect(() => {
    api.get(`/users/${id}/`)
      .then((res) => {
        reset({
          first_name: res.data.first_name,
          last_name:  res.data.last_name,
          email:      res.data.email,
          phone:      res.data.phone,
          role:       res.data.role,
          is_active:  res.data.is_active ? 'true' : 'false',
        });
      })
      .catch(() => toast.error('Failed to load user.'))
      .finally(() => setFetching(false));
  }, [id, reset]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await api.patch(`/users/${id}/`, {
        ...data,
        is_active: data.is_active === 'true',
      });
      toast.success('User updated successfully.');
      navigate('/admin/users');
    } catch (err) {
      const errs = err.response?.data;
      if (errs) {
        Object.values(errs).forEach((m) =>
          toast.error(Array.isArray(m) ? m[0] : m)
        );
      } else {
        toast.error('Failed to update user.');
      }
    } finally {
      setLoading(false);
    }
  };

  const labelStyle = {
    display: 'block', fontSize: '13px',
    color: '#6b7280', marginBottom: '6px', fontWeight: 500,
  };

  const inputWrap = { position: 'relative' };

  const inputStyle = {
    width: '100%', boxSizing: 'border-box',
    padding: '11px 16px 11px 42px',
    fontSize: '14px', color: '#111827',
    backgroundColor: '#f9fafb',
    border: '1.5px solid #e5e7eb',
    borderRadius: '10px', outline: 'none',
  };

  const iconStyle = {
    position: 'absolute', left: '14px',
    top: '50%', transform: 'translateY(-50%)',
    width: '15px', height: '15px', color: '#9ca3af',
  };

  const errStyle = {
    color: '#ef4444', fontSize: '11px', marginTop: '3px',
  };

  const selectStyle = {
    width: '100%', boxSizing: 'border-box',
    padding: '11px 16px', fontSize: '14px',
    color: '#111827', backgroundColor: '#f9fafb',
    border: '1.5px solid #e5e7eb', borderRadius: '10px',
    outline: 'none', appearance: 'none', cursor: 'pointer',
  };

  const card = {
    backgroundColor: '#ffffff', borderRadius: '16px',
    padding: '32px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    border: '1px solid #f3f4f6',
  };

  return (
    <Layout title="Edit User">
      <div style={{ fontFamily: 'Inter, sans-serif' }}>

        {/* Back button */}
        <button
          onClick={() => navigate('/admin/users')}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#6b7280', fontSize: '13px', fontWeight: 500,
            marginBottom: '20px', padding: 0,
          }}
        >
          <ArrowLeft style={{ width: '16px', height: '16px' }} />
          Back to users
        </button>

        <div style={card}>

          {/* Header */}
          <div style={{ marginBottom: '28px' }}>
            <h2 style={{
              fontSize: '20px', fontWeight: 700,
              color: '#111827', margin: 0,
            }}>
              Edit user
            </h2>
            <p style={{
              fontSize: '13px', color: '#9ca3af',
              margin: 0, marginTop: '4px',
            }}>
              Update the user's information below.
            </p>
          </div>

          {fetching ? (
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr',
              gap: '20px',
            }}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} style={{
                  height: '44px', backgroundColor: '#f9fafb',
                  borderRadius: '10px',
                  gridColumn: i === 5 ? 'span 2' : 'span 1',
                }} />
              ))}
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px',
              }}>

                {/* First name */}
                <div>
                  <label style={labelStyle}>First name</label>
                  <div style={inputWrap}>
                    <User style={iconStyle} />
                    <input type="text" style={inputStyle}
                           {...register('first_name', { required: 'Required' })} />
                  </div>
                  {errors.first_name && (
                    <p style={errStyle}>{errors.first_name.message}</p>
                  )}
                </div>

                {/* Last name */}
                <div>
                  <label style={labelStyle}>Last name</label>
                  <div style={inputWrap}>
                    <User style={iconStyle} />
                    <input type="text" style={inputStyle}
                           {...register('last_name', { required: 'Required' })} />
                  </div>
                  {errors.last_name && (
                    <p style={errStyle}>{errors.last_name.message}</p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label style={labelStyle}>Email address</label>
                  <div style={inputWrap}>
                    <Mail style={iconStyle} />
                    <input type="email" style={inputStyle}
                           {...register('email', {
                             required: 'Email is required',
                             pattern: {
                               value: /^\S+@\S+\.\S+$/,
                               message: 'Enter a valid email',
                             },
                           })} />
                  </div>
                  {errors.email && (
                    <p style={errStyle}>{errors.email.message}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label style={labelStyle}>Phone</label>
                  <div style={inputWrap}>
                    <Phone style={iconStyle} />
                    <input type="text" placeholder="+254712345678" style={inputStyle}
                           {...register('phone')} />
                  </div>
                </div>

                {/* Role */}
                <div>
                  <label style={labelStyle}>Role</label>
                  <div style={inputWrap}>
                    <UserCheck style={iconStyle} />
                    <select
                      style={{
                        ...inputStyle, appearance: 'none',
                        cursor: 'pointer',
                      }}
                      {...register('role', { required: 'Please select a role' })}
                    >
                      <option value="lab_staff">Laboratory Staff</option>
                      <option value="nurse">Nurse</option>
                      <option value="doctor">Doctor</option>
                      <option value="receptionist">Receptionist</option>
                      <option value="patient">Patient</option>
                      <option value="admin">Admin</option>
                      <option value="hospital_admin">Hospital Admin</option>
                    </select>
                  </div>
                  {errors.role && (
                    <p style={errStyle}>{errors.role.message}</p>
                  )}
                </div>

                {/* Account status */}
                <div>
                  <label style={labelStyle}>Account status</label>
                  <select style={selectStyle} {...register('is_active')}>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>

                {/* Spacer */}
                <div />

                {/* Buttons */}
                <div style={{
                  gridColumn: 'span 2',
                  display: 'flex', gap: '12px',
                  paddingTop: '8px',
                }}>
                  <button
                    type="submit" disabled={loading}
                    style={{
                      flex: 1, padding: '13px',
                      backgroundColor: '#6b77c0', color: '#fff',
                      fontWeight: 700, fontSize: '14px',
                      borderRadius: '10px', border: 'none',
                      cursor: loading ? 'not-allowed' : 'pointer',
                      opacity: loading ? 0.7 : 1,
                      boxShadow: '0 4px 14px rgba(107,119,192,0.35)',
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center', gap: '8px',
                    }}
                  >
                    {loading ? (
                      <>
                        <span style={{
                          width: '14px', height: '14px',
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
                        <Save style={{ width: '15px', height: '15px' }} />
                        Save changes
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/admin/users')}
                    style={{
                      padding: '13px 32px',
                      backgroundColor: '#f9fafb', color: '#6b7280',
                      fontWeight: 600, fontSize: '14px',
                      borderRadius: '10px', border: '1px solid #e5e7eb',
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                </div>

              </div>
            </form>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </Layout>
  );
};

export default EditUser;