"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams } from 'react-router-dom';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonItem,
  IonLabel,
  IonList,
  IonAvatar,
  IonImg,
  IonIcon,
  IonButton,
  IonSegment,
  IonSegmentButton,
  IonGrid,
  IonRow,
  IonCol,
  IonChip,
  IonBadge,
  IonSpinner,
  IonAlert,
  IonToast,
  IonModal,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonDatetime,
  IonRefresher,
  IonRefresherContent,
} from "@ionic/react"
import { call, mail, home, business, calendar, person, school, trophy, document, people, create, time, checkmark, close, refresh, save, pencil } from "ionicons/icons"
import {
  type EmployeeInformation,
} from "../../data/data"
import employeeService  from "../../services/EmployeeService"
import leaveService from "../../services/LeaveService"
import AuthService from "../../services/AuthService"

interface RouteParams {
  id: string
}

interface LeaveRequest {
  id?: number;
  employee: any;
  leave_type: string;
  start_date: string;
  end_date: string;
  days_requested: number;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
  approved_by?: any;
  approval_date?: string;
  approval_notes?: string;
  supporting_documents?: string[];
  created_at?: string;
  updated_at?: string;
}

interface LeaveCredit {
  id?: number;
  employee: any;
  leave_type: string;
  year: number;
  total_credits: number;
  used_credits: number;
  remaining_credits: number;
}

interface EmployeeDetailProps {
  id?: string;
}

