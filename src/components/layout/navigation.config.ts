import {
  calendarOutline,
  businessOutline,
  documentTextOutline,
  statsChartOutline,
  listOutline,
  shieldOutline,
  peopleOutline,
  homeOutline,
  settingsOutline,
  keyOutline,
  lockClosedOutline,
} from "ionicons/icons"

export interface NavItem {
  id: string
  title: string
  icon: string
  path: string
  permissions?: string[]
  hrOnly?: boolean
  approverOnly?: boolean
  dividerAfter?: boolean
  badge?: number | string
}

export interface NavSection {
  title: string
  items: NavItem[]
}

// Navigation configuration - defines all sidebar items
export const navigationConfig: NavSection[] = [
  {
    title: "Main",
    items: [
      {
        id: "dashboard",
        title: "Dashboard",
        icon: homeOutline,
        path: "/hr-dashboard",
      },
    ],
  },
  {
    title: "Leave Management",
    items: [
      {
        id: "my-leave",
        title: "My Leave Requests",
        icon: calendarOutline,
        path: "/leave-request",
      },
      {
        id: "leave-approval",
        title: "Leave Approval",
        icon: documentTextOutline,
        path: "/leave-approval",
        permissions: ["leave_approve_program", "leave_approve_department", "leave_approve_all"],
        approverOnly: true,
      },
      {
        id: "leave-policies",
        title: "Leave Policies",
        icon: listOutline,
        path: "/leave-policy-management",
        permissions: ["leave_manage_policies"],
      },
      {
        id: "leave-credits",
        title: "Leave Credits",
        icon: calendarOutline,
        path: "/leave-credit-management",
        permissions: ["leave_manage_credits"],
        hrOnly: true,
        dividerAfter: true,
      },
    ],
  },
  {
    title: "Organization",
    items: [
      {
        id: "employee-directory",
        title: "Employee Directory",
        icon: peopleOutline,
        path: "/employee-directory",
        permissions: ["employee_view_all", "employee_view_department", "employee_view_team"],
      },
      {
        id: "organization",
        title: "Organization Structure",
        icon: businessOutline,
        path: "/organization-management",
        permissions: ["org_manage_departments", "org_manage_programs"],
        dividerAfter: true,
      },
    ],
  },
  {
    title: "Reports & Analytics",
    items: [
      {
        id: "reports",
        title: "Reports",
        icon: statsChartOutline,
        path: "/reports",
        permissions: ["reports_view_team", "reports_view_department", "reports_view_all"],
      },
      {
        id: "audit-trail",
        title: "Audit Trail",
        icon: shieldOutline,
        path: "/audit-trail",
        permissions: ["audit_view"],
      },
    ],
  },
  {
    title: "Settings",
    items: [
      {
        id: "roles-management",
        title: "Roles & Permissions",
        icon: keyOutline,
        path: "/roles-management",
        permissions: ["rbac_manage_roles"],
        hrOnly: true,
      },
      {
        id: "user-permissions",
        title: "User Permissions",
        icon: lockClosedOutline,
        path: "/user-permissions",
        permissions: ["rbac_assign_roles"],
        hrOnly: true,
      },
    ],
  },
]

// Helper function to check if a nav item should be visible
export const isNavItemVisible = (
  item: NavItem,
  hasPermission: (permission: string) => boolean,
  isHRUser: boolean,
  canApprove: boolean
): boolean => {
  // HR users see everything
  if (isHRUser) return true

  // Check if item requires HR role
  if (item.hrOnly && !isHRUser) return false

  // Check if item requires approver role
  if (item.approverOnly && !canApprove && !isHRUser) return false

  // Check permissions if specified (user needs at least one of the permissions)
  if (item.permissions && item.permissions.length > 0) {
    const hasAnyPermission = item.permissions.some(perm => hasPermission(perm))
    if (!hasAnyPermission) return false
  }

  return true
}
