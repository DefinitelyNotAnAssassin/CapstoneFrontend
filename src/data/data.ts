// Employee Data Models

export interface EmployeeInformation {
  id: string
  employeeId: string
  firstName: string
  middleName?: string
  lastName: string
  suffix?: string
  nickname?: string

  // Contact Information
  presentAddress: string
  provincialAddress?: string
  telephoneNo?: string
  mobileNo: string
  email: string
  
  // Authentication (only used during creation, never stored directly)
  password?: string // Temporary field for password during account creation
  authUserId?: string // Firebase Auth user ID for linking the employee to authentication

  // Personal Information
  birthDate: string
  birthPlace: string
  age: number
  gender: "Male" | "Female" | "Other"
  citizenship: string
  civilStatus: "Single" | "Married" | "Widowed" | "Separated" | "Divorced"

  // Additional Information
  height?: string
  weight?: string
  ssNo?: string
  tinNo?: string
  philHealthNo?: string
  pagIbigNo?: string

  // Family Information
  spouseName?: string
  spouseOccupation?: string
  spouseCompany?: string

  fatherName?: string
  fatherOccupation?: string
  fatherCompany?: string

  motherName?: string
  motherOccupation?: string
  motherCompany?: string
  
  // Education Information
  highestDegree?: string
  schoolName?: string
  courseOrProgram?: string
  yearGraduated?: string
  additionalEducation?: {
    degree: string;
    school: string;
    course: string;
    year: string;
  }[];
  // Employment Information
  dateHired: string
  positionId: string
  departmentId: string
  officeId: string
  programId?: string // Added programId for academic employees  // API-provided employment details (from backend)
  position_title?: string // Position title from API
  department_name?: string // Department name from API
  office_name?: string // Office name from API
  program_name?: string // Program name from API
    // Role information from backend
  academic_role_level?: number // Role level from backend (0=VPAA, 1=Dean, 2=PC, etc.)
  can_approve_leaves?: boolean // Whether this employee can approve leaves
  approval_scope?: string // Scope of approval (all, department, program, none)
  is_hr?: boolean // Whether this employee is from HR department

  // Leave Package (used during creation)
  leavePackageId?: number | null
  customLeaveItems?: { leave_type: string; quantity: number }[]

  // Profile
  profileImage?: string
}

export interface Sibling {
  id: string
  employeeId: string
  name: string
  occupation?: string
  company?: string
}

export interface Dependent {
  id: string
  employeeId: string
  name: string
  occupation?: string
  company?: string
  relationship: string
}

export interface Education {
  id: string
  employeeId: string
  level: "Elementary" | "Secondary" | "Vocational" | "Bachelor" | "Master" | "Doctorate" | "Other"
  school: string
  course?: string
  yearStarted: string
  yearEnded: string
  graduated: boolean
}

export interface Award {
  id: string
  employeeId: string
  name: string
  awardingBody: string
  dateAwarded: string
}

export interface License {
  id: string
  employeeId: string
  name: string
  rating?: string
  dateTaken: string
  licenseNo?: string
  issuedDate?: string
  expirationDate?: string
}

export interface Schedule {
  id: string
  employeeId: string
  dayOfWeek: "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday"
  startTime: string
  endTime: string
  isFlexible: boolean
}

export type PositionType = "Academic" | "Administration"

export type AcademicRank = "VPAA" | "DEAN" | "PC" | "RF" | "PTF" | "SEC"
export type AdministrationRank = "VP" | "DIRECTOR" | "OFFICER" | "HEAD" | "STAFF" | "SEC"

export interface Position {
  id: string
  title: string
  type: PositionType
  rank: AcademicRank | AdministrationRank
  level: number // Numerical representation of hierarchy level
}

export interface Organization {
  id: string
  name: string
  description?: string
  logoUrl?: string
}

export interface Department {
  id: string
  name: string
  organizationId: string
  description?: string
  headId?: string // Reference to employee who heads the department
}

