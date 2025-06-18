"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
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
} from "@ionic/react"
import { checkmarkCircleOutline } from "ionicons/icons"
import { useHistory } from "react-router-dom"
import { useAudit } from "../hooks/useAudit"
import "./EmailOTP.css"

interface HTMLIonInputElement extends HTMLElement {
  value: string
  getInputElement(): Promise<HTMLInputElement>
  setFocus(): void
}

const VerifyOTP: React.FC = () => {
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""))
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [showAlert, setShowAlert] = useState<boolean>(false)
  const [alertMessage, setAlertMessage] = useState<string>("")
  const [email, setEmail] = useState<string>("")
  const [timeLeft, setTimeLeft] = useState<number>(120) // 2 minutes countdown
  const [canResend, setCanResend] = useState<boolean>(false)
  const inputRefs = useRef<(HTMLIonInputElement | null)[]>(Array(6).fill(null))
  const history = useHistory()
  const { logAction } = useAudit()

  useEffect(() => {
    // Get email from localStorage
    const storedEmail = localStorage.getItem("otpEmail")
    if (storedEmail) {
      setEmail(storedEmail)
    } else {
      // Redirect to OTP request page if email not found
    }

    // Focus on first input
    setTimeout(() => {
      inputRefs.current[0]?.setFocus()
    }, 300)

    // Start countdown timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          setCanResend(true)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [history])

  const handleInputChange = (index: number, value: string) => {
    // Only allow numbers
    if (!/^\d*$/.test(value)) return

    const newOtp = [...otp]
    newOtp[index] = value.slice(0, 1) // Only take the first character
    setOtp(newOtp)

    // Auto-focus next input if current input is filled
    if (value && index < 5) {
      inputRefs.current[index + 1]?.setFocus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    // Move to previous input on backspace if current input is empty
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.setFocus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text")

    // Check if pasted content is a 6-digit number
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split("")
      setOtp(digits)

      // Focus on the last input
      inputRefs.current[5]?.setFocus()
    }
  }

  const handleResendOTP = async () => {
    if (!canResend) return

    setIsLoading(true)

    try {
      // Simulate API call to resend OTP
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Log the action
      logAction({
        action: "OTP_RESEND",
        details: `OTP resent for ${email}`,
        timestamp: new Date(),
        userId: "guest",
        module: "Authentication",
      })

      // Reset timer
      setTimeLeft(120)
      setCanResend(false)

      setAlertMessage("A new verification code has been sent to your email.")
      setShowAlert(true)
    } catch (error) {
      setAlertMessage("Failed to resend verification code. Please try again.")
      setShowAlert(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyOTP = async () => {
    const otpString = otp.join("")

    if (otpString.length !== 6) {
      setAlertMessage("Please enter all 6 digits of the verification code.")
      setShowAlert(true)
      return
    }

    setIsLoading(true)

    try {
      // Simulate API call to verify OTP
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // For demo purposes, let's consider "123456" as the valid OTP
      if (otpString === "123456") {
        // Log the action
        logAction({
          action: "OTP_VERIFIED",
          details: `Email ${email} verified successfully`,
          timestamp: new Date(),
          userId: "guest",
          module: "Authentication",
        })

        // Set authentication in localStorage
        localStorage.setItem("isAuthenticated", "true")
        localStorage.setItem(
          "user",
          JSON.stringify({
            email: email,
            name: "HRIMS User",
            role: "HR Staff",
          }),
        )

        // Navigate to dashboard
        history.replace("/hr-dashboard")
      } else {
        // Log failed attempt
        logAction({
          action: "OTP_VERIFICATION_FAILED",
          details: `Failed verification attempt for ${email}`,
          timestamp: new Date(),
          userId: "guest",
          module: "Authentication",
        })

        setAlertMessage("Invalid verification code. Please try again.")
        setShowAlert(true)
      }
    } catch (error) {
      setAlertMessage("Verification failed. Please try again.")
      setShowAlert(true)
    } finally {
      setIsLoading(false)
    }
  }

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Verify OTP</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonGrid>
          <IonRow className="ion-justify-content-center">
            <IonCol size="12" sizeMd="8" sizeLg="6" sizeXl="4">
              <div className="logo-container">
                <IonImg src="/sdca-logo.png" alt="SDCA Logo" className="auth-logo" />
              </div>

              <IonCard className="auth-card">
                <IonCardHeader>
                  <IonCardTitle className="ion-text-center">Enter Verification Code</IonCardTitle>
                </IonCardHeader>

                <IonCardContent>
                  <div className="auth-message">
                    <IonText color="medium">
                      <p>We've sent a 6-digit verification code to</p>
                      <p>
                        <strong>{email}</strong>
                      </p>
                      <p>Enter the code below to verify your identity.</p>
                    </IonText>
                  </div>

                  <div className="otp-container" onPaste={handlePaste}>
                    {otp.map((digit, index) => (
                      <IonInput
                        key={index}
                        type="text"
                        inputMode="numeric"
                        maxlength={1}
                        value={digit}
                        className="otp-input"
                        onIonChange={(e) => handleInputChange(index, e.detail.value || "")}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        ref={(el) => (inputRefs.current[index] = el)}
                      />
                    ))}
                  </div>

                  <IonButton
                    expand="block"
                    className="auth-button"
                    onClick={handleVerifyOTP}
                    disabled={isLoading || otp.join("").length !== 6}
                  >
                    Verify Code
                    <IonIcon slot="end" icon={checkmarkCircleOutline} />
                  </IonButton>

                  <div className="resend-link">
                    <IonButton fill="clear" size="small" onClick={handleResendOTP} disabled={!canResend || isLoading}>
                      Resend Code
                    </IonButton>
                    {!canResend && <span className="timer">Resend available in {formatTime(timeLeft)}</span>}
                  </div>

                  <div className="auth-links">
                    <IonButton fill="clear" size="small" routerLink="/email-otp">
                      Change Email
                    </IonButton>
                  </div>
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>
        </IonGrid>

        <IonLoading isOpen={isLoading} message="Verifying code..." />

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

export default VerifyOTP
