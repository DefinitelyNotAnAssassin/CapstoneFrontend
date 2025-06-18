"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonSearchbar,
  IonList,
  IonItem,
  IonLabel,
  IonAvatar,
  IonImg,
  IonButton,
  IonIcon,
  IonFab,
  IonFabButton,
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
} from "@ionic/react"
import { add, search, filter, refresh, checkmarkCircleOutline, shieldOutline } from "ionicons/icons"
import employeeService from "../services/EmployeeServiceNew"
import { useRole } from "../contexts/RoleContext"
import type { EmployeeInformation } from "../data/data"
import RoleDebugger from "../components/RoleDebugger"

const EmployeeDirectory: React.FC = () => {
  const { userRole, employee: currentEmployee, hasPermission } = useRole()
  const [searchText, setSearchText] = useState("")
  const [employees, setEmployees] = useState<EmployeeInformation[]>([])
  const [filteredEmployees, setFilteredEmployees] = useState<EmployeeInformation[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  // Load employees on component mount and subscribe to changes
  useEffect(() => {
    if (userRole && currentEmployee) {
      loadEmployees()
    }
    
    // Subscribe to employee service changes
    const unsubscribe = employeeService.subscribe(() => {
      if (userRole && currentEmployee) {
        loadEmployees()
      }
    })
    
    // Cleanup subscription on component unmount
    return () => unsubscribe()
  }, [userRole, currentEmployee])

  // Filter employees when search text changes
  useEffect(() => {
    filterEmployees()
  }, [searchText, employees])
  const loadEmployees = async () => {
    try {
      setIsLoading(true)
      let employeeList: EmployeeInformation[] = []
      
      // Role-based employee filtering
      if (userRole?.level === 0) {
        // VPAA - can see all employees
        employeeList = await employeeService.getAllEmployees()      } else if (userRole?.level === 1) {
        // Dean - can see employees in their department
        if (currentEmployee?.departmentId) {
          employeeList = await employeeService.filterByDepartment(currentEmployee.departmentId)
        } else {
          employeeList = await employeeService.getAllEmployees()
        }
      } else if (userRole?.level === 2) {
        // Program Chair - can see employees in their program
        if (currentEmployee?.programId) {
          employeeList = await employeeService.filterByProgram(currentEmployee.programId)
        } else if (currentEmployee?.departmentId) {
          // Fallback to department if no program specified
          employeeList = await employeeService.filterByDepartment(currentEmployee.departmentId)
        } else {
          employeeList = await employeeService.getAllEmployees()
        }
      } else {
        // Regular faculty and below - only see themselves
        if (currentEmployee?.id) {
          const selfEmployee = await employeeService.getEmployeeById(currentEmployee.id)
          employeeList = selfEmployee ? [selfEmployee] : []
        } else {
          employeeList = []
        }
      }
      
      setEmployees(employeeList)
      setToastMessage(`Loaded ${employeeList.length} employees`)
      setShowToast(true)
    } catch (error) {
      console.error("Error loading employees:", error)
      setAlertMessage("Failed to load employees. Please try again.")
      setShowAlert(true)
    } finally {
      setIsLoading(false)
    }
  }
  const filterEmployees = () => {
    if (!searchText.trim()) {
      setFilteredEmployees(employees)
      return
    }

    const lowerQuery = searchText.toLowerCase()
    const filtered = employees.filter(
      (employee) =>
        employee.firstName.toLowerCase().includes(lowerQuery) ||
        employee.lastName.toLowerCase().includes(lowerQuery) ||
        employee.employeeId.toLowerCase().includes(lowerQuery) ||
        (employee.position_title && employee.position_title.toLowerCase().includes(lowerQuery)) ||
        (employee.department_name && employee.department_name.toLowerCase().includes(lowerQuery)) ||
        (employee.email && employee.email.toLowerCase().includes(lowerQuery))
    )
    setFilteredEmployees(filtered)
  }
  const handleRefresh = async (event: CustomEvent) => {
    await loadEmployees()
    event.detail.complete()
  }
  // Helper function to get the scope description
  const getScopeDescription = () => {
    if (!userRole || !currentEmployee) return "Loading..."
    
    const roleTitles = {
      0: "VPAA (Vice President for Academic Affairs)",
      1: "Dean",
      2: "Program Chair",
      3: "Regular Faculty", 
      4: "Part-Time Faculty",
      5: "Secretary",
      99: "Employee"
    };
    
    const roleTitle = roleTitles[userRole.level as keyof typeof roleTitles] || "Unknown Role";
    
    switch (userRole.level) {
      case 0:
        return `${roleTitle} - All Employees (${employees.length} total)`;
      case 1:
        return `${roleTitle} - ${currentEmployee?.department_name || "Unknown Department"} (${employees.length} employees)`;
      case 2:
        const programInfo = currentEmployee?.program_name 
          ? `${currentEmployee.program_name} Program` 
          : currentEmployee?.department_name || "Unknown Department";
        return `${roleTitle} - ${programInfo} (${employees.length} employees)`;
      default:
        return `${roleTitle} - Personal Profile`;
    }
  }

  // Helper function to get detailed scope explanation
  const getScopeExplanation = () => {
    if (!userRole) return "";
    
    switch (userRole.level) {
      case 0:
        return "As VPAA, you have access to view all employees across all departments and programs in the organization.";
      case 1:
        return `As a Dean, you can view all employees in your department (${currentEmployee?.department_name || "Unknown"}) and approve their leave requests.`;
      case 2:
        const scopeDetail = currentEmployee?.program_name 
          ? `your program (${currentEmployee.program_name})` 
          : `your department (${currentEmployee?.department_name || "Unknown"})`;
        return `As a Program Chair, you can view employees in ${scopeDetail} and approve their leave requests.`;
      default:
        return "You can only view and edit your own profile information.";
    }
  };

  // Helper function to get position title (with fallback)
  const getPositionDisplay = (employee: EmployeeInformation) => {
    return employee.position_title || "Unknown Position"
  }  // Helper function to get role badge info
  const getRoleBadge = (employee: EmployeeInformation) => {
    const roleLevel = employee.academic_role_level;
    if (roleLevel === undefined || roleLevel === null) return null;
    
    const roleBadges = {
      0: { label: 'VPAA', color: 'success' },
      1: { label: 'DEAN', color: 'warning' },
      2: { label: 'PC', color: 'primary' },
      3: { label: 'RF', color: 'secondary' },
      4: { label: 'PTF', color: 'medium' },
      5: { label: 'SEC', color: 'light' }
    };
    
    return roleBadges[roleLevel as keyof typeof roleBadges] || null;
  };

  // Helper function to get department name (with fallback)
  const getDepartmentDisplay = (employee: EmployeeInformation) => {
    // Hide department for VPAA (level 0)
    if (userRole?.level === 0) return null;
    return employee.department_name || "Unknown Department"
  };
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButton slot="start" routerLink="/hr-dashboard" color="primary">
            Back
          </IonButton>
          <IonTitle>Employee Directory</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent pullingIcon={refresh} refreshingSpinner="circles" />
        </IonRefresher>
        
        {/* Development: Role Debug Information */}
        {process.env.NODE_ENV === 'development' && <RoleDebugger />}
        
        <IonSearchbar
          value={searchText}
          onIonChange={(e) => setSearchText(e.detail.value!)}
          placeholder="Search employees"
          animated
        />{/* Scope Information Card */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>
              <IonIcon icon={filter} style={{ marginRight: '8px' }} />
              {getScopeDescription()}
              <IonBadge color={userRole?.level === 0 ? 'success' : userRole?.level === 1 ? 'warning' : userRole?.level === 2 ? 'primary' : 'medium'} style={{ marginLeft: '8px' }}>
                Level {userRole?.level}
              </IonBadge>
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <p>{getScopeExplanation()}</p>
            <div style={{ marginTop: '10px' }}>
              {userRole?.canApprove && (
                <IonChip color="success">
                  <IonIcon icon={checkmarkCircleOutline} />
                  <IonLabel>Can Approve Leaves</IonLabel>
                </IonChip>
              )}
              {userRole?.level !== undefined && userRole.level <= 2 && (
                <IonChip color="primary">
                  <IonIcon icon={shieldOutline} />
                  <IonLabel>Management Role</IonLabel>
                </IonChip>
              )}
              {filteredEmployees.length > 0 && (
                <IonBadge color="primary">
                  {filteredEmployees.length} employee{filteredEmployees.length !== 1 ? 's' : ''} found
                </IonBadge>
              )}
            </div>
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
                    {searchText ? 'No employees found matching your search.' : 'No employees found.'}
                  </p>
                </IonCardContent>
              </IonCard>
            ) : (
              <IonList>
                {filteredEmployees.map((employee) => (
                  <IonItem key={employee.id} button routerLink={`/employee-detail/${employee.id}`} detail>
                    <IonAvatar slot="start">
                      <IonImg
                        src={employee.profileImage || "https://ionicframework.com/docs/img/demos/avatar.svg"}
                        alt={`${employee.firstName} ${employee.lastName}`}
                      />
                    </IonAvatar>                    <IonLabel>
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
                      {/* Only show department if not VPAA */}
                      {getDepartmentDisplay(employee) && (
                        <p>{getDepartmentDisplay(employee)}</p>
                      )}
                      {employee.program_name && (
                        <p style={{ color: 'var(--ion-color-primary)' }}>
                          Program: {employee.program_name}
                        </p>
                      )}
                    </IonLabel>
                    <IonChip slot="end" color="primary">
                      {employee.employeeId}
                    </IonChip>
                  </IonItem>
                ))}
              </IonList>
            )}
          </>        )}

        {/* Add Employee FAB - only show to users who can manage employees */}
        {hasPermission('manageEmployees') && (
          <IonFab vertical="bottom" horizontal="end" slot="fixed">
            <IonFabButton routerLink="/employee-add">
              <IonIcon icon={add} />
            </IonFabButton>
          </IonFab>
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
          color="success"
        />
      </IonContent>
    </IonPage>
  )
}

export default EmployeeDirectory

