"use client"

import React from "react"
import { IonAlert } from "@ionic/react"

interface LogoutAlertProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
}

export const LogoutAlert: React.FC<LogoutAlertProps> = ({ isOpen, onClose, onConfirm }) => {
  return (
    <IonAlert
      isOpen={isOpen}
      onDidDismiss={onClose}
      header="Confirm Logout"
      message="Are you sure you want to log out?"
      buttons={[
        {
          text: "Cancel",
          role: "cancel",
          handler: onClose,
        },
        {
          text: "Logout",
          role: "destructive",
          handler: onConfirm,
        },
      ]}
    />
  )
}
