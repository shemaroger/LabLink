import React, { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import {
  Search, Activity, Eye, Plus,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const ITEMS_PER_PAGE = 10;

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

const TriageList = () => {
  const navigate                          = useNavigate();
  const [records, setRecords]             = useState([]);
  const [filtered, setFiltered]           = useState([]);
  const [loading, setLoading]             = useState(true);
  const [search, setSearch]               = useState('');
  const [urgencyFilter, setUrgencyFilter] = useState('');
  const [page, setPage]                   = useState(1);

  useEffect(() => {
    api.get('/triage/list/')
      .then((res) => {
        setRecords(res.data);
        setFiltered(res.data);
      })
      .catch(() => toast.error('Failed to load triage records.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let data = [...records];
    if (search) {
      const q = search.toLowerCase();
      data = data.filter((r) =>
        r.patient_name?.toLowerCase().includes(q) ||
        r.chief_complaint?.toLowerCase().includes(q)
      );
    }
    if (urgencyFilter) {
      data = data.filter((r) => r.urgency_level === urgencyFilter);
    }
    setFiltered(data);
    setPage(1);
  }, [search, urgencyFilter, records]);

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated  = filtered.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const card = {
    backgroundColor: '#ffffff', borderRadius: '16px',
    padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    border: '1px solid #f3f4f6',
  };

  const inputStyle = {
    width: '100%', boxSizing: 'border-box',
    padding: '9px 12px', fontSize: '13px',
    color: '#374151', backgroundColor: '#f9fafb',
    border: '1px solid #e5e7eb', borderRadius: '10px', outline: 'none',
  };

  const thStyle = {
    padding: '12px 16px', fontSize: '12px',
    fontWeight: 600, color: '#9ca3af', textAlign: 'left',
    backgroundColor: '#f9fafb', borderBottom: '1px solid #f3f4f6',
    whiteSpace: 'nowrap',
  };

  const tdStyle = {
    padding: '12px 16px', fontSize: '13px',
    color: '#374151', borderBottom: '1px solid #f9fafb',
    verticalAlign: 'middle',
  };

  const pageBtn = (active, disabled) => ({
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: '32px', height: '32px', borderRadius: '8px',
    border: active ? '1.5px solid #6b77c0' : '1px solid #e5e7eb',
    backgroundColor: active ? '#6b77c0' : disabled ? '#f9fafb' : '#ffffff',
    color: active ? '#ffffff' : disabled ? '#d1d5db' : '#374151',
    fontSize: '13px', fontWeight: active ? 600 : 400,
    cursor: disabled ? 'not-allowed' : 'pointer',
  });

  return (
    <Layout title="Triage Records">
      <div style={{
        display: 'flex', flexDirection: 'column',
        gap: '20px', fontFamily: 'Inter, sans-serif',
      }}>

        {/* Top row */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0 }}>
            {filtered.length} record{filtered.length !== 1 ? 's' : ''} found
          </p>
          <button
            onClick={() => navigate('/nurse/triage/new')}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 18px',
              backgroundColor: '#6b77c0', color: '#fff',
              fontWeight: 600, fontSize: '13px',
              borderRadius: '10px', border: 'none', cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(107,119,192,0.30)',
            }}
          >
            <Plus style={{ width: '15px', height: '15px' }} />
            New triage
          </button>
        </div>

        {/* Summary cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '14px',
        }}>
          {[
            { label: 'Total',    value: records.length,                                                color: '#6b77c0' },
            { label: 'Low',      value: records.filter((r) => r.urgency_level === 'low').length,      color: '#16a34a' },
            { label: 'Medium',   value: records.filter((r) => r.urgency_level === 'medium').length,   color: '#d97706' },
            { label: 'High',     value: records.filter((r) => r.urgency_level === 'high').length,     color: '#dc2626' },
            { label: 'Critical', value: records.filter((r) => r.urgency_level === 'critical').length, color: '#a21caf' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{
              ...card, textAlign: 'center', padding: '16px',
            }}>
              <p style={{
                fontSize: '26px', fontWeight: 800,
                color, margin: 0, lineHeight: 1,
              }}>
                {value}
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

        {/* Filters */}
        <div style={card}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
              <Search style={{
                position: 'absolute', left: '10px',
                top: '50%', transform: 'translateY(-50%)',
                width: '14px', height: '14px', color: '#9ca3af',
              }} />
              <input
                type="text"
                placeholder="Search by patient or complaint..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ ...inputStyle, paddingLeft: '32px' }}
              />
            </div>
            <select
              value={urgencyFilter}
              onChange={(e) => setUrgencyFilter(e.target.value)}
              style={{
                ...inputStyle, width: '180px',
                appearance: 'none', cursor: 'pointer',
                color: urgencyFilter ? '#374151' : '#9ca3af',
              }}
            >
              <option value="">All urgency levels</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
          {loading ? (
            <div style={{
              padding: '24px', display: 'flex',
              flexDirection: 'column', gap: '12px',
            }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} style={{
                  height: '48px', backgroundColor: '#f9fafb',
                  borderRadius: '8px',
                }} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '64px 0', color: '#9ca3af',
            }}>
              <Activity style={{
                width: '48px', height: '48px',
                margin: '0 auto 12px', opacity: 0.3,
              }} />
              <p style={{ fontSize: '14px', fontWeight: 500, margin: 0 }}>
                No triage records found
              </p>
              <button
                onClick={() => navigate('/nurse/triage/new')}
                style={{
                  marginTop: '12px', padding: '9px 18px',
                  backgroundColor: '#6b77c0', color: '#fff',
                  fontWeight: 600, fontSize: '13px',
                  borderRadius: '10px', border: 'none', cursor: 'pointer',
                }}
              >
                Create first triage
              </button>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={thStyle}>#</th>
                    <th style={thStyle}>Patient</th>
                    <th style={thStyle}>Chief complaint</th>
                    <th style={thStyle}>Temperature</th>
                    <th style={thStyle}>BP</th>
                    <th style={thStyle}>Pulse</th>
                    <th style={thStyle}>Urgency</th>
                    <th style={thStyle}>Date</th>
                    <th style={thStyle}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((r, i) => (
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
                      <td style={{ ...tdStyle, color: '#9ca3af' }}>
                        {(page - 1) * ITEMS_PER_PAGE + i + 1}
                      </td>
                      <td style={tdStyle}>
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: '8px',
                        }}>
                          <div style={{
                            width: '32px', height: '32px',
                            background: 'linear-gradient(135deg, #9ba4d4 0%, #6b77c0 100%)',
                            borderRadius: '50%', display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0,
                          }}>
                            <span style={{
                              color: 'white', fontWeight: 600, fontSize: '11px',
                            }}>
                              {r.patient_name?.[0]}
                            </span>
                          </div>
                          <span style={{ fontWeight: 600, fontSize: '13px' }}>
                            {r.patient_name}
                          </span>
                        </div>
                      </td>
                      <td style={{
                        ...tdStyle, color: '#6b7280', maxWidth: '200px',
                      }}>
                        <span style={{
                          display: 'block', overflow: 'hidden',
                          textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        }}>
                          {r.chief_complaint}
                        </span>
                      </td>
                      <td style={{ ...tdStyle, color: '#6b7280' }}>
                        {r.temperature}°C
                      </td>
                      <td style={{ ...tdStyle, color: '#6b7280' }}>
                        {r.blood_pressure}
                      </td>
                      <td style={{ ...tdStyle, color: '#6b7280' }}>
                        {r.pulse_rate} bpm
                      </td>
                      <td style={tdStyle}>
                        <UrgencyBadge level={r.urgency_level} />
                      </td>
                      <td style={{ ...tdStyle, color: '#9ca3af', fontSize: '12px' }}>
                        {r.created_at
                          ? format(new Date(r.created_at), 'dd MMM yyyy')
                          : '—'}
                      </td>
                      <td style={tdStyle}>
                        <button
                          onClick={() => navigate(`/nurse/triage/${r.id}`)}
                          title="View record"
                          style={{
                            padding: '6px', borderRadius: '8px',
                            border: 'none', backgroundColor: 'transparent',
                            cursor: 'pointer', color: '#6b77c0',
                            display: 'flex', alignItems: 'center',
                          }}
                          onMouseEnter={(e) =>
                            e.currentTarget.style.backgroundColor = '#eeeffa'
                          }
                          onMouseLeave={(e) =>
                            e.currentTarget.style.backgroundColor = 'transparent'
                          }
                        >
                          <Eye style={{ width: '15px', height: '15px' }} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && filtered.length > 0 && (
            <div style={{
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 20px', borderTop: '1px solid #f3f4f6',
            }}>
              <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0 }}>
                Showing{' '}
                <span style={{ fontWeight: 600, color: '#374151' }}>
                  {(page - 1) * ITEMS_PER_PAGE + 1}
                </span>
                {' '}–{' '}
                <span style={{ fontWeight: 600, color: '#374151' }}>
                  {Math.min(page * ITEMS_PER_PAGE, filtered.length)}
                </span>
                {' '}of{' '}
                <span style={{ fontWeight: 600, color: '#374151' }}>
                  {filtered.length}
                </span>
                {' '}records
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  style={pageBtn(false, page === 1)}
                >
                  <ChevronLeft style={{ width: '15px', height: '15px' }} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) =>
                    p === 1 || p === totalPages ||
                    (p >= page - 1 && p <= page + 1)
                  )
                  .reduce((acc, p, idx, arr) => {
                    if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, idx) =>
                    p === '...' ? (
                      <span key={`dots-${idx}`} style={{
                        fontSize: '13px', color: '#9ca3af', padding: '0 4px',
                      }}>...</span>
                    ) : (
                      <button key={p} onClick={() => setPage(p)}
                        style={pageBtn(p === page, false)}>
                        {p}
                      </button>
                    )
                  )}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  style={pageBtn(false, page === totalPages)}
                >
                  <ChevronRight style={{ width: '15px', height: '15px' }} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default TriageList;