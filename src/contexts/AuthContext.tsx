import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';

// Define the shape of our authentication context
type AuthContextType = {
  isAuthenticated: boolean;
  isLoading: boolean;
  userId: string | null;
};

// Create the context with default values
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  userId: null,
});

// Export a hook to easily use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

// Authentication Provider Component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  
  useEffect(() => {
    // Handle the case where there might already be a user authenticated
    const currentUser = auth.currentUser;
    if (currentUser) {
      setIsAuthenticated(true);
      setUserId(currentUser.uid);
      setIsLoading(false);
      return;
    }
    
    // Listen for authentication state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      setUserId(user ? user.uid : null);
      setIsLoading(false);
    });
    
    // Set a timeout to avoid infinite loading state
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        console.log('Auth loading timed out, setting to not authenticated');
        setIsLoading(false);
        setIsAuthenticated(false);
      }
    }, 3000);
    
    // Clean up subscription and timeout
    return () => {
      unsubscribe();
      clearTimeout(timeoutId);
    };
  }, []);
  
  // Provide auth state to children
  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, userId }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
