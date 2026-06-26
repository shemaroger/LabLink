import React, { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import { getAllResults } from '../../api/results';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import {
  Users, FileText, Shield,
  Activity, AlertCircle, FlaskConical, Download,
} from 'lucide-react';

// ── Donut chart component ──
const DonutChart = ({ data }) => {
  const size    = 180;
  const radius  = 70;
  const cx      = size / 2;
  const cy      = size / 2;
  const stroke  = 22;
  const circumference = 2 * Math.PI * radius;
  const total   = data.reduce((s, d) => s + d.count, 0);

  let offset = 0;
  const slices = data.map((d) => {
    const pct   = total > 0 ? d.count / total : 0;
    const dash  = pct * circumference;
    const gap   = circumference - dash;
    const slice = { ...d, dash, gap, offset };
    offset += dash;
    return slice;
  });

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          {/* Background ring */}
          <circle
            cx={cx} cy={cy} r={radius}
            fill="none"
            stroke="#f3f4f6"
            strokeWidth={stroke}
          />
          {slices.map((s, i) => (
            s.count > 0 && (
              <circle
                key={i}
                cx={cx} cy={cy} r={radius}
                fill="none"
                stroke={s.color}
                strokeWidth={stroke}
                strokeDasharray={`${s.dash} ${s.gap}`}
                strokeDashoffset={-s.offset}
                strokeLinecap="butt"
              />
            )
          ))}
        </svg>
        {/* Centre label */}
        <div style={{
          position: 'absolute',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
        }}>
          <p style={{
            fontSize: '26px', fontWeight: 800,
            color: '#111827', margin: 0, lineHeight: 1,
          }}>
            {total}
          </p>
          <p style={{
            fontSize: '11px', color: '#9ca3af',
            margin: 0, marginTop: '4px',
          }}>
            Total
          </p>
        </div>
      </div>

      {/* Legend */}
      <div style={{ flex: 1 }}>
        {data.map((d) => (
          <div key={d.label} style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '10px', height: '10px',
                borderRadius: '50%',
                backgroundColor: d.color,
                flexShrink: 0,
              }} />
              <span style={{ fontSize: '13px', color: '#6b7280' }}>
                {d.label}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{
                fontSize: '13px', fontWeight: 600, color: '#111827',
              }}>
                {d.count}
              </span>
              <span style={{
                fontSize: '11px', color: '#9ca3af',
                minWidth: '36px', textAlign: 'right',
              }}>
                {total > 0 ? `${Math.round((d.count / total) * 100)}%` : '0%'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Stat card ──
const StatCard = ({ icon: Icon, label, value, bg, iconColor }) => (
  <div style={{
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    border: '1px solid #f3f4f6',
  }}>
    <div style={{
      width: '40px', height: '40px',
      borderRadius: '10px',
      backgroundColor: bg,
      display: 'flex', alignItems: 'center',
      justifyContent: 'center',
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

// ── Bar chart for top actions ──
const BarChart = ({ data }) => {
  if (!data || data.length === 0) return null;
  const max = Math.max(...data.map((d) => d.count));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {data.map((item, i) => (
        <div key={item.action}>
          <div style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', marginBottom: '5px',
          }}>
            <span style={{
              fontSize: '12px', color: '#6b7280', textTransform: 'capitalize',
            }}>
              {item.action.replace(/_/g, ' ')}
            </span>
            <span style={{
              fontSize: '12px', fontWeight: 600, color: '#6b77c0',
            }}>
              {item.count}
            </span>
          </div>
          <div style={{
            width: '100%', height: '8px',
            backgroundColor: '#f3f4f6', borderRadius: '99px',
            overflow: 'hidden',
          }}>
            <div style={{
              height: '100%',
              width: `${(item.count / max) * 100}%`,
              borderRadius: '99px',
              background: `linear-gradient(90deg,
                ${['#6b77c0','#8a96ce','#5f6bbf','#9ba4d4','#7b86c8'][i % 5]}
                0%, #c5c9e8 100%)`,
              transition: 'width 0.6s ease',
            }} />
          </div>
        </div>
      ))}
    </div>
  );
};

// ── Main dashboard ──
const AdminDashboard = () => {
  const { user }              = useAuth();
  const [results, setResults] = useState([]);
  const [users, setUsers]     = useState([]);
  const [stats, setStats]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [backingUp, setBackingUp] = useState(false);

  const handleBackup = async () => {
    setBackingUp(true);
    try {
      const res = await api.get('/admin/backup/', { responseType: 'blob' });
      const match = res.headers['content-disposition']?.match(/filename="(.+)"/);
      const filename = match ? match[1] : 'lablink-backup.sql';
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Database backup downloaded.');
    } catch {
      toast.error('Failed to create database backup.');
    } finally {
      setBackingUp(false);
    }
  };

  useEffect(() => {
    Promise.all([
      getAllResults(),
      api.get('/users/list/'),
      api.get('/audit-logs/stats/'),
    ])
      .then(([resData, usersData, statsData]) => {
        setResults(resData.data);
        setUsers(usersData.data);
        setStats(statsData.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const patients    = users.filter((u) => u.role === 'patient').length;
  const labStaff    = users.filter((u) => u.role === 'lab_staff').length;
  const available   = results.filter((r) => r.status === 'available').length;
  const pending     = results.filter((r) => r.status === 'pending').length;
  const processing  = results.filter((r) => r.status === 'processing').length;
  const reviewed    = results.filter((r) => r.status === 'reviewed').length;

  const donutData = [
    { label: 'Available',  count: available,  color: '#22c55e' },
    { label: 'Pending',    count: pending,    color: '#f59e0b' },
    { label: 'Processing', count: processing, color: '#6b77c0' },
    { label: 'Reviewed',   count: reviewed,   color: '#8b5cf6' },
  ];

  const card = {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    border: '1px solid #f3f4f6',
  };

  return (
    <Layout title="Admin Dashboard">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

        {/* Welcome banner */}
        <div style={{
          background: 'linear-gradient(135deg, #7b86c8 0%, #5f6bbf 100%)',
          borderRadius: '16px',
          padding: '24px',
          color: 'white',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px',
        }}>
          <div>
            <h2 style={{
              fontSize: '20px', fontWeight: 700,
              margin: 0, display: 'flex', alignItems: 'center', gap: '8px',
            }}>
              Admin Panel — {user?.first_name} 🛡️
            </h2>
            <p style={{
              fontSize: '14px', color: 'rgba(255,255,255,0.8)',
              margin: 0, marginTop: '6px',
            }}>
              Full system overview and management controls.
            </p>
          </div>
          <button
            onClick={handleBackup}
            disabled={backingUp}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '11px 18px',
              backgroundColor: 'rgba(255,255,255,0.15)', color: '#fff',
              fontWeight: 600, fontSize: '13px',
              borderRadius: '10px', border: '1px solid rgba(255,255,255,0.3)',
              cursor: backingUp ? 'not-allowed' : 'pointer',
              opacity: backingUp ? 0.7 : 1, flexShrink: 0,
            }}
          >
            {backingUp ? (
              <span style={{
                width: '14px', height: '14px',
                border: '2px solid white',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
                display: 'inline-block',
              }} />
            ) : (
              <Download style={{ width: '15px', height: '15px' }} />
            )}
            {backingUp ? 'Backing up...' : 'Backup database'}
          </button>
        </div>

        {/* Stat cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '16px',
        }}>
          <StatCard icon={Users}       label="Total patients"
                    value={patients}
                    bg="#ede9fe" iconColor="#7c3aed" />
          <StatCard icon={Activity}    label="Lab staff"
                    value={labStaff}
                    bg="#d1fae5" iconColor="#059669" />
          <StatCard icon={FileText}    label="Total results"
                    value={results.length}
                    bg="#fef3c7" iconColor="#d97706" />
          <StatCard icon={Shield}      label="Audit logs today"
                    value={stats?.logs_today ?? '—'}
                    bg="#ede9fe" iconColor="#6b77c0" />
        </div>

        {/* Charts row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
        }}>

          {/* Donut chart */}
          <div style={card}>
            <h3 style={{
              fontSize: '15px', fontWeight: 600,
              color: '#111827', margin: 0, marginBottom: '20px',
            }}>
              Result status breakdown
            </h3>
            {loading ? (
              <div style={{
                height: '180px', backgroundColor: '#f9fafb',
                borderRadius: '12px', animation: 'pulse 1.5s infinite',
              }} />
            ) : (
              <DonutChart data={donutData} />
            )}
          </div>

          {/* Bar chart — top actions */}
          <div style={card}>
            <h3 style={{
              fontSize: '15px', fontWeight: 600,
              color: '#111827', margin: 0, marginBottom: '20px',
            }}>
              Top system actions
            </h3>
            {loading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} style={{
                    height: '36px', backgroundColor: '#f9fafb',
                    borderRadius: '8px',
                  }} />
                ))}
              </div>
            ) : !stats?.top_actions?.length ? (
              <div style={{
                textAlign: 'center', padding: '40px 0', color: '#9ca3af',
              }}>
                <AlertCircle style={{
                  width: '32px', height: '32px',
                  margin: '0 auto 8px', opacity: 0.4,
                }} />
                <p style={{ fontSize: '14px', margin: 0 }}>No activity yet</p>
              </div>
            ) : (
              <BarChart data={stats.top_actions} />
            )}
          </div>

        </div>

        {/* Summary row */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '16px',
        }}>
          {[
            { label: 'Logs today',       value: stats?.logs_today      ?? 0 },
            { label: 'Logs last 7 days', value: stats?.logs_last_7_days ?? 0 },
            { label: 'Logs last 30 days',value: stats?.logs_last_30_days ?? 0 },
          ].map(({ label, value }) => (
            <div key={label} style={{
              ...card,
              textAlign: 'center',
              padding: '20px',
            }}>
              <p style={{
                fontSize: '28px', fontWeight: 800,
                color: '#6b77c0', margin: 0,
              }}>
                {loading ? '—' : value}
              </p>
              <p style={{
                fontSize: '12px', color: '#9ca3af',
                margin: 0, marginTop: '4px',
              }}>
                {label}
              </p>
            </div>
          ))}
        </div>

      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </Layout>
  );
};

export default AdminDashboard;