import React from 'react';
import { useEffect, useState } from 'react';
import Layout from '../../components/layout/Layout';
import { useAuth } from '../../context/AuthContext';
import { getProfile, updateProfile, changePassword } from '../../api/auth';
import api from '../../api/axios';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { User, Lock, Save } from 'lucide-react';

const MyProfile = () => {
  const { user } = useAuth();
  const [patientProfile, setPatientProfile] = useState(null);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [tab, setTab]           = useState('profile');

  const {
    register: regProfile,
    handleSubmit: handleProfile,
    reset: resetProfile,
    formState: { errors: profileErrors },
  } = useForm();

  const {
    register: regPw,
    handleSubmit: handlePw,
    reset: resetPw,
    watch,
    formState: { errors: pwErrors },
  } = useForm();

  const newPw = watch('new_password');

  useEffect(() => {
    Promise.all([
      getProfile(),
      api.get('/patients/profile/').catch(() => ({ data: null })),
    ]).then(([profileRes, patientRes]) => {
      const u = profileRes.data;
      const p = patientRes.data;
      setPatientProfile(p);
      resetProfile({
        first_name: u.first_name,
        last_name: u.last_name,
        email: u.email,
        phone: p?.phone || '',
        date_of_birth: p?.date_of_birth || '',
        gender: p?.gender || '',
        address: p?.address || '',
        blood_group: p?.blood_group || '',
        allergies: p?.allergies || '',
        emergency_contact_name: p?.emergency_contact_name || '',
        emergency_contact_phone: p?.emergency_contact_phone || '',
        insurance_provider: p?.insurance_provider || '',
        insurance_card_number: p?.insurance_card_number || '',
      });
    }).finally(() => setLoading(false));
  }, []);

  const onSaveProfile = async (data) => {
    setSaving(true);
    try {
      await updateProfile({
        first_name: data.first_name,
        last_name: data.last_name,
      });
      if (patientProfile) {
        await api.patch('/patients/profile/', {
          phone: data.phone,
          date_of_birth: data.date_of_birth,
          gender: data.gender,
          address: data.address,
          blood_group: data.blood_group,
          allergies: data.allergies,
          emergency_contact_name: data.emergency_contact_name,
          emergency_contact_phone: data.emergency_contact_phone,
          insurance_provider: data.insurance_provider,
          insurance_card_number: data.insurance_card_number,
        });
      } else {
        await api.post('/patients/create/', {
          phone: data.phone,
          date_of_birth: data.date_of_birth,
          gender: data.gender,
          address: data.address,
          blood_group: data.blood_group,
          allergies: data.allergies,
          emergency_contact_name: data.emergency_contact_name,
          emergency_contact_phone: data.emergency_contact_phone,
          insurance_provider: data.insurance_provider,
          insurance_card_number: data.insurance_card_number,
        });
      }
      toast.success('Profile updated successfully.');
    } catch {
      toast.error('Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const onChangePassword = async (data) => {
    setSavingPw(true);
    try {
      await changePassword(data);
      toast.success('Password changed successfully.');
      resetPw();
    } catch (err) {
      const msg = err.response?.data?.old_password ||
                  err.response?.data?.new_password ||
                  'Failed to change password.';
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setSavingPw(false);
    }
  };

  return (
    <Layout title="My Profile">
      <div className="max-w-2xl mx-auto space-y-6">

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
          {[
            { key: 'profile',  icon: User, label: 'Profile' },
            { key: 'password', icon: Lock, label: 'Password' },
          ].map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg
                          text-sm font-medium transition-colors
                          ${tab === key
                            ? 'bg-white text-primary-700 shadow-sm'
                            : 'text-gray-500 hover:text-gray-700'
                          }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Profile tab */}
        {tab === 'profile' && (
          <div className="card">
            <h3 className="font-semibold text-gray-800 mb-6">
              Personal information
            </h3>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i}
                       className="h-10 bg-gray-100 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              <form
                onSubmit={handleProfile(onSaveProfile)}
                className="space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium
                                      text-gray-700 mb-1">
                      First name
                    </label>
                    <input
                      className="input-field"
                      {...regProfile('first_name', {
                        required: 'Required',
                      })}
                    />
                    {profileErrors.first_name && (
                      <p className="text-red-500 text-xs mt-1">
                        {profileErrors.first_name.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium
                                      text-gray-700 mb-1">
                      Last name
                    </label>
                    <input
                      className="input-field"
                      {...regProfile('last_name', {
                        required: 'Required',
                      })}
                    />
                    {profileErrors.last_name && (
                      <p className="text-red-500 text-xs mt-1">
                        {profileErrors.last_name.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium
                                    text-gray-700 mb-1">
                    Email address
                  </label>
                  <input
                    className="input-field bg-gray-50 cursor-not-allowed"
                    disabled
                    {...regProfile('email')}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium
                                      text-gray-700 mb-1">
                      Phone
                    </label>
                    <input
                      className="input-field"
                      placeholder="+250 7XX XXX XXX"
                      {...regProfile('phone')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium
                                      text-gray-700 mb-1">
                      Date of birth
                    </label>
                    <input
                      type="date"
                      className="input-field"
                      {...regProfile('date_of_birth')}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium
                                      text-gray-700 mb-1">
                      Gender
                    </label>
                    <select
                      className="input-field"
                      {...regProfile('gender')}
                    >
                      <option value="">Select gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium
                                      text-gray-700 mb-1">
                      Blood group
                    </label>
                    <select
                      className="input-field"
                      {...regProfile('blood_group')}
                    >
                      <option value="">Select blood group</option>
                      {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(
                        (bg) => (
                          <option key={bg} value={bg}>{bg}</option>
                        )
                      )}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium
                                    text-gray-700 mb-1">
                    Address
                  </label>
                  <textarea
                    rows={2}
                    className="input-field resize-none"
                    placeholder="Your physical address"
                    {...regProfile('address')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium
                                    text-gray-700 mb-1">
                    Allergies
                  </label>
                  <textarea
                    rows={2}
                    className="input-field resize-none"
                    placeholder="List any known allergies"
                    {...regProfile('allergies')}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium
                                      text-gray-700 mb-1">
                      Emergency contact name
                    </label>
                    <input
                      className="input-field"
                      placeholder="Full name"
                      {...regProfile('emergency_contact_name')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium
                                      text-gray-700 mb-1">
                      Emergency contact phone
                    </label>
                    <input
                      className="input-field"
                      placeholder="+250 7XX XXX XXX"
                      {...regProfile('emergency_contact_phone')}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium
                                      text-gray-700 mb-1">
                      Insurance provider
                    </label>
                    <input
                      className="input-field"
                      placeholder="e.g. NHIF, AAR, Jubilee"
                      {...regProfile('insurance_provider')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium
                                      text-gray-700 mb-1">
                      Insurance card number
                    </label>
                    <input
                      className="input-field"
                      placeholder="Card / membership number"
                      {...regProfile('insurance_card_number')}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={saving}
                  className="btn-primary flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {saving ? 'Saving...' : 'Save changes'}
                </button>

              </form>
            )}
          </div>
        )}

        {/* Password tab */}
        {tab === 'password' && (
          <div className="card">
            <h3 className="font-semibold text-gray-800 mb-6">
              Change password
            </h3>

            <form
              onSubmit={handlePw(onChangePassword)}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium
                                  text-gray-700 mb-1">
                  Current password
                </label>
                <input
                  type="password"
                  className={`input-field ${pwErrors.old_password
                    ? 'border-red-400' : ''}`}
                  placeholder="Enter current password"
                  {...regPw('old_password', {
                    required: 'Current password is required',
                  })}
                />
                {pwErrors.old_password && (
                  <p className="text-red-500 text-xs mt-1">
                    {pwErrors.old_password.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium
                                  text-gray-700 mb-1">
                  New password
                </label>
                <input
                  type="password"
                  className={`input-field ${pwErrors.new_password
                    ? 'border-red-400' : ''}`}
                  placeholder="Min 8 characters"
                  {...regPw('new_password', {
                    required: 'New password is required',
                    minLength: {
                      value: 8,
                      message: 'Minimum 8 characters',
                    },
                  })}
                />
                {pwErrors.new_password && (
                  <p className="text-red-500 text-xs mt-1">
                    {pwErrors.new_password.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium
                                  text-gray-700 mb-1">
                  Confirm new password
                </label>
                <input
                  type="password"
                  className={`input-field ${pwErrors.new_password2
                    ? 'border-red-400' : ''}`}
                  placeholder="Repeat new password"
                  {...regPw('new_password2', {
                    required: 'Please confirm your password',
                    validate: (v) =>
                      v === newPw || 'Passwords do not match',
                  })}
                />
                {pwErrors.new_password2 && (
                  <p className="text-red-500 text-xs mt-1">
                    {pwErrors.new_password2.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={savingPw}
                className="btn-primary flex items-center gap-2"
              >
                <Lock className="w-4 h-4" />
                {savingPw ? 'Updating...' : 'Update password'}
              </button>

            </form>
          </div>
        )}

      </div>
    </Layout>
  );
};

export default MyProfile;