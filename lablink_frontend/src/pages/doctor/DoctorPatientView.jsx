import React, { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Phone, Mail, Calendar,
  User, FlaskConical,
} from 'lucide-react';
import { format } from 'date-fns';
import StatusBadge from '../../components/common/StatusBadge';

const DoctorPatientView = () => {
  const { id }                = useParams();
  const navigate              = useNavigate();
  const [patient, setPatient] = useState(null);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(`/patients/${id}/`),
      api.get(`/results/list/?patient_id=${id}`),
    ])
      .then(([pRes, rRes]) => {
        setPatient(pRes.data);
        setResults(rRes.data);
      })
      .catch(() => toast.error('Failed to load patient.'))
      .finally(() => setLoading(false));
  }, [id]);

  const card = {
    backgroundColor: '#ffffff', borderRadius: '16px',
    padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    border: '1px solid #f3f4f6',
  };

  const infoRow = (Icon, label, value) => (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '14px',
      padding: '12px 16px', backgroundColor: '#f9fafb',
      borderRadius: '10px',
    }}>
      <div style={{
        width: '34px', height: '34px',
        backgroundColor: '#e0f2fe', borderRadius: '8px',
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', flexShrink: 0,
      }}>
        <Icon style={{ width: '15px', height: '15px', color: '#0891b2' }} />
      </div>
      <div>
        <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>
          {label}
        </p>
        <p style={{
          fontSize: '13px', fontWeight: 500,
          color: '#111827', margin: 0, marginTop: '1px',
          textTransform: 'capitalize',
        }}>
          {value || '—'}
        </p>
      </div>
    </div>
  );

  return (
    <Layout title="Patient Profile">
      <div style={{ fontFamily: 'Inter, sans-serif' }}>

        {/* Back button */}
        <button
          onClick={() => navigate('/doctor/patients')}
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

        {loading ? (
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px',
          }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} style={{
                height: '200px', backgroundColor: '#f9fafb',
                borderRadius: '16px',
              }} />
            ))}
          </div>
        ) : patient ? (
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            gap: '20px', alignItems: 'start',
          }}>

            {/* ── Profile card ── */}
            <div style={card}>

              {/* Avatar + name */}
              <div style={{
                display: 'flex', alignItems: 'center',
                gap: '16px', marginBottom: '20px',
              }}>
                <div style={{
                  width: '64px', height: '64px',
                  background: 'linear-gradient(135deg, #67e8f9 0%, #0891b2 100%)',
                  borderRadius: '50%', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <span style={{
                    color: 'white', fontWeight: 700, fontSize: '22px',
                  }}>
                    {patient.full_name?.[0]}
                  </span>
                </div>
                <div>
                  <h2 style={{
                    fontSize: '20px', fontWeight: 700,
                    color: '#111827', margin: 0,
                  }}>
                    {patient.full_name}
                  </h2>
                  <p style={{
                    fontSize: '13px', color: '#9ca3af',
                    margin: 0, marginTop: '2px',
                  }}>
                    {patient.email}
                  </p>
                </div>
              </div>

              {/* Info rows */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {infoRow(Phone,    'Phone',        patient.phone)}
                {infoRow(Calendar, 'Date of birth',
                  patient.date_of_birth
                    ? format(new Date(patient.date_of_birth), 'dd MMM yyyy')
                    : '—'
                )}
                {infoRow(User,     'Gender',       patient.gender)}
                {infoRow(User,     'Blood group',  patient.blood_group)}
                {infoRow(Mail,     'Address',      patient.address)}
              </div>

              {/* Allergies */}
              {patient.allergies && (
                <div style={{
                  marginTop: '12px', padding: '14px 16px',
                  backgroundColor: '#fef2f2', borderRadius: '10px',
                  border: '1px solid #fecaca',
                }}>
                  <p style={{
                    fontSize: '11px', color: '#dc2626',
                    fontWeight: 600, margin: 0, marginBottom: '4px',
                  }}>
                    ⚠️ Allergies
                  </p>
                  <p style={{ fontSize: '13px', color: '#374151', margin: 0 }}>
                    {patient.allergies}
                  </p>
                </div>
              )}

              {/* Emergency contact */}
              {patient.emergency_contact_name && (
                <div style={{
                  marginTop: '12px', padding: '14px 16px',
                  backgroundColor: '#fff8f0', borderRadius: '10px',
                  border: '1px solid #fed7aa',
                }}>
                  <p style={{
                    fontSize: '11px', color: '#ea580c',
                    fontWeight: 600, margin: 0, marginBottom: '4px',
                  }}>
                    Emergency contact
                  </p>
                  <p style={{
                    fontSize: '13px', fontWeight: 600,
                    color: '#111827', margin: 0,
                  }}>
                    {patient.emergency_contact_name}
                  </p>
                  <p style={{
                    fontSize: '12px', color: '#6b7280', margin: 0,
                  }}>
                    {patient.emergency_contact_phone}
                  </p>
                </div>
              )}
            </div>

            {/* ── Lab results ── */}
            <div style={card}>
              <div style={{
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', marginBottom: '16px',
              }}>
                <h3 style={{
                  fontSize: '15px', fontWeight: 600,
                  color: '#111827', margin: 0,
                }}>
                  Lab results
                </h3>
                <span style={{
                  fontSize: '12px', fontWeight: 600,
                  color: '#0891b2', backgroundColor: '#e0f2fe',
                  padding: '3px 10px', borderRadius: '99px',
                }}>
                  {results.length} total
                </span>
              </div>

              {results.length === 0 ? (
                <div style={{
                  textAlign: 'center', padding: '40px 0', color: '#9ca3af',
                }}>
                  <FlaskConical style={{
                    width: '40px', height: '40px',
                    margin: '0 auto 10px', opacity: 0.3,
                  }} />
                  <p style={{ fontSize: '13px', margin: 0 }}>
                    No results yet
                  </p>
                </div>
              ) : (
                <div style={{
                  display: 'flex', flexDirection: 'column', gap: '8px',
                  maxHeight: '480px', overflowY: 'auto',
                }}>
                  {results.map((r) => (
                    <div
                      key={r.id}
                      onClick={() => navigate(`/doctor/results/${r.id}`)}
                      style={{
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '12px 14px', backgroundColor: '#f9fafb',
                        borderRadius: '10px', cursor: 'pointer',
                        transition: 'background-color 0.15s',
                      }}
                      onMouseEnter={(e) =>
                        e.currentTarget.style.backgroundColor = '#e0f2fe'
                      }
                      onMouseLeave={(e) =>
                        e.currentTarget.style.backgroundColor = '#f9fafb'
                      }
                    >
                      <div>
                        <p style={{
                          fontSize: '13px', fontWeight: 600,
                          color: '#111827', margin: 0,
                        }}>
                          {r.test_name}
                        </p>
                        <p style={{
                          fontSize: '11px', color: '#9ca3af', margin: 0,
                        }}>
                          {r.test_date
                            ? format(new Date(r.test_date), 'dd MMM yyyy')
                            : '—'
                          } · {r.test_type_display}
                        </p>
                      </div>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                      }}>
                        <StatusBadge status={r.status} />
                        <span style={{
                          fontSize: '11px', color: '#0891b2', fontWeight: 600,
                        }}>
                          Review →
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        ) : (
          <div style={{
            backgroundColor: '#ffffff', borderRadius: '16px',
            padding: '64px', textAlign: 'center', color: '#9ca3af',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
            border: '1px solid #f3f4f6',
          }}>
            <User style={{
              width: '48px', height: '48px',
              margin: '0 auto 12px', opacity: 0.3,
            }} />
            <p style={{ fontSize: '15px', fontWeight: 500, margin: 0 }}>
              Patient not found
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default DoctorPatientView;