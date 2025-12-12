// Enhanced Leave Request Component with Role-Based Features
"use client"

import React, { useState, useEffect } from "react"
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonItem,
  IonLabel,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonDatetime,
  IonButtons,
  IonBackButton,
  IonList,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonAlert,
  IonBadge,
  IonSpinner,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonChip,
  IonNote
} from "@ionic/react"
import { 
  calendarOutline, 
  timeOutline, 
  documentTextOutline, 
  checkmarkCircleOutline,
  hourglass,
  closeCircleOutline,
  personOutline
} from "ionicons/icons"
import { useHistory } from "react-router"
import { useRole } from "../../contexts/RoleContext"
import leaveService, { type LeaveRequest as LeaveRequestType, type LeaveCredit, type LeavePolicy } from "../../services/LeaveService"

const LeaveRequest: React.FC = () => {
  const history = useHistory()
  const { userRole, employee } = useRole()
  
  // Form state
  const [leaveType, setLeaveType] = useState<string>("Vacation Leave")
  const [startDate, setStartDate] = useState<string>("")
  const [endDate, setEndDate] = useState<string>("")
  const [reason, setReason] = useState<string>("")
  const [showAlert, setShowAlert] = useState<boolean>(false)
  const [alertMessage, setAlertMessage] = useState<string>("")
  const [loading, setLoading] = useState<boolean>(false)
  
  // Data state
  const [myRequests, setMyRequests] = useState<LeaveRequestType[]>([])
  const [leaveCredits, setLeaveCredits] = useState<LeaveCredit[]>([])
  const [leavePolicies, setLeavePolicies] = useState<LeavePolicy[]>([])
  const [dataLoading, setDataLoading] = useState<boolean>(true)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setDataLoading(true)
      const [requests, credits, policies] = await Promise.all([
        leaveService.getMyLeaveRequests(),
        leaveService.getMyLeaveCredits(),
        leaveService.getLeavePolicies()
      ])
      
      setMyRequests(requests)
      setLeaveCredits(credits)
      setLeavePolicies(policies)
    } catch (error) {
      console.error('Error loading data:', error)
      setAlertMessage('Failed to load leave data. Please refresh the page.')
      setShowAlert(true)
    } finally {
      setDataLoading(false)
    }
  }

  const calculateBusinessDays = (start: string, end: string): number => {
    return leaveService.calculateBusinessDays(start, end)
  }

  const getAvailableCredits = (leaveType: string): number => {
    const credit = leaveCredits.find(c => c.leave_type === leaveType)
    return credit ? credit.remaining_credits : 0
  }

  const getSelectedPolicy = () => {
    return leavePolicies.find(policy => policy.leave_type === leaveType)
  }

  const validateRequest = (): string | null => {
    if (!leaveType || !startDate || !endDate || !reason.trim()) {
      return "Please fill in all required fields"
    }

    const start = new Date(startDate)
    const end = new Date(endDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (start < today) {
      return "Start date cannot be in the past"
    }

    if (start > end) {
      return "End date must be after start date"
    }

    const daysRequested = calculateBusinessDays(startDate, endDate)
    const availableCredits = getAvailableCredits(leaveType)

    if (daysRequested > availableCredits) {
      return `Insufficient leave credits. You have ${availableCredits} days available for ${leaveType}`
    }

    const policy = getSelectedPolicy()
    if (policy && daysRequested > policy.days_allowed) {
      return `Request exceeds policy limit of ${policy.days_allowed} days for ${leaveType}`
    }

    return null
  }

  const handleSubmit = async () => {
    const validationError = validateRequest()
    if (validationError) {
      setAlertMessage(validationError)
      setShowAlert(true)
      return
    }

    try {
      setLoading(true)
      
      const requestData = {
        leave_type: leaveType,
        start_date: startDate,
        end_date: endDate,
        days_requested: calculateBusinessDays(startDate, endDate),
        reason: reason.trim(),
        employee: employee?.id
      }

      await leaveService.createLeaveRequest(requestData)
      
      setAlertMessage('Leave request submitted successfully!')
      setShowAlert(true)
      
      // Reset form
      setLeaveType("Vacation Leave")
      setStartDate("")
      setEndDate("")
      setReason("")
      
      // Reload data
      loadData()
    } catch (error: any) {
      console.error('Error submitting request:', error)
      setAlertMessage(error.message || 'Failed to submit leave request')
      setShowAlert(true)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved': return checkmarkCircleOutline
      case 'Pending': return hourglass
      case 'Rejected': return closeCircleOutline
      default: return documentTextOutline
    }
  }

  const formatDate = (dateString: string) => {
    return leaveService.formatDate(dateString)
  }

  if (dataLoading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/hr-dashboard" />
            </IonButtons>
            <IonTitle>Leave Request</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <IonSpinner name="bubbles" />
            <p>Loading leave data...</p>
          </div>
        </IonContent>
      </IonPage>
    )
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/hr-dashboard" />
          </IonButtons>
          <IonTitle>Leave Request</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {/* Employee Info */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>
              <IonIcon icon={personOutline} /> {employee?.full_name || 'Employee'}
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <p><strong>Position:</strong> {employee?.position_title || 'N/A'}</p>
            <p><strong>Department:</strong> {employee?.department_name || 'N/A'}</p>
          </IonCardContent>
        </IonCard>

        {/* Leave Credits Summary */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Leave Credits Available</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonGrid>
              <IonRow>
                {leaveCredits.map((credit, index) => (
                  <IonCol size="6" key={index}>
                    <IonChip color={credit.remaining_credits > 0 ? "success" : "warning"}>
                      <IonLabel>
                        <div style={{ textAlign: 'center' }}>
                          <div style={{ fontSize: '0.8em' }}>{credit.leave_type}</div>
                          <div style={{ fontWeight: 'bold' }}>{credit.remaining_credits} days</div>
                        </div>
                      </IonLabel>
                    </IonChip>
                  </IonCol>
                ))}
              </IonRow>
            </IonGrid>
          </IonCardContent>
        </IonCard>

        {/* New Leave Request Form */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>
              <IonIcon icon={documentTextOutline} /> New Leave Request
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonList>
              <IonItem>
                <IonLabel position="stacked">Leave Type *</IonLabel>                <IonSelect
                  value={leaveType}
                  onIonChange={(e) => setLeaveType(e.detail.value)}
                  interface="popover"
                >
                  {leavePolicies.map((policy) => (
                    <IonSelectOption key={policy.leave_type} value={policy.leave_type}>
                      {policy.leave_type} ({policy.days_allowed} days max)
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>

              <IonItem>
                <IonLabel position="stacked">Start Date *</IonLabel>
                <IonDatetime
                  value={startDate}
                  onIonChange={(e) => setStartDate(e.detail.value as string)}
                  presentation="date"
                  min={new Date().toISOString()}
                />
              </IonItem>

              <IonItem>
                <IonLabel position="stacked">End Date *</IonLabel>
                <IonDatetime
                  value={endDate}
                  onIonChange={(e) => setEndDate(e.detail.value as string)}
                  presentation="date"
                  min={startDate || new Date().toISOString()}
                />
              </IonItem>

              {startDate && endDate && (
                <IonItem>
                  <IonLabel>
                    <h3>Duration: {calculateBusinessDays(startDate, endDate)} business days</h3>
                    <p>Available credits: {getAvailableCredits(leaveType)} days</p>
                  </IonLabel>
                </IonItem>
              )}

              <IonItem>
                <IonLabel position="stacked">Reason *</IonLabel>
                <IonTextarea
                  value={reason}
                  onIonChange={(e) => setReason(e.detail.value!)}
                  placeholder="Please provide a reason for your leave request..."
                  rows={3}
                />
              </IonItem>

              {getSelectedPolicy() && (
                <IonItem>
                  <IonLabel>
                    <IonNote color="medium">
                      <strong>Policy:</strong> {getSelectedPolicy()?.description}
                      {getSelectedPolicy()?.requires_documentation && (
                        <div>⚠️ Documentation required for this leave type</div>
                      )}
                    </IonNote>
                  </IonLabel>
                </IonItem>
              )}
            </IonList>

            <IonButton
              expand="block"
              onClick={handleSubmit}
              disabled={loading || !leaveType || !startDate || !endDate || !reason.trim()}
              style={{ marginTop: '16px' }}
            >
              {loading ? <IonSpinner name="crescent" /> : 'Submit Leave Request'}
            </IonButton>
          </IonCardContent>
        </IonCard>

        {/* My Leave Requests */}
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>My Leave Requests</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            {myRequests.length === 0 ? (
              <p style={{ textAlign: 'center', color: 'var(--ion-color-medium)' }}>
                No leave requests found
              </p>
            ) : (
              <IonList>
                {myRequests.map((request) => (
                  <IonItem key={request.id}>
                    <IonIcon 
                      icon={getStatusIcon(request.status)} 
                      color={leaveService.getStatusColor(request.status)}
                      slot="start" 
                    />
                    <IonLabel>
                      <h3>{request.leave_type}</h3>
                      <p>
                        <IonIcon icon={calendarOutline} /> {formatDate(request.start_date)} - {formatDate(request.end_date)}
                      </p>
                      <p>
                        <IonIcon icon={timeOutline} /> {request.days_requested} days
                      </p>
                      {request.reason && <p>{request.reason}</p>}
                      {request.approval_notes && (
                        <p><strong>Notes:</strong> {request.approval_notes}</p>
                      )}
                    </IonLabel>
                    <IonBadge 
                      color={leaveService.getStatusColor(request.status)}
                      slot="end"
                    >
                      {request.status}
                    </IonBadge>
                  </IonItem>
                ))}
              </IonList>
            )}
          </IonCardContent>
        </IonCard>

        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header="Leave Request"
          message={alertMessage}
          buttons={['OK']}
        />
      </IonContent>
    </IonPage>
  )
}

export default LeaveRequest
