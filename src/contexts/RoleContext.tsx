// Role-Based Access Control Context
// Manages user permissions and role-based UI rendering

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AuthService from '../services/AuthService';
import leaveService from '../services/LeaveService';

interface EmployeeRole {
  level: number;
  title: string;
  canApprove: boolean;
  approvalScope: 'none' | 'program' | 'department' | 'all';
  permissions: {
    viewAllRequests: boolean;
    approveRequests: boolean;
    manageLeaveCredits: boolean;
    manageLeavePolicies: boolean;
    viewReports: boolean;
    manageEmployees: boolean;
  };
}

interface RoleContextType {
  userRole: EmployeeRole | null;
  employee: any | null;
  loading: boolean;
  hasPermission: (permission: keyof EmployeeRole['permissions']) => boolean;
  canApproveFor: (targetEmployeeLevel: number) => boolean;
  refreshRole: () => Promise<void>;
}

const defaultRole: EmployeeRole = {
  level: 99,
  title: 'Employee',
  canApprove: false,
  approvalScope: 'none',
  permissions: {
    viewAllRequests: false,
    approveRequests: false,
    manageLeaveCredits: false,
    manageLeavePolicies: false,
    viewReports: false,
    manageEmployees: false
  }
};

const RoleContext = createContext<RoleContextType>({
  userRole: null,
  employee: null,
  loading: true,
  hasPermission: () => false,
  canApproveFor: () => false,
  refreshRole: async () => {}
});

export const useRole = () => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error('useRole must be used within a RoleProvider');
  }
  return context;
};

interface RoleProviderProps {
  children: ReactNode;
}