// Added Program interface for academic departments
export interface Program {
  id: string
  name: string
  departmentId: string
  description?: string
  chairId?: string // Reference to employee who chairs the program
}

export interface Office {
  id: string
  name: string
  departmentId: string
  location: string
  extension?: string
}


export type LeaveType =
  | "Vacation Leave"
  | "Sick Leave"
  | "Birthday Leave"
  | "Solo Parent Leave"
  | "Bereavement Leave"
  | "Paternity Leave"
  | "Maternity Leave"

export interface LeavePolicy {
  id: string
  leaveType: LeaveType
  daysAllowed: number
  description: string
  requiresApproval: boolean
  requiresDocumentation: boolean
  applicablePositions: PositionType[]
}

export interface LeaveRequest {
  id: string
  employeeId: string
  leaveType: LeaveType
  startDate: string
  endDate: string
  reason: string
  status: "Pending" | "Approved" | "Rejected" | "Cancelled"
  dateRequested: string
  dateReviewed?: string
  reviewedBy?: string
  attachments?: string[]
  comments?: string
}

export interface LeaveBalance {
  id: string
  employeeId: string
  leaveType: LeaveType
  year: number
  totalDays: number
  usedDays: number
  pendingDays: number
  remainingDays: number
}

// Sample data for testing
export const leavePolicies: LeavePolicy[] = [
  {
    id: "1",
    leaveType: "Vacation Leave",
    daysAllowed: 15,
    description: "Annual vacation leave for personal time off",
    requiresApproval: true,
    requiresDocumentation: false,
    applicablePositions: ["Academic", "Administration"],
  },
  {
    id: "2",
    leaveType: "Sick Leave",
    daysAllowed: 15,
    description: "Leave for medical reasons",
    requiresApproval: true,
    requiresDocumentation: true,
    applicablePositions: ["Academic", "Administration"],
  },
  {
    id: "3",
    leaveType: "Birthday Leave",
    daysAllowed: 1,
    description: "Leave on or near employee's birthday",
    requiresApproval: true,
    requiresDocumentation: false,
    applicablePositions: ["Academic", "Administration"],
  },
  {
    id: "4",
    leaveType: "Solo Parent Leave",
    daysAllowed: 7,
    description: "Additional leave for solo parents",
    requiresApproval: true,
    requiresDocumentation: true,
    applicablePositions: ["Academic", "Administration"],
  },
  {
    id: "5",
    leaveType: "Bereavement Leave",
    daysAllowed: 5,
    description: "Leave for the death of an immediate family member",
    requiresApproval: true,
    requiresDocumentation: true,
    applicablePositions: ["Academic", "Administration"],
  },
  {
    id: "6",
    leaveType: "Paternity Leave",
    daysAllowed: 7,
    description: "Leave for new fathers",
    requiresApproval: true,
    requiresDocumentation: true,
    applicablePositions: ["Academic", "Administration"],
  },
  {
    id: "7",
    leaveType: "Maternity Leave",
    daysAllowed: 105,
    description: "Leave for new mothers",
    requiresApproval: true,
    requiresDocumentation: true,
    applicablePositions: ["Academic", "Administration"],
  },
]

// Sample organizations
export const organizations: Organization[] = [
  {
    id: "1",
    name: "University of Excellence",
    description: "A premier educational institution",
    logoUrl: "https://randomuser.me/api/portraits/lego/1.jpg",
  },
]

// Sample departments
export const departments: Department[] = [
  {
    id: "1",
    name: "College of Computer Studies",
    organizationId: "1",
    description: "Department of Computer Science and Information Technology",
    headId: "3", // Dean
  },
  {
    id: "2",
    name: "College of Business",
    organizationId: "1",
    description: "Department of Business and Management",
    headId: "8", // Dean
  },
  {
    id: "3",
    name: "Administration Department",
    organizationId: "1",
    description: "Main administrative department",
    headId: "10", // VP
  },
  {
    id: "4",
    name: "Human Resources",
    organizationId: "1",
    description: "Human Resources Department",
    headId: "11", // Director
  },
  {
    id: "5",
    name: "Finance Department",
    organizationId: "1",
    description: "Finance and Accounting Department",
    headId: "12", // Director
  },
]

