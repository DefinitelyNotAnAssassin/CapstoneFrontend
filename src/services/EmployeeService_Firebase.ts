import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  Timestamp,
  serverTimestamp
} from "firebase/firestore";
import { db } from "../config/firebase";
import { type EmployeeInformation } from "../data/data";
import auditService from "./AuditService";
import { createAuthUser } from "../utils/authUtils";

// Helper function to clean undefined values from objects before sending to Firestore
const cleanUndefinedValues = (obj: Record<string, any>): Record<string, any> => {
  const cleanedObj: Record<string, any> = {};
  
  Object.entries(obj).forEach(([key, value]) => {
    // Skip undefined values
    if (value !== undefined) {
      cleanedObj[key] = value;
    }
  });
  
  return cleanedObj;
};

// Event system for updating components when employee data changes
type EmployeeDataListener = () => void;

class EmployeeService {
  private collectionName = "employees";
  private listeners: EmployeeDataListener[] = [];

  // Subscribe to employee data changes
  subscribe(listener: EmployeeDataListener): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  // Notify all listeners that employee data has changed
  private notifyListeners(): void {
    this.listeners.forEach(listener => listener());
  }

  // Get all employees
  async getAllEmployees(): Promise<EmployeeInformation[]> {
    try {
      const querySnapshot = await getDocs(
        query(collection(db, this.collectionName), orderBy("lastName", "asc"))
      );
      
      const employees: EmployeeInformation[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        employees.push({
          id: doc.id,
          ...data,
          // Convert Firestore Timestamps to ISO strings
          birthDate: data.birthDate?.toDate?.()?.toISOString() || data.birthDate,
          dateHired: data.dateHired?.toDate?.()?.toISOString() || data.dateHired,
        } as EmployeeInformation);
      });
      
      return employees;
    } catch (error) {
      console.error("Error fetching employees:", error);
      throw new Error("Failed to fetch employees");
    }
  }

  // Get employee by ID
  async getEmployeeById(id: string): Promise<EmployeeInformation | undefined> {
    try {
      const docRef = doc(db, this.collectionName, id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          // Convert Firestore Timestamps to ISO strings
          birthDate: data.birthDate?.toDate?.()?.toISOString() || data.birthDate,
          dateHired: data.dateHired?.toDate?.()?.toISOString() || data.dateHired,
        } as EmployeeInformation;
      }
      
      return undefined;
    } catch (error) {
      console.error("Error fetching employee:", error);
      throw new Error("Failed to fetch employee");
    }
  }
  
  // Get employee by email
  async getEmployeeByEmail(email: string): Promise<EmployeeInformation | undefined> {
    try {
      const q = query(collection(db, this.collectionName), where("email", "==", email));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const docSnap = querySnapshot.docs[0];
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          // Convert Firestore Timestamps to ISO strings
          birthDate: data.birthDate?.toDate?.()?.toISOString() || data.birthDate,
          dateHired: data.dateHired?.toDate?.()?.toISOString() || data.dateHired,
        } as EmployeeInformation;
      }
      
      return undefined;
    } catch (error) {
      console.error("Error fetching employee by email:", error);
      throw new Error("Failed to fetch employee by email");
    }
  }
  
  // Check if an employee exists by email (without throwing errors)
  async checkEmployeeExistsByEmail(email: string): Promise<boolean> {
    try {
      const q = query(collection(db, this.collectionName), where("email", "==", email));
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error("Error checking if employee exists:", error);
      return false;
    }
  }
  
  // Get employee by auth user ID
  async getEmployeeByAuthId(authUserId: string): Promise<EmployeeInformation | undefined> {
    try {
      const q = query(collection(db, this.collectionName), where("authUserId", "==", authUserId));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const docSnap = querySnapshot.docs[0];
        const data = docSnap.data();
        return {
          id: docSnap.id,
          ...data,
          // Convert Firestore Timestamps to ISO strings
          birthDate: data.birthDate?.toDate?.()?.toISOString() || data.birthDate,
          dateHired: data.dateHired?.toDate?.()?.toISOString() || data.dateHired,
        } as EmployeeInformation;
      }
      
      return undefined;
    } catch (error) {
      console.error("Error fetching employee by auth ID:", error);
      throw new Error("Failed to fetch employee by auth ID");
    }
  }

  // Add new employee
  async addEmployee(employee: Omit<EmployeeInformation, 'id'>, userId: string, username: string): Promise<EmployeeInformation> {
    try {
      // Check if employee with same employeeId already exists
      const existingQuery = query(
        collection(db, this.collectionName), 
        where("employeeId", "==", employee.employeeId)
      );
      const existingSnapshot = await getDocs(existingQuery);
      
      if (!existingSnapshot.empty) {
        throw new Error("Employee with this ID already exists");
      }
      
      // Handle authentication if password is provided
      let authUserId = undefined;
      if (employee.email && employee.password) {
        try {
          const fullName = `${employee.firstName} ${employee.lastName}`;
          const authUser = await createAuthUser(
            employee.email,
            employee.password,
            fullName
          );
          authUserId = authUser.uid;
          console.log(`Created auth account for ${employee.email}`);
        } catch (authError) {
          console.error("Failed to create authentication account:", authError);
          // Continue without auth if it fails
        }
      }

      // Remove password from employee data (NEVER store passwords)
      const { password, ...employeeWithoutPassword } = employee;
      
      // Prepare employee data for Firestore
      const employeeData = cleanUndefinedValues({
        ...employeeWithoutPassword,
        authUserId, // Add the auth user ID if available
        // Convert date strings to Firestore Timestamps
        birthDate: employee.birthDate ? Timestamp.fromDate(new Date(employee.birthDate)) : null,
        dateHired: employee.dateHired ? Timestamp.fromDate(new Date(employee.dateHired)) : null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Add employee to Firestore
      const docRef = await addDoc(collection(db, this.collectionName), employeeData);
      
      // Get the created employee
      const createdEmployee = await this.getEmployeeById(docRef.id);
      
      if (!createdEmployee) {
        throw new Error("Failed to retrieve created employee");
      }      // Log to audit trail
      await auditService.logEvent({
        userId,
        username,
        action: "CREATE",
        module: "EMPLOYEE",
        details: `Added new employee: ${employee.firstName} ${employee.lastName} (${employee.employeeId})`,
        ipAddress: "127.0.0.1", // In a real app, you would get the actual IP
        status: "success",
      });
      
      // Notify listeners that employee data has changed
      this.notifyListeners();

      return createdEmployee;
    } catch (error) {
      console.error("Error adding employee:", error);
      
      // Log failed attempt to audit trail
      await auditService.logEvent({
        userId,
        username,
        action: "CREATE",
        module: "EMPLOYEE",
        details: `Failed to add employee: ${employee.firstName} ${employee.lastName} (${employee.employeeId})`,
        ipAddress: "127.0.0.1",
        status: "failure",
      });
      
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to add employee");
    }
  }

  // Update employee
  async updateEmployee(employee: EmployeeInformation, userId: string, username: string): Promise<EmployeeInformation> {
    try {
      const docRef = doc(db, this.collectionName, employee.id);
      
      // Check if document exists
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        throw new Error("Employee not found");
      }      // Prepare employee data for Firestore
      const { id, ...employeeData } = employee;
      const updateData = cleanUndefinedValues({
        ...employeeData,
        // Convert date strings to Firestore Timestamps
        birthDate: employee.birthDate ? Timestamp.fromDate(new Date(employee.birthDate)) : null,
        dateHired: employee.dateHired ? Timestamp.fromDate(new Date(employee.dateHired)) : null,
        updatedAt: serverTimestamp(),
      });

      // Update employee in Firestore
      await updateDoc(docRef, updateData);
      
      // Get the updated employee
      const updatedEmployee = await this.getEmployeeById(employee.id);
      
      if (!updatedEmployee) {
        throw new Error("Failed to retrieve updated employee");
      }      // Log to audit trail
      await auditService.logEvent({
        userId,
        username,
        action: "UPDATE",
        module: "EMPLOYEE",
        details: `Updated employee: ${employee.firstName} ${employee.lastName} (${employee.employeeId})`,
        ipAddress: "127.0.0.1",
        status: "success",
      });
      
      // Notify listeners that employee data has changed
      this.notifyListeners();

      return updatedEmployee;
    } catch (error) {
      console.error("Error updating employee:", error);
      
      // Log failed attempt to audit trail
      await auditService.logEvent({
        userId,
        username,
        action: "UPDATE",
        module: "EMPLOYEE",
        details: `Failed to update employee: ${employee.firstName} ${employee.lastName} (${employee.employeeId})`,
        ipAddress: "127.0.0.1",
        status: "failure",
      });
      
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to update employee");
    }
  }

  // Delete employee
  async deleteEmployee(id: string, userId: string, username: string): Promise<boolean> {
    try {
      const docRef = doc(db, this.collectionName, id);
      
      // Get employee data before deletion for audit log
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        throw new Error("Employee not found");
      }
      
      const employeeData = docSnap.data() as EmployeeInformation;
      
      // Delete employee from Firestore
      await deleteDoc(docRef);      // Log to audit trail
      await auditService.logEvent({
        userId,
        username,
        action: "DELETE",
        module: "EMPLOYEE",
        details: `Deleted employee: ${employeeData.firstName} ${employeeData.lastName} (${employeeData.employeeId})`,
        ipAddress: "127.0.0.1",
        status: "success",
      });
      
      // Notify listeners that employee data has changed
      this.notifyListeners();

      return true;
    } catch (error) {
      console.error("Error deleting employee:", error);
      
      // Log failed attempt to audit trail (if we have employee data)
      try {
        const docSnap = await getDoc(doc(db, this.collectionName, id));
        if (docSnap.exists()) {
          const employeeData = docSnap.data() as EmployeeInformation;
          await auditService.logEvent({
            userId,
            username,
            action: "DELETE",
            module: "EMPLOYEE",
            details: `Failed to delete employee: ${employeeData.firstName} ${employeeData.lastName} (${employeeData.employeeId})`,
            ipAddress: "127.0.0.1",
            status: "failure",
          });
        }
      } catch (auditError) {
        console.error("Error logging audit trail:", auditError);
      }
      
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to delete employee");
    }
  }

  // Search employees
  async searchEmployees(searchQuery: string): Promise<EmployeeInformation[]> {
    try {
      if (!searchQuery.trim()) {
        return await this.getAllEmployees();
      }

      // Get all employees and filter client-side
      // Note: Firestore doesn't support full-text search natively
      // For production, consider using Algolia or implementing a more sophisticated search
      const allEmployees = await this.getAllEmployees();
      
      const lowerQuery = searchQuery.toLowerCase();
      return allEmployees.filter(
        (emp) =>
          emp.firstName.toLowerCase().includes(lowerQuery) ||
          emp.lastName.toLowerCase().includes(lowerQuery) ||
          emp.employeeId.toLowerCase().includes(lowerQuery) ||
          (emp.email && emp.email.toLowerCase().includes(lowerQuery)) ||
          (emp.middleName && emp.middleName.toLowerCase().includes(lowerQuery))
      );
    } catch (error) {
      console.error("Error searching employees:", error);
      throw new Error("Failed to search employees");
    }
  }

  // Filter employees by department
  async filterByDepartment(departmentId: string): Promise<EmployeeInformation[]> {
    try {
      if (!departmentId) {
        return await this.getAllEmployees();
      }

      const q = query(
        collection(db, this.collectionName),
        where("departmentId", "==", departmentId),
        orderBy("lastName", "asc")
      );
      
      const querySnapshot = await getDocs(q);
      const employees: EmployeeInformation[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        employees.push({
          id: doc.id,
          ...data,
          // Convert Firestore Timestamps to ISO strings
          birthDate: data.birthDate?.toDate?.()?.toISOString() || data.birthDate,
          dateHired: data.dateHired?.toDate?.()?.toISOString() || data.dateHired,
        } as EmployeeInformation);
      });
      
      return employees;
    } catch (error) {
      console.error("Error filtering employees by department:", error);
      throw new Error("Failed to filter employees by department");
    }
  }

  // Filter employees by position
  async filterByPosition(positionId: string): Promise<EmployeeInformation[]> {
    try {
      if (!positionId) {
        return await this.getAllEmployees();
      }

      const q = query(
        collection(db, this.collectionName),
        where("positionId", "==", positionId),
        orderBy("lastName", "asc")
      );
      
      const querySnapshot = await getDocs(q);
      const employees: EmployeeInformation[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        employees.push({
          id: doc.id,
          ...data,
          // Convert Firestore Timestamps to ISO strings
          birthDate: data.birthDate?.toDate?.()?.toISOString() || data.birthDate,
          dateHired: data.dateHired?.toDate?.()?.toISOString() || data.dateHired,
        } as EmployeeInformation);
      });
      
      return employees;
    } catch (error) {
      console.error("Error filtering employees by position:", error);
      throw new Error("Failed to filter employees by position");
    }
  }

  // Get employee count
  async getEmployeeCount(): Promise<number> {
    try {
      const querySnapshot = await getDocs(collection(db, this.collectionName));
      return querySnapshot.size;
    } catch (error) {
      console.error("Error getting employee count:", error);
      throw new Error("Failed to get employee count");
    }
  }

  // Get employees by status (active/inactive)
  async getEmployeesByStatus(isActive: boolean = true): Promise<EmployeeInformation[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where("isActive", "==", isActive),
        orderBy("lastName", "asc")
      );
      
      const querySnapshot = await getDocs(q);
      const employees: EmployeeInformation[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        employees.push({
          id: doc.id,
          ...data,
          // Convert Firestore Timestamps to ISO strings
          birthDate: data.birthDate?.toDate?.()?.toISOString() || data.birthDate,
          dateHired: data.dateHired?.toDate?.()?.toISOString() || data.dateHired,
        } as EmployeeInformation);
      });
      
      return employees;
    } catch (error) {
      console.error("Error getting employees by status:", error);
      // If the isActive field doesn't exist yet, return all employees
      return await this.getAllEmployees();
    }
  }
}

export default new EmployeeService();
