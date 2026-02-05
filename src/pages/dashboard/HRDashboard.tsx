"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { IonPage, IonContent, IonText, IonSpinner } from "@ionic/react"
import {
  calendarOutline,
  businessOutline,
  documentTextOutline,
  schoolOutline,
  statsChartOutline,
  listOutline,
  shieldOutline,
  peopleOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  hourglassOutline,
} from "ionicons/icons"
import { useHistory } from "react-router"
import { useAudit } from "../../hooks/useAudit"
import { useRole } from "@/contexts/RoleContext"
import AuthService from "@/services/AuthService"
import leaveService from "@/services/LeaveService"
import EmployeeService from "@/services/EmployeeService"
import { MainLayout } from "@components/layout/MainLayout"
import { WelcomeBanner } from "@components/dashboard//WelcomeBanner"
import { StatsCards } from "@components/dashboard//StatsCard"
import { LoadingState } from "@components/dashboard//LoadingState"
import { LogoutAlert } from "@components/dashboard//LogoutAlert"
import { QuickActions } from "@components/dashboard/QuickActions"
import { RecentActivity } from "@components/dashboard/RecentActivity"
import { UpcomingLeaves, Announcements } from "@components/dashboard/UpcomingLeaves"
import {
  LeaveBalanceChart,
  LeaveTypeBreakdownChart,
  RequestStatusChart,
  MonthlyTrendChart,
} from "@components/dashboard/LeaveCharts"

