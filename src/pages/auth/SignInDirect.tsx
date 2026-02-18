import React, { useEffect, useState } from 'react';
import { IonContent, IonLoading, IonPage, IonText } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { useAuthContext } from '../../services/AuthContext';

/**
 * This component provides a direct authentication and navigation to the dashboard.
 * It's specifically designed for demo admin login without firebase authentication.
 */
const SignInDirect: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const history = useHistory();
  const { currentUser, loading: authLoading } = useAuthContext();

  // Redirect if already authenticated
  useEffect(() => {
    if (!authLoading && currentUser) {
      history.replace('/hr-dashboard');
      return;
    }
    
    // Otherwise, proceed with demo admin authentication
    if (!authLoading && !currentUser) {
      authenticateDemoAdminAndNavigate();
    }
  }, [currentUser, authLoading, history]);

  return (
    <IonPage>
      <IonContent className="ion-padding">
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
          <IonText color="primary">
            <h2>Authenticating Demo Admin...</h2>
          </IonText>
          <p>Please wait while we authenticate your session.</p>
        </div>
        <IonLoading isOpen={loading} message="Authenticating demo admin..." />
      </IonContent>
    </IonPage>
  );
};

/**
 * Authenticates the demo admin user and navigates to the dashboard
 * This is exported so it can be used from other components
 */
export function authenticateDemoAdminAndNavigate() {
  console.log("Authenticating demo admin and navigating to dashboard");
  
  // Store demo admin authentication data in localStorage
  const demoAdminUser = {
    uid: "demo-admin-user-id",
    email: "admin@demo.com",
    displayName: "Admin User",
    isAuthenticated: true,
    authTimestamp: Date.now()
  };
  
  // Save to localStorage for persistent authentication
  localStorage.setItem('demoAdminUser', JSON.stringify(demoAdminUser));
  console.log("Demo admin authentication data stored in localStorage");
  
  // Dispatch custom event to notify AuthContext
  window.dispatchEvent(new CustomEvent('auth-state-changed'));
  
  // Small delay then navigate
  setTimeout(() => {
    window.location.href = '/hr-dashboard';
  }, 100);
}

/**
 * Function to directly navigate to the HR dashboard
 * Uses multiple strategies to ensure navigation works
 */
export function directNavigate() {
  console.log("DirectNavigate: Attempting direct navigation to dashboard");
  
  // First attempt - standard href navigation
  window.location.href = '/hr-dashboard';
  
  // Second attempt with timeout - try hash routing
  setTimeout(() => {
    console.log("DirectNavigate: First attempt may have failed, trying hash routing");
    if (window.location.pathname !== '/hr-dashboard') {
      window.location.hash = '/hr-dashboard';
    }
  }, 500);
  
  // Final attempt - force a full page reload to the dashboard
  setTimeout(() => {
    console.log("DirectNavigate: Both attempts may have failed, forcing reload");
    if (window.location.pathname !== '/hr-dashboard' && !window.location.hash.includes('/hr-dashboard')) {
      window.location.replace('/hr-dashboard');
    }
  }, 1000);
}

export default SignInDirect;