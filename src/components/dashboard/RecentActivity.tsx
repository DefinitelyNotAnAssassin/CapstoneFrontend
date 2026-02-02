"use client"

import React from "react"
import { IonIcon } from "@ionic/react"
import {
  checkmarkCircleOutline,
  closeCircleOutline,
  timeOutline,
  documentTextOutline,
  personOutline,
} from "ionicons/icons"

interface Activity {
  id: string
  type: "approved" | "rejected" | "pending" | "filed" | "viewed"
  title: string
  description: string
  timestamp: string
  user?: string
}

interface RecentActivityProps {
  activities?: Activity[]
}

// Sample activities for demonstration
const sampleActivities: Activity[] = [
  {
    id: "1",
    type: "filed",
    title: "Leave Request Filed",
    description: "Vacation leave request submitted for 3 days",
    timestamp: "2 hours ago",
  },
  {
    id: "2",
    type: "approved",
    title: "Leave Approved",
    description: "Sick leave request approved by supervisor",
    timestamp: "1 day ago",
  },
  {
    id: "3",
    type: "pending",
    title: "Awaiting Approval",
    description: "Emergency leave pending review",
    timestamp: "2 days ago",
  },
  {
    id: "4",
    type: "viewed",
    title: "Request Viewed",
    description: "Your leave request was viewed by HR",
    timestamp: "3 days ago",
  },
]

export const RecentActivity: React.FC<RecentActivityProps> = ({
  activities = sampleActivities,
}) => {
  const getActivityIcon = (type: Activity["type"]) => {
    switch (type) {
      case "approved":
        return checkmarkCircleOutline
      case "rejected":
        return closeCircleOutline
      case "pending":
        return timeOutline
      case "filed":
        return documentTextOutline
      case "viewed":
        return personOutline
      default:
        return documentTextOutline
    }
  }

  const getActivityColors = (type: Activity["type"]) => {
    switch (type) {
      case "approved":
        return { bg: "bg-green-100", icon: "text-green-600", dot: "bg-green-500" }
      case "rejected":
        return { bg: "bg-red-100", icon: "text-red-600", dot: "bg-red-500" }
      case "pending":
        return { bg: "bg-amber-100", icon: "text-amber-600", dot: "bg-amber-500" }
      case "filed":
        return { bg: "bg-blue-100", icon: "text-blue-600", dot: "bg-blue-500" }
      case "viewed":
        return { bg: "bg-purple-100", icon: "text-purple-600", dot: "bg-purple-500" }
      default:
        return { bg: "bg-gray-100", icon: "text-gray-600", dot: "bg-gray-500" }
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <span className="w-3 h-3 bg-indigo-500 rounded-full"></span>
        Recent Activity
      </h3>
      
      <div className="space-y-4">
        {activities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <IonIcon icon={documentTextOutline} className="text-4xl mb-2" />
            <p>No recent activity</p>
          </div>
        ) : (
          activities.map((activity, index) => {
            const colors = getActivityColors(activity.type)
            return (
              <div
                key={activity.id}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className={`${colors.bg} p-2 rounded-lg flex-shrink-0`}>
                  <IonIcon
                    icon={getActivityIcon(activity.type)}
                    className={`${colors.icon} text-lg`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={`${colors.dot} w-2 h-2 rounded-full`}></span>
                    <p className="font-medium text-gray-800 text-sm">{activity.title}</p>
                  </div>
                  <p className="text-gray-500 text-xs mt-1 truncate">{activity.description}</p>
                  <p className="text-gray-400 text-xs mt-1">{activity.timestamp}</p>
                </div>
              </div>
            )
          })
        )}
      </div>

      {activities.length > 0 && (
        <button className="w-full mt-4 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium hover:bg-blue-50 rounded-lg transition-colors">
          View All Activity
        </button>
      )}
    </div>
  )
}
