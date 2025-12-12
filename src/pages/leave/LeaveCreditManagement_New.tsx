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
  IonBackButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonList,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonBadge,
  IonModal,
  IonInput,
  IonToast,
  IonText,
  IonSearchbar,
  IonProgressBar,
  IonChip,
  IonNote,
  IonAvatar,
  IonAlert,
  IonRefresher,
  IonRefresherContent,
} from "@ionic/react"
import { 
  add, 
  close, 
  save, 
  refresh, 
  create, 
  chevronDown
} from "ionicons/icons"
import { leaveCreditService, Employee, LeaveCredit as APILeaveCredit } from "../../services/leaveCreditService"
import { API_ENDPOINTS, getAuthHeaders } from "../../config/api"

// Leave types from API
export type LeaveType = 'Vacation Leave' | 'Sick Leave' | 'Birthday Leave' | 'Solo Parent Leave' | 'Bereavement Leave' | 'Paternity Leave' | 'Maternity Leave'

// Define leave credit types (for local state management)
interface LocalLeaveCredit {
  id: string
  employeeId: string
  leaveType: LeaveType
  year: number
  month?: number
  creditsAdded: number
  creditsUsed: number
  balance: number
  dateAdded: string
  addedBy: string
  remarks?: string
  transactionType: "Initial" | "Monthly" | "Annual" | "Adjustment" | "Used"
}

// Sample years for filtering
const years = [2022, 2023, 2024, 2025, 2026]

