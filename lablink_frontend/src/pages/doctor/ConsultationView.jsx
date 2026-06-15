import React, { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Stethoscope, User,
  Calendar, FileText, ClipboardList,
  Pill, FlaskConical, AlertCircle,
} from 'lucide-react';
import { format } from 'date-fns';

const DiagnosisTypeBadge = ({ type }) => {
  const styles = {
    provisional: { bg: '#fef3c7', color: '#d97706' },
    confirmed:   { bg: '#dcfce7', color: '#16a34a' },
    referred:    { bg: '#dbeafe', color: '#2563eb' },
    follow_up:   { bg: '#fae8ff', color: '#a21caf' },
  };
  const s = styles[type] || { bg: '#f3f4f6', color: '#6b7280' };
  return (
    <span style={{
      padding: '4px 12px', borderRadius: '99px',
      fontSize: '12px', fontWeight: 600,
      backgroundColor: s.bg, color: s.color,
      whiteSpace: 'nowrap',
    }}>
      {type?.replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
    </span>
  );
};

const ConsultationView = () => {
  const { id }                          = useParams();
  const navigate                        = useNavigate();
  const [consultation, setConsultation] = useState(null);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    api.get(`/consultations/${id}/`)
      .then((res) => setConsultation(res.data))
      .catch(() => toast.error('Failed to load consultation.'))
      .finally(() => setLoading(false));
  }, [id]);

  const card = {
    backgroundColor: '#ffffff', borderRadius: '16px',
    padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    border: '1px solid #f3f4f6',
  };

  const section = (Icon, title, content, color = '#6b77c0', bg = '#eeeffa') => {
    if (!content) return null;
    return (
      <div style={card}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          marginBottom: '12px',
        }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px',
            backgroundColor: bg, display: 'flex',
            alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <Icon style={{ width: '16px', height: '16px', color }} />
          </div>
          <h3 style={{
            fontSize: '14px', fontWeight: 600,
            color: '#111827', margin: 0,
          }}>
            {title}
          </h3>
        </div>
        <div style={{
          padding: '14px 16px', backgroundColor: '#f9fafb',
          borderRadius: '10px', fontSize: '13px',
          color: '#374151', lineHeight: 1.6, whiteSpace: 'pre-wrap',
        }}>
          {content}
        </div>
      </div>
    );
  };

  return (
    <Layout title="Consultation Record">
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} style={{
                height: '120px', backgroundColor: '#f9fafb',
                borderRadius: '16px',
              }} />
            ))}
          </div>
        ) : consultation ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Header card */}
            <div style={card}>
              <div style={{
                display: 'flex', alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap', gap: '12px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{
                    width: '56px', height: '56px',
                    background: 'linear-gradient(135deg, #9ba4d4 0%, #6b77c0 100%)',
                    borderRadius: '50%', display: 'flex',
                    alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <span style={{ color: 'white', fontWeight: 700, fontSize: '20px' }}>
                      {consultation.patient_name?.[0]}
                    </span>
                  </div>
                  <div>
                    <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', margin: 0 }}>
                      {consultation.patient_name}
                    </h2>
                    <p style={{ fontSize: '13px', color: '#9ca3af', margin: 0, marginTop: '2px' }}>
                      {consultation.doctor_name} ·{' '}
                      {consultation.created_at
                        ? format(new Date(consultation.created_at), 'dd MMM yyyy, HH:mm')
                        : '—'}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <DiagnosisTypeBadge type={consultation.diagnosis_type} />
                  <button
                    onClick={() => navigate(`/doctor/patients/${consultation.patient}`)}
                    style={{
                      padding: '8px 16px', borderRadius: '8px',
                      border: '1px solid #e5e7eb',
                      backgroundColor: '#f9fafb', color: '#6b7280',
                      fontSize: '13px', fontWeight: 600, cursor: 'pointer',
                    }}
                  >
                    View patient →
                  </button>
                </div>
              </div>

              {consultation.follow_up_date && (
                <div style={{
                  marginTop: '16px', padding: '12px 16px',
                  backgroundColor: '#fef3c7', borderRadius: '10px',
                  border: '1px solid #fde68a',
                  display: 'flex', alignItems: 'center', gap: '8px',
                }}>
                  <Calendar style={{ width: '15px', height: '15px', color: '#d97706', flexShrink: 0 }} />
                  <p style={{ fontSize: '13px', color: '#d97706', fontWeight: 500, margin: 0 }}>
                    Follow-up scheduled:{' '}
                    <strong>
                      {format(new Date(consultation.follow_up_date), 'dd MMMM yyyy')}
                    </strong>
                  </p>
                </div>
              )}
            </div>

            {/* Two column layout */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr',
              gap: '16px', alignItems: 'start',
            }}>

              {/* Left column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {section(User, 'Chief complaint', consultation.chief_complaint, '#6b77c0', '#eeeffa')}
                {consultation.history_of_illness && section(ClipboardList, 'History of present illness', consultation.history_of_illness, '#6b77c0', '#eeeffa')}
                {consultation.physical_examination && section(Stethoscope, 'Physical examination', consultation.physical_examination, '#6b77c0', '#eeeffa')}
              </div>

              {/* Right column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                {/* Diagnosis */}
                <div style={card}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                    <div style={{
                      width: '32px', height: '32px', borderRadius: '8px',
                      backgroundColor: '#eeeffa', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                      <AlertCircle style={{ width: '16px', height: '16px', color: '#6b77c0' }} />
                    </div>
                    <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#111827', margin: 0 }}>
                      Diagnosis
                    </h3>
                    <DiagnosisTypeBadge type={consultation.diagnosis_type} />
                  </div>
                  <div style={{
                    padding: '14px 16px', backgroundColor: '#f9fafb',
                    borderRadius: '10px', fontSize: '13px',
                    color: '#374151', lineHeight: 1.6,
                  }}>
                    {consultation.diagnosis}
                  </div>
                </div>

                {consultation.treatment_plan && section(FileText, 'Treatment plan', consultation.treatment_plan, '#16a34a', '#dcfce7')}
                {consultation.prescriptions && section(Pill, 'Prescriptions', consultation.prescriptions, '#7c3aed', '#faf5ff')}
                {consultation.lab_tests_ordered && section(FlaskConical, 'Lab tests ordered', consultation.lab_tests_ordered, '#6b77c0', '#eeeffa')}
                {consultation.notes && section(ClipboardList, 'Additional notes', consultation.notes, '#6b7280', '#f3f4f6')}

              </div>
            </div>

          </div>
        ) : (
          <div style={{
            ...card, textAlign: 'center',
            padding: '64px', color: '#9ca3af',
          }}>
            <Stethoscope style={{ width: '48px', height: '48px', margin: '0 auto 12px', opacity: 0.3 }} />
            <p style={{ fontSize: '15px', fontWeight: 500, margin: 0 }}>
              Consultation not found
            </p>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ConsultationView;
