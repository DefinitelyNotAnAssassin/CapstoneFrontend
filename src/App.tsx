import type React from "react"
import { Redirect, Route } from "react-router-dom"
import { IonApp, IonRouterOutlet, setupIonicReact } from "@ionic/react"
import { IonReactRouter } from "@ionic/react-router"
import Home from "./pages/Home"
import EmployeeDirectory from "./pages/EmployeeDirectory"
import EmployeeManagement from "./pages/EmployeeManagement"
import EmployeeDetail from "./pages/EmployeeDetail"
import EmployeeAdd from "./pages/EmployeeAdd"
import Organization from "./pages/Organization"
import LeavePolicyManagement from "./pages/LeavePolicyManagement"
import LeaveApproval from "./pages/LeaveApproval"
import LeaveApprovalNew from "./pages/LeaveApprovalNew"
import LeaveManagement from "./pages/LeaveManagement"
import FacultyLoading from "./pages/FacultyLoading"
import LeaveRequest from "./pages/LeaveRequest"
import LeaveRequestNew from "./pages/LeaveRequestNew"
import SignIn from "./pages/SignIn"
import SignInDirect from "./pages/SignInDirect"
import HRDashboard from "./pages/HRDashboard"
import OrganizationManagement from "./pages/OrganizationManagement"
import LeaveCreditManagement from "./pages/LeaveCreditManagement"
import Reports from "./pages/Reports"
import AuditTrail from "./pages/AuditTrail"
import EmailOTP from "./pages/EmailOTP"
import VerifyOTP from "./pages/VerifyOTP"
import FirebaseSetup from "./pages/FirebaseSetup"
import AuthGuard from "./components/AuthGuard"
import { RoleProvider } from "./contexts/RoleContext"

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
          <IonRouterOutlet>
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
            
            {/* Legacy routes - keeping for backwards compatibility */}
            <AuthGuard path="/organization" component={Organization} exact={true} />
            <AuthGuard path="/leave-approval-new" component={LeaveApprovalNew} exact={true} />
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