const LeaveCreditManagement: React.FC = () => {
  // API Data State
  const [employees, setEmployees] = useState<Employee[]>([])
  const [apiLeaveCredits, setApiLeaveCredits] = useState<APILeaveCredit[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // UI State
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [searchText, setSearchText] = useState<string>("")
  const [showModal, setShowModal] = useState<boolean>(false)
  const [currentCredit, setCurrentCredit] = useState<LocalLeaveCredit | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")
  const [transactionHistory, setTransactionHistory] = useState<LocalLeaveCredit[]>([])
  const [selectedLeaveType, setSelectedLeaveType] = useState<string>("all")
  const [leaveCredits, setLeaveCredits] = useState<LocalLeaveCredit[]>([])
  const [filteredCredits, setFilteredCredits] = useState<LocalLeaveCredit[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  
  // Employee search state for modal
  const [employeeSearchText, setEmployeeSearchText] = useState<string>("")
  const [showEmployeeDropdown, setShowEmployeeDropdown] = useState<boolean>(false)
  const [selectedEmployeeForCredit, setSelectedEmployeeForCredit] = useState<Employee | null>(null)

  // Load initial data on component mount
  useEffect(() => {
    loadInitialData()
  }, [])

  // Load all required data from API
  const loadInitialData = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const employeesData = await leaveCreditService.fetchEmployees()
      setEmployees(employeesData)

      // Fetch leave credits for each employee using by_employee endpoint
      const creditsPromises = employeesData.map(emp =>
        fetchLeaveCreditsByEmployee(emp.id, selectedYear)
      )
      const creditsResults = await Promise.all(creditsPromises)
      
      // Flatten and convert to local format
      const allCredits: LocalLeaveCredit[] = creditsResults.flat().map((credit: any) => ({
        id: credit.id.toString(),
        employeeId: credit.employee?.toString?.() ?? "",
        leaveType: credit.leave_type as LeaveType,
        year: Number(credit.year),
        creditsAdded: Number(credit.total_credits),
        creditsUsed: Number(credit.used_credits),
        balance: Number(credit.remaining_credits),
        dateAdded: credit.created_at?.split?.('T')[0] ?? "",
        addedBy: "1",
        transactionType: "Initial"
      }))
      
      setLeaveCredits(allCredits)
      setApiLeaveCredits(creditsResults.flat())

    } catch (error) {
      console.error('Error loading data:', error)
      setError(error instanceof Error ? error.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }

  // Fetch leave credits for a specific employee
  const fetchLeaveCreditsByEmployee = async (employeeId: string, year?: number) => {
    try {
      const token = localStorage.getItem('authToken')
      const headers = token ? getAuthHeaders(token) : { 'Content-Type': 'application/json' }
      let url = `${API_ENDPOINTS.leaveCredits}by_employee/?employee_id=${employeeId}`
      if (year) url += `&year=${year}`
      const response = await fetch(url, { method: 'GET', headers })
      if (!response.ok) throw new Error('Failed to fetch leave credits')
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error fetching leave credits by employee:', error)
      return []
    }
  }

  // Refresh data from API
  const refreshData = async () => {
    setRefreshing(true)
    try {
      await loadInitialData()
      setToastMessage("Data refreshed successfully!")
      setShowToast(true)
    } catch (error) {
      setToastMessage("Failed to refresh data")
      setShowToast(true)
    } finally {
      setRefreshing(false)
    }
  }

  // Handle pull-to-refresh
  const handleRefresh = async (event: CustomEvent) => {
    await refreshData()
    event.detail.complete()
  }

  // Filter leave credits based on selected filters and search text
  useEffect(() => {
    let filtered = [...leaveCredits]

    // Filter by leave type
    if (selectedLeaveType !== "all") {
      filtered = filtered.filter((credit) => credit.leaveType === selectedLeaveType)
    }

    // Filter by year
    filtered = filtered.filter((credit) => credit.year === selectedYear)

    // Filter by search text
    if (searchText) {
      const searchLower = searchText.toLowerCase()
      filtered = filtered.filter((credit) => {
        const employee = employees.find((emp) => emp.id === credit.employeeId)
        return (
          (employee?.first_name && employee.first_name.toLowerCase().includes(searchLower)) ||
          (employee?.last_name && employee.last_name.toLowerCase().includes(searchLower)) ||
          (employee?.employee_id && employee.employee_id.toLowerCase().includes(searchLower)) ||
          (credit.leaveType && credit.leaveType.toLowerCase().includes(searchLower))
        )
      })
    }

    // Group by employee and leave type to get latest balance
    const latestCredits: LocalLeaveCredit[] = []
    const creditMap = new Map<string, LocalLeaveCredit>()

    filtered.forEach((credit) => {
      const key = `${credit.employeeId}-${credit.leaveType}`
      if (!creditMap.has(key) || new Date(credit.dateAdded) > new Date(creditMap.get(key)!.dateAdded)) {
        creditMap.set(key, credit)
      }
    })

    creditMap.forEach((credit) => {
      latestCredits.push(credit)
    })

    // Sort by employee name
    latestCredits.sort((a, b) => {
      const empA = employees.find((emp) => emp.id === a.employeeId)
      const empB = employees.find((emp) => emp.id === b.employeeId)
      if (!empA || !empB) return 0
      return `${empA.last_name}, ${empA.first_name}`.localeCompare(`${empB.last_name}, ${empB.first_name}`)
    })

    setFilteredCredits(latestCredits)
  }, [leaveCredits, selectedLeaveType, selectedYear, searchText, employees])

  // Reload data when year changes
  useEffect(() => {
    if (!loading && employees.length > 0) {
      loadInitialData()
    }
  }, [selectedYear])

  // Get employee name
  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find((emp) => emp.id === employeeId)
    return employee ? `${employee.first_name} ${employee.last_name}` : "Unknown Employee"
  }

  // Get employee avatar
  const getEmployeeAvatar = (employeeId: string) => {
    const employee = employees.find((emp) => emp.id === employeeId)
    return employee?.profile_image || "https://ionicframework.com/docs/img/demos/avatar.svg"
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Reset filters
  const resetFilters = () => {
    setSelectedLeaveType("all")
    setSearchText("")
  }

  // Handle adding a new leave credit
  const handleAddCredit = () => {
    const newCredit: LocalLeaveCredit = {
      id: Date.now().toString(),
      employeeId: "",
      leaveType: "Vacation Leave",
      year: selectedYear,
      creditsAdded: 0,
      creditsUsed: 0,
      balance: 0,
      dateAdded: new Date().toISOString().split("T")[0],
      addedBy: "1",
      transactionType: "Adjustment",
    }
    setCurrentCredit(newCredit)
    setIsEditing(false)
    setEmployeeSearchText("")
    setSelectedEmployeeForCredit(null)
    setShowEmployeeDropdown(false)
    setIsModalOpen(true)
  }

  // Handle editing a leave credit
  const handleEditCredit = (credit: LocalLeaveCredit) => {
    // Get transaction history for this employee and leave type
    const history = leaveCredits
      .filter((c) => c.employeeId === credit.employeeId && c.leaveType === credit.leaveType && c.year === credit.year)
      .sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime())

    setTransactionHistory(history)

    // Create a new adjustment credit based on the current balance
    const adjustmentCredit: LocalLeaveCredit = {
      id: Date.now().toString(),
      employeeId: credit.employeeId,
      leaveType: credit.leaveType,
      year: credit.year,
      creditsAdded: 0,
      creditsUsed: 0,
      balance: credit.balance,
      dateAdded: new Date().toISOString().split("T")[0],
      addedBy: "1",
      transactionType: "Adjustment",
    }

    const employee = employees.find(e => e.id === credit.employeeId)
    if (employee) {
      setSelectedEmployeeForCredit(employee)
      setEmployeeSearchText(`${employee.last_name}, ${employee.first_name}`)
    }
    setShowEmployeeDropdown(false)

    setCurrentCredit(adjustmentCredit)
    setIsEditing(true)
    setIsModalOpen(true)
  }

  // Handle saving a leave credit
  const handleSaveCredit = async () => {
    if (!currentCredit) return

    // Validate credit
    if (!currentCredit.employeeId) {
      setAlertMessage("Please select an employee")
      setShowAlert(true)
      return
    }

    if (currentCredit.creditsAdded < 0) {
      setAlertMessage("Credits added cannot be negative")
      setShowAlert(true)
      return
    }

    if (isEditing) {
      // When editing, find the actual existing credit record and update it
      try {
        const existingCredit = apiLeaveCredits.find(
          (c) => c.employee === currentCredit.employeeId && 
                 c.leave_type === currentCredit.leaveType && 
                 c.year === currentCredit.year
        )

        if (existingCredit) {
          // Calculate the new totals based on the adjustment
          const newTotalCredits = Number(existingCredit.total_credits) + currentCredit.creditsAdded
          const newUsedCredits = Number(existingCredit.used_credits) + currentCredit.creditsUsed

          await leaveCreditService.updateLeaveCredit(existingCredit.id, {
            total_credits: newTotalCredits,
            used_credits: newUsedCredits,
          })
          
          await loadInitialData()
          setAlertMessage("Leave credit adjusted successfully")
        } else {
          // If no existing credit found, create a new one
          const apiData = {
            employee: currentCredit.employeeId,
            leave_type: currentCredit.leaveType,
            year: currentCredit.year,
            total_credits: currentCredit.creditsAdded,
            used_credits: currentCredit.creditsUsed || 0
          }
          
          await leaveCreditService.createLeaveCredit(apiData)
          await loadInitialData()
          setAlertMessage("Leave credit created successfully")
        }
      } catch (error) {
        console.error("Error updating leave credit:", error)
        setAlertMessage(`Failed to update leave credit: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
      setShowAlert(true)
      setIsModalOpen(false)
      return
    }

    // Create new leave credit
    try {
      const apiData = {
        employee: currentCredit.employeeId,
        leave_type: currentCredit.leaveType,
        year: currentCredit.year,
        total_credits: currentCredit.creditsAdded,
        used_credits: currentCredit.creditsUsed || 0
      }
      
      await leaveCreditService.createLeaveCredit(apiData)
      await loadInitialData()
      
      setAlertMessage("Leave credit added successfully")
      setShowAlert(true)
      setIsModalOpen(false)
    } catch (error) {
      console.error("Error creating leave credit:", error)
      setAlertMessage(`Failed to add leave credit: ${error instanceof Error ? error.message : 'Unknown error'}`)
      setShowAlert(true)
    }
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/hr-dashboard" />
          </IonButtons>
          <IonTitle>Leave Credit Management</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={refreshData}>
              <IonIcon icon={refresh} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
        
        {/* Filter Toolbar */}
        <IonToolbar>
          <IonGrid>
            <IonRow className="ion-align-items-center">
              <IonCol size="12" sizeMd="3">
                <IonSearchbar
                  value={searchText}
                  onIonInput={(e) => setSearchText(e.detail.value!)}
                  placeholder="Search employees..."
                  debounce={300}
                />
              </IonCol>
              <IonCol size="6" sizeMd="2">
                <IonSelect
                  value={selectedYear}
                  onIonChange={(e) => setSelectedYear(e.detail.value)}
                  interface="popover"
                  placeholder="Year"
                >
                  {years.map((year) => (
                    <IonSelectOption key={year} value={year}>
                      {year}
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </IonCol>
              <IonCol size="6" sizeMd="3">
                <IonSelect
                  value={selectedLeaveType}
                  onIonChange={(e) => setSelectedLeaveType(e.detail.value)}
                  interface="popover"
                  placeholder="Leave Type"
                >
                  <IonSelectOption value="all">All Leave Types</IonSelectOption>
                  <IonSelectOption value="Vacation Leave">Vacation Leave</IonSelectOption>
                  <IonSelectOption value="Sick Leave">Sick Leave</IonSelectOption>
                  <IonSelectOption value="Birthday Leave">Birthday Leave</IonSelectOption>
                  <IonSelectOption value="Solo Parent Leave">Solo Parent Leave</IonSelectOption>
                  <IonSelectOption value="Bereavement Leave">Bereavement Leave</IonSelectOption>
                  <IonSelectOption value="Paternity Leave">Paternity Leave</IonSelectOption>
                  <IonSelectOption value="Maternity Leave">Maternity Leave</IonSelectOption>
                </IonSelect>
              </IonCol>
              <IonCol size="6" sizeMd="2">
                <IonButton expand="block" fill="clear" onClick={resetFilters}>
                  Reset
                </IonButton>
              </IonCol>
              <IonCol size="6" sizeMd="2">
                <IonButton expand="block" color="success" onClick={handleAddCredit}>
                  <IonIcon icon={add} slot="start" />
                  Add
                </IonButton>
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        {loading ? (
          <IonCard>
            <IonCardContent>
              <IonProgressBar type="indeterminate" />
              <IonText className="ion-text-center">
                <p>Loading leave credits...</p>
              </IonText>
            </IonCardContent>
          </IonCard>
        ) : error ? (
          <IonCard color="danger">
            <IonCardContent>
              <IonText>
                <h3>Error Loading Data</h3>
                <p>{error}</p>
              </IonText>
              <IonButton onClick={loadInitialData} expand="block">
                Retry
              </IonButton>
            </IonCardContent>
          </IonCard>
        ) : (
          <>
            {/* Summary Cards */}
            <IonGrid>
              <IonRow>
                <IonCol size="12" sizeMd="4">
                  <IonCard>
                    <IonCardContent>
                      <IonText color="medium">
                        <p style={{ margin: 0, fontSize: '0.9em' }}>Total Employees</p>
                      </IonText>
                      <IonText>
                        <h1 style={{ margin: '8px 0' }}>{employees.length}</h1>
                      </IonText>
                    </IonCardContent>
                  </IonCard>
                </IonCol>
                <IonCol size="12" sizeMd="4">
                  <IonCard>
                    <IonCardContent>
                      <IonText color="medium">
                        <p style={{ margin: 0, fontSize: '0.9em' }}>Total Credits</p>
                      </IonText>
                      <IonText>
                        <h1 style={{ margin: '8px 0' }}>
                          {filteredCredits.reduce((sum, c) => sum + c.creditsAdded, 0).toFixed(1)}
                        </h1>
                      </IonText>
                    </IonCardContent>
                  </IonCard>
                </IonCol>
                <IonCol size="12" sizeMd="4">
                  <IonCard>
                    <IonCardContent>
                      <IonText color="medium">
                        <p style={{ margin: 0, fontSize: '0.9em' }}>Available</p>
                      </IonText>
                      <IonText>
                        <h1 style={{ margin: '8px 0' }}>
                          {filteredCredits.reduce((sum, c) => sum + c.balance, 0).toFixed(1)}
                        </h1>
                      </IonText>
                    </IonCardContent>
                  </IonCard>
                </IonCol>
              </IonRow>
            </IonGrid>

            {/* Table View */}
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Employee Leave Credits - {selectedYear}</IonCardTitle>
              </IonCardHeader>
              <IonCardContent style={{ padding: 0 }}>
                {filteredCredits.length === 0 ? (
                  <div style={{ padding: '2rem', textAlign: 'center' }}>
                    <IonText color="medium">
                      <p>No leave credits found for the selected filters.</p>
                    </IonText>
                    <IonButton onClick={handleAddCredit}>
                      <IonIcon icon={add} slot="start" />
                      Add First Credit
                    </IonButton>
                  </div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table style={{ 
                      width: '100%', 
                      borderCollapse: 'collapse',
                      fontSize: '0.9em'
                    }}>
                      <thead style={{ 
                        backgroundColor: 'var(--ion-color-light)',
                        position: 'sticky',
                        top: 0,
                        zIndex: 1
                      }}>
                        <tr>
                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid var(--ion-color-medium)' }}>
                            Employee
                          </th>
                          <th style={{ padding: '12px', textAlign: 'left', borderBottom: '2px solid var(--ion-color-medium)' }}>
                            Leave Type
                          </th>
                          <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid var(--ion-color-medium)' }}>
                            Total
                          </th>
                          <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid var(--ion-color-medium)' }}>
                            Used
                          </th>
                          <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid var(--ion-color-medium)' }}>
                            Available
                          </th>
                          <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid var(--ion-color-medium)' }}>
                            Status
                          </th>
                          <th style={{ padding: '12px', textAlign: 'center', borderBottom: '2px solid var(--ion-color-medium)' }}>
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredCredits.map((credit, index) => {
                          const employee = employees.find(e => e.id === credit.employeeId)
                          const utilizationPercent = credit.creditsAdded > 0 ? (credit.creditsUsed / credit.creditsAdded) * 100 : 0
                          
                          return (
                            <tr 
                              key={credit.id} 
                              style={{ 
                                borderBottom: '1px solid var(--ion-color-light)',
                                backgroundColor: index % 2 === 0 ? 'transparent' : 'var(--ion-color-light-tint)'
                              }}
                            >
                              <td style={{ padding: '12px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <IonAvatar style={{ width: '32px', height: '32px' }}>
                                    <img 
                                      src={getEmployeeAvatar(credit.employeeId)} 
                                      alt={getEmployeeName(credit.employeeId)}
                                    />
                                  </IonAvatar>
                                  <div>
                                    <div style={{ fontWeight: 500 }}>
                                      {getEmployeeName(credit.employeeId)}
                                    </div>
                                    <div style={{ fontSize: '0.85em', color: 'var(--ion-color-medium)' }}>
                                      {employee?.employee_id || 'N/A'}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td style={{ padding: '12px' }}>
                                <IonChip color="primary" style={{ margin: 0 }}>
                                  {credit.leaveType}
                                </IonChip>
                              </td>
                              <td style={{ padding: '12px', textAlign: 'center', fontWeight: 500 }}>
                                {credit.creditsAdded.toFixed(1)}
                              </td>
                              <td style={{ padding: '12px', textAlign: 'center' }}>
                                <IonText color={credit.creditsUsed > 0 ? 'warning' : 'medium'}>
                                  {credit.creditsUsed.toFixed(1)}
                                </IonText>
                              </td>
                              <td style={{ padding: '12px', textAlign: 'center', fontWeight: 500 }}>
                                <IonText 
                                  color={
                                    credit.balance <= 0 ? 'danger' : 
                                    credit.balance < 5 ? 'warning' : 
                                    'success'
                                  }
                                >
                                  {credit.balance.toFixed(1)}
                                </IonText>
                              </td>
                              <td style={{ padding: '12px', textAlign: 'center' }}>
                                <IonBadge 
                                  color={
                                    utilizationPercent >= 90 ? 'danger' :
                                    utilizationPercent >= 70 ? 'warning' :
                                    utilizationPercent > 0 ? 'primary' :
                                    'success'
                                  }
                                >
                                  {utilizationPercent.toFixed(0)}% Used
                                </IonBadge>
                              </td>
                              <td style={{ padding: '12px', textAlign: 'center' }}>
                                <IonButton 
                                  fill="clear" 
                                  size="small"
                                  onClick={() => handleEditCredit(credit)}
                                  title="Adjust Credits"
                                >
                                  <IonIcon icon={create} slot="icon-only" />
                                </IonButton>
                                <IonButton 
                                  fill="clear" 
                                  size="small"
                                  color="medium"
                                  onClick={() => {
                                    const history = leaveCredits.filter(
                                      (c) => c.employeeId === credit.employeeId && 
                                             c.leaveType === credit.leaveType && 
                                             c.year === credit.year
                                    ).sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime())
                                    setTransactionHistory(history)
                                    setCurrentCredit(credit)
                                    setShowModal(true)
                                  }}
                                  title="View Details"
                                >
                                  <IonIcon icon={chevronDown} slot="icon-only" />
                                </IonButton>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </IonCardContent>
            </IonCard>
          </>
        )}

        {/* Details Modal */}
        <IonModal isOpen={showModal} onDidDismiss={() => setShowModal(false)}>
          <IonHeader>
            <IonToolbar color="primary">
              <IonTitle>Leave Credit Details</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowModal(false)}>
                  <IonIcon icon={close} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            {currentCredit && (
              <div style={{ padding: '1rem' }}>
                {/* Employee Info Card */}
                <IonCard>
                  <IonCardHeader>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <IonAvatar style={{ width: '60px', height: '60px' }}>
                        <img 
                          src={getEmployeeAvatar(currentCredit.employeeId)} 
                          alt={getEmployeeName(currentCredit.employeeId)}
                        />
                      </IonAvatar>
                      <div>
                        <IonCardTitle>{getEmployeeName(currentCredit.employeeId)}</IonCardTitle>
                        <IonText color="medium">
                          <p style={{ margin: '4px 0' }}>
                            {employees.find(e => e.id === currentCredit.employeeId)?.employee_id || 'N/A'}
                          </p>
                        </IonText>
                      </div>
                    </div>
                  </IonCardHeader>
                </IonCard>

                {/* Credit Summary */}
                <IonCard>
                  <IonCardHeader>
                    <IonCardTitle>
                      {currentCredit.leaveType} - {currentCredit.year}
                    </IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <IonGrid>
                      <IonRow>
                        <IonCol size="6">
                          <div style={{ textAlign: 'center', padding: '1rem' }}>
                            <IonText color="medium">
                              <p style={{ margin: 0, fontSize: '0.9em' }}>Total Credits</p>
                            </IonText>
                            <IonText>
                              <h2 style={{ margin: '8px 0' }}>{currentCredit.creditsAdded.toFixed(1)}</h2>
                            </IonText>
                          </div>
                        </IonCol>
                        <IonCol size="6">
                          <div style={{ textAlign: 'center', padding: '1rem' }}>
                            <IonText color="medium">
                              <p style={{ margin: 0, fontSize: '0.9em' }}>Used</p>
                            </IonText>
                            <IonText color="warning">
                              <h2 style={{ margin: '8px 0' }}>{currentCredit.creditsUsed.toFixed(1)}</h2>
                            </IonText>
                          </div>
                        </IonCol>
                      </IonRow>
                      <IonRow>
                        <IonCol size="12">
                          <div style={{ 
                            textAlign: 'center', 
                            padding: '1rem',
                            backgroundColor: 'var(--ion-color-light)',
                            borderRadius: '8px'
                          }}>
                            <IonText color="medium">
                              <p style={{ margin: 0, fontSize: '0.9em' }}>Available Balance</p>
                            </IonText>
                            <IonText 
                              color={
                                currentCredit.balance <= 0 ? 'danger' : 
                                currentCredit.balance < 5 ? 'warning' : 
                                'success'
                              }
                            >
                              <h1 style={{ margin: '8px 0' }}>{currentCredit.balance.toFixed(1)}</h1>
                            </IonText>
                          </div>
                        </IonCol>
                      </IonRow>
                    </IonGrid>

                    {/* Progress Bar */}
                    <div style={{ marginTop: '1rem' }}>
                      <IonText color="medium">
                        <p style={{ fontSize: '0.85em', marginBottom: '4px' }}>
                          Utilization: {currentCredit.creditsAdded > 0 ? ((currentCredit.creditsUsed / currentCredit.creditsAdded) * 100).toFixed(0) : 0}%
                        </p>
                      </IonText>
                      <IonProgressBar 
                        value={currentCredit.creditsAdded > 0 ? currentCredit.creditsUsed / currentCredit.creditsAdded : 0}
                        color={
                          currentCredit.creditsAdded > 0 && (currentCredit.creditsUsed / currentCredit.creditsAdded) >= 0.9 ? 'danger' :
                          currentCredit.creditsAdded > 0 && (currentCredit.creditsUsed / currentCredit.creditsAdded) >= 0.7 ? 'warning' :
                          'success'
                        }
                      />
                    </div>
                  </IonCardContent>
                </IonCard>

                {/* Transaction History */}
                <IonCard>
                  <IonCardHeader>
                    <IonCardTitle>Transaction History</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    {transactionHistory.length > 0 ? (
                      <IonList>
                        {transactionHistory.map((transaction, index) => (
                          <IonItem key={index}>
                            <IonLabel>
                              <h3>{transaction.transactionType}</h3>
                              <p>Credits: {transaction.creditsAdded.toFixed(1)} | Used: {transaction.creditsUsed.toFixed(1)}</p>
                              <p>Date: {formatDate(transaction.dateAdded)}</p>
                              {transaction.remarks && <p><i>{transaction.remarks}</i></p>}
                            </IonLabel>
                            <IonBadge slot="end" color="primary">
                              {transaction.balance.toFixed(1)}
                            </IonBadge>
                          </IonItem>
                        ))}
                      </IonList>
                    ) : (
                      <IonText color="medium">
                        <p>No transaction history available</p>
                      </IonText>
                    )}
                  </IonCardContent>
                </IonCard>

                {/* Actions */}
                <IonGrid>
                  <IonRow>
                    <IonCol size="12">
                      <IonButton 
                        expand="block" 
                        color="primary"
                        onClick={() => {
                          setShowModal(false)
                          handleEditCredit(currentCredit)
                        }}
                      >
                        <IonIcon icon={create} slot="start" />
                        Adjust Credits
                      </IonButton>
                    </IonCol>
                  </IonRow>
                </IonGrid>
              </div>
            )}
          </IonContent>
        </IonModal>

        {/* Add/Edit Credit Modal */}
        <IonModal isOpen={isModalOpen} onDidDismiss={() => setIsModalOpen(false)}>
          <IonHeader>
            <IonToolbar color="primary">
              <IonTitle>{isEditing ? 'Adjust Leave Credit' : 'Add Leave Credit'}</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setIsModalOpen(false)}>
                  <IonIcon icon={close} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            {currentCredit && (
              <div style={{ padding: '1rem' }}>
                <IonCard>
                  <IonCardContent>
                    {/* Employee Selection */}
                    {!isEditing && (
                      <IonItem>
                        <IonLabel position="stacked">Employee *</IonLabel>
                        <IonSearchbar
                          value={employeeSearchText}
                          onIonInput={(e) => {
                            setEmployeeSearchText(e.detail.value!)
                            setShowEmployeeDropdown(true)
                          }}
                          onIonFocus={() => setShowEmployeeDropdown(true)}
                          placeholder="Search employee..."
                        />
                        {showEmployeeDropdown && employeeSearchText && (
                          <IonList style={{ 
                            maxHeight: '200px', 
                            overflow: 'auto',
                            border: '1px solid var(--ion-color-light)',
                            borderRadius: '8px',
                            marginTop: '4px'
                          }}>
                            {employees
                              .filter(emp => 
                                `${emp.first_name} ${emp.last_name}`.toLowerCase().includes(employeeSearchText.toLowerCase()) ||
                                emp.employee_id.toLowerCase().includes(employeeSearchText.toLowerCase())
                              )
                              .map(emp => (
                                <IonItem 
                                  key={emp.id}
                                  button
                                  onClick={() => {
                                    setSelectedEmployeeForCredit(emp)
                                    setEmployeeSearchText(`${emp.last_name}, ${emp.first_name}`)
                                    setShowEmployeeDropdown(false)
                                    setCurrentCredit({
                                      ...currentCredit,
                                      employeeId: emp.id
                                    })
                                  }}
                                >
                                  <IonAvatar slot="start">
                                    <img src={emp.profile_image || "https://ionicframework.com/docs/img/demos/avatar.svg"} alt={emp.first_name} />
                                  </IonAvatar>
                                  <IonLabel>
                                    <h3>{emp.last_name}, {emp.first_name}</h3>
                                    <p>{emp.employee_id}</p>
                                  </IonLabel>
                                </IonItem>
                              ))}
                          </IonList>
                        )}
                      </IonItem>
                    )}

                    {isEditing && selectedEmployeeForCredit && (
                      <IonItem>
                        <IonLabel>
                          <h2>Employee</h2>
                          <p>{selectedEmployeeForCredit.last_name}, {selectedEmployeeForCredit.first_name}</p>
                        </IonLabel>
                      </IonItem>
                    )}

                    {/* Leave Type Selection */}
                    <IonItem>
                      <IonLabel position="stacked">Leave Type *</IonLabel>
                      <IonSelect
                        value={currentCredit.leaveType}
                        onIonChange={(e) => setCurrentCredit({ ...currentCredit, leaveType: e.detail.value })}
                        disabled={isEditing}
                      >
                        <IonSelectOption value="Vacation Leave">Vacation Leave</IonSelectOption>
                        <IonSelectOption value="Sick Leave">Sick Leave</IonSelectOption>
                        <IonSelectOption value="Birthday Leave">Birthday Leave</IonSelectOption>
                        <IonSelectOption value="Solo Parent Leave">Solo Parent Leave</IonSelectOption>
                        <IonSelectOption value="Bereavement Leave">Bereavement Leave</IonSelectOption>
                        <IonSelectOption value="Paternity Leave">Paternity Leave</IonSelectOption>
                        <IonSelectOption value="Maternity Leave">Maternity Leave</IonSelectOption>
                      </IonSelect>
                    </IonItem>

                    {/* Year Selection */}
                    <IonItem>
                      <IonLabel position="stacked">Year *</IonLabel>
                      <IonSelect
                        value={currentCredit.year}
                        onIonChange={(e) => setCurrentCredit({ ...currentCredit, year: e.detail.value })}
                        disabled={isEditing}
                      >
                        {years.map((year) => (
                          <IonSelectOption key={year} value={year}>
                            {year}
                          </IonSelectOption>
                        ))}
                      </IonSelect>
                    </IonItem>

                    {/* Current Balance (for editing) */}
                    {isEditing && (
                      <IonItem>
                        <IonLabel>
                          <h2>Current Balance</h2>
                          <p style={{ fontSize: '1.2em', fontWeight: 'bold', color: 'var(--ion-color-primary)' }}>
                            {currentCredit.balance.toFixed(1)} days
                          </p>
                        </IonLabel>
                      </IonItem>
                    )}

                    {/* Credits to Add */}
                    <IonItem>
                      <IonLabel position="stacked">
                        {isEditing ? 'Credits to Add/Remove' : 'Total Credits'} *
                      </IonLabel>
                      <IonInput
                        type="number"
                        value={currentCredit.creditsAdded}
                        onIonInput={(e) => setCurrentCredit({ 
                          ...currentCredit, 
                          creditsAdded: parseFloat(e.detail.value!) || 0 
                        })}
                        placeholder="Enter credits"
                      />
                    </IonItem>

                    {/* Credits Used (optional for new entries) */}
                    {!isEditing && (
                      <IonItem>
                        <IonLabel position="stacked">Credits Already Used (Optional)</IonLabel>
                        <IonInput
                          type="number"
                          value={currentCredit.creditsUsed}
                          onIonInput={(e) => setCurrentCredit({ 
                            ...currentCredit, 
                            creditsUsed: parseFloat(e.detail.value!) || 0 
                          })}
                          placeholder="0"
                        />
                      </IonItem>
                    )}

                    {/* Transaction History for Editing */}
                    {isEditing && transactionHistory.length > 0 && (
                      <IonCard style={{ marginTop: '1rem' }}>
                        <IonCardHeader>
                          <IonText color="medium">
                            <h3 style={{ fontSize: '0.95em', margin: 0 }}>Recent Transactions</h3>
                          </IonText>
                        </IonCardHeader>
                        <IonCardContent style={{ paddingTop: 0 }}>
                          <IonList>
                            {transactionHistory.slice(0, 3).map((transaction, index) => (
                              <IonItem key={index} lines={index < 2 ? "inset" : "none"}>
                                <IonLabel>
                                  <p style={{ fontWeight: 500 }}>{transaction.transactionType}</p>
                                  <p style={{ fontSize: '0.85em', color: 'var(--ion-color-medium)' }}>
                                    {formatDate(transaction.dateAdded)}
                                  </p>
                                </IonLabel>
                                <IonNote slot="end">
                                  +{transaction.creditsAdded.toFixed(1)}
                                </IonNote>
                              </IonItem>
                            ))}
                          </IonList>
                        </IonCardContent>
                      </IonCard>
                    )}

                    {/* Action Buttons */}
                    <div style={{ marginTop: '1.5rem' }}>
                      <IonButton expand="block" onClick={handleSaveCredit} color="primary">
                        <IonIcon icon={save} slot="start" />
                        {isEditing ? 'Save Adjustment' : 'Add Leave Credit'}
                      </IonButton>
                      <IonButton expand="block" fill="clear" onClick={() => setIsModalOpen(false)}>
                        Cancel
                      </IonButton>
                    </div>
                  </IonCardContent>
                </IonCard>
              </div>
            )}
          </IonContent>
        </IonModal>

        {/* Toast Notifications */}
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2000}
          position="top"
          color={toastMessage.includes('success') ? 'success' : toastMessage.includes('Failed') ? 'danger' : 'primary'}
        />

        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header="Notification"
          message={alertMessage}
          buttons={["OK"]}
        />
      </IonContent>
    </IonPage>
  )
}

export default LeaveCreditManagement
