"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonItem,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonIcon,
  IonFab,
  IonFabButton,
  IonModal,
  IonTextarea,
  IonToast,
  IonText,
  IonItemSliding,
  IonItemOptions,
  IonItemOption,
} from "@ionic/react"
import { add, create, trash, business, school, briefcase } from "ionicons/icons"
import {
  departments,
  programs,
  offices,
  employees,
  organizations,
  type Department,
  type Program,
  type Office,
} from "../../data/data"

const OrganizationManagement: React.FC = () => {
  const [segment, setSegment] = useState<"departments" | "programs" | "offices">("departments")
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState<"add" | "edit">("add")
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  const [toastColor, setToastColor] = useState("success")

  // Data states
  const [departmentsList, setDepartmentsList] = useState<Department[]>([])
  const [programsList, setProgramsList] = useState<Program[]>([])
  const [officesList, setOfficesList] = useState<Office[]>([])

  // Form states
  const [departmentForm, setDepartmentForm] = useState<Partial<Department>>({
    id: "",
    name: "",
    organizationId: "1", // Default to first organization
    description: "",
    headId: "",
  })

  const [programForm, setProgramForm] = useState<Partial<Program>>({
    id: "",
    name: "",
    departmentId: "",
    description: "",
    chairId: "",
  })

  const [officeForm, setOfficeForm] = useState<Partial<Office>>({
    id: "",
    name: "",
    departmentId: "",
    location: "",
    extension: "",
  })

  // Load data from localStorage or use default data
  useEffect(() => {
    const savedDepartments = localStorage.getItem("hrims-departments")
    const savedPrograms = localStorage.getItem("hrims-programs")
    const savedOffices = localStorage.getItem("hrims-offices")

    if (savedDepartments) {
      setDepartmentsList(JSON.parse(savedDepartments))
    } else {
      setDepartmentsList(departments)
    }

    if (savedPrograms) {
      setProgramsList(JSON.parse(savedPrograms))
    } else {
      setProgramsList(programs)
    }

    if (savedOffices) {
      setOfficesList(JSON.parse(savedOffices))
    } else {
      setOfficesList(offices)
    }
  }, [])

  // Save data to localStorage
  const saveData = () => {
    localStorage.setItem("hrims-departments", JSON.stringify(departmentsList))
    localStorage.setItem("hrims-programs", JSON.stringify(programsList))
    localStorage.setItem("hrims-offices", JSON.stringify(officesList))
  }

  // Handle opening modal for add
  const handleAddClick = () => {
    setModalType("add")

    if (segment === "departments") {
      setDepartmentForm({
        id: String(Date.now()),
        name: "",
        organizationId: "1",
        description: "",
        headId: "",
      })
    } else if (segment === "programs") {
      setProgramForm({
        id: String(Date.now()),
        name: "",
        departmentId: "",
        description: "",
        chairId: "",
      })
    } else if (segment === "offices") {
      setOfficeForm({
        id: String(Date.now()),
        name: "",
        departmentId: "",
        location: "",
        extension: "",
      })
    }

    setShowModal(true)
  }

  // Handle opening modal for edit
  const handleEditClick = (id: string) => {
    setModalType("edit")

    if (segment === "departments") {
      const department = departmentsList.find((dept) => dept.id === id)
      if (department) {
        setDepartmentForm({ ...department })
      }
    } else if (segment === "programs") {
      const program = programsList.find((prog) => prog.id === id)
      if (program) {
        setProgramForm({ ...program })
      }
    } else if (segment === "offices") {
      const office = officesList.find((off) => off.id === id)
      if (office) {
        setOfficeForm({ ...office })
      }
    }

    setShowModal(true)
  }

  // Handle delete
  const handleDelete = (id: string) => {
    if (segment === "departments") {
      // Check if department is referenced by programs or offices
      const hasPrograms = programsList.some((prog) => prog.departmentId === id)
      const hasOffices = officesList.some((off) => off.departmentId === id)

      if (hasPrograms || hasOffices) {
        setToastMessage("Cannot delete department that has programs or offices")
        setToastColor("danger")
        setShowToast(true)
        return
      }

      setDepartmentsList((prev) => prev.filter((dept) => dept.id !== id))
    } else if (segment === "programs") {
      // Check if program is referenced by employees
      const hasEmployees = employees.some((emp) => emp.programId === id)

      if (hasEmployees) {
        setToastMessage("Cannot delete program that has employees assigned")
        setToastColor("danger")
        setShowToast(true)
        return
      }

      setProgramsList((prev) => prev.filter((prog) => prog.id !== id))
    } else if (segment === "offices") {
      // Check if office is referenced by employees
      const hasEmployees = employees.some((emp) => emp.officeId === id)

      if (hasEmployees) {
        setToastMessage("Cannot delete office that has employees assigned")
        setToastColor("danger")
        setShowToast(true)
        return
      }

      setOfficesList((prev) => prev.filter((off) => off.id !== id))
    }

    saveData()
    setToastMessage("Item deleted successfully")
    setToastColor("success")
    setShowToast(true)
  }

  // Handle form submission
  const handleSubmit = () => {
    if (segment === "departments") {
      if (!departmentForm.name) {
        setToastMessage("Department name is required")
        setToastColor("danger")
        setShowToast(true)
        return
      }

      if (modalType === "add") {
        setDepartmentsList((prev) => [...prev, departmentForm as Department])
      } else {
        setDepartmentsList((prev) =>
          prev.map((dept) => (dept.id === departmentForm.id ? (departmentForm as Department) : dept)),
        )
      }
    } else if (segment === "programs") {
      if (!programForm.name || !programForm.departmentId) {
        setToastMessage("Program name and department are required")
        setToastColor("danger")
        setShowToast(true)
        return
      }

      if (modalType === "add") {
        setProgramsList((prev) => [...prev, programForm as Program])
      } else {
        setProgramsList((prev) => prev.map((prog) => (prog.id === programForm.id ? (programForm as Program) : prog)))
      }
    } else if (segment === "offices") {
      if (!officeForm.name || !officeForm.departmentId || !officeForm.location) {
        setToastMessage("Office name, department, and location are required")
        setToastColor("danger")
        setShowToast(true)
        return
      }

      if (modalType === "add") {
        setOfficesList((prev) => [...prev, officeForm as Office])
      } else {
        setOfficesList((prev) => prev.map((off) => (off.id === officeForm.id ? (officeForm as Office) : off)))
      }
    }

    saveData()
    setShowModal(false)
    setToastMessage(modalType === "add" ? "Item added successfully" : "Item updated successfully")
    setToastColor("success")
    setShowToast(true)
  }

  // Get department name by ID
  const getDepartmentName = (id: string) => {
    const department = departmentsList.find((dept) => dept.id === id)
    return department ? department.name : "Unknown Department"
  }

  // Get employee name by ID
  const getEmployeeName = (id?: string) => {
    if (!id) return "None"
    const employee = employees.find((emp) => emp.id === id)
    return employee ? `${employee.firstName} ${employee.lastName}` : "Unknown Employee"
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>Organization Management</IonTitle>
        </IonToolbar>
        <IonToolbar>
          <IonSegment value={segment} onIonChange={(e) => setSegment(e.detail.value as any)}>
            <IonSegmentButton value="departments">
              <IonIcon icon={business} />
              <IonLabel>Departments</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="programs">
              <IonIcon icon={school} />
              <IonLabel>Programs</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="offices">
              <IonIcon icon={briefcase} />
              <IonLabel>Offices</IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {segment === "departments" && (
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Departments</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonList>
                {departmentsList.length === 0 ? (
                  <IonItem>
                    <IonLabel className="ion-text-center">No departments found</IonLabel>
                  </IonItem>
                ) : (
                  departmentsList.map((department) => (
                    <IonItemSliding key={department.id}>
                      <IonItem>
                        <IonLabel>
                          <h2>{department.name}</h2>
                          <p>{department.description || "No description"}</p>
                          <p>Head: {getEmployeeName(department.headId)}</p>
                        </IonLabel>
                      </IonItem>
                      <IonItemOptions side="end">
                        <IonItemOption color="primary" onClick={() => handleEditClick(department.id)}>
                          <IonIcon slot="icon-only" icon={create} />
                        </IonItemOption>
                        <IonItemOption color="danger" onClick={() => handleDelete(department.id)}>
                          <IonIcon slot="icon-only" icon={trash} />
                        </IonItemOption>
                      </IonItemOptions>
                    </IonItemSliding>
                  ))
                )}
              </IonList>
            </IonCardContent>
          </IonCard>
        )}

        {segment === "programs" && (
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Programs</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonList>
                {programsList.length === 0 ? (
                  <IonItem>
                    <IonLabel className="ion-text-center">No programs found</IonLabel>
                  </IonItem>
                ) : (
                  programsList.map((program) => (
                    <IonItemSliding key={program.id}>
                      <IonItem>
                        <IonLabel>
                          <h2>{program.name}</h2>
                          <p>{program.description || "No description"}</p>
                          <p>Department: {getDepartmentName(program.departmentId)}</p>
                          <p>Chair: {getEmployeeName(program.chairId)}</p>
                        </IonLabel>
                      </IonItem>
                      <IonItemOptions side="end">
                        <IonItemOption color="primary" onClick={() => handleEditClick(program.id)}>
                          <IonIcon slot="icon-only" icon={create} />
                        </IonItemOption>
                        <IonItemOption color="danger" onClick={() => handleDelete(program.id)}>
                          <IonIcon slot="icon-only" icon={trash} />
                        </IonItemOption>
                      </IonItemOptions>
                    </IonItemSliding>
                  ))
                )}
              </IonList>
            </IonCardContent>
          </IonCard>
        )}

        {segment === "offices" && (
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Offices</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonList>
                {officesList.length === 0 ? (
                  <IonItem>
                    <IonLabel className="ion-text-center">No offices found</IonLabel>
                  </IonItem>
                ) : (
                  officesList.map((office) => (
                    <IonItemSliding key={office.id}>
                      <IonItem>
                        <IonLabel>
                          <h2>{office.name}</h2>
                          <p>Department: {getDepartmentName(office.departmentId)}</p>
                          <p>Location: {office.location}</p>
                          {office.extension && <p>Extension: {office.extension}</p>}
                        </IonLabel>
                      </IonItem>
                      <IonItemOptions side="end">
                        <IonItemOption color="primary" onClick={() => handleEditClick(office.id)}>
                          <IonIcon slot="icon-only" icon={create} />
                        </IonItemOption>
                        <IonItemOption color="danger" onClick={() => handleDelete(office.id)}>
                          <IonIcon slot="icon-only" icon={trash} />
                        </IonItemOption>
                      </IonItemOptions>
                    </IonItemSliding>
                  ))
                )}
              </IonList>
            </IonCardContent>
          </IonCard>
        )}

        {/* Department Modal */}
        <IonModal isOpen={showModal && segment === "departments"} onDidDismiss={() => setShowModal(false)}>
          <IonHeader>
            <IonToolbar color="primary">
              <IonTitle>{modalType === "add" ? "Add Department" : "Edit Department"}</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowModal(false)}>
                  <IonIcon slot="icon-only" icon={close} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <IonList>
              <IonItem>
                <IonLabel position="stacked">
                  Department Name <IonText color="danger">*</IonText>
                </IonLabel>
                <IonInput
                  value={departmentForm.name}
                  onIonChange={(e) => setDepartmentForm({ ...departmentForm, name: e.detail.value! })}
                  placeholder="Enter department name"
                  required
                />
              </IonItem>

              <IonItem>
                <IonLabel position="stacked">Organization</IonLabel>
                <IonSelect
                  value={departmentForm.organizationId}
                  onIonChange={(e) => setDepartmentForm({ ...departmentForm, organizationId: e.detail.value })}
                >
                  {organizations.map((org) => (
                    <IonSelectOption key={org.id} value={org.id}>
                      {org.name}
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>

              <IonItem>
                <IonLabel position="stacked">Description</IonLabel>
                <IonTextarea
                  value={departmentForm.description}
                  onIonChange={(e) => setDepartmentForm({ ...departmentForm, description: e.detail.value! })}
                  placeholder="Enter department description"
                  rows={3}
                />
              </IonItem>

              <IonItem>
                <IonLabel position="stacked">Department Head</IonLabel>
                <IonSelect
                  value={departmentForm.headId}
                  onIonChange={(e) => setDepartmentForm({ ...departmentForm, headId: e.detail.value })}
                  placeholder="Select department head"
                >
                  <IonSelectOption value="">None</IonSelectOption>
                  {employees.map((employee) => (
                    <IonSelectOption key={employee.id} value={employee.id}>
                      {employee.firstName} {employee.lastName}
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>
            </IonList>

            <div className="ion-padding">
              <IonButton expand="block" onClick={handleSubmit}>
                {modalType === "add" ? "Add Department" : "Update Department"}
              </IonButton>
            </div>
          </IonContent>
        </IonModal>

        {/* Program Modal */}
        <IonModal isOpen={showModal && segment === "programs"} onDidDismiss={() => setShowModal(false)}>
          <IonHeader>
            <IonToolbar color="primary">
              <IonTitle>{modalType === "add" ? "Add Program" : "Edit Program"}</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowModal(false)}>
                  <IonIcon slot="icon-only" icon={close} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <IonList>
              <IonItem>
                <IonLabel position="stacked">
                  Program Name <IonText color="danger">*</IonText>
                </IonLabel>
                <IonInput
                  value={programForm.name}
                  onIonChange={(e) => setProgramForm({ ...programForm, name: e.detail.value! })}
                  placeholder="Enter program name"
                  required
                />
              </IonItem>

              <IonItem>
                <IonLabel position="stacked">
                  Department <IonText color="danger">*</IonText>
                </IonLabel>
                <IonSelect
                  value={programForm.departmentId}
                  onIonChange={(e) => setProgramForm({ ...programForm, departmentId: e.detail.value })}
                  placeholder="Select department"
                  required
                >
                  {departmentsList.map((department) => (
                    <IonSelectOption key={department.id} value={department.id}>
                      {department.name}
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>

              <IonItem>
                <IonLabel position="stacked">Description</IonLabel>
                <IonTextarea
                  value={programForm.description}
                  onIonChange={(e) => setProgramForm({ ...programForm, description: e.detail.value! })}
                  placeholder="Enter program description"
                  rows={3}
                />
              </IonItem>

              <IonItem>
                <IonLabel position="stacked">Program Chair</IonLabel>
                <IonSelect
                  value={programForm.chairId}
                  onIonChange={(e) => setProgramForm({ ...programForm, chairId: e.detail.value })}
                  placeholder="Select program chair"
                >
                  <IonSelectOption value="">None</IonSelectOption>
                  {employees.map((employee) => (
                    <IonSelectOption key={employee.id} value={employee.id}>
                      {employee.firstName} {employee.lastName}
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>
            </IonList>

            <div className="ion-padding">
              <IonButton expand="block" onClick={handleSubmit}>
                {modalType === "add" ? "Add Program" : "Update Program"}
              </IonButton>
            </div>
          </IonContent>
        </IonModal>

        {/* Office Modal */}
        <IonModal isOpen={showModal && segment === "offices"} onDidDismiss={() => setShowModal(false)}>
          <IonHeader>
            <IonToolbar color="primary">
              <IonTitle>{modalType === "add" ? "Add Office" : "Edit Office"}</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowModal(false)}>
                  <IonIcon slot="icon-only" icon={close} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <IonList>
              <IonItem>
                <IonLabel position="stacked">
                  Office Name <IonText color="danger">*</IonText>
                </IonLabel>
                <IonInput
                  value={officeForm.name}
                  onIonChange={(e) => setOfficeForm({ ...officeForm, name: e.detail.value! })}
                  placeholder="Enter office name"
                  required
                />
              </IonItem>

              <IonItem>
                <IonLabel position="stacked">
                  Department <IonText color="danger">*</IonText>
                </IonLabel>
                <IonSelect
                  value={officeForm.departmentId}
                  onIonChange={(e) => setOfficeForm({ ...officeForm, departmentId: e.detail.value })}
                  placeholder="Select department"
                  required
                >
                  {departmentsList.map((department) => (
                    <IonSelectOption key={department.id} value={department.id}>
                      {department.name}
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>

              <IonItem>
                <IonLabel position="stacked">
                  Location <IonText color="danger">*</IonText>
                </IonLabel>
                <IonInput
                  value={officeForm.location}
                  onIonChange={(e) => setOfficeForm({ ...officeForm, location: e.detail.value! })}
                  placeholder="Enter office location"
                  required
                />
              </IonItem>

              <IonItem>
                <IonLabel position="stacked">Extension</IonLabel>
                <IonInput
                  value={officeForm.extension}
                  onIonChange={(e) => setOfficeForm({ ...officeForm, extension: e.detail.value! })}
                  placeholder="Enter extension number"
                />
              </IonItem>
            </IonList>

            <div className="ion-padding">
              <IonButton expand="block" onClick={handleSubmit}>
                {modalType === "add" ? "Add Office" : "Update Office"}
              </IonButton>
            </div>
          </IonContent>
        </IonModal>

        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={handleAddClick}>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>
      </IonContent>

      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={2000}
        color={toastColor}
      />
    </IonPage>
  )
}

export default OrganizationManagement
