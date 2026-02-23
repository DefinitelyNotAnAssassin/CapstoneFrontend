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
import { useAudit } from "../../hooks/useAudit"
import AuthService from "../../services/AuthService"
import employeeService from "../../services/EmployeeService"
import { applyFormStyles } from "../../utils/formHelpers"
import { useAuthContext } from "../../services/AuthContext"
import { requestFCMToken } from "../../config/firebase"
import { doc, setDoc } from "firebase/firestore"
import { db } from "../../config/firebase"
import "./SignIn.css"

const SignIn: React.FC = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")
  const [loading, setLoading] = useState(false)
  const history = useHistory()
  const { logEvent } = useAudit()
  const { currentUser, loading: authLoading } = useAuthContext()

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && currentUser) {
      console.log("User already authenticated, redirecting to dashboard...");
      history.replace("/hr-dashboard")
    }
  }, [currentUser, authLoading, history])

  // Apply form styles on component mount
  useEffect(() => {
    applyFormStyles()
  }, [])
  
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

        // Request FCM token and store in Firestore users collection
        try {
          const fcmToken = await requestFCMToken();
          if (fcmToken) {
            const docId = String(userId);
            await setDoc(doc(db, "users", docId), {
              user_id: docId,
              fcmToken: fcmToken,
            }, { merge: true });
            console.log("FCM token saved to Firestore for user:", docId);
          } else {
            console.warn("FCM token was null – notification permission may have been denied");
          }
        } catch (fcmError) {
          console.error("Could not store FCM token:", fcmError);
        }
        
        console.log("Login successful, navigating to dashboard...")
        
        // Give a moment for localStorage to persist
        await new Promise(resolve => setTimeout(resolve, 100))
        
        // Dispatch custom event to notify AuthContext of login
        window.dispatchEvent(new CustomEvent('auth-state-changed'))
        
        // Navigate to dashboard (router will handle it now that auth is updated)
        history.push("/hr-dashboard")
        
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
                className="signin-logo"
              />
            </div>

            <IonCard className="signin-card py-8">
              <IonCardHeader>
                <IonCardTitle className="ion-text-center">HRIS Sign In</IonCardTitle>
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
                  </div>

                  <IonButton
                    expand="block"
                    className="signin-button"
                    onClick={async (e) => {
                      e.preventDefault();
                      
                      // Handle validation first
                      if (!email || !password) {
                        setAlertMessage("Please enter both email and password");
                        setShowAlert(true);
                        return;
                      }
                      
                      // Regular authentication flow
                      setLoading(true);
                      console.log("Starting regular authentication process...");
                      
                      // Use the proper handleLogin function with error handling
                      try {
                        await handleLogin();
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
                </form>


             
              </IonCardContent>
            </IonCard>
          </div>
        </div>


        <IonAlert
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
