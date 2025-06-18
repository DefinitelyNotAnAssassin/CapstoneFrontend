import { API_ENDPOINTS, getAuthHeaders } from '../config/api'

// Types for API responses
export interface Employee {
  id: string
  first_name: string
  last_name: string
  email: string
  employee_id: string
  position?: {
    id: string
    name: string
    type: string
  }
  department?: {
    id: string
    name: string
  }
  is_active: boolean
  profile_image?: string
}

export interface LeaveCredit {
  id: string
  employee: string
  leave_type: string
  year: number
  total_credits: number
  used_credits: number
  remaining_credits: number
  created_at: string
  updated_at: string
}

export interface LeavePolicy {
  id: string
  leave_type: string
  days_allowed: number
  description: string
  requires_approval: boolean
  requires_documentation: boolean
  applicable_positions: string[]
  created_at: string
  updated_at: string
}

export interface LeaveCreditPolicy {
  id: string
  leave_type: string
  accrual_frequency: "Monthly" | "Annual" | "None"
  credits_per_period: number
  max_accumulation: number
  carry_over: boolean
  carry_over_limit?: number
  applicable_position_types: ("Academic" | "Administration")[]
  is_active: boolean
}

// Get auth token from localStorage
const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken')
}

// API Service functions
export const leaveCreditService = {
  // Fetch all employees
  async fetchEmployees(): Promise<Employee[]> {
    try {
      const token = getAuthToken()
      const headers = token ? getAuthHeaders(token) : { 'Content-Type': 'application/json' }
      
      const response = await fetch(API_ENDPOINTS.employees, {
        method: 'GET',
        headers,
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch employees: ${response.statusText}`)
      }
      
      const data = await response.json()
      // Handle paginated response format
      const resultsArray = data.results || data;
      if (Array.isArray(resultsArray)) {
        return resultsArray.map((emp: any) => ({
          id: emp.id.toString(),
          first_name: emp.first_name,
          last_name: emp.last_name,
          email: emp.email,
          employee_id: emp.employee_id,
          position: emp.position,
          department: emp.department,
          is_active: emp.is_active,
          profile_image: emp.profile_image
        }))
      } else {
        console.warn('Received data is not an array:', data)
        return []
      }
    } catch (error) {
      console.error('Error fetching employees:', error)
      throw error
    }
  },

  // Fetch leave credits
  async fetchLeaveCredits(filters?: {
    employee_id?: string
    year?: number
    leave_type?: string
  }): Promise<LeaveCredit[]> {
    try {
      const token = getAuthToken()
      const headers = token ? getAuthHeaders(token) : { 'Content-Type': 'application/json' }
      
      let url = API_ENDPOINTS.leaveCredits
      const params = new URLSearchParams()
      
      if (filters) {
        if (filters.employee_id) params.append('employee_id', filters.employee_id)
        if (filters.year) params.append('year', filters.year.toString())
        if (filters.leave_type) params.append('leave_type', filters.leave_type)
      }
      
  
      const response = await fetch(url, {
        method: 'GET',
        headers,
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch leave credits: ${response.statusText}`)
      }
      
      const data = await response.json()
      
      // Handle paginated response format
      const resultsArray = data.results || data;
      
      if (Array.isArray(resultsArray)) {
        return resultsArray.map((credit: any) => ({
          id: credit.id.toString(),
          employee: credit.employee.toString(),
          leave_type: credit.leave_type,
          year: credit.year,
          total_credits: credit.total_credits,
          used_credits: credit.used_credits,
          remaining_credits: credit.remaining_credits,
          created_at: credit.created_at,
          updated_at: credit.updated_at
        }))
      } else {
        console.warn('Received data does not contain a valid results array:', data)
        return []
      }
    } catch (error) {
      console.error('Error fetching leave credits:', error)
      throw error
    }
  },

  // Fetch leave credits by employee
  async fetchLeaveCreditsByEmployee(employeeId: string, year?: number): Promise<LeaveCredit[]> {
    try {
      const token = getAuthToken()
      const headers = token ? getAuthHeaders(token) : { 'Content-Type': 'application/json' }
      let url = `${API_ENDPOINTS.leaveCredits}by_employee/?employee_id=${employeeId}`
      if (year) url += `&year=${year}`
      const response = await fetch(url, { method: 'GET', headers })
      if (!response.ok) throw new Error('Failed to fetch leave credits by employee')
      const data = await response.json()
      return Array.isArray(data) ? data : []
    } catch (error) {
      console.error('Error fetching leave credits by employee:', error)
      return []
    }
  },

  // Fetch leave policies
  async fetchLeavePolicies(): Promise<LeavePolicy[]> {
    try {
      const token = getAuthToken()
      const headers = token ? getAuthHeaders(token) : { 'Content-Type': 'application/json' }
      
      const response = await fetch(API_ENDPOINTS.leavePolicies, {
        method: 'GET',
        headers,
      })
      
      if (!response.ok) {
        throw new Error(`Failed to fetch leave policies: ${response.statusText}`)
      }
      
      const data = await response.json()
      return data
    } catch (error) {
      console.error('Error fetching leave policies:', error)
      throw error
    }
  },

  // Create leave credit
  async createLeaveCredit(creditData: {
    employee: string
    leave_type: string
    year: number
    total_credits: number
    used_credits?: number
  }): Promise<LeaveCredit> {
    try {
      const token = getAuthToken()
      if (!token) {
        throw new Error('Authentication required')
      }
      
      const response = await fetch(API_ENDPOINTS.leaveCredits, {
        method: 'POST',
        headers: getAuthHeaders(token),
        body: JSON.stringify(creditData)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Failed to create leave credit: ${JSON.stringify(errorData)}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error creating leave credit:', error)
      throw error
    }
  },

  // Update leave credit
  async updateLeaveCredit(id: string, creditData: Partial<LeaveCredit>): Promise<LeaveCredit> {
    try {
      const token = getAuthToken()
      if (!token) {
        throw new Error('Authentication required')
      }
      
      const response = await fetch(`${API_ENDPOINTS.leaveCredits}${id}/`, {
        method: 'PATCH',
        headers: getAuthHeaders(token),
        body: JSON.stringify(creditData)
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`Failed to update leave credit: ${JSON.stringify(errorData)}`)
      }
      
      return await response.json()
    } catch (error) {
      console.error('Error updating leave credit:', error)
      throw error
    }
  },

  // Delete leave credit
  async deleteLeaveCredit(id: string): Promise<void> {
    try {
      const token = getAuthToken()
      if (!token) {
        throw new Error('Authentication required')
      }
      
      const response = await fetch(`${API_ENDPOINTS.leaveCredits}${id}/`, {
        method: 'DELETE',
        headers: getAuthHeaders(token)
      })
      
      if (!response.ok) {
        throw new Error(`Failed to delete leave credit: ${response.statusText}`)
      }
    } catch (error) {
      console.error('Error deleting leave credit:', error)
      throw error
    }
  }
}
