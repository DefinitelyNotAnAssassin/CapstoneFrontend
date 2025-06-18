// Leave Management Service - API-based
// Connects to Django REST API for role-based leave management

import AuthService from './AuthService';

const API_BASE_URL = 'http://127.0.0.1:8000';

interface LeaveRequest {
  id?: number;
  employee: any;
  leave_type: string;
  start_date: string;
  end_date: string;
  days_requested: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
  approved_by?: any;
  approval_date?: string;
  approval_notes?: string;
  supporting_documents?: string[];
  created_at?: string;
  updated_at?: string;
  employee_email?: string; // Added for API calls
}

interface LeaveCredit {
  id?: number;
  employee: any;
  leave_type: string;
  year: number;
  total_credits: number;
  used_credits: number;
  remaining_credits: number;
}

interface LeavePolicy {
  id?: number;
  leave_type: string;
  days_allowed: number;
  description: string;
  requires_approval: boolean;
  requires_documentation: boolean;
  applicable_positions: string[];
  employee_email?: string; // Added for API calls
}

interface ApprovalHierarchy {
  employee: {
    name: string;
    position: string;
    role_level: number;
  };
  potential_approvers: Array<{
    id: number;
    name: string;
    position: string;
    department: string;
    role_level: number;
    approval_scope: string;
  }>;
}

class LeaveService {
  private getAuthHeaders() {
    const token = AuthService.getAuthToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Token ${token}` })
    };
  }

  private getCurrentUserEmail() {
    return AuthService.getCurrentUser()?.email || '';
  }

  private async handleResponse(response: Response) {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }
    return response.json();
  }

  // Helper to add email to GET query params
  private addEmailToUrl(url: string): string {
    const email = this.getCurrentUserEmail();
    if (!email) return url;
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}employee_email=${encodeURIComponent(email)}`;
  }

  // Leave Requests
  async getMyLeaveRequests(employeeId?: number): Promise<LeaveRequest[]> {
    const url = this.addEmailToUrl(`${API_BASE_URL}/api/leave-requests/my_requests/`);
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
    const data = await this.handleResponse(response);
    
    // Handle paginated response format
    if (data && typeof data === 'object' && 'results' in data) {
      return data.results;
    }
    
    // Handle direct array response
    if (Array.isArray(data)) {
      return data;
    }
    
    // Fallback to empty array
    return [];
  }

  async getLeaveRequestsForEmployee(employeeId: number): Promise<LeaveRequest[]> {
    const url = this.addEmailToUrl(`${API_BASE_URL}/api/leave-requests/by_employee/?employee_id=${employeeId}`);
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
    const data = await this.handleResponse(response);
    
    // Handle paginated response format
    if (data && typeof data === 'object' && 'results' in data) {
      return data.results;
    }
    
    // Handle direct array response
    if (Array.isArray(data)) {
      return data;
    }
    
    // Fallback to empty array
    return [];
  }