const HRDashboard: React.FC = () => {
  const history = useHistory()
  const { logEvent } = useAudit()
  // Use new RBAC properties
  const { 
    primaryRole,
    employee, 
    loading, 
    hasPermission, 
    refreshPermissions,
    canApprove,
    isHR,
    highestLevel 
  } = useRole()

  // State management
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

  // Use refs to prevent infinite loops and track component mount state
  const hasLoadedData = useRef(false)
  const isLoadingData = useRef(false)
  const isMounted = useRef(true)

  // Helper function to get current authenticated user
  const getCurrentAuthUser = () => {
    if (currentUser) return currentUser

    try {
      const storedAuthUser = localStorage.getItem("authUser")
      if (storedAuthUser) {
        return JSON.parse(storedAuthUser)
      }
    } catch (error) {
      console.error("Error parsing stored auth user:", error)
    }
    return null
  }

  // Fetch employee data from backend using authenticated user ID
  const fetchEmployeeFromBackend = async (authUserId: string) => {
    try {
      if (isMounted.current) setFetchingEmployeeData(true)
      console.log("Fetching employee data for auth user ID:", authUserId)

      const employeeData = await EmployeeService.getEmployeeByAuthId(authUserId)
      if (!isMounted.current) return null
      
      if (employeeData) {
        console.log("Fetched employee from backend:", employeeData)
        setCurrentEmployee(employeeData)

        // Store in localStorage for role context to pick up
        localStorage.setItem("employeeData", JSON.stringify(employeeData))

        return employeeData
      } else {
        console.warn("No employee found for auth user ID:", authUserId)
        return null
      }
    } catch (error) {
      console.error("Error fetching employee from backend:", error)
      return null
    } finally {
      if (isMounted.current) setFetchingEmployeeData(false)
    }
  }

  // Helper function to check if user has permission - now uses RBAC hasPermission
  const hasCurrentPermission = (permission: string): boolean => {
    return hasPermission(permission)
  }

  // Initialize authenticated user from localStorage on component mount
  useEffect(() => {
    isMounted.current = true
    hasLoadedData.current = false
    isLoadingData.current = false

    const initializeAuthUser = async () => {
      try {
        const storedAuthUser = localStorage.getItem("authUser")
        if (storedAuthUser && isMounted.current) {
          const authUser = JSON.parse(storedAuthUser)
          setCurrentUser(authUser)
          console.log("Initialized auth user:", authUser)

          // Fetch employee data from backend using auth user ID
          if (authUser.uid && authUser.isAuthenticated && isMounted.current) {
            await fetchEmployeeFromBackend(authUser.uid)
          }
        }
      } catch (error) {
        console.error("Error parsing stored auth user:", error)
      }
    }

    initializeAuthUser()

    // Cleanup function - mark component as unmounted
    return () => {
      isMounted.current = false
    }
  }, [])

  useEffect(() => {
    // Prevent infinite loops - don't load if already loaded or currently loading
    if (hasLoadedData.current || isLoadingData.current || !isMounted.current) {
      return
    }

    // Wait for all necessary data before loading dashboard
    const hasUserData = currentUser?.isAuthenticated
    const hasEmployeeData = currentEmployee || employee
    const isRoleContextReady = !loading

    console.log("Dashboard data check:", { hasUserData, hasEmployeeData, isRoleContextReady })

    if (hasUserData && hasEmployeeData && isRoleContextReady) {
      console.log("All data ready, loading dashboard...")
      // Store the effective employee without triggering re-render in this effect
      const effectiveEmployee = currentEmployee || employee
      if (!currentEmployee && employee) {
        setCurrentEmployee(employee)
      }
      loadDashboardData()
    }
  }, [currentUser, currentEmployee, employee, loading])

  // Separate effect to watch primaryRole changes
  useEffect(() => {
    // Only trigger a reload if we've already loaded data once and the role changes
    if (hasLoadedData.current && primaryRole) {
      console.log("User role changed after initial load, may need to update UI")
      setDashboardLoading(false)
    }
  }, [primaryRole])

  const loadDashboardData = async () => {
    // Prevent concurrent calls or calls after unmount
    if (isLoadingData.current || !isMounted.current) {
      console.log("Already loading data or component unmounted, skipping...")
      return
    }

    try {
      isLoadingData.current = true
      if (isMounted.current) setDashboardLoading(true)

      // Ensure we have current user data
      let authUser = getCurrentAuthUser()
      if (authUser) {
        setCurrentUser(authUser)
      }

      if (!authUser || !authUser.isAuthenticated) {
        console.warn("No authenticated user found")
        setDashboardLoading(false)
        isLoadingData.current = false
        return
      }

      // Use employee from context if currentEmployee is not set
      const employeeToUse = currentEmployee || employee
      if (!employeeToUse) {
        console.warn("No employee data found")
        setDashboardLoading(false)
        isLoadingData.current = false
        return
      }

      console.log(
        "Loading dashboard data for employee:",
        employeeToUse.firstName || employeeToUse.first_name,
        employeeToUse.lastName || employeeToUse.last_name
      )

      // Load user's own leave requests with detailed breakdown
      const myRequestsData = await leaveService.getMyLeaveRequests()
      if (!isMounted.current) return
      console.log("Loaded leave requests:", myRequestsData)
      setMyRequests(myRequestsData.length)

      // Count requests by status
      const approved = myRequestsData.filter((req) => req.status === "Approved").length
      const rejected = myRequestsData.filter((req) => req.status === "Rejected").length
      console.log("Request stats:", { total: myRequestsData.length, approved, rejected })
      setApprovedRequests(approved)
      setRejectedRequests(rejected)

      // Load leave credits for detailed balance information
      const creditsData = await leaveService.getMyLeaveCredits()
      if (!isMounted.current) return
      console.log("Loaded leave credits:", creditsData)

      // Store the detailed breakdown
      setLeaveCreditsBreakdown(creditsData)

      let totalCredits = 0
      let usedCredits = 0
      let remainingBalance = 0
      creditsData.forEach((credit) => {
        totalCredits += parseFloat(String(credit.total_credits)) || 0
        usedCredits += parseFloat(String(credit.used_credits)) || 0
        remainingBalance += parseFloat(String(credit.remaining_credits)) || 0
      })

      console.log("Credit calculations:", { totalCredits, usedCredits, remainingBalance })
      setTotalLeaveCredits(totalCredits)
      setUsedLeaveCredits(usedCredits)
      setLeaveBalance(remainingBalance)

      // For approvers, get pending requests count - use canApprove from RBAC
      if (canApprove && isMounted.current) {
        try {
          const approvalsData = await leaveService.getPendingApprovalsForMe()
          if (isMounted.current) {
            setPendingRequests(approvalsData.requests?.length || 0)
          }
        } catch (error) {
          console.error("Error loading pending approvals:", error)
          if (isMounted.current) setPendingRequests(0)
        }
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error)
      // Set default values on error
      if (isMounted.current) {
        setMyRequests(0)
        setApprovedRequests(0)
        setRejectedRequests(0)
        setLeaveBalance(0)
        setTotalLeaveCredits(0)
        setUsedLeaveCredits(0)
        setLeaveCreditsBreakdown([])
        setPendingRequests(0)
      }
    } finally {
      if (isMounted.current) {
        setDashboardLoading(false)
      }
      isLoadingData.current = false
      hasLoadedData.current = true
      console.log("Dashboard data loading complete")
    }
  }

  const handleLogout = async () => {
    try {
      // Get current user for logging
      const authUser = getCurrentAuthUser()

      // Log the logout event
      logEvent(
        authUser?.uid?.toString() || "unknown",
        authUser?.displayName ||
          authUser?.email ||
          (currentEmployee?.firstName + " " + currentEmployee?.lastName) ||
          "Unknown User",
        "Logout",
        "Authentication",
        "User logged out",
        "127.0.0.1",
        "success"
      )

      await AuthService.signOut()
      // Clear local state
      setCurrentUser(null)
      setCurrentEmployee(null)

      history.push("/sign-in")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  // Refresh dashboard data by re-fetching from backend
  const refreshDashboard = async () => {
    console.log("Manual refresh triggered")

    if (!isMounted.current) return

    // Reset the loaded flag to allow reload
    hasLoadedData.current = false
    isLoadingData.current = false

    setDashboardLoading(true)

    const authUser = getCurrentAuthUser()
    if (authUser?.uid && authUser.isAuthenticated) {
      // Re-fetch employee data
      const fetchedEmployee = await fetchEmployeeFromBackend(authUser.uid)

      // Refresh the role context as well
      if (fetchedEmployee && isMounted.current) {
        await refreshPermissions()
      }

      // Force reload dashboard data
      if (isMounted.current) {
        await loadDashboardData()
      }
    } else {
      console.warn("No authenticated user found for refresh")
      if (isMounted.current) setDashboardLoading(false)
    }
  }

  const navigateTo = (path: string, moduleName: string) => {
    // Get current user for logging
    const authUser = getCurrentAuthUser()

    // Log the navigation event
    logEvent(
      authUser?.uid?.toString() || currentEmployee?.id || "unknown",
      authUser?.displayName ||
        currentEmployee?.firstName + " " + currentEmployee?.lastName ||
        "Unknown User",
      "View",
      moduleName as any,
      `Navigated to ${moduleName} module`,
      "127.0.0.1",
      "success"
    )

    // Navigate to the page
    history.push(path)
  }


  // Get dashboard title based on role
  const getDashboardTitle = (): string => {
    // Use new RBAC properties
    const isHRUser = isHR || currentEmployee?.isHR || highestLevel === -1
    if (isHRUser) return "HR Dashboard"
    if (primaryRole?.code === "SYS_ADMIN") return "Admin Dashboard"
    if (highestLevel === 0) return "VPAA Dashboard"
    if (highestLevel === 1) return "Dean Dashboard"
    if (highestLevel === 2) return "Program Chair Dashboard"
    return "Employee Dashboard"
  }

  // Show loading state while waiting for role context or employee data
  if (loading || fetchingEmployeeData) {
    return (
      <LoadingState
        message="Loading dashboard..."
        submessage={
          loading
            ? "Loading role and permissions..."
            : fetchingEmployeeData
              ? "Fetching employee data..."
              : "Initializing your session..."
        }
      />
    )
  }

  // If not authenticated, redirect should happen from AuthGuard
  if (!currentUser?.isAuthenticated) {
    return (
      <LoadingState
        message="Checking authentication..."
        submessage="Please wait while we verify your credentials..."
      />
    )
  }

  // Prepare stats for display
  const dashboardStats = [
    {
      title: "Total Leave Balance",
      value: Math.round(leaveBalance * 10) / 10,
      icon: calendarOutline,
      color: "primary",
      description: "Days remaining",
    },
    {
      title: "Leave Requests",
      value: myRequests,
      icon: documentTextOutline,
      color: "warning",
      description: "Total submitted",
    },
    {
      title: "Approved",
      value: approvedRequests,
      icon: checkmarkCircleOutline,
      color: "success",
      description: "Requests approved",
    },
    {
      title: "Rejected",
      value: rejectedRequests,
      icon: closeCircleOutline,
      color: "danger",
      description: "Requests rejected",
    },
  ]

  // Use canApprove from RBAC
  if (canApprove || hasPermission("approveRequests")) {
    dashboardStats.push({
      title: "Pending Approvals",
      value: pendingRequests,
      icon: hourglassOutline,
      color: "secondary",
      description: "Awaiting your review",
    })
  }

  // Determine if user is HR - use isHR from RBAC
  const isHRUser = isHR || currentEmployee?.isHR || highestLevel === -1

  return (
    <MainLayout 
      title={getDashboardTitle()}
      showRefresh={true}
      onRefresh={refreshDashboard}
      isLoading={dashboardLoading} 
    >
      <div className="p-2 md:p-4 space-y-6">
        {/* Welcome Banner */}
        <WelcomeBanner
          userName={currentUser?.displayName?.split(" ")[0] || currentEmployee?.firstName || "User"}
          position={currentEmployee?.position_title || primaryRole?.name || "Employee"}
          department={currentEmployee?.department_name || "Department"}
          employeeId={currentEmployee?.employeeId || currentUser?.uid || "N/A"}
          profileImage={currentEmployee?.profileImage}
          isHRUser={isHRUser}
          isOnline={currentUser?.isAuthenticated || false}
        />

        {/* Quick Actions */}
        <QuickActions
          isHRUser={isHRUser}
          canApprove={canApprove}
          hasPermission={hasPermission}
        />

        {/* Stats Cards */}
        <StatsCards stats={dashboardStats} />

        {/* Charts Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-1 h-6 bg-purple-500 rounded-full"></span>
            Analytics & Insights
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Leave Balance Doughnut Chart */}
            <LeaveBalanceChart
              leaveCreditsBreakdown={leaveCreditsBreakdown}
              totalCredits={totalLeaveCredits}
              usedCredits={usedLeaveCredits}
            />

            {/* Leave Type Breakdown Bar Chart */}
            {leaveCreditsBreakdown.length > 0 && (
              <LeaveTypeBreakdownChart leaveCreditsBreakdown={leaveCreditsBreakdown} />
            )}

            {/* Request Status Distribution */}
            <RequestStatusChart
              approvedRequests={approvedRequests}
              rejectedRequests={rejectedRequests}
              pendingRequests={pendingRequests}
            />
          </div>
        </div>

        {/* Monthly Trend - Full Width */}
        <div className="mb-8">
          <MonthlyTrendChart />
        </div>

        {/* Bottom Section - Activity, Upcoming Leaves, Announcements */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <RecentActivity />

          {/* Upcoming Leaves */}
          <UpcomingLeaves />

          {/* Announcements */}
          <Announcements />
        </div>

        {/* Footer Stats Summary */}
        <div className="bg-gradient-to-r from-gray-800 to-gray-900 rounded-xl p-6 text-white">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-3xl font-bold text-blue-400">{totalLeaveCredits}</p>
              <p className="text-sm text-gray-400 mt-1">Total Credits</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-green-400">{Math.round(leaveBalance * 10) / 10}</p>
              <p className="text-sm text-gray-400 mt-1">Remaining</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-red-400">{usedLeaveCredits}</p>
              <p className="text-sm text-gray-400 mt-1">Used</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-amber-400">{myRequests}</p>
              <p className="text-sm text-gray-400 mt-1">Total Requests</p>
            </div>
          </div>
        </div>
      </div>

      {/* Logout Alert */}
      <LogoutAlert
        isOpen={showLogoutAlert}
        onClose={() => setShowLogoutAlert(false)}
        onConfirm={handleLogout}
      />
    </MainLayout>
  )
}

export default HRDashboard
