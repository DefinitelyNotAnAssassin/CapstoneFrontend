"use client"

import React, { useState, useEffect } from "react"
import { useRole } from "@/contexts/RoleContext"
import AuthService from "@/services/AuthService"
import leaveService from "@/services/LeaveService"
import { Sidebar } from "./Sidebar"

interface AppSidebarProps {
  contentId: string
}

/**
 * App-level sidebar component that wraps the Sidebar.
 * This component lives at the App level (single instance) to avoid
 * duplicate IonMenu/IonSplitPane issues when Ionic caches route pages.
 */
export const AppSidebar: React.FC<AppSidebarProps> = ({ contentId }) => {
  const { userRole, employee, loading: roleLoading } = useRole()
  const [pendingApprovals, setPendingApprovals] = useState(0)
  const [currentUser, setCurrentUser] = useState<any>(null)

  // Get current authenticated user
  useEffect(() => {
    const initUser = () => {
      try {
        const storedAuthUser = localStorage.getItem("authUser")
        if (storedAuthUser) {
          setCurrentUser(JSON.parse(storedAuthUser))
        }
      } catch (error) {
        console.error("Error parsing stored auth user:", error)
      }
    }
    initUser()

    // Listen for auth changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "authUser") {
        initUser()
      }
    }
    window.addEventListener("storage", handleStorageChange)
    return () => window.removeEventListener("storage", handleStorageChange)
  }, [])

  // Fetch pending approvals count for badge
  useEffect(() => {
    const fetchPendingApprovals = async () => {
      if (userRole?.canApprove) {
        try {
          const approvalsData = await leaveService.getPendingApprovalsForMe()
          setPendingApprovals(approvalsData.requests?.length || 0)
        } catch (error) {
          console.error("Error fetching pending approvals:", error)
        }
      }
    }

    if (!roleLoading && userRole) {
      fetchPendingApprovals()
    }
  }, [userRole, roleLoading])

  const getUserName = (): string => {
    if (currentUser?.displayName) {
      return currentUser.displayName
    }
    if (employee?.firstName && employee?.lastName) {
      return `${employee.firstName} ${employee.lastName}`
    }
    return "User"
  }

  const getUserRole = (): string => {
    if (employee?.isHR || userRole?.level === -1) {
      return "HR Administrator"
    }
    return userRole?.title || employee?.position_title || "Employee"
  }

  const handleLogout = () => {
    AuthService.signOut()
      .then(() => {
        window.location.href = "/sign-in"
      })
      .catch((error) => {
        console.error("Logout error:", error)
      })
  }

  return (
    <Sidebar
      contentId={contentId}
      pendingApprovals={pendingApprovals}
      onLogout={handleLogout}
      userName={getUserName()}
      userRole={getUserRole()}
      userAvatar={employee?.profileImage}
    />
  )
}

export default AppSidebar
