/**
 * RBAC Service
 * 
 * Service for interacting with the Role-Based Access Control API.
 * Provides methods for managing permissions, roles, and role assignments.
 */

const API_BASE_URL = 'http://127.0.0.1:8000/api/rbac';

// ============================================================================
// Type Definitions
// ============================================================================

export interface Permission {
  id: number;
  code: string;
  name: string;
  description: string;
  category: string;
  category_display: string;
  is_system: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface PermissionList {
  id: number;
  code: string;
  name: string;
  category: string;
  is_active: boolean;
}

export interface Role {
  id: number;
  name: string;
  code: string;
  description: string;
  level: number;
  level_display: string;
  approval_scope: 'none' | 'program' | 'department' | 'organization' | 'all';
  approval_scope_display: string;
  is_system: boolean;
  is_active: boolean;
  can_be_assigned: boolean;
  permissions_list: PermissionList[];
  permission_codes: string[];
  employee_count: number;
  created_at: string;
  updated_at: string;
  created_by: number | null;
  created_by_name: string | null;
}

export interface RoleList {
  id: number;
  name: string;
  code: string;
  level: number;
  level_display: string;
  approval_scope: string;
  approval_scope_display: string;
  is_system: boolean;
  is_active: boolean;
  can_be_assigned: boolean;
  employee_count: number;
  permission_count: number;
}

export interface EmployeeRole {
  id: number;
  employee: number;
  employee_name: string;
  employee_id: string;
  employee_email: string;
  role: number;
  role_name: string;
  role_code: string;
  role_level: number;
  department_scope: number | null;
  department_scope_name: string | null;
  program_scope: number | null;
  program_scope_name: string | null;
  is_primary: boolean;
  is_active: boolean;
  valid_from: string | null;
  valid_until: string | null;
  is_currently_valid: boolean;
  assigned_at: string;
  assigned_by: number | null;
  assigned_by_name: string | null;
  notes: string;
}

export interface PermissionModule {
  id: number;
  name: string;
  code: string;
  description: string;
  icon: string;
  order: number;
  is_active: boolean;
  permissions: PermissionList[];
  created_at: string;
  updated_at: string;
}

export interface EmployeePermissions {
  employee_id: number;
  employee_name: string;
  primary_role: {
    id: number;
    name: string;
    code: string;
    level: number;
    approval_scope: string;
  } | null;
  all_roles: {
    id: number;
    name: string;
    code: string;
    level: number;
    is_primary: boolean;
    department_scope: string | null;
    program_scope: string | null;
  }[];
  effective_permissions: string[];
  highest_level: number;
  approval_scope: string;
  is_hr: boolean;
  can_approve: boolean;
}

export interface RBACChangeLog {
  id: number;
  action: string;
  action_display: string;
  model_type: string;
  model_type_display: string;
  model_id: number;
  previous_value: any;
  new_value: any;
  performed_by: number | null;
  performed_by_name: string | null;
  performed_at: string;
  ip_address: string | null;
  user_agent: string;
  affected_employee: number | null;
  affected_employee_name: string | null;
  notes: string;
}

export interface RBACStats {
  total_permissions: number;
  total_roles: number;
  total_assignments: number;
  system_roles: number;
  recent_changes: number;
  roles_by_level: { level: number; count: number }[];
}

export interface PermissionCategory {
  category: string;
  category_display: string;
  permissions: PermissionList[];
}

export interface CreateRolePayload {
  name: string;
  code: string;
  description?: string;
  level: number;
  approval_scope: string;
  is_active?: boolean;
  can_be_assigned?: boolean;
  permission_ids?: number[];
}

export interface AssignRolePayload {
  employee: number;
  role: number;
  department_scope?: number | null;
  program_scope?: number | null;
  is_primary?: boolean;
  is_active?: boolean;
  valid_from?: string | null;
  valid_until?: string | null;
  notes?: string;
}

export interface BulkAssignPayload {
  employee_ids: number[];
  role_id: number;
  department_scope?: number | null;
  program_scope?: number | null;
  is_primary?: boolean;
  valid_from?: string | null;
  valid_until?: string | null;
  notes?: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

const getHeaders = (): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  // Add auth token if available
  const token = localStorage.getItem('authToken');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Add employee email header
  const employeeData = localStorage.getItem('employeeData');
  if (employeeData) {
    try {
      const employee = JSON.parse(employeeData);
      if (employee.email) {
        headers['X-Employee-Email'] = employee.email;
      }
    } catch (e) {
      // Ignore parse errors
    }
  }
  
  return headers;
};

const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || errorData.detail || `HTTP error ${response.status}`);
  }
  const data = await response.json();
  
  // Handle DRF paginated responses - extract results array if present
  if (data && typeof data === 'object' && 'results' in data && Array.isArray(data.results)) {
    return data.results as T;
  }
  
  return data;
};

// ============================================================================
// RBAC Service Class
// ============================================================================

