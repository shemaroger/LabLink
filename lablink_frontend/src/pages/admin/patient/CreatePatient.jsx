import React, { useState } from 'react';
import Layout from '../../../components/layout/Layout';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useForm } from 'react-hook-form';
import api from '../../../api/axios';
import toast from 'react-hot-toast';
import { ArrowLeft, Save, User, Phone, Mail, Send, CreditCard } from 'lucide-react';

const CreatePatient = () => {
  const navigate              = useNavigate();
  const { user }              = useAuth();
  const [loading, setLoading] = useState(false);
  const {
    register, handleSubmit, formState: { errors },
  } = useForm();

  const isReceptionist = user?.role === 'receptionist';
  const backPath       = isReceptionist
    ? '/receptionist/patients'
    : '/admin/patients';

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await api.post('/patients/admin-create/', {
        first_name:              data.first_name,
        last_name:               data.last_name,
        email:                   data.email,
        date_of_birth:           data.date_of_birth,
        gender:                  data.gender,
        phone:                   data.phone,
        address:                 data.address                || '',
        blood_group:             data.blood_group            || '',
        allergies:               data.allergies              || '',
        emergency_contact_name:  data.emergency_contact_name  || '',
        emergency_contact_phone: data.emergency_contact_phone || '',
        insurance_provider:      data.insurance_provider      || '',
        insurance_card_number:   data.insurance_card_number   || '',
      });
      toast.success(
        isReceptionist
          ? 'Patient registered. Welcome email sent.'
          : 'Patient created. Welcome email sent.'
      );
      navigate(backPath);
    } catch (err) {
      const errs = err.response?.data;
      if (errs) {
        Object.values(errs).forEach((m) =>
          toast.error(Array.isArray(m) ? m[0] : m)
        );
      } else {
        toast.error('Failed to create patient.');
      }
    } finally {
      setLoading(false);
    }
  };

  const labelStyle = {
    display: 'block', fontSize: '13px',
    color: '#6b7280', marginBottom: '6px', fontWeight: 500,
  };

  const inputStyle = {
    width: '100%', boxSizing: 'border-box',
    padding: '11px 14px', fontSize: '14px',
    color: '#111827', backgroundColor: '#f9fafb',
    border: '1.5px solid #e5e7eb',
    borderRadius: '10px', outline: 'none',
    transition: 'border-color 0.15s',
  };

  const inputWithIconStyle = { ...inputStyle, paddingLeft: '42px' };

  const iconStyle = {
    position: 'absolute', left: '14px',
    top: '50%', transform: 'translateY(-50%)',
    width: '15px', height: '15px', color: '#9ca3af',
  };

  const errStyle = {
    color: '#ef4444', fontSize: '11px', marginTop: '3px',
  };

  const sectionTitle = (title) => (
    <div style={{
      gridColumn: 'span 2',
      borderBottom: '1px solid #f3f4f6',
      paddingBottom: '8px', marginBottom: '4px',
    }}>
      <p style={{
        fontSize: '13px', fontWeight: 600, color: '#6b77c0',
        margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em',
      }}>
        {title}
      </p>
    </div>
  );

  return (
    <Layout title={isReceptionist ? 'Register Patient' : 'Create Patient'}>
      <div style={{ fontFamily: 'Inter, sans-serif' }}>

        {/* Back button */}
        <button
          onClick={() => navigate(backPath)}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#6b7280', fontSize: '13px', fontWeight: 500,
            marginBottom: '20px', padding: 0,
          }}
        >
          <ArrowLeft style={{ width: '16px', height: '16px' }} />
          Back to patients
        </button>

        <div style={{
          backgroundColor: '#ffffff', borderRadius: '16px',
          padding: '32px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          border: '1px solid #f3f4f6',
        }}>

          {/* Header */}
          <div style={{ marginBottom: '28px' }}>
            <h2 style={{
              fontSize: '20px', fontWeight: 700,
              color: '#111827', margin: 0,
            }}>
              {isReceptionist ? 'Register new patient' : 'Create new patient'}
            </h2>
            <p style={{
              fontSize: '13px', color: '#9ca3af',
              margin: 0, marginTop: '4px',
            }}>
              Fill in the patient's details. A temporary password will
              be generated and sent to their email automatically.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px',
            }}>

              {/* ── Email info banner ── */}
              <div style={{
                gridColumn: 'span 2',
                backgroundColor: '#eff6ff',
                border: '1px solid #bfdbfe',
                borderRadius: '10px',
                padding: '12px 16px',
                display: 'flex', alignItems: 'flex-start', gap: '10px',
                marginBottom: '4px',
              }}>
                <Send style={{
                  width: '16px', height: '16px',
                  color: '#2563eb', flexShrink: 0, marginTop: '1px',
                }} />
                <p style={{
                  fontSize: '13px', color: '#1e40af',
                  margin: 0, lineHeight: 1.5,
                }}>
                  A temporary password will be auto-generated and sent
                  to the patient's email. They will be required to
                  change it on first login.
                </p>
              </div>

              {/* ── Account information ── */}
              {sectionTitle('Account information')}

              {/* First name */}
              <div>
                <label style={labelStyle}>First name</label>
                <div style={{ position: 'relative' }}>
                  <User style={iconStyle} />
                  <input
                    type="text" placeholder="John"
                    style={inputWithIconStyle}
                    {...register('first_name', { required: 'Required' })}
                  />
                </div>
                {errors.first_name && (
                  <p style={errStyle}>{errors.first_name.message}</p>
                )}
              </div>

              {/* Last name */}
              <div>
                <label style={labelStyle}>Last name</label>
                <div style={{ position: 'relative' }}>
                  <User style={iconStyle} />
                  <input
                    type="text" placeholder="Doe"
                    style={inputWithIconStyle}
                    {...register('last_name', { required: 'Required' })}
                  />
                </div>
                {errors.last_name && (
                  <p style={errStyle}>{errors.last_name.message}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label style={labelStyle}>Email address</label>
                <div style={{ position: 'relative' }}>
                  <Mail style={iconStyle} />
                  <input
                    type="email" placeholder="patient@example.com"
                    style={inputWithIconStyle}
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^\S+@\S+\.\S+$/,
                        message: 'Enter a valid email',
                      },
                    })}
                  />
                </div>
                {errors.email && (
                  <p style={errStyle}>{errors.email.message}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label style={labelStyle}>Phone</label>
                <div style={{ position: 'relative' }}>
                  <Phone style={iconStyle} />
                  <input
                    type="text" placeholder="+250 7XX XXX XXX"
                    style={inputWithIconStyle}
                    {...register('phone', { required: 'Phone is required' })}
                  />
                </div>
                {errors.phone && (
                  <p style={errStyle}>{errors.phone.message}</p>
                )}
              </div>

              {/* ── Profile information ── */}
              {sectionTitle('Profile information')}

              {/* Date of birth */}
              <div>
                <label style={labelStyle}>Date of birth</label>
                <input
                  type="date" style={inputStyle}
                  {...register('date_of_birth', {
                    required: 'Date of birth is required',
                  })}
                />
                {errors.date_of_birth && (
                  <p style={errStyle}>{errors.date_of_birth.message}</p>
                )}
              </div>

              {/* Gender */}
              <div>
                <label style={labelStyle}>Gender</label>
                <select
                  style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
                  {...register('gender', { required: 'Gender is required' })}
                >
                  <option value="">Select gender...</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
                {errors.gender && (
                  <p style={errStyle}>{errors.gender.message}</p>
                )}
              </div>

              {/* Blood group */}
              <div>
                <label style={labelStyle}>Blood group</label>
                <select
                  style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
                  {...register('blood_group')}
                >
                  <option value="">Select blood group...</option>
                  {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map((bg) => (
                    <option key={bg} value={bg}>{bg}</option>
                  ))}
                </select>
              </div>

              {/* Address */}
              <div>
                <label style={labelStyle}>Address</label>
                <input
                  type="text" placeholder="Physical address"
                  style={inputStyle}
                  {...register('address')}
                />
              </div>

              {/* Allergies — full width */}
              <div style={{ gridColumn: 'span 2' }}>
                <label style={labelStyle}>Allergies</label>
                <textarea
                  rows={2}
                  placeholder="List any known allergies (or leave blank)"
                  style={{ ...inputStyle, resize: 'none' }}
                  {...register('allergies')}
                />
              </div>

              {/* ── Emergency contact ── */}
              {sectionTitle('Emergency contact')}

              {/* Emergency contact name */}
              <div>
                <label style={labelStyle}>Contact name</label>
                <input
                  type="text" placeholder="Full name"
                  style={inputStyle}
                  {...register('emergency_contact_name')}
                />
              </div>

              {/* Emergency contact phone */}
              <div>
                <label style={labelStyle}>Contact phone</label>
                <input
                  type="text" placeholder="+250 7XX XXX XXX"
                  style={inputStyle}
                  {...register('emergency_contact_phone')}
                />
              </div>

              {/* ── Insurance ── */}
              {sectionTitle('Insurance (optional)')}

              {/* Insurance provider */}
              <div>
                <label style={labelStyle}>Insurance provider</label>
                <input
                  type="text" placeholder="e.g. NHIF, AAR, Jubilee"
                  style={inputStyle}
                  {...register('insurance_provider')}
                />
              </div>

              {/* Insurance card number */}
              <div>
                <label style={labelStyle}>Insurance card number</label>
                <div style={{ position: 'relative' }}>
                  <CreditCard style={iconStyle} />
                  <input
                    type="text" placeholder="Card / membership number"
                    style={inputWithIconStyle}
                    {...register('insurance_card_number')}
                  />
                </div>
              </div>

              {/* ── Buttons ── */}
              <div style={{
                gridColumn: 'span 2',
                display: 'flex', gap: '12px', paddingTop: '8px',
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
                      {isReceptionist ? 'Registering...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <Send style={{ width: '15px', height: '15px' }} />
                      {isReceptionist
                        ? 'Register & send welcome email'
                        : 'Create & send welcome email'}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => navigate(backPath)}
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
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </Layout>
  );
};

export default CreatePatient;