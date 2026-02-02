"use client"

import React from "react"
import { IonCard, IonCardContent, IonIcon, IonGrid, IonRow, IonCol, IonButton } from "@ionic/react"

export interface Module {
  title: string
  icon: string
  path: string
  color: string
  description?: string
  badge?: string
}

interface ModulesGridProps {
  modules: Module[]
  onModuleClick: (module: Module) => void
}

export const ModulesGrid: React.FC<ModulesGridProps> = ({ modules, onModuleClick }) => {
  const getColorClass = (color: string): string => {
    const colorMap: Record<string, string> = {
      primary: "module-card-primary",
      success: "module-card-success",
      danger: "module-card-danger",
      warning: "module-card-warning",
      secondary: "module-card-secondary",
      tertiary: "module-card-tertiary",
      dark: "module-card-dark",
    }
    return colorMap[color] || "module-card-primary"
  }

  return (
    <div className="modules-section">
      <h2 className="section-title">Available Modules</h2>
      <IonGrid>
        <IonRow className="ion-align-items-stretch">
          {modules.map((module, index) => (
            <IonCol key={index} sizeSm="12" sizeMd="6" sizeLg="4" className="module-col">
              <IonButton
                fill="clear"
                expand="block"
                className="module-button"
                onClick={() => onModuleClick(module)}
              >
                <IonCard className={`module-card ${getColorClass(module.color)}`}>
                  <IonCardContent className="module-card-content">
                    <div className="module-icon-wrapper">
                      <IonIcon icon={module.icon} className="module-icon" />
                    </div>
                    <h3 className="module-title">{module.title}</h3>
                    {module.description && <p className="module-description">{module.description}</p>}
                    {module.badge && <span className="module-badge">{module.badge}</span>}
                  </IonCardContent>
                </IonCard>
              </IonButton>
            </IonCol>
          ))}
        </IonRow>
      </IonGrid>
    </div>
  )
}
