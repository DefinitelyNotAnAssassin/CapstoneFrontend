// AuthGuard.tsx - Enhanced with role-based redirects and API authentication

import React, { useState, useEffect } from "react";
import { Redirect, Route, useHistory } from "react-router-dom";
import { IonPage, IonContent, IonSpinner } from "@ionic/react";
import AuthService from "../services/AuthService";
import { useRole } from "../contexts/RoleContext";

// Role-based redirect logic
const getRoleBasedRedirect = (userRole: any, currentPath: string) => {
  if (!userRole) return "/sign-in";
  
  // Don't redirect if already on dashboard or a specific module
  if (currentPath.includes("/hr-dashboard") || 
      currentPath.includes("/leave-") || 
      currentPath.includes("/employee-") ||
      currentPath.includes("/organization") ||
      currentPath.includes("/reports") ||
      currentPath.includes("/audit") ||
      currentPath.includes("/roles-") ||
      currentPath.includes("/user-permissions") ||
      currentPath.includes("/faculty") ||
      currentPath.includes("/firebase")) {
    return null;
  }
  
  // Default redirect to dashboard for all authenticated users
  return "/hr-dashboard";
};

/**
 * Inline loading component that renders inside an IonPage
 * instead of using IonLoading overlay (which creates a backdrop that can block interaction).
 */
const InlineLoading: React.FC = () => (
  <IonPage>
    <IonContent>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        gap: '16px',
      }}>
        <IonSpinner name="crescent" color="primary" style={{ width: '48px', height: '48px' }} />
        <p style={{ color: 'var(--ion-color-medium)', fontSize: '0.9rem' }}>Loading...</p>
      </div>
    </IonContent>
  </IonPage>
);

const AuthGuard: React.FC<{ 
  component: React.ComponentType<any>; 
  path: string; 
  exact?: boolean;
  requirePermission?: string | string[];
}> = ({
  component: Component,
  requirePermission,
  ...rest
}) => {
  const currentUser = AuthService.getCurrentUser();
  const { userRole, loading: roleLoading, hasPermission, hasAnyPermission } = useRole();
  const [showLoading, setShowLoading] = useState(roleLoading);
  const history = useHistory();

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (roleLoading) {
      setShowLoading(true);
      // Don't show loading for more than 3 seconds
      timeoutId = setTimeout(() => {
        console.log("AuthGuard: Loading timeout reached");
        setShowLoading(false);
      }, 3000);
    } else {
      setShowLoading(false);
      
      // Role-based redirect after authentication
      if (currentUser && userRole) {
        const currentPath = window.location.pathname;
        const redirectTo = getRoleBasedRedirect(userRole, currentPath);
        
        if (redirectTo && currentPath !== redirectTo) {
          console.log(`AuthGuard: Redirecting ${userRole.title} to ${redirectTo}`);
          history.push(redirectTo);
        }
      }
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [roleLoading, currentUser, userRole, history]);

  // Check demo admin session
  const checkForDemoAdmin = () => {
    try {
      const demoAdminJson = localStorage.getItem('demoAdminUser');
      if (demoAdminJson) {
        const demoAdmin = JSON.parse(demoAdminJson);
        
        const now = Date.now();
        const authTime = demoAdmin.authTimestamp || 0;
        const SESSION_VALIDITY = 24 * 60 * 60 * 1000; // 24 hours
        
        if (now - authTime < SESSION_VALIDITY) {
          return true;
        } else {
          localStorage.removeItem('demoAdminUser');
        }
      }
    } catch (e) {
      console.error("AuthGuard: Error checking demo admin login:", e);
    }
    return false;
  };

  const isDemoAdmin = checkForDemoAdmin();
  const isAuthenticated = currentUser || isDemoAdmin;

  // Check permission if required
  if (requirePermission && isAuthenticated && !roleLoading && userRole) {
    const hasAccess = Array.isArray(requirePermission)
      ? hasAnyPermission(requirePermission)
      : hasPermission(requirePermission);
    
    if (!hasAccess) {
      return (
        <Redirect
          to={{
            pathname: "/hr-dashboard",
            state: { error: "You don't have permission to access this page" }
          }}
        />
      );
    }
  }

  return (
    <Route
      {...rest}
      render={(props) => {
        if (!isAuthenticated) {
          return (
            <Redirect
              to={{
                pathname: "/sign-in",
                state: { from: props.location }
              }}
            />
          );
        }

        // Show inline loading instead of IonLoading overlay
        if (showLoading) {
          return <InlineLoading />;
        }

        return <Component {...props} />;
      }}
    />
  );
};

export default AuthGuard;