export const RoleProvider: React.FC<RoleProviderProps> = ({ children }) => {
  const [userRole, setUserRole] = useState<EmployeeRole | null>(null);
  const [employee, setEmployee] = useState<any>(null);
  const [loading, setLoading] = useState(true);  const determineRole = (employeeData: any): EmployeeRole => {
    if (!employeeData) return defaultRole;

    // Check if employee is HR first - HR has super admin privileges
    if (employeeData.isHR) {
      return {
        level: -1, // Special level for HR (higher than VPAA)
        title: 'HR Administrator',
        canApprove: true,
        approvalScope: 'all',
        permissions: {
          viewAllRequests: true,
          approveRequests: true,
          manageLeaveCredits: true,
          manageLeavePolicies: true,
          viewReports: true,
          manageEmployees: true
        }
      };
    }

    // First, try to use the academic_role_level from the backend
    let roleLevel = employeeData.academic_role_level;
    
    // If academic_role_level is not available, try role_level for backward compatibility
    if (roleLevel === undefined || roleLevel === null) {
      roleLevel = employeeData.role_level;
    }
    
    // If still no role level, try to determine from position title
    if (roleLevel === undefined || roleLevel === null) {
      const position = employeeData.position_title || '';
      const positionLower = position.toLowerCase();
      
      if (positionLower.includes('vpaa') || positionLower.includes('vice president')) {
        roleLevel = 0;
      } else if (positionLower.includes('dean')) {
        roleLevel = 1;
      } else if (positionLower.includes('chair') || positionLower.includes('pc')) {
        roleLevel = 2;
      } else if (positionLower.includes('faculty') && !positionLower.includes('part')) {
        roleLevel = 3;
      } else if (positionLower.includes('part') && positionLower.includes('faculty')) {
        roleLevel = 4;
      } else if (positionLower.includes('secretary') || positionLower.includes('sec')) {
        roleLevel = 5;
      } else {
        roleLevel = 99; // Default for unknown positions
      }
    }    // Define role based on position and level
    const roleMapping: { [key: string]: EmployeeRole } = {
      '-1': { // HR Administrator (special level)
        level: -1,
        title: 'HR Administrator',
        canApprove: true,
        approvalScope: 'all',
        permissions: {
          viewAllRequests: true,
          approveRequests: true,
          manageLeaveCredits: true,
          manageLeavePolicies: true,
          viewReports: true,
          manageEmployees: true
        }
      },
      '0': { // VPAA
        level: 0,
        title: 'Vice President for Academic Affairs',
        canApprove: true,
        approvalScope: 'all',
        permissions: {
          viewAllRequests: true,
          approveRequests: true,
          manageLeaveCredits: true,
          manageLeavePolicies: true,
          viewReports: true,
          manageEmployees: true
        }
      },      '1': { // Dean
        level: 1,
        title: 'Dean',
        canApprove: true,
        approvalScope: 'department',
        permissions: {
          viewAllRequests: true,
          approveRequests: true,
          manageLeaveCredits: true,
          manageLeavePolicies: false,
          viewReports: true,
          manageEmployees: false
        }
      },
      '2': { // Program Chair
        level: 2,
        title: 'Program Chair',
        canApprove: true,
        approvalScope: 'program',
        permissions: {
          viewAllRequests: false,
          approveRequests: true,
          manageLeaveCredits: false,
          manageLeavePolicies: false,
          viewReports: true,
          manageEmployees: false
        }
      },
      '3': { // Regular Faculty
        level: 3,
        title: 'Regular Faculty',
        canApprove: false,
        approvalScope: 'none',
        permissions: {
          viewAllRequests: false,
          approveRequests: false,
          manageLeaveCredits: false,
          manageLeavePolicies: false,
          viewReports: false,
          manageEmployees: false
        }
      },
      '4': { // Part-Time Faculty
        level: 4,
        title: 'Part-Time Faculty',
        canApprove: false,
        approvalScope: 'none',
        permissions: {
          viewAllRequests: false,
          approveRequests: false,
          manageLeaveCredits: false,
          manageLeavePolicies: false,
          viewReports: false,
          manageEmployees: false
        }
      },
      '5': { // Secretary
        level: 5,
        title: 'Secretary',
        canApprove: false,
        approvalScope: 'none',
        permissions: {
          viewAllRequests: false,
          approveRequests: false,
          manageLeaveCredits: false,
          manageLeavePolicies: false,
          viewReports: false,
          manageEmployees: false
        }
      }
    };

    return roleMapping[roleLevel.toString()] || defaultRole;
  };

  const refreshRole = async () => {
    setLoading(true);
    try {
      const currentUser = AuthService.getCurrentUser();
      if (!currentUser) {
        setUserRole(null);
        setEmployee(null);
        return;
      }      // Try to get the full employee data using the authenticated user's ID or email
      let employeeData = null;
      
      try {
        // Import the employee service
        const employeeService = (await import('../services/EmployeeServiceNew')).default;
        
        // Try to get employee by email (from authenticated user)
        if (currentUser.email) {
          employeeData = await employeeService.getEmployeeByEmail(currentUser.email);
          console.log('Fetched employee data by email:', employeeData);
        }
        
        // If no employee found by email, try by UID
        if (!employeeData && currentUser.uid) {
          employeeData = await employeeService.getEmployeeById(currentUser.uid);
          console.log('Fetched employee data by ID:', employeeData);
        }
      } catch (error) {
        console.error('Error fetching employee data:', error);
      }

      if (employeeData) {
        // Use the fetched employee data
        setEmployee(employeeData);
        const role = determineRole(employeeData);
        setUserRole(role);
        console.log('Determined role from fetched employee data:', role);
        
        // Store employee data in localStorage for future use
        localStorage.setItem('employeeData', JSON.stringify(employeeData));
      } else {
        // Check localStorage for cached employee data
        const cachedEmployeeData = JSON.parse(localStorage.getItem('employeeData') || '{}');        if (cachedEmployeeData && cachedEmployeeData.id) {
          setEmployee(cachedEmployeeData);
          const role = determineRole(cachedEmployeeData);
          setUserRole(role);
          console.log('Using cached employee data:', role);
        } else {
          // Demo admin fallback for development
          console.log('Using demo admin fallback');
          const demoRole: EmployeeRole = {
            level: 0,
            title: 'System Administrator',
            canApprove: true,
            approvalScope: 'all',
            permissions: {
              viewAllRequests: true,
              approveRequests: true,
              manageLeaveCredits: true,
              manageLeavePolicies: true,
              viewReports: true,
              manageEmployees: true
            }
          };
          setUserRole(demoRole);
          setEmployee({
            id: 'demo-admin',
            full_name: 'Demo Administrator',
            position_title: 'System Administrator',
            email: currentUser.email,
            displayName: currentUser.displayName
          });
        }
      }
    } catch (error) {
      console.error('Error refreshing role:', error);
      setUserRole(defaultRole);
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (permission: keyof EmployeeRole['permissions']): boolean => {
    return userRole?.permissions[permission] || false;
  };

  const canApproveFor = (targetEmployeeLevel: number): boolean => {
    if (!userRole || !userRole.canApprove) return false;
    return userRole.level < targetEmployeeLevel;
  };

  useEffect(() => {
    refreshRole();
  }, []);

  // Listen for authentication changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'authUser' || e.key === 'employeeData') {
        refreshRole();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const value: RoleContextType = {
    userRole,
    employee,
    loading,
    hasPermission,
    canApproveFor,
    refreshRole
  };

  return (
    <RoleContext.Provider value={value}>
      {children}
    </RoleContext.Provider>
  );
};

export default RoleContext;