const EmployeeDetail: React.FC<EmployeeDetailProps> = (props) => {
  const params = useParams<RouteParams>();
  const id = props.id || params.id;
  const [segment, setSegment] = useState<"personal" | "family" | "education" | "leave-requests" | "leave-credits" | "edit">("personal");
  const [employee, setEmployee] = useState<EmployeeInformation | null>(null);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [leaveCredits, setLeaveCredits] = useState<LeaveCredit[]>([]);
  const [isLoading, setIsLoading] = useState(true);  const [isEditing, setIsEditing] = useState(false);
  const [editedEmployee, setEditedEmployee] = useState<EmployeeInformation | null>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  // Set your API base URL here
  const API_BASE_URL = (window as any).API_BASE_URL || 'http://127.0.0.1:8000/api';

  // Load employee data on component mount
  useEffect(() => {
    loadEmployee();
  }, [id]);
  
  const loadEmployee = async () => {
    try {
      setIsLoading(true);
      const employeeData = await employeeService.getEmployeeById(id!);
      setEmployee(employeeData || null);
      setEditedEmployee(employeeData || null);
      
      if (!employeeData) {
        setAlertMessage("Employee not found");
        setShowAlert(true);
      } else {
        // Only load leave data if user is authenticated
        if (AuthService.isAuthenticated()) {
          await Promise.all([
            loadLeaveRequests(employeeData.id),
            loadLeaveCredits(parseInt(employeeData.id))
          ]);
        } else {
          console.log("User not authenticated, skipping leave data load");
        }
      }
    } catch (error) {
      console.error("Error loading employee:", error);
      setAlertMessage("Failed to load employee data. Please try again.");
      setShowAlert(true);
    } finally {
      setIsLoading(false);
    }
  };

  const loadLeaveRequests = async (employeeId: string) => {
    try {
      // Pass the employee ID to get requests for this specific employee
      const requests = await leaveService.getMyLeaveRequests(parseInt(employeeId))
      setLeaveRequests(Array.isArray(requests) ? requests : [])    } catch (error) {
      console.error("Error loading leave requests:", error);
      setLeaveRequests([]); // Set to empty array on error
    }
  };
  
  const loadLeaveCredits = async (employeeId: number) => {
    try {
      const credits = await leaveService.getLeaveCreditsForEmployee(employeeId);
      // Ensure credits is always an array
      setLeaveCredits(Array.isArray(credits) ? credits : []);
    } catch (error) {
      console.error("Error loading leave credits:", error);
      setLeaveCredits([]); // Set to empty array on error
    }
  };

  const handleRefresh = async (event: CustomEvent) => {
    await loadEmployee()
    event.detail.complete()
  }

  const handleEdit = () => {
    setIsEditing(true)
    setSegment("edit")
  }

  const handleSave = async () => {
    if (!editedEmployee) return

    try {
      setIsLoading(true)
      const updatedEmployee = await employeeService.updateEmployee(
        editedEmployee,
        editedEmployee.id,
        editedEmployee.email
      )
      setEmployee(updatedEmployee)
      setEditedEmployee(updatedEmployee)
      setIsEditing(false)
      setSegment("personal")
      setToastMessage("Employee information updated successfully")
      setShowToast(true)
    } catch (error) {
      console.error("Error updating employee:", error)
      setAlertMessage("Failed to update employee information. Please try again.")
      setShowAlert(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setEditedEmployee(employee)
    setIsEditing(false)
    setSegment("personal")
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved': return 'success'
      case 'Rejected': return 'danger'
      case 'Cancelled': return 'medium'
      default: return 'warning'
    }
  }

  // Handle segment changes when authentication status changes
  useEffect(() => {
    if (!AuthService.isAuthenticated()) {
      // If user is not authenticated and on a leave-related tab, switch to personal
      if (segment === "leave-requests" || segment === "leave-credits" || segment === "edit") {
        setSegment("personal")
      }
    }
  }, [segment])

  if (isLoading) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar color="primary">
            <IonButtons slot="start">
              <IonBackButton defaultHref="/employee-directory" />
            </IonButtons>
            <IonTitle>Loading...</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <IonSpinner name="circles" />
          </div>
        </IonContent>
      </IonPage>
    )
  }

  if (!employee) {
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar color="primary">
            <IonButtons slot="start">
              <IonBackButton defaultHref="/employee-directory" />
            </IonButtons>
            <IonTitle>Employee Not Found</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent>
          <div className="ion-padding">
            <p>The employee you are looking for does not exist.</p>
          </div>
        </IonContent>
      </IonPage>
    )
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/employee-directory" />
          </IonButtons>
          <IonTitle>Employee Profile</IonTitle>
          <IonButtons slot="end">
            {isEditing ? (
              <>
                <IonButton onClick={handleSave} disabled={isLoading}>
                  <IonIcon slot="icon-only" icon={save} />
                </IonButton>
                <IonButton onClick={handleCancel}>
                  <IonIcon slot="icon-only" icon={close} />
                </IonButton>
              </>
            ) : (
              <IonButton onClick={handleEdit}>
                <IonIcon slot="icon-only" icon={pencil} />
              </IonButton>
            )}
          </IonButtons>        </IonToolbar>
        <IonToolbar>
          <IonSegment value={segment} onIonChange={(e) => setSegment(e.detail.value as any)}>
            <IonSegmentButton value="personal">
              <IonLabel>Personal</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="family">
              <IonLabel>Family</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="education">
              <IonLabel>Education</IonLabel>
            </IonSegmentButton>
            {AuthService.isAuthenticated() && (
              <>
                <IonSegmentButton value="leave-requests">
                  <IonLabel>Leave Requests</IonLabel>
                </IonSegmentButton>
                <IonSegmentButton value="leave-credits">
                  <IonLabel>Leave Credits</IonLabel>
                </IonSegmentButton>
              </>
            )}
            {AuthService.isAuthenticated() && isEditing && (
              <IonSegmentButton value="edit">
                <IonLabel>Edit</IonLabel>
              </IonSegmentButton>
            )}
          </IonSegment>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent pullingIcon={refresh} refreshingSpinner="circles" />
        </IonRefresher>

        {/* Employee Header Card */}
        <IonCard>
          <IonCardContent>
            <IonGrid>
              <IonRow className="ion-align-items-center">
                <IonCol size="4" className="ion-text-center">
                  <IonAvatar style={{ width: "80px", height: "80px", margin: "0 auto" }}>
                    <IonImg
                      src={employee.profileImage || "https://ionicframework.com/docs/img/demos/avatar.svg"}
                      alt={`${employee.firstName} ${employee.lastName}`}
                    />
                  </IonAvatar>
                </IonCol>
                <IonCol size="8">
                  <h1 className="ion-no-margin">
                    {employee.firstName} {employee.middleName ? employee.middleName + " " : ""}
                    {employee.lastName} {employee.suffix ? employee.suffix : ""}
                  </h1>                  <p className="ion-no-margin">{employee.position_title || 'No Position'}</p>
                  <p className="ion-no-margin">{employee.department_name || 'No Department'}</p>
                  <IonChip color="primary">{employee.employeeId}</IonChip>
                </IonCol>
              </IonRow>
            </IonGrid>
          </IonCardContent>
        </IonCard>

        {segment === "personal" && (
          <>
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Contact Information</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonList lines="none">
                  <IonItem>
                    <IonIcon icon={mail} slot="start" color="primary" />
                    <IonLabel>
                      <h2>Email</h2>
                      <p>{employee.email}</p>
                    </IonLabel>
                  </IonItem>
                  <IonItem>
                    <IonIcon icon={call} slot="start" color="primary" />
                    <IonLabel>
                      <h2>Mobile</h2>
                      <p>{employee.mobileNo}</p>
                    </IonLabel>
                  </IonItem>
                  {employee.telephoneNo && (
                    <IonItem>
                      <IonIcon icon={call} slot="start" color="primary" />
                      <IonLabel>
                        <h2>Telephone</h2>
                        <p>{employee.telephoneNo}</p>
                      </IonLabel>
                    </IonItem>
                  )}
                  <IonItem>
                    <IonIcon icon={home} slot="start" color="primary" />
                    <IonLabel>
                      <h2>Present Address</h2>
                      <p>{employee.presentAddress}</p>
                    </IonLabel>
                  </IonItem>
                  {employee.provincialAddress && (
                    <IonItem>
                      <IonIcon icon={home} slot="start" color="primary" />
                      <IonLabel>
                        <h2>Provincial Address</h2>
                        <p>{employee.provincialAddress}</p>
                      </IonLabel>
                    </IonItem>
                  )}
                </IonList>
              </IonCardContent>
            </IonCard>

            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Personal Information</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonGrid>
                  <IonRow>
                    <IonCol size="6">
                      <IonItem lines="none">
                        <IonLabel>
                          <h2>Date of Birth</h2>
                          <p>{new Date(employee.birthDate).toLocaleDateString()}</p>
                        </IonLabel>
                      </IonItem>
                    </IonCol>
                    <IonCol size="6">
                      <IonItem lines="none">
                        <IonLabel>
                          <h2>Place of Birth</h2>
                          <p>{employee.birthPlace}</p>
                        </IonLabel>
                      </IonItem>
                    </IonCol>
                  </IonRow>
                  <IonRow>
                    <IonCol size="6">
                      <IonItem lines="none">
                        <IonLabel>
                          <h2>Age</h2>
                          <p>{employee.age}</p>
                        </IonLabel>
                      </IonItem>
                    </IonCol>
                    <IonCol size="6">
                      <IonItem lines="none">
                        <IonLabel>
                          <h2>Gender</h2>
                          <p>{employee.gender}</p>
                        </IonLabel>
                      </IonItem>
                    </IonCol>
                  </IonRow>
                  <IonRow>
                    <IonCol size="6">
                      <IonItem lines="none">
                        <IonLabel>
                          <h2>Citizenship</h2>
                          <p>{employee.citizenship}</p>
                        </IonLabel>
                      </IonItem>
                    </IonCol>
                    <IonCol size="6">
                      <IonItem lines="none">
                        <IonLabel>
                          <h2>Civil Status</h2>
                          <p>{employee.civilStatus}</p>
                        </IonLabel>
                      </IonItem>
                    </IonCol>
                  </IonRow>
                  {(employee.height || employee.weight) && (
                    <IonRow>
                      {employee.height && (
                        <IonCol size="6">
                          <IonItem lines="none">
                            <IonLabel>
                              <h2>Height</h2>
                              <p>{employee.height}</p>
                            </IonLabel>
                          </IonItem>
                        </IonCol>
                      )}
                      {employee.weight && (
                        <IonCol size="6">
                          <IonItem lines="none">
                            <IonLabel>
                              <h2>Weight</h2>
                              <p>{employee.weight}</p>
                            </IonLabel>
                          </IonItem>
                        </IonCol>
                      )}
                    </IonRow>
                  )}
                </IonGrid>
              </IonCardContent>
            </IonCard>

            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Government IDs</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonList lines="none">
                  {employee.ssNo && (
                    <IonItem>
                      <IonLabel>
                        <h2>SSS Number</h2>
                        <p>{employee.ssNo}</p>
                      </IonLabel>
                    </IonItem>
                  )}
                  {employee.tinNo && (
                    <IonItem>
                      <IonLabel>
                        <h2>TIN</h2>
                        <p>{employee.tinNo}</p>
                      </IonLabel>
                    </IonItem>
                  )}
                  {employee.philHealthNo && (
                    <IonItem>
                      <IonLabel>
                        <h2>PhilHealth</h2>
                        <p>{employee.philHealthNo}</p>
                      </IonLabel>
                    </IonItem>
                  )}
                  {employee.pagIbigNo && (
                    <IonItem>
                      <IonLabel>
                        <h2>Pag-IBIG</h2>
                        <p>{employee.pagIbigNo}</p>
                      </IonLabel>                    </IonItem>
                  )}
                </IonList>
              </IonCardContent>
            </IonCard>
          </>
        )}

        {/* Family Information Tab */}
        {segment === "family" && (
          <>
            {employee.spouseName && (
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>Spouse Information</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <IonList lines="none">
                    <IonItem>
                      <IonIcon icon={person} slot="start" color="primary" />
                      <IonLabel>
                        <h2>Name</h2>
                        <p>{employee.spouseName}</p>
                      </IonLabel>
                    </IonItem>
                    {employee.spouseOccupation && (
                      <IonItem>
                        <IonIcon icon={business} slot="start" color="primary" />
                        <IonLabel>
                          <h2>Occupation</h2>
                          <p>{employee.spouseOccupation}</p>
                        </IonLabel>
                      </IonItem>
                    )}
                    {employee.spouseCompany && (
                      <IonItem>
                        <IonIcon icon={business} slot="start" color="primary" />
                        <IonLabel>
                          <h2>Company</h2>
                          <p>{employee.spouseCompany}</p>
                        </IonLabel>
                      </IonItem>
                    )}
                  </IonList>
                </IonCardContent>
              </IonCard>
            )}

            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Parents Information</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonList lines="none">
                  {employee.fatherName && (
                    <>
                      <IonItem>
                        <IonIcon icon={person} slot="start" color="primary" />
                        <IonLabel>
                          <h2>Father's Name</h2>
                          <p>{employee.fatherName}</p>
                        </IonLabel>
                      </IonItem>
                      {employee.fatherOccupation && (
                        <IonItem>
                          <IonIcon icon={business} slot="start" color="primary" />
                          <IonLabel>
                            <h2>Father's Occupation</h2>
                            <p>{employee.fatherOccupation}</p>
                          </IonLabel>
                        </IonItem>
                      )}
                      {employee.fatherCompany && (
                        <IonItem>
                          <IonIcon icon={business} slot="start" color="primary" />
                          <IonLabel>
                            <h2>Father's Company</h2>
                            <p>{employee.fatherCompany}</p>
                          </IonLabel>
                        </IonItem>
                      )}
                    </>
                  )}

                  {employee.motherName && (
                    <>
                      <IonItem>
                        <IonIcon icon={person} slot="start" color="primary" />
                        <IonLabel>
                          <h2>Mother's Name</h2>
                          <p>{employee.motherName}</p>
                        </IonLabel>
                      </IonItem>
                      {employee.motherOccupation && (
                        <IonItem>
                          <IonIcon icon={business} slot="start" color="primary" />
                          <IonLabel>
                            <h2>Mother's Occupation</h2>
                            <p>{employee.motherOccupation}</p>
                          </IonLabel>
                        </IonItem>
                      )}
                      {employee.motherCompany && (
                        <IonItem>
                          <IonIcon icon={business} slot="start" color="primary" />
                          <IonLabel>
                            <h2>Mother's Company</h2>
                            <p>{employee.motherCompany}</p>
                          </IonLabel>
                        </IonItem>
                      )}
                    </>
                  )}
                </IonList>

                {/* Show message if no family information is available */}
                {!employee.spouseName && !employee.fatherName && !employee.motherName && (
                  <IonItem lines="none">
                    <IonLabel className="ion-text-center">
                      <p>No family information available</p>
                    </IonLabel>
                  </IonItem>
                )}
              </IonCardContent>
            </IonCard>
          </>
        )}

        {segment === "education" && (
          <>
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Educational Background</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                {/* Main Education */}
                {employee.highestDegree && (
                  <IonItem lines="none">
                    <IonIcon icon={school} slot="start" color="primary" />
                    <IonLabel>
                      <h2>{employee.highestDegree}</h2>
                      {employee.schoolName && <h3>{employee.schoolName}</h3>}
                      {employee.courseOrProgram && <p>{employee.courseOrProgram}</p>}
                      {employee.yearGraduated && <p>Graduated: {employee.yearGraduated}</p>}
                    </IonLabel>
                  </IonItem>
                )}

                {/* Additional Education */}
                {employee.additionalEducation && employee.additionalEducation.length > 0 && (
                  <>
                    {employee.additionalEducation.map((education, index) => (
                      <IonItem key={`additional-education-${index}`} lines="none">
                        <IonIcon icon={school} slot="start" color="secondary" />
                        <IonLabel>
                          <h2>{education.degree}</h2>
                          <h3>{education.school}</h3>
                          {education.course && <p>{education.course}</p>}
                          {education.year && <p>Graduated: {education.year}</p>}
                        </IonLabel>
                      </IonItem>                    ))}
                  </>
                )}

                {/* Show a message if no education data is available */}
                {!employee.highestDegree && 
                 (!employee.additionalEducation || employee.additionalEducation.length === 0) && (
                  <IonItem lines="none">
                    <IonLabel className="ion-text-center">
                      <p>No education information available</p>
                    </IonLabel>
                  </IonItem>
                )}
              </IonCardContent>
            </IonCard>
          </>
        )}        {/* Leave Requests Tab */}
        {segment === "leave-requests" && (
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Leave Requests</IonCardTitle>
            </IonCardHeader>            <IonCardContent>
              {!AuthService.isAuthenticated() ? (
                <div className="ion-text-center ion-padding">
                  <p>Please sign in to view leave requests</p>
                </div>
              ) : leaveRequests.length === 0 ? (
                <div className="ion-text-center ion-padding">
                  <p>No leave requests found</p>
                </div>
              ) : (
                <IonList>
                  {leaveRequests.map((request) => (
                    <IonItem key={request.id}>
                      <IonLabel>
                        <h2>{request.leave_type}</h2>
                        <p>
                          {new Date(request.start_date).toLocaleDateString()} - {' '}
                          {new Date(request.end_date).toLocaleDateString()}
                        </p>
                        <p>{request.reason}</p>
                        {request.approval_notes && <p>Notes: {request.approval_notes}</p>}
                      </IonLabel>
                      <IonChip slot="end" color={getStatusColor(request.status)}>
                        {request.status}
                      </IonChip>
                    </IonItem>
                  ))}
                </IonList>
              )}
            </IonCardContent>
          </IonCard>
        )}

        {/* Leave Credits Tab */}
        {segment === "leave-credits" && (
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Leave Credits</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>              {!AuthService.isAuthenticated() ? (
                <div className="ion-text-center ion-padding">
                  <p>Please sign in to view leave credits</p>
                </div>
              ) : !Array.isArray(leaveCredits) || leaveCredits.length === 0 ? (
                <div className="ion-text-center ion-padding">
                  <p>No leave credits found</p>
                </div>
              ) : (
                <IonList>
                  {leaveCredits.map((credit) => (
                    <IonItem key={credit.id}>
                      <IonLabel>
                        <h2>{credit.leave_type}</h2>
                        <p>Total: {credit.total_credits} | Used: {credit.used_credits} | Remaining: {credit.remaining_credits}</p>
                        <p><strong>Remaining Balance: {credit.remaining_credits} day(s)</strong></p>
                      </IonLabel>
                    </IonItem>
                  ))}
                </IonList>
              )}
            </IonCardContent>
          </IonCard>
        )}

        {/* Edit Tab */}
        {segment === "edit" && editedEmployee && (
          <>
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Edit Employee Information</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonList>
                  <IonItem>
                    <IonLabel position="stacked">First Name</IonLabel>
                    <IonInput
                      value={editedEmployee.firstName}
                      onIonInput={(e) => setEditedEmployee({
                        ...editedEmployee,
                        firstName: e.detail.value!
                      })}
                    />
                  </IonItem>
                  
                  <IonItem>
                    <IonLabel position="stacked">Middle Name</IonLabel>
                    <IonInput
                      value={editedEmployee.middleName}
                      onIonInput={(e) => setEditedEmployee({
                        ...editedEmployee,
                        middleName: e.detail.value!
                      })}
                    />
                  </IonItem>
                  
                  <IonItem>
                    <IonLabel position="stacked">Last Name</IonLabel>
                    <IonInput
                      value={editedEmployee.lastName}
                      onIonInput={(e) => setEditedEmployee({
                        ...editedEmployee,
                        lastName: e.detail.value!
                      })}
                    />
                  </IonItem>
                  
                  <IonItem>
                    <IonLabel position="stacked">Email</IonLabel>
                    <IonInput
                      type="email"
                      value={editedEmployee.email}
                      onIonInput={(e) => setEditedEmployee({
                        ...editedEmployee,
                        email: e.detail.value!
                      })}
                    />
                  </IonItem>
                  
                  <IonItem>
                    <IonLabel position="stacked">Mobile Number</IonLabel>
                    <IonInput
                      value={editedEmployee.mobileNo}
                      onIonInput={(e) => setEditedEmployee({
                        ...editedEmployee,
                        mobileNo: e.detail.value!
                      })}
                    />
                  </IonItem>
                  
                  <IonItem>
                    <IonLabel position="stacked">Present Address</IonLabel>
                    <IonTextarea
                      value={editedEmployee.presentAddress}
                      onIonInput={(e) => setEditedEmployee({
                        ...editedEmployee,
                        presentAddress: e.detail.value!
                      })}
                    />
                  </IonItem>
                </IonList>
              </IonCardContent>
            </IonCard>
          </>
        )}

        <IonAlert
          isOpen={showAlert}
          onDidDismiss={() => setShowAlert(false)}
          header="Error"
          message={alertMessage}
          buttons={["OK"]}
        />        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
          color="success"
        />
      </IonContent>    </IonPage>
  );
};

export default EmployeeDetail;
