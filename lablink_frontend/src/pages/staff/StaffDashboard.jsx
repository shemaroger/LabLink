import { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import StatusBadge from '../../components/common/StatusBadge';
import { getAllResults } from '../../api/results';
import { useAuth } from '../../context/AuthContext';
import {
  FileText, Users, Clock,
  CheckCircle, Upload, FlaskConical,
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

const StaffDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllResults()
      .then((res) => setResults(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const pending    = results.filter((r) => r.status === 'pending').length;
  const available  = results.filter((r) => r.status === 'available').length;
  const processing = results.filter((r) => r.status === 'processing').length;

  return (
    <Layout title="Staff Dashboard">
      <div className="space-y-6">

        {/* Welcome banner */}
        <div className="bg-gradient-to-r from-green-600 to-green-700
                        rounded-xl p-6 text-white">
          <h2 className="text-xl font-bold">
            Welcome, {user?.first_name}! 🔬
          </h2>
          <p className="text-green-100 mt-1 text-sm">
            Manage and upload laboratory results for your patients.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <StatCard
            icon={FileText}
            label="Total results"
            value={results.length}
            color="bg-blue-100 text-blue-600"
          />
          <StatCard
            icon={Clock}
            label="Pending"
            value={pending}
            color="bg-yellow-100 text-yellow-600"
          />
          <StatCard
            icon={FlaskConical}
            label="Processing"
            value={processing}
            color="bg-orange-100 text-orange-600"
          />
          <StatCard
            icon={CheckCircle}
            label="Available"
            value={available}
            color="bg-green-100 text-green-600"
          />
        </div>

        {/* Quick actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            onClick={() => navigate('/staff/upload')}
            className="card flex items-center gap-4 hover:shadow-md
                       transition-shadow cursor-pointer text-left"
          >
            <div className="w-12 h-12 bg-primary-100 rounded-xl
                            flex items-center justify-center">
              <Upload className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-800">Upload result</p>
              <p className="text-sm text-gray-500">
                Upload a new lab result for a patient
              </p>
            </div>
          </button>

          <button
            onClick={() => navigate('/staff/patients')}
            className="card flex items-center gap-4 hover:shadow-md
                       transition-shadow cursor-pointer text-left"
          >
            <div className="w-12 h-12 bg-green-100 rounded-xl
                            flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="font-semibold text-gray-800">View patients</p>
              <p className="text-sm text-gray-500">
                Browse and search patient records
              </p>
            </div>
          </button>
        </div>

        {/* Recent results table */}
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-800">Recent results</h3>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i}
                     className="h-12 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : results.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <FlaskConical className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p className="text-sm">No results uploaded yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-3 px-2 text-gray-500
                                   font-medium">Patient</th>
                    <th className="text-left py-3 px-2 text-gray-500
                                   font-medium">Test</th>
                    <th className="text-left py-3 px-2 text-gray-500
                                   font-medium">Date</th>
                    <th className="text-left py-3 px-2 text-gray-500
                                   font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {results.slice(0, 8).map((r) => (
                    <tr key={r.id}
                        className="border-b border-gray-50
                                   hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-2 font-medium text-gray-800">
                        {r.patient?.full_name || '—'}
                      </td>
                      <td className="py-3 px-2 text-gray-600">
                        {r.test_name}
                      </td>
                      <td className="py-3 px-2 text-gray-500">
                        {r.test_date
                          ? format(new Date(r.test_date), 'dd MMM yyyy')
                          : '—'}
                      </td>
                      <td className="py-3 px-2">
                        <StatusBadge status={r.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </Layout>
  );
};

export default StaffDashboard;