  async createMyLeaveRequest(requestData: Omit<Partial<LeaveRequest>, 'employee'>): Promise<{ message: string; request: LeaveRequest }> {
    requestData.employee_email = this.getCurrentUserEmail();
    const response = await fetch(`${API_BASE_URL}/api/leave-requests/create_my_request/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(requestData)
    });
    return this.handleResponse(response);
  }  async createLeaveRequest(requestData: Partial<LeaveRequest>): Promise<LeaveRequest> {
    requestData.employee_email = this.getCurrentUserEmail();
    const response = await fetch(`${API_BASE_URL}/api/leave-requests/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(requestData)
    });
    return this.handleResponse(response);
  }

  async updateLeaveRequest(id: number, requestData: Partial<LeaveRequest>): Promise<LeaveRequest> {
    requestData.employee_email = this.getCurrentUserEmail();
    const response = await fetch(`${API_BASE_URL}/api/leave-requests/${id}/`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(requestData)
    });
    return this.handleResponse(response);
  }

  async cancelLeaveRequest(id: number): Promise<LeaveRequest> {
    return this.updateLeaveRequest(id, { status: 'Cancelled' });
  }

  // Role-based approval methods
  async getPendingApprovalsForMe(): Promise<{
    requests: LeaveRequest[];
    approver_info: {
      name: string;
      position: string;
      role_level: number;
      approval_scope: string;
    };
  }> {
    const url = this.addEmailToUrl(`${API_BASE_URL}/api/leave-requests/pending_for_approval/`);
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }

  async approveLeaveRequest(id: number, approvalNotes: string = ''): Promise<{ message: string; request: LeaveRequest }> {
    const body = { approval_notes: approvalNotes, employee_email: this.getCurrentUserEmail() };
    const response = await fetch(`${API_BASE_URL}/api/leave-requests/${id}/approve_request/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(body)
    });
    return this.handleResponse(response);
  }

  async rejectLeaveRequest(id: number, rejectionReason: string): Promise<{ message: string; request: LeaveRequest }> {
    const body = { approval_notes: rejectionReason, employee_email: this.getCurrentUserEmail() };
    const response = await fetch(`${API_BASE_URL}/api/leave-requests/${id}/reject_request/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(body)
    });
    return this.handleResponse(response);
  }

  async getApprovalHierarchy(): Promise<ApprovalHierarchy> {
    const url = this.addEmailToUrl(`${API_BASE_URL}/api/leave-requests/approval_hierarchy/`);
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
    return this.handleResponse(response);
  }  // Leave Credits
  async getMyLeaveCredits(): Promise<LeaveCredit[]> {
    const url = this.addEmailToUrl(`${API_BASE_URL}/api/leave-credits/my_credits/`);
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
    const data = await this.handleResponse(response);
    
    // Handle paginated response format
    let credits = [];
    if (data && typeof data === 'object' && 'results' in data) {
      credits = data.results;
    } else if (Array.isArray(data)) {
      credits = data;
    }
    
    // Transform the response to convert string numbers to actual numbers
    return credits.map((credit: any) => ({
      ...credit,
      total_credits: parseFloat(credit.total_credits) || 0,
      used_credits: parseFloat(credit.used_credits) || 0,
      remaining_credits: parseFloat(credit.remaining_credits) || 0
    }));
  }

  async getLeaveCreditsForEmployee(employeeId: number): Promise<LeaveCredit[]> {
    const url = this.addEmailToUrl(`${API_BASE_URL}/api/leave-credits/by_employee/?employee_id=${employeeId}`);
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
    const data = await this.handleResponse(response);
    
    // Handle paginated response format
    let credits = [];
    if (data && typeof data === 'object' && 'results' in data) {
      credits = data.results;
    } else if (Array.isArray(data)) {
      credits = data;
    }
    
    // Transform the response to convert string numbers to actual numbers
    return credits.map((credit: any) => ({
      ...credit,
      total_credits: parseFloat(credit.total_credits) || 0,
      used_credits: parseFloat(credit.used_credits) || 0,
      remaining_credits: parseFloat(credit.remaining_credits) || 0
    }));
  }
  // Leave Policies
  async getLeavePolicies(): Promise<LeavePolicy[]> {
    const url = this.addEmailToUrl(`${API_BASE_URL}/api/leave-policies/`);
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
    const data = await this.handleResponse(response);
    
    // Handle paginated response format
    if (data && typeof data === 'object' && 'results' in data) {
      return data.results;
    }
    
    // Handle direct array response
    if (Array.isArray(data)) {
      return data;
    }
    
    // Fallback to empty array
    return [];
  }

  async createLeavePolicy(policyData: Partial<LeavePolicy>): Promise<LeavePolicy> {
    policyData.employee_email = this.getCurrentUserEmail();
    const response = await fetch(`${API_BASE_URL}/api/leave-policies/`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(policyData)
    });
    return this.handleResponse(response);
  }

  async updateLeavePolicy(id: number, policyData: Partial<LeavePolicy>): Promise<LeavePolicy> {
    policyData.employee_email = this.getCurrentUserEmail();
    const response = await fetch(`${API_BASE_URL}/api/leave-policies/${id}/`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(policyData)
    });
    return this.handleResponse(response);
  }

  async deleteLeavePolicy(id: number): Promise<void> {
    const url = this.addEmailToUrl(`${API_BASE_URL}/api/leave-policies/${id}/`);
    const response = await fetch(url, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    if (!response.ok) {
      throw new Error(`Failed to delete policy: ${response.status}`);
    }
  }
  async getMyLeaveBalances(): Promise<any[]> {
    const url = this.addEmailToUrl(`${API_BASE_URL}/api/leave-balances/my_balances/`);
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getAuthHeaders()
    });
    const data = await this.handleResponse(response);
    
    // Handle paginated response format
    if (data && typeof data === 'object' && 'results' in data) {
      return data.results;
    }
    
    // Handle direct array response
    if (Array.isArray(data)) {
      return data;
    }
    
    // Fallback to empty array
    return [];
  }

  // Utility methods
  calculateBusinessDays(startDate: string, endDate: string): number {
    const start = new Date(startDate);
    const end = new Date(endDate);
    let businessDays = 0;
    
    const currentDate = new Date(start);
    while (currentDate <= end) {
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek !== 0) { // Not Sunday (0) - count Monday to Saturday
        businessDays++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return businessDays;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getLeaveTypeColor(leaveType: string): string {
    const colors: { [key: string]: string } = {
      'Vacation Leave': 'primary',
      'Sick Leave': 'warning',
      'Birthday Leave': 'success',
      'Solo Parent Leave': 'secondary',
      'Bereavement Leave': 'dark',
      'Paternity Leave': 'info',
      'Maternity Leave': 'info'
    };
    return colors[leaveType] || 'medium';
  }

  getStatusColor(status: string): string {
    const colors: { [key: string]: string } = {
      'Pending': 'warning',
      'Approved': 'success',
      'Rejected': 'danger',
      'Cancelled': 'medium'
    };
    return colors[status] || 'medium';
  }
}

// Create and export a singleton instance
const leaveService = new LeaveService();
export default leaveService;

// Export types for use in components
export type {
  LeaveRequest,
  LeaveCredit,
  LeavePolicy,
  ApprovalHierarchy
};
