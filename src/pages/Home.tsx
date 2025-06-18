import type React from "react"
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
  IonGrid,
  IonRow,
  IonCol,
  IonItem,
  IonLabel,
  IonBadge,
} from "@ionic/react"
import { calendar, people, briefcase, analytics, notifications } from "ionicons/icons"

const Home: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>HRIMS Dashboard</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Welcome to HR Information Management System</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <p>Access and manage your HR information, leave requests, and more.</p>
          </IonCardContent>
        </IonCard>

        <IonGrid>
          <IonRow>
            <IonCol size="12" size-md="6">
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>Leave Management</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <IonItem lines="none">
                    <IonIcon icon={calendar} slot="start" color="primary" />
                    <IonLabel>Pending Requests</IonLabel>
                    <IonBadge color="warning">2</IonBadge>
                  </IonItem>
                  <IonItem lines="none">
                    <IonIcon icon={notifications} slot="start" color="success" />
                    <IonLabel>Approved Requests</IonLabel>

                    <IonBadge color="success">1</IonBadge>
                  </IonItem>
                  <IonButton expand="block" routerLink="/leave-management" className="ion-margin-top">
                    View Leave Management
                  </IonButton>
                </IonCardContent>
              </IonCard>
            </IonCol>

            <IonCol size="12" size-md="6">
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>Employee Directory</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <IonItem lines="none">
                    <IonIcon icon={people} slot="start" color="primary" />
                    <IonLabel>Total Employees</IonLabel>
                    <IonBadge color="primary">25</IonBadge>
                  </IonItem>
                  <IonItem lines="none">
                    <IonIcon icon={briefcase} slot="start" color="tertiary" />
                    <IonLabel>Departments</IonLabel>
                    <IonBadge color="tertiary">5</IonBadge>
                  </IonItem>
                  <IonButton expand="block" routerLink="/employees" className="ion-margin-top">
                    View Employee Directory
                  </IonButton>
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol size="12">
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>Quick Actions</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <IonGrid>
                    <IonRow>
                      <IonCol size="6">
                        <IonButton expand="block" routerLink="/leave-request">
                          <IonIcon slot="start" icon={calendar} />
                          Request Leave
                        </IonButton>
                      </IonCol>
                      <IonCol size="6">
                        <IonButton expand="block" color="secondary">
                          <IonIcon slot="start" icon={analytics} />
                          View Reports
                        </IonButton>
                      </IonCol>
                    </IonRow>
                  </IonGrid>
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  )
}

export default Home
