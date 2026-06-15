import React, { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import {
  Users, FileText, CheckCircle,
  Clock, FlaskConical, Eye,
} from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import StatusBadge from '../../components/common/StatusBadge';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from 'recharts';

const StatCard = ({ icon: Icon, label, value, bg, iconColor }) => (
  <div style={{
    backgroundColor: '#ffffff', borderRadius: '16px',
    padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    border: '1px solid #f3f4f6',
  }}>
    <div style={{
      width: '40px', height: '40px', borderRadius: '10px',
      backgroundColor: bg, display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      marginBottom: '12px',
    }}>
      <Icon style={{ width: '20px', height: '20px', color: iconColor }} />
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
);

const DoctorDashboard = () => {
  const { user }                = useAuth();
  const navigate                = useNavigate();
  const [results, setResults]   = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      api.get('/results/list/'),
      api.get('/patients/list/'),
    ])
      .then(([resData, pxData]) => {
        setResults(resData.data);
        setPatients(pxData.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const pending    = results.filter((r) => r.status === 'pending').length;
  const processing = results.filter((r) => r.status === 'processing').length;
  const available  = results.filter((r) => r.status === 'available').length;
  const reviewed   = results.filter((r) => r.status === 'reviewed').length;

  // Pie chart — result status distribution
  const pieData = [
    { name: 'Pending',    value: pending,    color: '#ea580c' },
    { name: 'Processing', value: processing, color: '#d97706' },
    { name: 'Available',  value: available,  color: '#16a34a' },
    { name: 'Reviewed',   value: reviewed,   color: '#6b77c0' },
  ].filter((d) => d.value > 0);

  // Bar chart — test types distribution
  const testTypeCounts = results.reduce((acc, r) => {
    const label = r.test_type_display || r.test_type || 'Other';
    acc[label] = (acc[label] || 0) + 1;
    return acc;
  }, {});
  const barData = Object.entries(testTypeCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 6);

  // Gender distribution
  const genderData = [
    { name: 'Male',   value: patients.filter((p) => p.gender === 'male').length,   color: '#2563eb' },
    { name: 'Female', value: patients.filter((p) => p.gender === 'female').length, color: '#db2777' },
    { name: 'Other',  value: patients.filter((p) => p.gender === 'other').length,  color: '#9ca3af' },
  ].filter((d) => d.value > 0);

  const card = {
    backgroundColor: '#ffffff', borderRadius: '16px',
    padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    border: '1px solid #f3f4f6',
  };

  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload?.length) return null;
    return (
      <div style={{
        backgroundColor: '#ffffff', borderRadius: '10px',
        padding: '10px 14px', boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
        border: '1px solid #f3f4f6', fontSize: '13px',
      }}>
        <p style={{ margin: 0, fontWeight: 600, color: '#111827' }}>
          {payload[0].name}
        </p>
        <p style={{ margin: 0, color: '#6b77c0', fontWeight: 700 }}>
          {payload[0].value}
        </p>
      </div>
    );
  };

  return (
    <Layout title="Doctor Dashboard">
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
              Welcome, Dr. {user?.first_name} {user?.last_name} 🩺
            </h2>
            <p style={{
              fontSize: '14px', color: 'rgba(255,255,255,0.85)',
              margin: 0, marginTop: '4px',
            }}>
              Review patient results and manage consultations.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => navigate('/doctor/patients')}
              style={{
                padding: '10px 18px',
                backgroundColor: 'rgba(255,255,255,0.2)',
                color: 'white', fontWeight: 600, fontSize: '13px',
                borderRadius: '10px', border: '1px solid rgba(255,255,255,0.3)',
                cursor: 'pointer',
              }}
            >
              Patients
            </button>
            <button
              onClick={() => navigate('/doctor/results')}
              style={{
                padding: '10px 18px',
                backgroundColor: 'white', color: '#6b77c0',
                fontWeight: 700, fontSize: '13px',
                borderRadius: '10px', border: 'none',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
              }}
            >
              Lab results
            </button>
          </div>
        </div>

        {/* ── Stats ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '16px',
        }}>
          <StatCard
            icon={Users}       label="Total patients"
            value={patients.length}
            bg="#eeeffa"       iconColor="#6b77c0"
          />
          <StatCard
            icon={FileText}    label="Total results"
            value={results.length}
            bg="#fef3c7"       iconColor="#d97706"
          />
          <StatCard
            icon={Clock}       label="Pending"
            value={pending}
            bg="#fff7ed"       iconColor="#ea580c"
          />
          <StatCard
            icon={CheckCircle} label="Available"
            value={available}
            bg="#dcfce7"       iconColor="#16a34a"
          />
          <StatCard
            icon={FlaskConical} label="Reviewed"
            value={reviewed}
            bg="#eeeffa"       iconColor="#6b77c0"
          />
        </div>

        {/* ── Charts row ── */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
          gap: '20px',
        }}>

          {/* Result status pie */}
          <div style={card}>
            <h3 style={{
              fontSize: '14px', fontWeight: 600,
              color: '#111827', margin: 0, marginBottom: '16px',
            }}>
              Results by status
            </h3>
            {pieData.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '32px 0', color: '#9ca3af',
              }}>
                <p style={{ fontSize: '13px', margin: 0 }}>No data yet</p>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{
                  display: 'flex', flexDirection: 'column', gap: '6px',
                  marginTop: '8px',
                }}>
                  {pieData.map((d) => (
                    <div key={d.name} style={{
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'space-between',
                    }}>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                      }}>
                        <div style={{
                          width: '8px', height: '8px',
                          borderRadius: '50%', backgroundColor: d.color,
                          flexShrink: 0,
                        }} />
                        <span style={{ fontSize: '12px', color: '#6b7280' }}>
                          {d.name}
                        </span>
                      </div>
                      <span style={{
                        fontSize: '12px', fontWeight: 600, color: '#111827',
                      }}>
                        {d.value}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Patient gender pie */}
          <div style={card}>
            <h3 style={{
              fontSize: '14px', fontWeight: 600,
              color: '#111827', margin: 0, marginBottom: '16px',
            }}>
              Patients by gender
            </h3>
            {genderData.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '32px 0', color: '#9ca3af',
              }}>
                <p style={{ fontSize: '13px', margin: 0 }}>No data yet</p>
              </div>
            ) : (
              <>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={genderData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {genderData.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{
                  display: 'flex', flexDirection: 'column', gap: '6px',
                  marginTop: '8px',
                }}>
                  {genderData.map((d) => (
                    <div key={d.name} style={{
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'space-between',
                    }}>
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                      }}>
                        <div style={{
                          width: '8px', height: '8px',
                          borderRadius: '50%', backgroundColor: d.color,
                          flexShrink: 0,
                        }} />
                        <span style={{ fontSize: '12px', color: '#6b7280' }}>
                          {d.name}
                        </span>
                      </div>
                      <span style={{
                        fontSize: '12px', fontWeight: 600, color: '#111827',
                      }}>
                        {d.value}
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Test types bar */}
          <div style={card}>
            <h3 style={{
              fontSize: '14px', fontWeight: 600,
              color: '#111827', margin: 0, marginBottom: '16px',
            }}>
              Top test types
            </h3>
            {barData.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '32px 0', color: '#9ca3af',
              }}>
                <p style={{ fontSize: '13px', margin: 0 }}>No data yet</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={barData}
                  layout="vertical"
                  margin={{ top: 0, right: 10, bottom: 0, left: 10 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                    stroke="#f3f4f6"
                  />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                    axisLine={false}
                    tickLine={false}
                    allowDecimals={false}
                  />
                  <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fontSize: 10, fill: '#6b7280' }}
                    axisLine={false}
                    tickLine={false}
                    width={80}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    dataKey="count"
                    fill="#6b77c0"
                    radius={[0, 6, 6, 0]}
                    name="Tests"
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>

        </div>

        {/* ── Bottom row ── */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: '20px',
        }}>

          {/* Available for review */}
          <div style={card}>
            <div style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', marginBottom: '16px',
            }}>
              <h3 style={{
                fontSize: '15px', fontWeight: 600,
                color: '#111827', margin: 0,
              }}>
                Available for review
              </h3>
              <button
                onClick={() => navigate('/doctor/results')}
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
                {[1, 2, 3].map((i) => (
                  <div key={i} style={{
                    height: '52px', backgroundColor: '#f9fafb',
                    borderRadius: '8px',
                  }} />
                ))}
              </div>
            ) : results.filter((r) => r.status === 'available').length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '32px 0', color: '#9ca3af',
              }}>
                <FlaskConical style={{
                  width: '36px', height: '36px',
                  margin: '0 auto 8px', opacity: 0.3,
                }} />
                <p style={{ fontSize: '13px', margin: 0 }}>
                  No results awaiting review
                </p>
              </div>
            ) : (
              <div style={{
                display: 'flex', flexDirection: 'column', gap: '8px',
                maxHeight: '280px', overflowY: 'auto',
              }}>
                {results
                  .filter((r) => r.status === 'available')
                  .slice(0, 6)
                  .map((r) => (
                    <div
                      key={r.id}
                      onClick={() => navigate(`/doctor/results/${r.id}`)}
                      style={{
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 12px', backgroundColor: '#eeeffa',
                        borderRadius: '10px', cursor: 'pointer',
                        border: '1px solid #c7caf0',
                        transition: 'background-color 0.15s',
                      }}
                      onMouseEnter={(e) =>
                        e.currentTarget.style.backgroundColor = '#c7caf0'
                      }
                      onMouseLeave={(e) =>
                        e.currentTarget.style.backgroundColor = '#eeeffa'
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
                          {r.patient?.full_name} ·{' '}
                          {r.test_date
                            ? format(new Date(r.test_date), 'dd MMM yyyy')
                            : '—'}
                        </p>
                      </div>
                      <Eye style={{
                        width: '15px', height: '15px', color: '#6b77c0',
                      }} />
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Recent patients */}
          <div style={card}>
            <div style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between', marginBottom: '16px',
            }}>
              <h3 style={{
                fontSize: '15px', fontWeight: 600,
                color: '#111827', margin: 0,
              }}>
                Recent patients
              </h3>
              <button
                onClick={() => navigate('/doctor/patients')}
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
                {[1, 2, 3].map((i) => (
                  <div key={i} style={{
                    height: '52px', backgroundColor: '#f9fafb',
                    borderRadius: '8px',
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
                <p style={{ fontSize: '13px', margin: 0 }}>No patients yet</p>
              </div>
            ) : (
              <div style={{
                display: 'flex', flexDirection: 'column', gap: '8px',
                maxHeight: '280px', overflowY: 'auto',
              }}>
                {patients.slice(0, 6).map((p) => (
                  <div
                    key={p.id}
                    onClick={() => navigate(`/doctor/patients/${p.id}`)}
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
                    <Eye style={{
                      width: '15px', height: '15px', color: '#6b77c0',
                    }} />
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

export default DoctorDashboard;