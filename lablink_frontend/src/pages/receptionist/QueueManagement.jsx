import React, { useEffect, useState, useCallback } from 'react';
import Layout from '../../components/layout/Layout';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import {
  Users, Clock, CheckCircle,
  AlertCircle, RefreshCw, UserCheck,
  ChevronRight,
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const QueueStatusBadge = ({ status }) => {
  const styles = {
    waiting:     { bg: '#fef3c7', color: '#d97706', label: 'Waiting'     },
    called:      { bg: '#dbeafe', color: '#2563eb', label: 'Called'      },
    in_progress: { bg: '#ede9fe', color: '#7c3aed', label: 'In Progress' },
    done:        { bg: '#dcfce7', color: '#16a34a', label: 'Done'        },
  };
  const s = styles[status] || { bg: '#f3f4f6', color: '#6b7280', label: status };
  return (
    <span style={{
      padding: '4px 12px', borderRadius: '99px',
      fontSize: '12px', fontWeight: 600,
      backgroundColor: s.bg, color: s.color,
      whiteSpace: 'nowrap',
    }}>
      {s.label}
    </span>
  );
};

const QueueManagement = () => {
  const navigate                    = useNavigate();
  const [queue, setQueue]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [updating, setUpdating]     = useState(null);

  const loadQueue = useCallback(async () => {
    try {
      const res = await api.get('/patients/queue/today/');
      setQueue(res.data);
    } catch {
      toast.error('Failed to load queue.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadQueue();
  }, [loadQueue]);

  const handleStatusUpdate = async (patientId, newStatus) => {
    setUpdating(patientId);
    try {
      await api.patch(
        `/patients/${patientId}/queue/status/`,
        { queue_status: newStatus }
      );
      toast.success('Queue status updated.');
      await loadQueue();
    } catch {
      toast.error('Failed to update status.');
    } finally {
      setUpdating(null);
    }
  };

  const nextStatus = {
    waiting:     { status: 'called',      label: 'Call patient',   color: '#2563eb', bg: '#eff6ff'  },
    called:      { status: 'in_progress', label: 'Start consult',  color: '#7c3aed', bg: '#f5f3ff'  },
    in_progress: { status: 'done',        label: 'Mark done',      color: '#16a34a', bg: '#f0fdf4'  },
  };

  const stats = {
    total:       queue.length,
    waiting:     queue.filter((p) => p.queue_status === 'waiting').length,
    called:      queue.filter((p) => p.queue_status === 'called').length,
    in_progress: queue.filter((p) => p.queue_status === 'in_progress').length,
    done:        queue.filter((p) => p.queue_status === 'done').length,
  };

  const card = {
    backgroundColor: '#ffffff', borderRadius: '16px',
    padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    border: '1px solid #f3f4f6',
  };

  return (
    <Layout title="Queue Management">
      <div style={{
        display: 'flex', flexDirection: 'column',
        gap: '20px', fontFamily: 'Inter, sans-serif',
      }}>

        {/* ── Header ── */}
        <div style={{
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px',
        }}>
          <div>
            <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0 }}>
              {format(new Date(), 'EEEE, dd MMMM yyyy')} ·{' '}
              {stats.total} patient{stats.total !== 1 ? 's' : ''} in queue
            </p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => loadQueue()}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                padding: '9px 16px',
                backgroundColor: '#f9fafb', color: '#6b7280',
                fontWeight: 600, fontSize: '13px',
                borderRadius: '10px', border: '1px solid #e5e7eb',
                cursor: 'pointer',
              }}
            >
              <RefreshCw style={{ width: '14px', height: '14px' }} />
              Refresh
            </button>
          </div>
        </div>

        {/* ── Stats ── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '14px',
        }}>
          {[
            { label: 'Total',       value: stats.total,       color: '#6b77c0', bg: '#eeeffa'  },
            { label: 'Waiting',     value: stats.waiting,     color: '#d97706', bg: '#fef3c7'  },
            { label: 'Called',      value: stats.called,      color: '#2563eb', bg: '#dbeafe'  },
            { label: 'In progress', value: stats.in_progress, color: '#7c3aed', bg: '#ede9fe'  },
            { label: 'Done',        value: stats.done,        color: '#16a34a', bg: '#dcfce7'  },
          ].map(({ label, value, color, bg }) => (
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

        {/* ── Queue table ── */}
        <div style={{ ...card, padding: 0, overflow: 'hidden' }}>

          {/* Table header */}
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid #f3f4f6',
            display: 'flex', alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <h3 style={{
              fontSize: '15px', fontWeight: 600,
              color: '#111827', margin: 0,
            }}>
              Today's queue
            </h3>
            <span style={{
              fontSize: '12px', color: '#9ca3af',
            }}>
              Auto-refreshes on action
            </span>
          </div>

          {loading ? (
            <div style={{
              padding: '24px', display: 'flex',
              flexDirection: 'column', gap: '12px',
            }}>
              {[1, 2, 3, 4].map((i) => (
                <div key={i} style={{
                  height: '64px', backgroundColor: '#f9fafb',
                  borderRadius: '10px',
                }} />
              ))}
            </div>
          ) : queue.length === 0 ? (
            <div style={{
              textAlign: 'center', padding: '64px 0', color: '#9ca3af',
            }}>
              <Users style={{
                width: '48px', height: '48px',
                margin: '0 auto 12px', opacity: 0.3,
              }} />
              <p style={{ fontSize: '14px', fontWeight: 500, margin: 0 }}>
                No patients in queue today
              </p>
              <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0, marginTop: '4px' }}>
                Patients are queued automatically when registered
              </p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Queue #', 'Patient', 'Phone', 'Blood group', 'Status', 'Actions'].map((h) => (
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
                  {queue.map((p) => (
                    <tr
                      key={p.id}
                      style={{
                        transition: 'background-color 0.15s',
                        opacity: p.queue_status === 'done' ? 0.6 : 1,
                      }}
                      onMouseEnter={(e) =>
                        e.currentTarget.style.backgroundColor = '#fafafa'
                      }
                      onMouseLeave={(e) =>
                        e.currentTarget.style.backgroundColor = 'transparent'
                      }
                    >
                      {/* Queue number */}
                      <td style={{
                        padding: '14px 16px', verticalAlign: 'middle',
                        borderBottom: '1px solid #f9fafb',
                      }}>
                        <div style={{
                          width: '36px', height: '36px',
                          backgroundColor: '#eeeffa', borderRadius: '10px',
                          display: 'flex', alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                          <span style={{
                            fontSize: '14px', fontWeight: 800,
                            color: '#6b77c0',
                          }}>
                            {p.queue_number}
                          </span>
                        </div>
                      </td>

                      {/* Patient */}
                      <td style={{
                        padding: '14px 16px', verticalAlign: 'middle',
                        borderBottom: '1px solid #f9fafb',
                      }}>
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

                      {/* Phone */}
                      <td style={{
                        padding: '14px 16px', fontSize: '13px',
                        color: '#6b7280', verticalAlign: 'middle',
                        borderBottom: '1px solid #f9fafb',
                      }}>
                        {p.phone || '—'}
                      </td>

                      {/* Blood group */}
                      <td style={{
                        padding: '14px 16px', fontSize: '13px',
                        color: '#6b7280', fontWeight: 600,
                        verticalAlign: 'middle',
                        borderBottom: '1px solid #f9fafb',
                      }}>
                        {p.blood_group || '—'}
                      </td>

                      {/* Status */}
                      <td style={{
                        padding: '14px 16px', verticalAlign: 'middle',
                        borderBottom: '1px solid #f9fafb',
                      }}>
                        <QueueStatusBadge status={p.queue_status} />
                      </td>

                      {/* Actions */}
                      <td style={{
                        padding: '14px 16px', verticalAlign: 'middle',
                        borderBottom: '1px solid #f9fafb',
                      }}>
                        {p.queue_status !== 'done' && nextStatus[p.queue_status] && (
                          <button
                            onClick={() => handleStatusUpdate(
                              p.id,
                              nextStatus[p.queue_status].status
                            )}
                            disabled={updating === p.id}
                            style={{
                              display: 'flex', alignItems: 'center', gap: '6px',
                              padding: '7px 14px', borderRadius: '8px',
                              border: 'none', cursor: updating === p.id
                                ? 'not-allowed' : 'pointer',
                              fontSize: '12px', fontWeight: 600,
                              backgroundColor: nextStatus[p.queue_status].bg,
                              color: nextStatus[p.queue_status].color,
                              opacity: updating === p.id ? 0.7 : 1,
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {updating === p.id ? (
                              <span style={{
                                width: '12px', height: '12px',
                                border: '2px solid currentColor',
                                borderTopColor: 'transparent',
                                borderRadius: '50%',
                                animation: 'spin 0.8s linear infinite',
                                display: 'inline-block',
                              }} />
                            ) : (
                              <ChevronRight style={{ width: '13px', height: '13px' }} />
                            )}
                            {nextStatus[p.queue_status].label}
                          </button>
                        )}
                        {p.queue_status === 'done' && (
                          <span style={{
                            display: 'flex', alignItems: 'center', gap: '4px',
                            fontSize: '12px', color: '#16a34a', fontWeight: 600,
                          }}>
                            <CheckCircle style={{ width: '13px', height: '13px' }} />
                            Done
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </Layout>
  );
};

export default QueueManagement;