"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonButton,
  IonIcon,
  IonBadge,
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonLabel,
  IonSpinner,
  IonText,
  IonAlert,
  IonFab,
  IonFabButton,
  IonItem,
  IonList,
} from "@ionic/react"
import {
  megaphoneOutline,
  add,
  close,
  trash,
  timeOutline,
  personOutline,
} from "ionicons/icons"
import { MainLayout } from "@components/layout"
import { useRole } from "../../contexts/RoleContext"
import announcementService, { type Announcement } from "../../services/AnnouncementService"

const priorityColor: Record<string, string> = {
  low: "medium",
  normal: "primary",
  high: "warning",
  urgent: "danger",
}

const AnnouncementManagement: React.FC = () => {
  const { isHR, hasPermission } = useRole()
  const canManage = isHR || hasPermission('hr_full_access')
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")
  const [priority, setPriority] = useState<string>("normal")
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<number | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadAnnouncements()
  }, [])

  const loadAnnouncements = async () => {
    try {
      setLoading(true)
      const data = await announcementService.getAnnouncements()
      setAnnouncements(Array.isArray(data) ? data : [])
    } catch (err: any) {
      console.error("Failed to load announcements:", err)
      setAlertMessage("Failed to load announcements")
      setShowAlert(true)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    if (!title.trim() || !content.trim()) {
      setAlertMessage("Please fill in both title and content.")
      setShowAlert(true)
      return
    }

    try {
      setSubmitting(true)
      await announcementService.createAnnouncement({ title, content, priority })
      setIsModalOpen(false)
      setTitle("")
      setContent("")
      setPriority("normal")
      await loadAnnouncements()
    } catch (err: any) {
      console.error("Failed to create announcement:", err)
      setAlertMessage(err.message || "Failed to create announcement")
      setShowAlert(true)
    } finally {
      setSubmitting(false)
    }
  }

  const confirmDelete = (id: number) => {
    setDeleteTarget(id)
    setShowDeleteAlert(true)
  }

  const handleDelete = async () => {
    if (deleteTarget === null) return
    try {
      await announcementService.deleteAnnouncement(deleteTarget)
      await loadAnnouncements()
    } catch (err: any) {
      setAlertMessage("Failed to delete announcement")
      setShowAlert(true)
    } finally {
      setDeleteTarget(null)
    }
  }

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <MainLayout title="Announcements">
      <IonContent className="ion-padding">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <IonSpinner name="crescent" />
            <IonText className="ml-2">Loading announcements...</IonText>
          </div>
        ) : announcements.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <IonIcon icon={megaphoneOutline} style={{ fontSize: 64, color: "var(--ion-color-medium)" }} />
            <IonText color="medium" className="mt-4">
              <h2>No Announcements</h2>
              <p>There are no announcements at the moment.</p>
            </IonText>
          </div>
        ) : (
          <IonList>
            {announcements.map((a) => (
              <IonCard key={a.id} className="p-2">
                <IonCardHeader>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <IonCardTitle>{a.title}</IonCardTitle>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                      <IonBadge color={priorityColor[a.priority] || "primary"} className="p-2 mt-2">
                        {a.priority.toUpperCase()}
                      </IonBadge>
                      {canManage && (
                        <IonButton fill="clear" color="danger" size="small" onClick={() => confirmDelete(a.id)}>
                          <IonIcon icon={trash} slot="icon-only" />
                        </IonButton>
                      )}
                    </div>
                  </div>
                </IonCardHeader>
                <IonCardContent>
                  <p style={{ whiteSpace: "pre-wrap", marginBottom: 12 }}>{a.content}</p>
                  <div style={{ display: "flex", gap: 16, color: "var(--ion-color-medium)" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <IonIcon icon={personOutline} /> {a.created_by_name}
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      <IonIcon icon={timeOutline} /> {formatDate(a.created_at)}
                    </span>
                  </div>
                </IonCardContent>
              </IonCard>
            ))}
          </IonList>
        )}

        {/* Floating action button — only for HR / admins */}
        {canManage && (
          <IonFab vertical="bottom" horizontal="end" slot="fixed">
            <IonFabButton onClick={() => setIsModalOpen(true)}>
              <IonIcon icon={add} />
            </IonFabButton>
          </IonFab>
        )}

        {/* Create modal — only for HR / admins */}
        {canManage && (
        <IonModal isOpen={isModalOpen} onDidDismiss={() => setIsModalOpen(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>New Announcement</IonTitle>
              <IonButtons slot="end">
                <IonButton onClick={() => setIsModalOpen(false)}>
                  <IonIcon icon={close} />
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <IonItem>
              <IonLabel position="stacked">Title</IonLabel>
              <IonInput
                value={title}
                onIonChange={(e) => setTitle(e.detail.value!)}
                placeholder="Announcement title"
              />
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Priority</IonLabel>
              <IonSelect value={priority} onIonChange={(e) => setPriority(e.detail.value)}>
                <IonSelectOption value="low">Low</IonSelectOption>
                <IonSelectOption value="normal">Normal</IonSelectOption>
                <IonSelectOption value="high">High</IonSelectOption>
                <IonSelectOption value="urgent">Urgent</IonSelectOption>
              </IonSelect>
            </IonItem>

            <IonItem>
              <IonLabel position="stacked">Content</IonLabel>
              <IonTextarea
                value={content}
                onIonChange={(e) => setContent(e.detail.value!)}
                placeholder="Write the announcement content..."
                rows={6}
              />
            </IonItem>

            <IonButton
              expand="block"
              className="ion-margin-top"
              onClick={handleCreate}
              disabled={submitting}
            >
              {submitting ? <IonSpinner name="crescent" /> : "Publish & Notify All Users"}
            </IonButton>
          </IonContent>
        </IonModal>
        )}

        {/* Alerts */}
        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header="Notice"
          message={alertMessage}
          buttons={["OK"]}
        />
        <IonAlert
          isOpen={showDeleteAlert}
          onDidDismiss={() => setShowDeleteAlert(false)}
          header="Delete Announcement"
          message="Are you sure you want to delete this announcement?"
          buttons={[
            { text: "Cancel", role: "cancel" },
            { text: "Delete", role: "destructive", handler: handleDelete },
          ]}
        />
      </IonContent>
    </MainLayout>
  )
}

export default AnnouncementManagement
