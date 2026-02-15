"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  IonContent,
  IonSearchbar,
  IonList,
  IonItem,
  IonLabel,
  IonAvatar,
  IonImg,
  IonButton,
  IonIcon,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonChip,
  IonBadge,
  IonSpinner,
  IonRefresher,
  IonRefresherContent,
  IonAlert,
  IonToast,
  IonFab,
  IonFabButton,
  IonGrid,
  IonRow,
  IonCol,
  IonText,
  IonSegment,
  IonSegmentButton,
} from "@ionic/react"
import { 
  add, 
  search, 
  refresh, 
  checkmarkCircleOutline, 
  shieldOutline,
  peopleOutline,
  createOutline,
  eyeOutline,
  businessOutline,
  schoolOutline,
  personOutline
} from "ionicons/icons"
import employeeService from "../../services/EmployeeService"
import { useRole } from "../../contexts/RoleContext"
import type { EmployeeInformation } from "../../data/data"
import { MainLayout } from "@components/layout"

const EmployeeManagement: React.FC = () => {
  const { userRole, employee: currentEmployee, hasPermission } = useRole()
  const [searchText, setSearchText] = useState("")
  const [managedEmployees, setManagedEmployees] = useState<EmployeeInformation[]>([])
  const [filteredEmployees, setFilteredEmployees] = useState<EmployeeInformation[]>([])
  const [managementScope, setManagementScope] = useState<any>(null)
  const [selectedSegment, setSelectedSegment] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")

  // Load managed employees on component mount
  useEffect(() => {
    if (currentEmployee?.id && userRole && (userRole.level <= 2)) {
      loadManagedEmployees()
      loadManagementScope()
    } else {
      setIsLoading(false)
    }
  }, [currentEmployee, userRole])

  // Filter employees when search text or segment changes
  useEffect(() => {
    filterEmployees()
  }, [searchText, managedEmployees, selectedSegment])

  const loadManagedEmployees = async () => {
    try {
      setIsLoading(true)
      if (!currentEmployee?.id) {
        setManagedEmployees([])
        return
      }

      const employees = await employeeService.getManagedEmployees(currentEmployee.id)
      setManagedEmployees(employees)
      setToastMessage(`Loaded ${employees.length} managed employees`)
      setShowToast(true)
    } catch (error) {
      console.error("Error loading managed employees:", error)
      setAlertMessage("Failed to load managed employees. Please try again.")
      setShowAlert(true)
    } finally {
      setIsLoading(false)
    }
  }

  const loadManagementScope = async () => {
    try {
      if (!currentEmployee?.id) return
      
      const scope = await employeeService.getManagementScope(currentEmployee.id)
      setManagementScope(scope)
    } catch (error) {
      console.error("Error loading management scope:", error)
    }
  }

  const filterEmployees = () => {
    let filtered = managedEmployees

    // Filter by segment (role level)
    if (selectedSegment !== "all") {
      const targetLevel = parseInt(selectedSegment)
      filtered = filtered.filter(emp => emp.academic_role_level === targetLevel)
    }

    // Filter by search text
    if (searchText.trim()) {
      const lowerQuery = searchText.toLowerCase()
      filtered = filtered.filter(
        (employee) =>
          employee.firstName.toLowerCase().includes(lowerQuery) ||
          employee.lastName.toLowerCase().includes(lowerQuery) ||
          employee.employeeId.toLowerCase().includes(lowerQuery) ||
          (employee.position_title && employee.position_title.toLowerCase().includes(lowerQuery)) ||
          (employee.department_name && employee.department_name.toLowerCase().includes(lowerQuery)) ||
          (employee.email && employee.email.toLowerCase().includes(lowerQuery))
      )
    }

    setFilteredEmployees(filtered)
  }

  const handleRefresh = async (event: CustomEvent) => {
    await loadManagedEmployees()
    await loadManagementScope()
    event.detail.complete()
  }

  // Helper function to get role badge info
  const getRoleBadge = (employee: EmployeeInformation) => {
    const roleLevel = employee.academic_role_level
    if (roleLevel === undefined || roleLevel === null) return null
    
    const roleBadges = {
      0: { label: 'VPAA', color: 'success' },
      1: { label: 'DEAN', color: 'warning' },
      2: { label: 'PC', color: 'primary' },
      3: { label: 'RF', color: 'secondary' },
      4: { label: 'PTF', color: 'medium' },
      5: { label: 'SEC', color: 'light' }
    }
    
    return roleBadges[roleLevel as keyof typeof roleBadges] || null
  }

  // Helper function to get position display
  const getPositionDisplay = (employee: EmployeeInformation) => {
    return employee.position_title || "Unknown Position"
  }

  // Helper function to get department and program display
  const getDepartmentAndProgramDisplay = (employee: EmployeeInformation) => {
    const dept = employee.department_name || "Unknown Department";
    const prog = employee.program_name || null;
    if (dept && prog) return `${dept} \u2022 ${prog}`;
    if (dept) return dept;
    if (prog) return prog;
    return "No Department/Program";
  }

  // Get management scope description
  const getManagementDescription = () => {
    if (!managementScope) return "Loading management scope..."
    
    const roleLevel = managementScope.role_level
    const count = managementScope.manageable_employees_count || 0
    
    switch (roleLevel) {
      case 0:
        return `As VPAA, you can manage all ${count} employees across the organization.`
      case 1:
        return `As Dean of ${managementScope.department?.name || "your department"}, you can manage ${count} employees (Program Chairs, Faculty, and Staff).`
      case 2:
        const programName = managementScope.program?.name || "your program"
        return `As Program Chair of ${programName}, you can manage ${count} faculty and staff members.`
      default:
        return "You do not have management responsibilities."
    }
  }

  // Check if user can manage employees
  const canManage = userRole && userRole.level <= 2

  if (!canManage) {
    return (
      <MainLayout title="Employee Management">
          <IonCard>
            <IonCardContent>
              <div style={{ textAlign: 'center', padding: '2rem' }}>
                <IonIcon icon={businessOutline} size="large" color="medium" />
                <h2>Access Restricted</h2>
                <p>You do not have management permissions. Only VPAA, Deans, and Program Chairs can manage employees.</p>
                <IonButton routerLink="/hr-dashboard" fill="outline">
                  Return to Dashboard
                </IonButton>
              </div>
            </IonCardContent>
          </IonCard>
      </MainLayout>
    )
  }

  return (
    <MainLayout 
      title="Employee Management"
      showRefresh={true}
      onRefresh={() => loadManagedEmployees()}
      isLoading={isLoading}
      fab={
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton routerLink="/employee-add">
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>
      }
    >
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent pullingIcon={refresh} refreshingSpinner="circles" />
        </IonRefresher>

        {/* Management Scope Information */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>
              <IonIcon icon={shieldOutline} style={{ marginRight: '8px' }} />
              Management Scope
              <IonBadge color={userRole?.level === 0 ? 'success' : userRole?.level === 1 ? 'warning' : 'primary'} style={{ marginLeft: '8px' }}>
                {managementScope?.role_title || 'Loading...'}
              </IonBadge>
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <p>{getManagementDescription()}</p>
            <div style={{ marginTop: '10px' }}>
              {userRole?.canApprove && (
                <IonChip color="success">
                  <IonIcon icon={checkmarkCircleOutline} />
                  <IonLabel>Can Approve Leaves</IonLabel>
                </IonChip>
              )}
              <IonChip color="primary">
                <IonIcon icon={peopleOutline} />
                <IonLabel>{filteredEmployees.length} Employees</IonLabel>
              </IonChip>
            </div>
          </IonCardContent>
        </IonCard>

        <IonSearchbar
          value={searchText}
          onIonChange={(e) => setSearchText(e.detail.value!)}
          placeholder="Search managed employees"
          animated
        />

        {/* Role Filter Segments */}
        <IonCard>
          <IonCardContent>
            <IonSegment value={selectedSegment} onIonChange={(e) => setSelectedSegment(e.detail.value as string)}>
              <IonSegmentButton value="all">
                <IonLabel>All</IonLabel>
              </IonSegmentButton>
              {userRole?.level <= 1 && (
                <IonSegmentButton value="2">
                  <IonLabel>Program Chairs</IonLabel>
                </IonSegmentButton>
              )}
              <IonSegmentButton value="3">
                <IonLabel>Regular Faculty</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="4">
                <IonLabel>Part-Time Faculty</IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="5">
                <IonLabel>Staff</IonLabel>
              </IonSegmentButton>
            </IonSegment>
          </IonCardContent>
        </IonCard>

        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
            <IonSpinner name="circles" />
          </div>
        ) : (
          <>
            {filteredEmployees.length === 0 ? (
              <IonCard>
                <IonCardContent>
                  <p style={{ textAlign: 'center', color: 'var(--ion-color-medium)' }}>
                    {searchText ? 'No employees found matching your search.' : 'No employees under your management.'}
                  </p>
                </IonCardContent>
              </IonCard>
            ) : (
              <IonList>
                {filteredEmployees.map((employee) => (
                  <IonItem key={employee.id} button detail>
                    <IonAvatar slot="start">
                      <IonImg
                        src={employee.profileImage || "https://ionicframework.com/docs/img/demos/avatar.svg"}
                        alt={`${employee.firstName} ${employee.lastName}`}
                      />
                    </IonAvatar>
                    <IonLabel>
                      <h2>
                        {employee.lastName}, {employee.firstName} {employee.middleName ? employee.middleName.charAt(0) + "." : ""}
                        {getRoleBadge(employee) && (
                          <IonChip 
                            color={getRoleBadge(employee)?.color as any} 
                            style={{ marginLeft: '8px', fontSize: '0.7em' }}
                          >
                            {getRoleBadge(employee)?.label}
                          </IonChip>
                        )}
                      </h2>
                      <p>{getPositionDisplay(employee)}</p>
                      <p>{getDepartmentAndProgramDisplay(employee)}</p>
                    </IonLabel>
                    <div slot="end">
                      <IonButton fill="clear" routerLink={`/employee-detail/${employee.id}`}>
                        <IonIcon icon={eyeOutline} />
                      </IonButton>
                      <IonButton fill="clear" routerLink={`/employee-edit/${employee.id}`}>
                        <IonIcon icon={createOutline} />
                      </IonButton>
                    </div>
                  </IonItem>
                ))}
              </IonList>
            )}
          </>
        )}

        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header="Error"
          message={alertMessage}
          buttons={["OK"]}
        />

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2000}
          position="bottom"
        />
    </MainLayout>
  )
}

export default EmployeeManagement
