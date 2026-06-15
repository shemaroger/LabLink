import React, { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import StatusBadge from '../../components/common/StatusBadge';
import api from '../../api/axios';
import { useAuth } from '../../context/AuthContext';
import {
  FileText, Users, Clock,
  CheckCircle, Upload, FlaskConical,
} from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const StaffDashboard = () => {
  const { user }                = useAuth();
  const navigate                = useNavigate();
  const [results, setResults]   = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    api.get('/results/list/')
      .then((res) => setResults(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const pending    = results.filter((r) => r.status === 'pending').length;
  const available  = results.filter((r) => r.status === 'available').length;
  const processing = results.filter((r) => r.status === 'processing').length;

  const card = {
    backgroundColor: '#ffffff', borderRadius: '16px',
    padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    border: '1px solid #f3f4f6',
  };

  return (
    <Layout title="Staff Dashboard">
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
              Welcome, {user?.first_name} {user?.last_name} 🔬
            </h2>
            <p style={{
              fontSize: '14px', color: 'rgba(255,255,255,0.85)',
              margin: 0, marginTop: '4px',
            }}>
              Manage and upload laboratory results for your patients.
            </p>
          </div>
          <button
            onClick={() => navigate('/staff/upload')}
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
            <Upload style={{ width: '16px', height: '16px' }} />
            Upload result
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
              icon: FileText,    label: 'Total results',
              value: results.length,
              bg: '#eeeffa', color: '#6b77c0',
            },
            {
              icon: Clock,       label: 'Pending',
              value: pending,
              bg: '#fff7ed', color: '#ea580c',
            },
            {
              icon: FlaskConical, label: 'Processing',
              value: processing,
              bg: '#fef3c7', color: '#d97706',
            },
            {
              icon: CheckCircle, label: 'Available',
              value: available,
              bg: '#dcfce7', color: '#16a34a',
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

        {/* ── Quick actions ── */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px',
        }}>
          <div
            onClick={() => navigate('/staff/upload')}
            style={{
              ...card, display: 'flex', alignItems: 'center',
              gap: '16px', cursor: 'pointer',
              transition: 'box-shadow 0.15s',
            }}
            onMouseEnter={(e) =>
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(107,119,192,0.20)'
            }
            onMouseLeave={(e) =>
              e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'
            }
          >
            <div style={{
              width: '48px', height: '48px',
              backgroundColor: '#eeeffa', borderRadius: '12px',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', flexShrink: 0,
            }}>
              <Upload style={{ width: '22px', height: '22px', color: '#6b77c0' }} />
            </div>
            <div>
              <p style={{
                fontWeight: 600, color: '#111827',
                margin: 0, fontSize: '14px',
              }}>
                Upload result
              </p>
              <p style={{
                fontSize: '13px', color: '#9ca3af', margin: 0, marginTop: '2px',
              }}>
                Upload a new lab result for a patient
              </p>
            </div>
          </div>

          <div
            onClick={() => navigate('/staff/patients')}
            style={{
              ...card, display: 'flex', alignItems: 'center',
              gap: '16px', cursor: 'pointer',
              transition: 'box-shadow 0.15s',
            }}
            onMouseEnter={(e) =>
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(107,119,192,0.20)'
            }
            onMouseLeave={(e) =>
              e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)'
            }
          >
            <div style={{
              width: '48px', height: '48px',
              backgroundColor: '#eeeffa', borderRadius: '12px',
              display: 'flex', alignItems: 'center',
              justifyContent: 'center', flexShrink: 0,
            }}>
              <Users style={{ width: '22px', height: '22px', color: '#6b77c0' }} />
            </div>
            <div>
              <p style={{
                fontWeight: 600, color: '#111827',
                margin: 0, fontSize: '14px',
              }}>
                View patients
              </p>
              <p style={{
                fontSize: '13px', color: '#9ca3af', margin: 0, marginTop: '2px',
              }}>
                Browse and search patient records
              </p>
            </div>
          </div>
        </div>

        {/* ── Recent results table ── */}
        <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
          <div style={{
            padding: '20px', borderBottom: '1px solid #f3f4f6',
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <h3 style={{
              fontSize: '15px', fontWeight: 600,
              color: '#111827', margin: 0,
            }}>
              Recent results
            </h3>
            <span style={{
              fontSize: '12px', fontWeight: 600,
              color: '#6b77c0', backgroundColor: '#eeeffa',
              padding: '3px 10px', borderRadius: '99px',
            }}>
              {results.length} total
            </span>
          </div>

          {loading ? (
            <div style={{
              padding: '24px', display: 'flex',
              flexDirection: 'column', gap: '12px',
            }}>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} style={{
                  height: '48px', backgroundColor: '#f9fafb',
                  borderRadius: '8px',
                }} />
              ))}
            </div>
          ) : results.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '48px 0', color: '#9ca3af',
            }}>
              <FlaskConical style={{
                width: '40px', height: '40px',
                margin: '0 auto 10px', opacity: 0.3,
              }} />
              <p style={{ fontSize: '13px', margin: 0 }}>
                No results uploaded yet
              </p>
              <button
                onClick={() => navigate('/staff/upload')}
                style={{
                  marginTop: '12px', padding: '9px 18px',
                  backgroundColor: '#6b77c0', color: '#fff',
                  fontWeight: 600, fontSize: '13px',
                  borderRadius: '10px', border: 'none', cursor: 'pointer',
                }}
              >
                Upload first result
              </button>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Patient', 'Test name', 'Type', 'Date', 'Status'].map((h) => (
                      <th key={h} style={{
                        padding: '12px 16px', fontSize: '12px',
                        fontWeight: 600, color: '#9ca3af', textAlign: 'left',
                        backgroundColor: '#f9fafb',
                        borderBottom: '1px solid #f3f4f6',
                        whiteSpace: 'nowrap',
                      }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.slice(0, 8).map((r) => (
                    <tr
                      key={r.id}
                      onMouseEnter={(e) =>
                        e.currentTarget.style.backgroundColor = '#fafafa'
                      }
                      onMouseLeave={(e) =>
                        e.currentTarget.style.backgroundColor = 'transparent'
                      }
                      style={{ transition: 'background-color 0.15s' }}
                    >
                      {/* Patient */}
                      <td style={{
                        padding: '12px 16px', borderBottom: '1px solid #f9fafb',
                        verticalAlign: 'middle',
                      }}>
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: '8px',
                        }}>
                          <div style={{
                            width: '30px', height: '30px',
                            background: 'linear-gradient(135deg, #9ba4d4 0%, #6b77c0 100%)',
                            borderRadius: '50%', display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0,
                          }}>
                            <span style={{
                              color: 'white', fontWeight: 600, fontSize: '11px',
                            }}>
                              {r.patient?.full_name?.[0]}
                            </span>
                          </div>
                          <span style={{
                            fontSize: '13px', fontWeight: 600, color: '#111827',
                          }}>
                            {r.patient?.full_name || '—'}
                          </span>
                        </div>
                      </td>

                      {/* Test name */}
                      <td style={{
                        padding: '12px 16px', fontSize: '13px',
                        fontWeight: 500, color: '#374151',
                        borderBottom: '1px solid #f9fafb',
                        verticalAlign: 'middle',
                      }}>
                        {r.test_name}
                      </td>

                      {/* Type */}
                      <td style={{
                        padding: '12px 16px', fontSize: '13px',
                        color: '#6b7280', borderBottom: '1px solid #f9fafb',
                        verticalAlign: 'middle',
                      }}>
                        {r.test_type_display || r.test_type || '—'}
                      </td>

                      {/* Date */}
                      <td style={{
                        padding: '12px 16px', fontSize: '12px',
                        color: '#9ca3af', borderBottom: '1px solid #f9fafb',
                        verticalAlign: 'middle', whiteSpace: 'nowrap',
                      }}>
                        {r.test_date
                          ? format(new Date(r.test_date), 'dd MMM yyyy')
                          : '—'}
                      </td>

                      {/* Status */}
                      <td style={{
                        padding: '12px 16px',
                        borderBottom: '1px solid #f9fafb',
                        verticalAlign: 'middle',
                      }}>
                        <StatusBadge status={r.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </Layout>
  );
};

export default StaffDashboard;