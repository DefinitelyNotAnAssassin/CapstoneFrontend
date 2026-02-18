import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase';
import employeeService from './EmployeeService';
import { EmployeeInformation } from '../data/data';

// Define the shape of our context
interface AuthContextType {
  currentUser: User | null;
  currentEmployee: EmployeeInformation | null;
  loading: boolean;
}

// Custom auth user interface from localStorage
interface StoredAuthUser {
  uid: string;
  email: string;
  displayName: string;
  isAuthenticated: boolean;
  authTimestamp: number;
}

// Create the context
const AuthContext = createContext<AuthContextType>({
  currentUser: null,
  currentEmployee: null,
  loading: true
});

// Create a hook to use the auth context
export const useAuthContext = () => {
  return useContext(AuthContext);
};

// Create the provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentEmployee, setCurrentEmployee] = useState<EmployeeInformation | null>(null);
  const [loading, setLoading] = useState(true);

  // Convert stored auth user to User-like object
  const createUserFromStorage = (storedUser: StoredAuthUser): User | null => {
    if (!storedUser || !storedUser.isAuthenticated) return null;
    
    // Create a User-like object for compatibility
    return {
      uid: storedUser.uid,
      email: storedUser.email,
      displayName: storedUser.displayName,
      emailVerified: true,
      isAnonymous: false,
      metadata: {} as any,
      providerData: [],
      refreshToken: '',
      tenantId: null,
      delete: async () => {},
      getIdToken: async () => '',
      getIdTokenResult: async () => ({} as any),
      reload: async () => {},
      toJSON: () => ({}),
      providerId: 'django-api',
      phoneNumber: null,
      photoURL: null,
    } as User;
  };

  // Check localStorage for authentication
  const checkLocalStorageAuth = (): User | null => {
    try {
      const storedAuthUser = localStorage.getItem('authUser');
      const storedDemoUser = localStorage.getItem('demoAdminUser');
      
      if (storedAuthUser) {
        const parsedUser: StoredAuthUser = JSON.parse(storedAuthUser);
        return createUserFromStorage(parsedUser);
      }
      
      if (storedDemoUser) {
        const parsedUser: StoredAuthUser = JSON.parse(storedDemoUser);
        return createUserFromStorage(parsedUser);
      }
    } catch (error) {
      console.error('Error reading localStorage auth:', error);
    }
    return null;
  };

  useEffect(() => {
    let isMounted = true;
    let unsubscribe: (() => void) | undefined;
    let timeoutId: NodeJS.Timeout | undefined;

    const initializeAuth = async () => {
      try {
        console.log('AuthContext: Initializing auth...');
        
        // First, check localStorage for Django API auth
        const localUser = checkLocalStorageAuth();
        
        if (localUser && isMounted) {
          console.log('AuthContext: Found localStorage user:', localUser.email);
          setCurrentUser(localUser);
          
          // Try to fetch employee data
          try {
            const employeeData = localStorage.getItem('employeeData');
            if (employeeData) {
              const parsedEmployee = JSON.parse(employeeData);
              setCurrentEmployee(parsedEmployee as any);
              console.log('AuthContext: Employee data loaded from localStorage');
            } else {
              console.log('AuthContext: Fetching employee data from service...');
              // Try fetching from service
              let employee = await employeeService.getEmployeeByAuthId(localUser.uid);
              if (!employee && localUser.email) {
                employee = await employeeService.getEmployeeByEmail(localUser.email);
              }
              setCurrentEmployee(employee || null);
            }
          } catch (error) {
            console.error('Error fetching employee data:', error);
            setCurrentEmployee(null);
          }
          
          console.log('AuthContext: Setting loading to false (localStorage auth)');
          setLoading(false);
          return;
        }

        console.log('AuthContext: No localStorage auth, setting up Firebase listener...');
        
        // Set a timeout to ensure loading is set to false even if Firebase never responds
        timeoutId = setTimeout(() => {
          if (isMounted && loading) {
            console.log('AuthContext: Firebase timeout - setting loading to false');
            setLoading(false);
          }
        }, 3000); // 3 second timeout

        // If no localStorage auth, listen to Firebase auth
        unsubscribe = onAuthStateChanged(auth, async (user) => {
          if (!isMounted) return;
          
          // Clear the timeout since we got a response
          if (timeoutId) {
            clearTimeout(timeoutId);
            timeoutId = undefined;
          }
          
          console.log('AuthContext: Firebase auth state changed:', user ? user.email : 'no user');
          setCurrentUser(user);

          // If we have a Firebase user, try to fetch the corresponding employee record
          if (user) {
            try {
              let employee = await employeeService.getEmployeeByAuthId(user.uid);

              // If not found by auth ID, try by email
              if (!employee && user.email) {
                employee = await employeeService.getEmployeeByEmail(user.email);
              }

              setCurrentEmployee(employee || null);
            } catch (error) {
              console.error("Error fetching employee data:", error);
              setCurrentEmployee(null);
            }
          } else {
            setCurrentEmployee(null);
          }

          console.log('AuthContext: Setting loading to false (Firebase auth)');
          setLoading(false);
        });
      } catch (error) {
        console.error('Error initializing auth:', error);
        console.log('AuthContext: Setting loading to false (error)');
        setLoading(false);
      }
    };

    initializeAuth();

    // Listen for custom auth state changes (e.g., after login)
    const handleAuthStateChange = () => {
      const localUser = checkLocalStorageAuth();
      if (isMounted) {
        setCurrentUser(localUser);
        if (localUser) {
          // Try to get employee data
          const employeeData = localStorage.getItem('employeeData');
          if (employeeData) {
            try {
              setCurrentEmployee(JSON.parse(employeeData) as any);
            } catch (error) {
              console.error('Error parsing employee data:', error);
            }
          }
        } else {
          setCurrentEmployee(null);
        }
      }
    };

    window.addEventListener('auth-state-changed', handleAuthStateChange);

    // Listen for storage changes (for cross-tab authentication)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'authUser' || e.key === 'demoAdminUser') {
        handleAuthStateChange();
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      isMounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      if (unsubscribe) {
        unsubscribe();
      }
      window.removeEventListener('auth-state-changed', handleAuthStateChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  // Create the value that will be provided by the context
  const value = {
    currentUser,
    currentEmployee,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
