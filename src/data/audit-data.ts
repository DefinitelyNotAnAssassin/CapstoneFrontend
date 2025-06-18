// Sample audit trail data
export interface AuditLog {
  id: string
  timestamp: string
  userId: string
  username: string
  action: string
  module: string
  details: string
  ipAddress: string
  status: "success" | "failure"
}

export type AuditModule =
  | "Authentication"
  | "Employee Directory"
  | "Leave Management"
  | "Organization"
  | "Faculty Loading"
  | "Leave Approval"
  | "Leave Policy"
  | "Leave Credits"
  | "Reports"
  | "System"

export type AuditAction =
  | "Login"
  | "Logout"
  | "View"
  | "Create"
  | "Update"
  | "Delete"
  | "Export"
  | "Import"
  | "Approve"
  | "Reject"
  | "Generate Report"

// Sample audit logs for demonstration
export const sampleAuditLogs: AuditLog[] = [
  {
    id: "1",
    timestamp: "2023-05-14T08:30:15",
    userId: "user123",
    username: "jsmith",
    action: "Login",
    module: "Authentication",
    details: "User logged in successfully",
    ipAddress: "192.168.1.100",
    status: "success",
  },
  {
    id: "2",
    timestamp: "2023-05-14T09:15:22",
    userId: "user123",
    username: "jsmith",
    action: "View",
    module: "Employee Directory",
    details: "Viewed employee profile: EMP-001",
    ipAddress: "192.168.1.100",
    status: "success",
  },
  {
    id: "3",
    timestamp: "2023-05-14T10:05:47",
    userId: "user123",
    username: "jsmith",
    action: "Update",
    module: "Employee Directory",
    details: "Updated contact information for employee: EMP-001",
    ipAddress: "192.168.1.100",
    status: "success",
  },
  {
    id: "4",
    timestamp: "2023-05-14T11:30:05",
    userId: "admin456",
    username: "admin",
    action: "Create",
    module: "Leave Policy",
    details: "Created new leave policy: Summer Vacation Policy",
    ipAddress: "192.168.1.101",
    status: "success",
  },
  {
    id: "5",
    timestamp: "2023-05-14T13:45:33",
    userId: "user789",
    username: "mgarcia",
    action: "Login",
    module: "Authentication",
    details: "Failed login attempt",
    ipAddress: "192.168.1.102",
    status: "failure",
  },
  {
    id: "6",
    timestamp: "2023-05-14T14:20:18",
    userId: "user456",
    username: "asmith",
    action: "Approve",
    module: "Leave Approval",
    details: "Approved leave request: LR-2023-042",
    ipAddress: "192.168.1.103",
    status: "success",
  },
  {
    id: "7",
    timestamp: "2023-05-14T15:10:55",
    userId: "user123",
    username: "jsmith",
    action: "Generate Report",
    module: "Reports",
    details: "Generated monthly attendance report",
    ipAddress: "192.168.1.100",
    status: "success",
  },
  {
    id: "8",
    timestamp: "2023-05-14T16:05:22",
    userId: "user123",
    username: "jsmith",
    action: "Export",
    module: "Employee Directory",
    details: "Exported employee list to Excel",
    ipAddress: "192.168.1.100",
    status: "success",
  },
  {
    id: "9",
    timestamp: "2023-05-14T16:30:40",
    userId: "admin456",
    username: "admin",
    action: "Update",
    module: "System",
    details: "Updated system settings: Email notification preferences",
    ipAddress: "192.168.1.101",
    status: "success",
  },
  {
    id: "10",
    timestamp: "2023-05-14T17:15:05",
    userId: "user123",
    username: "jsmith",
    action: "Logout",
    module: "Authentication",
    details: "User logged out",
    ipAddress: "192.168.1.100",
    status: "success",
  },
  {
    id: "11",
    timestamp: "2023-05-15T08:30:15",
    userId: "user123",
    username: "jsmith",
    action: "Login",
    module: "Authentication",
    details: "User logged in successfully",
    ipAddress: "192.168.1.100",
    status: "success",
  },
  {
    id: "12",
    timestamp: "2023-05-15T09:45:22",
    userId: "user123",
    username: "jsmith",
    action: "Create",
    module: "Organization",
    details: "Created new department: Research & Development",
    ipAddress: "192.168.1.100",
    status: "success",
  },
  {
    id: "13",
    timestamp: "2023-05-15T10:30:47",
    userId: "user456",
    username: "asmith",
    action: "Delete",
    module: "Leave Credits",
    details: "Deleted incorrect leave credit entry for employee: EMP-005",
    ipAddress: "192.168.1.103",
    status: "success",
  },
  {
    id: "14",
    timestamp: "2023-05-15T11:15:05",
    userId: "admin456",
    username: "admin",
    action: "Import",
    module: "Employee Directory",
    details: "Imported 25 new employee records",
    ipAddress: "192.168.1.101",
    status: "success",
  },
  {
    id: "15",
    timestamp: "2023-05-15T13:20:33",
    userId: "user789",
    username: "mgarcia",
    action: "View",
    module: "Reports",
    details: "Viewed confidential salary report",
    ipAddress: "192.168.1.102",
    status: "success",
  },
]
