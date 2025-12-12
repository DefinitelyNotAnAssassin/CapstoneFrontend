// Leave Approval Component - Role-Based Approval Interface
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
  IonNote,
  IonRefresher,
  IonRefresherContent,
  IonActionSheet,
  IonModal,
  IonInput
} from "@ionic/react"
import { 
  calendarOutline, 
  timeOutline, 
  documentTextOutline, 
  checkmarkCircleOutline,
  hourglass,
  closeCircleOutline,
  personOutline,
  thumbsUpOutline,
  thumbsDownOutline,
  eyeOutline,
  informationCircleOutline
} from "ionicons/icons"
import { useHistory } from "react-router"
import { useRole } from "../../contexts/RoleContext"
import leaveService, { type LeaveRequest as LeaveRequestType } from "../../services/LeaveService"

const LeaveApproval: React.FC = () => {
  const history = useHistory()
  const { userRole, employee, hasPermission } = useRole()
  
  // State
  const [pendingRequests, setPendingRequests] = useState<LeaveRequestType[]>([])
  const [approverInfo, setApproverInfo] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [actionLoading, setActionLoading] = useState<boolean>(false)
  const [showAlert, setShowAlert] = useState<boolean>(false)
  const [alertMessage, setAlertMessage] = useState<string>("")
  
  // Modal state
  const [showActionModal, setShowActionModal] = useState<boolean>(false)
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequestType | null>(null)
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve')
  const [actionNotes, setActionNotes] = useState<string>("")

  useEffect(() => {
    if (!hasPermission('approveRequests')) {
      setAlertMessage('You do not have permission to approve leave requests.')
      setShowAlert(true)
      return
    }
    loadPendingRequests()
  }, [hasPermission])

  const loadPendingRequests = async () => {
    try {
      setLoading(true)
      const data = await leaveService.getPendingApprovalsForMe()
      setPendingRequests(data.requests)
      setApproverInfo(data.approver_info)
    } catch (error: any) {
      console.error('Error loading pending requests:', error)
      setAlertMessage(error.message || 'Failed to load pending requests')
      setShowAlert(true)
    } finally {
      setLoading(false)
    }
  }

  const handleApproveClick = (request: LeaveRequestType) => {
    setSelectedRequest(request)
    setActionType('approve')
    setActionNotes('')
    setShowActionModal(true)
  }

  const handleRejectClick = (request: LeaveRequestType) => {
    setSelectedRequest(request)
    setActionType('reject')
    setActionNotes('')
    setShowActionModal(true)
  }

  const executeAction = async () => {
    if (!selectedRequest) return

    if (actionType === 'reject' && !actionNotes.trim()) {
      setAlertMessage('Rejection reason is required')
      setShowAlert(true)
      return
    }

    try {
      setActionLoading(true)
      
      if (actionType === 'approve') {
        await leaveService.approveLeaveRequest(selectedRequest.id!, actionNotes)
        setAlertMessage('Leave request approved successfully')
      } else {
        await leaveService.rejectLeaveRequest(selectedRequest.id!, actionNotes)
        setAlertMessage('Leave request rejected')
      }
      
      setShowAlert(true)
      setShowActionModal(false)
      setSelectedRequest(null)
      setActionNotes('')
      
      // Reload data
      loadPendingRequests()
    } catch (error: any) {
      console.error('Error processing request:', error)
      setAlertMessage(error.message || 'Failed to process request')
      setShowAlert(true)
    } finally {
      setActionLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    return leaveService.formatDate(dateString)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Approved': return checkmarkCircleOutline
      case 'Pending': return hourglass
      case 'Rejected': return closeCircleOutline
      default: return documentTextOutline
    }
  }

  const doRefresh = (event: any) => {
    loadPendingRequests().finally(() => {
      event.detail.complete()
    })
  }

  // Check permissions
  if (!hasPermission('approveRequests')) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/hr-dashboard" />
            </IonButtons>
            <IonTitle>Leave Approval</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <IonCard>
            <IonCardContent>
              <div style={{ textAlign: 'center' }}>
                <IonIcon icon={informationCircleOutline} size="large" color="warning" />
                <h2>Access Denied</h2>
                <p>You do not have permission to approve leave requests.</p>
                <IonButton fill="clear" onClick={() => history.goBack()}>
                  Go Back
                </IonButton>
              </div>
            </IonCardContent>
          </IonCard>
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
          <IonTitle>Leave Approval</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={doRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        <div className="ion-padding">
          {/* Approver Info */}
          {approverInfo && (
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>
                  <IonIcon icon={personOutline} /> Approval Authority
                </IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonGrid>
                  <IonRow>
                    <IonCol size="6">
                      <strong>Name:</strong> {approverInfo.name}
                    </IonCol>
                    <IonCol size="6">
                      <strong>Position:</strong> {approverInfo.position}
                    </IonCol>
                  </IonRow>
                  <IonRow>
                    <IonCol size="6">
                      <strong>Role Level:</strong> {approverInfo.role_level}
                    </IonCol>
                    <IonCol size="6">
                      <strong>Approval Scope:</strong> 
                      <IonChip color="primary" style={{ marginLeft: '8px' }}>
                        {approverInfo.approval_scope}
                      </IonChip>
                    </IonCol>
                  </IonRow>
                </IonGrid>
              </IonCardContent>
            </IonCard>
          )}

          {/* Pending Requests */}
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>
                Pending Leave Requests
                {pendingRequests.length > 0 && (
                  <IonBadge color="warning" style={{ marginLeft: '8px' }}>
                    {pendingRequests.length}
                  </IonBadge>
                )}
              </IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <IonSpinner name="bubbles" />
                  <p>Loading pending requests...</p>
                </div>
              ) : pendingRequests.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>
                  <IonIcon icon={checkmarkCircleOutline} size="large" color="success" />
                  <h3>No Pending Requests</h3>
                  <p>All leave requests in your scope have been processed.</p>
                </div>
              ) : (
                <IonList>
                  {pendingRequests.map((request) => (
                    <IonCard key={request.id} style={{ margin: '0 0 16px 0' }}>
                      <IonCardContent>
                        <IonGrid>
                          <IonRow>
                            <IonCol size="12">
                              <h3>
                                <IonIcon icon={personOutline} /> {request.employee?.first_name} {request.employee?.last_name}
                              </h3>
                              <p><strong>Position:</strong> {request.employee?.position?.title || 'N/A'}</p>
                            </IonCol>
                          </IonRow>
                          
                          <IonRow>
                            <IonCol size="6">
                              <IonChip color="primary">
                                <IonLabel>{request.leave_type}</IonLabel>
                              </IonChip>
                            </IonCol>
                            <IonCol size="6" style={{ textAlign: 'right' }}>
                              <IonChip color="medium">
                                <IonLabel>{request.days_requested} days</IonLabel>
                              </IonChip>
                            </IonCol>
                          </IonRow>
                          
                          <IonRow>
                            <IonCol size="12">
                              <p>
                                <IonIcon icon={calendarOutline} /> 
                                <strong> Dates:</strong> {formatDate(request.start_date)} - {formatDate(request.end_date)}
                              </p>
                              {request.reason && (
                                <p>
                                  <IonIcon icon={documentTextOutline} /> 
                                  <strong> Reason:</strong> {request.reason}
                                </p>
                              )}
                              <p>
                                <IonIcon icon={timeOutline} /> 
                                <strong> Submitted:</strong> {formatDate(request.created_at!)}
                              </p>
                            </IonCol>
                          </IonRow>
                          
                          <IonRow>
                            <IonCol size="6">
                              <IonButton 
                                expand="block" 
                                color="success" 
                                fill="outline"
                                onClick={() => handleApproveClick(request)}
                                disabled={actionLoading}
                              >
                                <IonIcon icon={thumbsUpOutline} slot="start" />
                                Approve
                              </IonButton>
                            </IonCol>
                            <IonCol size="6">
                              <IonButton 
                                expand="block" 
                                color="danger" 
                                fill="outline"
                                onClick={() => handleRejectClick(request)}
                                disabled={actionLoading}
                              >
                                <IonIcon icon={thumbsDownOutline} slot="start" />
                                Reject
                              </IonButton>
                            </IonCol>
                          </IonRow>
                        </IonGrid>
                      </IonCardContent>
                    </IonCard>
                  ))}
                </IonList>
              )}
            </IonCardContent>
          </IonCard>
        </div>

        {/* Action Modal */}
        <IonModal isOpen={showActionModal} onDidDismiss={() => setShowActionModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>
                {actionType === 'approve' ? 'Approve' : 'Reject'} Leave Request
              </IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowActionModal(false)}>Close</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            {selectedRequest && (
              <div>
                <IonCard>
                  <IonCardHeader>
                    <IonCardTitle>Request Details</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <p><strong>Employee:</strong> {selectedRequest.employee?.first_name} {selectedRequest.employee?.last_name}</p>
                    <p><strong>Leave Type:</strong> {selectedRequest.leave_type}</p>
                    <p><strong>Duration:</strong> {selectedRequest.days_requested} days</p>
                    <p><strong>Dates:</strong> {formatDate(selectedRequest.start_date)} - {formatDate(selectedRequest.end_date)}</p>
                    <p><strong>Reason:</strong> {selectedRequest.reason}</p>
                  </IonCardContent>
                </IonCard>

                <IonItem>
                  <IonLabel position="stacked">
                    {actionType === 'approve' ? 'Approval Notes (Optional)' : 'Rejection Reason (Required)'}
                  </IonLabel>
                  <IonTextarea
                    value={actionNotes}
                    onIonChange={(e) => setActionNotes(e.detail.value!)}
                    placeholder={actionType === 'approve' 
                      ? "Add any notes for approval..." 
                      : "Please provide a reason for rejection..."}
                    rows={3}
                  />
                </IonItem>

                <IonButton
                  expand="block"
                  color={actionType === 'approve' ? 'success' : 'danger'}
                  onClick={executeAction}
                  disabled={actionLoading || (actionType === 'reject' && !actionNotes.trim())}
                  style={{ marginTop: '16px' }}
                >
                  {actionLoading ? (
                    <IonSpinner name="crescent" />
                  ) : (
                    <>
                      <IonIcon 
                        icon={actionType === 'approve' ? thumbsUpOutline : thumbsDownOutline} 
                        slot="start" 
                      />
                      {actionType === 'approve' ? 'Approve Request' : 'Reject Request'}
                    </>
                  )}
                </IonButton>
              </div>
            )}
          </IonContent>
        </IonModal>

        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header="Leave Approval"
          message={alertMessage}
          buttons={['OK']}
        />
      </IonContent>
    </IonPage>
  )
}

export default LeaveApproval
