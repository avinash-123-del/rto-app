import api from '../utils/api';

// Auth API
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// Party Type Master
export const partyTypeMasterAPI = {
  getAll: (params) => api.get('/party-type-master', { params }),
  getById: (id) => api.get(`/party-type-master/${id}`),
  create: (data) => api.post('/party-type-master', data),
  update: (id, data) => api.put(`/party-type-master/${id}`, data),
  delete: (id) => api.delete(`/party-type-master/${id}`),
  toggleActive: (id) => api.patch(`/party-type-master/${id}/toggle-active`),
};

// Document Type Master
export const documentTypeMasterAPI = {
  getAll: (params) => api.get('/document-type-master', { params }),
  getById: (id) => api.get(`/document-type-master/${id}`),
  create: (data) => api.post('/document-type-master', data),
  update: (id, data) => api.put(`/document-type-master/${id}`, data),
  delete: (id) => api.delete(`/document-type-master/${id}`),
  toggleActive: (id) => api.patch(`/document-type-master/${id}/toggle-active`),
};

// Expense Category Master
export const expenseCategoryMasterAPI = {
  getAll: (params) => api.get('/expense-category-master', { params }),
  getById: (id) => api.get(`/expense-category-master/${id}`),
  create: (data) => api.post('/expense-category-master', data),
  update: (id, data) => api.put(`/expense-category-master/${id}`, data),
  delete: (id) => api.delete(`/expense-category-master/${id}`),
  toggleActive: (id) => api.patch(`/expense-category-master/${id}/toggle-active`),
};

// Payment Mode Master
export const paymentModeMasterAPI = {
  getAll: (params) => api.get('/payment-mode-master', { params }),
  getById: (id) => api.get(`/payment-mode-master/${id}`),
  create: (data) => api.post('/payment-mode-master', data),
  update: (id, data) => api.put(`/payment-mode-master/${id}`, data),
  delete: (id) => api.delete(`/payment-mode-master/${id}`),
  toggleActive: (id) => api.patch(`/payment-mode-master/${id}/toggle-active`),
};

// System Config Master
export const systemConfigMasterAPI = {
  getAll: (params) => api.get('/system-config-master', { params }),
  getByKey: (key) => api.get(`/system-config-master/${key}`),
  create: (data) => api.post('/system-config-master', data),
  update: (key, data) => api.put(`/system-config-master/${key}`, data),
  delete: (key) => api.delete(`/system-config-master/${key}`),
};

// Parties
export const partyAPI = {
  getAll: (params) => api.get('/parties', { params }),
  getById: (id) => api.get(`/parties/${id}`),
  getBalance: (id) => api.get(`/parties/${id}/balance`),
  create: (data) => api.post('/parties', data),
  update: (id, data) => api.put(`/parties/${id}`, data),
  delete: (id) => api.delete(`/parties/${id}`),
  getVehicles: (partyId, params) => api.get(`/parties/${partyId}/vehicles`, { params }),
  createVehicle: (data) => api.post('/parties/vehicles', data),
  updateVehicle: (vehId, data) => api.put(`/parties/vehicles/${vehId}`, data),
  deleteVehicle: (vehId) => api.delete(`/parties/vehicles/${vehId}`),
};

// Ledgers
export const ledgerAPI = {
  getAll: (params) => api.get('/ledgers', { params }),
  getById: (id) => api.get(`/ledgers/${id}`),
  getSummary: () => api.get('/ledgers/summary'),
  getPartyDetails: (partyId, params) => api.get(`/ledgers/party/${partyId}/details`, { params }),
  getPartySummary: (partyId) => api.get(`/ledgers/party/${partyId}/summary`),
  create: (data) => api.post('/ledgers', data),
  update: (id, data) => api.put(`/ledgers/${id}`, data),
  delete: (id) => api.delete(`/ledgers/${id}`),
};

// Documents
export const documentAPI = {
  getAll: (params) => api.get('/documents', { params }),
  getById: (id) => api.get(`/documents/${id}`),
  getCounts: (params) => api.get('/documents/stats/counts', { params }),
  getExpiring: (params) => api.get('/documents/expiring', { params }),
  getExpired: () => api.get('/documents/expired'),
  create: (formData) =>
    api.post('/documents', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id, formData) =>
    api.put(`/documents/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  delete: (id) => api.delete(`/documents/${id}`),
};

// Expenses
export const expenseAPI = {
  getAll: (params) => api.get('/expenses', { params }),
  getById: (id) => api.get(`/expenses/${id}`),
  getSummary: (params) => api.get('/expenses/summary', { params }),
  create: (formData) =>
    api.post('/expenses', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  update: (id, formData) =>
    api.put(`/expenses/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  delete: (id) => api.delete(`/expenses/${id}`),
};

// Notifications
export const notificationAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  getById: (id) => api.get(`/notifications/${id}`),
  getUnreadCount: () => api.get('/notifications/unread-count'),
  create: (data) => api.post('/notifications', data),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
  deleteAll: () => api.delete('/notifications/delete-all'),
};

// Dashboard
export const dashboardAPI = {
  getStats: (params) => api.get('/dashboard/stats', { params }),
  getMonthlyRevenue: (params) => api.get('/dashboard/monthly-revenue', { params }),
  getExpenseBreakdown: (params) => api.get('/dashboard/expense-breakdown', { params }),
  getDocumentStatus: () => api.get('/dashboard/document-status'),
};

// Party Vehicles
export const partyVehicleAPI = {
  getByPartyId: (partyId, params) => api.get(`/partyvehicles/${partyId}`, { params }),
};

// Aliases
export const partyTypeAPI = partyTypeMasterAPI;
export const documentTypeAPI = documentTypeMasterAPI;
export const expenseCategoryAPI = expenseCategoryMasterAPI;
export const paymentModeAPI = paymentModeMasterAPI;
export const systemConfigAPI = systemConfigMasterAPI;

export const notificationTypeAPI = {
  getAll: (params) => api.get('/notification-type-master', { params }),
  getById: (id) => api.get(`/notification-type-master/${id}`),
  create: (data) => api.post('/notification-type-master', data),
  update: (id, data) => api.put(`/notification-type-master/${id}`, data),
  delete: (id) => api.delete(`/notification-type-master/${id}`),
  toggleActive: (id) => api.patch(`/notification-type-master/${id}/toggle-active`),
};
