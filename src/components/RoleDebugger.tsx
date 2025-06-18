// RoleDebugger.tsx - Component to debug and display current user role information

import React from 'react';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonItem,
  IonLabel,
  IonBadge,
  IonChip,
  IonIcon,
  IonText
} from '@ionic/react';
import {
  checkmarkCircleOutline,
  closeCircleOutline,
  shieldOutline
} from 'ionicons/icons';
import { useRole } from '../contexts/RoleContext';

const RoleDebugger: React.FC = () => {
  const { userRole, employee, loading, hasPermission } = useRole();

  const permissions = [
    'viewAllRequests',
    'approveRequests', 
    'manageLeaveCredits',
    'manageLeavePolicies',
    'viewReports',
    'manageEmployees'
  ];

  if (loading) {
    return (
      <IonCard>
        <IonCardHeader>
          <IonCardTitle>Role Information</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <IonText>Loading role information...</IonText>
        </IonCardContent>
      </IonCard>
    );
  }

  return (
    <IonCard>
      <IonCardHeader>
        <IonCardTitle>
          <IonIcon icon={shieldOutline} style={{ marginRight: '8px' }} />
          Role Debug Information
        </IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        {/* Employee Information */}
        <IonItem lines="none">
          <IonLabel>
            <h3>Employee</h3>
            <p>{employee?.full_name || employee?.firstName + ' ' + employee?.lastName || 'No employee data'}</p>
            <p>Position: {employee?.position_title || 'Unknown'}</p>
            <p>Department: {employee?.department_name || 'Unknown'}</p>
          </IonLabel>
        </IonItem>

        {/* Role Information */}
        <IonItem lines="none">
          <IonLabel>
            <h3>Role Information</h3>
            <p>Title: {userRole?.title || 'No role assigned'}</p>
            <p>Level: {userRole?.level ?? 'Unknown'}</p>
            <p>Approval Scope: {userRole?.approvalScope || 'None'}</p>
          </IonLabel>
          <IonBadge color={userRole?.canApprove ? 'success' : 'medium'}>
            {userRole?.canApprove ? 'Can Approve' : 'Cannot Approve'}
          </IonBadge>
        </IonItem>

        {/* Permissions */}
        <IonItem lines="none">
          <IonLabel>
            <h3>Permissions</h3>
          </IonLabel>
        </IonItem>
        
        {permissions.map((permission) => (
          <IonItem key={permission} lines="none">
            <IonIcon
              icon={hasPermission(permission as any) ? checkmarkCircleOutline : closeCircleOutline}
              color={hasPermission(permission as any) ? 'success' : 'danger'}
              slot="start"
            />
            <IonLabel>
              <p>{permission}</p>
            </IonLabel>
            <IonChip
              color={hasPermission(permission as any) ? 'success' : 'medium'}
              outline
            >
              {hasPermission(permission as any) ? 'Granted' : 'Denied'}
            </IonChip>
          </IonItem>
        ))}

        {/* Raw Data */}
        <IonItem lines="none" style={{ marginTop: '16px' }}>
          <IonLabel>
            <h3>Raw Role Data</h3>
            <p style={{ fontSize: '12px', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
              {JSON.stringify(userRole, null, 2)}
            </p>
          </IonLabel>
        </IonItem>

        <IonItem lines="none">
          <IonLabel>
            <h3>Raw Employee Data</h3>
            <p style={{ fontSize: '12px', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
              {JSON.stringify(employee, null, 2)}
            </p>
          </IonLabel>
        </IonItem>
      </IonCardContent>
    </IonCard>
  );
};

export default RoleDebugger;
