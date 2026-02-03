import type React from "react"
import { Redirect, Route } from "react-router-dom"
import { IonApp, IonRouterOutlet, setupIonicReact } from "@ionic/react"
import { IonReactRouter } from "@ionic/react-router"
import Home from "./pages/Home"
import EmployeeDirectory from "./pages/employee/EmployeeDirectory"
import EmployeeManagement from "./pages/employee/EmployeeManagement"
import EmployeeDetail from "./pages/employee/EmployeeDetail"
import EmployeeAdd from "./pages/employee/EmployeeAdd"
import Organization from "./pages/organization/Organization"
import FacultyLoading from "./pages/faculty/FacultyLoading"
import LeavePolicyManagement from "./pages/leave/LeavePolicyManagement"
import LeaveApproval from "./pages/leave/LeaveApproval"
import LeaveManagement from "./pages/leave/LeaveManagement"
import LeaveRequest from "./pages/leave/LeaveRequest"
import LeaveRequestNew from "./pages/leave/LeaveRequestNew"
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

const App: React.FC = () => (
  <IonApp>
    <AuthProvider>
      <RoleProvider>
        <IonReactRouter>
          <IonRouterOutlet id="main-content">
              {/* Public routes */}
              <Route path="/sign-in" component={SignIn} exact={true} />
              <Route path="/sign-in-direct" component={SignInDirect} exact={true} />
              <Route path="/email-otp" component={EmailOTP} exact={true} />
              <Route path="/verify-otp" component={VerifyOTP} exact={true} />
              <Route path="/home" component={Home} exact={true} />
              
              {/* Protected routes - available to all authenticated users */}
              <AuthGuard path="/hr-dashboard" component={HRDashboard} exact={true} />
              <AuthGuard path="/leave-request" component={LeaveRequest} exact={true} />
              
              {/* Role-based protected routes */}
              <AuthGuard 
                path="/leave-approval" 
                component={LeaveApproval} 
                requirePermission="approveRequests"
                exact={true} 
              />
              <AuthGuard 
                path="/employee-directory" 
                component={EmployeeDirectory} 
                exact={true} 
              />
              <AuthGuard 
                path="/employee-management" 
                component={EmployeeManagement} 
                exact={true} 
              />
              <AuthGuard 
                path="/employee-detail/:id" 
                component={EmployeeDetail} 
                requirePermission="manageEmployees"
                exact={true} 
              />
              <AuthGuard 
                path="/employee-add" 
                component={EmployeeAdd} 
                requirePermission="manageEmployees"
                exact={true} 
              />
              <AuthGuard 
                path="/organization-management" 
                component={OrganizationManagement} 
                requirePermission="manageEmployees"
                exact={true} 
              />
              <AuthGuard 
                path="/leave-policy-management" 
                component={LeavePolicyManagement} 
                requirePermission="manageLeavePolicies"
                exact={true} 
              />
              <AuthGuard 
                path="/leave-credit-management" 
                component={LeaveCreditManagement} 
                requirePermission="manageLeaveCredits"
                exact={true} 
              />
              <AuthGuard 
                path="/reports" 
                component={Reports} 
                requirePermission="viewReports"
                exact={true} 
              />
              <AuthGuard 
                path="/audit-trail" 
                component={AuditTrail} 
                requirePermission="viewReports"
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
              
              {/* Legacy routes - keeping for backwards compatibility */}
              <AuthGuard path="/organization" component={Organization} exact={true} />
              <AuthGuard path="/leave-management" component={LeaveManagement} exact={true} />
              <AuthGuard path="/faculty-loading" component={FacultyLoading} exact={true} />
              <AuthGuard path="/leave-request-new" component={LeaveRequestNew} exact={true} />
              <AuthGuard path="/firebase-setup" component={FirebaseSetup} exact={true} />
              
              {/* Default route */}
              <Route exact path="/" render={() => <Redirect to="/sign-in" />} />
            </IonRouterOutlet>
        </IonReactRouter>
      </RoleProvider>
    </AuthProvider>
  </IonApp>
)

export default App
