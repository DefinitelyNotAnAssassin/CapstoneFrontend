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
  IonButton,
  IonIcon,
  IonBadge,
  IonItem,
  IonList,
  IonFab,
  IonFabButton,
  IonGrid,
  IonRow,
  IonCol,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonChip,
  IonAvatar,
  IonImg,
  IonProgressBar,
  IonDatetime,
  IonPopover,
  IonButtons,
  IonBackButton,
  IonModal,
  IonFooter,
  IonTextarea,
  IonAlert,
} from "@ionic/react"
import {
  calendar,
  document,
  time,
  close,
  add,
  checkmarkCircle,
  closeCircle,
  hourglassOutline,
  statsChart,
  eye,
  checkmark,
  download,
  print,
  create,
} from "ionicons/icons"
import { type LeaveRequest, leavePolicies, employees } from "../../data/data"

// Sample leave requests data
const initialLeaveRequests: LeaveRequest[] = [
  {
    id: "1",
    employeeId: "6", // Sarah Anderson
    leaveType: "Vacation Leave",
    startDate: "2023-06-15",
    endDate: "2023-06-20",
    reason: "Family vacation",
    status: "Pending",
    dateRequested: "2023-05-20",
  },
  {
    id: "2",
    employeeId: "7", // James Taylor
    leaveType: "Sick Leave",
    startDate: "2023-07-10",
    endDate: "2023-07-12",
    reason: "Flu",
    status: "Pending",
    dateRequested: "2023-07-09",
  },
  {
    id: "3",
    employeeId: "13", // Susan Clark
    leaveType: "Bereavement Leave",
    startDate: "2023-08-05",
    endDate: "2023-08-10",
    reason: "Death in the family",
    status: "Pending",
    dateRequested: "2023-08-01",
  },
  {
    id: "4",
    employeeId: "4", // Jennifer Davis
    leaveType: "Birthday Leave",
    startDate: "2023-11-05",
    endDate: "2023-11-05",
    reason: "Birthday celebration",
    status: "Approved",
    dateRequested: "2023-10-20",
    dateReviewed: "2023-10-22",
    reviewedBy: "1", // HR Admin
  },
  {
    id: "5",
    employeeId: "14", // John Rodriguez
    leaveType: "Vacation Leave",
    startDate: "2023-09-15",
    endDate: "2023-09-20",
    reason: "Personal time off",
    status: "Rejected",
    dateRequested: "2023-08-30",
    dateReviewed: "2023-09-02",
    reviewedBy: "1", // HR Admin
    comments: "Insufficient leave balance",
  },
  {
    id: "6",
    employeeId: "3", // Michael Brown
    leaveType: "Sick Leave",
    startDate: "2023-10-01",
    endDate: "2023-10-03",
    reason: "Medical appointment",
    status: "Approved",
    dateRequested: "2023-09-25",
    dateReviewed: "2023-09-26",
    reviewedBy: "1", // HR Admin
  },
  {
    id: "7",
    employeeId: "5", // David Wilson
    leaveType: "Vacation Leave",
    startDate: "2023-12-20",
    endDate: "2023-12-31",
    reason: "Holiday vacation",
    status: "Pending",
    dateRequested: "2023-11-15",
  },
  {
    id: "8",
    employeeId: "9", // Richard Martinez
    leaveType: "Paternity Leave",
    startDate: "2023-10-10",
    endDate: "2023-10-17",
    reason: "Birth of child",
    status: "Approved",
    dateRequested: "2023-09-15",
    dateReviewed: "2023-09-16",
    reviewedBy: "1", // HR Admin
  },
]

// Sample leave balances by employee
const leaveBalancesByEmployee = [
  {
    employeeId: "6", // Sarah Anderson
    balances: [
      { type: "Vacation Leave", total: 15, used: 5, pending: 0, remaining: 10 },
      { type: "Sick Leave", total: 15, used: 2, pending: 0, remaining: 13 },
      { type: "Birthday Leave", total: 1, used: 0, pending: 0, remaining: 1 },
    ],
  },
  {
    employeeId: "7", // James Taylor
    balances: [
      { type: "Vacation Leave", total: 15, used: 8, pending: 0, remaining: 7 },
      { type: "Sick Leave", total: 15, used: 3, pending: 2, remaining: 10 },
      { type: "Birthday Leave", total: 1, used: 1, pending: 0, remaining: 0 },
    ],
  },
]

