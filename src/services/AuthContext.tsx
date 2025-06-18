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

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      // If we have a user, try to fetch the corresponding employee record
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
      
      setLoading(false);
    });

    // Clean up the subscription
    return () => unsubscribe();
  }, []);

  // Create the value that will be provided by the context
  const value = {
    currentUser,
    currentEmployee,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
