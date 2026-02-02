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
  personOutline,
} from "ionicons/icons"

export interface NavItem {
  id: string
  title: string
  icon: string
  path: string
  permission?: string
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
        permission: "approveRequests",
        approverOnly: true,
      },
      {
        id: "leave-policies",
        title: "Leave Policies",
        icon: listOutline,
        path: "/leave-policy-management",
        permission: "manageLeavePolicies",
      },
      {
        id: "leave-credits",
        title: "Leave Credits",
        icon: calendarOutline,
        path: "/leave-credit-management",
        permission: "manageLeaveCredits",
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
        permission: "manageEmployees",
      },
      {
        id: "employee-management",
        title: "Employee Management",
        icon: personOutline,
        path: "/employee-management",
        permission: "manageEmployees",
        hrOnly: true,
      },
      {
        id: "organization",
        title: "Organization Structure",
        icon: businessOutline,
        path: "/organization-management",
        permission: "manageEmployees",
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
        permission: "viewReports",
      },
      {
        id: "audit-trail",
        title: "Audit Trail",
        icon: shieldOutline,
        path: "/audit-trail",
        permission: "viewReports",
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

  // Check permission if specified
  if (item.permission && !hasPermission(item.permission)) return false

  return true
}
