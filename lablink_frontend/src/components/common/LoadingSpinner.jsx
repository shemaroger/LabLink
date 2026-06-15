import React from 'react';
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="w-10 h-10 border-4 border-primary-600
                    border-t-transparent rounded-full animate-spin" />
  </div>
);

export default LoadingSpinner;