// Sample programs
export const programs: Program[] = [
  {
    id: "1",
    name: "Computer Science",
    departmentId: "1",
    description: "Bachelor of Science in Computer Science",
    chairId: "4", // Program Chair
  },
  {
    id: "2",
    name: "Information Technology",
    departmentId: "1",
    description: "Bachelor of Science in Information Technology",
    chairId: "5", // Program Chair
  },
  {
    id: "3",
    name: "Business Administration",
    departmentId: "2",
    description: "Bachelor of Science in Business Administration",
    chairId: "9", // Program Chair
  },
]

// Sample offices
export const offices: Office[] = [
  {
    id: "1",
    name: "Dean's Office - CCS",
    departmentId: "1",
    location: "Building A, Room 101",
    extension: "101",
  },
  {
    id: "2",
    name: "Faculty Room - CCS",
    departmentId: "1",
    location: "Building A, Room 201",
    extension: "201",
  },
  {
    id: "3",
    name: "Dean's Office - Business",
    departmentId: "2",
    location: "Building B, Room 101",
    extension: "301",
  },
  {
    id: "4",
    name: "President's Office",
    departmentId: "3",
    location: "Admin Building, Room 101",
    extension: "401",
  },
  {
    id: "5",
    name: "HR Office",
    departmentId: "4",
    location: "Admin Building, Room 201",
    extension: "501",
  },
  {
    id: "6",
    name: "Finance Office",
    departmentId: "5",
    location: "Admin Building, Room 301",
    extension: "601",
  },
]

// Sample positions
export const positions: Position[] = [
  {
    id: "1",
    title: "Vice President for Academic Affairs",
    type: "Academic",
    rank: "VPAA",
    level: 1,
  },
  {
    id: "2",
    title: "Dean",
    type: "Academic",
    rank: "DEAN",
    level: 2,
  },
  {
    id: "3",
    title: "Program Chair",
    type: "Academic",
    rank: "PC",
    level: 3,
  },
  {
    id: "4",
    title: "Regular Faculty",
    type: "Academic",
    rank: "RF",
    level: 4,
  },
  {
    id: "5",
    title: "Part-Time Faculty",
    type: "Academic",
    rank: "PTF",
    level: 5,
  },
  {
    id: "6",
    title: "Secretary - Academic",
    type: "Academic",
    rank: "SEC",
    level: 6,
  },
  {
    id: "7",
    title: "Vice President",
    type: "Administration",
    rank: "VP",
    level: 1,
  },
  {
    id: "8",
    title: "Director",
    type: "Administration",
    rank: "DIRECTOR",
    level: 2,
  },
  {
    id: "9",
    title: "Officer",
    type: "Administration",
    rank: "OFFICER",
    level: 3,
  },
  {
    id: "10",
    title: "Head",
    type: "Administration",
    rank: "HEAD",
    level: 4,
  },
  {
    id: "11",
    title: "Staff",
    type: "Administration",
    rank: "STAFF",
    level: 5,
  },
  {
    id: "12",
    title: "Secretary - Admin",
    type: "Administration",
    rank: "SEC",
    level: 6,
  },
]

