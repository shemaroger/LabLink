import React, { useEffect, useState } from 'react';
import Layout from '../../../components/layout/Layout';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import { useForm } from 'react-hook-form';
import api from '../../../api/axios';
import toast from 'react-hot-toast';
import { ArrowLeft, Save } from 'lucide-react';

const EditPatient = () => {
  const { id }                  = useParams();
  const navigate                = useNavigate();
  const { user }                = useAuth();
  const [loading, setLoading]   = useState(false);
  const [fetching, setFetching] = useState(true);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const isReceptionist = user?.role === 'receptionist';
  const basePath       = isReceptionist
    ? '/receptionist/patients'
    : '/admin/patients';

  useEffect(() => {
    api.get(`/patients/${id}/`)
      .then((res) => {
        const p = res.data;
        reset({
          date_of_birth:           p.date_of_birth || '',
          gender:                  p.gender || '',
          phone:                   p.phone || '',
          address:                 p.address || '',
          blood_group:             p.blood_group || '',
          allergies:               p.allergies || '',
          emergency_contact_name:  p.emergency_contact_name || '',
          emergency_contact_phone: p.emergency_contact_phone || '',
          insurance_provider:      p.insurance_provider || '',
          insurance_card_number:   p.insurance_card_number || '',
        });
      })
      .catch(() => toast.error('Failed to load patient.'))
      .finally(() => setFetching(false));
  }, [id, reset]);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await api.patch(`/patients/${id}/`, data);
      toast.success('Patient updated successfully.');
      navigate(`${basePath}/${id}`);
    } catch (err) {
      const errs = err.response?.data;
      if (errs) {
        Object.values(errs).forEach((m) =>
          toast.error(Array.isArray(m) ? m[0] : m)
        );
      } else {
        toast.error('Failed to update patient.');
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
    border: '1.5px solid #e5e7eb', borderRadius: '10px', outline: 'none',
  };

  const errStyle = { color: '#ef4444', fontSize: '11px', marginTop: '3px' };

  const card = {
    backgroundColor: '#ffffff', borderRadius: '16px',
    padding: '32px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    border: '1px solid #f3f4f6',
  };

  return (
    <Layout title="Edit Patient">
      <div style={{ fontFamily: 'Inter, sans-serif' }}>

        <button
          onClick={() => navigate(`${basePath}/${id}`)}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#6b7280', fontSize: '13px', fontWeight: 500,
            marginBottom: '20px', padding: 0,
          }}
        >
          <ArrowLeft style={{ width: '16px', height: '16px' }} />
          Back to patient
        </button>

        <div style={card}>
          <div style={{ marginBottom: '28px' }}>
            <h2 style={{
              fontSize: '20px', fontWeight: 700, color: '#111827', margin: 0,
            }}>
              Edit patient
            </h2>
            <p style={{
              fontSize: '13px', color: '#9ca3af', margin: 0, marginTop: '4px',
            }}>
              Update the patient's profile information.
            </p>
          </div>

          {fetching ? (
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px',
            }}>
              {[1,2,3,4,5,6,7,8].map((i) => (
                <div key={i} style={{
                  height: '44px', backgroundColor: '#f9fafb',
                  borderRadius: '10px',
                }} />
              ))}
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)}>
              <div style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px',
              }}>

                {/* Date of birth */}
                <div>
                  <label style={labelStyle}>Date of birth</label>
                  <input type="date" style={inputStyle}
                         {...register('date_of_birth',
                           { required: 'Date of birth is required' })} />
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

                {/* Phone */}
                <div>
                  <label style={labelStyle}>Phone</label>
                  <input type="text" placeholder="+250 7XX XXX XXX"
                         style={inputStyle}
                         {...register('phone',
                           { required: 'Phone is required' })} />
                  {errors.phone && (
                    <p style={errStyle}>{errors.phone.message}</p>
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
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={labelStyle}>Address</label>
                  <textarea
                    rows={2} placeholder="Physical address"
                    style={{ ...inputStyle, resize: 'none' }}
                    {...register('address')}
                  />
                </div>

                {/* Allergies */}
                <div style={{ gridColumn: 'span 2' }}>
                  <label style={labelStyle}>Allergies</label>
                  <textarea
                    rows={2} placeholder="List any known allergies"
                    style={{ ...inputStyle, resize: 'none' }}
                    {...register('allergies')}
                  />
                </div>

                {/* Emergency contact name */}
                <div>
                  <label style={labelStyle}>Emergency contact name</label>
                  <input type="text" placeholder="Full name"
                         style={inputStyle}
                         {...register('emergency_contact_name')} />
                </div>

                {/* Emergency contact phone */}
                <div>
                  <label style={labelStyle}>Emergency contact phone</label>
                  <input type="text" placeholder="+250 7XX XXX XXX"
                         style={inputStyle}
                         {...register('emergency_contact_phone')} />
                </div>

                {/* Insurance provider */}
                <div>
                  <label style={labelStyle}>Insurance provider</label>
                  <input type="text" placeholder="e.g. NHIF, AAR, Jubilee"
                         style={inputStyle}
                         {...register('insurance_provider')} />
                </div>

                {/* Insurance card number */}
                <div>
                  <label style={labelStyle}>Insurance card number</label>
                  <input type="text" placeholder="Card / membership number"
                         style={inputStyle}
                         {...register('insurance_card_number')} />
                </div>

                {/* Buttons */}
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
                          borderTopColor: 'transparent', borderRadius: '50%',
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
                    onClick={() => navigate(`${basePath}/${id}`)}
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

export default EditPatient;