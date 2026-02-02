"use client"

import React from "react"
import { IonPage, IonContent, IonSpinner, IonText } from "@ionic/react"

interface LoadingStateProps {
  message?: string
  submessage?: string
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = "Loading dashboard...",
  submessage = "Initializing your session...",
}) => {
  return (
    <IonPage>
      <IonContent className="ion-padding ion-text-center loading-content">
        <div className="loading-container">
          <IonSpinner name="crescent" color="primary" />
          <IonText>
            <p className="loading-message">{message}</p>
            {submessage && <p className="loading-submessage">{submessage}</p>}
          </IonText>
        </div>
      </IonContent>
    </IonPage>
  )
}
