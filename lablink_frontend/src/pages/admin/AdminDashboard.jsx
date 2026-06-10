import { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import { getAllResults } from '../../api/results';
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';
import {
  Users, FileText, Shield,
  Activity, TrendingUp, AlertCircle,
} from 'lucide-react';

const StatCard = ({ icon: Icon, label, value, color, sub }) => (
  <div className="card">
    <div className="flex items-center justify-between mb-3">
      <div className={`w-10 h-10 rounded-xl flex items-center
                       justify-center ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
    </div>
    <p className="text-2xl font-bold text-gray-900">{value}</p>
    <p className="text-sm text-gray-500 mt-0.5">{label}</p>
    {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
  </div>
);

const AdminDashboard = () => {
  const { user } = useAuth();
  const [results, setResults]   = useState([]);
  const [users, setUsers]       = useState([]);
  const [stats, setStats]       = useState(null);
  const [loading, setLoading]   = useState(true);

  useEffect(() => {
    Promise.all([
      getAllResults(),
      api.get('/users/list/'),
      api.get('/audit-logs/stats/'),
    ])
      .then(([resData, usersData, statsData]) => {
        setResults(resData.data);
        setUsers(usersData.data);
        setStats(statsData.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const patients  = users.filter((u) => u.role === 'patient').length;
  const labStaff  = users.filter((u) => u.role === 'lab_staff').length;
  const available = results.filter((r) => r.status === 'available').length;
  const pending   = results.filter((r) => r.status === 'pending').length;

  return (
    <Layout title="Admin Dashboard">
      <div className="space-y-6">

        {/* Welcome banner */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700
                        rounded-xl p-6 text-white">
          <h2 className="text-xl font-bold">
            Admin Panel — {user?.first_name} 🛡️
          </h2>
          <p className="text-purple-100 mt-1 text-sm">
            Full system overview and management controls.
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={Users}
            label="Total patients"
            value={patients}
            color="bg-blue-100 text-blue-600"
          />
          <StatCard
            icon={Activity}
            label="Lab staff"
            value={labStaff}
            color="bg-green-100 text-green-600"
          />
          <StatCard
            icon={FileText}
            label="Total results"
            value={results.length}
            color="bg-orange-100 text-orange-600"
          />
          <StatCard
            icon={Shield}
            label="Audit logs today"
            value={stats?.logs_today ?? '—'}
            color="bg-purple-100 text-purple-600"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Result breakdown */}
          <div className="card">
            <h3 className="font-semibold text-gray-800 mb-4">
              Result status breakdown
            </h3>
            <div className="space-y-3">
              {[
                { label: 'Available', count: available,
                  color: 'bg-green-500', total: results.length },
                { label: 'Pending',   count: pending,
                  color: 'bg-yellow-500', total: results.length },
                { label: 'Processing',
                  count: results.filter((r) => r.status === 'processing').length,
                  color: 'bg-blue-500', total: results.length },
                { label: 'Reviewed',
                  count: results.filter((r) => r.status === 'reviewed').length,
                  color: 'bg-purple-500', total: results.length },
              ].map(({ label, count, color, total }) => (
                <div key={label}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">{label}</span>
                    <span className="font-medium text-gray-800">{count}</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${color}`}
                      style={{
                        width: total > 0
                          ? `${(count / total) * 100}%`
                          : '0%'
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top actions from audit log */}
          <div className="card">
            <h3 className="font-semibold text-gray-800 mb-4">
              Top system actions
            </h3>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i}
                       className="h-10 bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : stats?.top_actions?.length === 0 ? (
              <div className="text-center py-8 text-gray-400">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No activity yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {stats?.top_actions?.map((item) => (
                  <div key={item.action}
                       className="flex items-center justify-between
                                  p-2 rounded-lg bg-gray-50">
                    <span className="text-sm text-gray-700 capitalize">
                      {item.action.replace('_', ' ')}
                    </span>
                    <span className="text-sm font-semibold
                                     text-primary-600">
                      {item.count}
                    </span>
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

export default AdminDashboard;