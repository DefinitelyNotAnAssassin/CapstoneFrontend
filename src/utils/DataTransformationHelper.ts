import { type EmployeeInformation } from "../data/data";

/**
 * Utility class to help test and validate the API data transformations
 * This helps ensure the frontend data models are compatible with the API
 */
export class DataTransformationHelper {
  
  /**
   * Creates a sample employee object for testing
   */
  static createSampleEmployee(): Omit<EmployeeInformation, 'id'> {
    return {
      employeeId: "EMP001",
      firstName: "John",
      middleName: "Michael",
      lastName: "Doe",
      suffix: "Jr.",
      nickname: "Johnny",
      
      // Contact Information
      presentAddress: "123 Main Street, Quezon City",
      provincialAddress: "456 Provincial Road, Laguna",
      telephoneNo: "02-123-4567",
      mobileNo: "09123456789",
      email: "john.doe@sdca.edu.ph",
      password: "password123", // Only used during creation
      
      // Personal Information
      birthDate: "1990-01-15",
      birthPlace: "Manila, Philippines",
      age: 34,
      gender: "Male",
      citizenship: "Filipino",
      civilStatus: "Married",
      
      // Additional Information
      height: "5'8\"",
      weight: "70kg",
      ssNo: "12-3456789-0",
      tinNo: "123-456-789-000",
      philHealthNo: "12-345678901-2",
      pagIbigNo: "1234-5678-9012",
      
      // Family Information
      spouseName: "Jane Doe",
      spouseOccupation: "Teacher",
      spouseCompany: "ABC Elementary School",
      fatherName: "Robert Doe",
      fatherOccupation: "Engineer",
      fatherCompany: "XYZ Corporation",
      motherName: "Mary Doe",
      motherOccupation: "Nurse",
      motherCompany: "City Hospital",
      
      // Education Information
      highestDegree: "Master of Science in Computer Science",
      schoolName: "University of the Philippines",
      courseOrProgram: "Computer Science",
      yearGraduated: "2012",
      additionalEducation: [
        {
          degree: "Bachelor of Science",
          school: "De La Salle University",
          course: "Computer Science",
          year: "2010"
        },
        {
          degree: "Certificate",
          school: "Coursera",
          course: "Machine Learning",
          year: "2020"
        }
      ],
      
      // Employment Information
      dateHired: "2024-01-15",
      positionId: "3", // Program Chair
      departmentId: "1", // College of Computer Studies
      officeId: "1", // CCS Faculty Office
      programId: "1", // BS Computer Science
      
      // Profile
      profileImage: "https://randomuser.me/api/portraits/men/1.jpg"
    };
  }

  /**
   * Validates that all required fields for employee creation are present
   */
  static validateEmployeeData(employee: Omit<EmployeeInformation, 'id'>): string[] {
    const errors: string[] = [];
    
    // Required basic information
    if (!employee.employeeId) errors.push("Employee ID is required");
    if (!employee.firstName) errors.push("First name is required");
    if (!employee.lastName) errors.push("Last name is required");
    if (!employee.email) errors.push("Email is required");
    if (!employee.presentAddress) errors.push("Present address is required");
    if (!employee.mobileNo) errors.push("Mobile number is required");
    
    // Required personal information
    if (!employee.birthDate) errors.push("Birth date is required");
    if (!employee.birthPlace) errors.push("Birth place is required");
    if (!employee.age || employee.age <= 0) errors.push("Valid age is required");
    if (!employee.gender) errors.push("Gender is required");
    if (!employee.citizenship) errors.push("Citizenship is required");
    if (!employee.civilStatus) errors.push("Civil status is required");
    
    // Required employment information
    if (!employee.dateHired) errors.push("Date hired is required");
    if (!employee.positionId) errors.push("Position is required");
    if (!employee.departmentId) errors.push("Department is required");
    if (!employee.officeId) errors.push("Office is required");
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (employee.email && !emailRegex.test(employee.email)) {
      errors.push("Invalid email format");
    }
    
    // Validate mobile number format (Philippine format)
    const mobileRegex = /^(09|\+639)\d{9}$/;
    if (employee.mobileNo && !mobileRegex.test(employee.mobileNo.replace(/[-\s]/g, ''))) {
      errors.push("Invalid mobile number format");
    }
    
    return errors;
  }

  /**
   * Converts frontend date format to API format if needed
   */
  static formatDateForAPI(dateString: string): string {
    if (!dateString) return dateString;
    
    // If it's already in ISO format (YYYY-MM-DD), return as is
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }
    
    // Try to parse and convert
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid date format: ${dateString}`);
    }
    
    return date.toISOString().split('T')[0];
  }

  /**
   * Logs the differences between expected and actual API transformations
   */
  static logTransformationDifferences(original: any, transformed: any): void {
    console.group("Data Transformation Comparison");
    
    const originalKeys = Object.keys(original);
    const transformedKeys = Object.keys(transformed);
    
    // Check for missing keys
    const missingInTransformed = originalKeys.filter(key => !(key in transformed));
    if (missingInTransformed.length > 0) {
      console.warn("Missing in transformed data:", missingInTransformed);
    }
    
    // Check for extra keys
    const extraInTransformed = transformedKeys.filter(key => !(key in original));
    if (extraInTransformed.length > 0) {
      console.info("Extra in transformed data:", extraInTransformed);
    }
    
    // Check for different values
    originalKeys.forEach(key => {
      if (key in transformed && original[key] !== transformed[key]) {
        console.log(`${key}: "${original[key]}" -> "${transformed[key]}"`);
      }
    });
    
    console.groupEnd();
  }

  /**
   * Test API endpoint availability
   */
  static async testAPIEndpoints(): Promise<{ [endpoint: string]: boolean }> {
    const endpoints = [
      '/api/organizations/',
      '/api/departments/',
      '/api/programs/',
      '/api/offices/',
      '/api/positions/',
      '/api/employees/',
      '/api/leave-policies/',
      '/api/leave-requests/',
    ];
    
    const results: { [endpoint: string]: boolean } = {};
    
    for (const endpoint of endpoints) {
      try {
        const response = await fetch(`http://127.0.0.1:8000${endpoint}`);
        results[endpoint] = response.ok;
      } catch (error) {
        results[endpoint] = false;
      }
    }
    
    return results;
  }

  /**
   * Print a formatted summary of API test results
   */
  static printAPITestResults(results: { [endpoint: string]: boolean }): void {
    console.group("API Endpoint Test Results");
    
    Object.entries(results).forEach(([endpoint, isWorking]) => {
      const status = isWorking ? "✅ Working" : "❌ Failed";
      console.log(`${endpoint}: ${status}`);
    });
    
    const workingCount = Object.values(results).filter(Boolean).length;
    const totalCount = Object.keys(results).length;
    console.log(`\nSummary: ${workingCount}/${totalCount} endpoints working`);
    
    console.groupEnd();
  }
}

export default DataTransformationHelper;
