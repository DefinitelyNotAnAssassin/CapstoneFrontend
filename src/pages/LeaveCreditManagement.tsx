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
  IonTextarea,
  IonToast,
  IonText,
  IonSearchbar,
  IonProgressBar,
  IonChip,
  IonNote,
  IonAvatar,
  IonImg,
  IonFooter,
  IonToggle,
  IonAlert,
  IonFab,
  IonFabButton,
} from "@ionic/react"
import { add, close, save, refresh, addCircle, removeCircle, create, trash, download, print } from "ionicons/icons"
import { employees, type LeaveType, leavePolicies, positions } from "../data/data"

// Define leave credit types
interface LeaveCredit {
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

// Define leave credit policy
interface LeaveCreditPolicy {
  id: string
  leaveType: LeaveType
  accrualFrequency: "Monthly" | "Annual" | "None"
  creditsPerPeriod: number
  maxAccumulation: number
  carryOver: boolean
  carryOverLimit?: number
  applicablePositionTypes: ("Academic" | "Administration")[]
  isActive: boolean
}

// Sample leave credit policies
const initialLeaveCreditPolicies: LeaveCreditPolicy[] = [
  {
    id: "1",
    leaveType: "Vacation Leave",
    accrualFrequency: "Monthly",
    creditsPerPeriod: 1.25, // 15 days per year
    maxAccumulation: 30,
    carryOver: true,
    carryOverLimit: 10,
    applicablePositionTypes: ["Academic", "Administration"],
    isActive: true,
  },
  {
    id: "2",
    leaveType: "Sick Leave",
    accrualFrequency: "Monthly",
    creditsPerPeriod: 1.25, // 15 days per year
    maxAccumulation: 30,
    carryOver: true,
    carryOverLimit: 15,
    applicablePositionTypes: ["Academic", "Administration"],
    isActive: true,
  },
  {
    id: "3",
    leaveType: "Birthday Leave",
    accrualFrequency: "Annual",
    creditsPerPeriod: 1,
    maxAccumulation: 1,
    carryOver: false,
    applicablePositionTypes: ["Academic", "Administration"],
    isActive: true,
  },
  {
    id: "4",
    leaveType: "Bereavement Leave",
    accrualFrequency: "None",
    creditsPerPeriod: 0,
    maxAccumulation: 5,
    carryOver: false,
    applicablePositionTypes: ["Academic", "Administration"],
    isActive: true,
  },
  {
    id: "5",
    leaveType: "Paternity Leave",
    accrualFrequency: "None",
    creditsPerPeriod: 0,
    maxAccumulation: 7,
    carryOver: false,
    applicablePositionTypes: ["Academic", "Administration"],
    isActive: true,
  },
  {
    id: "6",
    leaveType: "Maternity Leave",
    accrualFrequency: "None",
    creditsPerPeriod: 0,
    maxAccumulation: 105,
    carryOver: false,
    applicablePositionTypes: ["Academic", "Administration"],
    isActive: true,
  },
]

// Sample leave credits
const initialLeaveCredits: LeaveCredit[] = [
  {
    id: "1",
    employeeId: "4", // Jennifer Davis
    leaveType: "Vacation Leave",
    year: 2023,
    creditsAdded: 15,
    creditsUsed: 5,
    balance: 10,
    dateAdded: "2023-01-01",
    addedBy: "1", // HR Admin
    transactionType: "Initial",
  },
  {
    id: "2",
    employeeId: "4", // Jennifer Davis
    leaveType: "Sick Leave",
    year: 2023,
    creditsAdded: 15,
    creditsUsed: 2,
    balance: 13,
    dateAdded: "2023-01-01",
    addedBy: "1", // HR Admin
    transactionType: "Initial",
  },
  {
    id: "3",
    employeeId: "5", // David Wilson
    leaveType: "Vacation Leave",
    year: 2023,
    creditsAdded: 15,
    creditsUsed: 8,
    balance: 7,
    dateAdded: "2023-01-01",
    addedBy: "1", // HR Admin
    transactionType: "Initial",
  },
  {
    id: "4",
    employeeId: "5", // David Wilson
    leaveType: "Sick Leave",
    year: 2023,
    creditsAdded: 15,
    creditsUsed: 3,
    balance: 12,
    dateAdded: "2023-01-01",
    addedBy: "1", // HR Admin
    transactionType: "Initial",
  },
  {
    id: "5",
    employeeId: "6", // Sarah Anderson
    leaveType: "Vacation Leave",
    year: 2023,
    creditsAdded: 15,
    creditsUsed: 0,
    balance: 15,
    dateAdded: "2023-01-01",
    addedBy: "1", // HR Admin
    transactionType: "Initial",
  },
  {
    id: "6",
    employeeId: "6", // Sarah Anderson
    leaveType: "Sick Leave",
    year: 2023,
    creditsAdded: 15,
    creditsUsed: 0,
    balance: 15,
    dateAdded: "2023-01-01",
    addedBy: "1", // HR Admin
    transactionType: "Initial",
  },
]

// Sample years for filtering
const years = [2022, 2023, 2024, 2025]

const LeaveCreditManagement: React.FC = () => {
  const [selectedEmployee, setSelectedEmployee] = useState<string>("")
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear())
  const [searchText, setSearchText] = useState<string>("")
  const [showModal, setShowModal] = useState<boolean>(false)
  const [currentCredit, setCurrentCredit] = useState<LeaveCredit | null>(null)
  const [currentPolicy, setCurrentPolicy] = useState<LeaveCreditPolicy | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)
  const [showConfirmAlert, setShowConfirmAlert] = useState(false)
  const [confirmAction, setConfirmAction] = useState<string>("")
  const [transactionHistory, setTransactionHistory] = useState<LeaveCredit[]>([])
  const [selectedLeaveType, setSelectedLeaveType] = useState<string>("all")
  const [leaveCredits, setLeaveCredits] = useState<LeaveCredit[]>([])
  const [leaveCreditPolicies, setLeaveCreditPolicies] = useState<LeaveCreditPolicy[]>([])
  const [filteredCredits, setFilteredCredits] = useState<LeaveCredit[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false)

  // Load leave credits from localStorage or use initial data
  useEffect(() => {
    const savedCredits = localStorage.getItem("hrims-leave-credits")
    if (savedCredits) {
      setLeaveCredits(JSON.parse(savedCredits))
    } else {
      setLeaveCredits(initialLeaveCredits)
    }

    const savedPolicies = localStorage.getItem("hrims-leave-credit-policies")
    if (savedPolicies) {
      setLeaveCreditPolicies(JSON.parse(savedPolicies))
    } else {
      setLeaveCreditPolicies(initialLeaveCreditPolicies)
    }
  }, [])

  // Save leave credits to localStorage when they change
  useEffect(() => {
    if (leaveCredits.length > 0) {
      localStorage.setItem("hrims-leave-credits", JSON.stringify(leaveCredits))
    }
  }, [leaveCredits])

  // Save leave credit policies to localStorage when they change
  useEffect(() => {
    if (leaveCreditPolicies.length > 0) {
      localStorage.setItem("hrims-leave-credit-policies", JSON.stringify(leaveCreditPolicies))
    }
  }, [leaveCreditPolicies])

  // Filter leave credits based on selected filters and search text
  useEffect(() => {
    let filtered = [...leaveCredits]

    // Filter by employee
    if (selectedEmployee !== "all") {
      filtered = filtered.filter((credit) => credit.employeeId === selectedEmployee)
    }

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
          employee?.firstName.toLowerCase().includes(searchLower) ||
          employee?.lastName.toLowerCase().includes(searchLower) ||
          credit.leaveType.toLowerCase().includes(searchLower)
        )
      })
    }

    // Group by employee and leave type to get latest balance
    const latestCredits: LeaveCredit[] = []
    const creditMap = new Map<string, LeaveCredit>()

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
      return `${empA.lastName}, ${empA.firstName}`.localeCompare(`${empB.lastName}, ${empB.firstName}`)
    })

    setFilteredCredits(latestCredits)
  }, [leaveCredits, selectedEmployee, selectedLeaveType, selectedYear, searchText])

  // Filter employees based on search text
  const filteredEmployees = employees.filter(
    (employee) =>
      employee.firstName.toLowerCase().includes(searchText.toLowerCase()) ||
      employee.lastName.toLowerCase().includes(searchText.toLowerCase()) ||
      employee.employeeId.toLowerCase().includes(searchText.toLowerCase()),
  )

  // Get employee name
  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find((emp) => emp.id === employeeId)
    return employee ? `${employee.firstName} ${employee.lastName}` : "Unknown Employee"
  }

  // Get employee avatar
  const getEmployeeAvatar = (employeeId: string) => {
    const employee = employees.find((emp) => emp.id === employeeId)
    return employee?.profileImage || "https://ionicframework.com/docs/img/demos/avatar.svg"
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
    setSelectedEmployee("all")
    setSelectedLeaveType("all")
    setSearchText("")
  }

  // Handle adding a new leave credit
  const handleAddCredit = () => {
    const newCredit: LeaveCredit = {
      id: Date.now().toString(),
      employeeId: "",
      leaveType: "Vacation Leave",
      year: selectedYear,
      creditsAdded: 0,
      creditsUsed: 0,
      balance: 0,
      dateAdded: new Date().toISOString().split("T")[0],
      addedBy: "1", // HR Admin
      transactionType: "Adjustment",
    }
    setCurrentCredit(newCredit)
    setIsEditing(false)
    setIsModalOpen(true)
  }

  // Handle editing a leave credit
  const handleEditCredit = (credit: LeaveCredit) => {
    // If no credit is found, create a new one for adjustment
    if (!credit) {
      const newCredit: LeaveCredit = {
        id: Date.now().toString(),
        employeeId: selectedEmployee,
        leaveType: "Vacation Leave",
        year: selectedYear,
        creditsAdded: 0,
        creditsUsed: 0,
        balance: 0,
        dateAdded: new Date().toISOString().split("T")[0],
        addedBy: "1", // HR Admin
        transactionType: "Adjustment",
      }
      setCurrentCredit(newCredit)
      setIsEditing(true)
      setIsModalOpen(true)
      return
    }

    // Get transaction history for this employee and leave type
    const history = leaveCredits
      .filter((c) => c.employeeId === credit.employeeId && c.leaveType === credit.leaveType && c.year === credit.year)
      .sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime())

    setTransactionHistory(history)

    // Create a new adjustment credit based on the current balance
    const adjustmentCredit: LeaveCredit = {
      id: Date.now().toString(),
      employeeId: credit.employeeId,
      leaveType: credit.leaveType,
      year: credit.year,
      creditsAdded: 0, // Will be set by user
      creditsUsed: 0,
      balance: credit.balance, // Current balance before adjustment
      dateAdded: new Date().toISOString().split("T")[0],
      addedBy: "1", // HR Admin
      transactionType: "Adjustment",
    }

    setCurrentCredit(adjustmentCredit)
    setIsEditing(true)
    setIsModalOpen(true)
  }

  // Handle adding a new leave credit policy
  const handleAddPolicy = () => {
    const newPolicy: LeaveCreditPolicy = {
      id: Date.now().toString(),
      leaveType: "Vacation Leave",
      accrualFrequency: "Monthly",
      creditsPerPeriod: 1.25,
      maxAccumulation: 30,
      carryOver: true,
      carryOverLimit: 10,
      applicablePositionTypes: ["Academic", "Administration"],
      isActive: true,
    }
    setCurrentPolicy(newPolicy)
    setIsEditing(false)
    setIsPolicyModalOpen(true)
  }

  // Handle editing a leave credit policy
  const handleEditPolicy = (policy: LeaveCreditPolicy) => {
    setCurrentPolicy({ ...policy })
    setIsEditing(true)
    setIsPolicyModalOpen(true)
  }

  // Handle deleting a leave credit policy
  const handleDeletePolicy = (policy: LeaveCreditPolicy) => {
    setCurrentPolicy(policy)
    setShowDeleteAlert(true)
  }

  // Confirm delete policy
  const confirmDeletePolicy = () => {
    if (currentPolicy) {
      setLeaveCreditPolicies(leaveCreditPolicies.filter((p) => p.id !== currentPolicy.id))
      setAlertMessage("Leave credit policy deleted successfully")
      setShowAlert(true)
    }
    setShowDeleteAlert(false)
  }

  // Handle saving a leave credit
  const handleSaveCredit = () => {
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

    // Calculate new balance
    const newBalance = isEditing
      ? currentCredit.balance + currentCredit.creditsAdded - currentCredit.creditsUsed
      : currentCredit.creditsAdded - currentCredit.creditsUsed

    // Update the credit with the new balance
    const updatedCredit = {
      ...currentCredit,
      balance: newBalance,
    }

    // Add the new credit to the list
    setLeaveCredits([...leaveCredits, updatedCredit])
    setAlertMessage(isEditing ? "Leave credit updated successfully" : "Leave credit added successfully")
    setShowAlert(true)
    setIsModalOpen(false)
  }

  // Handle saving a leave credit policy
  const handleSavePolicy = () => {
    if (!currentPolicy) return

    // Validate policy
    if (currentPolicy.creditsPerPeriod < 0) {
      setAlertMessage("Credits per period cannot be negative")
      setShowAlert(true)
      return
    }

    if (currentPolicy.maxAccumulation < 0) {
      setAlertMessage("Maximum accumulation cannot be negative")
      setShowAlert(true)
      return
    }

    if (currentPolicy.carryOver && (currentPolicy.carryOverLimit === undefined || currentPolicy.carryOverLimit < 0)) {
      setAlertMessage("Carry over limit cannot be negative")
      setShowAlert(true)
      return
    }

    if (currentPolicy.applicablePositionTypes.length === 0) {
      setAlertMessage("Please select at least one applicable position type")
      setShowAlert(true)
      return
    }

    if (isEditing) {
      // Update existing policy
      setLeaveCreditPolicies(leaveCreditPolicies.map((p) => (p.id === currentPolicy.id ? currentPolicy : p)))
      setAlertMessage("Leave credit policy updated successfully")
    } else {
      // Add new policy
      setLeaveCreditPolicies([...leaveCreditPolicies, currentPolicy])
      setAlertMessage("New leave credit policy added successfully")
    }

    setShowAlert(true)
    setIsPolicyModalOpen(false)
  }

  // Run monthly leave credit accrual
  const runMonthlyAccrual = () => {
    setConfirmAction("monthly")
    setShowConfirmAlert(true)
  }

  // Run annual leave credit accrual
  const runAnnualAccrual = () => {
    setConfirmAction("annual")
    setShowConfirmAlert(true)
  }

  // Process leave credit accrual
  const processAccrual = (type: "monthly" | "annual") => {
    const today = new Date()
    const currentYear = today.getFullYear()
    const currentMonth = today.getMonth() + 1 // JavaScript months are 0-indexed

    // Get applicable policies
    const applicablePolicies = leaveCreditPolicies.filter((policy) => {
      return (
        (type === "monthly" && policy.accrualFrequency === "Monthly") ||
        (type === "annual" && policy.accrualFrequency === "Annual")
      )
    })

    if (applicablePolicies.length === 0) {
      setAlertMessage(`No ${type} accrual policies found`)
      setShowAlert(true)
      return
    }

    // Process each policy
    const newCredits: LeaveCredit[] = []

    // For each employee
    employees.forEach((employee) => {
      // Get position type
      const position = positions.find((pos) => pos.id === employee.positionId)
      if (!position) return

      // For each applicable policy
      applicablePolicies.forEach((policy) => {
        // Check if policy applies to this position type
        if (!policy.applicablePositionTypes.includes(position.type)) return

        // Get current balance for this employee and leave type
        const currentCreditEntry = leaveCredits
          .filter(
            (credit) =>
              credit.employeeId === employee.id && credit.leaveType === policy.leaveType && credit.year === currentYear,
          )
          .sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime())[0]

        const currentBalance = currentCreditEntry?.balance || 0

        // Calculate new balance (respect max accumulation)
        const newCreditsAdded = policy.creditsPerPeriod
        const newBalance = Math.min(currentBalance + newCreditsAdded, policy.maxAccumulation)

        // Create new credit entry
        const newCredit: LeaveCredit = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 5), // Ensure unique ID
          employeeId: employee.id,
          leaveType: policy.leaveType,
          year: currentYear,
          month: type === "monthly" ? currentMonth : undefined,
          creditsAdded: newCreditsAdded,
          creditsUsed: 0,
          balance: newBalance,
          dateAdded: today.toISOString().split("T")[0],
          addedBy: "1", // HR Admin
          remarks: `Automatic ${type} accrual`,
          transactionType: type === "monthly" ? "Monthly" : "Annual",
        }

        newCredits.push(newCredit)
      })
    })

    // Add new credits to the list
    setLeaveCredits([...leaveCredits, ...newCredits])
    setAlertMessage(`${type === "monthly" ? "Monthly" : "Annual"} leave credit accrual processed successfully`)
    setShowAlert(true)
  }

  // Year-end processing
  const processYearEnd = () => {
    setConfirmAction("yearend")
    setShowConfirmAlert(true)
  }

  // Process year-end carry over
  const processYearEndCarryOver = () => {
    const currentYear = new Date().getFullYear()
    const nextYear = currentYear + 1

    // Get all policies
    const policies = [...leaveCreditPolicies]

    // Process each employee
    const newCredits: LeaveCredit[] = []

    // For each employee
    employees.forEach((employee) => {
      // Get position type
      const position = positions.find((pos) => pos.id === employee.positionId)
      if (!position) return

      // For each policy
      policies.forEach((policy) => {
        // Check if policy applies to this position type
        if (!policy.applicablePositionTypes.includes(position.type)) return

        // Get current balance for this employee and leave type
        const currentCreditEntry = leaveCredits
          .filter(
            (credit) =>
              credit.employeeId === employee.id && credit.leaveType === policy.leaveType && credit.year === currentYear,
          )
          .sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime())[0]

        if (!currentCreditEntry) return

        // Calculate carry over amount
        let carryOverAmount = 0

        if (policy.carryOver) {
          carryOverAmount =
            policy.carryOverLimit !== undefined
              ? Math.min(currentCreditEntry.balance, policy.carryOverLimit)
              : currentCreditEntry.balance
        }

        // Create new credit entry for next year
        const newCredit: LeaveCredit = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 5), // Ensure unique ID
          employeeId: employee.id,
          leaveType: policy.leaveType,
          year: nextYear,
          creditsAdded: carryOverAmount,
          creditsUsed: 0,
          balance: carryOverAmount,
          dateAdded: new Date().toISOString().split("T")[0],
          addedBy: "1", // HR Admin
          remarks: `Year-end carry over from ${currentYear}`,
          transactionType: "Initial",
        }

        newCredits.push(newCredit)
      })
    })

    // Add new credits to the list
    setLeaveCredits([...leaveCredits, ...newCredits])
    setAlertMessage(`Year-end processing completed successfully`)
    setShowAlert(true)
  }

  // Handle confirmation actions
  const handleConfirmAction = () => {
    switch (confirmAction) {
      case "monthly":
        processAccrual("monthly")
        break
      case "annual":
        processAccrual("annual")
        break
      case "yearend":
        processYearEndCarryOver()
        break
    }
    setShowConfirmAlert(false)
  }

  // Get confirmation message
  const getConfirmMessage = () => {
    switch (confirmAction) {
      case "monthly":
        return "This will process monthly leave credit accrual for all eligible employees. Continue?"
      case "annual":
        return "This will process annual leave credit accrual for all eligible employees. Continue?"
      case "yearend":
        return "This will process year-end carry over of leave credits to the next year. Continue?"
      default:
        return "Are you sure you want to continue?"
    }
  }

  // Format date
  const formatDate2 = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/hr-dashboard" />
          </IonButtons>
          <IonTitle>Leave Credit Management</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {/* Leave Credits List */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Leave Credits</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonGrid>
              <IonRow>
                <IonCol size="12" size-md="6">
                  <IonSearchbar
                    value={searchText}
                    onIonChange={(e) => setSearchText(e.detail.value!)}
                    placeholder="Search employees"
                    animated
                  />
                </IonCol>
                <IonCol size="12" size-md="6">
                  <IonItem>
                    <IonLabel>Year</IonLabel>
                    <IonSelect value={selectedYear} onIonChange={(e) => setSelectedYear(e.detail.value)}>
                      {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map((year) => (
                        <IonSelectOption key={year} value={year}>
                          {year}
                        </IonSelectOption>
                      ))}
                    </IonSelect>
                  </IonItem>
                </IonCol>
              </IonRow>
            </IonGrid>

            <IonList>
              {filteredEmployees.map((employee) => (
                <IonCard key={employee.id} className="ion-margin">
                  <IonCardHeader>
                    <IonCardTitle>
                      {employee.lastName}, {employee.firstName}{" "}
                      {employee.middleName ? employee.middleName.charAt(0) + "." : ""}
                    </IonCardTitle>
                    <IonChip color="primary">{employee.employeeId}</IonChip>
                  </IonCardHeader>
                  <IonCardContent>
                    <IonList>
                      {leaveCredits
                        .filter((credit) => credit.employeeId === employee.id)
                        .sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime())
                        .map((credit) => (
                          <IonItem key={credit.id}>
                            <IonLabel>
                              <h2>{credit.leaveType}</h2>
                              <IonGrid>
                                <IonRow>
                                  <IonCol size="6">
                                    <p>Total: {credit.creditsAdded} days</p>
                                  </IonCol>
                                  <IonCol size="6">
                                    <p>Used: {credit.creditsUsed} days</p>
                                  </IonCol>
                                </IonRow>
                                <IonRow>
                                  <IonCol size="6">
                                    <p>Pending: {credit.creditsAdded - credit.creditsUsed} days</p>
                                  </IonCol>
                                  <IonCol size="6">
                                    <p>Remaining: {credit.balance} days</p>
                                  </IonCol>
                                </IonRow>
                                <IonRow>
                                  <IonCol>
                                    <IonProgressBar
                                      value={credit.creditsUsed / credit.creditsAdded}
                                      color={credit.balance < 5 ? "danger" : "primary"}
                                    ></IonProgressBar>
                                    <IonNote className="ion-text-end ion-padding-top">
                                      {Math.round((credit.creditsUsed / credit.creditsAdded) * 100)}% used
                                    </IonNote>
                                  </IonCol>
                                </IonRow>
                              </IonGrid>
                            </IonLabel>
                            <IonButton
                              slot="end"
                              fill="clear"
                              onClick={() => handleEditCredit(credit)}
                            >
                              <IonIcon icon={refresh} slot="icon-only" />
                            </IonButton>
                          </IonItem>
                        ))}
                    </IonList>
                  </IonCardContent>
                </IonCard>
              ))}
            </IonList>
          </IonCardContent>
        </IonCard>

        {/* Leave Credit Edit/Add Modal */}
        <IonModal isOpen={isModalOpen} onDidDismiss={() => setIsModalOpen(false)}>
          <IonHeader>
            <IonToolbar color="primary">
              <IonTitle>{isEditing ? "Adjust Leave Credits" : "Add Leave Credits"}</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setIsModalOpen(false)}>
                  <IonIcon icon={close} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>

          <IonContent className="ion-padding">
            {currentCredit && (
              <>
                <IonList>
                  <IonItem>
                    <IonLabel position="stacked">
                      Employee <IonText color="danger">*</IonText>
                    </IonLabel>
                    <IonSelect
                      value={currentCredit.employeeId}
                      onIonChange={(e) => setCurrentCredit({ ...currentCredit, employeeId: e.detail.value })}
                      placeholder="Select Employee"
                      disabled={isEditing}
                    >
                      {employees.map((emp) => (
                        <IonSelectOption key={emp.id} value={emp.id}>
                          {emp.firstName} {emp.lastName}
                        </IonSelectOption>
                      ))}
                    </IonSelect>
                  </IonItem>

                  <IonItem>
                    <IonLabel position="stacked">
                      Leave Type <IonText color="danger">*</IonText>
                    </IonLabel>
                    <IonSelect
                      value={currentCredit.leaveType}
                      onIonChange={(e) => setCurrentCredit({ ...currentCredit, leaveType: e.detail.value })}
                      placeholder="Select Leave Type"
                      disabled={isEditing}
                    >
                      {leavePolicies.map((policy) => (
                        <IonSelectOption key={policy.id} value={policy.leaveType}>
                          {policy.leaveType}
                        </IonSelectOption>
                      ))}
                    </IonSelect>
                  </IonItem>

                  <IonItem>
                    <IonLabel position="stacked">
                      Year <IonText color="danger">*</IonText>
                    </IonLabel>
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

                  {isEditing && (
                    <IonItem>
                      <IonLabel position="stacked">Current Balance</IonLabel>
                      <IonInput value={currentCredit.balance} disabled />
                    </IonItem>
                  )}

                  <IonItem>
                    <IonLabel position="stacked">Credits to Add</IonLabel>
                    <IonInput
                      type="number"
                      value={currentCredit.creditsAdded}
                      onIonChange={(e) =>
                        setCurrentCredit({
                          ...currentCredit,
                          creditsAdded: Number.parseFloat(e.detail.value!) || 0,
                        })
                      }
                      placeholder="0"
                    />
                  </IonItem>

                  {isEditing && (
                    <IonItem>
                      <IonLabel position="stacked">Credits to Deduct</IonLabel>
                      <IonInput
                        type="number"
                        value={currentCredit.creditsUsed}
                        onIonChange={(e) =>
                          setCurrentCredit({
                            ...currentCredit,
                            creditsUsed: Number.parseFloat(e.detail.value!) || 0,
                          })
                        }
                        placeholder="0"
                      />
                    </IonItem>
                  )}

                  <IonItem>
                    <IonLabel position="stacked">Remarks</IonLabel>
                    <IonTextarea
                      value={currentCredit.remarks}
                      onIonChange={(e) => setCurrentCredit({ ...currentCredit, remarks: e.detail.value ?? undefined })}
                      placeholder="Enter remarks for this transaction"
                    />
                  </IonItem>
                </IonList>

                {isEditing && transactionHistory.length > 0 && (
                  <div className="ion-margin-top">
                    <IonCard>
                      <IonCardHeader>
                        <IonCardTitle>Transaction History</IonCardTitle>
                      </IonCardHeader>
                      <IonCardContent>
                        <IonList>
                          {transactionHistory.map((transaction) => (
                            <IonItem key={transaction.id}>
                              <IonLabel>
                                <h3>{transaction.transactionType}</h3>
                                <p>{formatDate2(transaction.dateAdded)}</p>
                                <p>
                                  Added: {transaction.creditsAdded} | Used: {transaction.creditsUsed} | Balance:{" "}
                                  {transaction.balance}
                                </p>
                                {transaction.remarks && <p>{transaction.remarks}</p>}
                              </IonLabel>
                              <IonBadge
                                slot="end"
                                color={
                                  transaction.transactionType === "Initial"
                                    ? "primary"
                                    : transaction.transactionType === "Monthly" ||
                                        transaction.transactionType === "Annual"
                                      ? "success"
                                      : transaction.transactionType === "Used"
                                        ? "warning"
                                        : "medium"
                                }
                              >
                                {transaction.transactionType}
                              </IonBadge>
                            </IonItem>
                          ))}
                        </IonList>
                      </IonCardContent>
                    </IonCard>
                  </div>
                )}
              </>
            )}
          </IonContent>

          <IonFooter>
            <IonToolbar>
              <IonButton expand="block" onClick={handleSaveCredit}>
                <IonIcon icon={save} slot="start" />
                {isEditing ? "Save Adjustment" : "Add Credits"}
              </IonButton>
            </IonToolbar>
          </IonFooter>
        </IonModal>

        {/* Leave Credit Policy Edit/Add Modal */}
        <IonModal isOpen={isPolicyModalOpen} onDidDismiss={() => setIsPolicyModalOpen(false)}>
          <IonHeader>
            <IonToolbar color="primary">
              <IonTitle>{isEditing ? "Edit Leave Credit Policy" : "Add Leave Credit Policy"}</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setIsPolicyModalOpen(false)}>
                  <IonIcon icon={close} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>

          <IonContent className="ion-padding">
            {currentPolicy && (
              <IonList>
                <IonItem>
                  <IonLabel position="stacked">
                    Leave Type <IonText color="danger">*</IonText>
                  </IonLabel>
                  <IonSelect
                    value={currentPolicy.leaveType}
                    onIonChange={(e) => setCurrentPolicy({ ...currentPolicy, leaveType: e.detail.value })}
                    placeholder="Select Leave Type"
                  >
                    {leavePolicies.map((policy) => (
                      <IonSelectOption key={policy.id} value={policy.leaveType}>
                        {policy.leaveType}
                      </IonSelectOption>
                    ))}
                  </IonSelect>
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked">
                    Accrual Frequency <IonText color="danger">*</IonText>
                  </IonLabel>
                  <IonSelect
                    value={currentPolicy.accrualFrequency}
                    onIonChange={(e) => setCurrentPolicy({ ...currentPolicy, accrualFrequency: e.detail.value })}
                  >
                    <IonSelectOption value="Monthly">Monthly</IonSelectOption>
                    <IonSelectOption value="Annual">Annual</IonSelectOption>
                    <IonSelectOption value="None">None (Manual Only)</IonSelectOption>
                  </IonSelect>
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked">Credits Per Period</IonLabel>
                  <IonInput
                    type="number"
                    value={currentPolicy.creditsPerPeriod}
                    onIonChange={(e) =>
                      setCurrentPolicy({
                        ...currentPolicy,
                        creditsPerPeriod: Number.parseFloat(e.detail.value!) || 0,
                      })
                    }
                    placeholder="0"
                    disabled={currentPolicy.accrualFrequency === "None"}
                  />
                  <IonNote>Credits added each period (month or year)</IonNote>
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked">
                    Maximum Accumulation <IonText color="danger">*</IonText>
                  </IonLabel>
                  <IonInput
                    type="number"
                    value={currentPolicy.maxAccumulation}
                    onIonChange={(e) =>
                      setCurrentPolicy({
                        ...currentPolicy,
                        maxAccumulation: Number.parseFloat(e.detail.value!) || 0,
                      })
                    }
                    placeholder="0"
                  />
                  <IonNote>Maximum credits an employee can accumulate</IonNote>
                </IonItem>

                <IonItem>
                  <IonLabel>Allow Carry Over</IonLabel>
                  <IonToggle
                    checked={currentPolicy.carryOver}
                    onIonChange={(e) => setCurrentPolicy({ ...currentPolicy, carryOver: e.detail.checked })}
                  />
                </IonItem>

                {currentPolicy.carryOver && (
                  <IonItem>
                    <IonLabel position="stacked">Carry Over Limit</IonLabel>
                    <IonInput
                      type="number"
                      value={currentPolicy.carryOverLimit}
                      onIonChange={(e) =>
                        setCurrentPolicy({
                          ...currentPolicy,
                          carryOverLimit: Number.parseFloat(e.detail.value!) || 0,
                        })
                      }
                      placeholder="0"
                    />
                    <IonNote>Maximum credits that can be carried over to next year</IonNote>
                  </IonItem>
                )}

                <IonItem>
                  <IonLabel position="stacked">
                    Applicable Position Types <IonText color="danger">*</IonText>
                  </IonLabel>
                  <IonSelect
                    value={currentPolicy.applicablePositionTypes}
                    onIonChange={(e) => setCurrentPolicy({ ...currentPolicy, applicablePositionTypes: e.detail.value })}
                    multiple={true}
                  >
                    <IonSelectOption value="Academic">Academic</IonSelectOption>
                    <IonSelectOption value="Administration">Administration</IonSelectOption>
                  </IonSelect>
                </IonItem>

                <IonItem>
                  <IonLabel>Active</IonLabel>
                  <IonToggle
                    checked={currentPolicy.isActive}
                    onIonChange={(e) => setCurrentPolicy({ ...currentPolicy, isActive: e.detail.checked })}
                  />
                </IonItem>
              </IonList>
            )}
          </IonContent>

          <IonFooter>
            <IonToolbar>
              <IonButton expand="block" onClick={handleSavePolicy}>
                <IonIcon icon={save} slot="start" />
                Save Policy
              </IonButton>
            </IonToolbar>
          </IonFooter>
        </IonModal>

        {/* Alerts */}
        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header="Notification"
          message={alertMessage}
          buttons={["OK"]}
        />

        <IonAlert
          isOpen={showDeleteAlert}
          onDidDismiss={() => setShowDeleteAlert(false)}
          header="Confirm Delete"
          message="Are you sure you want to delete this leave credit policy?"
          buttons={[
            {
              text: "Cancel",
              role: "cancel",
            },
            {
              text: "Delete",
              handler: confirmDeletePolicy,
            },
          ]}
        />

        <IonAlert
          isOpen={showConfirmAlert}
          onDidDismiss={() => setShowConfirmAlert(false)}
          header="Confirm Action"
          message={getConfirmMessage()}
          buttons={[
            {
              text: "Cancel",
              role: "cancel",
            },
            {
              text: "Proceed",
              handler: handleConfirmAction,
            },
          ]}
        />
      </IonContent>
    </IonPage>
  )
}

export default LeaveCreditManagement
