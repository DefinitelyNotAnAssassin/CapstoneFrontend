"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonSelect,
  IonSelectOption,
  IonList,
  IonAvatar,
  IonImg,
  IonIcon,
  IonBadge,
  IonChip,
  IonSearchbar,
  IonButton,
  IonGrid,
  IonRow,
  IonCol,
} from "@ionic/react"
import { call, mail, chevronForward } from "ionicons/icons"
import { employees, departments, offices, programs, positions, type EmployeeInformation } from "../data/data"

const Organization: React.FC = () => {
  const [segment, setSegment] = useState<"academic" | "administrative">("academic")
  const [selectedDepartment, setSelectedDepartment] = useState<string>("")
  const [selectedProgram, setSelectedProgram] = useState<string>("")
  const [selectedOffice, setSelectedOffice] = useState<string>("")
  const [filteredEmployees, setFilteredEmployees] = useState<EmployeeInformation[]>([])
  const [searchText, setSearchText] = useState<string>("")

  // Filter departments by type
  const academicDepartments = departments.filter((dept) => {
    // Check if any program belongs to this department
    return programs.some((prog) => prog.departmentId === dept.id)
  })

  const administrativeDepartments = departments.filter((dept) => {
    // Check if any office belongs to this department
    return offices.some((office) => office.departmentId === dept.id)
  })

  // Filter programs by selected department
  const departmentPrograms = programs.filter((program) => program.departmentId === selectedDepartment)

  // Filter offices by selected department
  const departmentOffices = offices.filter((office) => office.departmentId === selectedDepartment)

  // Get position title
  const getPositionTitle = (positionId: string) => {
    const position = positions.find((pos) => pos.id === positionId)
    return position ? position.title : "Unknown Position"
  }

  // Get department name
  const getDepartmentName = (departmentId: string) => {
    const department = departments.find((dept) => dept.id === departmentId)
    return department ? department.name : "Unknown Department"
  }

  // Get program name
  const getProgramName = (programId?: string) => {
    if (!programId) return "N/A"
    const program = programs.find((prog) => prog.id === programId)
    return program ? program.name : "Unknown Program"
  }

  // Get office name
  const getOfficeName = (officeId: string) => {
    const office = offices.find((off) => off.id === officeId)
    return office ? office.name : "Unknown Office"
  }

  // Filter employees based on selections and search text
  useEffect(() => {
    let filtered = [...employees]

    // Filter by segment (academic or administrative)
    filtered = filtered.filter((emp) => {
      const position = positions.find((pos) => pos.id === emp.positionId)
      return position?.type === (segment === "academic" ? "Academic" : "Administration")
    })

    // Filter by department if selected
    if (selectedDepartment) {
      filtered = filtered.filter((emp) => emp.departmentId === selectedDepartment)
    }

    // Filter by program if selected (academic only)
    if (segment === "academic" && selectedProgram) {
      filtered = filtered.filter((emp) => emp.programId === selectedProgram)
    }

    // Filter by office if selected (administrative only)
    if (segment === "administrative" && selectedOffice) {
      filtered = filtered.filter((emp) => emp.officeId === selectedOffice)
    }

    // Filter by search text
    if (searchText) {
      const searchLower = searchText.toLowerCase()
      filtered = filtered.filter(
        (emp) =>
          emp.firstName.toLowerCase().includes(searchLower) ||
          emp.lastName.toLowerCase().includes(searchLower) ||
          emp.employeeId.toLowerCase().includes(searchLower) ||
          getPositionTitle(emp.positionId).toLowerCase().includes(searchLower),
      )
    }

    // Sort by position level (hierarchy)
    filtered.sort((a, b) => {
      const posA = positions.find((pos) => pos.id === a.positionId)
      const posB = positions.find((pos) => pos.id === b.positionId)
      return (posA?.level || 99) - (posB?.level || 99)
    })

    setFilteredEmployees(filtered)
  }, [segment, selectedDepartment, selectedProgram, selectedOffice, searchText])

  // Reset filters when segment changes
  useEffect(() => {
    setSelectedDepartment("")
    setSelectedProgram("")
    setSelectedOffice("")
  }, [segment])

  // Reset program/office when department changes
  useEffect(() => {
    setSelectedProgram("")
    setSelectedOffice("")
  }, [selectedDepartment])

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Organization</IonTitle>
        </IonToolbar>
        <IonToolbar>
          <IonSegment value={segment} onIonChange={(e) => setSegment(e.detail.value as any)}>
            <IonSegmentButton value="academic">
              <IonLabel>Academic</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="administrative">
              <IonLabel>Administrative</IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Filters</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonGrid>
              <IonRow>
                <IonCol size="12" size-md="6">
                  <IonItem>
                    <IonLabel position="stacked">Department</IonLabel>
                    <IonSelect
                      value={selectedDepartment}
                      placeholder="Select Department"
                      onIonChange={(e) => setSelectedDepartment(e.detail.value)}
                    >
                      <IonSelectOption value="">All Departments</IonSelectOption>
                      {(segment === "academic" ? academicDepartments : administrativeDepartments).map((dept) => (
                        <IonSelectOption key={dept.id} value={dept.id}>
                          {dept.name}
                        </IonSelectOption>
                      ))}
                    </IonSelect>
                  </IonItem>
                </IonCol>

                {segment === "academic" && (
                  <IonCol size="12" size-md="6">
                    <IonItem>
                      <IonLabel position="stacked">Program</IonLabel>
                      <IonSelect
                        value={selectedProgram}
                        placeholder="Select Program"
                        onIonChange={(e) => setSelectedProgram(e.detail.value)}
                        disabled={!selectedDepartment}
                      >
                        <IonSelectOption value="">All Programs</IonSelectOption>
                        {departmentPrograms.map((program) => (
                          <IonSelectOption key={program.id} value={program.id}>
                            {program.name}
                          </IonSelectOption>
                        ))}
                      </IonSelect>
                    </IonItem>
                  </IonCol>
                )}

                {segment === "administrative" && (
                  <IonCol size="12" size-md="6">
                    <IonItem>
                      <IonLabel position="stacked">Office</IonLabel>
                      <IonSelect
                        value={selectedOffice}
                        placeholder="Select Office"
                        onIonChange={(e) => setSelectedOffice(e.detail.value)}
                        disabled={!selectedDepartment}
                      >
                        <IonSelectOption value="">All Offices</IonSelectOption>
                        {departmentOffices.map((office) => (
                          <IonSelectOption key={office.id} value={office.id}>
                            {office.name}
                          </IonSelectOption>
                        ))}
                      </IonSelect>
                    </IonItem>
                  </IonCol>
                )}
              </IonRow>
            </IonGrid>

            <IonSearchbar
              value={searchText}
              onIonChange={(e) => setSearchText(e.detail.value!)}
              placeholder="Search employees"
              className="ion-margin-top"
            />
          </IonCardContent>
        </IonCard>

        <IonCard>
          <IonCardHeader>
            <IonCardTitle>
              {segment === "academic" ? "Academic" : "Administrative"} Staff
              {filteredEmployees.length > 0 && (
                <IonBadge color="primary" className="ion-margin-start">
                  {filteredEmployees.length}
                </IonBadge>
              )}
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            {filteredEmployees.length === 0 ? (
              <div className="ion-padding ion-text-center">
                <p>No employees found with the selected filters.</p>
                <IonButton
                  fill="outline"
                  onClick={() => {
                    setSelectedDepartment("")
                    setSelectedProgram("")
                    setSelectedOffice("")
                    setSearchText("")
                  }}
                >
                  Clear Filters
                </IonButton>
              </div>
            ) : (
              <IonList>
                {filteredEmployees.map((employee) => (
                  <IonItem key={employee.id} button routerLink={`/employee-detail/${employee.id}`} detail>
                    <IonAvatar slot="start">
                      <IonImg
                        src={employee.profileImage || "https://ionicframework.com/docs/img/demos/avatar.svg"}
                        alt={`${employee.firstName} ${employee.lastName}`}
                      />
                    </IonAvatar>
                    <IonLabel>
                      <h2>
                        {employee.lastName}, {employee.firstName}{" "}
                        {employee.middleName ? employee.middleName.charAt(0) + "." : ""}
                        {employee.suffix ? `, ${employee.suffix}` : ""}
                      </h2>
                      <h3>{getPositionTitle(employee.positionId)}</h3>
                      <p>
                        {segment === "academic" && employee.programId
                          ? getProgramName(employee.programId)
                          : getOfficeName(employee.officeId)}
                      </p>
                    </IonLabel>
                    <div slot="end" className="ion-text-right ion-hide-sm-down">
                      <IonChip color="primary" outline>
                        <IonIcon icon={mail} />
                        <IonLabel className="ion-hide-md-down">{employee.email}</IonLabel>
                      </IonChip>
                      <IonChip color="secondary" outline>
                        <IonIcon icon={call} />
                        <IonLabel className="ion-hide-md-down">{employee.mobileNo}</IonLabel>
                      </IonChip>
                    </div>
                    <IonIcon icon={chevronForward} slot="end" className="ion-hide-md-up" />
                  </IonItem>
                ))}
              </IonList>
            )}
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  )
}

export default Organization
