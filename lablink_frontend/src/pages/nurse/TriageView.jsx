import React, { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Thermometer, Heart,
  Wind, Weight, Ruler,
  User, FileText,
} from 'lucide-react';
import { format } from 'date-fns';

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
      padding: '5px 14px', borderRadius: '99px',
      fontSize: '13px', fontWeight: 600,
      backgroundColor: s.bg, color: s.color,
    }}>
      {labels[level] || level}
    </span>
  );
};

const TriageView = () => {
  const { id }                = useParams();
  const navigate              = useNavigate();
  const [record, setRecord]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/triage/${id}/`)
      .then((res) => setRecord(res.data))
      .catch(() => toast.error('Failed to load triage record.'))
      .finally(() => setLoading(false));
  }, [id]);

  const card = {
    backgroundColor: '#ffffff', borderRadius: '16px',
    padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    border: '1px solid #f3f4f6',
  };

  const vitalCard = (Icon, label, value, unit, color, bg) => (
    <div style={{
      backgroundColor: bg, borderRadius: '12px',
      padding: '16px', display: 'flex',
      alignItems: 'center', gap: '12px',
    }}>
      <div style={{
        width: '40px', height: '40px', borderRadius: '10px',
        backgroundColor: color + '20', display: 'flex',
        alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Icon style={{ width: '20px', height: '20px', color }} />
      </div>
      <div>
        <p style={{ fontSize: '11px', color: '#9ca3af', margin: 0 }}>
          {label}
        </p>
        <p style={{
          fontSize: '18px', fontWeight: 700,
          color: '#111827', margin: 0, marginTop: '2px',
        }}>
          {value}
          <span style={{
            fontSize: '12px', color: '#9ca3af', marginLeft: '4px',
          }}>
            {unit}
          </span>
        </p>
      </div>
    </div>
  );

  return (
    <Layout title="Triage Record">
      <div style={{ fontFamily: 'Inter, sans-serif' }}>

        <button
          onClick={() => navigate('/nurse/triage')}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#6b7280', fontSize: '13px', fontWeight: 500,
            marginBottom: '20px', padding: 0,
          }}
        >
          <ArrowLeft style={{ width: '16px', height: '16px' }} />
          Back to triage
        </button>

        {loading ? (
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px',
          }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{
                height: '200px', backgroundColor: '#f9fafb',
                borderRadius: '16px',
              }} />
            ))}
          </div>
        ) : record ? (
          <div style={{
            display: 'flex', flexDirection: 'column', gap: '20px',
          }}>

            {/* Header card */}
            <div style={card}>
              <div style={{
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px',
              }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                }}>
                  <div style={{
                    width: '56px', height: '56px',
                    background: 'linear-gradient(135deg, #9ba4d4 0%, #6b77c0 100%)',
                    borderRadius: '50%', display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <span style={{
                      color: 'white', fontWeight: 700, fontSize: '20px',
                    }}>
                      {record.patient_name?.[0]}
                    </span>
                  </div>
                  <div>
                    <h2 style={{
                      fontSize: '20px', fontWeight: 700,
                      color: '#111827', margin: 0,
                    }}>
                      {record.patient_name}
                    </h2>
                    <p style={{
                      fontSize: '13px', color: '#9ca3af',
                      margin: 0, marginTop: '2px',
                    }}>
                      Triaged by {record.nurse_name} ·{' '}
                      {record.created_at
                        ? format(
                            new Date(record.created_at),
                            'dd MMM yyyy, HH:mm'
                          )
                        : '—'}
                    </p>
                  </div>
                </div>
                <UrgencyBadge level={record.urgency_level} />
              </div>
            </div>

            {/* Vital signs */}
            <div style={card}>
              <h3 style={{
                fontSize: '15px', fontWeight: 600,
                color: '#111827', margin: 0, marginBottom: '16px',
              }}>
                Vital signs
              </h3>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                gap: '12px',
              }}>
                {vitalCard(Thermometer, 'Temperature',   record.temperature,      '°C',    '#dc2626', '#fef2f2')}
                {vitalCard(Heart,       'Blood pressure', record.blood_pressure,   'mmHg',  '#e11d48', '#fff1f2')}
                {vitalCard(Heart,       'Pulse rate',     record.pulse_rate,       'bpm',   '#7c3aed', '#faf5ff')}
                {vitalCard(Wind,        'Respiratory',    record.respiratory_rate, '/min',  '#0891b2', '#e0f2fe')}
                {vitalCard(Weight,      'Weight',         record.weight,           'kg',    '#6b77c0', '#eeeffa')}
                {vitalCard(Ruler,       'Height',         record.height,           'cm',    '#d97706', '#fffbeb')}
                {record.bmi && vitalCard(User, 'BMI', record.bmi, 'kg/m²', '#6b77c0', '#eeeffa')}
              </div>
            </div>

            {/* Assessment */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px',
            }}>

              <div style={card}>
                <h3 style={{
                  fontSize: '15px', fontWeight: 600,
                  color: '#111827', margin: 0, marginBottom: '16px',
                }}>
                  Assessment
                </h3>
                <div style={{
                  display: 'flex', flexDirection: 'column', gap: '12px',
                }}>
                  <div>
                    <p style={{
                      fontSize: '12px', color: '#9ca3af',
                      margin: 0, marginBottom: '4px', fontWeight: 500,
                    }}>
                      Chief complaint
                    </p>
                    <div style={{
                      padding: '12px 14px', backgroundColor: '#f9fafb',
                      borderRadius: '10px', fontSize: '13px',
                      color: '#374151', lineHeight: 1.5,
                    }}>
                      {record.chief_complaint}
                    </div>
                  </div>
                  {record.symptoms && (
                    <div>
                      <p style={{
                        fontSize: '12px', color: '#9ca3af',
                        margin: 0, marginBottom: '4px', fontWeight: 500,
                      }}>
                        Additional symptoms
                      </p>
                      <div style={{
                        padding: '12px 14px', backgroundColor: '#f9fafb',
                        borderRadius: '10px', fontSize: '13px',
                        color: '#374151', lineHeight: 1.5,
                      }}>
                        {record.symptoms}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div style={card}>
                <h3 style={{
                  fontSize: '15px', fontWeight: 600,
                  color: '#111827', margin: 0, marginBottom: '16px',
                }}>
                  Urgency & notes
                </h3>

                <div style={{
                  padding: '14px 16px', borderRadius: '10px',
                  backgroundColor:
                    record.urgency_level === 'critical' ? '#fae8ff' :
                    record.urgency_level === 'high'     ? '#fee2e2' :
                    record.urgency_level === 'medium'   ? '#fef3c7' : '#dcfce7',
                  marginBottom: '12px',
                }}>
                  <p style={{
                    fontSize: '11px', color: '#9ca3af',
                    margin: 0, marginBottom: '4px', fontWeight: 500,
                  }}>
                    Urgency level
                  </p>
                  <UrgencyBadge level={record.urgency_level} />
                  <p style={{
                    fontSize: '12px', color: '#6b7280',
                    margin: 0, marginTop: '6px',
                  }}>
                    {record.urgency_display}
                  </p>
                </div>

                {record.notes ? (
                  <div>
                    <p style={{
                      fontSize: '12px', color: '#9ca3af',
                      margin: 0, marginBottom: '4px', fontWeight: 500,
                    }}>
                      Nurse notes
                    </p>
                    <div style={{
                      padding: '12px 14px', backgroundColor: '#f9fafb',
                      borderRadius: '10px', fontSize: '13px',
                      color: '#374151', lineHeight: 1.5,
                    }}>
                      {record.notes}
                    </div>
                  </div>
                ) : (
                  <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0 }}>
                    No additional notes.
                  </p>
                )}
              </div>

            </div>
          </div>
        ) : (
          <div style={{
            ...card, textAlign: 'center',
            padding: '64px', color: '#9ca3af',
          }}>
            <FileText style={{
              width: '48px', height: '48px',
              margin: '0 auto 12px', opacity: 0.3,
            }} />
            <p style={{ fontSize: '15px', fontWeight: 500, margin: 0 }}>
              Triage record not found
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default TriageView;