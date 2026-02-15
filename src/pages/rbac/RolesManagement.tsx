/**
 * Roles Management Page
 * 
 * HR interface for managing roles and their permissions.
 * Allows creating, editing, duplicating, and deleting roles.
 * Styled with Tailwind CSS for modern, responsive design.
 */

import React, { useState, useEffect } from 'react';
import {
  IonButton,
  IonButtons,
  IonIcon,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonCheckbox,
  IonSpinner,
  IonAlert,
  IonToast,
  IonToggle,
  IonGrid,
  IonRow,
  IonCol,
  IonChip,
  IonLabel,
  IonBadge,
  IonItemDivider,
} from '@ionic/react';
import {
  addOutline,
  createOutline,
  trashOutline,
  copyOutline,
  shieldCheckmarkOutline,
  lockClosedOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  keyOutline,
  searchOutline,
  chevronDownOutline,
  chevronUpOutline,
  closeOutline,
  peopleOutline,
} from 'ionicons/icons';
import { MainLayout } from '@/components/layout/MainLayout';
import rbacService, {
  Role,
  RoleList,
  PermissionCategory,
  CreateRolePayload,
} from '../../services/RBACService';
import { useRole } from '../../contexts/RoleContext';

const LEVEL_OPTIONS = [
  { value: -1, label: 'Super Admin (HR)', description: 'Full system access' },
  { value: 0, label: 'Executive (VPAA)', description: 'Organization-wide oversight' },
  { value: 1, label: 'Department Head (Dean)', description: 'Department management' },
  { value: 2, label: 'Program Head (Chair)', description: 'Program oversight' },
  { value: 3, label: 'Senior Staff', description: 'Enhanced privileges' },
  { value: 4, label: 'Staff', description: 'Standard access' },
  { value: 5, label: 'Basic User', description: 'Limited access' },
  { value: 99, label: 'Guest/Limited', description: 'Minimal access' },
];

const SCOPE_OPTIONS = [
  { value: 'none', label: 'No Approval Rights', icon: '🚫' },
  { value: 'program', label: 'Program Level', icon: '📋' },
  { value: 'department', label: 'Department Level', icon: '🏢' },
  { value: 'organization', label: 'Organization Level', icon: '🏛️' },
  { value: 'all', label: 'Global Access', icon: '🌐' },
];

