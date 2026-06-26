import React, { useEffect, useState } from 'react';
import Layout from '../../../components/layout/Layout';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import api from '../../../api/axios';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Mail, Phone, Calendar, CreditCard,
  User, Trash2, FlaskConical, Edit,
  Activity, FileText, Stethoscope,
  ClipboardList,
} from 'lucide-react';
import { format } from 'date-fns';
import StatusBadge from '../../../components/common/StatusBadge';

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

const ViewPatient = () => {
  const { id }                            = useParams();
  const navigate                          = useNavigate();
  const { user }                          = useAuth();
  const [patient, setPatient]             = useState(null);
  const [results, setResults]             = useState([]);
  const [triageRecords, setTriageRecords] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [deleting, setDeleting]           = useState(false);

  const isReceptionist = user?.role === 'receptionist';
  const isNurse        = user?.role === 'nurse';
  const isDoctor       = user?.role === 'doctor';

  const basePath =
    isReceptionist ? '/receptionist/patients' :
    isNurse        ? '/nurse/patients'        :
    isDoctor       ? '/doctor/patients'       :
                     '/admin/patients';

  useEffect(() => {
    Promise.all([
      api.get(`/patients/${id}/`),
      api.get(`/results/list/?patient_id=${id}`),
      isReceptionist
        ? Promise.resolve({ data: [] })
        : api.get(`/triage/list/?patient_id=${id}`)
            .catch((err) => {
              console.warn(
                'Triage fetch failed:',
                err.response?.status,
                err.response?.data
              );
              return { data: [] };
            }),
      isDoctor
        ? api.get(`/consultations/list/?patient_id=${id}`)
            .catch((err) => {
              console.warn(
                'Consultations fetch failed:',
                err.response?.status,
                err.response?.data
              );
              return { data: [] };
            })
        : Promise.resolve({ data: [] }),
    ])
      .then(([pRes, rRes, tRes, cRes]) => {
        setPatient(pRes.data);
        setResults(rRes.data);
        setTriageRecords(tRes.data);
        setConsultations(cRes.data);
      })
      .catch((err) => {
        console.error('ViewPatient failed:', err.response?.status);
        toast.error('Failed to load patient.');
      })
      .finally(() => setLoading(false));
  }, [id, isDoctor, isReceptionist]);

  const handleDelete = async () => {
    if (!window.confirm('Delete this patient? This cannot be undone.')) return;
    setDeleting(true);
    try {
      await api.delete(`/patients/${id}/delete/`);
      toast.success('Patient deleted.');
      navigate(basePath);
    } catch {
      toast.error('Failed to delete patient.');
      setDeleting(false);
    }
  };

  const card = {
    backgroundColor: '#ffffff', borderRadius: '16px',
    padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    border: '1px solid #f3f4f6',
  };

  const infoRow = (Icon, label, value) => (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '14px',
      padding: '12px 16px', backgroundColor: '#f9fafb',
      borderRadius: '10px',
    }}>
      <div style={{
        width: '34px', height: '34px',
        backgroundColor: 'rgba(107,119,192,0.1)',
        borderRadius: '8px', display: 'flex',
        alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Icon style={{ width: '15px', height: '15px', color: '#6b77c0' }} />
      </div>
      <div>
        <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>
          {label}
        </p>
        <p style={{
          fontSize: '13px', fontWeight: 500,
          color: '#111827', margin: 0, marginTop: '1px',
        }}>
          {value || '—'}
        </p>
      </div>
    </div>
  );

  const latestTriage = triageRecords[0] || null;

  return (
    <Layout title="View Patient">
      <div style={{ fontFamily: 'Inter, sans-serif' }}>

        <button
          onClick={() => navigate(basePath)}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#6b7280', fontSize: '13px', fontWeight: 500,
            marginBottom: '20px', padding: 0,
          }}
        >
          <ArrowLeft style={{ width: '16px', height: '16px' }} />
          Back to patients
        </button>

        {loading ? (
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px',
          }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} style={{
                height: '200px', backgroundColor: '#f9fafb',
                borderRadius: '16px',
              }} />
            ))}
          </div>
        ) : patient ? (
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr',
            gap: '20px', alignItems: 'start',
          }}>

            {/* ── Left column ── */}
            <div style={{
              display: 'flex', flexDirection: 'column', gap: '16px',
            }}>

              {/* Profile card */}
              <div style={card}>
                <div style={{
                  display: 'flex', alignItems: 'center',
                  gap: '16px', marginBottom: '20px',
                }}>
                  <div style={{
                    width: '64px', height: '64px',
                    background: 'linear-gradient(135deg, #9ba4d4 0%, #6b77c0 100%)',
                    borderRadius: '50%', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <span style={{
                      color: 'white', fontWeight: 700, fontSize: '22px',
                    }}>
                      {patient.full_name?.[0]}
                    </span>
                  </div>
                  <div>
                    <h2 style={{
                      fontSize: '20px', fontWeight: 700,
                      color: '#111827', margin: 0,
                    }}>
                      {patient.full_name}
                    </h2>
                    <p style={{
                      fontSize: '13px', color: '#9ca3af',
                      margin: 0, marginTop: '2px',
                    }}>
                      {patient.email}
                    </p>
                  </div>
                </div>

                <div style={{
                  display: 'flex', flexDirection: 'column', gap: '8px',
                }}>
                  {infoRow(Phone,    'Phone',        patient.phone)}
                  {infoRow(Calendar, 'Date of birth',
                    patient.date_of_birth
                      ? format(new Date(patient.date_of_birth), 'dd MMM yyyy')
                      : '—'
                  )}
                  {infoRow(User,     'Gender',       patient.gender)}
                  {infoRow(User,     'Blood group',  patient.blood_group)}
                  {infoRow(Mail,     'Address',      patient.address)}
                </div>

                {/* Emergency contact */}
                {patient.emergency_contact_name && (
                  <div style={{
                    marginTop: '16px', padding: '14px 16px',
                    backgroundColor: '#fff8f0', borderRadius: '10px',
                    border: '1px solid #fed7aa',
                  }}>
                    <p style={{
                      fontSize: '11px', color: '#ea580c',
                      fontWeight: 600, margin: 0, marginBottom: '4px',
                    }}>
                      Emergency contact
                    </p>
                    <p style={{
                      fontSize: '13px', fontWeight: 600,
                      color: '#111827', margin: 0,
                    }}>
                      {patient.emergency_contact_name}
                    </p>
                    <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                      {patient.emergency_contact_phone}
                    </p>
                  </div>
                )}

                {/* Insurance */}
                {(patient.insurance_provider || patient.insurance_card_number) && (
                  <div style={{
                    marginTop: '12px', padding: '14px 16px',
                    backgroundColor: '#eff6ff', borderRadius: '10px',
                    border: '1px solid #bfdbfe',
                  }}>
                    <p style={{
                      fontSize: '11px', color: '#2563eb',
                      fontWeight: 600, margin: 0, marginBottom: '4px',
                      display: 'flex', alignItems: 'center', gap: '4px',
                    }}>
                      <CreditCard style={{ width: '12px', height: '12px' }} />
                      Insurance
                    </p>
                    <p style={{
                      fontSize: '13px', fontWeight: 600,
                      color: '#111827', margin: 0,
                    }}>
                      {patient.insurance_provider || '—'}
                    </p>
                    <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>
                      {patient.insurance_card_number || '—'}
                    </p>
                  </div>
                )}

                {/* Allergies */}
                {patient.allergies && (
                  <div style={{
                    marginTop: '12px', padding: '14px 16px',
                    backgroundColor: '#fef2f2', borderRadius: '10px',
                    border: '1px solid #fecaca',
                  }}>
                    <p style={{
                      fontSize: '11px', color: '#dc2626',
                      fontWeight: 600, margin: 0, marginBottom: '4px',
                    }}>
                      ⚠️ Allergies
                    </p>
                    <p style={{ fontSize: '13px', color: '#374151', margin: 0 }}>
                      {patient.allergies}
                    </p>
                  </div>
                )}

                {/* ── Action buttons ── */}
                <div style={{
                  display: 'flex', gap: '10px',
                  marginTop: '20px', flexWrap: 'wrap',
                }}>

                  {/* Edit — admin and receptionist only */}
                  {!isNurse && !isDoctor && (
                    <button
                      onClick={() => navigate(`${basePath}/${id}/edit`)}
                      style={{
                        flex: 1, padding: '10px',
                        backgroundColor: '#eeeffa', color: '#6b77c0',
                        fontWeight: 600, fontSize: '13px',
                        borderRadius: '10px', border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'center', gap: '6px',
                      }}
                    >
                      <Edit style={{ width: '14px', height: '14px' }} />
                      Edit
                    </button>
                  )}

                  {/* Triage — nurse only */}
                  {isNurse && (
                    <button
                      onClick={() => navigate('/nurse/triage/new', {
                        state: {
                          patientId:   Number(id),
                          patientName: patient.full_name,
                        },
                      })}
                      style={{
                        flex: 1, padding: '10px',
                        backgroundColor: '#eeeffa', color: '#6b77c0',
                        fontWeight: 600, fontSize: '13px',
                        borderRadius: '10px', border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'center', gap: '6px',
                      }}
                    >
                      <Activity style={{ width: '14px', height: '14px' }} />
                      Triage patient
                    </button>
                  )}

                  {/* Doctor buttons */}
                  {isDoctor && (
                    <>
                      <button
                        onClick={() =>
                          navigate(`/doctor/patients/${id}/consult`)
                        }
                        style={{
                          flex: 1, padding: '10px',
                          backgroundColor: '#6b77c0', color: '#ffffff',
                          fontWeight: 600, fontSize: '13px',
                          borderRadius: '10px', border: 'none',
                          cursor: 'pointer',
                          display: 'flex', alignItems: 'center',
                          justifyContent: 'center', gap: '6px',
                          boxShadow: '0 4px 14px rgba(107,119,192,0.35)',
                        }}
                      >
                        <Stethoscope style={{ width: '14px', height: '14px' }} />
                        New consultation
                      </button>
                      <button
                        onClick={() => navigate('/doctor/results')}
                        style={{
                          flex: 1, padding: '10px',
                          backgroundColor: '#eeeffa', color: '#6b77c0',
                          fontWeight: 600, fontSize: '13px',
                          borderRadius: '10px', border: 'none', cursor: 'pointer',
                          display: 'flex', alignItems: 'center',
                          justifyContent: 'center', gap: '6px',
                        }}
                      >
                        <FileText style={{ width: '14px', height: '14px' }} />
                        Lab results
                      </button>
                    </>
                  )}

                  {/* Delete — admin only */}
                  {!isReceptionist && !isNurse && !isDoctor && (
                    <button
                      onClick={handleDelete}
                      disabled={deleting}
                      style={{
                        flex: 1, padding: '10px',
                        backgroundColor: '#fef2f2', color: '#dc2626',
                        fontWeight: 600, fontSize: '13px',
                        borderRadius: '10px', border: 'none',
                        cursor: deleting ? 'not-allowed' : 'pointer',
                        opacity: deleting ? 0.7 : 1,
                        display: 'flex', alignItems: 'center',
                        justifyContent: 'center', gap: '6px',
                      }}
                    >
                      <Trash2 style={{ width: '14px', height: '14px' }} />
                      Delete
                    </button>
                  )}

                </div>
              </div>

              {/* ── Latest triage — doctor and nurse ── */}
              {(isDoctor || isNurse) && latestTriage && (
                <div style={card}>
                  <div style={{
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', marginBottom: '14px',
                  }}>
                    <h3 style={{
                      fontSize: '15px', fontWeight: 600,
                      color: '#111827', margin: 0,
                    }}>
                      Latest triage
                    </h3>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                    }}>
                      <UrgencyBadge level={latestTriage.urgency_level} />
                      {isNurse && (
                        <button
                          onClick={() =>
                            navigate(`/nurse/triage/${latestTriage.id}`)
                          }
                          style={{
                            fontSize: '12px', color: '#6b77c0',
                            background: 'none', border: 'none',
                            cursor: 'pointer', fontWeight: 600, padding: 0,
                          }}
                        >
                          View →
                        </button>
                      )}
                    </div>
                  </div>

                  <div style={{
                    display: 'grid', gridTemplateColumns: '1fr 1fr',
                    gap: '8px',
                  }}>
                    {[
                      { label: 'Temperature',  value: `${latestTriage.temperature}°C`        },
                      { label: 'Blood pressure', value: latestTriage.blood_pressure           },
                      { label: 'Pulse rate',   value: `${latestTriage.pulse_rate} bpm`       },
                      { label: 'Respiratory',  value: `${latestTriage.respiratory_rate}/min` },
                      { label: 'Weight',       value: `${latestTriage.weight} kg`            },
                      { label: 'Height',       value: `${latestTriage.height} cm`            },
                    ].map(({ label, value }) => (
                      <div key={label} style={{
                        padding: '10px 12px', backgroundColor: '#f9fafb',
                        borderRadius: '8px',
                      }}>
                        <p style={{
                          fontSize: '11px', color: '#9ca3af', margin: 0,
                        }}>
                          {label}
                        </p>
                        <p style={{
                          fontSize: '14px', fontWeight: 700,
                          color: '#111827', margin: 0,
                        }}>
                          {value}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div style={{ marginTop: '10px' }}>
                    <p style={{
                      fontSize: '11px', color: '#9ca3af',
                      margin: 0, marginBottom: '4px',
                    }}>
                      Chief complaint
                    </p>
                    <p style={{
                      fontSize: '13px', color: '#374151', margin: 0,
                      padding: '10px 12px', backgroundColor: '#f9fafb',
                      borderRadius: '8px', lineHeight: 1.5,
                    }}>
                      {latestTriage.chief_complaint}
                    </p>
                  </div>

                  <p style={{
                    fontSize: '11px', color: '#9ca3af',
                    margin: 0, marginTop: '8px',
                  }}>
                    Triaged by {latestTriage.nurse_name} ·{' '}
                    {latestTriage.created_at
                      ? format(
                          new Date(latestTriage.created_at),
                          'dd MMM yyyy, HH:mm'
                        )
                      : '—'}
                  </p>
                </div>
              )}

            </div>

            {/* ── Right column ── */}
            <div style={{
              display: 'flex', flexDirection: 'column', gap: '16px',
            }}>

              {/* Lab results */}
              <div style={card}>
                <div style={{
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between', marginBottom: '16px',
                }}>
                  <h3 style={{
                    fontSize: '15px', fontWeight: 600,
                    color: '#111827', margin: 0,
                  }}>
                    Lab results
                  </h3>
                  <span style={{
                    fontSize: '12px', fontWeight: 600,
                    color: '#6b77c0', backgroundColor: '#eeeffa',
                    padding: '3px 10px', borderRadius: '99px',
                  }}>
                    {results.length} total
                  </span>
                </div>

                {results.length === 0 ? (
                  <div style={{
                    textAlign: 'center', padding: '40px 0', color: '#9ca3af',
                  }}>
                    <FlaskConical style={{
                      width: '40px', height: '40px',
                      margin: '0 auto 10px', opacity: 0.3,
                    }} />
                    <p style={{ fontSize: '13px', margin: 0 }}>
                      No results yet
                    </p>
                  </div>
                ) : (
                  <div style={{
                    display: 'flex', flexDirection: 'column', gap: '8px',
                    maxHeight: '280px', overflowY: 'auto',
                  }}>
                    {results.map((r) => (
                      <div
                        key={r.id}
                        onClick={() =>
                          isDoctor
                            ? navigate(`/doctor/results/${r.id}`)
                            : undefined
                        }
                        style={{
                          display: 'flex', alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 14px', backgroundColor: '#f9fafb',
                          borderRadius: '10px',
                          cursor: isDoctor ? 'pointer' : 'default',
                          transition: 'background-color 0.15s',
                        }}
                        onMouseEnter={(e) => {
                          if (isDoctor)
                            e.currentTarget.style.backgroundColor = '#eeeffa';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#f9fafb';
                        }}
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
                            {r.test_date
                              ? format(new Date(r.test_date), 'dd MMM yyyy')
                              : '—'}
                          </p>
                        </div>
                        <div style={{
                          display: 'flex', alignItems: 'center', gap: '8px',
                        }}>
                          <StatusBadge status={r.status} />
                          {isDoctor && (
                            <FileText style={{
                              width: '13px', height: '13px', color: '#6b77c0',
                            }} />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Triage history — doctor only ── */}
              {isDoctor && triageRecords.length > 0 && (
                <div style={card}>
                  <div style={{
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', marginBottom: '16px',
                  }}>
                    <h3 style={{
                      fontSize: '15px', fontWeight: 600,
                      color: '#111827', margin: 0,
                    }}>
                      Triage history
                    </h3>
                    <span style={{
                      fontSize: '12px', fontWeight: 600,
                      color: '#6b77c0', backgroundColor: '#eeeffa',
                      padding: '3px 10px', borderRadius: '99px',
                    }}>
                      {triageRecords.length} records
                    </span>
                  </div>
                  <div style={{
                    display: 'flex', flexDirection: 'column', gap: '8px',
                    maxHeight: '280px', overflowY: 'auto',
                  }}>
                    {triageRecords.map((t) => (
                      <div key={t.id} style={{
                        padding: '12px 14px', backgroundColor: '#f9fafb',
                        borderRadius: '10px',
                      }}>
                        <div style={{
                          display: 'flex', alignItems: 'center',
                          justifyContent: 'space-between', marginBottom: '6px',
                        }}>
                          <p style={{
                            fontSize: '12px', color: '#9ca3af', margin: 0,
                          }}>
                            {t.created_at
                              ? format(new Date(t.created_at), 'dd MMM yyyy')
                              : '—'}
                            {' · '}Nurse: {t.nurse_name}
                          </p>
                          <UrgencyBadge level={t.urgency_level} />
                        </div>
                        <p style={{
                          fontSize: '13px', color: '#374151', margin: 0,
                        }}>
                          {t.chief_complaint}
                        </p>
                        <div style={{
                          display: 'flex', gap: '8px',
                          marginTop: '6px', flexWrap: 'wrap',
                        }}>
                          {[
                            `🌡 ${t.temperature}°C`,
                            `❤️ ${t.pulse_rate} bpm`,
                            `🩸 ${t.blood_pressure}`,
                          ].map((v) => (
                            <span key={v} style={{
                              fontSize: '11px', color: '#6b7280',
                              backgroundColor: '#ffffff',
                              padding: '3px 8px', borderRadius: '6px',
                              border: '1px solid #e5e7eb',
                            }}>
                              {v}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── Consultation history — doctor only ── */}
              {isDoctor && (
                <div style={card}>
                  <div style={{
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', marginBottom: '16px',
                  }}>
                    <h3 style={{
                      fontSize: '15px', fontWeight: 600,
                      color: '#111827', margin: 0,
                    }}>
                      Consultation history
                    </h3>
                    <span style={{
                      fontSize: '12px', fontWeight: 600,
                      color: '#6b77c0', backgroundColor: '#eeeffa',
                      padding: '3px 10px', borderRadius: '99px',
                    }}>
                      {consultations.length} records
                    </span>
                  </div>

                  {consultations.length === 0 ? (
                    <div style={{
                      textAlign: 'center', padding: '32px 0', color: '#9ca3af',
                    }}>
                      <ClipboardList style={{
                        width: '36px', height: '36px',
                        margin: '0 auto 8px', opacity: 0.3,
                      }} />
                      <p style={{ fontSize: '13px', margin: 0 }}>
                        No consultations yet
                      </p>
                      <button
                        onClick={() =>
                          navigate(`/doctor/patients/${id}/consult`)
                        }
                        style={{
                          marginTop: '10px', padding: '8px 16px',
                          backgroundColor: '#6b77c0', color: '#fff',
                          fontWeight: 600, fontSize: '12px',
                          borderRadius: '8px', border: 'none',
                          cursor: 'pointer',
                        }}
                      >
                        Start first consultation
                      </button>
                    </div>
                  ) : (
                    <div style={{
                      display: 'flex', flexDirection: 'column', gap: '8px',
                      maxHeight: '280px', overflowY: 'auto',
                    }}>
                      {consultations.map((c) => (
                        <div
                          key={c.id}
                          onClick={() =>
                            navigate(`/doctor/consultations/${c.id}`)
                          }
                          style={{
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
                            display: 'flex', alignItems: 'center',
                            justifyContent: 'space-between', marginBottom: '4px',
                          }}>
                            <p style={{
                              fontSize: '13px', fontWeight: 600,
                              color: '#111827', margin: 0,
                            }}>
                              {c.diagnosis?.slice(0, 40)}
                              {c.diagnosis?.length > 40 ? '...' : ''}
                            </p>
                            <span style={{
                              fontSize: '11px', fontWeight: 600,
                              padding: '2px 8px', borderRadius: '99px',
                              backgroundColor: '#eeeffa', color: '#6b77c0',
                              whiteSpace: 'nowrap', flexShrink: 0,
                              marginLeft: '8px',
                            }}>
                              {c.diagnosis_type_display}
                            </span>
                          </div>
                          <p style={{
                            fontSize: '11px', color: '#9ca3af', margin: 0,
                          }}>
                            {c.doctor_name} ·{' '}
                            {c.created_at
                              ? format(new Date(c.created_at), 'dd MMM yyyy')
                              : '—'}
                          </p>
                          {c.follow_up_date && (
                            <p style={{
                              fontSize: '11px', color: '#ea580c',
                              margin: 0, marginTop: '4px',
                            }}>
                              Follow-up:{' '}
                              {format(
                                new Date(c.follow_up_date), 'dd MMM yyyy'
                              )}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        ) : (
          <div style={{
            ...card, textAlign: 'center',
            padding: '64px', color: '#9ca3af',
          }}>
            <User style={{
              width: '48px', height: '48px',
              margin: '0 auto 12px', opacity: 0.3,
            }} />
            <p style={{ fontSize: '15px', fontWeight: 500, margin: 0 }}>
              Patient not found
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ViewPatient;