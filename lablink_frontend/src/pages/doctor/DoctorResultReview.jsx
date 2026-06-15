import React, { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Download, CheckCircle,
  FlaskConical, FileText,
} from 'lucide-react';
import { format } from 'date-fns';
import StatusBadge from '../../components/common/StatusBadge';

const DoctorResultReview = () => {
  const { id }                    = useParams();
  const navigate                  = useNavigate();
  const [result, setResult]       = useState(null);
  const [loading, setLoading]     = useState(true);
  const [reviewing, setReviewing] = useState(false);

  useEffect(() => {
    api.get(`/results/${id}/`)
      .then((res) => setResult(res.data))
      .catch(() => toast.error('Failed to load result.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleMarkReviewed = async () => {
    setReviewing(true);
    try {
      await api.patch(`/results/${id}/status/`, { status: 'reviewed' });
      setResult((prev) => ({ ...prev, status: 'reviewed' }));
      toast.success('Result marked as reviewed.');
    } catch {
      toast.error('Failed to update status.');
    } finally {
      setReviewing(false);
    }
  };

  const handleDownload = async () => {
    try {
      const res = await api.get(
        `/results/${id}/download/`,
        { responseType: 'blob' }
      );
      const url  = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href  = url;
      link.setAttribute(
        'download',
        `${result?.test_name || 'result'}.pdf`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Download started.');
    } catch {
      toast.error('No file available for this result.');
    }
  };

  const card = {
    backgroundColor: '#ffffff', borderRadius: '16px',
    padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    border: '1px solid #f3f4f6',
  };

  const infoRow = (label, value) => (
    <div style={{
      display: 'flex', justifyContent: 'space-between',
      alignItems: 'center', padding: '10px 14px',
      backgroundColor: '#f9fafb', borderRadius: '8px',
    }}>
      <span style={{ fontSize: '12px', color: '#9ca3af' }}>{label}</span>
      <span style={{
        fontSize: '13px', fontWeight: 500, color: '#111827',
        textAlign: 'right', textTransform: 'capitalize', maxWidth: '60%',
      }}>
        {value || '—'}
      </span>
    </div>
  );

  return (
    <Layout title="Result Review">
      <div style={{ fontFamily: 'Inter, sans-serif' }}>

        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#6b7280', fontSize: '13px', fontWeight: 500,
            marginBottom: '20px', padding: 0,
          }}
        >
          <ArrowLeft style={{ width: '16px', height: '16px' }} />
          Back
        </button>

        {loading ? (
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px',
          }}>
            {[1, 2].map((i) => (
              <div key={i} style={{
                height: '300px', backgroundColor: '#f9fafb',
                borderRadius: '16px',
              }} />
            ))}
          </div>
        ) : result ? (
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            gap: '20px', alignItems: 'start',
          }}>

            {/* ── Result details ── */}
            <div style={card}>
              <div style={{
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', marginBottom: '20px',
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                }}>
                  <div style={{
                    width: '44px', height: '44px',
                    backgroundColor: '#eeeffa', borderRadius: '12px',
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <FlaskConical style={{
                      width: '22px', height: '22px', color: '#6b77c0',
                    }} />
                  </div>
                  <div>
                    <h2 style={{
                      fontSize: '18px', fontWeight: 700,
                      color: '#111827', margin: 0,
                    }}>
                      {result.test_name}
                    </h2>
                    <p style={{
                      fontSize: '12px', color: '#9ca3af', margin: 0,
                    }}>
                      {result.test_type_display}
                    </p>
                  </div>
                </div>
                <StatusBadge status={result.status} />
              </div>

              <div style={{
                display: 'flex', flexDirection: 'column', gap: '8px',
              }}>
                {infoRow('Patient',     result.patient?.full_name)}
                {infoRow('Test date',
                  result.test_date
                    ? format(new Date(result.test_date), 'dd MMM yyyy')
                    : '—'
                )}
                {infoRow('Uploaded by',
                  `${result.uploaded_by?.first_name || ''} ${result.uploaded_by?.last_name || ''}`.trim()
                )}
                {infoRow('Upload date',
                  result.upload_date
                    ? format(
                        new Date(result.upload_date),
                        'dd MMM yyyy, HH:mm'
                      )
                    : '—'
                )}
                {infoRow('Status', result.status)}
              </div>

              {/* Action buttons */}
              <div style={{
                display: 'flex', gap: '10px', marginTop: '20px',
              }}>
                {result.status !== 'reviewed' && (
                  <button
                    onClick={handleMarkReviewed}
                    disabled={reviewing}
                    style={{
                      flex: 1, padding: '11px',
                      backgroundColor: '#6b77c0', color: '#fff',
                      fontWeight: 600, fontSize: '13px',
                      borderRadius: '10px', border: 'none',
                      cursor: reviewing ? 'not-allowed' : 'pointer',
                      opacity: reviewing ? 0.7 : 1,
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center', gap: '8px',
                      boxShadow: '0 4px 14px rgba(107,119,192,0.35)',
                    }}
                  >
                    {reviewing ? (
                      <>
                        <span style={{
                          width: '14px', height: '14px',
                          border: '2px solid white',
                          borderTopColor: 'transparent',
                          borderRadius: '50%',
                          animation: 'spin 0.8s linear infinite',
                          display: 'inline-block',
                        }} />
                        Marking...
                      </>
                    ) : (
                      <>
                        <CheckCircle style={{ width: '15px', height: '15px' }} />
                        Mark as reviewed
                      </>
                    )}
                  </button>
                )}

                {result.result_file && (
                  <button
                    onClick={handleDownload}
                    style={{
                      flex: 1, padding: '11px',
                      backgroundColor: '#eeeffa', color: '#6b77c0',
                      fontWeight: 600, fontSize: '13px',
                      borderRadius: '10px', border: 'none',
                      cursor: 'pointer',
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center', gap: '8px',
                    }}
                  >
                    <Download style={{ width: '15px', height: '15px' }} />
                    Download file
                  </button>
                )}
              </div>

              {/* Reviewed banner */}
              {result.status === 'reviewed' && (
                <div style={{
                  marginTop: '12px', padding: '12px 14px',
                  backgroundColor: '#eeeffa', borderRadius: '10px',
                  border: '1px solid #c7caf0',
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}>
                  <CheckCircle style={{
                    width: '16px', height: '16px', color: '#6b77c0',
                  }} />
                  <p style={{
                    fontSize: '13px', color: '#6b77c0',
                    fontWeight: 500, margin: 0,
                  }}>
                    This result has been reviewed
                  </p>
                </div>
              )}
            </div>

            {/* ── Right column ── */}
            <div style={{
              display: 'flex', flexDirection: 'column', gap: '16px',
            }}>

              {/* Result details */}
              <div style={card}>
                <h3 style={{
                  fontSize: '14px', fontWeight: 600,
                  color: '#111827', margin: 0, marginBottom: '12px',
                }}>
                  Result details
                </h3>
                <div style={{
                  padding: '14px 16px', backgroundColor: '#f9fafb',
                  borderRadius: '10px', fontSize: '13px',
                  color: '#374151', lineHeight: 1.6, whiteSpace: 'pre-wrap',
                }}>
                  {result.result_details || 'No details provided.'}
                </div>
              </div>

              {/* Notes */}
              {result.notes && (
                <div style={card}>
                  <h3 style={{
                    fontSize: '14px', fontWeight: 600,
                    color: '#111827', margin: 0, marginBottom: '12px',
                  }}>
                    Notes
                  </h3>
                  <div style={{
                    padding: '14px 16px', backgroundColor: '#fffbeb',
                    borderRadius: '10px', border: '1px solid #fde68a',
                    fontSize: '13px', color: '#374151', lineHeight: 1.6,
                  }}>
                    {result.notes}
                  </div>
                </div>
              )}

              {/* Patient quick info */}
              <div style={card}>
                <h3 style={{
                  fontSize: '14px', fontWeight: 600,
                  color: '#111827', margin: 0, marginBottom: '12px',
                }}>
                  Patient info
                </h3>
                <div
                  onClick={() =>
                    navigate(`/doctor/patients/${result.patient?.id}`)
                  }
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '12px 14px', backgroundColor: '#f9fafb',
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
                    width: '40px', height: '40px',
                    background: 'linear-gradient(135deg, #9ba4d4 0%, #6b77c0 100%)',
                    borderRadius: '50%', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <span style={{
                      color: 'white', fontWeight: 700, fontSize: '14px',
                    }}>
                      {result.patient?.full_name?.[0]}
                    </span>
                  </div>
                  <div>
                    <p style={{
                      fontSize: '13px', fontWeight: 600,
                      color: '#111827', margin: 0,
                    }}>
                      {result.patient?.full_name}
                    </p>
                    <p style={{
                      fontSize: '11px', color: '#6b77c0',
                      margin: 0, marginTop: '2px',
                    }}>
                      View full profile →
                    </p>
                  </div>
                </div>

                {/* Blood group & allergies quick view */}
                {(result.patient?.blood_group || result.patient?.allergies) && (
                  <div style={{ marginTop: '10px' }}>
                    {result.patient?.blood_group && (
                      <div style={{
                        display: 'flex', justifyContent: 'space-between',
                        padding: '8px 14px', backgroundColor: '#f9fafb',
                        borderRadius: '8px', marginBottom: '6px',
                      }}>
                        <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                          Blood group
                        </span>
                        <span style={{
                          fontSize: '13px', fontWeight: 700,
                          color: '#6b77c0',
                        }}>
                          {result.patient.blood_group}
                        </span>
                      </div>
                    )}
                    {result.patient?.allergies && (
                      <div style={{
                        padding: '10px 14px',
                        backgroundColor: '#fef2f2', borderRadius: '8px',
                        border: '1px solid #fecaca',
                      }}>
                        <p style={{
                          fontSize: '11px', color: '#dc2626',
                          fontWeight: 600, margin: 0, marginBottom: '3px',
                        }}>
                          ⚠️ Allergies
                        </p>
                        <p style={{
                          fontSize: '12px', color: '#374151', margin: 0,
                        }}>
                          {result.patient.allergies}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>
          </div>
        ) : (
          <div style={{
            backgroundColor: '#ffffff', borderRadius: '16px',
            padding: '64px', textAlign: 'center', color: '#9ca3af',
          }}>
            <FlaskConical style={{
              width: '48px', height: '48px',
              margin: '0 auto 12px', opacity: 0.3,
            }} />
            <p style={{ fontSize: '15px', fontWeight: 500, margin: 0 }}>
              Result not found
            </p>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </Layout>
  );
};

export default DoctorResultReview;