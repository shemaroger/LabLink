import React, { useState } from 'react';
import Layout from '../../components/layout/Layout';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import { ArrowLeft, Save, Search } from 'lucide-react';

const TriageForm = () => {
  const navigate                            = useNavigate();
  const location                            = useLocation();
  const [loading, setLoading]               = useState(false);
  const [patients, setPatients]             = useState([]);
  const [search, setSearch]                 = useState('');
  const [selectedPatient, setSelectedPatient] = useState(
    location.state?.patientId
      ? { id: location.state.patientId, full_name: location.state.patientName }
      : null
  );
  const [searching, setSearching]           = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const handleSearch = async (e) => {
    const q = e.target.value;
    setSearch(q);
    if (q.length < 2) { setPatients([]); return; }
    setSearching(true);
    try {
      const res = await api.get(`/patients/list/?search=${q}`);
      setPatients(res.data);
    } catch {
      toast.error('Search failed.');
    } finally {
      setSearching(false);
    }
  };

  const onSubmit = async (data) => {
    if (!selectedPatient) {
      toast.error('Please select a patient first.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/triage/create/', {
        patient:          selectedPatient.id,
        temperature:      data.temperature,
        blood_pressure:   data.blood_pressure,
        pulse_rate:       data.pulse_rate,
        respiratory_rate: data.respiratory_rate,
        weight:           data.weight,
        height:           data.height,
        chief_complaint:  data.chief_complaint,
        symptoms:         data.symptoms      || '',
        urgency_level:    data.urgency_level,
        notes:            data.notes         || '',
      });
      toast.success('Triage record created successfully.');
      navigate('/nurse/triage');
    } catch (err) {
      const errs = err.response?.data;
      if (errs) {
        Object.values(errs).forEach((m) =>
          toast.error(Array.isArray(m) ? m[0] : m)
        );
      } else {
        toast.error('Failed to create triage record.');
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
    <Layout title="New Triage">
      <div style={{ fontFamily: 'Inter, sans-serif' }}>

        <button
          onClick={() => navigate('/nurse/triage')}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#6b7280', fontSize: '13px', fontWeight: 500,
            marginBottom: '20px', padding: 0,
          }}
        >
          <ArrowLeft style={{ width: '16px', height: '16px' }} />
          Back to triage
        </button>

        <div style={{
          backgroundColor: '#ffffff', borderRadius: '16px',
          padding: '32px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          border: '1px solid #f3f4f6',
        }}>

          <div style={{ marginBottom: '28px' }}>
            <h2 style={{
              fontSize: '20px', fontWeight: 700,
              color: '#111827', margin: 0,
            }}>
              New triage assessment
            </h2>
            <p style={{
              fontSize: '13px', color: '#9ca3af',
              margin: 0, marginTop: '4px',
            }}>
              Record patient vital signs and assessment details.
            </p>
          </div>

          {/* ── Patient search ── */}
          <div style={{
            marginBottom: '28px', padding: '20px',
            backgroundColor: '#eeeffa', borderRadius: '12px',
            border: '1px solid #c7caf0',
          }}>
            <label style={{ ...labelStyle, color: '#6b77c0', fontWeight: 600 }}>
              Select patient *
            </label>

            {selectedPatient ? (
              <div style={{
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px', backgroundColor: '#ffffff',
                borderRadius: '10px', border: '1.5px solid #6b77c0',
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                }}>
                  <div style={{
                    width: '36px', height: '36px',
                    background: 'linear-gradient(135deg, #9ba4d4 0%, #6b77c0 100%)',
                    borderRadius: '50%', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span style={{
                      color: 'white', fontWeight: 600, fontSize: '13px',
                    }}>
                      {selectedPatient.full_name?.[0]}
                    </span>
                  </div>
                  <div>
                    <p style={{
                      fontSize: '14px', fontWeight: 600,
                      color: '#111827', margin: 0,
                    }}>
                      {selectedPatient.full_name}
                    </p>
                    {selectedPatient.phone && (
                      <p style={{
                        fontSize: '11px', color: '#9ca3af', margin: 0,
                      }}>
                        {selectedPatient.phone}
                      </p>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPatient(null);
                    setSearch('');
                    setPatients([]);
                  }}
                  style={{
                    fontSize: '12px', color: '#dc2626',
                    background: 'none', border: 'none',
                    cursor: 'pointer', fontWeight: 600,
                  }}
                >
                  Change
                </button>
              </div>
            ) : (
              <div style={{ position: 'relative' }}>
                <Search style={{
                  position: 'absolute', left: '12px',
                  top: '50%', transform: 'translateY(-50%)',
                  width: '15px', height: '15px', color: '#9ca3af',
                  zIndex: 1,
                }} />
                <input
                  type="text"
                  placeholder="Search patient by name, email or phone..."
                  value={search}
                  onChange={handleSearch}
                  style={{
                    ...inputStyle,
                    paddingLeft: '38px',
                    backgroundColor: '#ffffff',
                  }}
                />
                {patients.length > 0 && (
                  <div style={{
                    position: 'absolute', top: '100%', left: 0, right: 0,
                    backgroundColor: '#ffffff', borderRadius: '10px',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                    border: '1px solid #e5e7eb',
                    zIndex: 10, maxHeight: '200px', overflowY: 'auto',
                    marginTop: '4px',
                  }}>
                    {patients.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => {
                          setSelectedPatient(p);
                          setSearch('');
                          setPatients([]);
                        }}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '10px',
                          padding: '10px 14px', cursor: 'pointer',
                          borderBottom: '1px solid #f3f4f6',
                          transition: 'background-color 0.1s',
                        }}
                        onMouseEnter={(e) =>
                          e.currentTarget.style.backgroundColor = '#eeeffa'
                        }
                        onMouseLeave={(e) =>
                          e.currentTarget.style.backgroundColor = 'transparent'
                        }
                      >
                        <div style={{
                          width: '32px', height: '32px',
                          background: 'linear-gradient(135deg, #9ba4d4 0%, #6b77c0 100%)',
                          borderRadius: '50%', display: 'flex',
                          alignItems: 'center', justifyContent: 'center',
                          flexShrink: 0,
                        }}>
                          <span style={{
                            color: 'white', fontWeight: 600, fontSize: '12px',
                          }}>
                            {p.full_name?.[0]}
                          </span>
                        </div>
                        <div>
                          <p style={{
                            fontSize: '13px', fontWeight: 600,
                            color: '#111827', margin: 0,
                          }}>
                            {p.full_name}
                          </p>
                          <p style={{
                            fontSize: '11px', color: '#9ca3af', margin: 0,
                          }}>
                            {p.email}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {searching && (
                  <p style={{
                    fontSize: '12px', color: '#9ca3af',
                    marginTop: '6px', margin: 0,
                  }}>
                    Searching...
                  </p>
                )}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px',
            }}>

              {sectionTitle('Vital signs')}

              {/* Temperature */}
              <div>
                <label style={labelStyle}>Temperature (°C)</label>
                <input
                  type="number" step="0.1" placeholder="e.g. 37.5"
                  style={inputStyle}
                  {...register('temperature', {
                    required: 'Required',
                    min: { value: 30, message: 'Too low' },
                    max: { value: 45, message: 'Too high' },
                  })}
                />
                {errors.temperature && (
                  <p style={errStyle}>{errors.temperature.message}</p>
                )}
              </div>

              {/* Blood pressure */}
              <div>
                <label style={labelStyle}>Blood pressure (mmHg)</label>
                <input
                  type="text" placeholder="e.g. 120/80"
                  style={inputStyle}
                  {...register('blood_pressure', {
                    required: 'Required',
                    pattern: {
                      value: /^\d{2,3}\/\d{2,3}$/,
                      message: 'Format: 120/80',
                    },
                  })}
                />
                {errors.blood_pressure && (
                  <p style={errStyle}>{errors.blood_pressure.message}</p>
                )}
              </div>

              {/* Pulse rate */}
              <div>
                <label style={labelStyle}>Pulse rate (bpm)</label>
                <input
                  type="number" placeholder="e.g. 72"
                  style={inputStyle}
                  {...register('pulse_rate', {
                    required: 'Required',
                    min: { value: 20,  message: 'Too low'  },
                    max: { value: 250, message: 'Too high' },
                  })}
                />
                {errors.pulse_rate && (
                  <p style={errStyle}>{errors.pulse_rate.message}</p>
                )}
              </div>

              {/* Respiratory rate */}
              <div>
                <label style={labelStyle}>Respiratory rate (breaths/min)</label>
                <input
                  type="number" placeholder="e.g. 16"
                  style={inputStyle}
                  {...register('respiratory_rate', {
                    required: 'Required',
                    min: { value: 5,  message: 'Too low'  },
                    max: { value: 60, message: 'Too high' },
                  })}
                />
                {errors.respiratory_rate && (
                  <p style={errStyle}>{errors.respiratory_rate.message}</p>
                )}
              </div>

              {/* Weight */}
              <div>
                <label style={labelStyle}>Weight (kg)</label>
                <input
                  type="number" step="0.1" placeholder="e.g. 70.5"
                  style={inputStyle}
                  {...register('weight', {
                    required: 'Required',
                    min: { value: 1,   message: 'Too low'  },
                    max: { value: 500, message: 'Too high' },
                  })}
                />
                {errors.weight && (
                  <p style={errStyle}>{errors.weight.message}</p>
                )}
              </div>

              {/* Height */}
              <div>
                <label style={labelStyle}>Height (cm)</label>
                <input
                  type="number" step="0.1" placeholder="e.g. 170"
                  style={inputStyle}
                  {...register('height', {
                    required: 'Required',
                    min: { value: 30,  message: 'Too low'  },
                    max: { value: 250, message: 'Too high' },
                  })}
                />
                {errors.height && (
                  <p style={errStyle}>{errors.height.message}</p>
                )}
              </div>

              {sectionTitle('Assessment')}

              {/* Chief complaint */}
              <div style={{ gridColumn: 'span 2' }}>
                <label style={labelStyle}>Chief complaint *</label>
                <textarea
                  rows={3}
                  placeholder="Main reason for the patient's visit..."
                  style={{ ...inputStyle, resize: 'none' }}
                  {...register('chief_complaint', {
                    required: 'Chief complaint is required',
                  })}
                />
                {errors.chief_complaint && (
                  <p style={errStyle}>{errors.chief_complaint.message}</p>
                )}
              </div>

              {/* Symptoms */}
              <div style={{ gridColumn: 'span 2' }}>
                <label style={labelStyle}>Additional symptoms</label>
                <textarea
                  rows={2}
                  placeholder="Any other symptoms observed..."
                  style={{ ...inputStyle, resize: 'none' }}
                  {...register('symptoms')}
                />
              </div>

              {/* Urgency level */}
              <div>
                <label style={labelStyle}>Urgency level *</label>
                <select
                  style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
                  {...register('urgency_level', {
                    required: 'Urgency level is required',
                  })}
                >
                  <option value="">Select urgency...</option>
                  <option value="low">🟢 Low — routine</option>
                  <option value="medium">🟡 Medium — needs attention</option>
                  <option value="high">🔴 High — urgent</option>
                  <option value="critical">🟣 Critical — immediate</option>
                </select>
                {errors.urgency_level && (
                  <p style={errStyle}>{errors.urgency_level.message}</p>
                )}
              </div>

              {/* Notes */}
              <div>
                <label style={labelStyle}>Nurse notes</label>
                <textarea
                  rows={3}
                  placeholder="Additional observations or notes..."
                  style={{ ...inputStyle, resize: 'none' }}
                  {...register('notes')}
                />
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
                      Save triage record
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/nurse/triage')}
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

export default TriageForm;