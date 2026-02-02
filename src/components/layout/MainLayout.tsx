"use client"

import React, { useState, useEffect } from "react"
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonMenuButton,
  IonButton,
  IonIcon,
  IonSpinner,
  IonSplitPane,
  IonAlert,
} from "@ionic/react"
import { refreshOutline, notificationsOutline } from "ionicons/icons"
import { useHistory } from "react-router-dom"
import { Sidebar } from "./Sidebar"
import { useRole } from "@/contexts/RoleContext"
import AuthService from "@/services/AuthService"
import leaveService from "@/services/LeaveService"
import { useAudit } from "@/hooks/useAudit"
import "./MainLayout.css"

interface MainLayoutProps {
  children: React.ReactNode
  title: string
  showRefresh?: boolean
  onRefresh?: () => void
  isLoading?: boolean
  hideHeader?: boolean
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  title,
  showRefresh = false,
  onRefresh,
  isLoading = false,
  hideHeader = false,
}) => {
  const history = useHistory()
  const { logEvent } = useAudit()
  const { userRole, employee, loading: roleLoading } = useRole()
  
  const [showLogoutAlert, setShowLogoutAlert] = useState(false)
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
    return "User"
  }

  const getUserRole = (): string => {
    if (employee?.isHR || userRole?.level === -1) {
      return "HR Administrator"
    }
    return userRole?.title || employee?.position_title || "Employee"
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
      
      <IonPage id="main-content" className="main-page">
        {!hideHeader && (
          <IonHeader className="main-header">
            <IonToolbar>
              <IonButtons slot="start">
                <IonMenuButton autoHide={false} className="menu-button" />
              </IonButtons>
              <IonTitle>{title}</IonTitle>
              <IonButtons slot="end">
                {showRefresh && (
                  <IonButton onClick={onRefresh} disabled={isLoading}>
                    {isLoading ? (
                      <IonSpinner name="crescent" />
                    ) : (
                      <IonIcon slot="icon-only" icon={refreshOutline} />
                    )}
                  </IonButton>
                )}
                <IonButton>
                  <IonIcon slot="icon-only" icon={notificationsOutline} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
        )}
        
        <IonContent className="main-content">
          {children}
        </IonContent>

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
      </IonPage>
    </IonSplitPane>
  )
}

export default MainLayout
