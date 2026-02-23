"use client"

import React, { useState, useEffect } from "react"
import { IonIcon } from "@ionic/react"
import { calendarOutline, sunnyOutline, alertCircleOutline, megaphoneOutline } from "ionicons/icons"
import announcementService, { type Announcement as APIAnnouncement } from "../../services/AnnouncementService"

interface UpcomingLeave {
  id: string
  type: string
  startDate: string
  endDate: string
  status: "approved" | "pending"
  days: number
}

interface UpcomingLeavesProps {
  leaves?: UpcomingLeave[]
}

// Sample data
const sampleLeaves: UpcomingLeave[] = [
  {
    id: "1",
    type: "Vacation Leave",
    startDate: "Feb 15, 2026",
    endDate: "Feb 17, 2026",
    status: "approved",
    days: 3,
  },
  {
    id: "2",
    type: "Sick Leave",
    startDate: "Mar 1, 2026",
    endDate: "Mar 1, 2026",
    status: "pending",
    days: 1,
  },
]

export const UpcomingLeaves: React.FC<UpcomingLeavesProps> = ({
  leaves = sampleLeaves,
}) => {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <span className="w-3 h-3 bg-cyan-500 rounded-full"></span>
        Upcoming Leaves
      </h3>

      {leaves.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <IonIcon icon={sunnyOutline} className="text-4xl mb-2 text-amber-400" />
          <p>No upcoming leaves scheduled</p>
        </div>
      ) : (
        <div className="space-y-3">
          {leaves.map((leave) => (
            <div
              key={leave.id}
              className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <div className="bg-blue-100 p-2 rounded-lg">
                <IonIcon icon={calendarOutline} className="text-blue-600 text-lg" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-medium text-gray-800 text-sm">{leave.type}</p>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
                      leave.status === "approved"
                        ? "bg-green-100 text-green-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {leave.status}
                  </span>
                </div>
                <p className="text-gray-500 text-xs mt-1">
                  {leave.startDate} {leave.startDate !== leave.endDate && `- ${leave.endDate}`}
                </p>
                <p className="text-blue-600 text-xs font-medium mt-1">
                  {leave.days} {leave.days === 1 ? "day" : "days"}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

interface Announcement {
  id: string
  title: string
  message: string
  type: "info" | "warning" | "important"
  date: string
}

interface AnnouncementsProps {
  announcements?: Announcement[]
}

const priorityToType = (priority: string): "info" | "warning" | "important" => {
  switch (priority) {
    case "urgent":
    case "high":
      return "important"
    case "normal":
      return "info"
    case "low":
    default:
      return "info"
  }
}

export const Announcements: React.FC<AnnouncementsProps> = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const data = await announcementService.getAnnouncements()
        const mapped: Announcement[] = (Array.isArray(data) ? data : []).slice(0, 5).map((a: APIAnnouncement) => ({
          id: String(a.id),
          title: a.title,
          message: a.content.length > 120 ? a.content.substring(0, 120) + "..." : a.content,
          type: priorityToType(a.priority),
          date: new Date(a.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
        }))
        setAnnouncements(mapped)
      } catch (err) {
        console.error("Failed to load announcements for dashboard:", err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])
  const getTypeStyles = (type: Announcement["type"]) => {
    switch (type) {
      case "info":
        return { bg: "bg-blue-50", border: "border-l-blue-500", icon: "text-blue-500" }
      case "warning":
        return { bg: "bg-amber-50", border: "border-l-amber-500", icon: "text-amber-500" }
      case "important":
        return { bg: "bg-red-50", border: "border-l-red-500", icon: "text-red-500" }
      default:
        return { bg: "bg-gray-50", border: "border-l-gray-500", icon: "text-gray-500" }
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <span className="w-3 h-3 bg-red-500 rounded-full"></span>
        Announcements
      </h3>

      {loading ? (
        <div className="text-center py-8 text-gray-500">
          <p>Loading announcements...</p>
        </div>
      ) : announcements.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <IonIcon icon={alertCircleOutline} className="text-4xl mb-2" />
          <p>No announcements</p>
        </div>
      ) : (
        <div className="space-y-3">
          {announcements.map((announcement) => {
            const styles = getTypeStyles(announcement.type)
            return (
              <div
                key={announcement.id}
                className={`${styles.bg} ${styles.border} border-l-4 rounded-r-lg p-4`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <IonIcon icon={alertCircleOutline} className={`${styles.icon} text-lg`} />
                    <h4 className="font-semibold text-gray-800 text-sm">{announcement.title}</h4>
                  </div>
                  <span className="text-xs text-gray-400">{announcement.date}</span>
                </div>
                <p className="text-gray-600 text-sm mt-2 ml-6">{announcement.message}</p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
