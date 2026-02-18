"use client"

import type React from "react"
import { useState } from "react"
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonInput,
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonText,
  IonLoading,
  IonIcon,
  IonImg,
  IonGrid,
  IonRow,
  IonCol,
  IonAlert,
  IonItem,
  IonLabel,
} from "@ionic/react"
import { mailOutline, arrowForwardOutline } from "ionicons/icons"
import { useHistory } from "react-router-dom"
import { useAudit } from "../../hooks/useAudit"
import { useAuthContext } from "../../services/AuthContext"
import "./EmailOTP.css"

const EmailOTP: React.FC = () => {
  const [email, setEmail] = useState<string>("dharklike@gmail.com")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [showAlert, setShowAlert] = useState<boolean>(false)
  const [alertMessage, setAlertMessage] = useState<string>("")
  const history = useHistory()
  const { logAction } = useAudit()
  const { currentUser, loading: authLoading } = useAuthContext()

  // Redirect if already authenticated
  React.useEffect(() => {
    if (!authLoading && currentUser) {
      history.replace('/hr-dashboard')
    }
  }, [currentUser, authLoading, history])

  const validateEmail = (email: string): boolean => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    return re.test(email)
  }

  const handleSendOTP = async () => {
    if (!validateEmail(email)) {
      setAlertMessage("Please enter a valid email address.")
      setShowAlert(true)
      return
    }

    setIsLoading(true)

    try {
      // Simulate API call to send OTP
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Log the action
      logAction({
        action: "OTP_REQUEST",
        details: `OTP requested for ${email}`,
        timestamp: new Date(),
        userId: "guest",
        module: "Authentication",
      })

      // Store email in localStorage for the verification page
      localStorage.setItem("otpEmail", email)

      // Navigate to verification page
      history.push("/verify-otp")
    } catch (error) {
      setAlertMessage("Failed to send OTP. Please try again.")
      setShowAlert(true)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Email Verification</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonGrid>
          <IonRow className="ion-justify-content-center">
            <IonCol size="24" sizeMd="24" sizeLg="24" sizeXl="24">
              <div className="logo-container">
                <IonImg src="/sdca-logo.png" alt="SDCA Logo" className="auth-logo" />
              </div>

              <IonCard className="auth-card">
                <IonCardHeader>
                  <IonCardTitle className="ion-text-center">Email Verification</IonCardTitle>
                </IonCardHeader>

                <IonCardContent>
                  <div className="auth-message">
                    <IonText color="medium">
                      <p>We'll send a verification code to your email address to confirm your identity.</p>
                    </IonText>
                  </div>

                  <form className="auth-form">
                 

                    <IonButton expand="block" className="auth-button" onClick={handleSendOTP} disabled={isLoading}>
                      Send Verification Code
                      <IonIcon slot="end" icon={arrowForwardOutline} />
                    </IonButton>

                    <div className="auth-links">
                      <IonButton fill="clear" size="small" routerLink="/sign-in">
                        Back to Sign In
                      </IonButton>
                    </div>
                  </form>
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>
        </IonGrid>

        <IonLoading isOpen={isLoading} message="Sending verification code..." />

        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header="Alert"
          message={alertMessage}
          buttons={["OK"]}
        />
      </IonContent>
    </IonPage>
  )
}

export default EmailOTP
