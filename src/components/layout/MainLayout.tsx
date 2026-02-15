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
  IonAlert,
} from "@ionic/react"
import { refreshOutline, notificationsOutline } from "ionicons/icons"
import { useHistory } from "react-router-dom"
import { useRole } from "@/contexts/RoleContext"
import AuthService from "@/services/AuthService"
import { useAudit } from "@/hooks/useAudit"
import "./MainLayout.css"

interface MainLayoutProps {
  children: React.ReactNode
  title: string
  showRefresh?: boolean
  onRefresh?: () => void
  isLoading?: boolean
  hideHeader?: boolean
  fab?: React.ReactNode
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  title,
  showRefresh = false,
  onRefresh,
  isLoading = false,
  hideHeader = false,
  fab,
}) => {
  const history = useHistory()
  const { logEvent } = useAudit()
  const { userRole, employee } = useRole()
  
  const [showLogoutAlert, setShowLogoutAlert] = useState(false)
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

  return (
    <IonPage className="main-page">
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

      {fab}

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
  )
}

export default MainLayout
