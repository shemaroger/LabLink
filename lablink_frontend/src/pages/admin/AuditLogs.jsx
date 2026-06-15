import React, { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import api from '../../api/axios';
import { Search, Shield, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

// ── Action badge ──
const ActionBadge = ({ action }) => {
  const colors = {
    login:             { bg: '#dcfce7', color: '#16a34a' },
    logout:            { bg: '#f3f4f6', color: '#6b7280' },
    register:          { bg: '#dbeafe', color: '#2563eb' },
    upload_result:     { bg: '#ede9fe', color: '#7c3aed' },
    view_result:       { bg: '#cffafe', color: '#0891b2' },
    download_result:   { bg: '#e0e7ff', color: '#4338ca' },
    update_result:     { bg: '#fef9c3', color: '#ca8a04' },
    delete_result:     { bg: '#fee2e2', color: '#dc2626' },
    create_patient:    { bg: '#ccfbf1', color: '#0d9488' },
    update_patient:    { bg: '#ffedd5', color: '#ea580c' },
    delete_patient:    { bg: '#fee2e2', color: '#dc2626' },
    send_notification: { bg: '#fce7f3', color: '#db2777' },
    change_password:   { bg: '#fef3c7', color: '#d97706' },
    update_profile:    { bg: '#f0fdf4', color: '#16a34a' },
  };

  const style = colors[action] || { bg: '#f3f4f6', color: '#6b7280' };

  return (
    <span style={{
      padding: '3px 10px',
      borderRadius: '99px',
      fontSize: '11px',
      fontWeight: 600,
      textTransform: 'capitalize',
      backgroundColor: style.bg,
      color: style.color,
      whiteSpace: 'nowrap',
    }}>
      {action?.replace(/_/g, ' ')}
    </span>
  );
};

const ITEMS_PER_PAGE = 10;

const AuditLogs = () => {
  const [logs, setLogs]               = useState([]);
  const [filtered, setFiltered]       = useState([]);
  const [stats, setStats]             = useState(null);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [dateFrom, setDateFrom]       = useState('');
  const [dateTo, setDateTo]           = useState('');
  const [selected, setSelected]       = useState(null);
  const [page, setPage]               = useState(1);

  useEffect(() => {
    Promise.all([
      api.get('/audit-logs/all/'),
      api.get('/audit-logs/stats/'),
    ])
      .then(([logsRes, statsRes]) => {
        setLogs(logsRes.data);
        setFiltered(logsRes.data);
        setStats(statsRes.data);
      })
      .catch(() => toast.error('Failed to load audit logs.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let data = [...logs];
    if (search) {
      const q = search.toLowerCase();
      data = data.filter((l) =>
        l.user?.email?.toLowerCase().includes(q) ||
        l.action?.toLowerCase().includes(q) ||
        l.affected_entity?.toLowerCase().includes(q) ||
        l.description?.toLowerCase().includes(q)
      );
    }
    if (actionFilter) data = data.filter((l) => l.action === actionFilter);
    if (dateFrom) data = data.filter((l) => new Date(l.timestamp) >= new Date(dateFrom));
    if (dateTo)   data = data.filter((l) => new Date(l.timestamp) <= new Date(dateTo + 'T23:59:59'));
    setFiltered(data);
    setPage(1);
  }, [search, actionFilter, dateFrom, dateTo, logs]);

  const totalPages  = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated   = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  // ── shared styles ──
  const card = {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '20px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    border: '1px solid #f3f4f6',
  };

  const inputStyle = {
    width: '100%',
    boxSizing: 'border-box',
    padding: '9px 12px',
    fontSize: '13px',
    color: '#374151',
    backgroundColor: '#f9fafb',
    border: '1px solid #e5e7eb',
    borderRadius: '10px',
    outline: 'none',
  };

  const thStyle = {
    padding: '12px 16px',
    fontSize: '12px',
    fontWeight: 600,
    color: '#9ca3af',
    textAlign: 'left',
    backgroundColor: '#f9fafb',
    borderBottom: '1px solid #f3f4f6',
    whiteSpace: 'nowrap',
  };

  const tdStyle = {
    padding: '12px 16px',
    fontSize: '13px',
    color: '#374151',
    borderBottom: '1px solid #f9fafb',
    verticalAlign: 'middle',
  };

  return (
    <Layout title="Audit Logs">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px',
                    fontFamily: 'Inter, sans-serif' }}>

        {/* ── Stats ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '16px',
        }}>
          {[
            { label: 'Total logs',        value: stats?.total_logs        ?? '—' },
            { label: 'Today',             value: stats?.logs_today        ?? '—' },
            { label: 'Last 7 days',       value: stats?.logs_last_7_days  ?? '—' },
            { label: 'Last 30 days',      value: stats?.logs_last_30_days ?? '—' },
          ].map(({ label, value }) => (
            <div key={label} style={{ ...card, textAlign: 'center', padding: '16px' }}>
              <p style={{
                fontSize: '26px', fontWeight: 800,
                color: '#6b77c0', margin: 0, lineHeight: 1,
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

        {/* ── Filters ── */}
        <div style={card}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '12px',
          }}>
            {/* Search */}
            <div style={{ position: 'relative' }}>
              <Search style={{
                position: 'absolute', left: '10px',
                top: '50%', transform: 'translateY(-50%)',
                width: '14px', height: '14px', color: '#9ca3af',
              }} />
              <input
                type="text"
                placeholder="Search logs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ ...inputStyle, paddingLeft: '32px' }}
              />
            </div>

            {/* Action filter */}
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              style={{ ...inputStyle, color: actionFilter ? '#374151' : '#9ca3af',
                       appearance: 'none', cursor: 'pointer' }}
            >
              <option value="">All actions</option>
              <option value="login">Login</option>
              <option value="logout">Logout</option>
              <option value="register">Register</option>
              <option value="upload_result">Upload result</option>
              <option value="view_result">View result</option>
              <option value="download_result">Download result</option>
              <option value="update_result">Update result</option>
              <option value="delete_result">Delete result</option>
              <option value="create_patient">Create patient</option>
              <option value="change_password">Change password</option>
            </select>

            {/* Date from */}
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              style={inputStyle}
            />

            {/* Date to */}
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>

        {/* ── Table ── */}
        <div style={{
          ...card,
          padding: 0,
          overflow: 'hidden',
        }}>
          {loading ? (
            <div style={{ padding: '24px',
                          display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} style={{
                  height: '44px', backgroundColor: '#f9fafb',
                  borderRadius: '8px',
                }} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '64px 0', color: '#9ca3af',
            }}>
              <Shield style={{
                width: '48px', height: '48px',
                margin: '0 auto 12px', opacity: 0.3,
              }} />
              <p style={{ fontSize: '14px', fontWeight: 500, margin: 0 }}>
                No audit logs found
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={thStyle}>#</th>
                    <th style={thStyle}>User</th>
                    <th style={thStyle}>Action</th>
                    <th style={thStyle}>Entity</th>
                    <th style={thStyle}>IP Address</th>
                    <th style={thStyle}>Timestamp</th>
                    <th style={thStyle}>Details</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((log, i) => (
                    <tr
                      key={log.id}
                      style={{ transition: 'background-color 0.15s' }}
                      onMouseEnter={(e) =>
                        e.currentTarget.style.backgroundColor = '#fafafa'
                      }
                      onMouseLeave={(e) =>
                        e.currentTarget.style.backgroundColor = 'transparent'
                      }
                    >
                      <td style={{ ...tdStyle, color: '#9ca3af' }}>
                        {(page - 1) * ITEMS_PER_PAGE + i + 1}
                      </td>
                      <td style={tdStyle}>
                        <p style={{
                          fontWeight: 600, color: '#111827',
                          margin: 0, fontSize: '13px',
                        }}>
                          {log.user?.first_name} {log.user?.last_name}
                        </p>
                        <p style={{
                          fontSize: '11px', color: '#9ca3af', margin: 0,
                        }}>
                          {log.user?.email}
                        </p>
                      </td>
                      <td style={tdStyle}>
                        <ActionBadge action={log.action} />
                      </td>
                      <td style={{ ...tdStyle, textTransform: 'capitalize' }}>
                        {log.affected_entity || '—'}
                      </td>
                      <td style={{
                        ...tdStyle, fontFamily: 'monospace',
                        fontSize: '12px', color: '#9ca3af',
                      }}>
                        {log.ip_address || '—'}
                      </td>
                      <td style={{ ...tdStyle, color: '#9ca3af', fontSize: '12px' }}>
                        {log.timestamp
                          ? format(new Date(log.timestamp), 'dd MMM yyyy, HH:mm:ss')
                          : '—'}
                      </td>
                      <td style={tdStyle}>
                        <button
                          onClick={() => setSelected(log)}
                          style={{
                            padding: '6px',
                            borderRadius: '8px',
                            border: 'none',
                            backgroundColor: 'transparent',
                            cursor: 'pointer',
                            color: '#6b77c0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'background-color 0.15s',
                          }}
                          onMouseEnter={(e) =>
                            e.currentTarget.style.backgroundColor = '#eeeffa'
                          }
                          onMouseLeave={(e) =>
                            e.currentTarget.style.backgroundColor = 'transparent'
                          }
                          title="View details"
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

          {/* ── Pagination ── */}
          {!loading && filtered.length > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 20px',
              borderTop: '1px solid #f3f4f6',
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
                {' '}logs
              </p>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {/* Prev */}
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: '32px', height: '32px',
                    borderRadius: '8px', border: '1px solid #e5e7eb',
                    backgroundColor: page === 1 ? '#f9fafb' : '#ffffff',
                    color: page === 1 ? '#d1d5db' : '#374151',
                    cursor: page === 1 ? 'not-allowed' : 'pointer',
                  }}
                >
                  <ChevronLeft style={{ width: '15px', height: '15px' }} />
                </button>

                {/* Page numbers */}
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) =>
                    p === 1 || p === totalPages ||
                    (p >= page - 1 && p <= page + 1)
                  )
                  .reduce((acc, p, idx, arr) => {
                    if (idx > 0 && p - arr[idx - 1] > 1) {
                      acc.push('...');
                    }
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, idx) =>
                    p === '...' ? (
                      <span key={`dots-${idx}`} style={{
                        fontSize: '13px', color: '#9ca3af',
                        padding: '0 4px',
                      }}>
                        ...
                      </span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        style={{
                          width: '32px', height: '32px',
                          borderRadius: '8px',
                          border: p === page
                            ? '1.5px solid #6b77c0'
                            : '1px solid #e5e7eb',
                          backgroundColor: p === page ? '#6b77c0' : '#ffffff',
                          color: p === page ? '#ffffff' : '#374151',
                          fontSize: '13px', fontWeight: p === page ? 600 : 400,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {p}
                      </button>
                    )
                  )}

                {/* Next */}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: '32px', height: '32px',
                    borderRadius: '8px', border: '1px solid #e5e7eb',
                    backgroundColor: page === totalPages ? '#f9fafb' : '#ffffff',
                    color: page === totalPages ? '#d1d5db' : '#374151',
                    cursor: page === totalPages ? 'not-allowed' : 'pointer',
                  }}
                >
                  <ChevronRight style={{ width: '15px', height: '15px' }} />
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* ── Detail modal ── */}
      {selected && (
        <div style={{
          position: 'fixed', inset: 0,
          backgroundColor: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 50, padding: '16px',
        }}>
          <div style={{
            backgroundColor: '#ffffff',
            borderRadius: '20px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            width: '100%', maxWidth: '440px',
            overflow: 'hidden',
          }}>
            {/* Modal header */}
            <div style={{
              padding: '20px 24px',
              borderBottom: '1px solid #f3f4f6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <h3 style={{
                fontSize: '16px', fontWeight: 700,
                color: '#111827', margin: 0,
              }}>
                Log details
              </h3>
              <button
                onClick={() => setSelected(null)}
                style={{
                  background: 'none', border: 'none',
                  cursor: 'pointer', fontSize: '20px',
                  color: '#9ca3af', lineHeight: 1, padding: 0,
                }}
              >
                ×
              </button>
            </div>

            {/* Modal body */}
            <div style={{
              padding: '20px 24px',
              display: 'flex', flexDirection: 'column', gap: '8px',
              maxHeight: '70vh', overflowY: 'auto',
            }}>
              {[
                { label: 'User',
                  value: `${selected.user?.first_name} ${selected.user?.last_name}` },
                { label: 'Email',      value: selected.user?.email },
                { label: 'Role',       value: selected.user?.role },
                { label: 'Action',     value: selected.action?.replace(/_/g, ' ') },
                { label: 'Entity',     value: selected.affected_entity || '—' },
                { label: 'Entity ID',  value: selected.entity_id || '—' },
                { label: 'IP address', value: selected.ip_address || '—' },
                { label: 'Timestamp',
                  value: selected.timestamp
                    ? format(new Date(selected.timestamp), 'dd MMM yyyy, HH:mm:ss')
                    : '—' },
              ].map(({ label, value }) => (
                <div key={label} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  padding: '10px 12px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '8px',
                  gap: '16px',
                }}>
                  <span style={{
                    fontSize: '11px', color: '#9ca3af', flexShrink: 0,
                  }}>
                    {label}
                  </span>
                  <span style={{
                    fontSize: '13px', fontWeight: 500,
                    color: '#374151', textAlign: 'right',
                    textTransform: 'capitalize',
                  }}>
                    {value}
                  </span>
                </div>
              ))}

              {selected.description && (
                <div style={{
                  padding: '10px 12px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '8px',
                }}>
                  <p style={{
                    fontSize: '11px', color: '#9ca3af',
                    margin: 0, marginBottom: '4px',
                  }}>
                    Description
                  </p>
                  <p style={{ fontSize: '13px', color: '#374151', margin: 0 }}>
                    {selected.description}
                  </p>
                </div>
              )}

              {selected.user_agent && (
                <div style={{
                  padding: '10px 12px',
                  backgroundColor: '#f9fafb',
                  borderRadius: '8px',
                }}>
                  <p style={{
                    fontSize: '11px', color: '#9ca3af',
                    margin: 0, marginBottom: '4px',
                  }}>
                    User agent
                  </p>
                  <p style={{
                    fontSize: '11px', color: '#6b7280',
                    margin: 0, wordBreak: 'break-all',
                  }}>
                    {selected.user_agent}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </Layout>
  );
};

export default AuditLogs;