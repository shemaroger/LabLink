import React, { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Save, Stethoscope,
  FileText, User,
} from 'lucide-react';
import { format } from 'date-fns';

const ConsultationForm = () => {
  const { id }                          = useParams();
  const navigate                        = useNavigate();
  const [loading, setLoading]           = useState(false);
  const [patient, setPatient]           = useState(null);
  const [latestTriage, setLatestTriage] = useState(null);
  const [fetching, setFetching]         = useState(true);

  const {
    register, handleSubmit, setValue, formState: { errors },
  } = useForm();

  useEffect(() => {
    if (!id) return;
    Promise.all([
      api.get(`/patients/${id}/`),
      api.get(`/triage/list/?patient_id=${id}`),
    ])
      .then(([pRes, tRes]) => {
        setPatient(pRes.data);
        const triage = tRes.data?.[0] || null;
        setLatestTriage(triage);
        if (triage?.chief_complaint) {
          setValue('chief_complaint', triage.chief_complaint);
        }
      })
      .catch(() => toast.error('Failed to load patient data.'))
      .finally(() => setFetching(false));
  }, [id, setValue]);

  const onSubmit = async (data) => {
    if (!id || id === 'undefined') {
      toast.error('Invalid patient ID.');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        patient:              Number(id),
        chief_complaint:      data.chief_complaint,
        history_of_illness:   data.history_of_illness    || '',
        physical_examination: data.physical_examination  || '',
        diagnosis:            data.diagnosis,
        diagnosis_type:       data.diagnosis_type,
        treatment_plan:       data.treatment_plan        || '',
        prescriptions:        data.prescriptions         || '',
        lab_tests_ordered:    data.lab_tests_ordered     || '',
        follow_up_date:       data.follow_up_date        || null,
        notes:                data.notes                 || '',
      };

      console.log('Submitting consultation payload:', payload);

      const res = await api.post('/consultations/create/', payload);

      console.log('Consultation response:', res.data);
      console.log('Consultation ID:', res.data.id);

      if (!res.data.id) {
        toast.error('Consultation saved but ID missing. Check API response.');
        return;
      }

      toast.success('Consultation saved successfully.');
      navigate(`/doctor/consultations/${res.data.id}`);
    } catch (err) {
      const errs = err.response?.data;
      if (errs) {
        Object.values(errs).forEach((m) =>
          toast.error(Array.isArray(m) ? m[0] : m)
        );
      } else {
        toast.error('Failed to save consultation.');
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
    <Layout title="New Consultation">
      <div style={{ fontFamily: 'Inter, sans-serif' }}>

        <button
          onClick={() => navigate(`/doctor/patients/${id}`)}
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

        {/* Patient info banner */}
        {patient && (
          <div style={{
            backgroundColor: '#eeeffa',
            border: '1px solid #c7caf0',
            borderRadius: '12px', padding: '16px 20px',
            marginBottom: '20px',
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{
                width: '44px', height: '44px',
                background: 'linear-gradient(135deg, #9ba4d4 0%, #6b77c0 100%)',
                borderRadius: '50%', display: 'flex',
                alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <span style={{
                  color: 'white', fontWeight: 700, fontSize: '16px',
                }}>
                  {patient.full_name?.[0]}
                </span>
              </div>
              <div>
                <p style={{
                  fontSize: '15px', fontWeight: 700,
                  color: '#111827', margin: 0,
                }}>
                  {patient.full_name}
                </p>
                <p style={{
                  fontSize: '12px', color: '#6b7280', margin: 0,
                }}>
                  {patient.gender} ·{' '}
                  {patient.date_of_birth
                    ? format(new Date(patient.date_of_birth), 'dd MMM yyyy')
                    : '—'}{' '}
                  · Blood group: {patient.blood_group || '—'}
                </p>
              </div>
            </div>
            {patient.allergies && (
              <div style={{
                padding: '8px 14px', backgroundColor: '#fef2f2',
                borderRadius: '8px', border: '1px solid #fecaca',
              }}>
                <p style={{
                  fontSize: '12px', color: '#dc2626',
                  fontWeight: 600, margin: 0,
                }}>
                  ⚠️ Allergies: {patient.allergies}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Latest triage summary */}
        {latestTriage && (
          <div style={{
            backgroundColor: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '12px', padding: '16px 20px',
            marginBottom: '20px',
          }}>
            <p style={{
              fontSize: '12px', fontWeight: 600, color: '#6b77c0',
              margin: 0, marginBottom: '10px',
              textTransform: 'uppercase', letterSpacing: '0.05em',
            }}>
              Latest triage vitals
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {[
                { label: 'Temp',   value: `${latestTriage.temperature}°C`        },
                { label: 'BP',     value: latestTriage.blood_pressure             },
                { label: 'Pulse',  value: `${latestTriage.pulse_rate} bpm`       },
                { label: 'Resp',   value: `${latestTriage.respiratory_rate}/min` },
                { label: 'Weight', value: `${latestTriage.weight} kg`            },
                { label: 'Height', value: `${latestTriage.height} cm`            },
              ].map(({ label, value }) => (
                <div key={label} style={{
                  padding: '8px 12px', backgroundColor: '#ffffff',
                  borderRadius: '8px', border: '1px solid #e5e7eb',
                  textAlign: 'center',
                }}>
                  <p style={{
                    fontSize: '10px', color: '#9ca3af',
                    margin: 0, fontWeight: 500,
                  }}>
                    {label}
                  </p>
                  <p style={{
                    fontSize: '13px', fontWeight: 700,
                    color: '#111827', margin: 0,
                  }}>
                    {value}
                  </p>
                </div>
              ))}
              <div style={{
                padding: '8px 12px', backgroundColor: '#ffffff',
                borderRadius: '8px', border: '1px solid #e5e7eb',
                textAlign: 'center',
              }}>
                <p style={{
                  fontSize: '10px', color: '#9ca3af',
                  margin: 0, fontWeight: 500,
                }}>
                  Urgency
                </p>
                <p style={{
                  fontSize: '13px', fontWeight: 700,
                  color:
                    latestTriage.urgency_level === 'critical' ? '#a21caf' :
                    latestTriage.urgency_level === 'high'     ? '#dc2626' :
                    latestTriage.urgency_level === 'medium'   ? '#d97706' : '#16a34a',
                  margin: 0, textTransform: 'capitalize',
                }}>
                  {latestTriage.urgency_level}
                </p>
              </div>
            </div>
          </div>
        )}

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
              New consultation
            </h2>
            <p style={{
              fontSize: '13px', color: '#9ca3af',
              margin: 0, marginTop: '4px',
            }}>
              Record consultation findings, diagnosis and treatment plan.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px',
            }}>

              {sectionTitle('Patient assessment')}

              {/* Chief complaint */}
              <div style={{ gridColumn: 'span 2' }}>
                <label style={labelStyle}>Chief complaint *</label>
                <textarea
                  rows={2}
                  placeholder="Main reason for the visit..."
                  style={{ ...inputStyle, resize: 'none' }}
                  {...register('chief_complaint', {
                    required: 'Chief complaint is required',
                  })}
                />
                {errors.chief_complaint && (
                  <p style={errStyle}>{errors.chief_complaint.message}</p>
                )}
              </div>

              {/* History of illness */}
              <div style={{ gridColumn: 'span 2' }}>
                <label style={labelStyle}>History of present illness</label>
                <textarea
                  rows={3}
                  placeholder="Onset, duration, progression, associated symptoms..."
                  style={{ ...inputStyle, resize: 'none' }}
                  {...register('history_of_illness')}
                />
              </div>

              {/* Physical examination */}
              <div style={{ gridColumn: 'span 2' }}>
                <label style={labelStyle}>Physical examination findings</label>
                <textarea
                  rows={3}
                  placeholder="General appearance, systemic examination findings..."
                  style={{ ...inputStyle, resize: 'none' }}
                  {...register('physical_examination')}
                />
              </div>

              {sectionTitle('Diagnosis')}

              {/* Diagnosis */}
              <div style={{ gridColumn: 'span 2' }}>
                <label style={labelStyle}>Diagnosis *</label>
                <textarea
                  rows={2}
                  placeholder="Enter diagnosis or provisional diagnosis..."
                  style={{ ...inputStyle, resize: 'none' }}
                  {...register('diagnosis', {
                    required: 'Diagnosis is required',
                  })}
                />
                {errors.diagnosis && (
                  <p style={errStyle}>{errors.diagnosis.message}</p>
                )}
              </div>

              {/* Diagnosis type */}
              <div>
                <label style={labelStyle}>Diagnosis type *</label>
                <select
                  style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
                  {...register('diagnosis_type', {
                    required: 'Diagnosis type is required',
                  })}
                >
                  <option value="">Select type...</option>
                  <option value="provisional">Provisional diagnosis</option>
                  <option value="confirmed">Confirmed diagnosis</option>
                  <option value="referred">Referred</option>
                  <option value="follow_up">Follow-up required</option>
                </select>
                {errors.diagnosis_type && (
                  <p style={errStyle}>{errors.diagnosis_type.message}</p>
                )}
              </div>

              {/* Follow-up date */}
              <div>
                <label style={labelStyle}>Follow-up date</label>
                <input
                  type="date"
                  style={inputStyle}
                  {...register('follow_up_date')}
                />
              </div>

              {sectionTitle('Treatment plan')}

              {/* Treatment plan */}
              <div style={{ gridColumn: 'span 2' }}>
                <label style={labelStyle}>Treatment plan</label>
                <textarea
                  rows={3}
                  placeholder="Proposed treatment, interventions, referrals..."
                  style={{ ...inputStyle, resize: 'none' }}
                  {...register('treatment_plan')}
                />
              </div>

              {/* Prescriptions */}
              <div style={{ gridColumn: 'span 2' }}>
                <label style={labelStyle}>Prescriptions</label>
                <textarea
                  rows={3}
                  placeholder="Medications, dosages, duration..."
                  style={{ ...inputStyle, resize: 'none' }}
                  {...register('prescriptions')}
                />
              </div>

              {/* Lab tests ordered */}
              <div style={{ gridColumn: 'span 2' }}>
                <label style={labelStyle}>Lab tests ordered</label>
                <textarea
                  rows={2}
                  placeholder="List any lab tests ordered for this visit..."
                  style={{ ...inputStyle, resize: 'none' }}
                  {...register('lab_tests_ordered')}
                />
              </div>

              {/* Notes */}
              <div style={{ gridColumn: 'span 2' }}>
                <label style={labelStyle}>Additional notes</label>
                <textarea
                  rows={2}
                  placeholder="Any other observations or notes..."
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
                  type="submit" disabled={loading || fetching}
                  style={{
                    flex: 1, padding: '13px',
                    backgroundColor: '#6b77c0', color: '#fff',
                    fontWeight: 700, fontSize: '14px',
                    borderRadius: '10px', border: 'none',
                    cursor: loading || fetching ? 'not-allowed' : 'pointer',
                    opacity: loading || fetching ? 0.7 : 1,
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
                      Save consultation
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => navigate(`/doctor/patients/${id}`)}
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

export default ConsultationForm;