// LeaveApproval.tsx - Role-based Leave Approval Management
// Two-step approval: 1) Supervisor pre-approval, 2) HR final approval

import React, { useState, useEffect } from 'react';
import {
  IonContent,
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
  IonSpinner,
  IonText,
  IonChip,
  IonToast,
  IonRefresher,
  IonRefresherContent,
  IonAlert,
  IonNote,
  IonHeader,
  IonToolbar,
  IonTitle,
} from '@ionic/react';
import {
  checkmarkCircleOutline,
  closeCircleOutline,
  eyeOutline,
  documentTextOutline,
  personOutline,
  timeOutline,
  calendarOutline,
  briefcaseOutline,
} from 'ionicons/icons';
import { useRole } from '../../contexts/RoleContext';
import leaveService, { LeaveRequest as LeaveRequestType } from '../../services/LeaveService';
import EmployeeDetail from '../employee/EmployeeDetail'
import employeeService from '../../services/EmployeeServiceNew';
import { MainLayout } from '@components/layout';

const LeaveApproval: React.FC = () => {
  const { userRole, employee, loading: roleLoading, hasPermission } = useRole();
  
  // State management
  const [activeSegment, setActiveSegment] = useState<string>('supervisor');
  const [pendingRequests, setPendingRequests] = useState<LeaveRequestType[]>([]);
  const [hrPendingRequests, setHrPendingRequests] = useState<LeaveRequestType[]>([]);
  const [hrBypassRequests, setHrBypassRequests] = useState<LeaveRequestType[]>([]); // For HR bypass
  const [approverInfo, setApproverInfo] = useState<any>(null);
  const [hrApproverInfo, setHrApproverInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [showBypassModal, setShowBypassModal] = useState(false); // HR bypass modal
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequestType | null>(null);
  const [approvalNotes, setApprovalNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [bypassReason, setBypassReason] = useState(''); // Reason for bypassing supervisor
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState<'success' | 'danger' | 'warning'>('success');
  const [showConfirmAlert, setShowConfirmAlert] = useState(false);
  const [confirmAction, setConfirmAction] = useState<'approve' | 'reject' | null>(null);
  const [showEmployeeDetailModal, setShowEmployeeDetailModal] = useState(false);
  const [employeeDetailId, setEmployeeDetailId] = useState<string | null>(null);
  const [employeeDetail, setEmployeeDetail] = useState<any>(null);
  const [leaveCreditBalance, setLeaveCreditBalance] = useState<number | null>(null);
  const [currentApprovalType, setCurrentApprovalType] = useState<'supervisor' | 'hr' | 'hr_bypass'>('supervisor');

  // Check if user is HR
  const isHR = employee?.isHR || false;
  const isSupervisor = hasPermission('approveRequests') && !isHR;

  useEffect(() => {
    if (!roleLoading) {
      // Set initial segment based on user role
      if (isHR) {
        setActiveSegment('hr');
      } else if (isSupervisor) {
        setActiveSegment('supervisor');
      }
      loadAllPendingRequests();
    }
  }, [roleLoading, isHR, isSupervisor]);

  const loadAllPendingRequests = async () => {
    setLoading(true);
    try {
      // Load supervisor pending requests if user has supervisor permissions
      if (hasPermission('approveRequests')) {
        try {
          const supervisorData = await leaveService.getPendingApprovalsForMe();
          setPendingRequests(supervisorData.requests || []);
          setApproverInfo(supervisorData.approver_info || null);
        } catch (error) {
          console.error('Error loading supervisor pending requests:', error);
          setPendingRequests([]);
        }
      }

      // Load HR pending requests if user is HR
      if (isHR) {
        try {
          const hrData = await leaveService.getPendingForHRApproval();
          setHrPendingRequests(hrData.requests || []);
          setHrApproverInfo(hrData.approver_info || null);
        } catch (error) {
          console.error('Error loading HR pending requests:', error);
          setHrPendingRequests([]);
        }

        // Load all pending requests for HR bypass
        try {
          const bypassData = await leaveService.getAllPendingForHR();
          setHrBypassRequests(bypassData.requests || []);
        } catch (error) {
          console.error('Error loading HR bypass requests:', error);
          setHrBypassRequests([]);
        }
      }
    } catch (error) {
      console.error('Error loading pending requests:', error);
      showToastMessage('Error loading pending requests', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async (event: CustomEvent) => {
    await loadAllPendingRequests();
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
      if (currentApprovalType === 'hr') {
        // HR final approval
        await leaveService.hrApproveLeaveRequest(selectedRequest.id!, approvalNotes);
        showToastMessage('Leave request approved by HR. Leave credits deducted.', 'success');
      } else {
        // Supervisor pre-approval
        await leaveService.supervisorApproveLeaveRequest(selectedRequest.id!, approvalNotes);
        showToastMessage('Leave request pre-approved. Forwarded to HR for final approval.', 'success');
      }
      setShowApprovalModal(false);
      setApprovalNotes('');
      setSelectedRequest(null);
      loadAllPendingRequests();
    } catch (error) {
      console.error('Error approving request:', error);
      showToastMessage('Error approving leave request', 'danger');
    }
  };

  const handleBypassApprove = async () => {
    if (!selectedRequest) return;
    
    if (!bypassReason.trim()) {
      showToastMessage('Please provide a reason for bypassing supervisor approval', 'warning');
      return;
    }
    
    try {
      await leaveService.hrDirectApproveLeaveRequest(selectedRequest.id!, approvalNotes, bypassReason);
      showToastMessage('Leave request approved directly by HR (supervisor bypassed). Leave credits deducted.', 'success');
      setShowBypassModal(false);
      setApprovalNotes('');
      setBypassReason('');
      setSelectedRequest(null);
      loadAllPendingRequests();
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
      const rejectedBy = currentApprovalType === 'hr' ? 'HR' : 'supervisor';
      showToastMessage(`Leave request rejected by ${rejectedBy}`, 'success');
      setShowRejectionModal(false);
      setRejectionReason('');
      setSelectedRequest(null);
      loadAllPendingRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
      showToastMessage('Error rejecting leave request', 'danger');
    }
  };

  const openApprovalModal = (request: LeaveRequestType, approvalType: 'supervisor' | 'hr') => {
    setSelectedRequest(request);
    setCurrentApprovalType(approvalType);
    setShowApprovalModal(true);
  };

  const openBypassModal = (request: LeaveRequestType) => {
    setSelectedRequest(request);
    setCurrentApprovalType('hr_bypass');
    setShowBypassModal(true);
  };

  const openRejectionModal = (request: LeaveRequestType, approvalType: 'supervisor' | 'hr' | 'hr_bypass') => {
    setSelectedRequest(request);
    setCurrentApprovalType(approvalType);
    setShowRejectionModal(true);
  };

  const openDetailsModal = (request: LeaveRequestType) => {
    setSelectedRequest(request);
    setShowDetailsModal(true);
  };

  const getStatusColor = (status: string) => leaveService.getStatusColor(status);
  const getLeaveTypeColor = (leaveType: string) => leaveService.getLeaveTypeColor(leaveType);
  const getStatusDisplayText = (status: string) => leaveService.getStatusDisplayText(status);  const getEmployeeName = (request: any) => {
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
  if (!roleLoading && !hasPermission('approveRequests') && !isHR) {
    return (
      <MainLayout title="Leave Approval">
        <div className="ion-padding ion-text-center" style={{ marginTop: '50%' }}>
          <IonIcon icon={documentTextOutline} size="large" color="medium" />
          <IonText color="medium">
            <h3>Access Denied</h3>
            <p>You don't have permission to approve leave requests.</p>
          </IonText>
          <IonButton routerLink="/hr-dashboard" fill="outline">
            Back to Dashboard
          </IonButton>
        </div>
      </MainLayout>
    );
  }

  if (loading || roleLoading) {
    return (
      <MainLayout title="Leave Approval" isLoading={true}>
        <div className="ion-padding ion-text-center" style={{ marginTop: '50%' }}>
          <IonSpinner name="crescent" color="primary" />
          <IonText>
            <p>Loading approval requests...</p>
          </IonText>
        </div>
      </MainLayout>
    );
  }

  // Render request card for both supervisor and HR tabs
  const renderRequestCard = (request: LeaveRequestType, approvalType: 'supervisor' | 'hr') => {
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
                  <p><strong>{request.days_requested} day(s)</strong></p>
                  <p className="ion-text-wrap">{request.reason}</p>
                </IonText>
              </IonCol>
            </IonRow>

            {/* Show supervisor approval info for HR tab */}
            {approvalType === 'hr' && request.supervisor_approved_by && (
              <IonRow>
                <IonCol>
                  <IonChip color="tertiary">
                    <IonIcon icon={checkmarkCircleOutline} />
                    <IonLabel>
                      Pre-approved by: {request.supervisor_approved_by.first_name} {request.supervisor_approved_by.last_name}
                    </IonLabel>
                  </IonChip>
                  {request.supervisor_approval_notes && (
                    <IonNote className="ion-margin-top">
                      <small>Notes: {request.supervisor_approval_notes}</small>
                    </IonNote>
                  )}
                </IonCol>
              </IonRow>
            )}
            
            <IonRow>
              <IonCol>
                <IonButton fill="clear" size="small" onClick={() => openDetailsModal(request)}>
                  <IonIcon icon={eyeOutline} slot="start" />
                  Details
                </IonButton>
                <IonButton fill="clear" size="small" onClick={() => {
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
                <IonButton color="success" size="small" onClick={() => openApprovalModal(request, approvalType)}>
                  <IonIcon icon={checkmarkCircleOutline} slot="start" />
                  {approvalType === 'hr' ? 'Final Approve' : 'Pre-Approve'}
                </IonButton>
                <IonButton color="danger" size="small" fill="outline" onClick={() => openRejectionModal(request, approvalType)} className="ion-margin-start">
                  <IonIcon icon={closeCircleOutline} slot="start" />
                  Reject
                </IonButton>
              </IonCol>
            </IonRow>
          </IonGrid>
        </IonCardContent>
      </IonCard>
    );
  };

  return (
    <MainLayout 
      title="Leave Approval"
      showRefresh={true}
      onRefresh={() => loadAllPendingRequests()}
      isLoading={loading}
    >
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        {/* Segment for switching between Supervisor and HR approval */}
        {(isSupervisor || isHR) && (
          <IonSegment 
            value={activeSegment} 
            onIonChange={e => setActiveSegment(e.detail.value as string)}
            className="ion-margin"
          >
            {isSupervisor && (
              <IonSegmentButton value="supervisor">
                <IonLabel>Supervisor Approval</IonLabel>
                {pendingRequests.length > 0 && (
                  <IonBadge color="warning">{pendingRequests.length}</IonBadge>
                )}
              </IonSegmentButton>
            )}
            {isHR && (
              <IonSegmentButton value="hr">
                <IonLabel>HR Final Approval</IonLabel>
                {hrPendingRequests.length > 0 && (
                  <IonBadge color="tertiary">{hrPendingRequests.length}</IonBadge>
                )}
              </IonSegmentButton>
            )}
            {isHR && (
              <IonSegmentButton value="hr_bypass">
                <IonLabel>Direct Approve</IonLabel>
                {hrBypassRequests.length > 0 && (
                  <IonBadge color="danger">{hrBypassRequests.length}</IonBadge>
                )}
              </IonSegmentButton>
            )}
          </IonSegment>
        )}

        {/* Supervisor Approval Tab */}
        {activeSegment === 'supervisor' && isSupervisor && (
          <>
            {/* Approver Info Card */}
            {approverInfo && (
              <IonCard className="ion-margin">
                <IonCardHeader>
                  <IonCardTitle>Your Supervisor Authority</IonCardTitle>
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
                  <IonNote>
                    <small>Pre-approve requests to forward them to HR for final approval.</small>
                  </IonNote>
                </IonCardContent>
              </IonCard>
            )}

            {/* Summary Card */}
            <IonCard className="ion-margin">
              <IonCardHeader>
                <IonCardTitle>Pending Supervisor Approvals</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonGrid>
                  <IonRow>
                    <IonCol size="6" className="ion-text-center">
                      <IonText color="warning">
                        <h2>{pendingRequests.length}</h2>
                        <p>Pending Pre-Approval</p>
                      </IonText>
                    </IonCol>
                    <IonCol size="6" className="ion-text-center">
                      <IonText color="danger">
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
                      <h3>No pending pre-approvals</h3>
                      <p>All leave requests under your authority have been processed</p>
                    </IonText>
                  </IonCardContent>
                </IonCard>
              ) : (
                <IonList>
                  {pendingRequests.map((request) => renderRequestCard(request, 'supervisor'))}
                </IonList>
              )}
            </div>
          </>
        )}

        {/* HR Final Approval Tab */}
        {activeSegment === 'hr' && isHR && (
          <>
            {/* HR Info Card */}
            {hrApproverInfo && (
              <IonCard className="ion-margin">
                <IonCardHeader>
                  <IonCardTitle>HR Final Approval Authority</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <IonGrid>
                    <IonRow>
                      <IonCol size="6">
                        <IonText>
                          <h3>{hrApproverInfo.name}</h3>
                          <p>{hrApproverInfo.position}</p>
                        </IonText>
                      </IonCol>
                      <IonCol size="6" className="ion-text-right">
                        <IonChip color="tertiary">
                          <IonIcon icon={briefcaseOutline} />
                          <IonLabel>HR</IonLabel>
                        </IonChip>
                      </IonCol>
                    </IonRow>
                  </IonGrid>
                  <IonNote>
                    <small>These requests have been pre-approved by supervisors. Final approval will deduct leave credits.</small>
                  </IonNote>
                </IonCardContent>
              </IonCard>
            )}

            {/* Summary Card */}
            <IonCard className="ion-margin">
              <IonCardHeader>
                <IonCardTitle>Awaiting HR Final Approval</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonGrid>
                  <IonRow>
                    <IonCol size="6" className="ion-text-center">
                      <IonText color="tertiary">
                        <h2>{hrPendingRequests.length}</h2>
                        <p>Awaiting Final Approval</p>
                      </IonText>
                    </IonCol>
                    <IonCol size="6" className="ion-text-center">
                      <IonText color="danger">
                        <h2>{hrPendingRequests.filter(r => 
                          new Date(r.start_date) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                        ).length}</h2>
                        <p>Urgent (&lt; 7 days)</p>
                      </IonText>
                    </IonCol>
                  </IonRow>
                </IonGrid>
              </IonCardContent>
            </IonCard>

            {/* HR Pending Requests List */}
            <div className="ion-padding">
              {hrPendingRequests.length === 0 ? (
                <IonCard>
                  <IonCardContent className="ion-text-center">
                    <IonIcon icon={documentTextOutline} size="large" color="medium" />
                    <IonText color="medium">
                      <h3>No requests awaiting HR approval</h3>
                      <p>All supervisor-approved requests have been processed</p>
                    </IonText>
                  </IonCardContent>
                </IonCard>
              ) : (
                <IonList>
                  {hrPendingRequests.map((request) => renderRequestCard(request, 'hr'))}
                </IonList>
              )}
            </div>
          </>
        )}

        {/* HR Direct Approve (Bypass Supervisor) Tab */}
        {activeSegment === 'hr_bypass' && isHR && (
          <>
            {/* HR Bypass Info Card */}
            <IonCard className="ion-margin p-5" color="">
              <IonCardHeader>
                <IonCardTitle>Direct Approval (Bypass Supervisor)</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonText>
                  <p>These requests are pending supervisor pre-approval. As HR, you can directly approve them, bypassing the supervisor step.</p>
                  <p><strong>Use this for urgent requests or when the supervisor is unavailable.</strong></p>
                </IonText>
              </IonCardContent>
            </IonCard>

            {/* Summary Card */}
            <IonCard className="ion-margin p-5">
              <IonCardHeader>
                <IonCardTitle>Pending Supervisor Approval</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonGrid>
                  <IonRow>
                    <IonCol size="6" className="ion-text-center">
                      <IonText color="warning">
                        <h2>{hrBypassRequests.length}</h2>
                        <p>Awaiting Supervisor</p>
                      </IonText>
                    </IonCol>
                    <IonCol size="6" className="ion-text-center">
                      <IonText color="danger">
                        <h2>{hrBypassRequests.filter(r => 
                          new Date(r.start_date) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                        ).length}</h2>
                        <p>Urgent (&lt; 7 days)</p>
                      </IonText>
                    </IonCol>
                  </IonRow>
                </IonGrid>
              </IonCardContent>
            </IonCard>

            {/* HR Bypass Requests List */}
            <div className="ion-padding">
              {hrBypassRequests.length === 0 ? (
                <IonCard>
                  <IonCardContent className="ion-text-center">
                    <IonIcon icon={documentTextOutline} size="large" color="medium" />
                    <IonText color="medium">
                      <h3>No requests pending supervisor approval</h3>
                      <p>All requests have either been processed or are awaiting HR final approval</p>
                    </IonText>
                  </IonCardContent>
                </IonCard>
              ) : (
                <IonList>
                  {hrBypassRequests.map((request) => {
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
                                </IonText>
                              </IonCol>
                              <IonCol size="auto">
                                <IonChip className='p-2 px-3' color={getLeaveTypeColor(request.leave_type)}>
                                  {request.leave_type}
                                </IonChip>
                              </IonCol>
                            </IonRow>
                            <IonRow>
                              <IonCol>
                                <IonNote>
                                  <IonIcon icon={calendarOutline} /> {new Date(request.start_date).toLocaleDateString()} - {new Date(request.end_date).toLocaleDateString()}
                                  <br />
                                  <strong>{request.days_requested} day(s)</strong>
                                </IonNote>
                              </IonCol>
                              <IonCol size="auto" className='mt-2'>
                                <IonBadge className='p-2 px-3' color="warning">Pending Supervisor</IonBadge>
                              </IonCol>
                            </IonRow>
                            <IonRow className="ion-margin-top">
                              <IonCol>
                                <IonButton 
                                  fill="clear" 
                                  size="small"
                                  onClick={() => openDetailsModal(request)}
                                >
                                  <IonIcon icon={eyeOutline} slot="start" />
                                  Details
                                </IonButton>
                              </IonCol>
                              <IonCol size="auto" className='flex gap-2'>
                                <IonButton 
                                  color="danger" 
                                  fill="outline"
                                  size="small"
                                  onClick={() => openRejectionModal(request, 'hr_bypass')}
                                >
                                  <IonIcon icon={closeCircleOutline} slot="start" />
                                  Reject
                                </IonButton>
                                <IonButton 
                                  color="success"
                                  size="small"
                                  onClick={() => openBypassModal(request)}
                                >
                                  <IonIcon icon={checkmarkCircleOutline} slot="start" />
                                  Direct Approve
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
            </div>
          </>
        )}        {/* Request Details Modal */}
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
                    {getStatusDisplayText(selectedRequest.status)}
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
                    
                    {/* Approval Workflow Status */}
                    <IonItem>
                      <IonLabel>
                        <h3>Approval Workflow</h3>
                        <div style={{ marginTop: '8px' }}>
                          {/* Step 1: Supervisor */}
                          <IonChip 
                            color={selectedRequest.supervisor_approved_by ? 'success' : 
                                   selectedRequest.status === 'Pending' ? 'warning' : 
                                   selectedRequest.status === 'Rejected' && !selectedRequest.approved_by ? 'danger' : 'medium'}
                          >
                            <IonIcon icon={selectedRequest.supervisor_approved_by ? checkmarkCircleOutline : 
                                          selectedRequest.status === 'Rejected' && !selectedRequest.approved_by ? closeCircleOutline : timeOutline} />
                            <IonLabel>
                              Step 1: Supervisor {selectedRequest.supervisor_approved_by ? '✓' : 
                                                 selectedRequest.status === 'Pending' ? '(Pending)' : 
                                                 selectedRequest.status === 'Rejected' && !selectedRequest.approved_by ? '✗' : ''}
                            </IonLabel>
                          </IonChip>
                          
                          {selectedRequest.supervisor_approved_by && (
                            <p style={{ marginLeft: '16px', fontSize: '0.9em' }}>
                              By: {selectedRequest.supervisor_approved_by.first_name} {selectedRequest.supervisor_approved_by.last_name}
                              {selectedRequest.supervisor_approval_date && (
                                <> on {leaveService.formatDate(selectedRequest.supervisor_approval_date)}</>
                              )}
                              {selectedRequest.supervisor_approval_notes && (
                                <><br />Notes: {selectedRequest.supervisor_approval_notes}</>
                              )}
                            </p>
                          )}
                          
                          {/* Step 2: HR */}
                          <IonChip 
                            color={selectedRequest.approved_by && selectedRequest.status === 'Approved' ? 'success' : 
                                   selectedRequest.status === 'Supervisor_Approved' ? 'warning' :
                                   selectedRequest.status === 'Rejected' && selectedRequest.approved_by ? 'danger' : 'medium'}
                            style={{ marginTop: '8px' }}
                          >
                            <IonIcon icon={selectedRequest.approved_by && selectedRequest.status === 'Approved' ? checkmarkCircleOutline : 
                                          selectedRequest.status === 'Rejected' && selectedRequest.approved_by ? closeCircleOutline : timeOutline} />
                            <IonLabel>
                              Step 2: HR Final {selectedRequest.approved_by && selectedRequest.status === 'Approved' ? '✓' : 
                                               selectedRequest.status === 'Supervisor_Approved' ? '(Pending)' : 
                                               selectedRequest.status === 'Rejected' && selectedRequest.approved_by ? '✗' : ''}
                            </IonLabel>
                          </IonChip>
                          
                          {selectedRequest.approved_by && (
                            <p style={{ marginLeft: '16px', fontSize: '0.9em' }}>
                              By: {selectedRequest.approved_by.first_name} {selectedRequest.approved_by.last_name}
                              {selectedRequest.approval_date && (
                                <> on {leaveService.formatDate(selectedRequest.approval_date)}</>
                              )}
                              {selectedRequest.approval_notes && (
                                <><br />Notes: {selectedRequest.approval_notes}</>
                              )}
                            </p>
                          )}
                        </div>
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
              <IonTitle>
                {currentApprovalType === 'hr' ? 'HR Final Approval' : 'Supervisor Pre-Approval'}
              </IonTitle>
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
                      <h3>
                        {currentApprovalType === 'hr' 
                          ? 'Giving final approval for:' 
                          : 'Pre-approving request for:'}
                      </h3>
                      <p><strong>{selectedRequest.employee?.full_name || 
                         `${selectedRequest.employee?.first_name} ${selectedRequest.employee?.last_name}`}</strong></p>
                      <p>{selectedRequest.leave_type} - {selectedRequest.days_requested} day(s)</p>
                      <p>{leaveService.formatDate(selectedRequest.start_date)} to {leaveService.formatDate(selectedRequest.end_date)}</p>
                    </IonText>
                    
                    {currentApprovalType === 'hr' && selectedRequest.supervisor_approved_by && (
                      <IonNote className="ion-margin-top">
                        <IonChip color="tertiary" outline>
                          <IonIcon icon={checkmarkCircleOutline} />
                          <IonLabel>
                            Pre-approved by {selectedRequest.supervisor_approved_by.first_name} {selectedRequest.supervisor_approved_by.last_name}
                          </IonLabel>
                        </IonChip>
                      </IonNote>
                    )}
                  </IonCardContent>
                </IonCard>

                {currentApprovalType === 'hr' && (
                  <IonCard color="warning">
                    <IonCardContent>
                      <IonText>
                        <strong>Note:</strong> Final approval will deduct {selectedRequest.days_requested} day(s) from the employee's leave credits.
                      </IonText>
                    </IonCardContent>
                  </IonCard>
                )}

                {currentApprovalType === 'supervisor' && (
                  <IonCard color="primary">
                    <IonCardContent>
                      <IonText>
                        <strong>Note:</strong> This is a pre-approval. The request will be forwarded to HR for final approval.
                      </IonText>
                    </IonCardContent>
                  </IonCard>
                )}

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
                  {currentApprovalType === 'hr' ? 'Give Final Approval' : 'Pre-Approve Request'}
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
        </IonModal>

        {/* HR Bypass Approval Modal */}
        <IonModal 
          isOpen={showBypassModal} 
          onDidDismiss={() => {
            setShowBypassModal(false);
            setBypassReason('');
            setApprovalNotes('');
          }}
          className="large-modal"
        >
          <IonHeader>
            <IonToolbar color="warning">
              <IonTitle>Direct Approve (Bypass Supervisor)</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowBypassModal(false)}>Cancel</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            {selectedRequest && (
              <>
                <IonCard color="warning">
                  <IonCardContent>
                    <IonText>
                      <h3>⚠️ Bypassing Supervisor Approval</h3>
                      <p>You are about to approve this request directly, bypassing the supervisor pre-approval step.</p>
                      <p><strong>This action should only be used when:</strong></p>
                      <ul>
                        <li>The request is urgent and the supervisor is unavailable</li>
                        <li>There is a valid reason to bypass the normal approval process</li>
                      </ul>
                    </IonText>
                  </IonCardContent>
                </IonCard>

                <IonCard>
                  <IonCardContent>
                    <IonText>
                      <h3>Request Details:</h3>
                      <p><strong>Employee:</strong> {selectedRequest.employee?.full_name || 
                         `${selectedRequest.employee?.first_name} ${selectedRequest.employee?.last_name}`}</p>
                      <p><strong>Leave Type:</strong> {selectedRequest.leave_type}</p>
                      <p><strong>Duration:</strong> {selectedRequest.days_requested} day(s)</p>
                      <p><strong>Dates:</strong> {leaveService.formatDate(selectedRequest.start_date)} to {leaveService.formatDate(selectedRequest.end_date)}</p>
                      <p><strong>Reason:</strong> {selectedRequest.reason}</p>
                    </IonText>
                  </IonCardContent>
                </IonCard>

                <IonList>
                  <IonItem>
                    <IonLabel position="stacked">Reason for Bypassing Supervisor *</IonLabel>
                    <IonTextarea
                      value={bypassReason}
                      onIonInput={(e) => setBypassReason(e.detail.value!)}
                      placeholder="Please explain why supervisor approval is being bypassed..."
                      rows={3}
                    />
                  </IonItem>
                  <IonItem>
                    <IonLabel position="stacked">Additional Approval Notes (Optional)</IonLabel>
                    <IonTextarea
                      value={approvalNotes}
                      onIonInput={(e) => setApprovalNotes(e.detail.value!)}
                      placeholder="Any additional notes for this approval..."
                      rows={2}
                    />
                  </IonItem>
                </IonList>

                <IonNote className="ion-margin">
                  <p>The bypass reason will be recorded in the system for audit purposes.</p>
                </IonNote>

                <IonButton
                  expand="block"
                  color="success"
                  className="ion-margin-top"
                  onClick={handleBypassApprove}
                  disabled={!bypassReason.trim()}
                >
                  <IonIcon icon={checkmarkCircleOutline} slot="start" />
                  Approve & Bypass Supervisor
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
      <style>
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
    </MainLayout>
  );
};

export default LeaveApproval;
