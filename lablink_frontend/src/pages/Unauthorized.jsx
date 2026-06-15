import React from 'react';
import { useNavigate } from 'react-router-dom';

const Unauthorized = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center
                    justify-center bg-gray-50">
      <div className="text-center">
        <p className="text-8xl font-bold text-gray-200 mb-4">403</p>
        <p className="text-xl font-semibold text-gray-700 mb-2">
          Access denied
        </p>
        <p className="text-gray-500 mb-6">
          You do not have permission to view this page.
        </p>
        <button
          onClick={() => navigate('/login')}
          className="btn-primary"
        >
          Back to login
        </button>
      </div>
    </div>
  );
};

export default Unauthorized;