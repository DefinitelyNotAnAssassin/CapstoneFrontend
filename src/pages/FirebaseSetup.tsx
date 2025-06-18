import React, { useState } from 'react';
import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonToast,
  IonSpinner,
  IonText,
  IonList,
  IonItem,
  IonLabel,
  IonIcon
} from '@ionic/react';
import { checkmark, warning, cloud } from 'ionicons/icons';
import { initializeFirestoreData } from '../utils/initFirestore';
import organizationService from '../services/OrganizationService';

const FirebaseSetup: React.FC = () => {
  const [isInitializing, setIsInitializing] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState<'success' | 'danger' | 'warning'>('success');
  const [isInitialized, setIsInitialized] = useState(false);

  const handleInitializeData = async () => {
    try {
      setIsInitializing(true);
      await initializeFirestoreData();
      setToastMessage('Firestore data initialized successfully!');
      setToastColor('success');
      setShowToast(true);
      setIsInitialized(true);
    } catch (error) {
      console.error('Error initializing data:', error);
      setToastMessage('Failed to initialize Firestore data. Check console for details.');
      setToastColor('danger');
      setShowToast(true);
    } finally {
      setIsInitializing(false);
    }
  };

  const checkDataStatus = async () => {
    try {
      const departments = await organizationService.getAllDepartments();
      const positions = await organizationService.getAllPositions();
      
      if (departments.length > 0 || positions.length > 0) {
        setIsInitialized(true);
        setToastMessage(`Found ${departments.length} departments and ${positions.length} positions`);
        setToastColor('success');
        setShowToast(true);
      } else {
        setToastMessage('No data found in Firestore. Please initialize.');
        setToastColor('warning');
        setShowToast(true);
      }
    } catch (error) {
      console.error('Error checking data status:', error);
      setToastMessage('Error checking Firestore status');
      setToastColor('danger');
      setShowToast(true);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Firebase Setup</IonTitle>
        </IonToolbar>
      </IonHeader>
      
      <IonContent>
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>
              <IonIcon icon={cloud} /> Firestore Database Setup
            </IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonText>
              <p>This page helps you set up your Firestore database with initial data for the HRIS system.</p>
            </IonText>
            
            <IonList>
              <IonItem>
                <IonIcon 
                  icon={isInitialized ? checkmark : warning} 
                  color={isInitialized ? 'success' : 'warning'} 
                  slot="start" 
                />
                <IonLabel>
                  <h3>Database Status</h3>
                  <p>{isInitialized ? 'Data initialized' : 'Needs initialization'}</p>
                </IonLabel>
              </IonItem>
            </IonList>

            <div style={{ marginTop: '20px' }}>
              <IonButton 
                expand="block" 
                onClick={handleInitializeData}
                disabled={isInitializing}
                color="primary"
              >
                {isInitializing ? (
                  <>
                    <IonSpinner name="circles" style={{ marginRight: '10px' }} />
                    Initializing...
                  </>
                ) : (
                  'Initialize Sample Data'
                )}
              </IonButton>
              
              <IonButton 
                expand="block" 
                fill="outline" 
                onClick={checkDataStatus}
                style={{ marginTop: '10px' }}
              >
                Check Data Status
              </IonButton>
            </div>

            <IonText color="medium">
              <p style={{ marginTop: '20px', fontSize: '0.9em' }}>
                <strong>Note:</strong> This will create sample departments, positions, and other organizational data in your Firestore database. 
                You only need to run this once when setting up the system.
              </p>
            </IonText>
          </IonCardContent>
        </IonCard>

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

export default FirebaseSetup;
