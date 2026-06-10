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