class RBACService {
  // ==========================================================================
  // Permissions
  // ==========================================================================

  /**
   * Get all permissions
   */
  async getPermissions(): Promise<PermissionList[]> {
    const response = await fetch(`${API_BASE_URL}/permissions/`, {
      headers: getHeaders(),
    });
    return handleResponse<PermissionList[]>(response);
  }

  /**
   * Get a single permission by ID
   */
  async getPermission(id: number): Promise<Permission> {
    const response = await fetch(`${API_BASE_URL}/permissions/${id}/`, {
      headers: getHeaders(),
    });
    return handleResponse<Permission>(response);
  }

  /**
   * Get active permissions only
   */
  async getActivePermissions(): Promise<PermissionList[]> {
    const response = await fetch(`${API_BASE_URL}/permissions/active/`, {
      headers: getHeaders(),
    });
    return handleResponse<PermissionList[]>(response);
  }

  /**
   * Get permissions grouped by category
   */
  async getPermissionsByCategory(): Promise<PermissionCategory[]> {
    const response = await fetch(`${API_BASE_URL}/permissions/by_category/`, {
      headers: getHeaders(),
    });
    return handleResponse<PermissionCategory[]>(response);
  }

  /**
   * Create a new permission
   */
  async createPermission(data: Partial<Permission>): Promise<Permission> {
    const response = await fetch(`${API_BASE_URL}/permissions/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Permission>(response);
  }

  /**
   * Update a permission
   */
  async updatePermission(id: number, data: Partial<Permission>): Promise<Permission> {
    const response = await fetch(`${API_BASE_URL}/permissions/${id}/`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Permission>(response);
  }

  /**
   * Delete a permission (non-system only)
   */
  async deletePermission(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/permissions/${id}/`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to delete permission');
    }
  }

  // ==========================================================================
  // Roles
  // ==========================================================================

  /**
   * Get all roles
   */
  async getRoles(): Promise<RoleList[]> {
    const response = await fetch(`${API_BASE_URL}/roles/`, {
      headers: getHeaders(),
    });
    return handleResponse<RoleList[]>(response);
  }

  /**
   * Get a single role by ID with full details
   */
  async getRole(id: number): Promise<Role> {
    const response = await fetch(`${API_BASE_URL}/roles/${id}/`, {
      headers: getHeaders(),
    });
    return handleResponse<Role>(response);
  }

  /**
   * Get roles that can be assigned to employees
   */
  async getAssignableRoles(): Promise<RoleList[]> {
    const response = await fetch(`${API_BASE_URL}/roles/assignable/`, {
      headers: getHeaders(),
    });
    return handleResponse<RoleList[]>(response);
  }

  /**
   * Create a new role
   */
  async createRole(data: CreateRolePayload): Promise<Role> {
    const response = await fetch(`${API_BASE_URL}/roles/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Role>(response);
  }

  /**
   * Update a role
   */
  async updateRole(id: number, data: Partial<CreateRolePayload>): Promise<Role> {
    const response = await fetch(`${API_BASE_URL}/roles/${id}/`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<Role>(response);
  }

  /**
   * Delete a role (non-system only, must have no active assignments)
   */
  async deleteRole(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/roles/${id}/`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to delete role');
    }
  }

  /**
   * Duplicate a role
   */
  async duplicateRole(id: number, name: string, code: string): Promise<Role> {
    const response = await fetch(`${API_BASE_URL}/roles/${id}/duplicate/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ name, code }),
    });
    return handleResponse<Role>(response);
  }

  /**
   * Add a permission to a role
   */
  async addPermissionToRole(roleId: number, permissionId: number): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE_URL}/roles/${roleId}/add_permission/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ permission_id: permissionId }),
    });
    return handleResponse<{ message: string }>(response);
  }

  /**
   * Remove a permission from a role
   */
  async removePermissionFromRole(roleId: number, permissionId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/roles/${roleId}/remove_permission/${permissionId}/`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to remove permission');
    }
  }

  /**
   * Get employees with a specific role
   */
  async getRoleEmployees(roleId: number): Promise<EmployeeRole[]> {
    const response = await fetch(`${API_BASE_URL}/roles/${roleId}/employees/`, {
      headers: getHeaders(),
    });
    return handleResponse<EmployeeRole[]>(response);
  }

  // ==========================================================================
  // Employee Roles
  // ==========================================================================

  /**
   * Get all employee role assignments
   */
  async getEmployeeRoles(): Promise<EmployeeRole[]> {
    const response = await fetch(`${API_BASE_URL}/employee-roles/`, {
      headers: getHeaders(),
    });
    return handleResponse<EmployeeRole[]>(response);
  }

  /**
   * Get roles for a specific employee
   */
  async getEmployeeRolesById(employeeId: number): Promise<EmployeeRole[]> {
    const response = await fetch(`${API_BASE_URL}/employee-roles/by_employee/${employeeId}/`, {
      headers: getHeaders(),
    });
    return handleResponse<EmployeeRole[]>(response);
  }

