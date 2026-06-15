import React, { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import {
  Search, Users, Eye, Plus,
  ChevronLeft, ChevronRight, Edit,
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const ITEMS_PER_PAGE = 10;

const GenderBadge = ({ gender }) => {
  const styles = {
    male:   { bg: '#dbeafe', color: '#2563eb' },
    female: { bg: '#fce7f3', color: '#db2777' },
    other:  { bg: '#f3f4f6', color: '#6b7280' },
  };
  const s = styles[gender] || { bg: '#f3f4f6', color: '#6b7280' };
  return (
    <span style={{
      padding: '3px 10px', borderRadius: '99px',
      fontSize: '11px', fontWeight: 600,
      backgroundColor: s.bg, color: s.color,
      textTransform: 'capitalize', whiteSpace: 'nowrap',
    }}>
      {gender || '—'}
    </span>
  );
};

const ReceptionistPatientsList = () => {
  const navigate                        = useNavigate();
  const [patients, setPatients]         = useState([]);
  const [filtered, setFiltered]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState('');
  const [genderFilter, setGenderFilter] = useState('');
  const [page, setPage]                 = useState(1);

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
    let data = [...patients];
    if (search) {
      const q = search.toLowerCase();
      data = data.filter((p) =>
        p.full_name?.toLowerCase().includes(q) ||
        p.email?.toLowerCase().includes(q) ||
        p.phone?.includes(q)
      );
    }
    if (genderFilter) data = data.filter((p) => p.gender === genderFilter);
    setFiltered(data);
    setPage(1);
  }, [search, genderFilter, patients]);

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

  const iconBtn = (color, hoverBg) => ({
    base: {
      padding: '6px', borderRadius: '8px',
      border: 'none', backgroundColor: 'transparent',
      cursor: 'pointer', color,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
    hover: hoverBg,
  });

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
    <Layout title="Patients">
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
            {filtered.length} patient{filtered.length !== 1 ? 's' : ''} found
          </p>
          <button
            onClick={() => navigate('/receptionist/patients/create')}
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
            Register patient
          </button>
        </div>

        {/* Summary cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '14px',
        }}>
          {[
            { label: 'Total', value: patients.length,         color: '#6b77c0' },
            { label: 'Male',  value: patients.filter((p) => p.gender === 'male').length,   color: '#2563eb' },
            { label: 'Female', value: patients.filter((p) => p.gender === 'female').length, color: '#db2777' },
            { label: 'Other', value: patients.filter((p) => p.gender === 'other').length,  color: '#6b7280' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ ...card, textAlign: 'center', padding: '16px' }}>
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
                placeholder="Search by name, email or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ ...inputStyle, paddingLeft: '32px' }}
              />
            </div>
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              style={{
                ...inputStyle, width: '160px',
                appearance: 'none', cursor: 'pointer',
                color: genderFilter ? '#374151' : '#9ca3af',
              }}
            >
              <option value="">All genders</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
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
              <Users style={{
                width: '48px', height: '48px',
                margin: '0 auto 12px', opacity: 0.3,
              }} />
              <p style={{ fontSize: '14px', fontWeight: 500, margin: 0 }}>
                No patients found
              </p>
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
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={thStyle}>#</th>
                    <th style={thStyle}>Patient</th>
                    <th style={thStyle}>Phone</th>
                    <th style={thStyle}>Gender</th>
                    <th style={thStyle}>Blood group</th>
                    <th style={thStyle}>Date of birth</th>
                    <th style={thStyle}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((p, i) => (
                    <tr
                      key={p.id}
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
                          display: 'flex', alignItems: 'center', gap: '10px',
                        }}>
                          <div style={{
                            width: '34px', height: '34px',
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
                              fontWeight: 600, color: '#111827',
                              margin: 0, fontSize: '13px',
                            }}>
                              {p.full_name}
                            </p>
                            <p style={{
                              fontSize: '11px', color: '#9ca3af', margin: 0,
                            }}>
                              {p.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td style={{ ...tdStyle, color: '#6b7280' }}>
                        {p.phone || '—'}
                      </td>
                      <td style={tdStyle}>
                        <GenderBadge gender={p.gender} />
                      </td>
                      <td style={{ ...tdStyle, color: '#6b7280', fontWeight: 600 }}>
                        {p.blood_group || '—'}
                      </td>
                      <td style={{ ...tdStyle, color: '#9ca3af', fontSize: '12px' }}>
                        {p.date_of_birth
                          ? format(new Date(p.date_of_birth), 'dd MMM yyyy')
                          : '—'}
                      </td>
                      <td style={tdStyle}>
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: '2px',
                        }}>
                          <button
                            onClick={() =>
                              navigate(`/receptionist/patients/${p.id}`)
                            }
                            title="View patient"
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
                        </div>
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
                {' '}patients
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

export default ReceptionistPatientsList;