const RolesManagement: React.FC = () => {
  const { hasPermission, isHR } = useRole();
  
  // State
  const [roles, setRoles] = useState<RoleList[]>([]);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [permissionCategories, setPermissionCategories] = useState<PermissionCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [toast, setToast] = useState<{ show: boolean; message: string; color: string }>({
    show: false,
    message: '',
    color: 'success',
  });
  
  // Form state
  const [formData, setFormData] = useState<CreateRolePayload>({
    name: '',
    code: '',
    description: '',
    level: 5,
    approval_scope: 'none',
    is_active: true,
    can_be_assigned: true,
    permission_ids: [],
  });
  const [duplicateName, setDuplicateName] = useState('');
  const [duplicateCode, setDuplicateCode] = useState('');
  
  // Permission check
  const canManageRoles = hasPermission('rbac_manage_roles') || isHR;

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [rolesData, categoriesData] = await Promise.all([
        rbacService.getRoles(),
        rbacService.getPermissionsByCategory(),
      ]);
      setRoles(rolesData);
      setPermissionCategories(categoriesData);
    } catch (error) {
      console.error('Error loading roles:', error);
      showToast('Failed to load roles', 'danger');
    } finally {
      setLoading(false);
    }
  };

  const loadRoleDetails = async (roleId: number) => {
    try {
      const role = await rbacService.getRole(roleId);
      setSelectedRole(role);
    } catch (error) {
      console.error('Error loading role details:', error);
      showToast('Failed to load role details', 'danger');
    }
  };

  const showToast = (message: string, color: string = 'success') => {
    setToast({ show: true, message, color });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      level: 5,
      approval_scope: 'none',
      is_active: true,
      can_be_assigned: true,
      permission_ids: [],
    });
  };

  const handleCreateRole = async () => {
    if (!formData.name || !formData.code) {
      showToast('Name and code are required', 'warning');
      return;
    }

    try {
      await rbacService.createRole(formData);
      showToast('Role created successfully');
      setShowCreateModal(false);
      resetForm();
      loadData();
    } catch (error: any) {
      showToast(error.message || 'Failed to create role', 'danger');
    }
  };

  const handleEditRole = async () => {
    if (!selectedRole) return;

    try {
      await rbacService.updateRole(selectedRole.id, formData);
      showToast('Role updated successfully');
      setShowEditModal(false);
      loadData();
      loadRoleDetails(selectedRole.id);
    } catch (error: any) {
      showToast(error.message || 'Failed to update role', 'danger');
    }
  };

  const handleDeleteRole = async () => {
    if (!selectedRole) return;

    try {
      await rbacService.deleteRole(selectedRole.id);
      showToast('Role deleted successfully');
      setSelectedRole(null);
      loadData();
    } catch (error: any) {
      showToast(error.message || 'Failed to delete role', 'danger');
    }
  };

  const handleDuplicateRole = async () => {
    if (!selectedRole || !duplicateName || !duplicateCode) {
      showToast('Name and code are required', 'warning');
      return;
    }

    try {
      const newRole = await rbacService.duplicateRole(selectedRole.id, duplicateName, duplicateCode);
      showToast('Role duplicated successfully');
      setShowDuplicateModal(false);
      setDuplicateName('');
      setDuplicateCode('');
      loadData();
      setSelectedRole(newRole);
    } catch (error: any) {
      showToast(error.message || 'Failed to duplicate role', 'danger');
    }
  };

  const openEditModal = () => {
    if (!selectedRole) return;
    
    setFormData({
      name: selectedRole.name,
      code: selectedRole.code,
      description: selectedRole.description,
      level: selectedRole.level,
      approval_scope: selectedRole.approval_scope,
      is_active: selectedRole.is_active,
      can_be_assigned: selectedRole.can_be_assigned,
      permission_ids: selectedRole.permissions_list.map(p => p.id),
    });
    setShowEditModal(true);
  };

  const togglePermission = (permId: number) => {
    setFormData(prev => ({
      ...prev,
      permission_ids: prev.permission_ids?.includes(permId)
        ? prev.permission_ids.filter(id => id !== permId)
        : [...(prev.permission_ids || []), permId],
    }));
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const filteredRoles = roles.filter(role =>
    role.name.toLowerCase().includes(searchText.toLowerCase()) ||
    role.code.toLowerCase().includes(searchText.toLowerCase())
  );

  // Render role list
  const renderRoleList = () => (
    <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-700 to-red-900 px-6 py-5">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/20 rounded-lg">
            <IonIcon icon={shieldCheckmarkOutline} className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">System Roles</h2>
            <p className="text-red-100 text-sm">{roles.length} roles configured</p>
          </div>
        </div>
      </div>
      
      {/* Search & Actions */}
      <div className="p-4 border-b border-slate-200 bg-slate-50">
        <div className="relative mb-3">
          <IonIcon 
            icon={searchOutline} 
            className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400"
          />
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="Search roles..."
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 bg-white
                       focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent
                       placeholder:text-slate-400 transition-all duration-200"
          />
        </div>
        
        {canManageRoles && (
          <button
            onClick={() => {
              resetForm();
              setShowCreateModal(true);
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl
                       bg-gradient-to-r from-red-600 to-red-800 text-white font-semibold
                       hover:from-red-700 hover:to-red-900 transition-all duration-200
                       shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
          >
            <IonIcon icon={addOutline} className="w-5 h-5" />
            Create New Role
          </button>
        )}
      </div>

      {/* Role List */}
      <div className="max-h-[500px] overflow-y-auto">
        {filteredRoles.length === 0 ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
              <IonIcon icon={shieldCheckmarkOutline} className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-500">No roles found</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredRoles.map((role) => (
              <div
                key={role.id}
                onClick={() => loadRoleDetails(role.id)}
                className={`flex items-center gap-4 px-4 py-4 cursor-pointer transition-all duration-200
                           hover:bg-red-50 ${selectedRole?.id === role.id ? 'bg-red-100 border-l-4 border-red-700' : ''}`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-sm
                                ${role.is_system 
                                  ? 'bg-gradient-to-br from-amber-400 to-orange-500' 
                                  : 'bg-gradient-to-br from-red-600 to-red-800'}`}>
                  <IonIcon
                    icon={role.is_system ? lockClosedOutline : keyOutline}
                    className="w-6 h-6 text-white"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-slate-800 truncate">{role.name}</h3>
                  <p className="text-sm text-slate-500 truncate">{role.code} • Level {role.level}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
                                   ${role.is_active 
                                     ? 'bg-emerald-100 text-emerald-700' 
                                     : 'bg-slate-200 text-slate-600'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${role.is_active ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                    {role.is_active ? 'Active' : 'Inactive'}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-slate-500">
                    <IonIcon icon={peopleOutline} className="w-3.5 h-3.5" />
                    {role.employee_count} users
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // Render role details
  const renderRoleDetails = () => {
    if (!selectedRole) {
      return (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
          <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
            <div className="w-24 h-24 mb-6 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 
                            flex items-center justify-center">
              <IonIcon icon={shieldCheckmarkOutline} className="w-12 h-12 text-slate-400" />
            </div>
            <h2 className="text-xl font-semibold text-slate-700 mb-2">Select a Role</h2>
            <p className="text-slate-500 max-w-sm">
              Click on a role from the list to view its details, permissions, and management options.
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-5">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 rounded-xl flex items-center justify-center shadow-lg
                              ${selectedRole.is_system 
                                ? 'bg-gradient-to-br from-amber-400 to-orange-500' 
                                : 'bg-gradient-to-br from-red-600 to-red-800'}`}>
                <IonIcon
                  icon={selectedRole.is_system ? lockClosedOutline : keyOutline}
                  className="w-7 h-7 text-white"
                />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">{selectedRole.name}</h2>
                <p className="text-slate-300">{selectedRole.code}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {selectedRole.is_system && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                               bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <IonIcon icon={lockClosedOutline} className="w-3.5 h-3.5" />
                  System Role
                </span>
              )}
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                               ${selectedRole.is_active 
                                 ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                                 : 'bg-slate-500/20 text-slate-300 border border-slate-500/30'}`}>
                <IonIcon 
                  icon={selectedRole.is_active ? checkmarkCircleOutline : closeCircleOutline} 
                  className="w-3.5 h-3.5" 
                />
                {selectedRole.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Role Info Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Level</p>
              <p className="text-lg font-bold text-slate-800">{selectedRole.level_display}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Approval Scope</p>
              <p className="text-lg font-bold text-slate-800">{selectedRole.approval_scope_display}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Assigned Users</p>
              <p className="text-lg font-bold text-slate-800">{selectedRole.employee_count}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Permissions</p>
              <p className="text-lg font-bold text-slate-800">{selectedRole.permission_codes.length}</p>
            </div>
          </div>

          {/* Description */}
          {selectedRole.description && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-xs font-medium text-blue-600 uppercase tracking-wide mb-1">Description</p>
              <p className="text-slate-700">{selectedRole.description}</p>
            </div>
          )}

          {/* Actions */}
          {canManageRoles && (
            <div className="flex flex-wrap gap-3 mb-6 pb-6 border-b border-slate-200">
              <button
                onClick={openEditModal}
                disabled={selectedRole.is_system}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm
                           bg-red-600 text-white hover:bg-red-700 transition-all duration-200
                           disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              >
                <IonIcon icon={createOutline} className="w-4 h-4" />
                Edit Role
              </button>
              <button
                onClick={() => {
                  setDuplicateName(`${selectedRole.name} (Copy)`);
                  setDuplicateCode(`${selectedRole.code}_COPY`);
                  setShowDuplicateModal(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm
                           bg-slate-100 text-slate-700 hover:bg-slate-200 transition-all duration-200
                           shadow-sm hover:shadow"
              >
                <IonIcon icon={copyOutline} className="w-4 h-4" />
                Duplicate
              </button>
              <button
                onClick={() => setShowDeleteAlert(true)}
                disabled={selectedRole.is_system || selectedRole.employee_count > 0}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm
                           bg-red-500 text-white hover:bg-red-600 transition-all duration-200
                           disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              >
                <IonIcon icon={trashOutline} className="w-4 h-4" />
                Delete
              </button>
            </div>
          )}

          {/* Permissions Section */}
          <div>
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <IonIcon icon={keyOutline} className="w-5 h-5 text-red-700" />
              Permissions ({selectedRole.permission_codes.length})
            </h3>
            
            <div className="space-y-3">
              {permissionCategories.map((category) => {
                const categoryPerms = selectedRole.permissions_list.filter(
                  p => p.category === category.category
                );
                if (categoryPerms.length === 0) return null;
                
                const isExpanded = expandedCategories.includes(category.category);
                
                return (
                  <div key={category.category} className="border border-slate-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => toggleCategory(category.category)}
                      className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 
                                 hover:bg-slate-100 transition-colors duration-150"
                    >
                      <span className="font-medium text-slate-700">{category.category_display}</span>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          {categoryPerms.length}
                        </span>
                        <IonIcon 
                          icon={isExpanded ? chevronUpOutline : chevronDownOutline} 
                          className="w-5 h-5 text-slate-400"
                        />
                      </div>
                    </button>
                    {isExpanded && (
                      <div className="p-4 bg-white flex flex-wrap gap-2">
                        {categoryPerms.map((perm) => (
                          <span
                            key={perm.id}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm
                                     bg-emerald-50 text-emerald-700 border border-emerald-200"
                          >
                            <IonIcon icon={checkmarkCircleOutline} className="w-4 h-4" />
                            {perm.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render permission selector for create/edit modals
  const renderPermissionSelector = () => (
    <div className="space-y-3">
      {permissionCategories.map((category) => {
        const selectedCount = category.permissions.filter(p => formData.permission_ids?.includes(p.id)).length;
        const isExpanded = expandedCategories.includes(`modal-${category.category}`);
        
        return (
          <div key={category.category} className="border border-slate-200 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => toggleCategory(`modal-${category.category}`)}
              className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 
                         hover:bg-slate-100 transition-colors duration-150"
            >
              <span className="font-medium text-slate-700">{category.category_display}</span>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium
                                ${selectedCount > 0 
                                  ? 'bg-red-100 text-red-800' 
                                  : 'bg-slate-200 text-slate-600'}`}>
                  {selectedCount}/{category.permissions.length}
                </span>
                <IonIcon 
                  icon={isExpanded ? chevronUpOutline : chevronDownOutline} 
                  className="w-5 h-5 text-slate-400"
                />
              </div>
            </button>
            {isExpanded && (
              <div className="p-4 bg-white space-y-2">
                {category.permissions.map((perm) => (
                  <label
                    key={perm.id}
                    className="flex items-start gap-3 p-3 rounded-lg cursor-pointer
                             hover:bg-slate-50 transition-colors duration-150"
                  >
                    <IonCheckbox
                      checked={formData.permission_ids?.includes(perm.id)}
                      onIonChange={() => togglePermission(perm.id)}
                      className="mt-0.5"
                    />
                    <div className="flex-1">
                      <p className="font-medium text-slate-800">{perm.name}</p>
                      <p className="text-sm text-slate-500">{perm.code}</p>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  // Render form fields for create/edit modals
  const renderFormFields = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Role Name <span className="text-red-500">*</span>
        </label>
        <IonInput
          value={formData.name}
          onIonInput={(e) => setFormData({ ...formData, name: e.detail.value || '' })}
          placeholder="e.g., Department Manager"
          className="w-full"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Role Code <span className="text-red-500">*</span>
        </label>
        <IonInput
          value={formData.code}
          onIonInput={(e) => setFormData({ ...formData, code: (e.detail.value || '').toUpperCase() })}
          placeholder="e.g., DEPT_MANAGER"
          className="w-full"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">Description</label>
        <IonTextarea
          value={formData.description}
          onIonInput={(e) => setFormData({ ...formData, description: e.detail.value || '' })}
          rows={3}
          placeholder="Describe the role's purpose and responsibilities..."
          className="w-full"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Hierarchy Level</label>
          <IonSelect
            value={formData.level}
            onIonChange={(e) => setFormData({ ...formData, level: e.detail.value })}
            className="w-full"
          >
            {LEVEL_OPTIONS.map((opt) => (
              <IonSelectOption key={opt.value} value={opt.value}>
                {opt.label}
              </IonSelectOption>
            ))}
          </IonSelect>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Approval Scope</label>
          <IonSelect
            value={formData.approval_scope}
            onIonChange={(e) => setFormData({ ...formData, approval_scope: e.detail.value })}
            className="w-full"
          >
            {SCOPE_OPTIONS.map((opt) => (
              <IonSelectOption key={opt.value} value={opt.value}>
                {opt.icon} {opt.label}
              </IonSelectOption>
            ))}
          </IonSelect>
        </div>
      </div>
      
      <div className="flex items-center gap-6 py-2">
        <label className="flex items-center gap-3 cursor-pointer">
          <IonToggle
            checked={formData.is_active}
            onIonChange={(e) => setFormData({ ...formData, is_active: e.detail.checked })}
          />
          <span className="text-sm font-medium text-slate-700">Active</span>
        </label>
        <label className="flex items-center gap-3 cursor-pointer">
          <IonToggle
            checked={formData.can_be_assigned}
            onIonChange={(e) => setFormData({ ...formData, can_be_assigned: e.detail.checked })}
          />
          <span className="text-sm font-medium text-slate-700">Can Be Assigned</span>
        </label>
      </div>
    </div>
  );

  if (loading) {
    return (
      <MainLayout title="Roles Management">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="w-16 h-16 mb-4 rounded-full bg-red-100 flex items-center justify-center animate-pulse">
            <IonSpinner color="danger" />
          </div>
          <p className="text-slate-600 font-medium">Loading roles...</p>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Roles Management">
      <div className="p-4 md:p-6 lg:p-8 bg-gradient-to-br from-slate-50 to-slate-100 min-h-screen">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4">
              {renderRoleList()}
            </div>
            <div className="lg:col-span-8">
              {renderRoleDetails()}
            </div>
          </div>
        </div>

      {/* Create Role Modal */}
      <IonModal isOpen={showCreateModal} onDidDismiss={() => setShowCreateModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Create New Role</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowCreateModal(false)}>
                  <IonIcon icon={closeOutline} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding bg-slate-50">
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Role Details</h3>
                {renderFormFields()}
              </div>
              
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Permissions</h3>
                {renderPermissionSelector()}
              </div>
              
              <button
                onClick={handleCreateRole}
                className="w-full py-3.5 rounded-xl font-semibold text-white
                         bg-gradient-to-r from-red-600 to-red-800
                         hover:from-red-700 hover:to-red-900
                         transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Create Role
              </button>
            </div>
          </IonContent>
        </IonModal>

        {/* Edit Role Modal */}
        <IonModal isOpen={showEditModal} onDidDismiss={() => setShowEditModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Edit Role</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowEditModal(false)}>
                  <IonIcon icon={closeOutline} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding bg-slate-50">
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Role Details</h3>
                {renderFormFields()}
              </div>
              
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-800 mb-4">Permissions</h3>
                {renderPermissionSelector()}
              </div>
              
              <button
                onClick={handleEditRole}
                className="w-full py-3.5 rounded-xl font-semibold text-white
                         bg-gradient-to-r from-red-600 to-red-800
                         hover:from-red-700 hover:to-red-900
                         transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                Save Changes
              </button>
            </div>
          </IonContent>
        </IonModal>

        {/* Duplicate Role Modal */}
        <IonModal isOpen={showDuplicateModal} onDidDismiss={() => setShowDuplicateModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Duplicate Role</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowDuplicateModal(false)}>
                  <IonIcon icon={closeOutline} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding bg-slate-50">
            <div className="max-w-md mx-auto">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-4 p-3 bg-blue-50 rounded-xl border border-blue-200">
                  <IonIcon icon={copyOutline} className="w-6 h-6 text-blue-600" />
                  <p className="text-sm text-blue-800">
                    Create a copy of "<span className="font-semibold">{selectedRole?.name}</span>" with all its permissions.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      New Role Name <span className="text-red-500">*</span>
                    </label>
                    <IonInput
                      value={duplicateName}
                      onIonInput={(e) => setDuplicateName(e.detail.value || '')}
                      className="w-full"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                      New Role Code <span className="text-red-500">*</span>
                    </label>
                    <IonInput
                      value={duplicateCode}
                      onIonInput={(e) => setDuplicateCode((e.detail.value || '').toUpperCase())}
                      className="w-full"
                    />
                  </div>
                </div>
                
                <button
                  onClick={handleDuplicateRole}
                  className="w-full mt-6 py-3 rounded-xl font-semibold text-white
                           bg-gradient-to-r from-red-600 to-red-800
                           hover:from-red-700 hover:to-red-900
                           transition-all duration-200 shadow-lg"
                >
                  Create Duplicate
                </button>
              </div>
            </div>
          </IonContent>
        </IonModal>

        {/* Delete Confirmation */}
        <IonAlert
          isOpen={showDeleteAlert}
          onDidDismiss={() => setShowDeleteAlert(false)}
          header="Delete Role"
          message={`Are you sure you want to delete "${selectedRole?.name}"? This action cannot be undone.`}
          buttons={[
            { text: 'Cancel', role: 'cancel' },
            { text: 'Delete', role: 'destructive', handler: handleDeleteRole },
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
    </MainLayout>
  );
};

export default RolesManagement;
