/**
 * Role-Based Access Control Context (RBAC)
 * 
 * Manages user permissions and role-based UI rendering using the new
 * flexible RBAC system. Permissions are fetched from the backend and
 * can be customized by HR without code changes.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import AuthService from '../services/AuthService';
import rbacService, { EmployeePermissions, RoleList } from '../services/RBACService';

// ============================================================================
// Type Definitions
// ============================================================================

interface UserRole {
  id: number;
  name: string;
  code: string;
  level: number;
  approvalScope: 'none' | 'program' | 'department' | 'organization' | 'all';
  isPrimary: boolean;
  departmentScope?: string | null;
  programScope?: string | null;
}

interface RoleContextType {
  // User's roles and permissions
  primaryRole: UserRole | null;
  allRoles: UserRole[];
  permissions: string[];
  
  // Employee info
  employee: any | null;
  employeeId: number | null;
  
  // Loading state
  loading: boolean;
  error: string | null;
  
  // Permission checking methods
  hasPermission: (permissionCode: string) => boolean;
  hasAnyPermission: (permissionCodes: string[]) => boolean;
  hasAllPermissions: (permissionCodes: string[]) => boolean;
  
  // Role checking methods
  hasRole: (roleCode: string) => boolean;
  hasAnyRole: (roleCodes: string[]) => boolean;
  
  // Approval checking
  canApprove: boolean;
  approvalScope: string;
  highestLevel: number;
  canApproveFor: (targetEmployeeLevel: number) => boolean;
  
  // HR status
  isHR: boolean;
  
  // Actions
  refreshPermissions: () => Promise<void>;
  
  // Legacy compatibility
  userRole: {
    level: number;
    title: string;
    canApprove: boolean;
    approvalScope: string;
    permissions: {
      viewAllRequests: boolean;
      approveRequests: boolean;
      hrFinalApproval: boolean;
      manageLeaveCredits: boolean;
      manageLeavePolicies: boolean;
      viewReports: boolean;
      manageEmployees: boolean;
    };
  } | null;
}

// Default context value
const defaultContextValue: RoleContextType = {
  primaryRole: null,
  allRoles: [],
  permissions: [],
  employee: null,
  employeeId: null,
  loading: true,
  error: null,
  hasPermission: () => false,
  hasAnyPermission: () => false,
  hasAllPermissions: () => false,
  hasRole: () => false,
  hasAnyRole: () => false,
  canApprove: false,
  approvalScope: 'none',
  highestLevel: 99,
  canApproveFor: () => false,
  isHR: false,
  refreshPermissions: async () => {},
  userRole: null,
};

// Create context
const RoleContext = createContext<RoleContextType>(defaultContextValue);

// ============================================================================
// Hook
// ============================================================================

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};

// Also export as usePermissions for clearer naming
export const usePermissions = useRole;

// ============================================================================
// Provider Component
// ============================================================================

interface RoleProviderProps {
  children: ReactNode;
}

export const RoleProvider: React.FC<RoleProviderProps> = ({ children }) => {
  // State
  const [primaryRole, setPrimaryRole] = useState<UserRole | null>(null);
  const [allRoles, setAllRoles] = useState<UserRole[]>([]);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [employee, setEmployee] = useState<any | null>(null);
  const [employeeId, setEmployeeId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [canApprove, setCanApprove] = useState(false);
  const [approvalScope, setApprovalScope] = useState<string>('none');
  const [highestLevel, setHighestLevel] = useState<number>(99);
  const [isHR, setIsHR] = useState(false);

  // ==========================================================================
  // Permission Checking Methods
  // ==========================================================================

  const hasPermission = useCallback((permissionCode: string): boolean => {
    return permissions.includes(permissionCode);
  }, [permissions]);

  const hasAnyPermission = useCallback((permissionCodes: string[]): boolean => {
    return permissionCodes.some(code => permissions.includes(code));
  }, [permissions]);

  const hasAllPermissions = useCallback((permissionCodes: string[]): boolean => {
    return permissionCodes.every(code => permissions.includes(code));
  }, [permissions]);

  const hasRole = useCallback((roleCode: string): boolean => {
    return allRoles.some(role => role.code === roleCode);
  }, [allRoles]);

  const hasAnyRole = useCallback((roleCodes: string[]): boolean => {
    return roleCodes.some(code => allRoles.some(role => role.code === code));
  }, [allRoles]);

  const canApproveFor = useCallback((targetEmployeeLevel: number): boolean => {
    if (!canApprove) return false;
    return highestLevel < targetEmployeeLevel;
  }, [canApprove, highestLevel]);

  // ==========================================================================
  // Refresh Permissions from Backend
  // ==========================================================================

  const refreshPermissions = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const currentUser = AuthService.getCurrentUser();
      if (!currentUser) {
        console.log('RoleContext: No authenticated user found');
        resetState();
        return;
      }

      // Try to get employee data
      let empData = null;
      let empId: number | null = null;
      
      // First, try to get from localStorage
      const cachedEmployee = localStorage.getItem('employeeData');
      if (cachedEmployee) {
        try {
          empData = JSON.parse(cachedEmployee);
          empId = empData?.id ? Number(empData.id) : null;
        } catch (e) {
          console.error('Error parsing cached employee data:', e);
        }
      }

      // If no cached data, try to fetch by email
      if (!empId && currentUser.email) {
        try {
          const employeeService = (await import('../services/EmployeeServiceNew')).default;
          empData = await employeeService.getEmployeeByEmail(currentUser.email);
          empId = empData?.id ? Number(empData.id) : null;
          
          if (empData) {
            localStorage.setItem('employeeData', JSON.stringify(empData));
          }
        } catch (e) {
          console.error('Error fetching employee by email:', e);
        }
      }

      setEmployee(empData);
      setEmployeeId(empId);

      // Fetch permissions from RBAC API
      if (empId) {
        try {
          const permissionsData = await rbacService.getEmployeePermissions(empId);
          applyPermissionsData(permissionsData);
          console.log('RoleContext: Loaded permissions from RBAC API', permissionsData);
        } catch (e) {
          console.error('Error fetching RBAC permissions:', e);
          // Fall back to legacy role determination if RBAC fetch fails
          applyLegacyRole(empData);
        }
      } else {
        // No employee ID, use demo/fallback permissions
        console.log('RoleContext: No employee ID, using demo permissions');
        applyDemoPermissions(currentUser);
      }
    } catch (error) {
      console.error('Error refreshing permissions:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
      resetState();
    } finally {
      setLoading(false);
    }
  }, []);

  // ==========================================================================
  // Helper Functions
  // ==========================================================================

  const resetState = () => {
    setPrimaryRole(null);
    setAllRoles([]);
    setPermissions([]);
    setEmployee(null);
    setEmployeeId(null);
    setCanApprove(false);
    setApprovalScope('none');
    setHighestLevel(99);
    setIsHR(false);
    setLoading(false);
  };

  const applyPermissionsData = (data: EmployeePermissions) => {
    // Set permissions
    setPermissions(data.effective_permissions);
    
    // Set roles
    const roles: UserRole[] = data.all_roles.map(r => ({
      id: r.id,
      name: r.name,
      code: r.code,
      level: r.level,
      approvalScope: r.code === 'HR_ADMIN' ? 'all' : 
                     data.approval_scope as 'none' | 'program' | 'department' | 'organization' | 'all',
      isPrimary: r.is_primary,
      departmentScope: r.department_scope,
      programScope: r.program_scope,
    }));
    
    setAllRoles(roles);
    
    // Set primary role
    if (data.primary_role) {
      setPrimaryRole({
        id: data.primary_role.id,
        name: data.primary_role.name,
        code: data.primary_role.code,
        level: data.primary_role.level,
        approvalScope: data.primary_role.approval_scope as any,
        isPrimary: true,
      });
    }
    
    // Set other states
    setCanApprove(data.can_approve);
    setApprovalScope(data.approval_scope);
    setHighestLevel(data.highest_level);
    setIsHR(data.is_hr);
  };

  const applyLegacyRole = (empData: any) => {
    // Fallback to legacy role determination based on employee data
    if (!empData) {
      resetState();
      return;
    }

    let level = 99;
    let scope = 'none';
    let perms: string[] = ['leave_view_own', 'leave_create', 'leave_cancel_own', 
                           'employee_view_own', 'employee_edit_own', 'org_view'];
    let hr = false;
    let approve = false;

    // Check if HR
    if (empData.isHR || empData.department?.name?.toLowerCase().includes('hr')) {
      level = -1;
      scope = 'all';
      hr = true;
      approve = true;
      perms = [
        'leave_view_own', 'leave_create', 'leave_cancel_own', 'leave_view_all',
        'leave_approve_all', 'leave_final_approval', 'leave_reject',
        'leave_manage_credits', 'leave_manage_policies',
        'employee_view_all', 'employee_create', 'employee_edit_all',
        'reports_view_all', 'reports_export', 'reports_analytics',
        'org_view', 'org_manage_departments', 'org_manage_programs',
        'rbac_view', 'rbac_manage_roles', 'rbac_assign_roles',
        'audit_view', 'hr_full_access'
      ];
    } else if (empData.academic_role_level !== undefined) {
      level = empData.academic_role_level;
      
      if (level === 0) { // VPAA
        scope = 'all';
        approve = true;
        perms.push('leave_view_all', 'leave_approve_all', 'leave_reject', 
                   'leave_manage_credits', 'employee_view_all', 'reports_view_all');
      } else if (level === 1) { // Dean
        scope = 'department';
        approve = true;
        perms.push('leave_view_department', 'leave_approve_department', 'leave_reject',
                   'leave_manage_credits', 'employee_view_department', 'reports_view_department');
      } else if (level === 2) { // PC
        scope = 'program';
        approve = true;
        perms.push('leave_view_team', 'leave_approve_program', 'leave_reject',
                   'employee_view_team', 'reports_view_team');
      }
    }

    setPermissions(perms);
    setHighestLevel(level);
    setApprovalScope(scope);
    setCanApprove(approve);
    setIsHR(hr);
    
    // Create a mock role for legacy compatibility
    setPrimaryRole({
      id: 0,
      name: getLegacyRoleName(level),
      code: getLegacyRoleCode(level),
      level: level,
      approvalScope: scope as any,
      isPrimary: true,
    });
    
    setAllRoles([{
      id: 0,
      name: getLegacyRoleName(level),
      code: getLegacyRoleCode(level),
      level: level,
      approvalScope: scope as any,
      isPrimary: true,
    }]);
  };

  const applyDemoPermissions = (currentUser: any) => {
    // Demo admin for development
    const demoPerms = [
      'leave_view_own', 'leave_create', 'leave_cancel_own', 'leave_view_all',
      'leave_approve_all', 'leave_final_approval', 'leave_reject',
      'leave_manage_credits', 'leave_manage_policies',
      'employee_view_all', 'employee_create', 'employee_edit_all',
      'reports_view_all', 'reports_export', 'reports_analytics',
      'org_view', 'rbac_view', 'rbac_manage_roles', 'rbac_assign_roles',
      'audit_view', 'hr_full_access'
    ];
    
    setPermissions(demoPerms);
    setHighestLevel(0);
    setApprovalScope('all');
    setCanApprove(true);
    setIsHR(true);
    
    setPrimaryRole({
      id: 0,
      name: 'Demo Administrator',
      code: 'DEMO_ADMIN',
      level: 0,
      approvalScope: 'all',
      isPrimary: true,
    });
    
    setAllRoles([{
      id: 0,
      name: 'Demo Administrator',
      code: 'DEMO_ADMIN',
      level: 0,
      approvalScope: 'all',
      isPrimary: true,
    }]);
    
    setEmployee({
      id: 'demo-admin',
      full_name: 'Demo Administrator',
      position_title: 'System Administrator',
      email: currentUser.email,
      displayName: currentUser.displayName,
    });
  };

  const getLegacyRoleName = (level: number): string => {
    const names: { [key: number]: string } = {
      [-1]: 'HR Administrator',
      0: 'Vice President for Academic Affairs',
      1: 'Dean',
      2: 'Program Chair',
      3: 'Regular Faculty',
      4: 'Part-Time Faculty',
      5: 'Secretary',
    };
    return names[level] || 'Employee';
  };

  const getLegacyRoleCode = (level: number): string => {
    const codes: { [key: number]: string } = {
      [-1]: 'HR_ADMIN',
      0: 'VPAA',
      1: 'DEAN',
      2: 'PROGRAM_CHAIR',
      3: 'REGULAR_FACULTY',
      4: 'PART_TIME_FACULTY',
      5: 'SECRETARY',
    };
    return codes[level] || 'EMPLOYEE';
  };

  // ==========================================================================
  // Legacy userRole Compatibility
  // ==========================================================================

  const userRole = primaryRole ? {
    level: highestLevel,
    title: primaryRole.name,
    canApprove: canApprove,
    approvalScope: approvalScope,
    permissions: {
      viewAllRequests: hasPermission('leave_view_all'),
      approveRequests: hasAnyPermission(['leave_approve_program', 'leave_approve_department', 'leave_approve_all']),
      hrFinalApproval: hasPermission('leave_final_approval'),
      manageLeaveCredits: hasPermission('leave_manage_credits'),
      manageLeavePolicies: hasPermission('leave_manage_policies'),
      viewReports: hasAnyPermission(['reports_view_team', 'reports_view_department', 'reports_view_all']),
      manageEmployees: hasAnyPermission(['employee_create', 'employee_edit_all']),
    },
  } : null;

  // ==========================================================================
  // Effects
  // ==========================================================================

  // Initial load
  useEffect(() => {
    console.log('RoleContext: Initial mount, refreshing permissions...');
    refreshPermissions();
  }, []);

  // Listen for auth changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      console.log('RoleContext: Storage changed:', e.key);
      if (e.key === 'authUser' || e.key === 'employeeData' || e.key === 'authToken') {
        console.log('RoleContext: Auth-related storage changed, refreshing permissions...');
        refreshPermissions();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [refreshPermissions]);

  // ==========================================================================
  // Context Value
  // ==========================================================================

  const value: RoleContextType = {
    primaryRole,
    allRoles,
    permissions,
    employee,
    employeeId,
    loading,
    error,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    canApprove,
    approvalScope,
    highestLevel,
    canApproveFor,
    isHR,
    refreshPermissions,
    userRole,
  };

  return (
    <RoleContext.Provider value={value}>
      {children}
    </RoleContext.Provider>
  );
};

export default RoleContext;
