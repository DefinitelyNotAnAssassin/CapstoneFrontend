import { type Organization, type Department, type Program, type Office, type Position } from "../data/data";

// API configuration
const API_BASE_URL = 'http://127.0.0.1:8000/api';

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

class OrganizationService {
  // Organizations
  async getAllOrganizations(): Promise<Organization[]> {
    try {
      const data = await apiRequest('/organizations/');
      return (data.results || data).map((org: any) => ({
        id: org.id.toString(),
        name: org.name,
        description: org.description || '',
        logoUrl: org.logo_url || '',
      }));
    } catch (error) {
      console.error("Error fetching organizations:", error);
      throw new Error("Failed to fetch organizations");
    }
  }

  async createOrganization(organization: Omit<Organization, 'id'>): Promise<Organization> {
    try {
      const data = await apiRequest('/organizations/', {
        method: 'POST',
        body: JSON.stringify({
          name: organization.name,
          description: organization.description || null,
          logo_url: organization.logoUrl || null,
        }),
      });
      
      return {
        id: data.id.toString(),
        name: data.name,
        description: data.description || '',
        logoUrl: data.logo_url || '',
      };
    } catch (error) {
      console.error("Error creating organization:", error);
      throw new Error("Failed to create organization");
    }
  }

  // Departments
  async getAllDepartments(): Promise<Department[]> {
    try {
      const data = await apiRequest('/departments/');
      return (data.results || data).map((dept: any) => ({
        id: dept.id.toString(),
        name: dept.name,
        organizationId: dept.organization.toString(),
        description: dept.description || '',
        headId: dept.head?.toString() || '',
      }));
    } catch (error) {
      console.error("Error fetching departments:", error);
      throw new Error("Failed to fetch departments");
    }
  }

  async getDepartmentsByOrganization(organizationId: string): Promise<Department[]> {
    try {
      const data = await apiRequest(`/departments/by_organization/?organization_id=${organizationId}`);
      return (data.results || data).map((dept: any) => ({
        id: dept.id.toString(),
        name: dept.name,
        organizationId: dept.organization.toString(),
        description: dept.description || '',
        headId: dept.head?.toString() || '',
      }));
    } catch (error) {
      console.error("Error fetching departments by organization:", error);
      throw new Error("Failed to fetch departments by organization");
    }
  }

  async createDepartment(department: Omit<Department, 'id'>): Promise<Department> {
    try {
      const data = await apiRequest('/departments/', {
        method: 'POST',
        body: JSON.stringify({
          name: department.name,
          organization: parseInt(department.organizationId),
          description: department.description || null,
          head: department.headId ? parseInt(department.headId) : null,
        }),
      });
      
      return {
        id: data.id.toString(),
        name: data.name,
        organizationId: data.organization.toString(),
        description: data.description || '',
        headId: data.head?.toString() || '',
      };
    } catch (error) {
      console.error("Error creating department:", error);
      throw new Error("Failed to create department");
    }
  }

  // Programs
  async getAllPrograms(): Promise<Program[]> {
    try {
      const data = await apiRequest('/programs/');
      return (data.results || data).map((prog: any) => ({
        id: prog.id.toString(),
        name: prog.name,
        departmentId: prog.department.toString(),
        description: prog.description || '',
        chairId: prog.chair?.toString() || '',
      }));
    } catch (error) {
      console.error("Error fetching programs:", error);
      throw new Error("Failed to fetch programs");
    }
  }

  async getProgramsByDepartment(departmentId: string): Promise<Program[]> {
    try {
      const data = await apiRequest(`/programs/by_department/?department_id=${departmentId}`);
      return (data.results || data).map((prog: any) => ({
        id: prog.id.toString(),
        name: prog.name,
        departmentId: prog.department.toString(),
        description: prog.description || '',
        chairId: prog.chair?.toString() || '',
      }));
    } catch (error) {
      console.error("Error fetching programs by department:", error);
      throw new Error("Failed to fetch programs by department");
    }
  }

  async createProgram(program: Omit<Program, 'id'>): Promise<Program> {
    try {
      const data = await apiRequest('/programs/', {
        method: 'POST',
        body: JSON.stringify({
          name: program.name,
          department: parseInt(program.departmentId),
          description: program.description || null,
          chair: program.chairId ? parseInt(program.chairId) : null,
        }),
      });
      
      return {
        id: data.id.toString(),
        name: data.name,
        departmentId: data.department.toString(),
        description: data.description || '',
        chairId: data.chair?.toString() || '',
      };
    } catch (error) {
      console.error("Error creating program:", error);
      throw new Error("Failed to create program");
    }
  }

  // Offices
  async getAllOffices(): Promise<Office[]> {
    try {
      const data = await apiRequest('/offices/');
      return (data.results || data).map((office: any) => ({
        id: office.id.toString(),
        name: office.name,
        departmentId: office.department.toString(),
        location: office.location,
        extension: office.extension || '',
      }));
    } catch (error) {
      console.error("Error fetching offices:", error);
      throw new Error("Failed to fetch offices");
    }
  }

  async getOfficesByDepartment(departmentId: string): Promise<Office[]> {
    try {
      const data = await apiRequest(`/offices/by_department/?department_id=${departmentId}`);
      return (data.results || data).map((office: any) => ({
        id: office.id.toString(),
        name: office.name,
        departmentId: office.department.toString(),
        location: office.location,
        extension: office.extension || '',
      }));
    } catch (error) {
      console.error("Error fetching offices by department:", error);
      throw new Error("Failed to fetch offices by department");
    }
  }

  async createOffice(office: Omit<Office, 'id'>): Promise<Office> {
    try {
      const data = await apiRequest('/offices/', {
        method: 'POST',
        body: JSON.stringify({
          name: office.name,
          department: parseInt(office.departmentId),
          location: office.location,
          extension: office.extension || null,
        }),
      });
      
      return {
        id: data.id.toString(),
        name: data.name,
        departmentId: data.department.toString(),
        location: data.location,
        extension: data.extension || '',
      };
    } catch (error) {
      console.error("Error creating office:", error);
      throw new Error("Failed to create office");
    }
  }

  // Positions
  async getAllPositions(): Promise<Position[]> {
    try {
      const data = await apiRequest('/positions/');
      return (data.results || data).map((pos: any) => ({
        id: pos.id.toString(),
        title: pos.title,
        type: pos.type,
        rank: pos.rank,
        level: pos.level,
      }));
    } catch (error) {
      console.error("Error fetching positions:", error);
      throw new Error("Failed to fetch positions");
    }
  }

  async getPositionsByType(type: 'Academic' | 'Administration'): Promise<Position[]> {
    try {
      const data = await apiRequest(`/positions/by_type/?type=${type}`);
      return (data.results || data).map((pos: any) => ({
        id: pos.id.toString(),
        title: pos.title,
        type: pos.type,
        rank: pos.rank,
        level: pos.level,
      }));
    } catch (error) {
      console.error("Error fetching positions by type:", error);
      throw new Error("Failed to fetch positions by type");
    }
  }

  async createPosition(position: Omit<Position, 'id'>): Promise<Position> {
    try {
      const data = await apiRequest('/positions/', {
        method: 'POST',
        body: JSON.stringify({
          title: position.title,
          type: position.type,
          rank: position.rank,
          level: position.level,
        }),
      });
      
      return {
        id: data.id.toString(),
        title: data.title,
        type: data.type,
        rank: data.rank,
        level: data.level,
      };
    } catch (error) {
      console.error("Error creating position:", error);
      throw new Error("Failed to create position");
    }
  }
}

export default new OrganizationService();
