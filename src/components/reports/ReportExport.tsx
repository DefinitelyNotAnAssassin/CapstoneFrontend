"use client"

import type React from "react"
import { IonButton, IonIcon } from "@ionic/react"
import { documentOutline } from "ionicons/icons"

interface ReportExportProps {
  isGenerating: boolean
  onExport: () => void
  disabled?: boolean
}

const ReportExport: React.FC<ReportExportProps> = ({ isGenerating, onExport, disabled = false }) => {
  return (
    <IonButton expand="block" onClick={onExport} disabled={isGenerating || disabled}>
      <IonIcon icon={documentOutline} slot="start" />
      Export as PDF
    </IonButton>
  )
}

export default ReportExport
