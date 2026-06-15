import React from 'react';
import { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import api from '../../api/axios';
import { getAllResults } from '../../api/results';
import {
  Search, Users, Eye, FlaskConical,
  Phone, Mail, Calendar,
} from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import StatusBadge from '../../components/common/StatusBadge';

const PatientsList = () => {
  const [patients, setPatients]   = useState([]);
  const [filtered, setFiltered]   = useState([]);
  const [results, setResults]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [selected, setSelected]   = useState(null);
  const [patientResults, setPatientResults] = useState([]);
  const [loadingResults, setLoadingResults] = useState(false);

  useEffect(() => {
    Promise.all([
      api.get('/patients/list/'),
      getAllResults(),
    ])
      .then(([pxRes, resRes]) => {
        setPatients(pxRes.data);
        setFiltered(pxRes.data);
        setResults(resRes.data);
      })
      .catch(() => toast.error('Failed to load patients.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!search) {
      setFiltered(patients);
      return;
    }
    const q = search.toLowerCase();
    setFiltered(
      patients.filter(
        (p) =>
          p.full_name?.toLowerCase().includes(q) ||
          p.email?.toLowerCase().includes(q) ||
          p.phone?.includes(q)
      )
    );
  }, [search, patients]);

  const handleViewPatient = (patient) => {
    setSelected(patient);
    setLoadingResults(true);
    api.get(`/results/list/?patient_id=${patient.id}`)
      .then((res) => setPatientResults(res.data))
      .catch(() => setPatientResults([]))
      .finally(() => setLoadingResults(false));
  };

  const getResultCount = (patientId) =>
    results.filter((r) => r.patient?.id === patientId).length;

  return (
    <Layout title="Patients">
      <div className="space-y-6">

        {/* Search */}
        <div className="card">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2
                                 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-9"
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Users className="w-4 h-4" />
              <span>{filtered.length} patients</span>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="card p-0 overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i}
                     className="h-14 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No patients found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left py-3 px-4 text-gray-500
                                   font-medium">#</th>
                    <th className="text-left py-3 px-4 text-gray-500
                                   font-medium">Patient</th>
                    <th className="text-left py-3 px-4 text-gray-500
                                   font-medium">Contact</th>
                    <th className="text-left py-3 px-4 text-gray-500
                                   font-medium">Gender</th>
                    <th className="text-left py-3 px-4 text-gray-500
                                   font-medium">Blood group</th>
                    <th className="text-left py-3 px-4 text-gray-500
                                   font-medium">Results</th>
                    <th className="text-left py-3 px-4 text-gray-500
                                   font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p, i) => (
                    <tr key={p.id}
                        className="border-b border-gray-50
                                   hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 text-gray-400">{i + 1}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-primary-100
                                          rounded-full flex items-center
                                          justify-center flex-shrink-0">
                            <span className="text-primary-700 font-semibold
                                             text-xs">
                              {p.full_name?.[0]}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">
                              {p.full_name}
                            </p>
                            <p className="text-xs text-gray-400">
                              {p.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-500">
                        {p.phone || '—'}
                      </td>
                      <td className="py-3 px-4 text-gray-500 capitalize">
                        {p.gender || '—'}
                      </td>
                      <td className="py-3 px-4 text-gray-500">
                        {p.blood_group || '—'}
                      </td>
                      <td className="py-3 px-4">
                        <span className="bg-blue-100 text-blue-700
                                         px-2 py-0.5 rounded-full text-xs
                                         font-medium">
                          {getResultCount(p.id)} results
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => handleViewPatient(p)}
                          className="p-1.5 text-primary-600
                                     hover:bg-primary-50 rounded-lg
                                     transition-colors"
                          title="View patient"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* Patient detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center
                        justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full
                          max-w-2xl max-h-[90vh] overflow-y-auto">

            {/* Modal header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-primary-100 rounded-full
                                  flex items-center justify-center">
                    <span className="text-primary-700 font-bold text-lg">
                      {selected.full_name?.[0]}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-800 text-lg">
                      {selected.full_name}
                    </h3>
                    <p className="text-sm text-gray-500">{selected.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="text-gray-400 hover:text-gray-600
                             text-xl leading-none"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">

              {/* Patient info */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                  Patient information
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { icon: Phone, label: 'Phone',
                      value: selected.phone || '—' },
                    { icon: Mail, label: 'Email',
                      value: selected.email },
                    { icon: Calendar, label: 'Date of birth',
                      value: selected.date_of_birth
                        ? format(new Date(selected.date_of_birth), 'dd MMM yyyy')
                        : '—' },
                    { icon: Users, label: 'Gender',
                      value: selected.gender || '—' },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label}
                         className="flex items-start gap-2 p-3
                                    bg-gray-50 rounded-lg">
                      <Icon className="w-4 h-4 text-gray-400 mt-0.5
                                       flex-shrink-0" />
                      <div>
                        <p className="text-xs text-gray-400">{label}</p>
                        <p className="text-sm font-medium text-gray-700
                                      capitalize">
                          {value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Extra info */}
                <div className="grid grid-cols-3 gap-3 mt-3">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-400">Blood group</p>
                    <p className="text-sm font-medium text-gray-700">
                      {selected.blood_group || '—'}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg col-span-2">
                    <p className="text-xs text-gray-400">Allergies</p>
                    <p className="text-sm font-medium text-gray-700">
                      {selected.allergies || 'None reported'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Lab results */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                  Laboratory results
                </h4>

                {loadingResults ? (
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i}
                           className="h-12 bg-gray-100 rounded-lg
                                      animate-pulse" />
                    ))}
                  </div>
                ) : patientResults.length === 0 ? (
                  <div className="text-center py-6 text-gray-400">
                    <FlaskConical className="w-8 h-8 mx-auto mb-2
                                             opacity-30" />
                    <p className="text-sm">No results yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {patientResults.map((r) => (
                      <div key={r.id}
                           className="flex items-center justify-between
                                      p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="text-sm font-medium text-gray-800">
                            {r.test_name}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {r.test_date
                              ? format(new Date(r.test_date), 'dd MMM yyyy')
                              : '—'}
                          </p>
                        </div>
                        <StatusBadge status={r.status} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      )}

    </Layout>
  );
};

export default PatientsList;