// Sample employees with expanded data
export const employees: EmployeeInformation[] = [
  // Academic - VPAA
  {
    id: "1",
    employeeId: "EMP001",
    firstName: "Robert",
    middleName: "James",
    lastName: "Williams",
    suffix: "PhD",
    nickname: "Rob",

    presentAddress: "123 University Ave, Quezon City, Metro Manila",
    provincialAddress: "456 Provincial Rd, Batangas City, Batangas",
    telephoneNo: "(02) 8123-4567",
    mobileNo: "+63 917 123 4567",
    email: "robert.williams@university.edu",

    birthDate: "1970-05-15",
    birthPlace: "Manila City",
    age: 53,
    gender: "Male",
    citizenship: "Filipino",
    civilStatus: "Married",

    height: "180 cm",
    weight: "75 kg",
    ssNo: "11-1111111-1",
    tinNo: "111-111-111-000",
    philHealthNo: "11-111111111-1",
    pagIbigNo: "1111-1111-1111",

    spouseName: "Elizabeth Williams",
    spouseOccupation: "Professor",
    spouseCompany: "State University",

    fatherName: "George Williams",
    fatherOccupation: "Retired Professor",
    fatherCompany: "N/A",

    motherName: "Mary Williams",
    motherOccupation: "Retired Teacher",
    motherCompany: "N/A",

    dateHired: "2000-01-15",
    positionId: "1", // VPAA
    departmentId: "1",
    officeId: "1",

    profileImage: "https://randomuser.me/api/portraits/men/1.jpg",
  },

  // Academic - Dean of Computer Studies
  {
    id: "3",
    employeeId: "EMP003",
    firstName: "Michael",
    middleName: "Thomas",
    lastName: "Brown",
    suffix: "PhD",

    presentAddress: "789 College St, Makati City, Metro Manila",
    mobileNo: "+63 917 333 3333",
    email: "michael.brown@university.edu",

    birthDate: "1975-08-22",
    birthPlace: "Cebu City",
    age: 48,
    gender: "Male",
    citizenship: "Filipino",
    civilStatus: "Married",

    ssNo: "33-3333333-3",
    tinNo: "333-333-333-000",

    dateHired: "2005-06-15",
    positionId: "2", // Dean
    departmentId: "1", // College of Computer Studies
    officeId: "1", // Dean's Office - CCS

    profileImage: "https://randomuser.me/api/portraits/men/3.jpg",
  },

  // Academic - Dean of Business
  {
    id: "8",
    employeeId: "EMP008",
    firstName: "Patricia",
    middleName: "Anne",
    lastName: "Garcia",
    suffix: "PhD",

    presentAddress: "123 Business Ave, Taguig City, Metro Manila",
    mobileNo: "+63 917 888 8888",
    email: "patricia.garcia@university.edu",

    birthDate: "1973-04-12",
    birthPlace: "Manila City",
    age: 50,
    gender: "Female",
    citizenship: "Filipino",
    civilStatus: "Married",

    ssNo: "88-8888888-8",
    tinNo: "888-888-888-000",

    dateHired: "2006-08-01",
    positionId: "2", // Dean
    departmentId: "2", // College of Business
    officeId: "3", // Dean's Office - Business

    profileImage: "https://randomuser.me/api/portraits/women/8.jpg",
  },

  // Academic - Program Chair of Computer Science
  {
    id: "4",
    employeeId: "EMP004",
    firstName: "Jennifer",
    middleName: "Lynn",
    lastName: "Davis",
    suffix: "MS",

    presentAddress: "456 Tech St, Pasig City, Metro Manila",
    mobileNo: "+63 917 444 4444",
    email: "jennifer.davis@university.edu",

    birthDate: "1980-11-05",
    birthPlace: "Davao City",
    age: 43,
    gender: "Female",
    citizenship: "Filipino",
    civilStatus: "Single",

    ssNo: "44-4444444-4",
    tinNo: "444-444-444-000",

    dateHired: "2010-08-15",
    positionId: "3", // Program Chair
    departmentId: "1", // College of Computer Studies
    officeId: "2", // Faculty Room - CCS
    programId: "1", // Computer Science

    profileImage: "https://randomuser.me/api/portraits/women/4.jpg",
  },

  // Academic - Program Chair of Information Technology
  {
    id: "5",
    employeeId: "EMP005",
    firstName: "David",
    middleName: "Joseph",
    lastName: "Wilson",
    suffix: "MS",

    presentAddress: "789 IT Blvd, Mandaluyong City, Metro Manila",
    mobileNo: "+63 917 555 5555",
    email: "david.wilson@university.edu",

    birthDate: "1982-03-18",
    birthPlace: "Baguio City",
    age: 41,
    gender: "Male",
    citizenship: "Filipino",
    civilStatus: "Married",

    ssNo: "55-5555555-5",
    tinNo: "555-555-555-000",

    dateHired: "2012-06-01",
    positionId: "3", // Program Chair
    departmentId: "1", // College of Computer Studies
    officeId: "2", // Faculty Room - CCS
    programId: "2", // Information Technology

    profileImage: "https://randomuser.me/api/portraits/men/5.jpg",
  },

  // Academic - Program Chair of Business Administration
  {
    id: "9",
    employeeId: "EMP009",
    firstName: "Richard",
    middleName: "Edward",
    lastName: "Martinez",
    suffix: "MBA",

    presentAddress: "456 Finance St, Makati City, Metro Manila",
    mobileNo: "+63 917 999 9999",
    email: "richard.martinez@university.edu",

    birthDate: "1978-09-28",
    birthPlace: "Iloilo City",
    age: 45,
    gender: "Male",
    citizenship: "Filipino",
    civilStatus: "Married",

    ssNo: "99-9999999-9",
    tinNo: "999-999-999-000",

    dateHired: "2008-07-15",
    positionId: "3", // Program Chair
    departmentId: "2", // College of Business
    officeId: "3", // Dean's Office - Business
    programId: "3", // Business Administration

    profileImage: "https://randomuser.me/api/portraits/men/9.jpg",
  },

  // Academic - Regular Faculty (Computer Science)
  {
    id: "6",
    employeeId: "EMP006",
    firstName: "Sarah",
    middleName: "Elizabeth",
    lastName: "Anderson",
    suffix: "MS",

    presentAddress: "123 Faculty Row, Quezon City, Metro Manila",
    mobileNo: "+63 917 666 6666",
    email: "sarah.anderson@university.edu",

    birthDate: "1985-07-22",
    birthPlace: "Manila City",
    age: 38,
    gender: "Female",
    citizenship: "Filipino",
    civilStatus: "Single",

    ssNo: "66-6666666-6",
    tinNo: "666-666-666-000",

    dateHired: "2015-08-01",
    positionId: "4", // Regular Faculty
    departmentId: "1", // College of Computer Studies
    officeId: "2", // Faculty Room - CCS
    programId: "1", // Computer Science

    profileImage: "https://randomuser.me/api/portraits/women/6.jpg",
  },

  // Academic - Part-Time Faculty (Information Technology)
  {
    id: "7",
    employeeId: "EMP007",
    firstName: "James",
    middleName: "Robert",
    lastName: "Taylor",

    presentAddress: "456 Adjunct Ave, Pasig City, Metro Manila",
    mobileNo: "+63 917 777 7777",
    email: "james.taylor@university.edu",

    birthDate: "1988-12-10",
    birthPlace: "Cebu City",
    age: 35,
    gender: "Male",
    citizenship: "Filipino",
    civilStatus: "Single",

    ssNo: "77-7777777-7",
    tinNo: "777-777-777-000",

    dateHired: "2018-01-15",
    positionId: "5", // Part-Time Faculty
    departmentId: "1", // College of Computer Studies
    officeId: "2", // Faculty Room - CCS
    programId: "2", // Information Technology

    profileImage: "https://randomuser.me/api/portraits/men/7.jpg",
  },

  // Administration - VP
  {
    id: "10",
    employeeId: "EMP010",
    firstName: "William",
    middleName: "George",
    lastName: "Thompson",
    suffix: "MBA",

    presentAddress: "789 Executive Blvd, Makati City, Metro Manila",
    mobileNo: "+63 917 101 0101",
    email: "william.thompson@university.edu",

    birthDate: "1968-02-15",
    birthPlace: "Manila City",
    age: 55,
    gender: "Male",
    citizenship: "Filipino",
    civilStatus: "Married",

    ssNo: "10-1010101-0",
    tinNo: "101-010-101-000",

    dateHired: "2002-03-01",
    positionId: "7", // VP
    departmentId: "3", // Administration Department
    officeId: "4", // President's Office

    profileImage: "https://randomuser.me/api/portraits/men/10.jpg",
  },

  // Administration - HR Director
  {
    id: "11",
    employeeId: "EMP011",
    firstName: "Linda",
    middleName: "Marie",
    lastName: "Johnson",
    suffix: "MBA",

    presentAddress: "123 HR Lane, Taguig City, Metro Manila",
    mobileNo: "+63 917 111 1112",
    email: "linda.johnson@university.edu",

    birthDate: "1975-11-30",
    birthPlace: "Bacolod City",
    age: 48,
    gender: "Female",
    citizenship: "Filipino",
    civilStatus: "Married",

    ssNo: "11-1111112-1",
    tinNo: "111-111-112-000",

    dateHired: "2005-05-15",
    positionId: "8", // Director
    departmentId: "4", // Human Resources
    officeId: "5", // HR Office

    profileImage: "https://randomuser.me/api/portraits/women/11.jpg",
  },

  // Administration - Finance Director
  {
    id: "12",
    employeeId: "EMP012",
    firstName: "Robert",
    middleName: "John",
    lastName: "Lee",
    suffix: "CPA",

    presentAddress: "456 Finance Ave, Makati City, Metro Manila",
    mobileNo: "+63 917 121 2121",
    email: "robert.lee@university.edu",

    birthDate: "1973-08-05",
    birthPlace: "Manila City",
    age: 50,
    gender: "Male",
    citizenship: "Filipino",
    civilStatus: "Married",

    ssNo: "12-1212121-2",
    tinNo: "121-212-121-000",

    dateHired: "2007-07-01",
    positionId: "8", // Director
    departmentId: "5", // Finance Department
    officeId: "6", // Finance Office

    profileImage: "https://randomuser.me/api/portraits/men/12.jpg",
  },

  // Administration - HR Officer
  {
    id: "13",
    employeeId: "EMP013",
    firstName: "Susan",
    middleName: "Elizabeth",
    lastName: "Clark",

    presentAddress: "789 HR Street, Pasig City, Metro Manila",
    mobileNo: "+63 917 131 3131",
    email: "susan.clark@university.edu",

    birthDate: "1985-04-12",
    birthPlace: "Quezon City",
    age: 38,
    gender: "Female",
    citizenship: "Filipino",
    civilStatus: "Single",

    ssNo: "13-1313131-3",
    tinNo: "131-313-131-000",

    dateHired: "2012-09-01",
    positionId: "9", // Officer
    departmentId: "4", // Human Resources
    officeId: "5", // HR Office

    profileImage: "https://randomuser.me/api/portraits/women/13.jpg",
  },

  // Administration - Finance Staff
  {
    id: "14",
    employeeId: "EMP014",
    firstName: "John",
    middleName: "Michael",
    lastName: "Rodriguez",

    presentAddress: "123 Accounting St, Mandaluyong City, Metro Manila",
    mobileNo: "+63 917 141 4141",
    email: "john.rodriguez@university.edu",

    birthDate: "1990-06-25",
    birthPlace: "Davao City",
    age: 33,
    gender: "Male",
    citizenship: "Filipino",
    civilStatus: "Single",

    ssNo: "14-1414141-4",
    tinNo: "141-414-141-000",

    dateHired: "2015-03-15",
    positionId: "11", // Staff
    departmentId: "5", // Finance Department
    officeId: "6", // Finance Office

    profileImage: "https://randomuser.me/api/portraits/men/14.jpg",
  },

  // Administration - Secretary (HR)
  {
    id: "15",
    employeeId: "EMP015",
    firstName: "Maria",
    middleName: "Teresa",
    lastName: "Santos",

    presentAddress: "456 Secretary Lane, Quezon City, Metro Manila",
    mobileNo: "+63 917 151 5151",
    email: "maria.santos@university.edu",

    birthDate: "1992-09-18",
    birthPlace: "Manila City",
    age: 31,
    gender: "Female",
    citizenship: "Filipino",
    civilStatus: "Single",

    ssNo: "15-1515151-5",
    tinNo: "151-515-151-000",

    dateHired: "2018-06-01",
    positionId: "12", // Secretary - Admin
    departmentId: "4", // Human Resources
    officeId: "5", // HR Office

    profileImage: "https://randomuser.me/api/portraits/women/15.jpg",
  },

  // Academic - Secretary (Computer Studies)
  {
    id: "16",
    employeeId: "EMP016",
    firstName: "Anna",
    middleName: "Marie",
    lastName: "Cruz",

    presentAddress: "789 Faculty Circle, Quezon City, Metro Manila",
    mobileNo: "+63 917 161 6161",
    email: "anna.cruz@university.edu",

    birthDate: "1993-11-22",
    birthPlace: "Cebu City",
    age: 30,
    gender: "Female",
    citizenship: "Filipino",
    civilStatus: "Single",

    ssNo: "16-1616161-6",
    tinNo: "161-616-161-000",

    dateHired: "2019-07-15",
    positionId: "6", // Secretary - Academic
    departmentId: "1", // College of Computer Studies
    officeId: "1", // Dean's Office - CCS

    profileImage: "https://randomuser.me/api/portraits/women/16.jpg",
  },
]

