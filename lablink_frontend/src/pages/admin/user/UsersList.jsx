import React, { useEffect, useState } from 'react';
import Layout from '../../../components/layout/Layout';
import { useNavigate } from 'react-router-dom';
import api from '../../../api/axios';
import {
  Search, Users, Eye,
  UserCheck, UserX, Plus,
  ChevronLeft, ChevronRight, Edit,
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const ITEMS_PER_PAGE = 10;

const RoleBadge = ({ role }) => {
  const styles = {
    patient:        { bg: '#dbeafe', color: '#2563eb' },
    lab_staff:      { bg: '#dcfce7', color: '#16a34a' },
    admin:          { bg: '#ede9fe', color: '#7c3aed' },
    hospital_admin: { bg: '#fee2e2', color: '#dc2626' },
  };
  const labels = {
    patient: 'Patient', lab_staff: 'Lab Staff', admin: 'Admin',
    hospital_admin: 'Hospital Admin',
  };
  const s = styles[role] || { bg: '#f3f4f6', color: '#6b7280' };
  return (
    <span style={{
      padding: '3px 10px', borderRadius: '99px',
      fontSize: '11px', fontWeight: 600,
      backgroundColor: s.bg, color: s.color,
      whiteSpace: 'nowrap',
    }}>
      {labels[role] || role}
    </span>
  );
};

const UsersList = () => {
  const navigate                    = useNavigate();
  const [users, setUsers]           = useState([]);
  const [filtered, setFiltered]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [selected, setSelected]     = useState(null);
  const [page, setPage]             = useState(1);

  useEffect(() => {
    api.get('/users/list/')
      .then((res) => {
        setUsers(res.data);
        setFiltered(res.data);
      })
      .catch(() => toast.error('Failed to load users.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let data = [...users];
    if (search) {
      const q = search.toLowerCase();
      data = data.filter((u) =>
        u.first_name?.toLowerCase().includes(q) ||
        u.last_name?.toLowerCase().includes(q) ||
        u.email?.toLowerCase().includes(q)
      );
    }
    if (roleFilter) data = data.filter((u) => u.role === roleFilter);
    setFiltered(data);
    setPage(1);
  }, [search, roleFilter, users]);

  const handleToggleActive = async (user) => {
    try {
      await api.patch(`/users/${user.id}/`, { is_active: !user.is_active });
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, is_active: !u.is_active } : u
        )
      );
      toast.success(
        `User ${user.is_active ? 'deactivated' : 'activated'} successfully.`
      );
    } catch {
      toast.error('Failed to update user status.');
    }
  };

  const counts = {
    all:       users.length,
    patient:        users.filter((u) => u.role === 'patient').length,
    lab_staff:      users.filter((u) => u.role === 'lab_staff').length,
    admin:          users.filter((u) => u.role === 'admin').length,
    hospital_admin: users.filter((u) => u.role === 'hospital_admin').length,
  };

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
    border: '1px solid #e5e7eb', borderRadius: '10px',
    outline: 'none',
  };

  const thStyle = {
    padding: '12px 16px', fontSize: '12px',
    fontWeight: 600, color: '#9ca3af',
    textAlign: 'left', backgroundColor: '#f9fafb',
    borderBottom: '1px solid #f3f4f6', whiteSpace: 'nowrap',
  };

  const tdStyle = {
    padding: '12px 16px', fontSize: '13px',
    color: '#374151', borderBottom: '1px solid #f9fafb',
    verticalAlign: 'middle',
  };

  const iconBtn = (color) => ({
    padding: '6px', borderRadius: '8px',
    border: 'none', backgroundColor: 'transparent',
    cursor: 'pointer', color,
    display: 'flex', alignItems: 'center',
    justifyContent: 'center',
  });

  const pageBtn = (active, disabled) => ({
    display: 'flex', alignItems: 'center',
    justifyContent: 'center',
    width: '32px', height: '32px',
    borderRadius: '8px',
    border: active ? '1.5px solid #6b77c0' : '1px solid #e5e7eb',
    backgroundColor: active ? '#6b77c0' : disabled ? '#f9fafb' : '#ffffff',
    color: active ? '#ffffff' : disabled ? '#d1d5db' : '#374151',
    fontSize: '13px', fontWeight: active ? 600 : 400,
    cursor: disabled ? 'not-allowed' : 'pointer',
  });

  return (
    <Layout title="Users">
      <div style={{
        display: 'flex', flexDirection: 'column',
        gap: '20px', fontFamily: 'Inter, sans-serif',
      }}>

        {/* ── Top row: title + create button ── */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <p style={{
            fontSize: '13px', color: '#9ca3af', margin: 0,
          }}>
            {filtered.length} user{filtered.length !== 1 ? 's' : ''} found
          </p>
          <button
            onClick={() => navigate('/admin/users/create')}
            style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '10px 18px',
              backgroundColor: '#6b77c0', color: '#fff',
              fontWeight: 600, fontSize: '13px',
              borderRadius: '10px', border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(107,119,192,0.30)',
            }}
          >
            <Plus style={{ width: '15px', height: '15px' }} />
            Create user
          </button>
        </div>

        {/* ── Summary cards ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '14px',
        }}>
          {[
            { label: 'Total users', value: counts.all,       color: '#6b7280' },
            { label: 'Patients',    value: counts.patient,   color: '#2563eb' },
            { label: 'Lab staff',   value: counts.lab_staff, color: '#16a34a' },
            { label: 'Admins',      value: counts.admin,     color: '#7c3aed' },
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
            <div style={{
              position: 'relative', flex: 1, minWidth: '200px',
            }}>
              <Search style={{
                position: 'absolute', left: '10px',
                top: '50%', transform: 'translateY(-50%)',
                width: '14px', height: '14px', color: '#9ca3af',
              }} />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ ...inputStyle, paddingLeft: '32px' }}
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              style={{
                ...inputStyle, width: '160px',
                appearance: 'none', cursor: 'pointer',
                color: roleFilter ? '#374151' : '#9ca3af',
              }}
            >
              <option value="">All roles</option>
              <option value="patient">Patient</option>
              <option value="lab_staff">Lab Staff</option>
              <option value="nurse">Nurse</option>
              <option value="doctor">Doctor</option>
              <option value="receptionist">Receptionist</option>
              <option value="admin">Admin</option>
              <option value="hospital_admin">Hospital Admin</option>
            </select>
          </div>
        </div>

        {/* ── Table ── */}
        <div style={{ ...card, padding: 0, overflow: 'hidden' }}>
          {loading ? (
            <div style={{
              padding: '24px',
              display: 'flex', flexDirection: 'column', gap: '12px',
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
              <p style={{
                fontSize: '14px', fontWeight: 500, margin: 0,
              }}>
                No users found
              </p>
              <button
                onClick={() => navigate('/admin/users/create')}
                style={{
                  marginTop: '12px',
                  padding: '9px 18px',
                  backgroundColor: '#6b77c0', color: '#fff',
                  fontWeight: 600, fontSize: '13px',
                  borderRadius: '10px', border: 'none', cursor: 'pointer',
                }}
              >
                Create first user
              </button>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={thStyle}>#</th>
                    <th style={thStyle}>User</th>
                    <th style={thStyle}>Role</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Joined</th>
                    <th style={thStyle}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((u, i) => (
                    <tr
                      key={u.id}
                      onMouseEnter={(e) =>
                        e.currentTarget.style.backgroundColor = '#fafafa'
                      }
                      onMouseLeave={(e) =>
                        e.currentTarget.style.backgroundColor = 'transparent'
                      }
                      style={{ transition: 'background-color 0.15s' }}
                    >
                      {/* # */}
                      <td style={{ ...tdStyle, color: '#9ca3af' }}>
                        {(page - 1) * ITEMS_PER_PAGE + i + 1}
                      </td>

                      {/* User */}
                      <td style={tdStyle}>
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: '10px',
                        }}>
                          <div style={{
                            width: '34px', height: '34px',
                            background: 'linear-gradient(135deg, #9ba4d4 0%, #6b77c0 100%)',
                            borderRadius: '50%',
                            display: 'flex', alignItems: 'center',
                            justifyContent: 'center', flexShrink: 0,
                          }}>
                            <span style={{
                              color: 'white', fontWeight: 600, fontSize: '12px',
                            }}>
                              {u.first_name?.[0]}{u.last_name?.[0]}
                            </span>
                          </div>
                          <div>
                            <p style={{
                              fontWeight: 600, color: '#111827',
                              margin: 0, fontSize: '13px',
                            }}>
                              {u.first_name} {u.last_name}
                            </p>
                            <p style={{
                              fontSize: '11px', color: '#9ca3af', margin: 0,
                            }}>
                              {u.email}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td style={tdStyle}>
                        <RoleBadge role={u.role} />
                      </td>

                      {/* Status */}
                      <td style={tdStyle}>
                        <span style={{
                          padding: '3px 10px', borderRadius: '99px',
                          fontSize: '11px', fontWeight: 600,
                          backgroundColor: u.is_active ? '#dcfce7' : '#fee2e2',
                          color: u.is_active ? '#16a34a' : '#dc2626',
                        }}>
                          {u.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>

                      {/* Joined */}
                      <td style={{
                        ...tdStyle, color: '#9ca3af', fontSize: '12px',
                      }}>
                        {u.created_at
                          ? format(new Date(u.created_at), 'dd MMM yyyy')
                          : '—'}
                      </td>

                      {/* Actions */}
                      <td style={tdStyle}>
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: '2px',
                        }}>
                          {/* View */}
                          <button
                            onClick={() => navigate(`/admin/users/${u.id}`)}
                            title="View user"
                            style={iconBtn('#6b77c0')}
                            onMouseEnter={(e) =>
                              e.currentTarget.style.backgroundColor = '#eeeffa'
                            }
                            onMouseLeave={(e) =>
                              e.currentTarget.style.backgroundColor = 'transparent'
                            }
                          >
                            <Eye style={{ width: '15px', height: '15px' }} />
                          </button>

                          {/* Edit */}
                          <button
                            onClick={() => navigate(`/admin/users/${u.id}/edit`)}
                            title="Edit user"
                            style={iconBtn('#0891b2')}
                            onMouseEnter={(e) =>
                              e.currentTarget.style.backgroundColor = '#ecfeff'
                            }
                            onMouseLeave={(e) =>
                              e.currentTarget.style.backgroundColor = 'transparent'
                            }
                          >
                            <Edit style={{ width: '15px', height: '15px' }} />
                          </button>

                          {/* Toggle active */}
                          <button
                            onClick={() => handleToggleActive(u)}
                            title={u.is_active ? 'Deactivate' : 'Activate'}
                            style={iconBtn(u.is_active ? '#ea580c' : '#16a34a')}
                            onMouseEnter={(e) =>
                              e.currentTarget.style.backgroundColor =
                                u.is_active ? '#fff7ed' : '#f0fdf4'
                            }
                            onMouseLeave={(e) =>
                              e.currentTarget.style.backgroundColor = 'transparent'
                            }
                          >
                            {u.is_active
                              ? <UserX style={{ width: '15px', height: '15px' }} />
                              : <UserCheck style={{ width: '15px', height: '15px' }} />}
                          </button>
                        </div>
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
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between',
              padding: '14px 20px',
              borderTop: '1px solid #f3f4f6',
            }}>
              <p style={{
                fontSize: '13px', color: '#9ca3af', margin: 0,
              }}>
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
                {' '}users
              </p>

              <div style={{
                display: 'flex', alignItems: 'center', gap: '6px',
              }}>
                {/* Prev */}
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  style={pageBtn(false, page === 1)}
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
                    if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...');
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, idx) =>
                    p === '...' ? (
                      <span key={`dots-${idx}`} style={{
                        fontSize: '13px', color: '#9ca3af', padding: '0 4px',
                      }}>
                        ...
                      </span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        style={pageBtn(p === page, false)}
                      >
                        {p}
                      </button>
                    )
                  )}

                {/* Next */}
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

      {/* ── Detail modal ── */}
      {selected && (
        <div style={{
          position: 'fixed', inset: 0,
          backgroundColor: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 50, padding: '16px',
        }}>
          <div style={{
            backgroundColor: '#ffffff', borderRadius: '20px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
            width: '100%', maxWidth: '420px', overflow: 'hidden',
          }}>
            <div style={{
              padding: '20px 24px', borderBottom: '1px solid #f3f4f6',
              display: 'flex', alignItems: 'center',
              justifyContent: 'space-between',
            }}>
              <h3 style={{
                fontSize: '16px', fontWeight: 700,
                color: '#111827', margin: 0,
              }}>
                User details
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

            <div style={{ padding: '24px' }}>
              <div style={{
                display: 'flex', alignItems: 'center',
                gap: '16px', marginBottom: '20px',
              }}>
                <div style={{
                  width: '60px', height: '60px',
                  background: 'linear-gradient(135deg, #9ba4d4 0%, #6b77c0 100%)',
                  borderRadius: '50%', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <span style={{
                    color: 'white', fontWeight: 700, fontSize: '20px',
                  }}>
                    {selected.first_name?.[0]}{selected.last_name?.[0]}
                  </span>
                </div>
                <div>
                  <p style={{
                    fontWeight: 700, fontSize: '17px',
                    color: '#111827', margin: 0,
                  }}>
                    {selected.first_name} {selected.last_name}
                  </p>
                  <div style={{ marginTop: '4px' }}>
                    <RoleBadge role={selected.role} />
                  </div>
                </div>
              </div>

              <div style={{
                display: 'flex', flexDirection: 'column', gap: '8px',
              }}>
                {[
                  { label: 'Email',  value: selected.email },
                  { label: 'Status',
                    value: selected.is_active ? 'Active' : 'Inactive',
                    color: selected.is_active ? '#16a34a' : '#dc2626' },
                  { label: 'Joined',
                    value: selected.created_at
                      ? format(new Date(selected.created_at), 'dd MMM yyyy')
                      : '—' },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{
                    display: 'flex', justifyContent: 'space-between',
                    alignItems: 'center', padding: '10px 12px',
                    backgroundColor: '#f9fafb', borderRadius: '10px',
                  }}>
                    <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                      {label}
                    </span>
                    <span style={{
                      fontSize: '13px', fontWeight: 500,
                      color: color || '#374151',
                    }}>
                      {value}
                    </span>
                  </div>
                ))}
              </div>

              <div style={{
                display: 'flex', gap: '10px', marginTop: '20px',
              }}>
                <button
                  onClick={() => {
                    setSelected(null);
                    navigate(`/admin/users/${selected.id}/edit`);
                  }}
                  style={{
                    flex: 1, padding: '10px',
                    borderRadius: '10px', border: 'none',
                    cursor: 'pointer', fontSize: '13px', fontWeight: 600,
                    backgroundColor: '#eeeffa', color: '#6b77c0',
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={() => handleToggleActive(selected)}
                  style={{
                    flex: 1, padding: '10px',
                    borderRadius: '10px', border: 'none',
                    cursor: 'pointer', fontSize: '13px', fontWeight: 600,
                    backgroundColor: selected.is_active ? '#fff7ed' : '#f0fdf4',
                    color: selected.is_active ? '#ea580c' : '#16a34a',
                  }}
                >
                  {selected.is_active ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </Layout>
  );
};

export default UsersList;