// LeaveRequest.tsx - API-based Leave Request Management with Role-based Access Control

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
  IonSelect,
  IonSelectOption,
  IonDatetime,
  IonBadge,
  IonGrid,
  IonRow,
  IonCol,
  IonFab,
  IonFabButton,
  IonSegment,
  IonSegmentButton,
  IonModal,
  IonButtons,
  IonBackButton,
  IonSpinner,
  IonText,
  IonChip,
  IonProgressBar,
  IonToast,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/react';
import {
  addOutline,
  documentTextOutline,
  checkmarkCircleOutline,
  hourglassOutline,
  closeCircleOutline,
  eyeOutline,
} from 'ionicons/icons';
import { useRole } from '../../contexts/RoleContext';
import leaveService, { LeaveRequest as LeaveRequestType, LeaveCredit, LeavePolicy } from '../../services/LeaveService';

const LeaveRequest: React.FC = () => {
  const { employee, loading: roleLoading } = useRole();
  
  // State management
  const [activeSegment, setActiveSegment] = useState<string>('my-requests');
  const [myRequests, setMyRequests] = useState<LeaveRequestType[]>([]);
  const [leaveCredits, setLeaveCredits] = useState<LeaveCredit[]>([]);
  const [leavePolicies, setLeavePolicies] = useState<LeavePolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<LeaveRequestType | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState<'success' | 'danger' | 'warning'>('success');
  
  // Form state for creating new requests
  const [newRequest, setNewRequest] = useState({
    leave_type: '',
    start_date: '',
    end_date: '',
    reason: '',
    supporting_documents: [] as string[]
  });

  useEffect(() => {
    if (!roleLoading) {
      loadData();
    }
  }, [roleLoading]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [requestsData, creditsData, policiesData] = await Promise.all([
        leaveService.getMyLeaveRequests(),
        leaveService.getMyLeaveCredits(),
        leaveService.getLeavePolicies()
      ]);
      
      setMyRequests(requestsData);
      setLeaveCredits(creditsData);
      setLeavePolicies(policiesData);
    } catch (error) {
      console.error('Error loading leave data:', error);
      showToastMessage('Error loading leave data', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async (event: CustomEvent) => {
    await loadData();
    event.detail.complete();
  };

  const showToastMessage = (message: string, color: 'success' | 'danger' | 'warning' = 'success') => {
    setToastMessage(message);
    setToastColor(color);
    setShowToast(true);
  };

  const calculateDays = () => {
    if (newRequest.start_date && newRequest.end_date) {
      return leaveService.calculateBusinessDays(newRequest.start_date, newRequest.end_date);
    }
    return 0;
  };

  const handleCreateRequest = async () => {
    try {
      const days = calculateDays();
      if (days <= 0) {
        showToastMessage('Please select valid dates', 'danger');
        return;
      }

      await leaveService.createLeaveRequest({
        ...newRequest,
        days_requested: days
      });

      showToastMessage('Leave request created successfully!', 'success');
      setShowCreateModal(false);
      setNewRequest({
        leave_type: '',
        start_date: '',
        end_date: '',
        reason: '',
        supporting_documents: []
      });
      loadData();
    } catch (error) {
      console.error('Error creating leave request:', error);
      showToastMessage('Error creating leave request', 'danger');
    }
  };

  const handleCancelRequest = async (requestId: number) => {
    try {
      await leaveService.cancelLeaveRequest(requestId);
      showToastMessage('Leave request cancelled successfully', 'success');
      loadData();
    } catch (error) {
      console.error('Error cancelling leave request:', error);
      showToastMessage('Error cancelling leave request', 'danger');
    }
  };

  const getStatusColor = (status: string) => leaveService.getStatusColor(status);
  const getLeaveTypeColor = (leaveType: string) => leaveService.getLeaveTypeColor(leaveType);

  const getCurrentYearCredits = () => {
    const currentYear = new Date().getFullYear();
    return leaveCredits.filter(credit => credit.year === currentYear);
  };

  if (loading || roleLoading) {
    return (
      <IonPage>
        <IonContent className="ion-padding ion-text-center">
          <div style={{ marginTop: '50%' }}>
            <IonSpinner name="crescent" color="primary" />
            <IonText>
              <p>Loading leave data...</p>
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
          <IonTitle>Leave Management</IonTitle>
        </IonToolbar>
      </IonHeader>
      
      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        {/* Segment for navigation */}
        <IonSegment 
          value={activeSegment} 
          onIonChange={e => setActiveSegment(e.detail.value as string)}
          className="ion-margin"
        >
          <IonSegmentButton value="my-requests">
            <IonLabel>My Requests</IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="leave-balance">
            <IonLabel>Leave Balance</IonLabel>
          </IonSegmentButton>
        </IonSegment>

        {/* My Requests Tab */}
        {activeSegment === 'my-requests' && (
          <div className="ion-padding">
            {/* Summary Card */}
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Leave Requests Summary</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonGrid>
                  <IonRow>
                    <IonCol size="6" className="ion-text-center">
                      <IonText color="primary">
                        <h2>{myRequests.length}</h2>
                        <p>Total Requests</p>
                      </IonText>
                    </IonCol>
                    <IonCol size="6" className="ion-text-center">
                      <IonText color="warning">
                        <h2>{myRequests.filter(r => r.status === 'Pending').length}</h2>
                        <p>Pending</p>
                      </IonText>
                    </IonCol>
                  </IonRow>
                </IonGrid>
              </IonCardContent>
            </IonCard>

            {/* Request List */}
            {myRequests.length === 0 ? (
              <IonCard>
                <IonCardContent className="ion-text-center">
                  <IonIcon icon={documentTextOutline} size="large" color="medium" />
                  <IonText color="medium">
                    <h3>No leave requests yet</h3>
                    <p>Create your first leave request using the + button</p>
                  </IonText>
                </IonCardContent>
              </IonCard>
            ) : (
              <IonList>
                {myRequests.map((request) => (
                  <IonCard key={request.id}>
                    <IonCardContent>
                      <IonGrid>
                        <IonRow className="ion-align-items-center">
                          <IonCol>
                            <IonText>
                              <h3>{request.leave_type}</h3>
                              <p>
                                {leaveService.formatDate(request.start_date)} - {leaveService.formatDate(request.end_date)}
                              </p>
                              <p>{request.days_requested} day(s)</p>
                            </IonText>
                          </IonCol>
                          <IonCol size="auto">
                            <IonBadge color={getStatusColor(request.status)}>
                              {request.status}
                            </IonBadge>
                          </IonCol>
                        </IonRow>
                        <IonRow>
                          <IonCol>
                            <IonButton 
                              fill="clear" 
                              size="small"
                              onClick={() => {
                                setSelectedRequest(request);
                                setShowDetailsModal(true);
                              }}
                            >
                              <IonIcon icon={eyeOutline} slot="start" />
                              View Details
                            </IonButton>
                            {request.status === 'Pending' && (
                              <IonButton 
                                fill="clear" 
                                size="small" 
                                color="danger"
                                onClick={() => handleCancelRequest(request.id!)}
                              >
                                <IonIcon icon={closeCircleOutline} slot="start" />
                                Cancel
                              </IonButton>
                            )}
                          </IonCol>
                        </IonRow>
                      </IonGrid>
                    </IonCardContent>
                  </IonCard>
                ))}
              </IonList>
            )}
          </div>
        )}

        {/* Leave Balance Tab */}
        {activeSegment === 'leave-balance' && (
          <div className="ion-padding">
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Current Year Leave Balance</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                {getCurrentYearCredits().length === 0 ? (
                  <IonText color="medium">
                    <p>No leave credits available for this year</p>
                  </IonText>
                ) : (
                  <IonList>
                    {getCurrentYearCredits().map((credit) => (
                      <IonItem key={credit.id} lines="full">
                        <IonLabel>
                          <h3>{credit.leave_type}</h3>
                          <p>Used: {credit.used_credits} | Remaining: {credit.remaining_credits}</p>
                          <div style={{ marginTop: '8px' }}>
                            <IonProgressBar 
                              value={credit.used_credits / credit.total_credits}
                              color={credit.remaining_credits > 5 ? 'success' : credit.remaining_credits > 2 ? 'warning' : 'danger'}
                            />
                          </div>
                        </IonLabel>
                        <IonChip color={getLeaveTypeColor(credit.leave_type)}>
                          {credit.remaining_credits}/{credit.total_credits}
                        </IonChip>
                      </IonItem>
                    ))}
                  </IonList>
                )}
              </IonCardContent>
            </IonCard>

            {/* Leave Policies Card */}
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Available Leave Types</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonList>
                  {leavePolicies.map((policy) => (
                    <IonItem key={policy.id} lines="full">
                      <IonLabel>
                        <h3>{policy.leave_type}</h3>
                        <p>{policy.description}</p>
                        <p>
                          <IonText color="primary">
                            <strong>{policy.days_allowed} days allowed per year</strong>
                          </IonText>
                        </p>
                      </IonLabel>
                      <IonChip color={getLeaveTypeColor(policy.leave_type)}>
                        {policy.days_allowed} days
                      </IonChip>
                    </IonItem>
                  ))}
                </IonList>
              </IonCardContent>
            </IonCard>
          </div>
        )}

        {/* Floating Action Button for Create Request */}
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={() => setShowCreateModal(true)}>
            <IonIcon icon={addOutline} />
          </IonFabButton>
        </IonFab>

        {/* Create Request Modal */}
        <IonModal isOpen={showCreateModal} onDidDismiss={() => setShowCreateModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Create Leave Request</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowCreateModal(false)}>Close</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <IonList>
              <IonItem>
                <IonLabel position="stacked">Leave Type</IonLabel>                <IonSelect
                  value={newRequest.leave_type}
                  onIonChange={(e) => setNewRequest({...newRequest, leave_type: e.detail.value})}
                  placeholder="Select leave type"
                >
                  {leavePolicies.map((policy) => (
                    <IonSelectOption key={policy.id} value={policy.leave_type}>
                      {policy.leave_type} ({policy.days_allowed} days)
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>

              <IonItem>
                <IonLabel position="stacked">Start Date</IonLabel>
                <IonDatetime
                  value={newRequest.start_date}
                  onIonChange={(e) => setNewRequest({...newRequest, start_date: e.detail.value as string})}
                  presentation="date"
                  min={new Date().toISOString()}
                />
              </IonItem>

              <IonItem>
                <IonLabel position="stacked">End Date</IonLabel>
                <IonDatetime
                  value={newRequest.end_date}
                  onIonChange={(e) => setNewRequest({...newRequest, end_date: e.detail.value as string})}
                  presentation="date"
                  min={newRequest.start_date || new Date().toISOString()}
                />
              </IonItem>

              {newRequest.start_date && newRequest.end_date && (
                <IonItem>
                  <IonLabel>
                    <h3>Business Days: {calculateDays()}</h3>
                  </IonLabel>
                </IonItem>
              )}

              <IonItem>
                <IonLabel position="stacked">Reason</IonLabel>
                <IonTextarea
                  value={newRequest.reason}
                  onIonInput={(e) => setNewRequest({...newRequest, reason: e.detail.value!})}
                  placeholder="Enter reason for leave"
                  rows={4}
                />
              </IonItem>
            </IonList>

            <IonButton
              expand="block"
              className="ion-margin-top"
              onClick={handleCreateRequest}
              disabled={!newRequest.leave_type || !newRequest.start_date || !newRequest.end_date || !newRequest.reason}
            >
              Create Leave Request
            </IonButton>
          </IonContent>
        </IonModal>

        {/* Request Details Modal */}
        <IonModal isOpen={showDetailsModal} onDidDismiss={() => setShowDetailsModal(false)}>
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
                  <IonList>
                    <IonItem>
                      <IonLabel>
                        <h3>Start Date</h3>
                        <p>{leaveService.formatDate(selectedRequest.start_date)}</p>
                      </IonLabel>
                    </IonItem>
                    <IonItem>
                      <IonLabel>
                        <h3>End Date</h3>
                        <p>{leaveService.formatDate(selectedRequest.end_date)}</p>
                      </IonLabel>
                    </IonItem>
                    <IonItem>
                      <IonLabel>
                        <h3>Days Requested</h3>
                        <p>{selectedRequest.days_requested}</p>
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
                    {selectedRequest.approved_by && (
                      <IonItem>
                        <IonLabel>
                          <h3>Approved By</h3>
                          <p>{selectedRequest.approved_by.full_name}</p>
                        </IonLabel>
                      </IonItem>
                    )}
                    {selectedRequest.approval_date && (
                      <IonItem>
                        <IonLabel>
                          <h3>Approval Date</h3>
                          <p>{leaveService.formatDate(selectedRequest.approval_date)}</p>
                        </IonLabel>
                      </IonItem>
                    )}
                    {selectedRequest.approval_notes && (
                      <IonItem>
                        <IonLabel>
                          <h3>Notes</h3>
                          <p>{selectedRequest.approval_notes}</p>
                        </IonLabel>
                      </IonItem>
                    )}
                  </IonList>
                </IonCardContent>
              </IonCard>
            )}
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
      </IonContent>
    </IonPage>
  );
};

export default LeaveRequest;
