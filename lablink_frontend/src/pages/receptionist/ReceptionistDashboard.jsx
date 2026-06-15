import React, { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import {
  Users, UserPlus, Search,
  Calendar, Phone, Eye,
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const ReceptionistDashboard = () => {
  const { user }                = useAuth();
  const navigate                = useNavigate();
  const [patients, setPatients] = useState([]);
  const [search, setSearch]     = useState('');
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    api.get('/patients/list/')
      .then((res) => {
        setPatients(res.data);
        setFiltered(res.data);
      })
      .catch(() => toast.error('Failed to load patients.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!search) {
      setFiltered(patients);
      return;
    }
    const q = search.toLowerCase();
    setFiltered(patients.filter((p) =>
      p.full_name?.toLowerCase().includes(q) ||
      p.email?.toLowerCase().includes(q) ||
      p.phone?.includes(q)
    ));
  }, [search, patients]);

  const today = patients.filter((p) => {
    if (!p.registered_at) return false;
    const d = new Date(p.registered_at);
    const now = new Date();
    return (
      d.getDate()     === now.getDate() &&
      d.getMonth()    === now.getMonth() &&
      d.getFullYear() === now.getFullYear()
    );
  }).length;

  const card = {
    backgroundColor: '#ffffff', borderRadius: '16px',
    padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    border: '1px solid #f3f4f6',
  };

  return (
    <Layout title="Reception Dashboard">
      <div style={{
        display: 'flex', flexDirection: 'column',
        gap: '24px', fontFamily: 'Inter, sans-serif',
      }}>

        {/* ── Welcome banner ── */}
        <div style={{
          background: 'linear-gradient(135deg, #7b86c8 0%, #6b77c0 100%)',
          borderRadius: '16px', padding: '24px 28px',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px',
        }}>
          <div>
            <h2 style={{
              fontSize: '20px', fontWeight: 700,
              color: 'white', margin: 0,
            }}>
              Welcome, {user?.first_name} {user?.last_name} 🏥
            </h2>
            <p style={{
              fontSize: '14px', color: 'rgba(255,255,255,0.8)',
              margin: 0, marginTop: '4px',
            }}>
              Register new patients and manage patient records.
            </p>
          </div>
          <button
            onClick={() => navigate('/receptionist/patients/create')}
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
            <UserPlus style={{ width: '16px', height: '16px' }} />
            Register new patient
          </button>
        </div>

        {/* ── Stats ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px',
        }}>
          {[
            {
              icon: Users, label: 'Total patients',
              value: patients.length,
              bg: '#eeeffa', color: '#6b77c0',
            },
            {
              icon: UserPlus, label: 'Registered today',
              value: today,
              bg: '#dcfce7', color: '#16a34a',
            },
            {
              icon: Users, label: 'Male patients',
              value: patients.filter((p) => p.gender === 'male').length,
              bg: '#dbeafe', color: '#2563eb',
            },
            {
              icon: Users, label: 'Female patients',
              value: patients.filter((p) => p.gender === 'female').length,
              bg: '#fce7f3', color: '#db2777',
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

        {/* ── Search + Patient list ── */}
        <div style={card}>

          {/* Header */}
          <div style={{
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px', flexWrap: 'wrap', gap: '12px',
          }}>
            <h3 style={{
              fontSize: '15px', fontWeight: 600,
              color: '#111827', margin: 0,
            }}>
              Patient records
            </h3>
            <button
              onClick={() => navigate('/receptionist/patients')}
              style={{
                fontSize: '12px', color: '#6b77c0',
                background: 'none', border: 'none',
                cursor: 'pointer', fontWeight: 600, padding: 0,
              }}
            >
              View all →
            </button>
          </div>

          {/* Search */}
          <div style={{ position: 'relative', marginBottom: '16px' }}>
            <Search style={{
              position: 'absolute', left: '12px',
              top: '50%', transform: 'translateY(-50%)',
              width: '15px', height: '15px', color: '#9ca3af',
            }} />
            <input
              type="text"
              placeholder="Search by name, email or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: '100%', boxSizing: 'border-box',
                padding: '10px 14px 10px 38px',
                fontSize: '13px', color: '#374151',
                backgroundColor: '#f9fafb',
                border: '1px solid #e5e7eb',
                borderRadius: '10px', outline: 'none',
              }}
            />
          </div>

          {/* List */}
          {loading ? (
            <div style={{
              display: 'flex', flexDirection: 'column', gap: '10px',
            }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} style={{
                  height: '52px', backgroundColor: '#f9fafb',
                  borderRadius: '10px',
                }} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '40px 0', color: '#9ca3af',
            }}>
              <Users style={{
                width: '40px', height: '40px',
                margin: '0 auto 10px', opacity: 0.3,
              }} />
              <p style={{ fontSize: '13px', margin: 0 }}>
                {search ? 'No patients match your search' : 'No patients registered yet'}
              </p>
              {!search && (
                <button
                  onClick={() => navigate('/receptionist/patients/create')}
                  style={{
                    marginTop: '12px', padding: '9px 18px',
                    backgroundColor: '#6b77c0', color: '#fff',
                    fontWeight: 600, fontSize: '13px',
                    borderRadius: '10px', border: 'none', cursor: 'pointer',
                  }}
                >
                  Register first patient
                </button>
              )}
            </div>
          ) : (
            <div style={{
              display: 'flex', flexDirection: 'column', gap: '8px',
              maxHeight: '420px', overflowY: 'auto',
            }}>
              {filtered.slice(0, 10).map((p) => (
                <div
                  key={p.id}
                  style={{
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 14px', backgroundColor: '#f9fafb',
                    borderRadius: '10px',
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
                    display: 'flex', alignItems: 'center', gap: '12px',
                  }}>
                    {/* Avatar */}
                    <div style={{
                      width: '38px', height: '38px',
                      background: 'linear-gradient(135deg, #9ba4d4 0%, #6b77c0 100%)',
                      borderRadius: '50%', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <span style={{
                        color: 'white', fontWeight: 600, fontSize: '13px',
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
                      <div style={{
                        display: 'flex', alignItems: 'center',
                        gap: '12px', marginTop: '2px',
                      }}>
                        {p.phone && (
                          <span style={{
                            display: 'flex', alignItems: 'center',
                            gap: '3px', fontSize: '11px', color: '#9ca3af',
                          }}>
                            <Phone style={{ width: '10px', height: '10px' }} />
                            {p.phone}
                          </span>
                        )}
                        {p.registered_at && (
                          <span style={{
                            display: 'flex', alignItems: 'center',
                            gap: '3px', fontSize: '11px', color: '#9ca3af',
                          }}>
                            <Calendar style={{ width: '10px', height: '10px' }} />
                            {format(new Date(p.registered_at), 'dd MMM yyyy')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <button
                    onClick={() => navigate(`/receptionist/patients/${p.id}`)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '4px',
                      padding: '6px 12px', borderRadius: '8px',
                      border: 'none', backgroundColor: '#eeeffa',
                      color: '#6b77c0', fontSize: '12px', fontWeight: 600,
                      cursor: 'pointer',
                    }}
                  >
                    <Eye style={{ width: '13px', height: '13px' }} />
                    View
                  </button>
                </div>
              ))}

              {filtered.length > 10 && (
                <button
                  onClick={() => navigate('/receptionist/patients')}
                  style={{
                    padding: '10px', borderRadius: '10px',
                    border: '1px dashed #e5e7eb',
                    backgroundColor: 'transparent', color: '#9ca3af',
                    fontSize: '13px', cursor: 'pointer',
                    fontWeight: 500,
                  }}
                >
                  View all {filtered.length} patients →
                </button>
              )}
            </div>
          )}
        </div>

      </div>
    </Layout>
  );
};

export default ReceptionistDashboard;