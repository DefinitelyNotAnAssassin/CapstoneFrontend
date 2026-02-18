import type React from "react"
import { useState, useEffect } from "react"
import { Redirect, Route } from "react-router-dom"
import { IonApp, IonRouterOutlet, IonSplitPane, IonLoading, setupIonicReact } from "@ionic/react"
import { IonReactRouter } from "@ionic/react-router"
import { useAuthContext } from "./services/AuthContext"
import EmployeeDirectory from "./pages/employee/EmployeeDirectory"
import EmployeeDetail from "./pages/employee/EmployeeDetail"
import EmployeeAdd from "./pages/employee/EmployeeAdd"
import FacultyLoading from "./pages/faculty/FacultyLoading"
import LeavePolicyManagement from "./pages/leave/LeavePolicyManagement"
import LeaveApproval from "./pages/leave/LeaveApproval"
import LeaveManagement from "./pages/leave/LeaveManagement"
import LeaveRequest from "./pages/leave/LeaveRequest"
import SignIn from "./pages/auth/SignIn"
import SignInDirect from "./pages/auth/SignInDirect"
import HRDashboard from "./pages/dashboard/HRDashboard"
import OrganizationManagement from "./pages/organization/OrganizationManagement"
import LeaveCreditManagement from "./pages/leave/LeaveCreditManagement"
import Reports from "./pages/Reports"
import AuditTrail from "./pages/audit-trail/AuditTrail"
import EmailOTP from "./pages/otp/EmailOTP"
import VerifyOTP from "./pages/otp/VerifyOTP"
import FirebaseSetup from "./pages/FirebaseSetup"
import AuthGuard from "./components/AuthGuard"
import { RoleProvider } from "./contexts/RoleContext"
import { AppSidebar } from "@components/layout"

// RBAC Management Pages
import RolesManagement from "./pages/rbac/RolesManagement"
import UserPermissions from "./pages/rbac/UserPermissions"

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css"

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css"
import "@ionic/react/css/structure.css"
import "@ionic/react/css/typography.css"

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/padding.css"
import "@ionic/react/css/float-elements.css"
import "@ionic/react/css/text-alignment.css"
import "@ionic/react/css/text-transformation.css"
import "@ionic/react/css/flex-utils.css"
import "@ionic/react/css/display.css"

/* Theme variables */
import "./theme/variables.css"
import { AuthProvider } from "./services/AuthContext"

setupIonicReact()

const AppContent: React.FC = () => {
  const { currentUser } = useAuthContext()
  

  return (
    <IonReactRouter>
      <IonSplitPane contentId="main-content" when="md">
        {/* Only show sidebar when user is authenticated */}
        {currentUser && <AppSidebar contentId="main-content" />}
        <IonRouterOutlet id="main-content">
              {/* Public routes */}
              <Route path="/sign-in" component={SignIn} exact={true} />
              <Route path="/sign-in-direct" component={SignInDirect} exact={true} />
              <Route path="/email-otp" component={EmailOTP} exact={true} />
              <Route path="/verify-otp" component={VerifyOTP} exact={true} />
              
              {/* Protected routes - available to all authenticated users */}
              <AuthGuard path="/hr-dashboard" component={HRDashboard} exact={true} />
              <AuthGuard path="/leave-request" component={LeaveRequest} exact={true} />
              
              {/* Role-based protected routes */}
              <AuthGuard 
                path="/leave-approval" 
                component={LeaveApproval} 
                requirePermission={['leave_approve_program', 'leave_approve_department', 'leave_approve_all']}
                exact={true} 
              />
              <AuthGuard 
                path="/employee-directory" 
                component={EmployeeDirectory} 
                exact={true} 
              />
              <AuthGuard 
                path="/employee-detail/:id" 
                component={EmployeeDetail} 
                requirePermission={['employee_view_all', 'employee_view_department', 'employee_view_team']}
                exact={true} 
              />
              <AuthGuard 
                path="/employee-add" 
                component={EmployeeAdd} 
                requirePermission={['employee_create', 'employee_edit_all']}
                exact={true} 
              />
              <AuthGuard 
                path="/organization-management" 
                component={OrganizationManagement} 
                requirePermission={['org_manage_departments', 'org_manage_programs', 'hr_full_access']}
                exact={true} 
              />
              <AuthGuard 
                path="/leave-policy-management" 
                component={LeavePolicyManagement} 
                requirePermission="leave_manage_policies"
                exact={true} 
              />
              <AuthGuard 
                path="/leave-credit-management" 
                component={LeaveCreditManagement} 
                requirePermission="leave_manage_credits"
                exact={true} 
              />
              <AuthGuard 
                path="/reports" 
                component={Reports} 
                requirePermission={['reports_view_team', 'reports_view_department', 'reports_view_all']}
                exact={true} 
              />
              <AuthGuard 
                path="/audit-trail" 
                component={AuditTrail} 
                requirePermission="audit_view"
                exact={true} 
              />
              
              {/* RBAC Management routes - HR only */}
              <AuthGuard 
                path="/roles-management" 
                component={RolesManagement} 
                requirePermission="rbac_manage_roles"
                exact={true} 
              />
              <AuthGuard 
                path="/user-permissions" 
                component={UserPermissions} 
                requirePermission="rbac_assign_roles"
                exact={true} 
              />
              
              {/* Utility routes */}
              <AuthGuard path="/leave-management" component={LeaveManagement} exact={true} />
              <AuthGuard path="/faculty-loading" component={FacultyLoading} exact={true} />
              <AuthGuard path="/firebase-setup" component={FirebaseSetup} exact={true} />
              
              {/* Default route */}
              <Route exact path="/" render={() => <Redirect to="/sign-in" />} />
            </IonRouterOutlet>
          </IonSplitPane>
        </IonReactRouter>
  )
}

const App: React.FC = () => (
  <IonApp>
    <AuthProvider>
      <RoleProvider>
        <AppContent />
      </RoleProvider>
    </AuthProvider>
  </IonApp>
)

export default App
