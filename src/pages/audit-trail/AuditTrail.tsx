"use client"

import type React from "react"
import { useState, useRef } from "react"
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonMenuButton,
  IonButton,
  IonIcon,
  IonSelect,
  IonSelectOption,
  IonInput,
  IonItem,
  IonLabel,
  IonDatetime,
  IonModal,
  IonCard,
  IonCardContent,
  IonBadge,
  IonSpinner,
  IonRefresher,
  IonRefresherContent,
  IonGrid,
  IonRow,
  IonCol,
  IonText,
  IonChip,
  IonToast,
} from "@ionic/react"
import {
  filterOutline,
  closeCircleOutline,
  downloadOutline,
  eyeOutline,
  calendarOutline,
  personOutline,
  documentTextOutline,
  informationCircleOutline,
} from "ionicons/icons"
import { useAudit } from "../../hooks/useAudit"
import type { AuditLog, AuditModule, AuditAction } from "../../data/audit-data"
import "./AuditTrail.css"

const AuditTrail: React.FC = () => {
  const { logs, loading, error, filters, updateFilters, clearFilters, exportToCSV, refetch } = useAudit()

  const [showFilters, setShowFilters] = useState(false)
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)
  const [showLogDetails, setShowLogDetails] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")

  const startDateRef = useRef<HTMLIonDatetimeElement>(null)
  const endDateRef = useRef<HTMLIonDatetimeElement>(null)

  const modules: AuditModule[] = [
    "Authentication",
    "Employee Directory",
    "Leave Management",
    "Organization",
    "Faculty Loading",
    "Leave Management",
    "Leave Policy",
    "Leave Credits",
    "Reports",
    "System",
  ]

  const actions: AuditAction[] = [
    "Login",
    "Logout",
    "View",
    "Create",
    "Update",
    "Delete",
    "Export",
    "Import",
    "Approve",
    "Reject",
    "Generate Report",
  ]

  const handleRefresh = (event: CustomEvent) => {
    refetch().then(() => {
      event.detail.complete()
      setToastMessage("Audit logs refreshed")
      setShowToast(true)
    })
  }

  const handleExport = () => {
    exportToCSV()
    setToastMessage("Audit logs exported to CSV")
    setShowToast(true)
  }

  const handleViewDetails = (log: AuditLog) => {
    setSelectedLog(log)
    setShowLogDetails(true)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString()
  }

  const applyFilters = () => {
    const newFilters: any = {}

    if (startDateRef.current?.value) {
      newFilters.startDate = startDateRef.current.value.toString()
    }

    if (endDateRef.current?.value) {
      newFilters.endDate = endDateRef.current.value.toString()
    }

    updateFilters(newFilters)
    setShowFilters(false)
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonMenuButton />
          </IonButtons>
          <IonTitle>Audit Trail</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => setShowFilters(true)}>
              <IonIcon slot="icon-only" icon={filterOutline} />
            </IonButton>
            <IonButton onClick={handleExport}>
              <IonIcon slot="icon-only" icon={downloadOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="audit-trail-container">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>

        <div className="audit-trail-header">
          <h1 className="audit-trail-title">System Audit Logs</h1>
          <div>
            {Object.keys(filters).length > 0 && (
              <IonButton size="small" fill="clear" onClick={clearFilters}>
                Clear Filters
                <IonIcon slot="end" icon={closeCircleOutline} />
              </IonButton>
            )}
          </div>
        </div>

        {error && (
          <div className="audit-error">
            <IonIcon icon={informationCircleOutline} />
            <span>{error}</span>
          </div>
        )}

        {/* Active filters display */}
        {Object.keys(filters).length > 0 && (
          <IonCard className="ion-margin-bottom">
            <IonCardContent>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                <IonText color="medium">Active filters:</IonText>
                {filters.startDate && (
                  <IonChip>
                    <IonIcon icon={calendarOutline} />
                    <IonLabel>From: {new Date(filters.startDate).toLocaleDateString()}</IonLabel>
                  </IonChip>
                )}
                {filters.endDate && (
                  <IonChip>
                    <IonIcon icon={calendarOutline} />
                    <IonLabel>To: {new Date(filters.endDate).toLocaleDateString()}</IonLabel>
                  </IonChip>
                )}
                {filters.userId && (
                  <IonChip>
                    <IonIcon icon={personOutline} />
                    <IonLabel>User ID: {filters.userId}</IonLabel>
                  </IonChip>
                )}
                {filters.username && (
                  <IonChip>
                    <IonIcon icon={personOutline} />
                    <IonLabel>Username: {filters.username}</IonLabel>
                  </IonChip>
                )}
                {filters.action && (
                  <IonChip>
                    <IonIcon icon={documentTextOutline} />
                    <IonLabel>Action: {filters.action}</IonLabel>
                  </IonChip>
                )}
                {filters.module && (
                  <IonChip>
                    <IonIcon icon={documentTextOutline} />
                    <IonLabel>Module: {filters.module}</IonLabel>
                  </IonChip>
                )}
                {filters.status && (
                  <IonChip>
                    <IonIcon icon={informationCircleOutline} />
                    <IonLabel>Status: {filters.status}</IonLabel>
                  </IonChip>
                )}
              </div>
            </IonCardContent>
          </IonCard>
        )}

        {loading ? (
          <div className="audit-loading">
            <IonSpinner name="circular" />
          </div>
        ) : logs.length === 0 ? (
          <div className="audit-empty-state">
            <IonIcon icon={informationCircleOutline} size="large" />
            <p>No audit logs found. Try adjusting your filters.</p>
          </div>
        ) : (
          <IonCard>
            <IonCardContent className="ion-no-padding">
              <div style={{ overflowX: "auto" }}>
                <table className="audit-table">
                  <thead>
                    <tr>
                      <th>Timestamp</th>
                      <th>User</th>
                      <th>Action</th>
                      <th>Module</th>
                      <th>Details</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log) => (
                      <tr key={log.id}>
                        <td className="timestamp-cell">{formatDate(log.timestamp)}</td>
                        <td>{log.username}</td>
                        <td>{log.action}</td>
                        <td>{log.module}</td>
                        <td className="details-cell" title={log.details}>
                          {log.details}
                        </td>
                        <td>
                          <IonBadge
                            color={log.status === "success" ? "success" : "danger"}
                            style={{ fontWeight: "normal" }}
                          >
                            {log.status}
                          </IonBadge>
                        </td>
                        <td>
                          <IonButton fill="clear" size="small" onClick={() => handleViewDetails(log)}>
                            <IonIcon slot="icon-only" icon={eyeOutline} />
                          </IonButton>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </IonCardContent>
          </IonCard>
        )}

        {/* Filter Modal */}
        <IonModal isOpen={showFilters} onDidDismiss={() => setShowFilters(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Filter Audit Logs</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowFilters(false)}>
                  <IonIcon slot="icon-only" icon={closeCircleOutline} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <div className="ion-padding">
              <IonGrid>
                <IonRow>
                  <IonCol size="12" sizeMd="6">
                    <IonItem>
                      <IonLabel position="stacked">Start Date</IonLabel>
                      <IonDatetime
                        ref={startDateRef}
                        displayFormat="MMM DD, YYYY"
                        placeholder="Select Start Date"
                        value={filters.startDate}
                      ></IonDatetime>
                    </IonItem>
                  </IonCol>
                  <IonCol size="12" sizeMd="6">
                    <IonItem>
                      <IonLabel position="stacked">End Date</IonLabel>
                      <IonDatetime
                        ref={endDateRef}
                        displayFormat="MMM DD, YYYY"
                        placeholder="Select End Date"
                        value={filters.endDate}
                      ></IonDatetime>
                    </IonItem>
                  </IonCol>
                </IonRow>

                <IonRow>
                  <IonCol size="12" sizeMd="6">
                    <IonItem>
                      <IonLabel position="stacked">User ID</IonLabel>
                      <IonInput
                        value={filters.userId}
                        placeholder="Enter User ID"
                        onIonChange={(e) => updateFilters({ userId: e.detail.value! })}
                      ></IonInput>
                    </IonItem>
                  </IonCol>
                  <IonCol size="12" sizeMd="6">
                    <IonItem>
                      <IonLabel position="stacked">Username</IonLabel>
                      <IonInput
                        value={filters.username}
                        placeholder="Enter Username"
                        onIonChange={(e) => updateFilters({ username: e.detail.value! })}
                      ></IonInput>
                    </IonItem>
                  </IonCol>
                </IonRow>

                <IonRow>
                  <IonCol size="12" sizeMd="6">
                    <IonItem>
                      <IonLabel position="stacked">Action</IonLabel>
                      <IonSelect
                        value={filters.action}
                        placeholder="Select Action"
                        onIonChange={(e) => updateFilters({ action: e.detail.value })}
                      >
                        {actions.map((action) => (
                          <IonSelectOption key={action} value={action}>
                            {action}
                          </IonSelectOption>
                        ))}
                      </IonSelect>
                    </IonItem>
                  </IonCol>
                  <IonCol size="12" sizeMd="6">
                    <IonItem>
                      <IonLabel position="stacked">Module</IonLabel>
                      <IonSelect
                        value={filters.module}
                        placeholder="Select Module"
                        onIonChange={(e) => updateFilters({ module: e.detail.value })}
                      >
                        {modules.map((module) => (
                          <IonSelectOption key={module} value={module}>
                            {module}
                          </IonSelectOption>
                        ))}
                      </IonSelect>
                    </IonItem>
                  </IonCol>
                </IonRow>

                <IonRow>
                  <IonCol size="12" sizeMd="6">
                    <IonItem>
                      <IonLabel position="stacked">Status</IonLabel>
                      <IonSelect
                        value={filters.status}
                        placeholder="Select Status"
                        onIonChange={(e) => updateFilters({ status: e.detail.value })}
                      >
                        <IonSelectOption value="success">Success</IonSelectOption>
                        <IonSelectOption value="failure">Failure</IonSelectOption>
                      </IonSelect>
                    </IonItem>
                  </IonCol>
                </IonRow>
              </IonGrid>

              <div className="ion-padding-top ion-text-end">
                <IonButton fill="outline" onClick={clearFilters} className="ion-margin-end">
                  Clear All
                </IonButton>
                <IonButton onClick={applyFilters}>Apply Filters</IonButton>
              </div>
            </div>
          </IonContent>
        </IonModal>

        {/* Log Details Modal */}
        <IonModal
          isOpen={showLogDetails}
          onDidDismiss={() => setShowLogDetails(false)}
          className="audit-log-details-modal"
        >
          <IonHeader>
            <IonToolbar>
              <IonTitle>Audit Log Details</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setShowLogDetails(false)}>
                  <IonIcon slot="icon-only" icon={closeCircleOutline} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            {selectedLog && (
              <div className="ion-padding">
                <IonGrid>
                  <IonRow>
                    <IonCol size="12">
                      <div className="detail-row">
                        <div className="detail-label">ID</div>
                        <div className="detail-value">{selectedLog.id}</div>
                      </div>
                    </IonCol>
                  </IonRow>

                  <IonRow>
                    <IonCol size="12" sizeMd="6">
                      <div className="detail-row">
                        <div className="detail-label">Timestamp</div>
                        <div className="detail-value">{formatDate(selectedLog.timestamp)}</div>
                      </div>
                    </IonCol>
                    <IonCol size="12" sizeMd="6">
                      <div className="detail-row">
                        <div className="detail-label">Status</div>
                        <div className="detail-value">
                          <IonBadge color={selectedLog.status === "success" ? "success" : "danger"}>
                            {selectedLog.status}
                          </IonBadge>
                        </div>
                      </div>
                    </IonCol>
                  </IonRow>

                  <IonRow>
                    <IonCol size="12" sizeMd="6">
                      <div className="detail-row">
                        <div className="detail-label">User ID</div>
                        <div className="detail-value">{selectedLog.userId}</div>
                      </div>
                    </IonCol>
                    <IonCol size="12" sizeMd="6">
                      <div className="detail-row">
                        <div className="detail-label">Username</div>
                        <div className="detail-value">{selectedLog.username}</div>
                      </div>
                    </IonCol>
                  </IonRow>

                  <IonRow>
                    <IonCol size="12" sizeMd="6">
                      <div className="detail-row">
                        <div className="detail-label">Action</div>
                        <div className="detail-value">{selectedLog.action}</div>
                      </div>
                    </IonCol>
                    <IonCol size="12" sizeMd="6">
                      <div className="detail-row">
                        <div className="detail-label">Module</div>
                        <div className="detail-value">{selectedLog.module}</div>
                      </div>
                    </IonCol>
                  </IonRow>

                  <IonRow>
                    <IonCol size="12">
                      <div className="detail-row">
                        <div className="detail-label">IP Address</div>
                        <div className="detail-value">{selectedLog.ipAddress}</div>
                      </div>
                    </IonCol>
                  </IonRow>

                  <IonRow>
                    <IonCol size="12">
                      <div className="detail-row">
                        <div className="detail-label">Details</div>
                        <div className="detail-value">{selectedLog.details}</div>
                      </div>
                    </IonCol>
                  </IonRow>
                </IonGrid>
              </div>
            )}
          </IonContent>
        </IonModal>

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2000}
          position="bottom"
        />
      </IonContent>
    </IonPage>
  )
}

export default AuditTrail
