// AuthService.ts - Django API-based authentication service

const API_BASE_URL = 'https://dharklike.pythonanywhere.com/api/auth';

export interface AuthUser {
  uid: string;
  email: string;
  displayName: string;
  emailVerified: boolean;
  isAnonymous: boolean;
  providerId: string;
  isAuthenticated: boolean;
  authTimestamp: number;
}

export interface LoginResponse {
  success: boolean;
  token: string;
  employee: {
    id: string;
    employee_id: string;
    first_name: string;
    middle_name?: string;
    last_name: string;
    full_name: string;
    email: string;
    position_title: string;
    department_name: string;
    office_name: string;
    profile_image?: string;
    is_active: boolean;
  };
  user: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    is_staff: boolean;
    is_superuser: boolean;
  };
  message: string;
}

class AuthService {
  private currentUser: AuthUser | null = null;
  private authToken: string | null = null;

  constructor() {
    // Load stored authentication data on service initialization
    this.loadStoredAuth();
  }

  private loadStoredAuth(): void {
    try {
      // Check for stored token and user data
      const storedToken = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('authUser');
      
      if (storedToken && storedUser) {
        this.authToken = storedToken;
        this.currentUser = JSON.parse(storedUser);
      }
      
      // Also check for demo admin user
      const demoUser = localStorage.getItem('demoAdminUser');
      if (demoUser && !this.currentUser) {
        this.currentUser = JSON.parse(demoUser);
      }
    } catch (error) {
      console.error('Error loading stored auth:', error);
      this.clearStoredAuth();
    }
  }

  private saveAuthData(token: string, user: AuthUser): void {
    localStorage.setItem('authToken', token);
    localStorage.setItem('authUser', JSON.stringify(user));
    this.authToken = token;
    this.currentUser = user;
  }
  private clearStoredAuth(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    localStorage.removeItem('demoAdminUser');
    localStorage.removeItem('employeeData'); // Clear employee data as well
    this.authToken = null;
    this.currentUser = null;
  }

  async signIn(email: string, password: string): Promise<AuthUser> {
    try {
      // Handle demo admin credentials
      if (email === 'admin@demo.com' && password === 'password') {
        return this.handleDemoLogin();
      }

      const response = await fetch(`${API_BASE_URL}/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Login failed');
      }

      const data: LoginResponse = await response.json();

      if (data.success) {
        // Convert API response to AuthUser format
        const authUser: AuthUser = {
          uid: data.employee.id,
          email: data.employee.email,
          displayName: data.employee.full_name,
          emailVerified: true,
          isAnonymous: false,
          providerId: 'django-api',
          isAuthenticated: true,
          authTimestamp: Date.now(),
        };        // Save authentication data and employee data
        this.saveAuthData(data.token, authUser);
        
        // Store employee data for role determination
        localStorage.setItem('employeeData', JSON.stringify(data.employee));

        return authUser;
      } else {
        throw new Error(data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }

  private async handleDemoLogin(): Promise<AuthUser> {
    try {
      // Use demo login endpoint
      const response = await fetch(`${API_BASE_URL}/demo-login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email: 'admin@demo.com', 
          password: 'password' 
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        const demoUser: AuthUser = {
          uid: 'demo-admin-user-id',
          email: 'admin@demo.com',
          displayName: 'Admin User',
          emailVerified: true,
          isAnonymous: false,
          providerId: 'demo',
          isAuthenticated: true,
          authTimestamp: Date.now(),
        };        // Save demo authentication data and employee data
        this.saveAuthData(data.token, demoUser);
        localStorage.setItem('demoAdminUser', JSON.stringify(demoUser));
        
        // Store demo employee data with role information
        const demoEmployeeData = {
          id: 'demo-admin-user-id',
          employee_id: 'DEMO001',
          first_name: 'Demo',
          last_name: 'Administrator',
          full_name: 'Demo Administrator',
          email: 'admin@demo.com',
          position_title: 'Vice President for Academic Affairs',
          department_name: 'Administration',
          office_name: 'VPAA Office',
          program_name: null,
          academic_role_level: 0,
          can_approve_leaves: true,
          approval_scope: 'all',
          is_active: true,
          departmentId: '1',
          programId: null,
          positionId: '1',
          officeId: '1'
        };
        localStorage.setItem('employeeData', JSON.stringify(demoEmployeeData));

        return demoUser;
      }
    } catch (error) {
      console.warn('Demo login API failed, using fallback:', error);
    }

    // Fallback demo login
    const demoUser: AuthUser = {
      uid: 'demo-admin-user-id',
      email: 'admin@demo.com',
      displayName: 'Admin User',
      emailVerified: true,
      isAnonymous: false,
      providerId: 'demo',
      isAuthenticated: true,
      authTimestamp: Date.now(),
    };    this.saveAuthData('demo-token', demoUser);
    localStorage.setItem('demoAdminUser', JSON.stringify(demoUser));
    
    // Store demo employee data for role determination
    const demoEmployeeData = {
      id: 'demo-admin-user-id',
      employee_id: 'DEMO001',
      first_name: 'Demo',
      last_name: 'Administrator', 
      full_name: 'Demo Administrator',
      email: 'admin@demo.com',
      position_title: 'Vice President for Academic Affairs',
      department_name: 'Administration',
      office_name: 'VPAA Office',
      program_name: null,
      academic_role_level: 0,
      can_approve_leaves: true,
      approval_scope: 'all',
      is_active: true,
      departmentId: '1',
      programId: null,
      positionId: '1',
      officeId: '1'
    };
    localStorage.setItem('employeeData', JSON.stringify(demoEmployeeData));

    return demoUser;
  }

  async signOut(): Promise<void> {
    try {
      // Call logout endpoint if we have a token
      if (this.authToken) {
        await fetch(`${API_BASE_URL}/logout/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.authToken}`,
          },
          body: JSON.stringify({ token: this.authToken }),
        });
      }
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Always clear local storage
      this.clearStoredAuth();
      
      // Dispatch custom event to notify AuthContext of logout
      window.dispatchEvent(new CustomEvent('auth-state-changed'));
    }
  }

  getCurrentUser(): AuthUser | null {
    return this.currentUser;
  }

  getAuthToken(): string | null {
    return this.authToken;
  }

  isAuthenticated(): boolean {
    return this.currentUser !== null && this.currentUser.isAuthenticated;
  }

  // Hook-like method for compatibility with components that expect useAuth
  useAuth() {
    return {
      currentUser: this.currentUser,
      loading: false, // Since we're using localStorage, loading is always false
      isAuthenticated: this.isAuthenticated()
    };
  }
}

// Export singleton instance
const authService = new AuthService();
export default authService;
