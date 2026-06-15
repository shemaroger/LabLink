import React from 'react';
const StatusBadge = ({ status }) => {
  const styles = {
    pending:    'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800',
    available:  'bg-green-100 text-green-800',
    reviewed:   'bg-purple-100 text-purple-800',
    sent:       'bg-green-100 text-green-800',
    failed:     'bg-red-100 text-red-800',
    read:       'bg-gray-100 text-gray-600',
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium
                      capitalize ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  );
};

export default StatusBadge;