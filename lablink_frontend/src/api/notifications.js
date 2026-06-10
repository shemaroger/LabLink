import api from './axios';

export const getMyNotifications = () =>
  api.get('/notifications/my/');

export const getUnreadCount = () =>
  api.get('/notifications/unread-count/');

export const markAsRead = (id) =>
  api.patch(`/notifications/my/${id}/read/`);

export const markAllAsRead = () =>
  api.patch('/notifications/my/read-all/');