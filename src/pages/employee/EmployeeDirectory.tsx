"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
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
  IonSegment,
  IonSegmentButton,
} from "@ionic/react"
import {
  add,
  search,
  filter,
  refresh,
  checkmarkCircleOutline,
  shieldOutline,
  peopleOutline,
  eyeOutline,
} from "ionicons/icons"
import employeeService from "../../services/EmployeeService"
import { useRole } from "../../contexts/RoleContext"
import type { EmployeeInformation } from "../../data/data"
import { MainLayout } from "@components/layout"

type ViewMode = "directory" | "management"

const EmployeeDirectory: React.FC = () => {
  const { userRole, employee: currentEmployee, hasAnyPermission } = useRole()

  // View mode
  const canManage = userRole && userRole.level <= 2
  const [viewMode, setViewMode] = useState<ViewMode>("directory")

  // Shared state
  const [searchText, setSearchText] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")

  // Directory state
  const [employees, setEmployees] = useState<EmployeeInformation[]>([])
  const [filteredEmployees, setFilteredEmployees] = useState<EmployeeInformation[]>([])

  // Management state
  const [managedEmployees, setManagedEmployees] = useState<EmployeeInformation[]>([])
  const [filteredManagedEmployees, setFilteredManagedEmployees] = useState<EmployeeInformation[]>([])
  const [managementScope, setManagementScope] = useState<any>(null)
  const [selectedSegment, setSelectedSegment] = useState<string>("all")

  // ============================================================================
  // Data Loading
  // ============================================================================

  useEffect(() => {
    if (userRole && currentEmployee) {
      loadEmployees()
      if (canManage) {
        loadManagedEmployees()
        loadManagementScope()
      }
    }

    const unsubscribe = employeeService.subscribe(() => {
      if (userRole && currentEmployee) {
        loadEmployees()
        if (canManage) loadManagedEmployees()
      }
    })
    return () => unsubscribe()
  }, [userRole, currentEmployee])

  // Filter when search/data/segment changes
  useEffect(() => {
    filterDirectoryEmployees()
  }, [searchText, employees])

  useEffect(() => {
    filterManagedEmployees()
  }, [searchText, managedEmployees, selectedSegment])

  const loadEmployees = async () => {
    try {
      setIsLoading(true)
      let employeeList: EmployeeInformation[] = []

      if (userRole?.level === 0) {
        employeeList = await employeeService.getAllEmployees()
      } else if (userRole?.level === 1) {
        if (currentEmployee?.departmentId) {
          employeeList = await employeeService.filterByDepartment(currentEmployee.departmentId)
        } else {
          employeeList = await employeeService.getAllEmployees()
        }
      } else if (userRole?.level === 2) {
        if (currentEmployee?.programId) {
          employeeList = await employeeService.filterByProgram(currentEmployee.programId)
        } else if (currentEmployee?.departmentId) {
          employeeList = await employeeService.filterByDepartment(currentEmployee.departmentId)
        } else {
          employeeList = await employeeService.getAllEmployees()
        }
      } else {
        if (currentEmployee?.id) {
          const selfEmployee = await employeeService.getEmployeeById(currentEmployee.id)
          employeeList = selfEmployee ? [selfEmployee] : []
        }
      }

      setEmployees(employeeList)
    } catch (error) {
      console.error("Error loading employees:", error)
      setAlertMessage("Failed to load employees. Please try again.")
      setShowAlert(true)
    } finally {
      setIsLoading(false)
    }
  }

  const loadManagedEmployees = async () => {
    try {
      if (!currentEmployee?.id) {
        setManagedEmployees([])
        return
      }
      const emps = await employeeService.getManagedEmployees(currentEmployee.id)
      setManagedEmployees(emps)
    } catch (error) {
      console.error("Error loading managed employees:", error)
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

  // ============================================================================
  // Filtering
  // ============================================================================

  const filterDirectoryEmployees = () => {
    if (!searchText.trim()) {
      setFilteredEmployees(employees)
      return
    }
    const lowerQuery = searchText.toLowerCase()
    setFilteredEmployees(
      employees.filter(
        (emp) =>
          emp.firstName.toLowerCase().includes(lowerQuery) ||
          emp.lastName.toLowerCase().includes(lowerQuery) ||
          emp.employeeId.toLowerCase().includes(lowerQuery) ||
          (emp.position_title && emp.position_title.toLowerCase().includes(lowerQuery)) ||
          (emp.department_name && emp.department_name.toLowerCase().includes(lowerQuery)) ||
          (emp.email && emp.email.toLowerCase().includes(lowerQuery))
      )
    )
  }

  const filterManagedEmployees = () => {
    let filtered = managedEmployees

    if (selectedSegment !== "all") {
      const targetLevel = parseInt(selectedSegment)
      filtered = filtered.filter((emp) => emp.academic_role_level === targetLevel)
    }

    if (searchText.trim()) {
      const lowerQuery = searchText.toLowerCase()
      filtered = filtered.filter(
        (emp) =>
          emp.firstName.toLowerCase().includes(lowerQuery) ||
          emp.lastName.toLowerCase().includes(lowerQuery) ||
          emp.employeeId.toLowerCase().includes(lowerQuery) ||
          (emp.position_title && emp.position_title.toLowerCase().includes(lowerQuery)) ||
          (emp.department_name && emp.department_name.toLowerCase().includes(lowerQuery)) ||
          (emp.email && emp.email.toLowerCase().includes(lowerQuery))
      )
    }

    setFilteredManagedEmployees(filtered)
  }

  // ============================================================================
  // Helpers
  // ============================================================================

  const handleRefresh = async (event: CustomEvent) => {
    await loadEmployees()
    if (canManage) {
      await loadManagedEmployees()
      await loadManagementScope()
    }
    event.detail.complete()
  }

  const getRoleBadge = (employee: EmployeeInformation) => {
    const roleLevel = employee.academic_role_level
    if (roleLevel === undefined || roleLevel === null) return null

    const roleBadges: Record<number, { label: string; color: string }> = {
      0: { label: "VPAA", color: "success" },
      1: { label: "DEAN", color: "warning" },
      2: { label: "PC", color: "primary" },
      3: { label: "RF", color: "secondary" },
      4: { label: "PTF", color: "medium" },
      5: { label: "SEC", color: "light" },
    }
    return roleBadges[roleLevel] || null
  }

  const getPositionDisplay = (employee: EmployeeInformation) => {
    return employee.position_title || "Unknown Position"
  }

  const getDepartmentDisplay = (employee: EmployeeInformation) => {
    if (userRole?.level === 0) return null
    return employee.department_name || "Unknown Department"
  }

  const getScopeDescription = () => {
    if (!userRole || !currentEmployee) return "Loading..."

    const roleTitles: Record<number, string> = {
      0: "VPAA",
      1: "Dean",
      2: "Program Chair",
      3: "Regular Faculty",
      4: "Part-Time Faculty",
      5: "Secretary",
      99: "Employee",
    }
    const roleTitle = roleTitles[userRole.level] || "Unknown Role"

    switch (userRole.level) {
      case 0:
        return `${roleTitle} - All Employees (${employees.length} total)`
      case 1:
        return `${roleTitle} - ${currentEmployee?.department_name || "Unknown Department"} (${employees.length} employees)`
      case 2: {
        const programInfo = currentEmployee?.program_name
          ? `${currentEmployee.program_name} Program`
          : currentEmployee?.department_name || "Unknown Department"
        return `${roleTitle} - ${programInfo} (${employees.length} employees)`
      }
      default:
        return `${roleTitle} - Personal Profile`
    }
  }

  const getScopeExplanation = () => {
    if (!userRole) return ""
    switch (userRole.level) {
      case 0:
        return "As VPAA, you have access to view all employees across all departments and programs."
      case 1:
        return `As a Dean, you can view all employees in your department (${currentEmployee?.department_name || "Unknown"}).`
      case 2: {
        const scopeDetail = currentEmployee?.program_name
          ? `your program (${currentEmployee.program_name})`
          : `your department (${currentEmployee?.department_name || "Unknown"})`
        return `As a Program Chair, you can view employees in ${scopeDetail}.`
      }
      default:
        return "You can only view your own profile information."
    }
  }

  const getManagementDescription = () => {
    if (!managementScope) return "Loading management scope..."
    const count = managementScope.manageable_employees_count || 0
    switch (managementScope.role_level) {
      case 0:
        return `As VPAA, you can manage all ${count} employees across the organization.`
      case 1:
        return `As Dean of ${managementScope.department?.name || "your department"}, you can manage ${count} employees.`
      case 2:
        return `As Program Chair of ${managementScope.program?.name || "your program"}, you can manage ${count} faculty and staff.`
      default:
        return "You do not have management responsibilities."
    }
  }

  // Active list for current view
  const activeList = viewMode === "directory" ? filteredEmployees : filteredManagedEmployees

  // ============================================================================
  // Render
  // ============================================================================

  const addEmployeeFAB = hasAnyPermission(["employee_create", "employee_edit_all"]) ? (
    <IonFab vertical="bottom" horizontal="end" slot="fixed">
      <IonFabButton routerLink="/employee-add">
        <IonIcon icon={add} />
      </IonFabButton>
    </IonFab>
  ) : null

  return (
    <MainLayout
      title="Employee Directory"
      showRefresh={true}
      onRefresh={() => {
        loadEmployees()
        if (canManage) loadManagedEmployees()
      }}
      isLoading={isLoading}
      fab={addEmployeeFAB}
    >
      <div className="min-h-full bg-gradient-to-br from-slate-50 via-white to-slate-50">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent pullingIcon={refresh} refreshingSpinner="circles" />
        </IonRefresher>

        {/* View Mode Toggle — only show if user can manage */}
        {canManage && (
          <div className="px-4 pt-3">
            <IonSegment
              value={viewMode}
              onIonChange={(e) => {
                setViewMode(e.detail.value as ViewMode)
                setSearchText("")
              }}
            >
              <IonSegmentButton value="directory">
                <IonLabel>
                  <IonIcon icon={peopleOutline} className="mr-1" /> Directory
                </IonLabel>
              </IonSegmentButton>
              <IonSegmentButton value="management">
                <IonLabel>
                  <IonIcon icon={shieldOutline} className="mr-1" /> My Team
                </IonLabel>
              </IonSegmentButton>
            </IonSegment>
          </div>
        )}

        {/* Search Bar */}
        <div className="px-4 py-3 bg-gradient-to-r from-slate-50 to-slate-100">
          <IonSearchbar
            value={searchText}
            onIonChange={(e) => setSearchText(e.detail.value!)}
            placeholder={
              viewMode === "directory"
                ? "Search employees by name, ID, position, or email..."
                : "Search managed employees..."
            }
            animated
            className="rounded-xl shadow-sm"
          />
        </div>

        {/* Info Card */}
        <div className="px-4 py-3">
          {viewMode === "directory" ? (
            <IonCard className="rounded-xl shadow-md border border-slate-200 overflow-hidden">
              <IonCardHeader className="bg-gradient-to-r from-primary-500 via-primary-600 to-primary-700">
                <IonCardTitle className="text-white">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <IonIcon icon={filter} className="text-2xl" />
                      <span className="text-lg md:text-xl font-semibold">{getScopeDescription()}</span>
                    </div>
                    <IonBadge
                      color={
                        userRole?.level === 0
                          ? "success"
                          : userRole?.level === 1
                            ? "warning"
                            : userRole?.level === 2
                              ? "primary"
                              : "medium"
                      }
                      className="text-xs font-bold px-3 py-1.5 rounded-full"
                    >
                      Level {userRole?.level}
                    </IonBadge>
                  </div>
                </IonCardTitle>
              </IonCardHeader>
              <IonCardContent className="bg-white">
                <p className="text-slate-700 text-sm md:text-base leading-relaxed mb-4">
                  {getScopeExplanation()}
                </p>
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
                  {activeList.length > 0 && (
                    <IonBadge
                      color="primary"
                      className="px-3 py-2 rounded-full text-xs font-semibold shadow-sm"
                    >
                      {activeList.length} employee{activeList.length !== 1 ? "s" : ""} found
                    </IonBadge>
                  )}
                </div>
              </IonCardContent>
            </IonCard>
          ) : (
            <IonCard className="rounded-xl shadow-md border border-slate-200 overflow-hidden">
              <IonCardHeader>
                <IonCardTitle>
                  <div className="flex items-center gap-2">
                    <IonIcon icon={shieldOutline} />
                    <span>Management Scope</span>
                    <IonBadge
                      color={
                        userRole?.level === 0
                          ? "success"
                          : userRole?.level === 1
                            ? "warning"
                            : "primary"
                      }
                    >
                      {managementScope?.role_title || "Loading..."}
                    </IonBadge>
                  </div>
                </IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <p className="text-slate-700 mb-3">{getManagementDescription()}</p>
                <div className="flex flex-wrap items-center gap-2">
                  {userRole?.canApprove && (
                    <IonChip color="success">
                      <IonIcon icon={checkmarkCircleOutline} />
                      <IonLabel>Can Approve Leaves</IonLabel>
                    </IonChip>
                  )}
                  <IonChip color="primary">
                    <IonIcon icon={peopleOutline} />
                    <IonLabel>{filteredManagedEmployees.length} Employees</IonLabel>
                  </IonChip>
                </div>
              </IonCardContent>
            </IonCard>
          )}
        </div>

        {/* Management Role Filter (only in management view) */}
        {viewMode === "management" && (
          <div className="px-4 pb-2">
            <IonCard className="rounded-xl shadow-sm">
              <IonCardContent>
                <IonSegment
                  value={selectedSegment}
                  onIonChange={(e) => setSelectedSegment(e.detail.value as string)}
                >
                  <IonSegmentButton value="all">
                    <IonLabel>All</IonLabel>
                  </IonSegmentButton>
                  {userRole && userRole.level <= 1 && (
                    <IonSegmentButton value="2">
                      <IonLabel>Program Chairs</IonLabel>
                    </IonSegmentButton>
                  )}
                  <IonSegmentButton value="3">
                    <IonLabel>Regular Faculty</IonLabel>
                  </IonSegmentButton>
                  <IonSegmentButton value="4">
                    <IonLabel>Part-Time</IonLabel>
                  </IonSegmentButton>
                  <IonSegmentButton value="5">
                    <IonLabel>Staff</IonLabel>
                  </IonSegmentButton>
                </IonSegment>
              </IonCardContent>
            </IonCard>
          </div>
        )}

        {/* Employee List */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 px-4">
            <IonSpinner name="circles" className="w-16 h-16 text-primary-500" />
            <p className="mt-4 text-slate-600 text-sm font-medium">Loading employees...</p>
          </div>
        ) : (
          <>
            {activeList.length === 0 ? (
              <div className="px-4 py-3">
                <IonCard className="rounded-xl shadow-sm border border-slate-200">
                  <IonCardContent>
                    <div className="flex flex-col items-center justify-center py-12 px-4">
                      <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                        <IonIcon icon={search} className="text-4xl text-slate-400" />
                      </div>
                      <p className="text-center text-slate-600 font-medium text-base mb-2">
                        {searchText ? "No employees found" : "No employees available"}
                      </p>
                      <p className="text-center text-slate-500 text-sm max-w-md">
                        {searchText
                          ? "Try adjusting your search terms or filters."
                          : viewMode === "management"
                            ? "No employees are currently under your management."
                            : "There are currently no employees in your view scope."}
                      </p>
                    </div>
                  </IonCardContent>
                </IonCard>
              </div>
            ) : (
              <div className="px-4 pb-20">
                <IonList className="bg-transparent">
                  {activeList.map((employee) => (
                    <IonItem
                      key={employee.id}
                      button
                      routerLink={`/employee-detail/${employee.id}`}
                      detail={viewMode === "directory"}
                      className="mb-3 rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-all duration-200"
                    >
                      <IonAvatar slot="start" className="my-3 mx-4">
                        <IonImg
                          src={
                            employee.profileImage ||
                            "https://ionicframework.com/docs/img/demos/avatar.svg"
                          }
                          alt={`${employee.firstName} ${employee.lastName}`}
                        />
                      </IonAvatar>
                      <IonLabel className="py-3">
                        <h2 className="font-semibold text-slate-900 text-base mb-1 flex items-center flex-wrap gap-2">
                          <span>
                            {employee.lastName}, {employee.firstName}{" "}
                            {employee.middleName ? employee.middleName.charAt(0) + "." : ""}
                          </span>
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
                      {viewMode === "management" ? (
                        <div slot="end" className="flex gap-1">
                          <IonButton
                            fill="clear"
                            size="small"
                            routerLink={`/employee-detail/${employee.id}`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <IonIcon icon={eyeOutline} />
                          </IonButton>
                        </div>
                      ) : (
                        <IonChip
                          slot="end"
                          color="primary"
                          className="font-mono text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm"
                        >
                          {employee.employeeId}
                        </IonChip>
                      )}
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

