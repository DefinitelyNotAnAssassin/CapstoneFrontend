"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  IonContent,
  IonPage,
  IonInput,
  IonButton,
  IonLabel,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonAlert,
  IonIcon,
  IonText,
  IonLoading,
  IonImg,
} from "@ionic/react"
import { lockClosedOutline, mailOutline, logInOutline } from "ionicons/icons"
import { useHistory } from "react-router-dom"
import { useAudit } from "../hooks/useAudit"
import AuthService from "../services/AuthService"
import employeeService from "../services/EmployeeService"
import { applyFormStyles } from "../utils/formHelpers"
import "./SignIn.css"

const SignIn: React.FC = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const history = useHistory()
  const { logEvent } = useAudit()
    // Helper function to ensure navigation works consistently - merged implementation
  // Apply form styles on component mount
  useEffect(() => {
    applyFormStyles()
  }, [])
  
  // Utility function for robust navigation
  const navigateToDashboard = () => {
    console.log("Using robust navigation to dashboard")
    
    // Try multiple navigation methods
    try {
      // Method 1: Using history.push
      console.log("Trying history.push")
      history.push("/hr-dashboard")
      
      // Method 2: Using window.location as backup
      setTimeout(() => {
        console.log("Checking if navigation was successful")
        if (window.location.pathname !== "/hr-dashboard") {
          console.log("Navigation failed, using window.location")
          window.location.href = "#/hr-dashboard"  // Use hash routing format
        }
        setLoading(false)
      }, 300)
      
      // Method 3: Last resort, try Ionic navigation directly (after a longer delay)
      setTimeout(() => {
        if (window.location.pathname !== "/hr-dashboard") {
          console.log("Both navigation methods failed, trying direct hash change")
          window.location.hash = "/hr-dashboard"
          setLoading(false)
        }
      }, 600)
    } catch (navErr) {
      console.error("Navigation error:", navErr)
      // Ultimate fallback
      window.location.href = "#/hr-dashboard"
      setLoading(false)
    }
  }
    const handleLogin = async () => {
    // Simple validation
    if (!email || !password) {
      setAlertMessage("Please enter both email and password")
      setShowAlert(true)
      return
    }
    
    console.log("Starting login process...")
    setLoading(true)
    
    try {
      // Use the new AuthService to authenticate
      const user = await AuthService.signIn(email, password)
      console.log("Authentication successful:", user.uid)
      
      if (user && user.isAuthenticated) {
        // Log successful login
        const userId = user.uid;
        const username = user.displayName || user.email;
          
        logEvent(
          userId,
          username,
          "Login",
          "Authentication",
          "User logged in successfully via Django API",
          "127.0.0.1",
          "success"
        )
        
        console.log("Login successful, navigating to dashboard...")
        navigateToDashboard()
        return true
      } else {
        throw new Error("Authentication failed")
      }
    } catch (error: any) {
      console.error("Login error:", error)

      // Customize error message based on error type
      let errorMessage = "Invalid email or password"
      
      if (error.message?.includes("Invalid email or password")) {
        errorMessage = "Invalid email or password. Please check your credentials."
      } else if (error.message?.includes("Network")) {
        errorMessage = "Network error. Please check your internet connection."
      } else if (error.message?.includes("timed out")) {
        errorMessage = "Login timed out. Please try again."
      } else if (error.message) {
        errorMessage = error.message
      }

      // Log failed login attempt
      logEvent(
        "unknown",
        email,
        "Login",
        "Authentication",
        `Failed login attempt: ${errorMessage}`,
        "127.0.0.1",
        "failure",
      )
      
      // Set error message and show alert
      setAlertMessage(errorMessage);
      setShowAlert(true);
      setLoading(false);
      
      // Return false to indicate login failure
      return false;
    }
  }
        )
        
        console.log("Demo login successful, storing auth data and navigating to dashboard...")
        
        // Store demo admin authentication data
        const demoUser = {
          uid: "demo-admin-user-id",
          email: "admin@demo.com",
          displayName: "Admin User",
          emailVerified: true,
          isAnonymous: false,
          providerId: 'demo',
          isAuthenticated: true,
          authTimestamp: Date.now()
        };
        
        // Save to localStorage for persistent authentication
        localStorage.setItem('demoAdminUser', JSON.stringify(demoUser));
        
        // Use our local navigation function - it's more reliable
        navigateToDashboard();
        
        // Also try a direct approach as backup after a short delay
        setTimeout(() => {
          if (window.location.pathname !== "/hr-dashboard") {
            console.log("Local navigation may have failed, trying direct approach");
            window.location.href = "/hr-dashboard";
          }
        }, 1000);
        
        return true
      }
      
      // Try to authenticate with Firebase
      console.log("Attempting Firebase authentication...")
      const user = await AuthService.signIn(email, password)
      console.log("Authentication successful:", user.uid)
      
      if (user) {
        // Try to get employee record using auth ID or email
        console.log("Looking for employee with auth ID:", user.uid)
        let employee = null
        
        try {
          employee = await employeeService.getEmployeeByAuthId(user.uid)
        } catch (err) {
          console.log("Error finding employee by auth ID, will try email instead:", err)
        }

        // If not found by auth ID, try by email
        if (!employee) {
          console.log("Employee not found by auth ID, trying email:", email)
          try {
            employee = await employeeService.getEmployeeByEmail(email)
          } catch (err) {
            console.log("Error finding employee by email:", err)
          }
        }

        if (employee) {
          console.log("Employee found:", employee.id)
          
          // If the authUserId doesn't match, update it for future logins
          if (employee.authUserId !== user.uid) {
            console.log("Updating employee record with correct auth ID");
            try {
              // Create a copy of the employee record with the updated authUserId
              const updatedEmployee = {
                ...employee,
                authUserId: user.uid
              };
              
              // Update the employee record silently (don't wait for it to complete)
              employeeService.updateEmployee(
                updatedEmployee, 
                user.uid, 
                employee.firstName ? `${employee.firstName} ${employee.lastName}` : email
              ).catch(updateErr => {
                console.error("Failed to update employee auth ID:", updateErr);
              });
            } catch (updateErr) {
              console.error("Error preparing employee update:", updateErr);
            }
          }
        } else {
          console.log("No employee record found, but authentication successful")
          // Show an alert that the user is authenticated but not in employee database
          setAlertMessage("Your account is authenticated but not found in the employee database. Limited access granted.");
          setShowAlert(true);
        }// Log successful login
        const userId = employee?.id || user.uid;
        const username = employee?.firstName
          ? `${employee.firstName} ${employee.lastName}`
          : email;
          
        logEvent(
          userId,
          username,
          "Login",
          "Authentication",
          "User logged in successfully",
          "127.0.0.1",
          "success"
        )
        
        console.log("Login successful, navigating to dashboard...")
        // Navigate to dashboard using multiple approaches for reliability
        try {
          console.log("Attempting navigation to /hr-dashboard")
          history.push("/hr-dashboard")
          console.log("Navigation method called, checking if redirect happened...")
          
          // As a backup, also try direct location change after a short delay
          setTimeout(() => {
            if (window.location.pathname !== "/hr-dashboard") {
              console.log("Redirect didn't happen, trying direct location change")
              window.location.href = "/hr-dashboard"
            }
            setLoading(false)
          }, 500)
        } catch (navError) {
          console.error("Navigation error:", navError)
          // Fallback to direct location change
          window.location.href = "/hr-dashboard"
          setLoading(false)
        }
        
        return true
      }    } catch (error: any) {
      console.error("Login error:", error)

      // Customize error message based on error type
      let errorMessage = "Invalid email or password"
      
      if (error.code === "auth/configuration-not-found") {
        errorMessage = "Firebase authentication is not properly configured. Using demo mode."
        
        // If Firebase auth is misconfigured but using admin credentials, allow login
        if (email === "admin@demo.com" && password === "password") {
          console.log("Firebase misconfigured but using admin credentials, allowing login")
          
          // Log the login with configuration issue
          logEvent(
            "admin123",
            "Admin User",
            "Login",
            "Authentication",
            "Admin login via fallback due to Firebase configuration issue",
            "127.0.0.1",
            "success",
          )
          
          // Navigate to dashboard after a short delay
          setTimeout(() => {
            history.push("/hr-dashboard")
            setLoading(false)
          }, 800)
          
          return true
        }      } else if (error.code === "auth/user-not-found") {
        // Check if the email exists in our employee database even if Firebase auth doesn't have it
        try {
          const employeeExists = await employeeService.checkEmployeeExistsByEmail(email);
          if (employeeExists) {
            errorMessage = "Your account exists in the employee database but is not yet set up for authentication. Please contact an administrator.";
            // Log this specific case
            logEvent(
              "unknown",
              email,
              "Login",
              "Authentication",
              "Login failed: Employee exists in database but not in authentication system",
              "127.0.0.1",
              "failure"
            );
          } else {
            errorMessage = "No account found with this email address. Please verify your email.";
          }
        } catch (empErr) {
          console.error("Error checking employee database:", empErr);
          errorMessage = "No account found with this email address.";
        }
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Incorrect password. Please try again.";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email format. Please check your email address.";
      } else if (error.code === "auth/network-request-failed") {
        errorMessage = "Network error. Please check your internet connection.";
      } else if (error.message?.includes("timed out")) {
        errorMessage = "Login timed out. Please try again.";
      }

      // Log failed login attempt
      logEvent(
        "unknown",
        email,
        "Login",
        "Authentication",
        `Failed login attempt: ${errorMessage}`,
        "127.0.0.1",
        "failure",
      )      // Set error message and show alert
      setAlertMessage(errorMessage);
      setShowAlert(true);
      setLoading(false);
      
      // Return false to indicate login failure (don't throw error)
      return false;
    }
  }

  // Legacy login for demo purposes - to be removed in production
  const handleLegacyLogin = () => {
    if (email === "admin@demo.com" && password === "password") {
      setLoading(true);
      
      // Log successful login
      logEvent(
        "admin123",
        "Admin User",
        "Login",
        "Authentication",
        "Admin logged in via legacy method",
        "127.0.0.1",
        "success",
      )
      
      // Insert a small delay for loading effect
      setTimeout(() => {
        // Navigate to dashboard
        history.push("/hr-dashboard");
        setLoading(false);
      }, 800);
    } else {
      handleLogin() // Fall back to regular authentication
    }
  }

  return (
    <IonPage>
      <IonContent>
        <div className="signin-container">
          <div className="signin-center-wrapper">
            <div className="">
              <IonImg
                src="/sdca-logo.png"
                alt="SDCA Logo"
                className=""
              />
              <h1 className="signin-title">Human Resource Information Management System</h1>
              <p className="signin-subtitle">Sign in to access the HR management portal</p>
            </div>

            <IonCard className="signin-card">
              <IonCardHeader>
                <IonCardTitle className="ion-text-center">Sign In</IonCardTitle>
              </IonCardHeader>

              <IonCardContent className="signin-card-content">
                <form
                  className="signin-form"
                  onSubmit={(e) => {
                    e.preventDefault()
                    handleLogin()
                  }}
                >
                  <div className="form-group">
                    <div className="icon-wrapper">
                      <IonIcon icon={mailOutline} className="signin-icon" />
                      <IonLabel>Email Address</IonLabel>
                    </div>
                    <IonInput
                      type="email"
                      value={email}
                      onIonChange={(e) => setEmail(e.detail.value!)}
                      placeholder="Enter your email address"
                      required
                      className="signin-input"
                    />
                  </div>

                  <div className="form-group">
                    <div className="icon-wrapper">
                      <IonIcon icon={lockClosedOutline} className="signin-icon" />
                      <IonLabel>Password</IonLabel>
                    </div>
                    <IonInput
                      type="password"
                      value={password}
                      onIonChange={(e) => setPassword(e.detail.value!)}
                      placeholder="Enter your password"
                      required
                      className="signin-input"
                    />
                  </div>                  <IonButton
                    expand="block"
                    className="signin-button"                    onClick={async (e) => {
                      e.preventDefault();
                      
                      // DIRECT METHOD: Use our improved authentication for admin login
                      if (email === "admin@demo.com" && password === "password") {
                        console.log("Admin demo login detected, authenticating");
                        setLoading(true);
                        
                        try {
                          // Log successful admin login
                          logEvent(
                            "admin123",
                            "Admin User",
                            "Login", 
                            "Authentication",
                            "Admin logged in via direct sign-in button",
                            "127.0.0.1",
                            "success"
                          );
                          
                          // Import and use the authenticateDemoAdminAndNavigate function
                          const SignInDirect = await import('./SignInDirect');
                          if (SignInDirect.authenticateDemoAdminAndNavigate) {
                            SignInDirect.authenticateDemoAdminAndNavigate();
                          } else {
                            // Fallback to local authentication
                            const demoUser = {
                              uid: "demo-admin-user-id",
                              email: "admin@demo.com",
                              displayName: "Admin User",
                              emailVerified: true,
                              isAnonymous: false,
                              providerId: 'demo',
                              isAuthenticated: true,
                              authTimestamp: Date.now()
                            };
                            
                            localStorage.setItem('demoAdminUser', JSON.stringify(demoUser));
                            navigateToDashboard();
                          }
                        } catch (error) {
                          console.error("Error during admin authentication:", error);
                          // Ultimate fallback
                          window.location.href = '/hr-dashboard';
                        }
                        
                        return;
                      }
                      
                      // Handle validation first
                      if (!email || !password) {
                        setAlertMessage("Please enter both email and password");
                        setShowAlert(true);
                        return;
                      }
                      
                      // Special case for admin demo login
                      if (email === "admin@demo.com" && password === "password") {
                        console.log("Demo admin login detected, applying direct navigation");
                        setLoading(true);
                        
                        // Log the login event
                        logEvent(
                          "admin123",
                          "Admin User",
                          "Login",
                          "Authentication",
                          "Admin logged in via direct method",
                          "127.0.0.1",
                          "success"
                        );
                        
                        // Use a short timeout for UI feedback, then direct navigation
                        setTimeout(() => {
                          console.log("Direct navigation to dashboard for admin user");
                          window.location.href = "/hr-dashboard";
                        }, 500);
                        
                        return;
                      }
                        // Regular authentication flow
                      setLoading(true);
                      console.log("Starting regular authentication process...");
                      
                      // Use the proper handleLogin function with error handling
                      try {
                        handleLogin().catch(err => {
                          console.error("Login error caught:", err);
                          // The error alert is already set in the handleLogin function
                          setLoading(false);
                        });
                      } catch (err) {
                        console.error("Unexpected login error:", err);
                        setAlertMessage("An unexpected error occurred. Please try again.");
                        setShowAlert(true);
                        setLoading(false);
                      }
                    }}
                  >
                    <IonIcon icon={logInOutline} slot="start" />
                    Sign In
                  </IonButton>
                </form>                <div className="signin-footer">
                  <IonText color="medium">
                    <p>Use admin@demo.com/password for demo access</p>
                  </IonText>
                  <IonButton 
                    fill="clear" 
                    size="small"
                    onClick={() => {
                      setEmail("admin@demo.com");
                      setPassword("password");
                    }}
                  >
                    Use Demo Credentials
                  </IonButton>
                  
                  <div style={{ marginTop: "20px" }}>
                    <a href="/direct-dashboard">
                      <IonButton expand="block" color="secondary">
                        Direct Dashboard Access
                      </IonButton>
                    </a>
                  </div>
                </div>
              </IonCardContent>
            </IonCard>
          </div>
        </div>

        <IonLoading 
          isOpen={loading} 
          message="Authenticating and checking employee records... Please wait" 
          spinner="bubbles" 
        />        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header="Authentication Issue"
          message={alertMessage}
          buttons={[
            {
              text: 'OK',
              role: 'confirm',
              handler: () => {
                console.log('Alert acknowledged');
              }
            }
          ]}
          cssClass="authentication-alert"
        />
      </IonContent>
    </IonPage>
  )
}

export default SignIn
