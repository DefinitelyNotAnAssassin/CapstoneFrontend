"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonCardContent,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonButton,
  IonButtons,
  IonMenuButton,
  IonAvatar,
  IonItem,  IonLabel,
  IonBadge,
  IonList,
  IonListHeader,
  IonText,
  IonChip,
  IonSpinner,
  IonAlert,
  IonProgressBar,
  IonNote,
} from "@ionic/react"
import {
  peopleOutline,
  businessOutline,
  calendarOutline,
  documentTextOutline,
  schoolOutline,
  statsChartOutline,
  logOutOutline,
  alertCircleOutline,
  checkmarkCircleOutline,
  hourglassOutline,
  listOutline,
  shieldOutline,
  addOutline,
  eyeOutline,
  refreshOutline,
} from "ionicons/icons"
import { useHistory } from "react-router"
import { useAudit } from "../hooks/useAudit"
import { useRole } from "../contexts/RoleContext"
import AuthService from "../services/AuthService"
import leaveService from "../services/LeaveService"
import EmployeeService from "../services/EmployeeService"
import RoleDebugger from "../components/RoleDebugger"

const HRDashboard: React.FC = () => {
  const history = useHistory()
  const { logEvent } = useAudit()
  const { userRole, employee, loading, hasPermission } = useRole()
  const [pendingRequests, setPendingRequests] = useState(0)
  const [myRequests, setMyRequests] = useState(0)
  const [approvedRequests, setApprovedRequests] = useState(0)
  const [rejectedRequests, setRejectedRequests] = useState(0)
  const [leaveBalance, setLeaveBalance] = useState(0)
  const [totalLeaveCredits, setTotalLeaveCredits] = useState(0)
  const [usedLeaveCredits, setUsedLeaveCredits] = useState(0)
  const [leaveCreditsBreakdown, setLeaveCreditsBreakdown] = useState<any[]>([])
  const [dashboardLoading, setDashboardLoading] = useState(true)
  const [showLogoutAlert, setShowLogoutAlert] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [currentEmployee, setCurrentEmployee] = useState<any>(null)
  const [fetchingEmployeeData, setFetchingEmployeeData] = useState(false)

  // Helper function to get current authenticated user
  const getCurrentAuthUser = () => {
    if (currentUser) return currentUser
    
    try {
      const storedAuthUser = localStorage.getItem('authUser')
      if (storedAuthUser) {
        return JSON.parse(storedAuthUser)
      }
    } catch (error) {
      console.error('Error parsing stored auth user:', error)
    }
    return null
  }

  // Fetch employee data from backend using authenticated user ID
  const fetchEmployeeFromBackend = async (authUserId: string) => {
    try {
      setFetchingEmployeeData(true)
      console.log('Fetching employee data for auth user ID:', authUserId)
      
      const employeeData = await EmployeeService.getEmployeeByAuthId(authUserId)
      if (employeeData) {        console.log('Fetched employee from backend:', employeeData)
        setCurrentEmployee(employeeData)
        
        return employeeData
      } else {
        console.warn('No employee found for auth user ID:', authUserId)
        return null
      }
    } catch (error) {
      console.error('Error fetching employee from backend:', error)
      return null
    } finally {
      setFetchingEmployeeData(false)
    }
  }  // Helper function to check if user has permission (deprecated - use hasPermission from role context)
  const hasCurrentPermission = (permission: string): boolean => {
    return userRole?.permissions?.[permission as keyof typeof userRole.permissions] || false
  }
  // Initialize authenticated user from localStorage on component mount
  useEffect(() => {
    const initializeAuthUser = async () => {
      try {
        const storedAuthUser = localStorage.getItem('authUser')
        if (storedAuthUser) {
          const authUser = JSON.parse(storedAuthUser)
          setCurrentUser(authUser)
          console.log('Initialized auth user:', authUser)
          
          // Fetch employee data from backend using auth user ID
          if (authUser.uid && authUser.isAuthenticated) {
            await fetchEmployeeFromBackend(authUser.uid)
          }
        }      } catch (error) {
        console.error('Error parsing stored auth user:', error)
      }
    }

    initializeAuthUser()
  }, [])
    useEffect(() => {    console.log('useEffect triggered:', { 
      currentUser: !!currentUser, 
      currentEmployee: !!currentEmployee, 
      userRole: !!userRole,
      isAuthenticated: currentUser?.isAuthenticated
    })
    
    // Load dashboard data if we have user and employee data
    // Don't wait for role as it might be determined internally
    if (currentUser?.isAuthenticated && currentEmployee) {
      console.log('Loading dashboard data...')
      loadDashboardData()
    }
  }, [currentUser, currentEmployee, userRole])
  
  const loadDashboardData = async () => {
    try {
      setDashboardLoading(true)
      
      // Ensure we have current user data
      let authUser = getCurrentAuthUser()
      if (authUser) {
        setCurrentUser(authUser)
      }
      
      if (!authUser || !authUser.isAuthenticated) {
        console.warn('No authenticated user found')
        return
      }

      if (!currentEmployee) {
        console.warn('No employee data found')
        return
      }
        console.log('Loading dashboard data for employee:', currentEmployee.firstName, currentEmployee.lastName)
      
      // Load user's own leave requests with detailed breakdown
      const myRequestsData = await leaveService.getMyLeaveRequests()
      console.log('Loaded leave requests:', myRequestsData)
      setMyRequests(myRequestsData.length)
        // Count requests by status
      const approved = myRequestsData.filter(req => req.status === 'Approved').length
      const rejected = myRequestsData.filter(req => req.status === 'Rejected').length
      console.log('Request stats:', { total: myRequestsData.length, approved, rejected })
      setApprovedRequests(approved)
      setRejectedRequests(rejected)
        // Load leave credits for detailed balance information
      const creditsData = await leaveService.getMyLeaveCredits()
      console.log('Loaded leave credits:', creditsData)
      
      // Store the detailed breakdown
      setLeaveCreditsBreakdown(creditsData)
      
      let totalCredits = 0
      let usedCredits = 0
      let remainingBalance = 0
        creditsData.forEach(credit => {
        totalCredits += parseFloat(String(credit.total_credits)) || 0
        usedCredits += parseFloat(String(credit.used_credits)) || 0
        remainingBalance += parseFloat(String(credit.remaining_credits)) || 0
      })
      
      console.log('Credit calculations:', { totalCredits, usedCredits, remainingBalance })
      setTotalLeaveCredits(totalCredits)
      setUsedLeaveCredits(usedCredits)
      setLeaveBalance(remainingBalance)      // For approvers, get pending requests count
      if (userRole?.canApprove) {
        try {
          const approvalsData = await leaveService.getPendingApprovalsForMe()
          setPendingRequests(approvalsData.requests?.length || 0)
        } catch (error) {
          console.error('Error loading pending approvals:', error)
          setPendingRequests(0)
        }
      }} catch (error) {
      console.error('Error loading dashboard data:', error)
      // Set default values on error
      setMyRequests(0)
      setApprovedRequests(0)
      setRejectedRequests(0)
      setLeaveBalance(0)
      setTotalLeaveCredits(0)
      setUsedLeaveCredits(0)
      setLeaveCreditsBreakdown([])
      setPendingRequests(0)
    } finally {
      setDashboardLoading(false)
    }
  }
  
  const handleLogout = async () => {
    try {
      // Get current user for logging
      const authUser = getCurrentAuthUser()
      
      // Log the logout event
      logEvent(
        authUser?.uid?.toString() || 'unknown',
        authUser?.displayName || authUser?.email || (currentEmployee?.firstName + ' ' + currentEmployee?.lastName) || 'Unknown User',
        'Logout',
        'Authentication',
        'User logged out',
        '127.0.0.1',
        'success'
      )
      
      await AuthService.signOut()
        // Clear local state
      setCurrentUser(null)
      setCurrentEmployee(null)
      
      history.push('/sign-in')
    } catch (error) {
      console.error('Logout error:', error)
    }
  }  // Refresh dashboard data by re-fetching from backend
  const refreshDashboard = async () => {
    console.log('Manual refresh triggered')
    setDashboardLoading(true)
    
    const authUser = getCurrentAuthUser()
    if (authUser?.uid && authUser.isAuthenticated) {
      // Re-fetch employee data
      await fetchEmployeeFromBackend(authUser.uid)
      // Force reload dashboard data
      await loadDashboardData()
    } else {
      console.warn('No authenticated user found for refresh')
    }
    
    setDashboardLoading(false)
  }
  
  const navigateTo = (path: string, moduleName: string) => {
    // Get current user for logging
    const authUser = getCurrentAuthUser()
    
    // Log the navigation event
    logEvent(
      authUser?.uid?.toString() || currentEmployee?.id || 'unknown',
      authUser?.displayName || currentEmployee?.firstName + ' ' + currentEmployee?.lastName || 'Unknown User',
      'View',
      moduleName as any,
      `Navigated to ${moduleName} module`,
      '127.0.0.1',
      'success'
    )

    // Navigate to the page
    history.push(path)
  }  // Define role-based modules that should be visible
  const getAvailableModules = () => {
    const modules = []
    
    // Check if user is HR - HR users get access to all modules
    const isHRUser = currentEmployee?.isHR || userRole?.level === -1 || userRole?.title === 'HR Administrator'
    
    // Core modules available to everyone
    modules.push({
      title: "My Leave Requests",
      icon: calendarOutline,
      path: "/leave-request",
      color: "primary"
    })

    // Leave Approval - for users who can approve OR HR users
    if (userRole?.canApprove || hasPermission('approveRequests') || isHRUser) {
      modules.push({
        title: "Leave Approval",
        icon: documentTextOutline,
        path: "/leave-approval",
        color: "success"
      })
    }

    // Reports - for users with report viewing permissions OR HR users
    if (hasPermission('viewReports') || isHRUser) {
      modules.push({
        title: "Reports",
        icon: statsChartOutline,
        path: "/reports",
        color: "tertiary"
      })
    }

    // Employee Directory - for users who can manage employees OR HR users
    if (hasPermission('manageEmployees') || isHRUser) {
      modules.push({
        title: "Employee Directory",
        icon: peopleOutline,
        path: "/employee-directory",
        color: "primary"
      })

      modules.push({
        title: "Organization",
        icon: businessOutline,
        path: "/organization-management",
        color: "primary"
      })
    }

    // Leave Policies - for VPAA level users OR HR users
    if (hasPermission('manageLeavePolicies') || isHRUser) {
      modules.push({
        title: "Leave Policies",
        icon: listOutline,
        path: "/leave-policy-management",
        color: "secondary"
      })
    }

    // Audit Trail - for users with report permissions OR HR users
    if (hasPermission('viewReports') || isHRUser) {
      modules.push({
        title: "Audit Trail",
        icon: shieldOutline,
        path: "/audit-trail",
        color: "dark"
      })
    }

    // HR-specific modules (only for HR users)
    if (isHRUser) {
      modules.push({
        title: "Employee Management",
        icon: peopleOutline,
        path: "/employee-management",
        color: "warning"
      })

      modules.push({
        title: "Leave Credit Management",
        icon: calendarOutline,
        path: "/leave-credit-management",
        color: "secondary"
      })

      modules.push({
        title: "System Administration",
        icon: shieldOutline,
        path: "/system-administration",
        color: "danger"
      })
    }
    
    return modules
  }
  
  if (loading || fetchingEmployeeData || (!currentUser?.isAuthenticated)) {
    return (
      <IonPage>
        <IonContent className="ion-padding ion-text-center">
          <div style={{ marginTop: '50%' }}>
            <IonSpinner name="crescent" color="primary" />
            <IonText>
              <p>Loading dashboard...</p>
              <p style={{ fontSize: '14px', color: 'gray' }}>
                Initializing user session...
              </p>
            </IonText>
          </div>
        </IonContent>
      </IonPage>
    )
  }
  return (
    <IonPage>      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>          <IonTitle>
            {(() => {
              const isHRUser = currentEmployee?.isHR || userRole?.level === -1 || userRole?.title === 'HR Administrator'
              if (isHRUser) return 'HR Dashboard'
              if (userRole?.title === 'System Administrator') return 'Admin Dashboard'
              if (userRole?.level === 0) return 'VPAA Dashboard'
              if (userRole?.level === 1) return 'Dean Dashboard'
              if (userRole?.level === 2) return 'Program Chair Dashboard'
              return 'Employee Dashboard'
            })()}
          </IonTitle>
          <IonButtons slot="end">            <IonButton 
              fill="clear" 
              onClick={loadDashboardData}
              disabled={dashboardLoading}
            >
              {dashboardLoading ? (
                <IonSpinner name="crescent" />
              ) : (
                <IonIcon slot="icon-only" icon={refreshOutline} />
              )}
            </IonButton>
            <IonButton onClick={() => setShowLogoutAlert(true)}>
              <IonIcon slot="icon-only" icon={logOutOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>      <IonContent className="ion-padding dashboard-content">
        {/* Header Section */}
        <div className="dashboard-header">
          {/* Welcome Banner */}
          <IonCard className="welcome-banner">
            <IonCardContent>
              <IonGrid>
                <IonRow className="ion-align-items-center">
                  <IonCol size="auto">
                    <IonAvatar style={{ width: '70px', height: '70px' }}>
                      <img 
                        src={currentEmployee?.profileImage || "/placeholder.svg"} 
                        alt="User avatar" 
                      />
                    </IonAvatar>
                  </IonCol>
                  <IonCol>
                    <div className="welcome-text">
                      <h1>
                        Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, {currentUser?.displayName?.split(' ')[0] || currentEmployee?.firstName || 'User'}!
                      </h1>
                      <p className="position-title">
                        {currentEmployee?.position_title || userRole?.title || 'Employee'}
                      </p>
                      {userRole?.level !== 0 && (
                        <p className="department-info">
                          {currentEmployee?.department_name || 'Department'}
                        </p>
                      )}
                    </div>
                  </IonCol>
                  <IonCol size="auto" className="ion-text-end">
                    <div className="status-badges">
                      {(() => {
                        const isHRUser = currentEmployee?.isHR || userRole?.level === -1 || userRole?.title === 'HR Administrator'
                        return (
                          <>
                            {isHRUser && (
                              <IonChip color="warning" className="role-badge">
                                <IonLabel>HR Administrator</IonLabel>
                              </IonChip>
                            )}
                            <IonChip color={currentUser?.isAuthenticated ? "success" : "danger"} className="status-badge">
                              <IonLabel>
                                {currentUser?.isAuthenticated ? 'Online' : 'Offline'}
                              </IonLabel>
                            </IonChip>
                            <div className="employee-id">
                              ID: {currentEmployee?.employeeId || currentUser?.uid || 'N/A'}
                            </div>
                          </>
                        )
                      })()}
                    </div>
                  </IonCol>
                </IonRow>
              </IonGrid>
            </IonCardContent>
          </IonCard>
        </div>        {/* Main Dashboard Grid */}
        <IonGrid className="dashboard-main">
          <IonRow>
            {/* Left Column - Quick Actions & Leave Balance */}
            <IonCol size="12" sizeLg="8">
              {/* Quick Action Cards */}
              <div className="section">
                <div className="section-header">
                  <h2>Quick Actions</h2>
                  <p>Most frequently used features</p>
                </div>
                <IonGrid className="quick-actions-grid">
                  <IonRow>
                    <IonCol size="12" sizeMd="6">
                      <IonCard 
                        button 
                        onClick={() => navigateTo("/leave-request", "Leave Request")}
                        className="action-card primary-action"
                      >
                        <IonCardContent>
                          <div className="action-content">
                            <IonIcon icon={addOutline} />
                            <div className="action-text">
                              <h3>Request Leave</h3>
                              <p>Submit a new leave request</p>
                            </div>
                          </div>
                        </IonCardContent>
                      </IonCard>
                    </IonCol>
                    <IonCol size="12" sizeMd="6">
                      <IonCard 
                        button 
                        onClick={() => navigateTo("/leave-request", "Leave Request")}
                        className="action-card secondary-action"
                      >
                        <IonCardContent>
                          <div className="action-content">
                            <IonIcon icon={eyeOutline} />
                            <div className="action-text">
                              <h3>My Requests</h3>
                              <p>{dashboardLoading ? 'Loading...' : `${myRequests} total requests`}</p>
                            </div>
                          </div>
                        </IonCardContent>
                      </IonCard>
                    </IonCol>
                    {userRole?.canApprove && (
                      <IonCol size="12" sizeMd="6">
                        <IonCard 
                          button 
                          onClick={() => navigateTo("/leave-approval", "Leave Approval")}
                          className="action-card approval-action"
                        >
                          <IonCardContent>
                            <div className="action-content">
                              <IonIcon icon={documentTextOutline} />
                              <div className="action-text">
                                <h3>Pending Approvals</h3>
                                <p>{dashboardLoading ? 'Loading...' : `${pendingRequests} requests waiting`}</p>
                              </div>
                              {pendingRequests > 0 && !dashboardLoading && (
                                <IonBadge color="danger" className="pending-badge">
                                  {pendingRequests}
                                </IonBadge>
                              )}
                            </div>
                          </IonCardContent>
                        </IonCard>
                      </IonCol>
                    )}
                    <IonCol size="12" sizeMd="6">
                      <IonCard 
                        button 
                        onClick={() => navigateTo("/reports", "Reports")}
                        className="action-card reports-action"
                      >
                        <IonCardContent>
                          <div className="action-content">
                            <IonIcon icon={statsChartOutline} />
                            <div className="action-text">
                              <h3>Reports</h3>
                              <p>View analytics and insights</p>
                            </div>
                          </div>
                        </IonCardContent>
                      </IonCard>
                    </IonCol>
                  </IonRow>
                </IonGrid>
              </div>

              {/* Leave Balance Overview */}
              <div className="section">
                <div className="section-header">
                  <h2>Leave Balance Overview</h2>
                  <p>Your available leave credits for {new Date().getFullYear()}</p>
                </div>
                <IonCard className="leave-balance-card">
                  <IonCardContent>
                    <IonGrid>
                      <IonRow>
                        <IonCol size="12" sizeMd="4">
                          <div className="balance-stat available">
                            <div className="stat-value">
                              {dashboardLoading ? '...' : leaveBalance.toFixed(1)}
                            </div>
                            <div className="stat-label">Days Available</div>
                          </div>
                        </IonCol>
                        <IonCol size="12" sizeMd="4">
                          <div className="balance-stat used">
                            <div className="stat-value">
                              {dashboardLoading ? '...' : usedLeaveCredits.toFixed(1)}
                            </div>
                            <div className="stat-label">Days Used</div>
                          </div>
                        </IonCol>
                        <IonCol size="12" sizeMd="4">
                          <div className="balance-stat total">
                            <div className="stat-value">
                              {dashboardLoading ? '...' : totalLeaveCredits.toFixed(1)}
                            </div>
                            <div className="stat-label">Total Allocation</div>
                          </div>
                        </IonCol>
                      </IonRow>
                      <IonRow>
                        <IonCol size="12">
                          <div className="progress-section">
                            <div className="progress-header">
                              <span>Usage Progress</span>
                              <span>
                                {totalLeaveCredits > 0 ? Math.round((usedLeaveCredits / totalLeaveCredits) * 100) : 0}% used
                              </span>
                            </div>
                            <IonProgressBar
                              value={totalLeaveCredits > 0 ? usedLeaveCredits / totalLeaveCredits : 0}
                              color={
                                leaveBalance < 2 ? "danger" : 
                                leaveBalance < 5 ? "warning" : 
                                "success"
                              }
                              className="usage-progress"
                            />
                          </div>
                        </IonCol>
                      </IonRow>
                    </IonGrid>
                  </IonCardContent>
                </IonCard>
              </div>
            </IonCol>

            {/* Right Column - Statistics & Quick Info */}
            <IonCol size="12" sizeLg="4">
              {/* Statistics Cards */}
              <div className="section">
                <div className="section-header">
                  <h2>Statistics</h2>
                  <p>Your leave request overview</p>
                </div>
                <div className="stats-grid">
                  <IonCard className="stat-card success">
                    <IonCardContent>
                      <div className="stat-content">
                        <IonIcon icon={checkmarkCircleOutline} />
                        <div className="stat-info">
                          <div className="stat-number">{dashboardLoading ? '...' : approvedRequests}</div>
                          <div className="stat-text">Approved</div>
                        </div>
                      </div>
                    </IonCardContent>
                  </IonCard>

                  <IonCard className="stat-card warning">
                    <IonCardContent>
                      <div className="stat-content">
                        <IonIcon icon={hourglassOutline} />
                        <div className="stat-info">
                          <div className="stat-number">{dashboardLoading ? '...' : (myRequests - approvedRequests - rejectedRequests)}</div>
                          <div className="stat-text">Pending</div>
                        </div>
                      </div>
                    </IonCardContent>
                  </IonCard>

                  <IonCard className="stat-card danger">
                    <IonCardContent>
                      <div className="stat-content">
                        <IonIcon icon={alertCircleOutline} />
                        <div className="stat-info">
                          <div className="stat-number">{dashboardLoading ? '...' : rejectedRequests}</div>
                          <div className="stat-text">Rejected</div>
                        </div>
                      </div>
                    </IonCardContent>
                  </IonCard>

                  <IonCard className="stat-card info">
                    <IonCardContent>
                      <div className="stat-content">
                        <IonIcon icon={calendarOutline} />
                        <div className="stat-info">
                          <div className="stat-number">{dashboardLoading ? '...' : `${usedLeaveCredits.toFixed(1)}/${totalLeaveCredits.toFixed(1)}`}</div>
                          <div className="stat-text">Used/Total</div>
                        </div>
                      </div>
                    </IonCardContent>
                  </IonCard>
                </div>
              </div>
            </IonCol>
          </IonRow>
        </IonGrid>        {/* Available Modules Section */}
        <div className="section">
          <div className="section-header">
            <h2>Available Modules</h2>
            <p>Access your available features and tools</p>
          </div>
          <IonCard className="modules-card">
            <IonCardContent>
              <div className="modules-grid">
                {getAvailableModules().map((module, index) => (
                  <div key={index} className="module-item">
                    <IonCard 
                      button 
                      onClick={() => navigateTo(module.path, module.title)} 
                      className="module-card"
                    >
                      <IonCardContent>
                        <div className="module-content">
                          <IonIcon 
                            icon={module.icon} 
                            color={module.color}
                            className="module-icon"
                          />
                          <h4 className="module-title">{module.title}</h4>
                          {module.title === 'Leave Approval' && pendingRequests > 0 && !dashboardLoading && (
                            <IonBadge color="danger" className="module-badge">
                              {pendingRequests}
                            </IonBadge>
                          )}
                        </div>
                      </IonCardContent>
                    </IonCard>
                  </div>
                ))}
              </div>
            </IonCardContent>
          </IonCard>
        </div>        {/* Employee Profile & Leave Credits */}
        <IonGrid className="bottom-sections">
          <IonRow>
            {/* Employee Information */}
            <IonCol size="12" sizeLg="6" style={{ 
              display: (hasPermission('viewReports') || currentEmployee?.isHR || userRole?.level === -1) ? 'block' : 'none' 
            }}>
              <div className="section">
                <div className="section-header">
                  <h2>Profile Information</h2>
                  <p>Your employment details and permissions</p>
                </div>
                <IonCard className="profile-card">
                  <IonCardContent>
                    <div className="profile-grid">
                      <div className="profile-section">
                        <h4>Basic Information</h4>
                        <div className="info-list">
                          <div className="info-item">
                            <span>Employee ID:</span>
                            <span>{employee?.employee_id || currentEmployee?.employeeId || 'Not assigned'}</span>
                          </div>
                          <div className="info-item">
                            <span>Full Name:</span>
                            <span>{currentUser?.displayName || employee?.full_name || 'Not specified'}</span>
                          </div>
                          <div className="info-item">
                            <span>Email:</span>
                            <span>{currentUser?.email || employee?.email || 'Not specified'}</span>
                          </div>
                          <div className="info-item">
                            <span>Position:</span>
                            <span>{employee?.position_title || currentEmployee?.position_title || 'Not specified'}</span>
                          </div>
                          <div className="info-item">
                            <span>Department:</span>
                            <span>{employee?.department_name || currentEmployee?.department_name || 'Not specified'}</span>
                          </div>
                        </div>
                      </div>
                      
                      {Object.entries(userRole?.permissions || {}).some(([_, hasAccess]) => hasAccess) && (
                        <div className="profile-section">
                          <h4>Permissions</h4>
                          <div className="permissions-list">
                            {(currentEmployee?.isHR || userRole?.level === -1) ? (
                              <IonChip color="warning" className="permission-chip">
                                <IonLabel>Full HR Administrative Access</IonLabel>
                              </IonChip>
                            ) : (
                              Object.entries(userRole?.permissions || {}).map(([permission, hasAccess]) => (
                                hasAccess && (
                                  <IonChip key={permission} color="primary" className="permission-chip">
                                    <IonLabel>
                                      {permission.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                                    </IonLabel>
                                  </IonChip>
                                )
                              ))
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </IonCardContent>
                </IonCard>
              </div>
            </IonCol>

            {/* Leave Types Breakdown */}
            <IonCol size="12" sizeLg="6">
              <div className="section">
                <div className="section-header">
                  <h2>Leave Types Breakdown</h2>
                  <p>Detailed view of your leave entitlements</p>
                </div>
                <IonCard className="leave-breakdown-card">
                  <IonCardContent>
                    {leaveCreditsBreakdown.length === 0 ? (
                      <div className="empty-state">
                        <IonIcon icon={calendarOutline} />
                        <h3>No leave credits data available</h3>
                        <p>Contact HR if you believe this is an error</p>
                      </div>
                    ) : (
                      <div className="leave-types-list">
                        {leaveCreditsBreakdown.map((credit, index) => (
                          <div key={index} className="leave-type-item">
                            <div className="leave-type-header">
                              <h4>{credit.leave_type}</h4>
                              <IonBadge 
                                color={parseFloat(String(credit.remaining_credits)) < 2 ? "danger" : parseFloat(String(credit.remaining_credits)) < 5 ? "warning" : "success"}
                              >
                                {parseFloat(String(credit.remaining_credits)).toFixed(1)} left
                              </IonBadge>
                            </div>
                            
                            <div className="leave-type-stats">
                              <div className="stat-row">
                                <div className="stat">
                                  <span className="value">{parseFloat(String(credit.total_credits)).toFixed(1)}</span>
                                  <span className="label">Total</span>
                                </div>
                                <div className="stat">
                                  <span className="value used">{parseFloat(String(credit.used_credits)).toFixed(1)}</span>
                                  <span className="label">Used</span>
                                </div>
                                <div className="stat">
                                  <span className="value available">{parseFloat(String(credit.remaining_credits)).toFixed(1)}</span>
                                  <span className="label">Available</span>
                                </div>
                              </div>
                            </div>
                            
                            <div className="leave-progress">
                              <IonProgressBar
                                value={parseFloat(String(credit.used_credits)) / parseFloat(String(credit.total_credits))}
                                color={parseFloat(String(credit.remaining_credits)) < 2 ? "danger" : parseFloat(String(credit.remaining_credits)) < 5 ? "warning" : "success"}
                              />
                              <span className="progress-text">
                                {Math.round((parseFloat(String(credit.used_credits)) / parseFloat(String(credit.total_credits))) * 100) || 0}% utilized
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </IonCardContent>
                </IonCard>
              </div>
            </IonCol>
          </IonRow>
        </IonGrid>        {/* Role Debug Information (Development Only) */}
        {process.env.NODE_ENV === 'development' && (
          <RoleDebugger />
        )}

        {/* Logout Confirmation Alert */}
        <IonAlert
          isOpen={showLogoutAlert}
          onDidDismiss={() => setShowLogoutAlert(false)}
          header={'Confirm Logout'}
          message={'Are you sure you want to logout?'}
          buttons={[
            {
              text: 'Cancel',
              role: 'cancel',
              cssClass: 'secondary'
            },
            {
              text: 'Logout',
              handler: handleLogout
            }
          ]}
        />
      </IonContent>      <style>{`
        /* Dashboard Content */
        .dashboard-content {
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          min-height: 100vh;
        }

        /* Header Section */
        .dashboard-header {
          margin-bottom: 24px;
        }

        /* Welcome Banner */
        .welcome-banner {
          background: linear-gradient(135deg, var(--ion-color-primary) 0%, var(--ion-color-primary-shade) 100%);
          color: white;
          --color: white;
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .welcome-text h1 {
          font-size: 1.8rem;
          font-weight: 700;
          margin: 0 0 8px 0;
          color: white;
        }

        .position-title {
          font-size: 1.1rem;
          font-weight: 500;
          margin: 0 0 4px 0;
          opacity: 0.9;
        }

        .department-info {
          font-size: 0.95rem;
          margin: 0;
          opacity: 0.8;
        }

        .status-badges {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 8px;
        }

        .role-badge, .status-badge {
          font-size: 0.8rem;
          font-weight: 500;
        }

        .employee-id {
          font-size: 0.8rem;
          opacity: 0.8;
          margin-top: 4px;
        }

        /* Section Styling */
        .section {
          margin-bottom: 32px;
        }

        .section-header {
          margin-bottom: 16px;
        }

        .section-header h2 {
          font-size: 1.4rem;
          font-weight: 600;
          margin: 0 0 4px 0;
          color: var(--ion-color-dark);
        }

        .section-header p {
          font-size: 0.9rem;
          color: var(--ion-color-medium);
          margin: 0;
        }

        /* Quick Actions Grid */
        .quick-actions-grid {
          margin: 0;
        }

        .action-card {
          border-radius: 12px;
          transition: all 0.3s ease;
          --box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
          height: 100%;
        }

        .action-card:hover {
          transform: translateY(-4px);
          --box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
        }

        .action-content {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 20px;
        }

        .action-content ion-icon {
          font-size: 42px;
          min-width: 42px;
        }

        .action-text h3 {
          font-size: 1.2rem;
          font-weight: 600;
          margin: 0 0 4px 0;
          color: var(--ion-color-dark);
        }

        .action-text p {
          font-size: 0.9rem;
          color: var(--ion-color-medium);
          margin: 0;
        }

        .primary-action {
          border-left: 4px solid var(--ion-color-primary);
        }

        .secondary-action {
          border-left: 4px solid var(--ion-color-secondary);
        }

        .approval-action {
          border-left: 4px solid var(--ion-color-warning);
          position: relative;
        }

        .reports-action {
          border-left: 4px solid var(--ion-color-tertiary);
        }

        .pending-badge {
          position: absolute;
          top: 12px;
          right: 12px;
          z-index: 10;
        }

        /* Leave Balance Card */
        .leave-balance-card {
          border-radius: 12px;
          border-left: 5px solid var(--ion-color-primary);
          --box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
        }

        .balance-stat {
          text-align: center;
          padding: 16px;
          border-radius: 8px;
          background: var(--ion-color-light);
          margin: 8px;
        }

        .balance-stat.available .stat-value {
          color: var(--ion-color-success);
        }

        .balance-stat.used .stat-value {
          color: var(--ion-color-warning);
        }

        .balance-stat.total .stat-value {
          color: var(--ion-color-primary);
        }

        .stat-value {
          font-size: 2.2rem;
          font-weight: 700;
          display: block;
          line-height: 1;
        }

        .stat-label {
          font-size: 0.9rem;
          color: var(--ion-color-medium);
          margin-top: 8px;
          display: block;
          font-weight: 500;
        }

        .progress-section {
          margin-top: 20px;
          padding: 0 8px;
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--ion-color-dark);
        }

        .usage-progress {
          height: 10px;
          border-radius: 5px;
        }

        /* Statistics Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
        }

        .stat-card {
          border-radius: 12px;
          transition: all 0.2s ease;
          --box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .stat-card:hover {
          transform: translateY(-2px);
          --box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
        }

        .stat-card.success {
          border-left: 4px solid var(--ion-color-success);
        }

        .stat-card.warning {
          border-left: 4px solid var(--ion-color-warning);
        }

        .stat-card.danger {
          border-left: 4px solid var(--ion-color-danger);
        }

        .stat-card.info {
          border-left: 4px solid var(--ion-color-tertiary);
        }

        .stat-content {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
        }

        .stat-content ion-icon {
          font-size: 28px;
          min-width: 28px;
        }

        .stat-info {
          flex: 1;
        }

        .stat-number {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--ion-color-dark);
          line-height: 1;
        }

        .stat-text {
          font-size: 0.8rem;
          color: var(--ion-color-medium);
          margin-top: 2px;
        }

        /* Modules Section */
        .modules-card {
          border-radius: 12px;
          border-left: 5px solid var(--ion-color-tertiary);
          --box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
        }

        .modules-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 12px;
        }

        .module-card {
          border-radius: 8px;
          transition: all 0.2s ease;
          --box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
          position: relative;
        }

        .module-card:hover {
          transform: translateY(-2px);
          --box-shadow: 0 6px 20px rgba(0, 0, 0, 0.1);
        }

        .module-content {
          text-align: center;
          padding: 16px 8px;
          position: relative;
        }

        .module-icon {
          font-size: 28px;
          margin-bottom: 8px;
        }

        .module-title {
          font-size: 0.85rem;
          font-weight: 600;
          margin: 0;
          color: var(--ion-color-dark);
          line-height: 1.2;
        }

        .module-badge {
          position: absolute;
          top: 8px;
          right: 8px;
          z-index: 10;
          font-size: 0.7rem;
        }

        /* Profile Section */
        .profile-card {
          border-radius: 12px;
          border-left: 5px solid var(--ion-color-secondary);
          --box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
        }

        .profile-grid {
          display: grid;
          gap: 24px;
        }

        .profile-section h4 {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--ion-color-primary);
          margin: 0 0 12px 0;
          padding-bottom: 8px;
          border-bottom: 2px solid var(--ion-color-light);
        }

        .info-list {
          display: grid;
          gap: 8px;
        }

        .info-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid var(--ion-color-light-tint);
        }

        .info-item:last-child {
          border-bottom: none;
        }

        .info-item span:first-child {
          font-weight: 500;
          color: var(--ion-color-medium);
          font-size: 0.9rem;
        }

        .info-item span:last-child {
          color: var(--ion-color-dark);
          font-weight: 500;
          text-align: right;
          max-width: 60%;
          word-break: break-word;
        }

        .permissions-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .permission-chip {
          font-size: 0.75rem;
          height: 24px;
        }

        /* Leave Breakdown Section */
        .leave-breakdown-card {
          border-radius: 12px;
          border-left: 5px solid var(--ion-color-warning);
          --box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
        }

        .leave-types-list {
          display: grid;
          gap: 16px;
        }

        .leave-type-item {
          background: var(--ion-color-light);
          border-radius: 8px;
          padding: 16px;
          border: 1px solid var(--ion-color-light-shade);
        }

        .leave-type-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .leave-type-header h4 {
          font-size: 1rem;
          font-weight: 600;
          margin: 0;
          color: var(--ion-color-dark);
        }

        .leave-type-stats {
          margin-bottom: 12px;
        }

        .stat-row {
          display: flex;
          justify-content: space-between;
          gap: 8px;
        }

        .stat {
          text-align: center;
          flex: 1;
        }

        .stat .value {
          display: block;
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--ion-color-dark);
        }

        .stat .value.used {
          color: var(--ion-color-warning);
        }

        .stat .value.available {
          color: var(--ion-color-success);
        }

        .stat .label {
          font-size: 0.8rem;
          color: var(--ion-color-medium);
          margin-top: 2px;
        }

        .leave-progress {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .leave-progress ion-progress-bar {
          flex: 1;
          height: 6px;
          border-radius: 3px;
        }

        .progress-text {
          font-size: 0.8rem;
          color: var(--ion-color-medium);
          min-width: 60px;
          text-align: right;
        }

        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 32px 16px;
          color: var(--ion-color-medium);
        }

        .empty-state ion-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .empty-state h3 {
          font-size: 1.1rem;
          margin: 0 0 8px 0;
        }

        .empty-state p {
          font-size: 0.9rem;
          margin: 0;
        }

        /* Bottom sections spacing */
        .bottom-sections {
          margin-top: 32px;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .dashboard-content {
            padding: 12px;
          }

          .welcome-text h1 {
            font-size: 1.5rem;
          }

          .action-content {
            flex-direction: column;
            text-align: center;
            gap: 12px;
            padding: 16px;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .modules-grid {
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          }

          .profile-grid {
            grid-template-columns: 1fr;
          }

          .stat-row {
            flex-direction: column;
            gap: 12px;
          }
        }

        @media (min-width: 1200px) {
          .modules-grid {
            grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          }
        }
      `}</style>
    </IonPage>
  )
}

export default HRDashboard
