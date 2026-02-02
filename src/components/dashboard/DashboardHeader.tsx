"use client"

import React from "react"
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonTitle,
  IonButton,
  IonIcon,
  IonSpinner,
} from "@ionic/react"
import { refreshOutline, logOutOutline } from "ionicons/icons"

interface DashboardHeaderProps {
  title: string
  onRefresh: () => void
  onLogout: () => void
  isLoading?: boolean
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  title,
  onRefresh,
  onLogout,
  isLoading = false,
}) => {
  return (
    <IonHeader>
      <IonToolbar>
        <IonButtons slot="start">
          <IonMenuButton />
        </IonButtons>
        <IonTitle>{title}</IonTitle>
        <IonButtons slot="end">
          <IonButton onClick={onRefresh} disabled={isLoading}>
            {isLoading ? (
              <IonSpinner name="crescent" />
            ) : (
              <IonIcon slot="icon-only" icon={refreshOutline} />
            )}
          </IonButton>
          <IonButton onClick={onLogout}>
            <IonIcon slot="icon-only" icon={logOutOutline} />
          </IonButton>
        </IonButtons>
      </IonToolbar>
    </IonHeader>
  )
}