const LeaveManagement: React.FC = () => {
  const [segment, setSegment] = useState<"requests" | "balance" | "statistics" | "policies">("requests")
  const [searchText, setSearchText] = useState("")
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [filteredRequests, setFilteredRequests] = useState<LeaveRequest[]>([])
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [typeFilter, setTypeFilter] = useState<string>("all")
  const [departmentFilter, setDepartmentFilter] = useState<string>("all")
  const [dateFilter, setDateFilter] = useState<string>("all")
  const [showDatePopover, setShowDatePopover] = useState(false)
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: "",
    end: "",
  })
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequest | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [reviewComment, setReviewComment] = useState("")
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")
  const [reviewAction, setReviewAction] = useState<"approve" | "reject" | null>(null)
  const [selectedEmployee, setSelectedEmployee] = useState<string>("all")

  // Load leave requests from localStorage or use initial data
  useEffect(() => {
    const savedRequests = localStorage.getItem("hrims-leave-requests")
    if (savedRequests) {
      setLeaveRequests(JSON.parse(savedRequests))
    } else {
      setLeaveRequests(initialLeaveRequests)
    }
  }, [])

  // Save leave requests to localStorage when they change
  useEffect(() => {
    if (leaveRequests.length > 0) {
      localStorage.setItem("hrims-leave-requests", JSON.stringify(leaveRequests))
    }
  }, [leaveRequests])

  // Filter leave requests based on filters and search text
  useEffect(() => {
    let filtered = [...leaveRequests]

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter((request) => request.status.toLowerCase() === statusFilter.toLowerCase())
    }

    // Filter by leave type
    if (typeFilter !== "all") {
      filtered = filtered.filter((request) => request.leaveType === typeFilter)
    }

    // Filter by department
    if (departmentFilter !== "all") {
      filtered = filtered.filter((request) => {
        const employee = employees.find((emp) => emp.id === request.employeeId)
        return employee?.departmentId === departmentFilter
      })
    }

    // Filter by employee
    if (selectedEmployee !== "all") {
      filtered = filtered.filter((request) => request.employeeId === selectedEmployee)
    }

    // Filter by date range
    if (dateFilter === "custom" && dateRange.start && dateRange.end) {
      filtered = filtered.filter((request) => {
        const requestDate = new Date(request.dateRequested)
        const startDate = new Date(dateRange.start)
        const endDate = new Date(dateRange.end)
        return requestDate >= startDate && requestDate <= endDate
      })
    } else if (dateFilter === "thisMonth") {
      const now = new Date()
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)
      filtered = filtered.filter((request) => {
        const requestDate = new Date(request.dateRequested)
        return requestDate >= startOfMonth && requestDate <= endOfMonth
      })
    } else if (dateFilter === "lastMonth") {
      const now = new Date()
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0)
      filtered = filtered.filter((request) => {
        const requestDate = new Date(request.dateRequested)
        return requestDate >= startOfLastMonth && requestDate <= endOfLastMonth
      })
    } else if (dateFilter === "thisYear") {
      const now = new Date()
      const startOfYear = new Date(now.getFullYear(), 0, 1)
      const endOfYear = new Date(now.getFullYear(), 11, 31)
      filtered = filtered.filter((request) => {
        const requestDate = new Date(request.dateRequested)
        return requestDate >= startOfYear && requestDate <= endOfYear
      })
    }

    // Filter by search text
    if (searchText) {
      const searchLower = searchText.toLowerCase()
      filtered = filtered.filter((request) => {
        const employee = employees.find((emp) => emp.id === request.employeeId)
        return (
          employee?.firstName.toLowerCase().includes(searchLower) ||
          false ||
          employee?.lastName.toLowerCase().includes(searchLower) ||
          false ||
          request.leaveType.toLowerCase().includes(searchLower) ||
          request.reason.toLowerCase().includes(searchLower) ||
          request.status.toLowerCase().includes(searchLower)
        )
      })
    }

    // Sort by date requested (newest first)
    filtered.sort((a, b) => new Date(b.dateRequested).getTime() - new Date(a.dateRequested).getTime())

    setFilteredRequests(filtered)
  }, [leaveRequests, statusFilter, typeFilter, departmentFilter, dateFilter, dateRange, searchText, selectedEmployee])

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find((emp) => emp.id === employeeId)
    return employee ? `${employee.firstName} ${employee.lastName}` : "Unknown Employee"
  }

  const getEmployeeAvatar = (employeeId: string) => {
    const employee = employees.find((emp) => emp.id === employeeId)
    return employee?.profileImage || "https://ionicframework.com/docs/img/demos/avatar.svg"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "success"
      case "Rejected":
        return "danger"
      case "Pending":
        return "warning"
      default:
        return "medium"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Approved":
        return checkmarkCircle
      case "Rejected":
        return closeCircle
      case "Pending":
        return hourglassOutline
      default:
        return time
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const calculateDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    return diffDays
  }

  const handleViewRequest = (request: LeaveRequest) => {
    setSelectedRequest(request)
    setReviewComment(request.comments || "")
    setIsModalOpen(true)
  }

  const handleApproveRequest = () => {
    setReviewAction("approve")
    setShowAlert(true)
  }

  const handleRejectRequest = () => {
    setReviewAction("reject")
    setShowAlert(true)
  }

  const confirmReviewAction = () => {
    if (!selectedRequest || !reviewAction) return

    const updatedRequest: LeaveRequest = {
      ...selectedRequest,
      status: reviewAction === "approve" ? "Approved" : "Rejected",
      dateReviewed: new Date().toISOString().split("T")[0],
      reviewedBy: "1", // Current HR admin ID
      comments: reviewComment,
    }

    setLeaveRequests(leaveRequests.map((req) => (req.id === updatedRequest.id ? updatedRequest : req)))

    setAlertMessage(`Leave request ${reviewAction === "approve" ? "approved" : "rejected"} successfully`)
    setShowAlert(true)
    setIsModalOpen(false)
    setReviewAction(null)
  }

  const resetFilters = () => {
    setStatusFilter("all")
    setTypeFilter("all")
    setDepartmentFilter("all")
    setDateFilter("all")
    setSelectedEmployee("all")
    setSearchText("")
    setDateRange({ start: "", end: "" })
  }

  // Calculate statistics
  const totalRequests = leaveRequests.length
  const pendingRequests = leaveRequests.filter((req) => req.status === "Pending").length
  const approvedRequests = leaveRequests.filter((req) => req.status === "Approved").length
  const rejectedRequests = leaveRequests.filter((req) => req.status === "Rejected").length

  // Calculate leave type distribution
  const leaveTypeDistribution = leavePolicies.map((policy) => {
    const count = leaveRequests.filter((req) => req.leaveType === policy.leaveType).length
    return {
      type: policy.leaveType,
      count,
      percentage: totalRequests > 0 ? (count / totalRequests) * 100 : 0,
    }
  })

  // Get employee leave balances
  const getEmployeeLeaveBalances = (employeeId: string) => {
    const employeeBalances = leaveBalancesByEmployee.find((item) => item.employeeId === employeeId)
    return employeeBalances?.balances || []
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>Leave Management</IonTitle>
        </IonToolbar>
        <IonToolbar>
          <IonSegment value={segment} onIonChange={(e) => setSegment(e.detail.value as any)}>
            <IonSegmentButton value="requests">
              <IonLabel>Requests</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="balance">
              <IonLabel>Balance</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="statistics">
              <IonLabel>Statistics</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="policies">
              <IonLabel>Policies</IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {segment === "requests" && (
          <>
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Leave Requests</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonGrid>
                  <IonRow>
                    <IonCol size="12">
                      <IonSearchbar
                        value={searchText}
                        onIonChange={(e) => setSearchText(e.detail.value!)}
                        placeholder="Search by name, type, or reason"
                        animated
                      />
                    </IonCol>
                  </IonRow>

                  <IonRow>
                    <IonCol size="12" size-md="3">
                      <IonItem>
                        <IonLabel position="stacked">Status</IonLabel>
                        <IonSelect value={statusFilter} onIonChange={(e) => setStatusFilter(e.detail.value)}>
                          <IonSelectOption value="all">All Statuses</IonSelectOption>
                          <IonSelectOption value="pending">Pending</IonSelectOption>
                          <IonSelectOption value="approved">Approved</IonSelectOption>
                          <IonSelectOption value="rejected">Rejected</IonSelectOption>
                        </IonSelect>
                      </IonItem>
                    </IonCol>

                    <IonCol size="12" size-md="3">
                      <IonItem>
                        <IonLabel position="stacked">Leave Type</IonLabel>
                        <IonSelect value={typeFilter} onIonChange={(e) => setTypeFilter(e.detail.value)}>
                          <IonSelectOption value="all">All Types</IonSelectOption>
                          {leavePolicies.map((policy) => (
                            <IonSelectOption key={policy.id} value={policy.leaveType}>
                              {policy.leaveType}
                            </IonSelectOption>
                          ))}
                        </IonSelect>
                      </IonItem>
                    </IonCol>

                    <IonCol size="12" size-md="3">
                      <IonItem>
                        <IonLabel position="stacked">Employee</IonLabel>
                        <IonSelect value={selectedEmployee} onIonChange={(e) => setSelectedEmployee(e.detail.value)}>
                          <IonSelectOption value="all">All Employees</IonSelectOption>
                          {employees.map((employee) => (
                            <IonSelectOption key={employee.id} value={employee.id}>
                              {employee.firstName} {employee.lastName}
                            </IonSelectOption>
                          ))}
                        </IonSelect>
                      </IonItem>
                    </IonCol>

                    <IonCol size="12" size-md="3">
                      <IonItem>
                        <IonLabel position="stacked">Date Range</IonLabel>
                        <IonSelect value={dateFilter} onIonChange={(e) => setDateFilter(e.detail.value)}>
                          <IonSelectOption value="all">All Dates</IonSelectOption>
                          <IonSelectOption value="thisMonth">This Month</IonSelectOption>
                          <IonSelectOption value="lastMonth">Last Month</IonSelectOption>
                          <IonSelectOption value="thisYear">This Year</IonSelectOption>
                          <IonSelectOption value="custom">Custom Range</IonSelectOption>
                        </IonSelect>
                      </IonItem>
                      {dateFilter === "custom" && (
                        <IonButton
                          expand="block"
                          fill="outline"
                          size="small"
                          className="ion-margin-top"
                          onClick={() => setShowDatePopover(true)}
                        >
                          {dateRange.start && dateRange.end
                            ? `${formatDate(dateRange.start)} - ${formatDate(dateRange.end)}`
                            : "Select Date Range"}
                        </IonButton>
                      )}
                    </IonCol>
                  </IonRow>

                  <IonRow className="ion-margin-top">
                    <IonCol>
                      <IonButton size="small" fill="outline" onClick={resetFilters}>
                        <IonIcon slot="start" icon={close} />
                        Reset Filters
                      </IonButton>

                      <IonButton size="small" fill="outline" color="secondary" className="ion-margin-start">
                        <IonIcon slot="start" icon={download} />
                        Export
                      </IonButton>

                      <IonButton size="small" fill="outline" color="tertiary" className="ion-margin-start">
                        <IonIcon slot="start" icon={print} />
                        Print
                      </IonButton>
                    </IonCol>
                  </IonRow>
                </IonGrid>

                <div className="ion-margin-top">
                  <IonChip color="primary">
                    Total: {filteredRequests.length} request{filteredRequests.length !== 1 ? "s" : ""}
                  </IonChip>
                </div>
              </IonCardContent>
            </IonCard>

            {filteredRequests.length === 0 ? (
              <IonCard>
                <IonCardContent className="ion-text-center">
                  <p>No leave requests found matching your filters.</p>
                  <IonButton size="small" fill="outline" onClick={resetFilters}>
                    Reset Filters
                  </IonButton>
                </IonCardContent>
              </IonCard>
            ) : (
              <IonList>
                {filteredRequests.map((request) => (
                  <IonCard key={request.id} className="ion-margin">
                    <IonCardContent>
                      <IonGrid>
                        <IonRow className="ion-align-items-center">
                          <IonCol size="auto">
                            <IonAvatar>
                              <IonImg src={getEmployeeAvatar(request.employeeId)} alt="Employee" />
                            </IonAvatar>
                          </IonCol>
                          <IonCol>
                            <h2 className="ion-no-margin">{getEmployeeName(request.employeeId)}</h2>
                            <p className="ion-no-margin">{request.leaveType}</p>
                          </IonCol>
                          <IonCol size="auto">
                            <IonBadge color={getStatusColor(request.status)}>
                              <IonIcon icon={getStatusIcon(request.status)} /> {request.status}
                            </IonBadge>
                          </IonCol>
                        </IonRow>

                        <IonRow className="ion-margin-top">
                          <IonCol size="12" size-md="4">
                            <IonIcon icon={calendar} color="primary" /> Duration:
                            <div>
                              {formatDate(request.startDate)} - {formatDate(request.endDate)}
                            </div>
                            <div>({calculateDuration(request.startDate, request.endDate)} days)</div>
                          </IonCol>

                          <IonCol size="12" size-md="4">
                            <IonIcon icon={document} color="primary" /> Reason:
                            <div>{request.reason}</div>
                          </IonCol>

                          <IonCol size="12" size-md="4">
                            <IonIcon icon={time} color="primary" /> Request Date:
                            <div>{formatDate(request.dateRequested)}</div>
                            {request.dateReviewed && <div>Reviewed: {formatDate(request.dateReviewed)}</div>}
                          </IonCol>
                        </IonRow>

                        <IonRow className="ion-margin-top">
                          <IonCol>
                            <IonButton fill="outline" onClick={() => handleViewRequest(request)}>
                              <IonIcon slot="start" icon={eye} />
                              View Details
                            </IonButton>

                            {request.status === "Pending" && (
                              <>
                                <IonButton
                                  fill="outline"
                                  color="danger"
                                  className="ion-margin-start"
                                  onClick={() => {
                                    setSelectedRequest(request)
                                    setReviewComment("")
                                    handleRejectRequest()
                                  }}
                                >
                                  <IonIcon slot="start" icon={close} />
                                  Reject
                                </IonButton>
                                <IonButton
                                  fill="outline"
                                  color="success"
                                  className="ion-margin-start"
                                  onClick={() => {
                                    setSelectedRequest(request)
                                    setReviewComment("")
                                    handleApproveRequest()
                                  }}
                                >
                                  <IonIcon slot="start" icon={checkmark} />
                                  Approve
                                </IonButton>
                              </>
                            )}
                          </IonCol>
                        </IonRow>
                      </IonGrid>
                    </IonCardContent>
                  </IonCard>
                ))}
              </IonList>
            )}

            <IonPopover
              isOpen={showDatePopover}
              onDidDismiss={() => setShowDatePopover(false)}
              className="date-range-popover"
            >
              <IonContent>
                <IonItem>
                  <IonLabel>Start Date</IonLabel>
                  <IonDatetime
                    displayFormat="MMM DD, YYYY"
                    placeholder="Select Start Date"
                    value={dateRange.start}
                    onIonChange={(e) => setDateRange({ ...dateRange, start: e.detail.value! })}
                  />
                </IonItem>
                <IonItem>
                  <IonLabel>End Date</IonLabel>
                  <IonDatetime
                    displayFormat="MMM DD, YYYY"
                    placeholder="Select End Date"
                    value={dateRange.end}
                    min={dateRange.start}
                    onIonChange={(e) => setDateRange({ ...dateRange, end: e.detail.value! })}
                  />
                </IonItem>
                <IonButton
                  expand="block"
                  className="ion-margin"
                  onClick={() => setShowDatePopover(false)}
                  disabled={!dateRange.start || !dateRange.end}
                >
                  Apply Date Range
                </IonButton>
              </IonContent>
            </IonPopover>

            <IonFab vertical="bottom" horizontal="end" slot="fixed">
              <IonFabButton routerLink="/leave-request">
                <IonIcon icon={add} />
              </IonFabButton>
            </IonFab>
          </>
        )}

        {segment === "balance" && (
          <>
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Leave Balances</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonItem>
                  <IonLabel>Select Employee</IonLabel>
                  <IonSelect value={selectedEmployee} onIonChange={(e) => setSelectedEmployee(e.detail.value)}>
                    <IonSelectOption value="all">All Employees</IonSelectOption>
                    {employees.map((employee) => (
                      <IonSelectOption key={employee.id} value={employee.id}>
                        {employee.firstName} {employee.lastName}
                      </IonSelectOption>
                    ))}
                  </IonSelect>
                </IonItem>
              </IonCardContent>
            </IonCard>

            {selectedEmployee === "all" ? (
              // Show all employees' leave balances
              employees.map((employee) => {
                const balances = getEmployeeLeaveBalances(employee.id)
                if (balances.length === 0) return null

                return (
                  <IonCard key={employee.id}>
                    <IonCardHeader>
                      <IonGrid>
                        <IonRow className="ion-align-items-center">
                          <IonCol size="auto">
                            <IonAvatar>
                              <IonImg
                                src={employee.profileImage || "https://ionicframework.com/docs/img/demos/avatar.svg"}
                                alt={`${employee.firstName} ${employee.lastName}`}
                              />
                            </IonAvatar>
                          </IonCol>
                          <IonCol>
                            <IonCardTitle>
                              {employee.firstName} {employee.lastName}
                            </IonCardTitle>
                          </IonCol>
                        </IonRow>
                      </IonGrid>
                    </IonCardHeader>
                    <IonCardContent>
                      <IonList>
                        {balances.map((balance, index) => (
                          <IonItem key={index}>
                            <IonLabel>
                              <h2>{balance.type}</h2>
                              <p>
                                Total: {balance.total} days | Used: {balance.used} days | Pending: {balance.pending}{" "}
                                days
                              </p>
                              <IonProgressBar
                                value={(balance.used + balance.pending) / balance.total}
                                color={balance.remaining > 0 ? "success" : "danger"}
                              ></IonProgressBar>
                            </IonLabel>
                            <IonBadge slot="end" color={balance.remaining > 0 ? "success" : "danger"}>
                              {balance.remaining} days remaining
                            </IonBadge>
                          </IonItem>
                        ))}
                      </IonList>
                    </IonCardContent>
                  </IonCard>
                )
              })
            ) : (
              // Show selected employee's leave balances
              <IonCard>
                <IonCardHeader>
                  <IonGrid>
                    <IonRow className="ion-align-items-center">
                      <IonCol size="auto">
                        {(() => {
                          const employee = employees.find((emp) => emp.id === selectedEmployee)
                          return (
                            <IonAvatar>
                              <IonImg
                                src={employee?.profileImage || "https://ionicframework.com/docs/img/demos/avatar.svg"}
                                alt="Employee"
                              />
                            </IonAvatar>
                          )
                        })()}
                      </IonCol>
                      <IonCol>
                        <IonCardTitle>
                          {(() => {
                            const employee = employees.find((emp) => emp.id === selectedEmployee)
                            return employee ? `${employee.firstName} ${employee.lastName}` : "Employee"
                          })()}
                        </IonCardTitle>
                      </IonCol>
                    </IonRow>
                  </IonGrid>
                </IonCardHeader>
                <IonCardContent>
                  <IonList>
                    {getEmployeeLeaveBalances(selectedEmployee).map((balance, index) => (
                      <IonItem key={index}>
                        <IonLabel>
                          <h2>{balance.type}</h2>
                          <p>
                            Total: {balance.total} days | Used: {balance.used} days | Pending: {balance.pending} days
                          </p>
                          <IonProgressBar
                            value={(balance.used + balance.pending) / balance.total}
                            color={balance.remaining > 0 ? "success" : "danger"}
                          ></IonProgressBar>
                        </IonLabel>
                        <IonBadge slot="end" color={balance.remaining > 0 ? "success" : "danger"}>
                          {balance.remaining} days remaining
                        </IonBadge>
                      </IonItem>
                    ))}
                  </IonList>

                  <div className="ion-padding-top">
                    <IonButton expand="block" fill="outline" color="primary">
                      <IonIcon slot="start" icon={add} />
                      Adjust Leave Balance
                    </IonButton>
                  </div>
                </IonCardContent>
              </IonCard>
            )}
          </>
        )}

        {segment === "statistics" && (
          <>
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Leave Request Statistics</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonGrid>
                  <IonRow>
                    <IonCol size="12" size-md="4">
                      <div className="ion-text-center">
                        <IonIcon icon={statsChart} color="primary" style={{ fontSize: "48px" }} />
                        <h2>{totalRequests}</h2>
                        <p>Total Requests</p>
                      </div>
                    </IonCol>
                    <IonCol size="12" size-md="4">
                      <div className="ion-text-center">
                        <IonIcon icon={hourglassOutline} color="warning" style={{ fontSize: "48px" }} />
                        <h2>{pendingRequests}</h2>
                        <p>Pending</p>
                      </div>
                    </IonCol>
                    <IonCol size="12" size-md="4">
                      <div className="ion-text-center">
                        <IonIcon icon={checkmarkCircle} color="success" style={{ fontSize: "48px" }} />
                        <h2>{approvedRequests}</h2>
                        <p>Approved</p>
                      </div>
                    </IonCol>
                  </IonRow>
                </IonGrid>
              </IonCardContent>
            </IonCard>

            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Leave Type Distribution</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonList>
                  {leaveTypeDistribution.map((item, index) => (
                    <IonItem key={index}>
                      <IonLabel>
                        <h2>{item.type}</h2>
                        <IonProgressBar value={item.percentage / 100} color="primary"></IonProgressBar>
                      </IonLabel>
                      <IonBadge slot="end" color="primary">
                        {item.count} ({item.percentage.toFixed(1)}%)
                      </IonBadge>
                    </IonItem>
                  ))}
                </IonList>
              </IonCardContent>
            </IonCard>

            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Monthly Leave Trends</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <p className="ion-text-center">
                  Monthly leave request trends would be displayed here with a chart visualization.
                </p>
                <IonButton expand="block" fill="outline" color="tertiary">
                  <IonIcon slot="start" icon={download} />
                  Export Statistics Report
                </IonButton>
              </IonCardContent>
            </IonCard>
          </>
        )}

        {segment === "policies" && (
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Leave Policies</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonList>
                {leavePolicies.map((policy) => (
                  <IonItem key={policy.id}>
                    <IonLabel>
                      <h2>{policy.leaveType}</h2>
                      <p>{policy.description}</p>
                      <p>
                        Days Allowed: {policy.daysAllowed} | Requires Approval: {policy.requiresApproval ? "Yes" : "No"}{" "}
                        | Requires Documentation: {policy.requiresDocumentation ? "Yes" : "No"}
                      </p>
                    </IonLabel>
                  </IonItem>
                ))}
              </IonList>

              <div className="ion-padding-top">
                <IonButton expand="block" routerLink="/leave-policy-management">
                  <IonIcon slot="start" icon={create} />
                  Manage Leave Policies
                </IonButton>
              </div>
            </IonCardContent>
          </IonCard>
        )}

        {/* Leave Request Detail Modal */}
        <IonModal isOpen={isModalOpen} onDidDismiss={() => setIsModalOpen(false)}>
          <IonHeader>
            <IonToolbar color="primary">
              <IonTitle>Leave Request Details</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setIsModalOpen(false)}>
                  <IonIcon icon={close} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>

          <IonContent className="ion-padding">
            {selectedRequest && (
              <IonCard>
                <IonCardHeader>
                  <IonGrid>
                    <IonRow className="ion-align-items-center">
                      <IonCol size="auto">
                        <IonAvatar>
                          <IonImg src={getEmployeeAvatar(selectedRequest.employeeId)} alt="Employee" />
                        </IonAvatar>
                      </IonCol>
                      <IonCol>
                        <IonCardTitle>{getEmployeeName(selectedRequest.employeeId)}</IonCardTitle>
                      </IonCol>
                      <IonCol size="auto">
                        <IonBadge color={getStatusColor(selectedRequest.status)}>{selectedRequest.status}</IonBadge>
                      </IonCol>
                    </IonRow>
                  </IonGrid>
                </IonCardHeader>

                <IonCardContent>
                  <IonList lines="none">
                    <IonItem>
                      <IonLabel>
                        <h2>Leave Type</h2>
                        <p>{selectedRequest.leaveType}</p>
                      </IonLabel>
                    </IonItem>

                    <IonItem>
                      <IonLabel>
                        <h2>Duration</h2>
                        <p>
                          {formatDate(selectedRequest.startDate)} - {formatDate(selectedRequest.endDate)} (
                          {calculateDuration(selectedRequest.startDate, selectedRequest.endDate)} days)
                        </p>
                      </IonLabel>
                    </IonItem>

                    <IonItem>
                      <IonLabel>
                        <h2>Reason</h2>
                        <p>{selectedRequest.reason}</p>
                      </IonLabel>
                    </IonItem>

                    <IonItem>
                      <IonLabel>
                        <h2>Date Requested</h2>
                        <p>{formatDate(selectedRequest.dateRequested)}</p>
                      </IonLabel>
                    </IonItem>

                    {selectedRequest.dateReviewed && (
                      <IonItem>
                        <IonLabel>
                          <h2>Date Reviewed</h2>
                          <p>{formatDate(selectedRequest.dateReviewed)}</p>
                        </IonLabel>
                      </IonItem>
                    )}

                    <IonItem>
                      <IonLabel position="stacked">Comments</IonLabel>
                      <IonTextarea
                        value={reviewComment}
                        onIonChange={(e) => setReviewComment(e.detail.value!)}
                        placeholder="Add comments (optional)"
                        rows={4}
                        disabled={selectedRequest.status !== "Pending"}
                      />
                    </IonItem>
                  </IonList>
                </IonCardContent>
              </IonCard>
            )}
          </IonContent>

          {selectedRequest && selectedRequest.status === "Pending" && (
            <IonFooter>
              <IonToolbar>
                <IonGrid>
                  <IonRow>
                    <IonCol>
                      <IonButton expand="block" color="danger" onClick={handleRejectRequest}>
                        <IonIcon icon={close} slot="start" />
                        Reject
                      </IonButton>
                    </IonCol>
                    <IonCol>
                      <IonButton expand="block" color="success" onClick={handleApproveRequest}>
                        <IonIcon icon={checkmark} slot="start" />
                        Approve
                      </IonButton>
                    </IonCol>
                  </IonRow>
                </IonGrid>
              </IonToolbar>
            </IonFooter>
          )}
        </IonModal>

        {/* Alerts */}
        <IonAlert
          isOpen={showAlert && reviewAction !== null}
          onDidDismiss={() => setShowAlert(false)}
          header="Confirm Action"
          message={`Are you sure you want to ${reviewAction === "approve" ? "approve" : "reject"} this leave request?`}
          buttons={[
            {
              text: "Cancel",
              role: "cancel",
              handler: () => {
                setReviewAction(null)
              },
            },
            {
              text: "Confirm",
              handler: confirmReviewAction,
            },
          ]}
        />

        <IonAlert
          isOpen={showAlert && reviewAction === null}
          onDidDismiss={() => setShowAlert(false)}
          header="Notification"
          message={alertMessage}
          buttons={["OK"]}
        />
      </IonContent>
    </IonPage>
  )
}

export default LeaveManagement
