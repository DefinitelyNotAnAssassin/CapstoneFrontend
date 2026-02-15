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
import employeeService from "../../services/EmployeeServiceNew"
import { useRole } from "../../contexts/RoleContext"
import type { EmployeeInformation } from "../../data/data"
import { MainLayout } from "@components/layout"

const EmployeeDirectory: React.FC = () => {
  const { userRole, employee: currentEmployee,  hasAnyPermission } = useRole()
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

  // FAB component
  const addEmployeeFAB = hasAnyPermission(['employee_create', 'employee_edit_all']) ? (
    <IonFab vertical="bottom" horizontal="end" slot="fixed">
      <IonFabButton routerLink="/employee-add">
        <IonIcon icon={add} />
      </IonFabButton>
    </IonFab>
  ) : null;

  return (
    <MainLayout 
      title="Employee Directory"
      showRefresh={true}
      onRefresh={() => loadEmployees()}
      isLoading={isLoading}
      fab={addEmployeeFAB}
    >
      <div className="employee-directory-container min-h-full bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent pullingIcon={refresh} refreshingSpinner="circles" />
        </IonRefresher>
        
        {/* Development: Role Debug Information */}
        
        <div className="px-4 py-3 bg-gradient-to-r from-slate-50 to-slate-100">
          <IonSearchbar
            value={searchText}
            onIonChange={(e) => setSearchText(e.detail.value!)}
            placeholder="Search employees by name, ID, position, or email..."
            animated
            className="rounded-xl shadow-sm"
          />
        </div>{/* Scope Information Card */}
        <div className="px-4 py-3">
          <IonCard className="rounded-xl shadow-md border border-slate-200 overflow-hidden">
            <IonCardHeader className="bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700">
              <IonCardTitle className="text-white">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <IonIcon icon={filter} className="text-2xl" />
                    <span className="text-lg md:text-xl font-semibold">{getScopeDescription()}</span>
                  </div>
                  <IonBadge 
                    color={userRole?.level === 0 ? 'success' : userRole?.level === 1 ? 'warning' : userRole?.level === 2 ? 'primary' : 'medium'} 
                    className="text-xs font-bold px-3 py-1.5 rounded-full"
                  >
                    Level {userRole?.level}
                  </IonBadge>
                </div>
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent className="bg-white">
              <p className="text-slate-700 text-sm md:text-base leading-relaxed mb-4">{getScopeExplanation()}</p>
              <div className="flex flex-wrap items-center gap-2">
                {userRole?.canApprove && (
                  <IonChip color="success" className="rounded-full shadow-sm">
                    <IonIcon icon={checkmarkCircleOutline} />
                    <IonLabel className="font-medium text-xs">Can Approve Leaves</IonLabel>
                  </IonChip>
                )}
                {userRole?.level !== undefined && userRole.level <= 2 && (
                  <IonChip color="primary" className="rounded-full shadow-sm p-2">
                    <IonIcon icon={shieldOutline} />
                    <IonLabel className="font-medium text-xs">Management Role</IonLabel>
                  </IonChip>
                )}
                {filteredEmployees.length > 0 && (
                  <IonBadge color="primary" className="px-3 py-2 rounded-full text-xs font-semibold shadow-sm">
                    {filteredEmployees.length} employee{filteredEmployees.length !== 1 ? 's' : ''} found
                  </IonBadge>
                )}
              </div>
            </IonCardContent>
          </IonCard>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <IonSpinner name="circles" className="w-16 h-16 text-primary-500" />
            <p className="mt-4 text-slate-600 text-sm font-medium">Loading employees...</p>
          </div>
        ) : (
          <>
            {filteredEmployees.length === 0 ? (
              <div className="px-4 py-3">
                <IonCard className="rounded-xl shadow-sm border border-slate-200">
                  <IonCardContent>
                    <div className="flex flex-col items-center justify-center py-12 px-4">
                      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                        <IonIcon icon={search} className="text-4xl text-slate-400" />
                      </div>
                      <p className="text-center text-slate-600 font-medium text-base mb-2">
                        {searchText ? 'No employees found' : 'No employees available'}
                      </p>
                      <p className="text-center text-slate-500 text-sm max-w-md">
                        {searchText 
                          ? 'Try adjusting your search terms or filters.' 
                          : 'There are currently no employees in your view scope.'}
                      </p>
                    </div>
                  </IonCardContent>
                </IonCard>
              </div>
            ) : (
              <div className="px-4 pb-20">
                <IonList className="bg-transparent">
                  {filteredEmployees.map((employee) => (
                    <IonItem 
                      key={employee.id} 
                      button 
                      routerLink={`/employee-detail/${employee.id}`} 
                      detail
                      className="mb-3  rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all duration-200"
                    >
                      <IonAvatar slot="start" className="my-3 mx-4">
                        <IonImg
                        src={employee.profileImage || "https://ionicframework.com/docs/img/demos/avatar.svg"}
                        alt={`${employee.firstName} ${employee.lastName}`}
                      />
                    </IonAvatar>                    
                    <IonLabel className="py-3">
                      <h2 className="font-semibold text-slate-900 text-base mb-1 flex items-center flex-wrap gap-2">
                        <span>{employee.lastName}, {employee.firstName} {employee.middleName ? employee.middleName.charAt(0) + "." : ""}</span>
                        {getRoleBadge(employee) && (
                          <IonChip 
                            color={getRoleBadge(employee)?.color as any} 
                            className="text-xs font-bold px-2 py-0.5 rounded-full"
                          >
                            {getRoleBadge(employee)?.label}
                          </IonChip>
                        )}
                      </h2>
                      <p className="text-slate-600 text-sm mb-1">{getPositionDisplay(employee)}</p>
                      {/* Only show department if not VPAA */}
                      {getDepartmentDisplay(employee) && (
                        <p className="text-slate-500 text-xs">{getDepartmentDisplay(employee)}</p>
                      )}
                      {employee.program_name && (
                        <p className="text-primary-600 text-xs font-medium mt-1 flex items-center gap-1">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary-500"></span>
                          Program: {employee.program_name}
                        </p>
                      )}
                    </IonLabel>
                    <IonChip slot="end" color="primary" className="font-mono text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm">
                      {employee.employeeId}
                    </IonChip>
                  </IonItem>
                ))}
              </IonList>
              </div>
            )}
          </>
        )}

        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header="Error"
          message={alertMessage}
          buttons={["OK"]}
          cssClass="custom-alert"
        />

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2000}
          color="success"
          position="bottom"
          cssClass="custom-toast"
        />
      </div>
    </MainLayout>
  )
}

export default EmployeeDirectory

