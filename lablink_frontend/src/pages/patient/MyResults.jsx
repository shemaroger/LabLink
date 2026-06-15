import React from 'react';
import { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import StatusBadge from '../../components/common/StatusBadge';
import { getMyResults, downloadResult } from '../../api/results';
import { FlaskConical, Download, Eye, Search } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

const MyResults = () => {
  const [results, setResults]   = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    getMyResults()
      .then((res) => {
        setResults(res.data);
        setFiltered(res.data);
      })
      .catch(() => toast.error('Failed to load results.'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let data = [...results];
    if (search) {
      data = data.filter((r) =>
        r.test_name.toLowerCase().includes(search.toLowerCase()) ||
        r.test_type_display?.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (statusFilter) {
      data = data.filter((r) => r.status === statusFilter);
    }
    setFiltered(data);
  }, [search, statusFilter, results]);

  const handleDownload = async (id, testName) => {
    try {
      const res = await downloadResult(id);
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${testName}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Download started.');
    } catch {
      toast.error('No file available for this result.');
    }
  };

  return (
    <Layout title="My Results">
      <div className="space-y-6">

        {/* Filters */}
        <div className="card">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2
                                 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by test name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-9"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field sm:w-44"
            >
              <option value="">All statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="available">Available</option>
              <option value="reviewed">Reviewed</option>
            </select>
          </div>
        </div>

        {/* Results list */}
        <div className="card p-0 overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i}
                     className="h-16 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <FlaskConical className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No results found</p>
              <p className="text-sm mt-1">
                Your laboratory results will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="text-left py-3 px-4 text-gray-500
                                   font-medium">#</th>
                    <th className="text-left py-3 px-4 text-gray-500
                                   font-medium">Test name</th>
                    <th className="text-left py-3 px-4 text-gray-500
                                   font-medium">Type</th>
                    <th className="text-left py-3 px-4 text-gray-500
                                   font-medium">Test date</th>
                    <th className="text-left py-3 px-4 text-gray-500
                                   font-medium">Status</th>
                    <th className="text-left py-3 px-4 text-gray-500
                                   font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r, i) => (
                    <tr key={r.id}
                        className="border-b border-gray-50
                                   hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 text-gray-400">{i + 1}</td>
                      <td className="py-3 px-4 font-medium text-gray-800">
                        {r.test_name}
                      </td>
                      <td className="py-3 px-4 text-gray-500">
                        {r.test_type_display}
                      </td>
                      <td className="py-3 px-4 text-gray-500">
                        {r.test_date
                          ? format(new Date(r.test_date), 'dd MMM yyyy')
                          : '—'}
                      </td>
                      <td className="py-3 px-4">
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelected(r)}
                            className="p-1.5 text-primary-600
                                       hover:bg-primary-50 rounded-lg
                                       transition-colors"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {r.result_file && (
                            <button
                              onClick={() =>
                                handleDownload(r.id, r.test_name)
                              }
                              className="p-1.5 text-green-600
                                         hover:bg-green-50 rounded-lg
                                         transition-colors"
                              title="Download result"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center
                        justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full
                          max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-800 text-lg">
                  Result details
                </h3>
                <button
                  onClick={() => setSelected(null)}
                  className="text-gray-400 hover:text-gray-600 text-xl
                             leading-none"
                >
                  ×
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-400 uppercase
                                tracking-wide mb-1">Test name</p>
                  <p className="text-sm font-medium text-gray-800">
                    {selected.test_name}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase
                                tracking-wide mb-1">Test type</p>
                  <p className="text-sm font-medium text-gray-800">
                    {selected.test_type_display}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase
                                tracking-wide mb-1">Test date</p>
                  <p className="text-sm font-medium text-gray-800">
                    {selected.test_date
                      ? format(new Date(selected.test_date), 'dd MMM yyyy')
                      : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 uppercase
                                tracking-wide mb-1">Status</p>
                  <StatusBadge status={selected.status} />
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-400 uppercase
                              tracking-wide mb-1">Result details</p>
                <p className="text-sm text-gray-700 bg-gray-50
                              rounded-lg p-3 leading-relaxed">
                  {selected.result_details}
                </p>
              </div>

              {selected.notes && (
                <div>
                  <p className="text-xs text-gray-400 uppercase
                                tracking-wide mb-1">Notes</p>
                  <p className="text-sm text-gray-700 bg-gray-50
                                rounded-lg p-3 leading-relaxed">
                    {selected.notes}
                  </p>
                </div>
              )}

              <div>
                <p className="text-xs text-gray-400 uppercase
                              tracking-wide mb-1">Uploaded by</p>
                <p className="text-sm font-medium text-gray-800">
                  {selected.uploaded_by?.first_name}{' '}
                  {selected.uploaded_by?.last_name}
                </p>
              </div>

              {selected.result_file && (
                <button
                  onClick={() =>
                    handleDownload(selected.id, selected.test_name)
                  }
                  className="btn-primary w-full flex items-center
                             justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download result file
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </Layout>
  );
};

export default MyResults;