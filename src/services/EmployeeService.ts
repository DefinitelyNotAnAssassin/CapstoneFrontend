import { type EmployeeInformation } from "../data/data";

// API configuration
const API_BASE_URL = 'https://dharklike.pythonanywhere.com/api';

// Helper function to handle API responses
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail || errorData?.error || `HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
};

// Helper function to make API requests
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, config);
  return handleResponse(response);
};

// Event system for updating components when employee data changes
type EmployeeDataListener = () => void;

class EmployeeService {
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
      const data = await apiRequest('/employees/');
      return (data.results || data).map((emp: any) => this.transformEmployeeData(emp));
    } catch (error) {
      console.error("Error fetching employees:", error);
      throw new Error("Failed to fetch employees");
    }
  }

  // Get employee by ID
  async getEmployeeById(id: string): Promise<EmployeeInformation | undefined> {
    try {
      const data = await apiRequest(`/employees/${id}/`);
      return this.transformEmployeeData(data);
    } catch (error) {
      console.error("Error fetching employee:", error);
      if (error instanceof Error && error.message.includes('404')) {
        return undefined;
      }
      throw new Error("Failed to fetch employee");
    }
  }
  
  // Get employee by email
  async getEmployeeByEmail(email: string): Promise<EmployeeInformation | undefined> {
    try {
      const data = await apiRequest(`/employees/by_email/?email=${encodeURIComponent(email)}`);
      return this.transformEmployeeData(data);
    } catch (error) {
      console.error("Error fetching employee by email:", error);
      if (error instanceof Error && error.message.includes('404')) {
        return undefined;
      }
      throw new Error("Failed to fetch employee by email");
    }
  }
  
  // Check if an employee exists by email (without throwing errors)
  async checkEmployeeExistsByEmail(email: string): Promise<boolean> {
    try {
      await this.getEmployeeByEmail(email);
      return true;
    } catch (error) {
      return false;
    }
  }
  
  // Get employee by auth user ID
  async getEmployeeByAuthId(authUserId: string): Promise<EmployeeInformation | undefined> {
    try {
      const data = await apiRequest(`/employees/by_auth_user/?user_id=${authUserId}`);
      return this.transformEmployeeData(data);
    } catch (error) {
      console.error("Error fetching employee by auth ID:", error);
      if (error instanceof Error && error.message.includes('404')) {
        return undefined;
      }
      throw new Error("Failed to fetch employee by auth ID");
    }
  }

  // Transform employee data from API format to frontend format
  private transformEmployeeData(apiData: any): EmployeeInformation {
    return {
      id: apiData.id.toString(),
      employeeId: apiData.employee_id,
      firstName: apiData.first_name,
      middleName: apiData.middle_name || '',
      lastName: apiData.last_name,
      suffix: apiData.suffix || '',
      nickname: apiData.nickname || '',
      
      // Contact Information
      presentAddress: apiData.present_address,
      provincialAddress: apiData.provincial_address || '',
      telephoneNo: apiData.telephone_no || '',
      mobileNo: apiData.mobile_no,
      email: apiData.email,
      
      // Personal Information
      birthDate: apiData.birth_date,
      birthPlace: apiData.birth_place,
      age: apiData.age,
      gender: apiData.gender as "Male" | "Female" | "Other",
      citizenship: apiData.citizenship,
      civilStatus: apiData.civil_status as "Single" | "Married" | "Widowed" | "Separated" | "Divorced",
      
      // Additional Information
      height: apiData.height || '',
      weight: apiData.weight || '',
      ssNo: apiData.ss_no || '',
      tinNo: apiData.tin_no || '',
      philHealthNo: apiData.philhealth_no || '',
      pagIbigNo: apiData.pagibig_no || '',
      
      // Family Information
      spouseName: apiData.spouse_name || '',
      spouseOccupation: apiData.spouse_occupation || '',
      spouseCompany: apiData.spouse_company || '',
      fatherName: apiData.father_name || '',
      fatherOccupation: apiData.father_occupation || '',
      fatherCompany: apiData.father_company || '',
      motherName: apiData.mother_name || '',
      motherOccupation: apiData.mother_occupation || '',
      motherCompany: apiData.mother_company || '',
      
      // Education Information
      highestDegree: apiData.highest_degree || '',
      schoolName: apiData.school_name || '',
      courseOrProgram: apiData.course_or_program || '',
      yearGraduated: apiData.year_graduated || '',
      additionalEducation: this.transformAdditionalEducation(apiData.additional_education || []),
        // Employment Information
      dateHired: apiData.date_hired,
      positionId: apiData.position?.toString() || '',
      departmentId: apiData.department?.toString() || '',
      officeId: apiData.office?.toString() || '',
      programId: apiData.program?.toString() || '',
        // API-provided employment details
      position_title: apiData.position_title || '',
      department_name: apiData.department_name || '',
      office_name: apiData.office_name || '',
      program_name: apiData.program_name || '',
      
      // Role information from backend
      academic_role_level: apiData.academic_role_level,
      can_approve_leaves: apiData.can_approve_leaves,
      approval_scope: apiData.approval_scope,
      isHR: apiData.isHR || false,
      
      // Profile
      profileImage: apiData.profile_image || '',
    };
  }

  // Transform additional education data
  private transformAdditionalEducation(educationList: any[]): { degree: string; school: string; course: string; year: string; }[] {
    return educationList.map(edu => ({
      degree: edu.level || edu.degree || '',
      school: edu.school || '',
      course: edu.course || '',
      year: edu.year_ended || edu.year || '',
    }));
  }

  // Transform employee data from frontend format to API format
  private transformToApiFormat(employee: Omit<EmployeeInformation, 'id'>): any {
    return {
      employee_id: employee.employeeId,
      first_name: employee.firstName,
      middle_name: employee.middleName || null,
      last_name: employee.lastName,
      suffix: employee.suffix || null,
      nickname: employee.nickname || null,
      
      // Contact Information
      present_address: employee.presentAddress,
      provincial_address: employee.provincialAddress || null,      telephone_no: employee.telephoneNo || null,
      mobile_no: employee.mobileNo,
      email: employee.email,
      password: employee.password || 'sdca2025', // Default password if not provided
      
      // Personal Information
      birth_date: employee.birthDate,
      birth_place: employee.birthPlace,
      age: employee.age,
      gender: employee.gender,
      citizenship: employee.citizenship,
      civil_status: employee.civilStatus,
      
      // Additional Information
      height: employee.height || null,
      weight: employee.weight || null,
      ss_no: employee.ssNo || null,
      tin_no: employee.tinNo || null,
      philhealth_no: employee.philHealthNo || null,
      pagibig_no: employee.pagIbigNo || null,
      
      // Family Information
      spouse_name: employee.spouseName || null,
      spouse_occupation: employee.spouseOccupation || null,
      spouse_company: employee.spouseCompany || null,
      father_name: employee.fatherName || null,
      father_occupation: employee.fatherOccupation || null,
      father_company: employee.fatherCompany || null,
      mother_name: employee.motherName || null,
      mother_occupation: employee.motherOccupation || null,
      mother_company: employee.motherCompany || null,
      
      // Education Information
      highest_degree: employee.highestDegree || null,
      school_name: employee.schoolName || null,
      course_or_program: employee.courseOrProgram || null,
      year_graduated: employee.yearGraduated || null,
      additional_education: employee.additionalEducation || [],
      
      // Employment Information
      date_hired: employee.dateHired,
      position: parseInt(employee.positionId),
      department: parseInt(employee.departmentId),
      office: parseInt(employee.officeId),
      program: employee.programId ? parseInt(employee.programId) : null,
      
      // Profile
      profile_image: employee.profileImage || null,
    };
  }

  // Add new employee
  async addEmployee(employee: Omit<EmployeeInformation, 'id'>, userId: string, username: string): Promise<EmployeeInformation> {
    try {
      const apiData = this.transformToApiFormat(employee);
      const data = await apiRequest('/employees/', {
        method: 'POST',
        body: JSON.stringify(apiData),
      });
      
      // Notify listeners that employee data has changed
      this.notifyListeners();
      
      return this.transformEmployeeData(data);
    } catch (error) {
      console.error("Error adding employee:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to add employee");
    }
  }

  // Update employee
  async updateEmployee(employee: EmployeeInformation, userId: string, username: string): Promise<EmployeeInformation> {
    try {
      const { id, ...employeeData } = employee;
      const apiData = this.transformToApiFormat(employeeData);
      
      const data = await apiRequest(`/employees/${id}/`, {
        method: 'PUT',
        body: JSON.stringify(apiData),
      });
      
      // Notify listeners that employee data has changed
      this.notifyListeners();
      
      return this.transformEmployeeData(data);
    } catch (error) {
      console.error("Error updating employee:", error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error("Failed to update employee");
    }
  }

  // Delete employee
  async deleteEmployee(id: string, userId: string, username: string): Promise<boolean> {
    try {
      await apiRequest(`/employees/${id}/`, {
        method: 'DELETE',
      });
      
      // Notify listeners that employee data has changed
      this.notifyListeners();
      
      return true;
    } catch (error) {
      console.error("Error deleting employee:", error);
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
        return this.getAllEmployees();
      }

      const data = await apiRequest(`/employees/search/?q=${encodeURIComponent(searchQuery)}`);
      return (data.results || data).map((emp: any) => this.transformEmployeeData(emp));
    } catch (error) {
      console.error("Error searching employees:", error);
      throw new Error("Failed to search employees");
    }
  }

  // Filter employees by department
  async filterByDepartment(departmentId: string): Promise<EmployeeInformation[]> {
    try {
      if (!departmentId) {
        return this.getAllEmployees();
      }

      const data = await apiRequest(`/employees/by_department/?department_id=${departmentId}`);
      return (data.results || data).map((emp: any) => this.transformEmployeeData(emp));
    } catch (error) {
      console.error("Error filtering employees by department:", error);
      throw new Error("Failed to filter employees by department");
    }
  }

  // Filter employees by position
  async filterByPosition(positionId: string): Promise<EmployeeInformation[]> {
    try {
      if (!positionId) {
        return this.getAllEmployees();
      }

      const data = await apiRequest(`/employees/by_position/?position_id=${positionId}`);
      return (data.results || data).map((emp: any) => this.transformEmployeeData(emp));
    } catch (error) {
      console.error("Error filtering employees by position:", error);
      throw new Error("Failed to filter employees by position");
    }
  }

  // Get employee count
  async getEmployeeCount(): Promise<number> {
    try {
      const data = await apiRequest('/employees/count/');
      return data.total || 0;
    } catch (error) {
      console.error("Error getting employee count:", error);
      throw new Error("Failed to get employee count");
    }
  }

  // Get employees by status (active/inactive)
  async getEmployeesByStatus(isActive: boolean = true): Promise<EmployeeInformation[]> {
    try {
      const data = await apiRequest(`/employees/by_status/?is_active=${isActive}`);
      return (data.results || data).map((emp: any) => this.transformEmployeeData(emp));
    } catch (error) {
      console.error("Error getting employees by status:", error);
      // If there's an error, return all employees
      return await this.getAllEmployees();
    }
  }
}

export default new EmployeeService();
