"use client"

import React from "react"
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
} from "@ionic/react"
import { refreshOutline, notificationsOutline } from "ionicons/icons"
import "./MainLayout.css"

interface MainLayoutProps {
  children: React.ReactNode
  title: string
  showRefresh?: boolean
  onRefresh?: () => void
  isLoading?: boolean
  hideHeader?: boolean
}

/**
 * MainLayout provides page structure with header for authenticated pages.
 * The sidebar/menu is handled by AppShell at the app level.
 */
export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  title,
  showRefresh = false,
  onRefresh,
  isLoading = false,
  hideHeader = false,
}) => {
  return (
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
    </IonPage>
  )
}

export default MainLayout
