import type React from "react"
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent } from "@ionic/react"

interface TableSectionProps {
  title: string
  tableNumber: number
  description: string
  children: React.ReactNode
  className?: string
}

const TableSection: React.FC<TableSectionProps> = ({ title, tableNumber, description, children, className }) => {
  return (
    <IonCard className={className}>
      <IonCardHeader>
        <IonCardTitle>
          Table {tableNumber}: {title}
        </IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        <p className="table-description">{description}</p>
        <div className="table-container">{children}</div>
      </IonCardContent>
    </IonCard>
  )
}

export default TableSection
