// LeaveApproval.tsx - Role-based Leave Approval Management
// Allows managers (VPAA, Dean, PC) to approve/reject leave requests based on their authority

import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonIcon,
  IonList,
  IonItem,
  IonLabel,
  IonTextarea,
  IonBadge,
  IonGrid,
  IonRow,
  IonCol,
  IonSegment,
  IonSegmentButton,
  IonModal,
  IonButtons,
  IonBackButton,
  IonSpinner,
  IonText,
  IonChip,
  IonToast,
  IonRefresher,
  IonRefresherContent,
  IonAlert,
  IonNote,
} from '@ionic/react';
import {
  checkmarkCircleOutline,
  closeCircleOutline,
  eyeOutline,
  documentTextOutline,
  personOutline,
  timeOutline,
  calendarOutline,
} from 'ionicons/icons';
import { useRole } from '../contexts/RoleContext';
import leaveService, { LeaveRequest as LeaveRequestType } from '../services/LeaveService';
import EmployeeDetail from './EmployeeDetail';
import employeeService from '../services/EmployeeServiceNew';

const LeaveApproval: React.FC = () => {
  const { userRole, employee, loading: roleLoading, hasPermission } = useRole();
  
  // State management
  const [activeSegment, setActiveSegment] = useState<string>('pending');
  const [pendingRequests, setPendingRequests] = useState<LeaveRequestType[]>([]);
  const [approverInfo, setApproverInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequestType | null>(null);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState<'success' | 'danger' | 'warning'>('success');
  const [showConfirmAlert, setShowConfirmAlert] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'approve' | 'reject' | null>(null);
  const [showEmployeeDetailModal, setShowEmployeeDetailModal] = useState(false);
  const [employeeDetailId, setEmployeeDetailId] = useState<string | null>(null);
  const [employeeDetail, setEmployeeDetail] = useState<any>(null);
  const [leaveCreditBalance, setLeaveCreditBalance] = useState<number | null>(null);

  useEffect(() => {
    if (!roleLoading && hasPermission('approveRequests')) {
      loadPendingRequests();
    }
  }, [roleLoading, hasPermission]);

  const loadPendingRequests = async () => {
    setLoading(true);
    try {
      const data = await leaveService.getPendingApprovalsForMe();
      setPendingRequests(data.requests || []);
      setApproverInfo(data.approver_info || null);
    } catch (error) {
      console.error('Error loading pending requests:', error);
      showToastMessage('Error loading pending requests', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async (event: CustomEvent) => {
    await loadPendingRequests();
    event.detail.complete();
  };

  const showToastMessage = (message: string, color: 'success' | 'danger' | 'warning' = 'success') => {
    setToastMessage(message);
    setToastColor(color);
    setShowToast(true);
  };

  const handleApproveRequest = async () => {
    if (!selectedRequest) return;
    
    try {
      await leaveService.approveLeaveRequest(selectedRequest.id!, approvalNotes);
      showToastMessage('Leave request approved successfully!', 'success');
      setShowApprovalModal(false);
      setApprovalNotes('');
      setSelectedRequest(null);
      loadPendingRequests();
    } catch (error) {
      console.error('Error approving request:', error);
      showToastMessage('Error approving leave request', 'danger');
    }
  };

  const handleRejectRequest = async () => {
    if (!selectedRequest || !rejectionReason.trim()) {
      showToastMessage('Please provide a reason for rejection', 'warning');
      return;
    }
    
    try {
      await leaveService.rejectLeaveRequest(selectedRequest.id!, rejectionReason);
      showToastMessage('Leave request rejected', 'success');
      setShowRejectionModal(false);
      setRejectionReason('');
      setSelectedRequest(null);
      loadPendingRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
      showToastMessage('Error rejecting leave request', 'danger');
    }
  };

  const openApprovalModal = (request: LeaveRequestType) => {
    setSelectedRequest(request);
    setShowApprovalModal(true);
  };

  const openRejectionModal = (request: LeaveRequestType) => {
    setSelectedRequest(request);
    setShowRejectionModal(true);
  };

  const openDetailsModal = (request: LeaveRequestType) => {
    setSelectedRequest(request);
    setShowDetailsModal(true);
  };

  const getStatusColor = (status: string) => leaveService.getStatusColor(status);
  const getLeaveTypeColor = (leaveType: string) => leaveService.getLeaveTypeColor(leaveType);  const getEmployeeName = (request: any) => {
    // Try to get name from employee object
    if (request.employee) {
      if (typeof request.employee === 'object') {
        if (request.employee.full_name) return request.employee.full_name;
        if (request.employee.first_name && request.employee.last_name) {
          return `${request.employee.first_name} ${request.employee.last_name}`;
        }
      }
    }
    // Fallback to other possible name fields
    if (request.employee_name) return request.employee_name;
    return 'Unknown Employee';
  };

  // Set your API base URL here
  const API_BASE_URL = (window as any).API_BASE_URL || 'http://127.0.0.1:8000/api';
  // Fetch employee details and leave credit balance for the selected request
  useEffect(() => {
    const fetchEmployeeAndCredit = async () => {
      if (showDetailsModal && selectedRequest && selectedRequest.employee) {
        try {
          // Extract employee ID properly - handle both cases where employee is an object or just an ID
          let employeeId: string;
          if (typeof selectedRequest.employee === 'object' && selectedRequest.employee.id) {
            employeeId = selectedRequest.employee.id.toString();
          } else if (typeof selectedRequest.employee === 'number' || typeof selectedRequest.employee === 'string') {
            employeeId = selectedRequest.employee.toString();
          } else {
            console.error('Invalid employee data:', selectedRequest.employee);
            setEmployeeDetail(null);
            setLeaveCreditBalance(null);
            return;
          }          // Fetch employee details
          const emp = await employeeService.getEmployeeById(employeeId);
          setEmployeeDetail(emp);
          
          // Fetch leave credits for the employee
          const response = await fetch(`${API_BASE_URL}/leave-credits/by_employee/?employee_id=${employeeId}`);
          if (!response.ok) throw new Error('Failed to fetch leave credits');
          const credits = await response.json();
          if (Array.isArray(credits)) {
            // Use toLowerCase for case-insensitive match
            const match = credits.find((c: any) => (c.leave_type || '').toLowerCase() === (selectedRequest.leave_type || '').toLowerCase());
            setLeaveCreditBalance(match ? match.remaining_credits : null);
          } else {
            setLeaveCreditBalance(null);
          }
        } catch (error) {
          console.error('Error fetching employee details:', error);
          setEmployeeDetail(null);
          setLeaveCreditBalance(null);
        }
      } else {
        setEmployeeDetail(null);
        setLeaveCreditBalance(null);
      }
    };
    fetchEmployeeAndCredit();
  }, [showDetailsModal, selectedRequest]);

  // Check if user has approval permissions
  if (!roleLoading && !hasPermission('approveRequests')) {
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
        <IonContent className="ion-padding ion-text-center">
          <div style={{ marginTop: '50%' }}>
            <IonIcon icon={documentTextOutline} size="large" color="medium" />
            <IonText color="medium">
              <h3>Access Denied</h3>
              <p>You don't have permission to approve leave requests.</p>
            </IonText>
            <IonButton routerLink="/hr-dashboard" fill="outline">
              Back to Dashboard
            </IonButton>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (loading || roleLoading) {
    return (
      <IonPage>
        <IonContent className="ion-padding ion-text-center">
          <div style={{ marginTop: '50%' }}>
            <IonSpinner name="crescent" color="primary" />
            <IonText>
              <p>Loading approval requests...</p>
            </IonText>
          </div>
        </IonContent>
      </IonPage>
    );
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
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        {/* Approver Info Card */}
        {approverInfo && (
          <IonCard className="ion-margin">
            <IonCardHeader>
              <IonCardTitle>Your Approval Authority</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonGrid>
                <IonRow>
                  <IonCol size="6">
                    <IonText>
                      <h3>{approverInfo.name}</h3>
                      <p>{approverInfo.position}</p>
                    </IonText>
                  </IonCol>
                  <IonCol size="6" className="ion-text-right">
                    <IonChip color="primary">
                      <IonIcon icon={personOutline} />
                      <IonLabel>{approverInfo.approval_scope}</IonLabel>
                    </IonChip>
                  </IonCol>
                </IonRow>
              </IonGrid>
            </IonCardContent>
          </IonCard>
        )}

        {/* Summary Card */}
        <IonCard className="ion-margin">
          <IonCardHeader>
            <IonCardTitle>Pending Approvals Summary</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonGrid>
              <IonRow>
                <IonCol size="6" className="ion-text-center">
                  <IonText color="warning">
                    <h2>{pendingRequests.length}</h2>
                    <p>Pending Requests</p>
                  </IonText>
                </IonCol>
                <IonCol size="6" className="ion-text-center">
                  <IonText color="primary">
                    <h2>{pendingRequests.filter(r => 
                      new Date(r.start_date) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                    ).length}</h2>
                    <p>Urgent (&lt; 7 days)</p>
                  </IonText>
                </IonCol>
              </IonRow>
            </IonGrid>
          </IonCardContent>
        </IonCard>

        {/* Pending Requests List */}
        <div className="ion-padding">
          {pendingRequests.length === 0 ? (
            <IonCard>
              <IonCardContent className="ion-text-center">
                <IonIcon icon={documentTextOutline} size="large" color="medium" />
                <IonText color="medium">
                  <h3>No pending approvals</h3>
                  <p>All leave requests under your authority have been processed</p>
                </IonText>
              </IonCardContent>
            </IonCard>
          ) : (
            <IonList>
              {pendingRequests.map((request) => {
                const isUrgent = new Date(request.start_date) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
                
                return (
                  <IonCard key={request.id} className={isUrgent ? 'urgent-request' : ''}>
                    <IonCardContent>
                      <IonGrid>
                        <IonRow className="ion-align-items-center">
                          <IonCol>
                            <IonText>
                              <h3>
                                {getEmployeeName(request)}
                                {isUrgent && <IonIcon icon={timeOutline} color="danger" className="ion-margin-start" />}
                              </h3>
                              {/* Position and department will be loaded in modal only */}
                            </IonText>
                          </IonCol>
                          <IonCol size="auto">
                            <IonChip color={getLeaveTypeColor(request.leave_type)}>
                              {request.leave_type}
                            </IonChip>
                          </IonCol>
                        </IonRow>
                        
                        <IonRow>
                          <IonCol>
                            <IonText>
                              <p>
                                <IonIcon icon={calendarOutline} className="ion-margin-end" />
                                {leaveService.formatDate(request.start_date)} - {leaveService.formatDate(request.end_date)}
                              </p>
                              <p>
                                <strong>{request.days_requested} day(s)</strong>
                              </p>
                              <p className="ion-text-wrap">{request.reason}</p>
                            </IonText>
                          </IonCol>
                        </IonRow>
                        
                        <IonRow>
                          <IonCol>
                            <IonButton fill="clear" size="small" onClick={() => openDetailsModal(request)}>
                              <IonIcon icon={eyeOutline} slot="start" />
                              Details
                            </IonButton>                            <IonButton fill="clear" size="small" onClick={() => {
                              // Extract employee ID properly
                              let employeeId: string | null = null;
                              if (typeof request.employee === 'object' && request.employee.id) {
                                employeeId = request.employee.id.toString();
                              } else if (typeof request.employee === 'number' || typeof request.employee === 'string') {
                                employeeId = request.employee.toString();
                              }
                              setEmployeeDetailId(employeeId);
                              setShowEmployeeDetailModal(true);
                            }}>
                              <IonIcon icon={personOutline} slot="start" />
                              View Profile
                            </IonButton>
                          </IonCol>
                          <IonCol size="auto">
                            <IonButton color="success" size="small" onClick={() => openApprovalModal(request)}>
                              <IonIcon icon={checkmarkCircleOutline} slot="start" />
                              Approve
                            </IonButton>
                            <IonButton color="danger" size="small" fill="outline" onClick={() => openRejectionModal(request)} className="ion-margin-start">
                              <IonIcon icon={closeCircleOutline} slot="start" />
                              Reject
                            </IonButton>
                          </IonCol>
                        </IonRow>
                      </IonGrid>
                    </IonCardContent>
                  </IonCard>
                );
              })}
            </IonList>
          )}
        </div>        {/* Request Details Modal */}
        <IonModal 
          isOpen={showDetailsModal} 
          onDidDismiss={() => setShowDetailsModal(false)}
          className="large-modal"
        >
          <IonHeader>
            <IonToolbar>
              <IonTitle>Request Details</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowDetailsModal(false)}>Close</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            {selectedRequest && (
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>{selectedRequest.leave_type}</IonCardTitle>
                  <IonBadge color={getStatusColor(selectedRequest.status)}>
                    {selectedRequest.status}
                  </IonBadge>
                </IonCardHeader>
                <IonCardContent>
                  <IonList>                    <IonItem>
                      <IonLabel>
                        <h3>Employee</h3>
                        <p>{employeeDetail ? `${employeeDetail.lastName}, ${employeeDetail.firstName} ${employeeDetail.middleName ? employeeDetail.middleName.charAt(0) + '.' : ''}` : getEmployeeName(selectedRequest)}</p>
                        {employeeDetail && (
                          <>
                            <p>{employeeDetail.position_title || 'No Position'}</p>
                            <p>{employeeDetail.department_name || 'No Department'}{employeeDetail.program_name ? ` • ${employeeDetail.program_name}` : ''}</p>
                          </>
                        )}
                      </IonLabel>
                    </IonItem>
                    <IonItem>
                      <IonLabel>
                        <h3>Leave Period</h3>
                        <p>{leaveService.formatDate(selectedRequest.start_date)} - {leaveService.formatDate(selectedRequest.end_date)}</p>
                        <p>{selectedRequest.days_requested} day(s)</p>
                      </IonLabel>
                    </IonItem>
                    <IonItem>
                      <IonLabel>
                        <h3>Reason</h3>
                        <p>{selectedRequest.reason}</p>
                      </IonLabel>
                    </IonItem>
                    <IonItem>
                      <IonLabel>
                        <h3>Date Requested</h3>
                        <p>{leaveService.formatDate(selectedRequest.created_at || '')}</p>
                      </IonLabel>
                    </IonItem>
                    {/* Show available leave credit balance for this leave type */}
                    <IonItem>
                      <IonLabel>
                        <h3>Available Credit Balance</h3>
                        <p>{leaveCreditBalance !== null && leaveCreditBalance !== undefined ? `${leaveCreditBalance} day(s)` : 'No credit record for this leave type.'}</p>
                      </IonLabel>
                    </IonItem>
                    {selectedRequest.supporting_documents && selectedRequest.supporting_documents.length > 0 && (
                      <IonItem>
                        <IonLabel>
                          <h3>Supporting Documents</h3>
                          {selectedRequest.supporting_documents.map((doc, index) => (
                            <p key={index}>{doc}</p>
                          ))}
                        </IonLabel>
                      </IonItem>
                    )}
                  </IonList>
                </IonCardContent>
              </IonCard>
            )}
          </IonContent>
        </IonModal>        {/* Approval Modal */}
        <IonModal 
          isOpen={showApprovalModal} 
          onDidDismiss={() => setShowApprovalModal(false)}
          className="large-modal"
        >
          <IonHeader>
            <IonToolbar>
              <IonTitle>Approve Leave Request</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowApprovalModal(false)}>Cancel</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            {selectedRequest && (
              <>
                <IonCard>
                  <IonCardContent>
                    <IonText>
                      <h3>Approving request for:</h3>
                      <p><strong>{selectedRequest.employee?.full_name || 
                         `${selectedRequest.employee?.first_name} ${selectedRequest.employee?.last_name}`}</strong></p>
                      <p>{selectedRequest.leave_type} - {selectedRequest.days_requested} day(s)</p>
                      <p>{leaveService.formatDate(selectedRequest.start_date)} to {leaveService.formatDate(selectedRequest.end_date)}</p>
                    </IonText>
                  </IonCardContent>
                </IonCard>

                <IonList>
                  <IonItem>
                    <IonLabel position="stacked">Approval Notes (Optional)</IonLabel>
                    <IonTextarea
                      value={approvalNotes}
                      onIonInput={(e) => setApprovalNotes(e.detail.value!)}
                      placeholder="Add any notes about this approval..."
                      rows={4}
                    />
                  </IonItem>
                </IonList>

                <IonButton
                  expand="block"
                  color="success"
                  className="ion-margin-top"
                  onClick={handleApproveRequest}
                >
                  <IonIcon icon={checkmarkCircleOutline} slot="start" />
                  Approve Leave Request
                </IonButton>
              </>
            )}
          </IonContent>
        </IonModal>        {/* Rejection Modal */}
        <IonModal 
          isOpen={showRejectionModal} 
          onDidDismiss={() => setShowRejectionModal(false)}
          className="large-modal"
        >
          <IonHeader>
            <IonToolbar>
              <IonTitle>Reject Leave Request</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowRejectionModal(false)}>Cancel</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            {selectedRequest && (
              <>
                <IonCard>
                  <IonCardContent>
                    <IonText>
                      <h3>Rejecting request for:</h3>
                      <p><strong>{selectedRequest.employee?.full_name || 
                         `${selectedRequest.employee?.first_name} ${selectedRequest.employee?.last_name}`}</strong></p>
                      <p>{selectedRequest.leave_type} - {selectedRequest.days_requested} day(s)</p>
                      <p>{leaveService.formatDate(selectedRequest.start_date)} to {leaveService.formatDate(selectedRequest.end_date)}</p>
                    </IonText>
                  </IonCardContent>
                </IonCard>

                <IonList>
                  <IonItem>
                    <IonLabel position="stacked">Reason for Rejection *</IonLabel>
                    <IonTextarea
                      value={rejectionReason}
                      onIonInput={(e) => setRejectionReason(e.detail.value!)}
                      placeholder="Please provide a clear reason for rejecting this request..."
                      rows={4}
                    />
                  </IonItem>
                </IonList>

                <IonNote className="ion-margin">
                  <p>Please provide a clear and professional reason for rejection. The employee will see this message.</p>
                </IonNote>

                <IonButton
                  expand="block"
                  color="danger"
                  className="ion-margin-top"
                  onClick={handleRejectRequest}
                  disabled={!rejectionReason.trim()}
                >
                  <IonIcon icon={closeCircleOutline} slot="start" />
                  Reject Leave Request
                </IonButton>
              </>
            )}
          </IonContent>
        </IonModal>        {/* Employee Detail Modal */}
        <IonModal 
          isOpen={showEmployeeDetailModal} 
          onDidDismiss={() => setShowEmployeeDetailModal(false)}
          className="large-modal"
        >
          <IonHeader>
            <IonToolbar>
              <IonTitle>Employee Profile</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowEmployeeDetailModal(false)}>Close</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            {employeeDetailId && <EmployeeDetail id={employeeDetailId} />}
          </IonContent>
        </IonModal>

        {/* Toast for feedback */}
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
          color={toastColor}
        />
      </IonContent>      <style>
        {`
          .urgent-request {
            border-left: 4px solid var(--ion-color-danger);
          }
          
          .large-modal {
            --width: 90%;
            --max-width: 800px;
            --height: 85%;
            --max-height: 900px;
          }
          
          @media (max-width: 768px) {
            .large-modal {
              --width: 95%;
              --height: 90%;
            }
          }
        `}
      </style>
    </IonPage>
  );
};

export default LeaveApproval;
