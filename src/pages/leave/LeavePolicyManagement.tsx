"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonToggle,
  IonButton,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonAlert,
  IonTextarea,
  IonBadge,
  IonFab,
  IonFabButton,
  IonModal,
  IonButtons,
  IonFooter,
  IonSpinner,
  IonText,
  IonHeader,
  IonToolbar,
  IonTitle,
} from "@ionic/react"
import { add, create, trash, save, close } from "ionicons/icons"
import leaveService, { type LeavePolicy } from "../../services/LeaveService"
import { MainLayout } from "@components/layout"

const LeavePolicyManagement: React.FC = () => {
  const [policies, setPolicies] = useState<LeavePolicy[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentPolicy, setCurrentPolicy] = useState<LeavePolicy | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)
  // Load policies from API
  useEffect(() => {
    loadPolicies()
  }, [])

  const loadPolicies = async () => {
    try {
      setLoading(true)
      console.log('Attempting to load leave policies...')
      const data = await leaveService.getLeavePolicies()
      console.log('Leave policies API response:', data)
      console.log('Type of response:', typeof data)
      console.log('Is array:', Array.isArray(data))
      
      // Ensure data is an array
      if (Array.isArray(data)) {
        setPolicies(data)
        console.log('Set policies to:', data)
      } else {
        console.warn('API response is not an array, setting empty array')
        setPolicies([])
      }
    } catch (error: any) {
      console.error('Error loading leave policies:', error)
      setAlertMessage(`Error loading leave policies: ${error?.message || error}`)
      setShowAlert(true)
      // Set empty array on error
      setPolicies([])
    } finally {
      setLoading(false)
    }
  }

  const handleAddPolicy = () => {
    const newPolicy: LeavePolicy = {
      leave_type: "",
      days_allowed: 0,
      description: "",
      requires_approval: true,
      requires_documentation: false,
      applicable_positions: ["Academic", "Administration"],
    }
    setCurrentPolicy(newPolicy)
    setIsEditing(false)
    setIsModalOpen(true)
  }

  const handleEditPolicy = (policy: LeavePolicy) => {
    setCurrentPolicy({ ...policy })
    setIsEditing(true)
    setIsModalOpen(true)
  }

  const handleDeletePolicy = (policy: LeavePolicy) => {
    setCurrentPolicy(policy)
    setShowDeleteAlert(true)
  }

  const confirmDeletePolicy = async () => {
    if (currentPolicy && currentPolicy.id) {
      try {
        await leaveService.deleteLeavePolicy(currentPolicy.id)
        setAlertMessage("Leave policy deleted successfully")
        setShowAlert(true)
        loadPolicies() // Reload policies
      } catch (error) {
        console.error('Error deleting policy:', error)
        setAlertMessage("Error deleting leave policy")
        setShowAlert(true)
      }
    }
    setShowDeleteAlert(false)
  }

  const handleSavePolicy = async () => {
    if (!currentPolicy) return

    // Validate policy
    if (!currentPolicy.leave_type) {
      setAlertMessage("Please enter a leave type")
      setShowAlert(true)
      return
    }

    if (currentPolicy.days_allowed < 0) {
      setAlertMessage("Days allowed must be a positive number")
      setShowAlert(true)
      return
    }

    if (!currentPolicy.description) {
      setAlertMessage("Please enter a description")
      setShowAlert(true)
      return
    }    if ((currentPolicy.applicable_positions || []).length === 0) {
      setAlertMessage("Please select at least one applicable position")
      setShowAlert(true)
      return
    }

    try {
      if (isEditing && currentPolicy.id) {
        // Update existing policy
        await leaveService.updateLeavePolicy(currentPolicy.id, currentPolicy)
        setAlertMessage("Leave policy updated successfully")
      } else {
        // Add new policy
        await leaveService.createLeavePolicy(currentPolicy)
        setAlertMessage("New leave policy added successfully")
      }

      setShowAlert(true)
      setIsModalOpen(false)
      loadPolicies() // Reload policies
    } catch (error) {
      console.error('Error saving policy:', error)
      setAlertMessage("Error saving leave policy")
      setShowAlert(true)
    }
  }
  const handlePositionToggle = (position: string) => {
    if (!currentPolicy) return

    const currentPositions = currentPolicy.applicable_positions || []
    const updatedPositions = currentPositions.includes(position)
      ? currentPositions.filter((p: string) => p !== position)
      : [...currentPositions, position]

    setCurrentPolicy({
      ...currentPolicy,
      applicable_positions: updatedPositions,
    })
  }

  return (
    <MainLayout title="Leave Policy Management">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <IonSpinner name="crescent" />
            <IonText>
              <p>Loading leave policies...</p>
            </IonText>
          </div>
        ) : (
          <>
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Leave Policies</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <p>Manage leave policies for your organization. You can add, edit, or delete leave policies as needed.</p>
              </IonCardContent>
            </IonCard>            <IonList>
              {(policies || []).map((policy) => (
                <IonItem key={policy.id}>
                  <IonLabel>
                    <h2>{policy.leave_type}</h2>
                    <p>{policy.description}</p>
                    <p>
                      Days Allowed: {policy.days_allowed} | Requires Approval: {policy.requires_approval ? "Yes" : "No"} |
                      Requires Documentation: {policy.requires_documentation ? "Yes" : "No"}
                    </p>
                    <div>
                      {(policy.applicable_positions || []).map((position: string) => (
                        <IonBadge key={position} color="secondary" className="ion-margin-end ion-margin-top p-2">
                          {position}
                        </IonBadge>
                      ))}
                    </div>
                  </IonLabel>
                  <IonButton fill="clear" slot="end" onClick={() => handleEditPolicy(policy)}>
                    <IonIcon icon={create} slot="icon-only" />
                  </IonButton>
                  <IonButton fill="clear" color="danger" slot="end" onClick={() => handleDeletePolicy(policy)}>
                    <IonIcon icon={trash} slot="icon-only" />
                  </IonButton>
                </IonItem>
              ))}
            </IonList>
          </>
        )}

        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={handleAddPolicy}>
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>

        {/* Policy Edit/Add Modal */}
        <IonModal isOpen={isModalOpen} onDidDismiss={() => setIsModalOpen(false)}>
          <IonHeader>
            <IonToolbar color="primary">
              <IonTitle>{isEditing ? "Edit Leave Policy" : "Add Leave Policy"}</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setIsModalOpen(false)}>
                  <IonIcon icon={close} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>          <IonContent className="ion-padding">
            {currentPolicy && (
              <IonList>
                <IonItem>
                  <IonLabel position="stacked">Leave Type</IonLabel>
                  <IonInput
                    value={currentPolicy.leave_type}
                    onIonChange={(e) => setCurrentPolicy({ ...currentPolicy, leave_type: e.detail.value! })}
                    placeholder="Enter leave type"
                  />
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked">Days Allowed</IonLabel>
                  <IonInput
                    type="number"
                    value={currentPolicy.days_allowed}
                    onIonChange={(e) =>
                      setCurrentPolicy({
                        ...currentPolicy,
                        days_allowed: Number.parseInt(e.detail.value!) || 0,
                      })
                    }
                    placeholder="Enter days allowed"
                  />
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked">Description</IonLabel>
                  <IonTextarea
                    value={currentPolicy.description}
                    onIonChange={(e) => setCurrentPolicy({ ...currentPolicy, description: e.detail.value! })}
                    placeholder="Enter description"
                    rows={3}
                  />
                </IonItem>

                <IonItem>
                  <IonLabel>Requires Approval</IonLabel>
                  <IonToggle
                    checked={currentPolicy.requires_approval}
                    onIonChange={(e) =>
                      setCurrentPolicy({
                        ...currentPolicy,
                        requires_approval: e.detail.checked,
                      })
                    }
                  />
                </IonItem>

                <IonItem>
                  <IonLabel>Requires Documentation</IonLabel>
                  <IonToggle
                    checked={currentPolicy.requires_documentation}
                    onIonChange={(e) =>
                      setCurrentPolicy({
                        ...currentPolicy,
                        requires_documentation: e.detail.checked,
                      })
                    }
                  />
                </IonItem>

                <IonItem>
                  <IonLabel>Applicable Positions</IonLabel>
                </IonItem>                <IonItem>
                  <IonLabel>Academic</IonLabel>
                  <IonToggle
                    checked={(currentPolicy.applicable_positions || []).includes("Academic")}
                    onIonChange={() => handlePositionToggle("Academic")}
                  />
                </IonItem>

                <IonItem>
                  <IonLabel>Administration</IonLabel>
                  <IonToggle
                    checked={(currentPolicy.applicable_positions || []).includes("Administration")}
                    onIonChange={() => handlePositionToggle("Administration")}
                  />
                </IonItem>
              </IonList>
            )}
          </IonContent>

          <IonFooter>
            <IonToolbar>
              <IonButton expand="block" onClick={handleSavePolicy}>
                <IonIcon icon={save} slot="start" />
                Save Policy
              </IonButton>
            </IonToolbar>
          </IonFooter>
        </IonModal>

        {/* Alerts */}
        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header="Notification"
          message={alertMessage}
          buttons={["OK"]}
        />        <IonAlert
          isOpen={showDeleteAlert}
          onDidDismiss={() => setShowDeleteAlert(false)}
          header="Confirm Delete"
          message={`Are you sure you want to delete the "${currentPolicy?.leave_type}" leave policy?`}
          buttons={[
            {
              text: "Cancel",
              role: "cancel",
            },
            {
              text: "Delete",
              handler: confirmDeletePolicy,
            },
          ]}
        />
    </MainLayout>
  )
}

export default LeavePolicyManagement
