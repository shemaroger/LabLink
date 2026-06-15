import React from 'react';
import { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import { uploadResult } from '../../api/results';
import api from '../../api/axios';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { Upload, FlaskConical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const UploadResult = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading]   = useState(false);
  const [loadingPx, setLoadingPx] = useState(true);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  useEffect(() => {
    api.get('/patients/list/')
      .then((res) => setPatients(res.data))
      .catch(() => toast.error('Failed to load patients.'))
      .finally(() => setLoadingPx(false));
  }, []);

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('patient', data.patient);
      formData.append('test_type', data.test_type);
      formData.append('test_name', data.test_name);
      formData.append('result_details', data.result_details);
      formData.append('status', data.status);
      formData.append('test_date', data.test_date);
      if (data.notes) formData.append('notes', data.notes);
      if (data.result_file?.[0]) {
        formData.append('result_file', data.result_file[0]);
      }
      await uploadResult(formData);
      toast.success('Result uploaded successfully.');
      reset();
      navigate('/staff/dashboard');
    } catch (err) {
      const errors = err.response?.data;
      if (errors) {
        Object.values(errors).forEach((msg) =>
          toast.error(Array.isArray(msg) ? msg[0] : msg)
        );
      } else {
        toast.error('Upload failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Upload Result">
      <div className="max-w-2xl mx-auto">
        <div className="card">

          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-primary-100 rounded-xl
                            flex items-center justify-center">
              <FlaskConical className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">
                New laboratory result
              </h3>
              <p className="text-sm text-gray-500">
                Fill in the details and upload the result file
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

            {/* Patient */}
            <div>
              <label className="block text-sm font-medium
                                text-gray-700 mb-1">
                Patient <span className="text-red-500">*</span>
              </label>
              {loadingPx ? (
                <div className="h-10 bg-gray-100 rounded-lg animate-pulse" />
              ) : (
                <select
                  className={`input-field ${errors.patient
                    ? 'border-red-400' : ''}`}
                  {...register('patient', {
                    required: 'Please select a patient',
                  })}
                >
                  <option value="">Select patient</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.full_name} — {p.email}
                    </option>
                  ))}
                </select>
              )}
              {errors.patient && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.patient.message}
                </p>
              )}
            </div>

            {/* Test type and name */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium
                                  text-gray-700 mb-1">
                  Test type <span className="text-red-500">*</span>
                </label>
                <select
                  className={`input-field ${errors.test_type
                    ? 'border-red-400' : ''}`}
                  {...register('test_type', {
                    required: 'Test type is required',
                  })}
                >
                  <option value="">Select type</option>
                  <option value="blood_test">Blood Test</option>
                  <option value="urine_test">Urine Test</option>
                  <option value="stool_test">Stool Test</option>
                  <option value="xray">X-Ray</option>
                  <option value="ultrasound">Ultrasound</option>
                  <option value="malaria">Malaria Test</option>
                  <option value="hiv">HIV Test</option>
                  <option value="glucose">Glucose Test</option>
                  <option value="cholesterol">Cholesterol Test</option>
                  <option value="liver_function">Liver Function Test</option>
                  <option value="kidney_function">Kidney Function Test</option>
                  <option value="full_blood_count">Full Blood Count</option>
                  <option value="other">Other</option>
                </select>
                {errors.test_type && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.test_type.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium
                                  text-gray-700 mb-1">
                  Test name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Complete Blood Count"
                  className={`input-field ${errors.test_name
                    ? 'border-red-400' : ''}`}
                  {...register('test_name', {
                    required: 'Test name is required',
                  })}
                />
                {errors.test_name && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.test_name.message}
                  </p>
                )}
              </div>
            </div>

            {/* Result details */}
            <div>
              <label className="block text-sm font-medium
                                text-gray-700 mb-1">
                Result details <span className="text-red-500">*</span>
              </label>
              <textarea
                rows={4}
                placeholder="Enter the full result details and findings..."
                className={`input-field resize-none ${errors.result_details
                  ? 'border-red-400' : ''}`}
                {...register('result_details', {
                  required: 'Result details are required',
                })}
              />
              {errors.result_details && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.result_details.message}
                </p>
              )}
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium
                                text-gray-700 mb-1">
                Notes <span className="text-gray-400">(optional)</span>
              </label>
              <textarea
                rows={2}
                placeholder="Additional notes or recommendations..."
                className="input-field resize-none"
                {...register('notes')}
              />
            </div>

            {/* Status and test date */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium
                                  text-gray-700 mb-1">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  className={`input-field ${errors.status
                    ? 'border-red-400' : ''}`}
                  {...register('status', {
                    required: 'Status is required',
                  })}
                >
                  <option value="">Select status</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="available">Available</option>
                  <option value="reviewed">Reviewed</option>
                </select>
                {errors.status && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.status.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium
                                  text-gray-700 mb-1">
                  Test date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  className={`input-field ${errors.test_date
                    ? 'border-red-400' : ''}`}
                  {...register('test_date', {
                    required: 'Test date is required',
                  })}
                />
                {errors.test_date && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.test_date.message}
                  </p>
                )}
              </div>
            </div>

            {/* File upload */}
            <div>
              <label className="block text-sm font-medium
                                text-gray-700 mb-1">
                Result file{' '}
                <span className="text-gray-400">(PDF, image)</span>
              </label>
              <div className="border-2 border-dashed border-gray-200
                              rounded-lg p-4 text-center hover:border-primary-300
                              transition-colors">
                <Upload className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500 mb-1">
                  Click to upload or drag and drop
                </p>
                <p className="text-xs text-gray-400">PDF, PNG, JPG up to 10MB</p>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  className="mt-3 block w-full text-sm text-gray-500
                             file:mr-4 file:py-1.5 file:px-3
                             file:rounded-lg file:border-0
                             file:text-sm file:font-medium
                             file:bg-primary-50 file:text-primary-600
                             hover:file:bg-primary-100 cursor-pointer"
                  {...register('result_file')}
                />
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                {loading ? 'Uploading...' : 'Upload result'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/staff/dashboard')}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>

          </form>
        </div>
      </div>
    </Layout>
  );
};

export default UploadResult;