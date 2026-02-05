// AuthGuard.tsx - Enhanced with role-based redirects and API authentication

import React, { useState, useEffect, useRef } from "react";
import { Redirect, Route, useHistory } from "react-router-dom";
import { IonLoading } from "@ionic/react";
import AuthService from "../services/AuthService";
import { useRole } from "../contexts/RoleContext";

// Role-based redirect logic
const getRoleBasedRedirect = (hasRole: boolean, currentPath: string) => {
  if (!hasRole) return "/sign-in";
  
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
  const { primaryRole, highestLevel, loading: roleLoading, hasPermission } = useRole();
  const [showLoading, setShowLoading] = useState(false);
  const history = useHistory();
  const hasRedirected = useRef(false);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    hasRedirected.current = false;
    
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (roleLoading) {
      // Only show loading overlay after a brief delay to avoid flashing
      timeoutId = setTimeout(() => {
        if (isMounted.current && roleLoading) {
          setShowLoading(true);
        }
      }, 300); // 300ms delay before showing loading
      
      // Force hide loading after 1.5 seconds max
      const forceHideTimeout = setTimeout(() => {
        if (isMounted.current) {
          console.log("AuthGuard: Force hiding loading overlay");
          setShowLoading(false);
        }
      }, 1500);
      
      return () => {
        clearTimeout(timeoutId);
        clearTimeout(forceHideTimeout);
      };
    } else {
      // Role finished loading - immediately hide
      if (isMounted.current) {
        setShowLoading(false);
      }
      
      // Only do redirect logic once per mount and only for initial navigation
      if (currentUser && primaryRole && !hasRedirected.current) {
        const currentPath = window.location.pathname;
        const redirectTo = getRoleBasedRedirect(!!primaryRole, currentPath);
        
        if (redirectTo && currentPath !== redirectTo) {
          hasRedirected.current = true;
          console.log(`AuthGuard: Redirecting ${primaryRole.role_name} to ${redirectTo}`);
          history.push(redirectTo);
        }
      }
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [roleLoading]);

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
    return (
      <IonLoading 
        isOpen={true} 
        message="Loading..." 
        spinner="circles" 
        duration={3000}
        onDidDismiss={() => setShowLoading(false)}
      />
    );
  }

  // Check permission if required
  if (requirePermission && isAuthenticated && primaryRole) {
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
