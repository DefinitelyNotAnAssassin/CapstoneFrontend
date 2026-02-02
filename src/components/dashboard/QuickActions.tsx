"use client"

import React from "react"
import { IonIcon } from "@ionic/react"
import { useHistory } from "react-router-dom"
import {
  addCircleOutline,
  listOutline,
  checkmarkCircleOutline,
  calendarOutline,
  peopleOutline,
  documentTextOutline,
} from "ionicons/icons"

interface QuickAction {
  title: string
  description: string
  icon: string
  path: string
  color: string
  permission?: string
}

interface QuickActionsProps {
  isHRUser?: boolean
  canApprove?: boolean
  hasPermission?: (permission: string) => boolean
}

export const QuickActions: React.FC<QuickActionsProps> = ({
  isHRUser = false,
  canApprove = false,
  hasPermission = () => false,
}) => {
  const history = useHistory()

  const actions: QuickAction[] = [
    {
      title: "File Leave Request",
      description: "Submit a new leave application",
      icon: addCircleOutline,
      path: "/file-leave",
      color: "blue",
    },
    {
      title: "My Leave Requests",
      description: "View all your leave requests",
      icon: listOutline,
      path: "/my-leaves",
      color: "green",
    },
    {
      title: "Leave Calendar",
      description: "View team leave calendar",
      icon: calendarOutline,
      path: "/leave-calendar",
      color: "purple",
    },
  ]

  // Add approval action if user can approve
  if (canApprove || hasPermission("approveRequests")) {
    actions.push({
      title: "Pending Approvals",
      description: "Review pending requests",
      icon: checkmarkCircleOutline,
      path: "/approvals",
      color: "amber",
    })
  }

  // Add HR-specific actions
  if (isHRUser) {
    actions.push(
      {
        title: "Manage Employees",
        description: "View and manage employees",
        icon: peopleOutline,
        path: "/employees",
        color: "indigo",
      },
      {
        title: "Generate Reports",
        description: "View analytics and reports",
        icon: documentTextOutline,
        path: "/reports",
        color: "pink",
      }
    )
  }

  const getColorClasses = (color: string) => {
    const colorMap: Record<string, { bg: string; hoverBg: string; icon: string; iconBg: string }> = {
      blue: {
        bg: "bg-blue-50",
        hoverBg: "hover:bg-blue-100",
        icon: "text-blue-600",
        iconBg: "bg-blue-100",
      },
      green: {
        bg: "bg-green-50",
        hoverBg: "hover:bg-green-100",
        icon: "text-green-600",
        iconBg: "bg-green-100",
      },
      purple: {
        bg: "bg-purple-50",
        hoverBg: "hover:bg-purple-100",
        icon: "text-purple-600",
        iconBg: "bg-purple-100",
      },
      amber: {
        bg: "bg-amber-50",
        hoverBg: "hover:bg-amber-100",
        icon: "text-amber-600",
        iconBg: "bg-amber-100",
      },
      indigo: {
        bg: "bg-indigo-50",
        hoverBg: "hover:bg-indigo-100",
        icon: "text-indigo-600",
        iconBg: "bg-indigo-100",
      },
      pink: {
        bg: "bg-pink-50",
        hoverBg: "hover:bg-pink-100",
        icon: "text-pink-600",
        iconBg: "bg-pink-100",
      },
    }
    return colorMap[color] || colorMap.blue
  }

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <span className="w-1 h-6 bg-green-500 rounded-full"></span>
        Quick Actions
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {actions.map((action, index) => {
          const colors = getColorClasses(action.color)
          return (
            <div
              key={index}
              onClick={() => history.push(action.path)}
              className={`${colors.bg} ${colors.hoverBg} rounded-xl p-4  text-left transition-all duration-300 hover:shadow-md hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 group`}
            >
              <div className={`${colors.iconBg} w-12 h-12 rounded-lg flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <IonIcon icon={action.icon} className={`${colors.icon} text-2xl`} />
              </div>
              <h3 className="font-semibold text-gray-800 text-sm mb-1">{action.title}</h3>
              <p className="text-xs text-gray-500 line-clamp-2">{action.description}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
