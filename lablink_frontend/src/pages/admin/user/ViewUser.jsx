import React, { useEffect, useState } from 'react';
import Layout from '../../../components/layout/Layout';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../../api/axios';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Mail, Phone, Shield, Calendar,
  User, Edit, UserCheck, UserX,
} from 'lucide-react';
import { format } from 'date-fns';

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
      padding: '4px 12px', borderRadius: '99px',
      fontSize: '12px', fontWeight: 600,
      backgroundColor: s.bg, color: s.color,
    }}>
      {labels[role] || role}
    </span>
  );
};

const ViewUser = () => {
  const { id }                  = useParams();
  const navigate                = useNavigate();
  const [user, setUser]         = useState(null);
  const [loading, setLoading]   = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    api.get(`/users/${id}/`)
      .then((res) => setUser(res.data))
      .catch(() => toast.error('Failed to load user.'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleToggle = async () => {
    setToggling(true);
    try {
      await api.patch(`/users/${id}/`, { is_active: !user.is_active });
      setUser((prev) => ({ ...prev, is_active: !prev.is_active }));
      toast.success(`User ${user.is_active ? 'deactivated' : 'activated'}.`);
    } catch {
      toast.error('Failed to update status.');
    } finally {
      setToggling(false);
    }
  };

  const card = {
    backgroundColor: '#ffffff', borderRadius: '16px',
    padding: '28px', boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
    border: '1px solid #f3f4f6',
  };

  const infoRow = (Icon, label, value, valueColor) => (
    <div style={{
      display: 'flex', alignItems: 'center',
      gap: '14px', padding: '14px 16px',
      backgroundColor: '#f9fafb', borderRadius: '12px',
    }}>
      <div style={{
        width: '36px', height: '36px',
        backgroundColor: 'rgba(107,119,192,0.1)',
        borderRadius: '10px',
        display: 'flex', alignItems: 'center',
        justifyContent: 'center', flexShrink: 0,
      }}>
        <Icon style={{ width: '16px', height: '16px', color: '#6b77c0' }} />
      </div>
      <div>
        <p style={{
          fontSize: '11px', color: '#9ca3af', margin: 0,
        }}>
          {label}
        </p>
        <p style={{
          fontSize: '14px', fontWeight: 500, margin: 0,
          marginTop: '2px', color: valueColor || '#111827',
        }}>
          {value}
        </p>
      </div>
    </div>
  );

  return (
    <Layout title="View User">
      <div style={{ fontFamily: 'Inter, sans-serif', maxWidth: '640px' }}>

        {/* Back */}
        <button
          onClick={() => navigate('/admin/users')}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#6b7280', fontSize: '13px', fontWeight: 500,
            marginBottom: '20px', padding: 0,
          }}
        >
          <ArrowLeft style={{ width: '16px', height: '16px' }} />
          Back to users
        </button>

        {loading ? (
          <div style={{ ...card, display: 'flex',
                        flexDirection: 'column', gap: '12px' }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} style={{
                height: '56px', backgroundColor: '#f9fafb',
                borderRadius: '12px',
              }} />
            ))}
          </div>
        ) : user ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Profile header */}
            <div style={card}>
              <div style={{
                display: 'flex', alignItems: 'center',
                gap: '20px', marginBottom: '24px',
              }}>
                <div style={{
                  width: '72px', height: '72px',
                  background: 'linear-gradient(135deg, #9ba4d4 0%, #6b77c0 100%)',
                  borderRadius: '50%',
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center', flexShrink: 0,
                }}>
                  <span style={{
                    color: 'white', fontWeight: 700, fontSize: '24px',
                  }}>
                    {user.first_name?.[0]}{user.last_name?.[0]}
                  </span>
                </div>
                <div>
                  <h2 style={{
                    fontSize: '22px', fontWeight: 700,
                    color: '#111827', margin: 0,
                  }}>
                    {user.first_name} {user.last_name}
                  </h2>
                  <div style={{
                    display: 'flex', alignItems: 'center',
                    gap: '8px', marginTop: '6px',
                  }}>
                    <RoleBadge role={user.role} />
                    <span style={{
                      padding: '4px 12px', borderRadius: '99px',
                      fontSize: '12px', fontWeight: 600,
                      backgroundColor: user.is_active ? '#dcfce7' : '#fee2e2',
                      color: user.is_active ? '#16a34a' : '#dc2626',
                    }}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Info rows */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {infoRow(Mail,     'Email address', user.email)}
                {infoRow(Phone,    'Phone', user.phone || '—')}
                {infoRow(User,     'Full name', `${user.first_name} ${user.last_name}`)}
                {infoRow(Shield,   'Account status',
                  user.is_active ? 'Active' : 'Inactive',
                  user.is_active ? '#16a34a' : '#dc2626'
                )}
                {infoRow(Calendar, 'Member since',
                  user.created_at
                    ? format(new Date(user.created_at), 'dd MMM yyyy')
                    : '—'
                )}
              </div>
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button
                onClick={() => navigate(`/admin/users/${id}/edit`)}
                style={{
                  display: 'flex', alignItems: 'center',
                  gap: '8px', padding: '11px 20px',
                  backgroundColor: '#6b77c0', color: '#fff',
                  fontWeight: 600, fontSize: '14px',
                  borderRadius: '10px', border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(107,119,192,0.35)',
                }}
              >
                <Edit style={{ width: '15px', height: '15px' }} />
                Edit user
              </button>

              <button
                onClick={handleToggle}
                disabled={toggling}
                style={{
                  display: 'flex', alignItems: 'center',
                  gap: '8px', padding: '11px 20px',
                  backgroundColor: user.is_active ? '#fff7ed' : '#f0fdf4',
                  color: user.is_active ? '#ea580c' : '#16a34a',
                  fontWeight: 600, fontSize: '14px',
                  borderRadius: '10px', border: 'none',
                  cursor: toggling ? 'not-allowed' : 'pointer',
                  opacity: toggling ? 0.7 : 1,
                }}
              >
                {user.is_active
                  ? <UserX style={{ width: '15px', height: '15px' }} />
                  : <UserCheck style={{ width: '15px', height: '15px' }} />}
                {user.is_active ? 'Deactivate' : 'Activate'}
              </button>
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
              User not found
            </p>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </Layout>
  );
};

export default ViewUser;