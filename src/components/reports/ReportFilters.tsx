"use client"

import type React from "react"
import { IonItem, IonLabel, IonSelect, IonSelectOption, IonDatetime, IonSegment, IonSegmentButton } from "@ionic/react"

interface ReportFiltersProps {
  departments: string[]
  selectedDepartment: string
  startDate: string
  endDate: string
  orientation: "portrait" | "landscape"
  onDepartmentChange: (department: string) => void
  onStartDateChange: (date: string) => void
  onEndDateChange: (date: string) => void
  onOrientationChange: (orientation: "portrait" | "landscape") => void
}

const ReportFilters: React.FC<ReportFiltersProps> = ({
  departments,
  selectedDepartment,
  startDate,
  endDate,
  orientation,
  onDepartmentChange,
  onStartDateChange,
  onEndDateChange,
  onOrientationChange,
}) => {
  return (
    <div className="report-filters">
      <IonItem>
        <IonLabel>Department</IonLabel>
        <IonSelect value={selectedDepartment} onIonChange={(e) => onDepartmentChange(e.detail.value)}>
          <IonSelectOption value="All">All Departments</IonSelectOption>
          {departments.map((dept) => (
            <IonSelectOption key={dept} value={dept}>
              {dept}
            </IonSelectOption>
          ))}
        </IonSelect>
      </IonItem>

      <IonItem>
        <IonLabel>Start Date</IonLabel>
        <IonDatetime
          displayFormat="YYYY-MM-DD"
          value={startDate}
          onIonChange={(e) => onStartDateChange(e.detail.value?.toString() || "")}
        ></IonDatetime>
      </IonItem>

      <IonItem>
        <IonLabel>End Date</IonLabel>
        <IonDatetime
          displayFormat="YYYY-MM-DD"
          value={endDate}
          onIonChange={(e) => onEndDateChange(e.detail.value?.toString() || "")}
        ></IonDatetime>
      </IonItem>

      <IonItem lines="none">
        <IonLabel>Orientation</IonLabel>
      </IonItem>
      <IonSegment value={orientation} onIonChange={(e) => onOrientationChange(e.detail.value as any)}>
        <IonSegmentButton value="portrait">
          <IonLabel>Portrait</IonLabel>
        </IonSegmentButton>
        <IonSegmentButton value="landscape">
          <IonLabel>Landscape</IonLabel>
        </IonSegmentButton>
      </IonSegment>
    </div>
  )
}

export default ReportFilters
