import React, { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import {
  Search, FlaskConical, Eye,
  ChevronLeft, ChevronRight,
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import StatusBadge from '../../components/common/StatusBadge';

const ITEMS_PER_PAGE = 10;

const DoctorResultsList = () => {
  const navigate                        = useNavigate();
  const [results, setResults]           = useState([]);
  const [filtered, setFiltered]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage]                 = useState(1);

  useEffect(() => {
    api.get('/results/list/')
      .then((res) => {
        setResults(res.data);
        setFiltered(res.data);
      })
      .catch(() => toast.error('Failed to load results.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let data = [...results];
    if (search) {
      const q = search.toLowerCase();
      data = data.filter((r) =>
        r.test_name?.toLowerCase().includes(q) ||
        r.patient?.full_name?.toLowerCase().includes(q) ||
        r.test_type_display?.toLowerCase().includes(q)
      );
    }
    if (statusFilter) data = data.filter((r) => r.status === statusFilter);
    setFiltered(data);
    setPage(1);
  }, [search, statusFilter, results]);

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
    <Layout title="Lab Results">
      <div style={{
        display: 'flex', flexDirection: 'column',
        gap: '20px', fontFamily: 'Inter, sans-serif',
      }}>

        {/* ── Summary cards ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '14px',
        }}>
          {[
            { label: 'Total',
              value: results.length,
              color: '#6b77c0' },
            { label: 'Pending',
              value: results.filter((r) => r.status === 'pending').length,
              color: '#ea580c' },
            { label: 'Processing',
              value: results.filter((r) => r.status === 'processing').length,
              color: '#d97706' },
            { label: 'Available',
              value: results.filter((r) => r.status === 'available').length,
              color: '#16a34a' },
            { label: 'Reviewed',
              value: results.filter((r) => r.status === 'reviewed').length,
              color: '#7c3aed' },
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

        {/* ── Filters ── */}
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
                placeholder="Search by test name or patient..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ ...inputStyle, paddingLeft: '32px' }}
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              style={{
                ...inputStyle, width: '160px',
                appearance: 'none', cursor: 'pointer',
                color: statusFilter ? '#374151' : '#9ca3af',
              }}
            >
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="available">Available</option>
              <option value="reviewed">Reviewed</option>
            </select>
          </div>
        </div>

        {/* ── Table ── */}
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
              <FlaskConical style={{
                width: '48px', height: '48px',
                margin: '0 auto 12px', opacity: 0.3,
              }} />
              <p style={{ fontSize: '14px', fontWeight: 500, margin: 0 }}>
                No results found
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={thStyle}>#</th>
                    <th style={thStyle}>Patient</th>
                    <th style={thStyle}>Test name</th>
                    <th style={thStyle}>Type</th>
                    <th style={thStyle}>Test date</th>
                    <th style={thStyle}>Status</th>
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

                      {/* Patient */}
                      <td style={tdStyle}>
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
                          <div>
                            <p style={{
                              fontWeight: 600, color: '#111827',
                              margin: 0, fontSize: '13px',
                            }}>
                              {r.patient?.full_name}
                            </p>
                            <p style={{
                              fontSize: '11px', color: '#9ca3af', margin: 0,
                            }}>
                              {r.patient?.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Test name */}
                      <td style={{ ...tdStyle, fontWeight: 500 }}>
                        {r.test_name}
                      </td>

                      {/* Type */}
                      <td style={{ ...tdStyle, color: '#6b7280' }}>
                        {r.test_type_display}
                      </td>

                      {/* Test date */}
                      <td style={{ ...tdStyle, color: '#9ca3af', fontSize: '12px' }}>
                        {r.test_date
                          ? format(new Date(r.test_date), 'dd MMM yyyy')
                          : '—'}
                      </td>

                      {/* Status */}
                      <td style={tdStyle}>
                        <StatusBadge status={r.status} />
                      </td>

                      {/* Actions */}
                      <td style={tdStyle}>
                        <button
                          onClick={() => navigate(`/doctor/results/${r.id}`)}
                          title="Review result"
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
                {' '}results
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

export default DoctorResultsList;