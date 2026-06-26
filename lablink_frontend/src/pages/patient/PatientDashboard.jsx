import React from 'react';
import { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import StatusBadge from '../../components/common/StatusBadge';
import api from '../../api/axios';
import { getMyResults } from '../../api/results';
import { getMyNotifications, markAsRead } from '../../api/notifications';
import { useAuth } from '../../context/AuthContext';
import {
  FileText, Bell, CheckCircle,
  Clock, FlaskConical, Download, Users,
} from 'lucide-react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const StatCard = ({ icon: Icon, label, value, color }) => (
  <div className="card flex items-center gap-4">
    <div className={`w-12 h-12 rounded-xl flex items-center
                     justify-center flex-shrink-0 ${color}`}>
      <Icon className="w-6 h-6" />
    </div>
    <div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500">{label}</p>
    </div>
  </div>
);

const PatientDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [queueInfo, setQueueInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      getMyResults(),
      getMyNotifications(),
      api.get('/patients/profile/').catch(() => ({ data: null })),
    ])
      .then(([resData, notifData, profileData]) => {
        setResults(resData.data);
        setNotifications(notifData.data);
        setQueueInfo(profileData.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleMarkRead = async (id) => {
    await markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => n.id === id ? { ...n, status: 'read' } : n)
    );
  };

  const available = results.filter((r) => r.status === 'available').length;
  const pending   = results.filter((r) => r.status === 'pending').length;
  const unread    = notifications.filter((n) => n.status !== 'read').length;

  return (
    <Layout title="Dashboard">
      <div className="space-y-6">

        {/* Welcome banner */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-700
                        rounded-xl p-6 text-white">
          <h2 className="text-xl font-bold">
            Welcome back, {user?.first_name}! 👋
          </h2>
          <p className="text-primary-100 mt-1 text-sm">
            Here is a summary of your laboratory results and notifications.
          </p>
        </div>

        {/* Queue status */}
        {queueInfo?.queue_number && queueInfo?.queue_status !== 'done' && (
          <div className="card flex items-center gap-4 border-2 border-primary-200 bg-primary-50">
            <div className="w-14 h-14 rounded-xl bg-primary-600 text-white
                            flex items-center justify-center flex-shrink-0">
              <Users className="w-7 h-7" />
            </div>
            <div className="min-w-0">
              <p className="font-semibold text-gray-900">
                Queue number {queueInfo.queue_number}
              </p>
              <p className="text-sm text-gray-600 mt-0.5">
                {queueInfo.queue_status === 'waiting' && (
                  queueInfo.people_ahead > 0
                    ? `${queueInfo.people_ahead} patient${queueInfo.people_ahead !== 1 ? 's' : ''} ahead of you`
                    : "You're next!"
                )}
                {queueInfo.queue_status === 'called' && "It's your turn — please proceed."}
                {queueInfo.queue_status === 'in_progress' && 'You are currently being seen.'}
              </p>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            icon={FileText}
            label="Total results"
            value={results.length}
            color="bg-blue-100 text-blue-600"
          />
          <StatCard
            icon={CheckCircle}
            label="Available results"
            value={available}
            color="bg-green-100 text-green-600"
          />
          <StatCard
            icon={Bell}
            label="Unread notifications"
            value={unread}
            color="bg-yellow-100 text-yellow-600"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Recent results */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">
                Recent results
              </h3>
              <button
                onClick={() => navigate('/patient/results')}
                className="text-sm text-primary-600 hover:underline"
              >
                View all
              </button>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i}
                       className="h-14 bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : results.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <FlaskConical className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No results yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {results.slice(0, 5).map((result) => (
                  <div key={result.id}
                       className="flex items-center justify-between
                                  p-3 rounded-lg bg-gray-50 hover:bg-gray-100
                                  transition-colors cursor-pointer"
                       onClick={() => navigate('/patient/results')}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {result.test_name}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {result.test_date
                          ? format(new Date(result.test_date), 'dd MMM yyyy')
                          : '—'}
                      </p>
                    </div>
                    <StatusBadge status={result.status} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">
                Notifications
              </h3>
              {unread > 0 && (
                <span className="text-xs bg-red-100 text-red-600
                                 px-2 py-0.5 rounded-full font-medium">
                  {unread} unread
                </span>
              )}
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i}
                       className="h-14 bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <Bell className="w-10 h-10 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No notifications</p>
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.slice(0, 5).map((n) => (
                  <div
                    key={n.id}
                    className={`p-3 rounded-lg transition-colors
                      ${n.status !== 'read'
                        ? 'bg-blue-50 border border-blue-100'
                        : 'bg-gray-50'
                      }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate">
                          {n.title}
                        </p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {format(new Date(n.sent_at), 'dd MMM yyyy, HH:mm')}
                        </p>
                      </div>
                      {n.status !== 'read' && (
                        <button
                          onClick={() => handleMarkRead(n.id)}
                          className="text-xs text-primary-600
                                     hover:underline flex-shrink-0"
                        >
                          Mark read
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </Layout>
  );
};

export default PatientDashboard;