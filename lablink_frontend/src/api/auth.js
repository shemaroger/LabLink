import api from './axios';

export const loginUser = (data) =>
  api.post('/users/login/', data);

export const registerUser = (data) =>
  api.post('/users/register/', data);

export const logoutUser = (refresh) =>
  api.post('/users/logout/', { refresh });

export const getProfile = () =>
  api.get('/users/profile/');

export const updateProfile = (data) =>
  api.patch('/users/profile/', data);

export const changePassword = (data) =>
  api.post('/users/change-password/', data);

export const verifyMfaLogin = (data) =>
  api.post('/users/mfa/verify-login/', data);

export const setMfaEnabled = (enabled) =>
  api.patch('/users/mfa/', { enabled });

export const requestPasswordReset = (identifier) =>
  api.post('/users/password-reset/request/', { identifier });

export const confirmPasswordReset = (data) =>
  api.post('/users/password-reset/confirm/', data);

export const verifyEmail = (token) =>
  api.get('/users/verify-email/', { params: { token } });

export const resendVerificationEmail = () =>
  api.post('/users/resend-verification/');