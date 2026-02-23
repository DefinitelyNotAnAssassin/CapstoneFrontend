/**
 * User Permissions Management Page
 * 
 * HR interface for assigning roles to employees.
 * Allows viewing, adding, and removing role assignments.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonIcon,
  IonBadge,
  IonSearchbar,
  IonList,
  IonItem,
  IonLabel,
  IonChip,
  IonModal,
  IonSelect,
  IonSelectOption,
  IonCheckbox,
  IonSpinner,
  IonAlert,
  IonToast,
  IonButtons,
  IonBackButton,
  IonGrid,
  IonRow,
  IonCol,
  IonNote,
  IonItemDivider,
  IonToggle,
  IonAvatar,
  IonDatetime,
  IonTextarea,
  IonSegment,
  IonSegmentButton,
  IonAccordion,
  IonAccordionGroup,
  IonInput,
} from '@ionic/react';
import {
  addOutline,
  personOutline,
  trashOutline,
  peopleOutline,
  shieldCheckmarkOutline,
  starOutline,
  starSharp,
  timeOutline,
  businessOutline,
  schoolOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  keyOutline,
} from 'ionicons/icons';
import rbacService, {
  RoleList,
  EmployeeRole,
  AssignRolePayload,
} from '../../services/RBACService';
import { useRole } from '../../contexts/RoleContext';
import './UserPermissions.css';

interface Employee {
  id: number;
  employee_id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string;
  position_title: string;
  department_name: string;
  profile_image?: string;
}

interface Department {
  id: number;
  name: string;
}

interface Program {
  id: number;
  name: string;
}

const UserPermissions: React.FC = () => {
  const { hasPermission, isHR } = useRole();
  
  // State
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [employeeRoles, setEmployeeRoles] = useState<EmployeeRole[]>([]);
  const [availableRoles, setAvailableRoles] = useState<RoleList[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [viewMode, setViewMode] = useState<'by-employee' | 'by-role'>('by-employee');
  
  // Modals
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<EmployeeRole | null>(null);
  
  // Form state
  const [assignForm, setAssignForm] = useState<AssignRolePayload>({
    employee: 0,
    role: 0,
    department_scope: null,
    program_scope: null,
    is_primary: false,
    is_active: true,
    valid_from: null,
    valid_until: null,
    notes: '',
  });
  
  // Toast
  const [toast, setToast] = useState<{ show: boolean; message: string; color: string }>({
    show: false,
    message: '',
    color: 'success',
  });

  // Permission check
  const canAssignRoles = hasPermission('rbac_assign_roles') || isHR;

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      // Get auth headers
      const token = localStorage.getItem('authToken');
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      console.log('Loading initial data...');
      
      const [rolesData, employeesResponse, deptsResponse, progsResponse] = await Promise.all([
        rbacService.getAssignableRoles(),
        fetch('https://dharklike.pythonanywhere.com/api/employees/', { headers }).then(async r => {
          if (!r.ok) throw new Error(`Employees API error: ${r.status}`);
          const data = await r.json();
          console.log('Employees response:', data);
          // Handle paginated response
          return Array.isArray(data) ? data : (data.results || []);
        }),
        fetch('https://dharklike.pythonanywhere.com/api/departments/', { headers }).then(async r => {
          if (!r.ok) throw new Error(`Departments API error: ${r.status}`);
          const data = await r.json();
          console.log('Departments response:', data);
          return Array.isArray(data) ? data : (data.results || []);
        }),
        fetch('https://dharklike.pythonanywhere.com/api/programs/', { headers }).then(async r => {
          if (!r.ok) throw new Error(`Programs API error: ${r.status}`);
          const data = await r.json();
          console.log('Programs response:', data);
          return Array.isArray(data) ? data : (data.results || []);
        }),
      ]);
      
      console.log('Data loaded successfully:', {
        roles: rolesData.length,
        employees: employeesResponse.length,
        departments: deptsResponse.length,
        programs: progsResponse.length
      });
      
      setAvailableRoles(rolesData);
      setEmployees(employeesResponse);
      setDepartments(deptsResponse);
      setPrograms(progsResponse);
    } catch (error) {
      console.error('Error loading data:', error);
      showToast(`Failed to load data: ${error instanceof Error ? error.message : 'Unknown error'}`, 'danger');
    } finally {
      setLoading(false);
    }
  };

  const loadEmployeeRoles = useCallback(async (employeeId: number) => {
    setLoadingRoles(true);
    try {
      console.log('Loading roles for employee:', employeeId);
      const roles = await rbacService.getEmployeeRolesById(employeeId);
      console.log('Employee roles loaded:', roles);
      setEmployeeRoles(roles);
    } catch (error) {
      console.error('Error loading employee roles:', error);
      showToast(`Failed to load employee roles: ${error instanceof Error ? error.message : 'Unknown error'}`, 'danger');
    } finally {
      setLoadingRoles(false);
    }
  }, []);

  const selectEmployee = (employee: Employee) => {
    setSelectedEmployee(employee);
    loadEmployeeRoles(employee.id);
    setAssignForm(prev => ({ ...prev, employee: employee.id }));
  };

  const showToast = (message: string, color: string = 'success') => {
    setToast({ show: true, message, color });
  };

  const handleAssignRole = async () => {
    if (!assignForm.employee || !assignForm.role) {
      showToast('Please select an employee and role', 'warning');
      return;
    }

    try {
      await rbacService.assignRole(assignForm);
      showToast('Role assigned successfully');
      setShowAssignModal(false);
      if (selectedEmployee) {
        loadEmployeeRoles(selectedEmployee.id);
      }
      // Reset form
      setAssignForm(prev => ({
        ...prev,
        role: 0,
        department_scope: null,
        program_scope: null,
        is_primary: false,
        valid_from: null,
        valid_until: null,
        notes: '',
      }));
    } catch (error: any) {
      showToast(error.message || 'Failed to assign role', 'danger');
    }
  };

  const handleRemoveRole = async () => {
    if (!roleToDelete) return;

    try {
      await rbacService.removeRoleAssignment(roleToDelete.id);
      showToast('Role removed successfully');
      if (selectedEmployee) {
        loadEmployeeRoles(selectedEmployee.id);
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to remove role', 'danger');
    }
    setRoleToDelete(null);
  };

  const handleSetPrimary = async (roleAssignment: EmployeeRole) => {
    try {
      await rbacService.setRolePrimary(roleAssignment.id);
      showToast('Primary role updated');
      if (selectedEmployee) {
        loadEmployeeRoles(selectedEmployee.id);
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to update primary role', 'danger');
    }
  };

  const filteredEmployees = employees.filter(emp =>
    emp.full_name?.toLowerCase().includes(searchText.toLowerCase()) ||
    emp.email?.toLowerCase().includes(searchText.toLowerCase()) ||
    emp.employee_id?.toLowerCase().includes(searchText.toLowerCase())
  );

  // Render employee list
  const renderEmployeeList = () => (
    <IonCard>
      <IonCardHeader>
        <IonCardTitle>
          <IonIcon icon={peopleOutline} className="ion-margin-end" />
          Employees
        </IonCardTitle>
      </IonCardHeader>
      <IonCardContent>
        <IonSearchbar
          value={searchText}
          onIonInput={(e) => setSearchText(e.detail.value || '')}
          placeholder="Search employees..."
        />

        <IonList>
          {filteredEmployees.map((emp) => (
            <IonItem
              key={emp.id}
              button
              onClick={() => selectEmployee(emp)}
              detail
              className={selectedEmployee?.id === emp.id ? 'selected-employee' : ''}
            >
              <IonAvatar slot="start">
                {emp.profile_image ? (
                  <img src={emp.profile_image} alt={emp.full_name} />
                ) : (
                  <div className="avatar-placeholder">
                    {emp.first_name?.[0]}{emp.last_name?.[0]}
                  </div>
                )}
              </IonAvatar>
              <IonLabel>
                <h2>{emp.full_name}</h2>
                <p>{emp.position_title}</p>
                <p className="small-text">{emp.department_name}</p>
              </IonLabel>
            </IonItem>
          ))}
        </IonList>
      </IonCardContent>
    </IonCard>
  );

  // Render employee permissions
  const renderEmployeePermissions = () => {
    if (!selectedEmployee) {
      return (
        <IonCard>
          <IonCardContent className="ion-text-center ion-padding">
            <IonIcon icon={personOutline} style={{ fontSize: '64px', color: 'var(--ion-color-medium)' }} />
            <h2>Select an Employee</h2>
            <p>Click on an employee from the list to view and manage their roles.</p>
          </IonCardContent>
        </IonCard>
      );
    }

    return (
      <IonCard>
        <IonCardHeader>
          <IonCardTitle>
            <div className="employee-header">
              <IonAvatar>
                {selectedEmployee.profile_image ? (
                  <img src={selectedEmployee.profile_image} alt={selectedEmployee.full_name} />
                ) : (
                  <div className="avatar-placeholder large">
                    {selectedEmployee.first_name?.[0]}{selectedEmployee.last_name?.[0]}
                  </div>
                )}
              </IonAvatar>
              <div>
                <h2>{selectedEmployee.full_name}</h2>
                <p>{selectedEmployee.position_title}</p>
                <p className="small-text">{selectedEmployee.department_name}</p>
              </div>
            </div>
          </IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          {canAssignRoles && (
            <IonButton
              expand="block"
              onClick={() => setShowAssignModal(true)}
              className="ion-margin-bottom"
            >
              <IonIcon icon={addOutline} slot="start" />
              Assign New Role
            </IonButton>
          )}

          <IonItemDivider>
            <IonLabel>Assigned Roles ({employeeRoles.length})</IonLabel>
          </IonItemDivider>

          {loadingRoles ? (
            <div className="ion-text-center ion-padding">
              <IonSpinner />
              <p>Loading roles...</p>
            </div>
          ) : employeeRoles.length === 0 ? (
            <div className="ion-text-center ion-padding">
              <IonIcon icon={keyOutline} style={{ fontSize: '48px', color: 'var(--ion-color-medium)' }} />
              <p>No roles assigned</p>
            </div>
          ) : (
            <IonList>
              {employeeRoles.map((roleAssignment) => (
                <IonItem key={roleAssignment.id}>
                  <IonIcon
                    icon={roleAssignment.is_primary ? starSharp : starOutline}
                    slot="start"
                    color={roleAssignment.is_primary ? 'warning' : 'medium'}
                    style={{ cursor: 'pointer' }}
                    onClick={() => !roleAssignment.is_primary && handleSetPrimary(roleAssignment)}
                  />
                  <IonLabel>
                    <h2>
                      {roleAssignment.role_name}
                      {roleAssignment.is_primary && (
                        <IonBadge color="warning" className="ion-margin-start">Primary</IonBadge>
                      )}
                    </h2>
                    <p>{roleAssignment.role_code} • Level {roleAssignment.role_level}</p>
                    {roleAssignment.department_scope_name && (
                      <p>
                        <IonIcon icon={businessOutline} /> {roleAssignment.department_scope_name}
                      </p>
                    )}
                    {roleAssignment.program_scope_name && (
                      <p>
                        <IonIcon icon={schoolOutline} /> {roleAssignment.program_scope_name}
                      </p>
                    )}
                    {(roleAssignment.valid_from || roleAssignment.valid_until) && (
                      <p>
                        <IonIcon icon={timeOutline} />
                        {roleAssignment.valid_from && ` From: ${new Date(roleAssignment.valid_from).toLocaleDateString()}`}
                        {roleAssignment.valid_until && ` Until: ${new Date(roleAssignment.valid_until).toLocaleDateString()}`}
                      </p>
                    )}
                  </IonLabel>
                  <IonChip
                    color={roleAssignment.is_currently_valid ? 'success' : 'medium'}
                    slot="end"
                  >
                    <IonIcon icon={roleAssignment.is_currently_valid ? checkmarkCircleOutline : closeCircleOutline} />
                    <IonLabel>{roleAssignment.is_currently_valid ? 'Active' : 'Inactive'}</IonLabel>
                  </IonChip>
                  {canAssignRoles && (
                    <IonButton
                      fill="clear"
                      color="danger"
                      slot="end"
                      onClick={() => {
                        setRoleToDelete(roleAssignment);
                        setShowDeleteAlert(true);
                      }}
                    >
                      <IonIcon icon={trashOutline} />
                    </IonButton>
                  )}
                </IonItem>
              ))}
            </IonList>
          )}
        </IonCardContent>
      </IonCard>
    );
  };

  if (loading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonBackButton defaultHref="/dashboard" />
            </IonButtons>
            <IonTitle>User Permissions</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding ion-text-center">
          <IonSpinner />
          <p>Loading...</p>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/dashboard" />
          </IonButtons>
          <IonTitle>User Permissions</IonTitle>
        </IonToolbar>
      </IonHeader>
      
      <IonContent className="ion-padding">
        <IonGrid>
          <IonRow>
            <IonCol size="12" sizeMd="4">
              {renderEmployeeList()}
            </IonCol>
            <IonCol size="12" sizeMd="8">
              {renderEmployeePermissions()}
            </IonCol>
          </IonRow>
        </IonGrid>

        {/* Assign Role Modal */}
        <IonModal isOpen={showAssignModal} onDidDismiss={() => setShowAssignModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Assign Role</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowAssignModal(false)}>Cancel</IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <IonList>
              <IonItem>
                <IonLabel position="stacked">Employee</IonLabel>
                <IonInput value={selectedEmployee?.full_name || ''} readonly />
              </IonItem>
              
              <IonItem>
                <IonLabel position="stacked">Role *</IonLabel>
                <IonSelect
                  value={assignForm.role}
                  onIonChange={(e) => setAssignForm({ ...assignForm, role: e.detail.value })}
                  placeholder="Select a role"
                >
                  {availableRoles.map((role) => (
                    <IonSelectOption key={role.id} value={role.id}>
                      {role.name} (Level {role.level})
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>

              <IonItem>
                <IonLabel position="stacked">Department Scope (Optional)</IonLabel>
                <IonSelect
                  value={assignForm.department_scope}
                  onIonChange={(e) => setAssignForm({ ...assignForm, department_scope: e.detail.value })}
                  placeholder="All departments"
                >
                  <IonSelectOption value={null}>All Departments</IonSelectOption>
                  {departments.map((dept) => (
                    <IonSelectOption key={dept.id} value={dept.id}>
                      {dept.name}
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>

              <IonItem>
                <IonLabel position="stacked">Program Scope (Optional)</IonLabel>
                <IonSelect
                  value={assignForm.program_scope}
                  onIonChange={(e) => setAssignForm({ ...assignForm, program_scope: e.detail.value })}
                  placeholder="All programs"
                >
                  <IonSelectOption value={null}>All Programs</IonSelectOption>
                  {programs.map((prog) => (
                    <IonSelectOption key={prog.id} value={prog.id}>
                      {prog.name}
                    </IonSelectOption>
                  ))}
                </IonSelect>
              </IonItem>

              <IonItem>
                <IonLabel>Set as Primary Role</IonLabel>
                <IonToggle
                  checked={assignForm.is_primary}
                  onIonChange={(e) => setAssignForm({ ...assignForm, is_primary: e.detail.checked })}
                />
              </IonItem>

              <IonItem>
                <IonLabel>Active</IonLabel>
                <IonToggle
                  checked={assignForm.is_active}
                  onIonChange={(e) => setAssignForm({ ...assignForm, is_active: e.detail.checked })}
                />
              </IonItem>

              <IonAccordionGroup>
                <IonAccordion>
                  <IonItem slot="header">
                    <IonLabel>Advanced Options</IonLabel>
                  </IonItem>
                  <div className="ion-padding" slot="content">
                    <IonItem>
                      <IonLabel position="stacked">Valid From</IonLabel>
                      <IonDatetime
                        value={assignForm.valid_from || undefined}
                        onIonChange={(e) => setAssignForm({ ...assignForm, valid_from: e.detail.value as string || null })}
                        presentation="date"
                      />
                    </IonItem>
                    <IonItem>
                      <IonLabel position="stacked">Valid Until</IonLabel>
                      <IonDatetime
                        value={assignForm.valid_until || undefined}
                        onIonChange={(e) => setAssignForm({ ...assignForm, valid_until: e.detail.value as string || null })}
                        presentation="date"
                      />
                    </IonItem>
                    <IonItem>
                      <IonLabel position="stacked">Notes</IonLabel>
                      <IonTextarea
                        value={assignForm.notes}
                        onIonInput={(e) => setAssignForm({ ...assignForm, notes: e.detail.value || '' })}
                        rows={3}
                        placeholder="Optional notes about this role assignment..."
                      />
                    </IonItem>
                  </div>
                </IonAccordion>
              </IonAccordionGroup>
            </IonList>

            <IonButton expand="block" onClick={handleAssignRole} className="ion-margin-top">
              Assign Role
            </IonButton>
          </IonContent>
        </IonModal>

        {/* Delete Confirmation */}
        <IonAlert
          isOpen={showDeleteAlert}
          onDidDismiss={() => {
            setShowDeleteAlert(false);
            setRoleToDelete(null);
          }}
          header="Remove Role"
          message={`Are you sure you want to remove the "${roleToDelete?.role_name}" role from this employee?`}
          buttons={[
            { text: 'Cancel', role: 'cancel' },
            { text: 'Remove', role: 'destructive', handler: handleRemoveRole },
          ]}
        />

        {/* Toast */}
        <IonToast
          isOpen={toast.show}
          onDidDismiss={() => setToast({ ...toast, show: false })}
          message={toast.message}
          color={toast.color}
          duration={3000}
          position="bottom"
        />
      </IonContent>
    </IonPage>
  );
};

export default UserPermissions;
