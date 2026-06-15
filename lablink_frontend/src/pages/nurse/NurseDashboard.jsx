import React, { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import {
  Activity, Users, AlertTriangle,
  Clock, Plus,
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const UrgencyBadge = ({ level }) => {
  const styles = {
    low:      { bg: '#dcfce7', color: '#16a34a' },
    medium:   { bg: '#fef3c7', color: '#d97706' },
    high:     { bg: '#fee2e2', color: '#dc2626' },
    critical: { bg: '#fae8ff', color: '#a21caf' },
  };
  const labels = {
    low: 'Low', medium: 'Medium',
    high: 'High', critical: 'Critical',
  };
  const s = styles[level] || { bg: '#f3f4f6', color: '#6b7280' };
  return (
    <span style={{
      padding: '3px 10px', borderRadius: '99px',
      fontSize: '11px', fontWeight: 600,
      backgroundColor: s.bg, color: s.color,
      whiteSpace: 'nowrap',
    }}>
      {labels[level] || level}
    </span>
  );
};

const NurseDashboard = () => {
  const { user }                = useAuth();
  const navigate                = useNavigate();
  const [records, setRecords]   = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/triage/list/'),
      api.get('/patients/list/'),
    ])
      .then(([tRes, pRes]) => {
        setRecords(tRes.data);
        setPatients(pRes.data);
      })
      .catch(() => toast.error('Failed to load dashboard data.'))
      .finally(() => setLoading(false));
  }, []);

  const today = records.filter((r) => {
    if (!r.created_at) return false;
    const d   = new Date(r.created_at);
    const now = new Date();
    return (
      d.getDate()     === now.getDate()   &&
      d.getMonth()    === now.getMonth()  &&
      d.getFullYear() === now.getFullYear()
    );
  }).length;

  const critical = records.filter((r) => r.urgency_level === 'critical').length;
  const high     = records.filter((r) => r.urgency_level === 'high').length;

  const card = {
    backgroundColor: '#ffffff', borderRadius: '16px',
    padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    border: '1px solid #f3f4f6',
  };

  return (
    <Layout title="Nurse Dashboard">
      <div style={{
        display: 'flex', flexDirection: 'column',
        gap: '24px', fontFamily: 'Inter, sans-serif',
      }}>

        {/* ── Welcome banner ── */}
        <div style={{
          background: 'linear-gradient(135deg, #9ba4d4 0%, #6b77c0 100%)',
          borderRadius: '16px', padding: '24px 28px',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px',
        }}>
          <div>
            <h2 style={{
              fontSize: '20px', fontWeight: 700,
              color: 'white', margin: 0,
            }}>
              Welcome, {user?.first_name} {user?.last_name} 🩺
            </h2>
            <p style={{
              fontSize: '14px', color: 'rgba(255,255,255,0.85)',
              margin: 0, marginTop: '4px',
            }}>
              Assess patients and record vital signs.
            </p>
          </div>
          <button
            onClick={() => navigate('/nurse/triage/new')}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '12px 20px',
              backgroundColor: 'white', color: '#6b77c0',
              fontWeight: 700, fontSize: '14px',
              borderRadius: '12px', border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
            }}
          >
            <Plus style={{ width: '16px', height: '16px' }} />
            New triage
          </button>
        </div>

        {/* ── Stats ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '16px',
        }}>
          {[
            {
              icon: Users,          label: 'Total patients',
              value: patients.length,
              bg: '#eeeffa', color: '#6b77c0',
            },
            {
              icon: Activity,       label: 'Total triages',
              value: records.length,
              bg: '#eeeffa', color: '#6b77c0',
            },
            {
              icon: Clock,          label: 'Triaged today',
              value: today,
              bg: '#eff6ff', color: '#2563eb',
            },
            {
              icon: AlertTriangle,  label: 'High urgency',
              value: high,
              bg: '#fff7ed', color: '#ea580c',
            },
            {
              icon: AlertTriangle,  label: 'Critical',
              value: critical,
              bg: '#fae8ff', color: '#a21caf',
            },
          ].map(({ icon: Icon, label, value, bg, color }) => (
            <div key={label} style={{ ...card, padding: '20px' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '10px',
                backgroundColor: bg, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                marginBottom: '12px',
              }}>
                <Icon style={{ width: '20px', height: '20px', color }} />
              </div>
              <p style={{
                fontSize: '26px', fontWeight: 800,
                color: '#111827', margin: 0, lineHeight: 1,
              }}>
                {value}
              </p>
              <p style={{
                fontSize: '13px', color: '#9ca3af',
                margin: 0, marginTop: '4px',
              }}>
                {label}
              </p>
            </div>
          ))}
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: '20px',
        }}>

          {/* ── Recent triage records ── */}
          <div style={card}>
            <div style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', marginBottom: '16px',
            }}>
              <h3 style={{
                fontSize: '15px', fontWeight: 600,
                color: '#111827', margin: 0,
              }}>
                Recent triages
              </h3>
              <button
                onClick={() => navigate('/nurse/triage')}
                style={{
                  fontSize: '12px', color: '#6b77c0',
                  background: 'none', border: 'none',
                  cursor: 'pointer', fontWeight: 600, padding: 0,
                }}
              >
                View all →
              </button>
            </div>

            {loading ? (
              <div style={{
                display: 'flex', flexDirection: 'column', gap: '8px',
              }}>
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} style={{
                    height: '52px', backgroundColor: '#f9fafb',
                    borderRadius: '10px',
                  }} />
                ))}
              </div>
            ) : records.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '32px 0', color: '#9ca3af',
              }}>
                <Activity style={{
                  width: '36px', height: '36px',
                  margin: '0 auto 8px', opacity: 0.3,
                }} />
                <p style={{ fontSize: '13px', margin: 0 }}>
                  No triage records yet
                </p>
                <button
                  onClick={() => navigate('/nurse/triage/new')}
                  style={{
                    marginTop: '10px', padding: '8px 16px',
                    backgroundColor: '#6b77c0', color: '#fff',
                    fontWeight: 600, fontSize: '12px',
                    borderRadius: '8px', border: 'none', cursor: 'pointer',
                  }}
                >
                  Start first triage
                </button>
              </div>
            ) : (
              <div style={{
                display: 'flex', flexDirection: 'column', gap: '8px',
                maxHeight: '320px', overflowY: 'auto',
              }}>
                {records.slice(0, 8).map((r) => (
                  <div
                    key={r.id}
                    onClick={() => navigate(`/nurse/triage/${r.id}`)}
                    style={{
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px', backgroundColor: '#f9fafb',
                      borderRadius: '10px', cursor: 'pointer',
                      transition: 'background-color 0.15s',
                    }}
                    onMouseEnter={(e) =>
                      e.currentTarget.style.backgroundColor = '#eeeffa'
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
                        {r.patient_name}
                      </p>
                      <p style={{
                        fontSize: '11px', color: '#9ca3af', margin: 0,
                      }}>
                        {r.chief_complaint?.slice(0, 40)}
                        {r.chief_complaint?.length > 40 ? '...' : ''}
                        {' · '}
                        {r.created_at
                          ? format(new Date(r.created_at), 'dd MMM yyyy')
                          : '—'}
                      </p>
                    </div>
                    <UrgencyBadge level={r.urgency_level} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Patients ── */}
          <div style={card}>
            <div style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', marginBottom: '16px',
            }}>
              <h3 style={{
                fontSize: '15px', fontWeight: 600,
                color: '#111827', margin: 0,
              }}>
                Patients
              </h3>
              <button
                onClick={() => navigate('/nurse/patients')}
                style={{
                  fontSize: '12px', color: '#6b77c0',
                  background: 'none', border: 'none',
                  cursor: 'pointer', fontWeight: 600, padding: 0,
                }}
              >
                View all →
              </button>
            </div>

            {loading ? (
              <div style={{
                display: 'flex', flexDirection: 'column', gap: '8px',
              }}>
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} style={{
                    height: '52px', backgroundColor: '#f9fafb',
                    borderRadius: '10px',
                  }} />
                ))}
              </div>
            ) : patients.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '32px 0', color: '#9ca3af',
              }}>
                <Users style={{
                  width: '36px', height: '36px',
                  margin: '0 auto 8px', opacity: 0.3,
                }} />
                <p style={{ fontSize: '13px', margin: 0 }}>
                  No patients yet
                </p>
              </div>
            ) : (
              <div style={{
                display: 'flex', flexDirection: 'column', gap: '8px',
                maxHeight: '320px', overflowY: 'auto',
              }}>
                {patients.slice(0, 8).map((p) => (
                  <div
                    key={p.id}
                    onClick={() => navigate(`/nurse/patients/${p.id}`)}
                    style={{
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 12px', backgroundColor: '#f9fafb',
                      borderRadius: '10px', cursor: 'pointer',
                      transition: 'background-color 0.15s',
                    }}
                    onMouseEnter={(e) =>
                      e.currentTarget.style.backgroundColor = '#eeeffa'
                    }
                    onMouseLeave={(e) =>
                      e.currentTarget.style.backgroundColor = '#f9fafb'
                    }
                  >
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '10px',
                    }}>
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
                          {p.gender} · {p.blood_group || '—'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate('/nurse/triage/new', {
                          state: {
                            patientId:   p.id,
                            patientName: p.full_name,
                          },
                        });
                      }}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '4px',
                        padding: '5px 10px', borderRadius: '8px',
                        border: 'none', backgroundColor: '#eeeffa',
                        color: '#6b77c0', fontSize: '11px', fontWeight: 600,
                        cursor: 'pointer', flexShrink: 0,
                      }}
                    >
                      <Plus style={{ width: '12px', height: '12px' }} />
                      Triage
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </Layout>
  );
};

export default NurseDashboard;