// Sample siblings
export const siblings: Sibling[] = [
  {
    id: "1",
    employeeId: "1",
    name: "James Doe Jr.",
    occupation: "Software Engineer",
    company: "Tech Solutions Inc.",
  },
  {
    id: "2",
    employeeId: "1",
    name: "Jennifer Doe",
    occupation: "Marketing Manager",
    company: "Global Marketing Co.",
  },
  {
    id: "3",
    employeeId: "2",
    name: "Carlos Cruz",
    occupation: "Architect",
    company: "Design Builders Inc.",
  },
]

// Sample dependents
export const dependents: Dependent[] = [
  {
    id: "1",
    employeeId: "1",
    name: "Jake Doe",
    relationship: "Son",
    occupation: "Student",
    company: "N/A",
  },
  {
    id: "2",
    employeeId: "1",
    name: "Jessica Doe",
    relationship: "Daughter",
    occupation: "Student",
    company: "N/A",
  },
]

// Sample education
export const educations: Education[] = [
  {
    id: "1",
    employeeId: "1",
    level: "Bachelor",
    school: "University of the Philippines",
    course: "Bachelor of Science in Computer Science",
    yearStarted: "2003",
    yearEnded: "2007",
    graduated: true,
  },
  {
    id: "2",
    employeeId: "1",
    level: "Master",
    school: "Ateneo de Manila University",
    course: "Master of Science in Information Technology",
    yearStarted: "2010",
    yearEnded: "2012",
    graduated: true,
  },
  {
    id: "3",
    employeeId: "2",
    level: "Bachelor",
    school: "De La Salle University",
    course: "Bachelor of Science in Accountancy",
    yearStarted: "2008",
    yearEnded: "2012",
    graduated: true,
  },
]

// Sample awards
export const awards: Award[] = [
  {
    id: "1",
    employeeId: "1",
    name: "Employee of the Year",
    awardingBody: "Company Awards Committee",
    dateAwarded: "2022-12-15",
  },
  {
    id: "2",
    employeeId: "2",
    name: "Outstanding Performance",
    awardingBody: "Department of Finance",
    dateAwarded: "2021-06-30",
  },
]

// Sample licenses
export const licenses: License[] = [
  {
    id: "1",
    employeeId: "2",
    name: "Certified Public Accountant",
    rating: "85.6",
    dateTaken: "2013-10-05",
    licenseNo: "0123456",
    issuedDate: "2013-11-15",
    expirationDate: "2026-11-15",
  },
]
