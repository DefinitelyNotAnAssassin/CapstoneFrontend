// AuthGuard.tsx - Enhanced with role-based redirects and API authentication

import React, { useState, useEffect } from "react";
import { Redirect, Route, useHistory } from "react-router-dom";
import { IonLoading } from "@ionic/react";
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
      currentPath.includes("/audit")) {
    return null;
  }
  
  // Default redirect to dashboard for all authenticated users
  return "/hr-dashboard";
};

const AuthGuard: React.FC<{ 
  component: React.ComponentType<any>; 
  path: string; 
  exact?: boolean;
  requirePermission?: string;
}> = ({
  component: Component,
  requirePermission,
  ...rest
}) => {
  const currentUser = AuthService.getCurrentUser();
  const { userRole, loading: roleLoading, hasPermission } = useRole();
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

  if (showLoading) {
    return <IonLoading isOpen={true} message="Loading..." spinner="circles" duration={3000} />;
  }

  // Check permission if required
  if (requirePermission && isAuthenticated && userRole) {
    if (!hasPermission(requirePermission as any)) {
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
      render={(props) =>
        isAuthenticated ? (
          <Component {...props} />
        ) : (
          <Redirect
            to={{
              pathname: "/sign-in",
              state: { from: props.location }
            }}
          />
        )
      }
    />
  );
};

export default AuthGuard;
