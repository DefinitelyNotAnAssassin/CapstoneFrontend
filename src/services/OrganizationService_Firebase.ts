import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  orderBy,
  serverTimestamp
} from "firebase/firestore";
import { db } from "../config/firebase";

// Define interfaces for the data structures
interface Department {
  id: string;
  name: string;
  description?: string;
  headId?: string;
  createdAt?: any;
  updatedAt?: any;
}

interface Position {
  id: string;
  title: string;
  type: "Academic" | "Administrative";
  description?: string;
  createdAt?: any;
  updatedAt?: any;
}

interface Office {
  id: string;
  name: string;
  location: string;
  departmentId: string;
  createdAt?: any;
  updatedAt?: any;
}

interface Program {
  id: string;
  name: string;
  departmentId: string;
  description?: string;
  createdAt?: any;
  updatedAt?: any;
}

class OrganizationService {
  // Department methods
  async getAllDepartments(): Promise<Department[]> {
    try {
      const querySnapshot = await getDocs(
        query(collection(db, "departments"), orderBy("name", "asc"))
      );
      
      const departments: Department[] = [];
      querySnapshot.forEach((doc) => {
        departments.push({
          id: doc.id,
          ...doc.data(),
        } as Department);
      });
      
      return departments;
    } catch (error) {
      console.error("Error fetching departments:", error);
      throw new Error("Failed to fetch departments");
    }
  }

  async addDepartment(department: Omit<Department, 'id'>): Promise<Department> {
    try {
      const departmentData = {
        ...department,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "departments"), departmentData);
      
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
        } as Department;
      }
      
      throw new Error("Failed to retrieve created department");
    } catch (error) {
      console.error("Error adding department:", error);
      throw new Error("Failed to add department");
    }
  }

  // Position methods
  async getAllPositions(): Promise<Position[]> {
    try {
      const querySnapshot = await getDocs(
        query(collection(db, "positions"), orderBy("title", "asc"))
      );
      
      const positions: Position[] = [];
      querySnapshot.forEach((doc) => {
        positions.push({
          id: doc.id,
          ...doc.data(),
        } as Position);
      });
      
      return positions;
    } catch (error) {
      console.error("Error fetching positions:", error);
      throw new Error("Failed to fetch positions");
    }
  }

  async addPosition(position: Omit<Position, 'id'>): Promise<Position> {
    try {
      const positionData = {
        ...position,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "positions"), positionData);
      
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
        } as Position;
      }
      
      throw new Error("Failed to retrieve created position");
    } catch (error) {
      console.error("Error adding position:", error);
      throw new Error("Failed to add position");
    }
  }

  // Office methods
  async getAllOffices(): Promise<Office[]> {
    try {
      const querySnapshot = await getDocs(
        query(collection(db, "offices"), orderBy("name", "asc"))
      );
      
      const offices: Office[] = [];
      querySnapshot.forEach((doc) => {
        offices.push({
          id: doc.id,
          ...doc.data(),
        } as Office);
      });
      
      return offices;
    } catch (error) {
      console.error("Error fetching offices:", error);
      throw new Error("Failed to fetch offices");
    }
  }

  async addOffice(office: Omit<Office, 'id'>): Promise<Office> {
    try {
      const officeData = {
        ...office,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "offices"), officeData);
      
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
        } as Office;
      }
      
      throw new Error("Failed to retrieve created office");
    } catch (error) {
      console.error("Error adding office:", error);
      throw new Error("Failed to add office");
    }
  }

  // Program methods
  async getAllPrograms(): Promise<Program[]> {
    try {
      const querySnapshot = await getDocs(
        query(collection(db, "programs"), orderBy("name", "asc"))
      );
      
      const programs: Program[] = [];
      querySnapshot.forEach((doc) => {
        programs.push({
          id: doc.id,
          ...doc.data(),
        } as Program);
      });
      
      return programs;
    } catch (error) {
      console.error("Error fetching programs:", error);
      throw new Error("Failed to fetch programs");
    }
  }

  async addProgram(program: Omit<Program, 'id'>): Promise<Program> {
    try {
      const programData = {
        ...program,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, "programs"), programData);
      
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
        } as Program;
      }
      
      throw new Error("Failed to retrieve created program");
    } catch (error) {
      console.error("Error adding program:", error);
      throw new Error("Failed to add program");
    }
  }

  // Initialize default data (call this once to populate Firestore with sample data)
  async initializeDefaultData(): Promise<void> {
    try {
      // Check if departments exist
      const departments = await this.getAllDepartments();
      if (departments.length === 0) {
        // Add sample departments
        await this.addDepartment({
          name: "College of Engineering",
          description: "Engineering programs and research"
        });
        await this.addDepartment({
          name: "College of Liberal Arts",
          description: "Liberal arts and humanities programs"
        });
        await this.addDepartment({
          name: "Administrative Office",
          description: "Administrative and support services"
        });
      }

      // Check if positions exist
      const positions = await this.getAllPositions();
      if (positions.length === 0) {
        // Add sample positions
        await this.addPosition({
          title: "Professor",
          type: "Academic",
          description: "Senior faculty position"
        });
        await this.addPosition({
          title: "Associate Professor",
          type: "Academic",
          description: "Mid-level faculty position"
        });
        await this.addPosition({
          title: "Assistant Professor",
          type: "Academic",
          description: "Entry-level faculty position"
        });
        await this.addPosition({
          title: "Administrative Assistant",
          type: "Administrative",
          description: "Administrative support role"
        });
        await this.addPosition({
          title: "Department Head",
          type: "Administrative",
          description: "Department leadership role"
        });
      }

      console.log("Default data initialization complete");
    } catch (error) {
      console.error("Error initializing default data:", error);
      throw new Error("Failed to initialize default data");
    }
  }
}

// Create a singleton instance
const organizationService = new OrganizationService();
export default organizationService;
