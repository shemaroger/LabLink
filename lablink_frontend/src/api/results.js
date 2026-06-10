import api from './axios';

export const getMyResults = () =>
  api.get('/results/my-results/');

export const getAllResults = (params) =>
  api.get('/results/list/', { params });

export const getResultDetail = (id) =>
  api.get(`/results/${id}/`);

export const uploadResult = (data) =>
  api.post('/results/create/', data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const updateResult = (id, data) =>
  api.patch(`/results/${id}/update/`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const updateResultStatus = (id, status) =>
  api.patch(`/results/${id}/status/`, { status });

export const deleteResult = (id) =>
  api.delete(`/results/${id}/delete/`);

export const downloadResult = (id) =>
  api.get(`/results/${id}/download/`, {
    responseType: 'blob',
  });