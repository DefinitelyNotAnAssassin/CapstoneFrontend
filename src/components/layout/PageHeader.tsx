"use client"

import React from "react"
import {
  IonHeader,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonBackButton,
  IonTitle,
  IonButton,
  IonIcon,
  IonSpinner,
} from "@ionic/react"
import { refreshOutline } from "ionicons/icons"

interface PageHeaderProps {
  title: string
  defaultBackHref?: string
  showBackButton?: boolean
  showRefresh?: boolean
  onRefresh?: () => void
  isRefreshing?: boolean
  endButtons?: React.ReactNode
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  defaultBackHref = "/hr-dashboard",
  showBackButton = false,
  showRefresh = false,
  onRefresh,
  isRefreshing = false,
  endButtons,
}) => {
  return (
    <IonHeader>
      <IonToolbar>
        <IonButtons slot="start">
          <IonMenuButton />
          {showBackButton && <IonBackButton defaultHref={defaultBackHref} />}
        </IonButtons>
        <IonTitle>{title}</IonTitle>
        {(showRefresh || endButtons) && (
          <IonButtons slot="end">
            {showRefresh && onRefresh && (
              <IonButton onClick={onRefresh} disabled={isRefreshing}>
                {isRefreshing ? (
                  <IonSpinner name="crescent" />
                ) : (
                  <IonIcon slot="icon-only" icon={refreshOutline} />
                )}
              </IonButton>
            )}
            {endButtons}
          </IonButtons>
        )}
      </IonToolbar>
    </IonHeader>
  )
}

export default PageHeader
