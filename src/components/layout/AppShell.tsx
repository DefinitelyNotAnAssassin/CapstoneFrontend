"use client"

import React, { useState, useEffect, useRef } from "react"
import {
  IonSplitPane,
  IonAlert,
} from "@ionic/react"
import { useHistory, useLocation } from "react-router-dom"
import { Sidebar } from "./Sidebar"
import { useRole } from "@/contexts/RoleContext"
import AuthService from "@/services/AuthService"
import leaveService from "@/services/LeaveService"
import { useAudit } from "@/hooks/useAudit"

interface AppShellProps {
  children: React.ReactNode
}

/**
 * AppShell provides a consistent sidebar/menu wrapper for authenticated pages.
 * This component stays mounted across page navigations to prevent menu flickering.
 */
export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const history = useHistory()
  const location = useLocation()
  const { logEvent } = useAudit()
  const { 
    primaryRole, 
    employee, 
    loading: roleLoading, 
    canApprove, 
    isHR,
    highestLevel 
  } = useRole()
  
  const [showLogoutAlert, setShowLogoutAlert] = useState(false)
  const [pendingApprovals, setPendingApprovals] = useState(0)
  const [currentUser, setCurrentUser] = useState<any>(null)
  
  const isMounted = useRef(true)
  const hasFetchedApprovals = useRef(false)

  // Check if we're on an authenticated route (not sign-in, etc.)
  const isAuthenticatedRoute = !location.pathname.includes('/sign-in') && 
                               !location.pathname.includes('/email-otp') && 
                               !location.pathname.includes('/verify-otp') &&
                               location.pathname !== '/home' &&
                               location.pathname !== '/'

  // Get current authenticated user
  useEffect(() => {
    isMounted.current = true
    
    const initUser = () => {
      try {
        const storedAuthUser = localStorage.getItem("authUser")
        if (storedAuthUser && isMounted.current) {
          setCurrentUser(JSON.parse(storedAuthUser))
        }
      } catch (error) {
        console.error("Error parsing stored auth user:", error)
      }
    }
    initUser()
    
    return () => {
      isMounted.current = false
    }
  }, [])

  // Fetch pending approvals count for badge
  useEffect(() => {
    const fetchPendingApprovals = async () => {
      if (hasFetchedApprovals.current || !canApprove || !isAuthenticatedRoute) return
      hasFetchedApprovals.current = true
      
      try {
        const approvalsData = await leaveService.getPendingApprovalsForMe()
        if (isMounted.current) {
          setPendingApprovals(approvalsData.requests?.length || 0)
        }
      } catch (error) {
        console.error("Error fetching pending approvals:", error)
      }
    }
    
    if (!roleLoading && isAuthenticatedRoute) {
      fetchPendingApprovals()
    }
  }, [canApprove, roleLoading, isAuthenticatedRoute])

  const handleLogout = async () => {
    try {
      logEvent(
        currentUser?.uid?.toString() || "unknown",
        currentUser?.displayName || employee?.firstName + " " + employee?.lastName || "Unknown User",
        "Logout",
        "Authentication",
        "User logged out",
        "127.0.0.1",
        "success"
      )

      await AuthService.signOut()
      history.push("/sign-in")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const getUserName = (): string => {
    if (currentUser?.displayName) {
      return currentUser.displayName
    }
    if (employee?.firstName && employee?.lastName) {
      return `${employee.firstName} ${employee.lastName}`
    }
    if (employee?.first_name && employee?.last_name) {
      return `${employee.first_name} ${employee.last_name}`
    }
    return "User"
  }

  const getUserRole = (): string => {
    if (isHR) {
      return "HR Administrator"
    }
    
    if (primaryRole?.name) {
      return primaryRole.name
    }
    
    if (highestLevel !== undefined && highestLevel !== 99) {
      const levelTitles: { [key: number]: string } = {
        [-1]: "HR Administrator",
        0: "VPAA",
        1: "Dean",
        2: "Program Chair",
        3: "Regular Faculty",
        4: "Part-Time Faculty",
        5: "Secretary",
      }
      if (levelTitles[highestLevel]) {
        return levelTitles[highestLevel]
      }
    }

    return employee?.position_title || "Employee"
  }

  // Don't show split pane for non-authenticated routes
  if (!isAuthenticatedRoute) {
    return <>{children}</>
  }

  return (
    <IonSplitPane contentId="main-content" when="md">
      <Sidebar
        contentId="main-content"
        pendingApprovals={pendingApprovals}
        onLogout={() => setShowLogoutAlert(true)}
        userName={getUserName()}
        userRole={getUserRole()}
        userAvatar={employee?.profileImage}
      />
      
      {children}

      <IonAlert
        isOpen={showLogoutAlert}
        onDidDismiss={() => setShowLogoutAlert(false)}
        header="Sign Out"
        message="Are you sure you want to sign out?"
        buttons={[
          {
            text: "Cancel",
            role: "cancel",
          },
          {
            text: "Sign Out",
            role: "confirm",
            handler: handleLogout,
          },
        ]}
      />
    </IonSplitPane>
  )
}

export default AppShell
