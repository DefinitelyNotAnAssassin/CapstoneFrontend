// API Configuration
export const API_BASE_URL = 'http://127.0.0.1:8000/api';

// API Endpoints
export const API_ENDPOINTS = {
  employees: `${API_BASE_URL}/employees/`,
  leaveCredits: `${API_BASE_URL}/leave-credits/`,
  leavePolicies: `${API_BASE_URL}/leave-policies/`,
  leaveRequests: `${API_BASE_URL}/leave-requests/`,
  positions: `${API_BASE_URL}/positions/`,
  departments: `${API_BASE_URL}/departments/`,
  offices: `${API_BASE_URL}/offices/`,
  announcements: `${API_BASE_URL}/announcements/`,
}

// Auth header helper
export const getAuthHeaders = (token: string) => ({
  'Authorization': `Token ${token}`,
  'Content-Type': 'application/json',
})