  /**
   * Assign a role to an employee
   */
  async assignRole(data: AssignRolePayload): Promise<EmployeeRole> {
    const response = await fetch(`${API_BASE_URL}/employee-roles/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<EmployeeRole>(response);
  }

  /**
   * Update a role assignment
   */
  async updateRoleAssignment(id: number, data: Partial<AssignRolePayload>): Promise<EmployeeRole> {
    const response = await fetch(`${API_BASE_URL}/employee-roles/${id}/`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<EmployeeRole>(response);
  }

  /**
   * Remove a role assignment
   */
  async removeRoleAssignment(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/employee-roles/${id}/`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to remove role assignment');
    }
  }

  /**
   * Set a role assignment as primary
   */
  async setRolePrimary(id: number): Promise<EmployeeRole> {
    const response = await fetch(`${API_BASE_URL}/employee-roles/${id}/set_primary/`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse<EmployeeRole>(response);
  }

  /**
   * Bulk assign a role to multiple employees
   */
  async bulkAssignRole(data: BulkAssignPayload): Promise<{
    created: number;
    created_ids: number[];
    errors: { employee_id: number; error: string }[];
  }> {
    const response = await fetch(`${API_BASE_URL}/employee-roles/bulk_assign/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  }

  // ==========================================================================
  // Employee Permissions
  // ==========================================================================

  /**
   * Get complete permissions profile for an employee by ID
   */
  async getEmployeePermissions(employeeId: number): Promise<EmployeePermissions> {
    const response = await fetch(`${API_BASE_URL}/employee/${employeeId}/permissions/`, {
      headers: getHeaders(),
    });
    return handleResponse<EmployeePermissions>(response);
  }

  /**
   * Get complete permissions profile for an employee by email
   */
  async getEmployeePermissionsByEmail(email: string): Promise<EmployeePermissions> {
    const response = await fetch(`${API_BASE_URL}/employee/permissions/by-email/?email=${encodeURIComponent(email)}`, {
      headers: getHeaders(),
    });
    return handleResponse<EmployeePermissions>(response);
  }

  /**
   * Check if an employee has a specific permission
   */
  async checkPermission(employeeId: number, permissionCode: string): Promise<{
    has_permission: boolean;
    granted_by_role?: string;
  }> {
    const response = await fetch(`${API_BASE_URL}/check-permission/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({
        employee_id: employeeId,
        permission_code: permissionCode,
      }),
    });
    return handleResponse(response);
  }

  // ==========================================================================
  // Permission Modules
  // ==========================================================================

  /**
   * Get all permission modules
   */
  async getModules(): Promise<PermissionModule[]> {
    const response = await fetch(`${API_BASE_URL}/modules/`, {
      headers: getHeaders(),
    });
    return handleResponse<PermissionModule[]>(response);
  }

  /**
   * Get a single module
   */
  async getModule(id: number): Promise<PermissionModule> {
    const response = await fetch(`${API_BASE_URL}/modules/${id}/`, {
      headers: getHeaders(),
    });
    return handleResponse<PermissionModule>(response);
  }

  /**
   * Create a permission module
   */
  async createModule(data: Partial<PermissionModule> & { permission_ids?: number[] }): Promise<PermissionModule> {
    const response = await fetch(`${API_BASE_URL}/modules/`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<PermissionModule>(response);
  }

  /**
   * Update a permission module
   */
  async updateModule(id: number, data: Partial<PermissionModule> & { permission_ids?: number[] }): Promise<PermissionModule> {
    const response = await fetch(`${API_BASE_URL}/modules/${id}/`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse<PermissionModule>(response);
  }

  // ==========================================================================
  // Change Logs
  // ==========================================================================

  /**
   * Get RBAC change logs
   */
  async getChangeLogs(params?: {
    start_date?: string;
    end_date?: string;
    action?: string;
    employee_id?: number;
  }): Promise<RBACChangeLog[]> {
    const queryParams = new URLSearchParams();
    if (params?.start_date) queryParams.append('start_date', params.start_date);
    if (params?.end_date) queryParams.append('end_date', params.end_date);
    if (params?.action) queryParams.append('action', params.action);
    if (params?.employee_id) queryParams.append('employee_id', params.employee_id.toString());
    
    const url = `${API_BASE_URL}/change-logs/${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await fetch(url, {
      headers: getHeaders(),
    });
    return handleResponse<RBACChangeLog[]>(response);
  }

  // ==========================================================================
  // Statistics
  // ==========================================================================

  /**
   * Get RBAC system statistics
   */
  async getStats(): Promise<RBACStats> {
    const response = await fetch(`${API_BASE_URL}/stats/`, {
      headers: getHeaders(),
    });
    return handleResponse<RBACStats>(response);
  }
}

// Export singleton instance
const rbacService = new RBACService();
export default rbacService;

// Also export the class for testing
export { RBACService };
