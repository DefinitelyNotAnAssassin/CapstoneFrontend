"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonItem,
  IonLabel,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonDatetime,
  IonButton,
  IonList,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonSegment,
  IonSegmentButton,
  IonToast,
  IonTextarea,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonText,
  IonLoading,
  IonAlert,
  IonChip,
} from "@ionic/react"
import { useHistory } from "react-router"
import { save } from "ionicons/icons"
import { positions, departments, offices, programs, type EmployeeInformation } from "../../data/data"
import employeeService  from "../../services/EmployeeService"
import { useAudit } from "../../hooks/useAudit"
import { FormItem } from "../../components/FormComponents"
import { applyFormStyles, getFormItemStyle, getLabelStyle } from "../../utils/formHelpers"
import "./EmployeeAdd.css"

// Types for leave packages
interface LeavePackageItem {
  id: number
  leave_type: string
  leave_type_display: string
  quantity: number
}

interface LeavePackage {
  id: number
  name: string
  description: string | null
  is_active: boolean
  is_predefined: boolean
  items: LeavePackageItem[]
}

interface LeaveTypeOption {
  value: string
  label: string
}

type PackageMode = "predefined" | "custom" | "none"

const API_BASE_URL = 'http://127.0.0.1:8000/api'

const EmployeeAdd: React.FC = () => {
  const history = useHistory();
  const { logEvent } = useAudit();
  const [segment, setSegment] = useState<"personal" | "contact" | "family" | "education" | "employment">("personal")
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  const [toastColor, setToastColor] = useState("success")
  const [isLoading, setIsLoading] = useState(false)
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState("")

  // Leave package state
  const [leavePackages, setLeavePackages] = useState<LeavePackage[]>([])
  const [leaveTypes, setLeaveTypes] = useState<LeaveTypeOption[]>([])
  const [packageMode, setPackageMode] = useState<PackageMode>("predefined")
  const [selectedPackageId, setSelectedPackageId] = useState<number | null>(null)
  const [customLeaveItems, setCustomLeaveItems] = useState<{ leave_type: string; quantity: number }[]>([])

  // Form state
  const [formData, setFormData] = useState<Partial<EmployeeInformation>>({
    id: String(Date.now()), // Generate a unique ID
    employeeId: "",
    firstName: "",
    middleName: "",
    lastName: "",
    suffix: "",
    nickname: "",

    // Contact Information
    presentAddress: "",
    provincialAddress: "",
    telephoneNo: "",    mobileNo: "",
    email: "",
    password: "sdca2025", // Default password for all employees// Personal Information
    birthDate: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
    birthPlace: "",
    age: 0,
    gender: "Male",
    citizenship: "Filipino",
    civilStatus: "Single",

    // Additional Information
    height: "",
    weight: "",
    ssNo: "",
    tinNo: "",
    philHealthNo: "",
    pagIbigNo: "",

    // Family Information
    spouseName: "",
    spouseOccupation: "",
    spouseCompany: "",
    fatherName: "",
    fatherOccupation: "",
    fatherCompany: "",    motherName: "",
    motherOccupation: "",
    motherCompany: "",
      // Education Information
    highestDegree: "",
    schoolName: "",
    courseOrProgram: "",
    yearGraduated: "",
    additionalEducation: [
      // No initial additional education entries
    ],    // Employment Information
    dateHired: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
    positionId: "",
    departmentId: "",
    officeId: "",
    programId: "",
  })

  // Fetch leave packages and leave types on mount
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/employee-packages/?is_active=true`)
        if (res.ok) {
          const data = await res.json()
          setLeavePackages(data.results || data)
        }
      } catch (e) {
        console.error('Failed to load leave packages', e)
      }
    }
    const fetchLeaveTypes = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/employee-packages/leave-types/`)
        if (res.ok) {
          const data = await res.json()
          setLeaveTypes(data)
        }
      } catch (e) {
        console.error('Failed to load leave types', e)
      }
    }
    fetchPackages()
    fetchLeaveTypes()
  }, [])

  // Calculate age whenever birthDate changes
  useEffect(() => {
    if (formData.birthDate) {
      const birthDate = new Date(formData.birthDate)
      const today = new Date()
      let age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }

      setFormData((prev) => ({ ...prev, age }))
    }
  }, [formData.birthDate])
  
  // Apply form styles on component mount
  useEffect(() => {
    applyFormStyles();
  }, []);

  // Handle input changes
  const handleInputChange = (e: CustomEvent, field: keyof EmployeeInformation) => {
    const value = e.detail.value
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  // Handle select changes
  const handleSelectChange = (e: CustomEvent, field: keyof EmployeeInformation) => {
    const value = e.detail.value
    setFormData((prev) => ({ ...prev, [field]: value }))
  }
  // Handle date changes
  const handleDateChange = (e: CustomEvent, field: keyof EmployeeInformation) => {
    const value = e.detail.value;
    if (value) {
      // Convert to Date object and format as YYYY-MM-DD
      const date = new Date(value);
      const formattedDate = date.toISOString().split('T')[0]; // Gets YYYY-MM-DD format
      setFormData((prev) => ({ ...prev, [field]: formattedDate }));
    }
  }

  // Filter offices based on selected department
  const filteredOffices = offices.filter((office) => office.departmentId === formData.departmentId)

  // Filter programs based on selected department
  const filteredPrograms = programs.filter((program) => program.departmentId === formData.departmentId)

  // Check if position is academic
  const isAcademicPosition = () => {
    const position = positions.find((pos) => pos.id === formData.positionId)
    return position?.type === "Academic"
  }

  // Validate form
  const validateForm = () => {
    // Required fields for all segments
    if (segment === "personal") {
      if (!formData.firstName || !formData.lastName || !formData.employeeId) {
        setToastMessage("Please fill in all required fields in Personal Information")
        setToastColor("danger")
        setShowToast(true)
        return false
      }
    } else if (segment === "contact") {
      if (!formData.presentAddress || !formData.mobileNo || !formData.email || !formData.password) {
        setToastMessage("Please fill in all required fields in Contact Information")
        setToastColor("danger")
        setShowToast(true)
        return false
      }
      
      // Validate password length
      if (formData.password && formData.password.length < 6) {
        setToastMessage("Password must be at least 6 characters long")
        setToastColor("danger")
        setShowToast(true)
        return false
      }
    } else if (segment === "education") {
      if (!formData.highestDegree || !formData.schoolName || !formData.courseOrProgram) {
        setToastMessage("Please fill in all required fields in Education Information")
        setToastColor("danger")
        setShowToast(true)
        return false
      }
    } else if (segment === "employment") {
      if (!formData.positionId || !formData.departmentId || !formData.officeId) {
        setToastMessage("Please fill in all required fields in Employment Information")
        setToastColor("danger")
        setShowToast(true)
        return false
      }

      // If academic position, program is required
      if (isAcademicPosition() && !formData.programId) {
        setToastMessage("Please select a program for academic position")
        setToastColor("danger")
        setShowToast(true)
        return false
      }
    }

    return true
  }
  // Handle form submission
  const handleSubmit = async () => {
    // Validate all required fields
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.employeeId ||
      !formData.presentAddress ||
      !formData.mobileNo ||
      !formData.email ||
      !formData.password ||
      !formData.positionId ||
      !formData.departmentId ||
      !formData.officeId
    ) {
      setToastMessage("Please fill in all required fields")
      setToastColor("danger")
      setShowToast(true)
      return
    }

    // If academic position, program is required
    if (isAcademicPosition() && !formData.programId) {
      setToastMessage("Please select a program for academic position")
      setToastColor("danger")
      setShowToast(true)
      return
    }

    // Show loading
    setIsLoading(true)

    try {
      // Create new employee object (without id since Firestore will generate it)
      const newEmployee: Omit<EmployeeInformation, 'id'> = {
        employeeId: formData.employeeId!,
        firstName: formData.firstName!,
        middleName: formData.middleName,
        lastName: formData.lastName!,
        suffix: formData.suffix,
        nickname: formData.nickname,

        presentAddress: formData.presentAddress!,
        provincialAddress: formData.provincialAddress,
        telephoneNo: formData.telephoneNo,
        mobileNo: formData.mobileNo!,
        email: formData.email!,

        birthDate: formData.birthDate!,
        birthPlace: formData.birthPlace || "Unknown",
        age: formData.age!,
        gender: formData.gender as "Male" | "Female" | "Other",
        citizenship: formData.citizenship!,
        civilStatus: formData.civilStatus as "Single" | "Married" | "Widowed" | "Separated" | "Divorced",

        height: formData.height,
        weight: formData.weight,
        ssNo: formData.ssNo,
        tinNo: formData.tinNo,
        philHealthNo: formData.philHealthNo,
        pagIbigNo: formData.pagIbigNo,

        spouseName: formData.spouseName,
        spouseOccupation: formData.spouseOccupation,
        spouseCompany: formData.spouseCompany,
        fatherName: formData.fatherName,
        fatherOccupation: formData.fatherOccupation,
        fatherCompany: formData.fatherCompany,        motherName: formData.motherName,
        motherOccupation: formData.motherOccupation,
        motherCompany: formData.motherCompany,
        
        // Education Information
        highestDegree: formData.highestDegree,
        schoolName: formData.schoolName,
        courseOrProgram: formData.courseOrProgram,
        yearGraduated: formData.yearGraduated,
        additionalEducation: formData.additionalEducation || [],        dateHired: formData.dateHired!,
        positionId: formData.positionId!,
        departmentId: formData.departmentId!,
        officeId: formData.officeId!,        // Only include programId if it has a value
        ...(formData.programId ? { programId: formData.programId } : {}),

        // Leave package
        ...(packageMode === 'predefined' && selectedPackageId ? { leavePackageId: selectedPackageId } : {}),
        ...(packageMode === 'custom' && customLeaveItems.length > 0 ? { customLeaveItems } : {}),

        profileImage: `https://randomuser.me/api/portraits/${formData.gender === "Male" ? "men" : "women"}/${Math.floor(Math.random() * 70) + 1}.jpg`,
      }

      // Save employee using the service
      await employeeService.addEmployee(
        newEmployee,
        "admin", // In a real app, this would be the current user's ID
        "Administrator", // In a real app, this would be the current user's name
      )

      // Show success message
      setToastMessage("Employee added successfully")
      setToastColor("success")
      setShowToast(true)

      // Redirect to employee directory after a short delay
      setTimeout(() => {
        history.push("/employee-directory")
      }, 1500)
    } catch (error) {
      console.error("Error adding employee:", error)

      // Show error message
      if (error instanceof Error) {
        setAlertMessage(error.message)
      } else {
        setAlertMessage("An unexpected error occurred while adding the employee")
      }
      setShowAlert(true)
      setToastColor("danger")
    } finally {
      setIsLoading(false)
    }
  }

  // Handle next segment
  const handleNext = () => {
    if (validateForm()) {
      if (segment === "personal") setSegment("contact")
      else if (segment === "contact") setSegment("family")
      else if (segment === "family") setSegment("education")
      else if (segment === "education") setSegment("employment")
    }
  }

  // Handle previous segment
  const handlePrevious = () => {
    if (segment === "contact") setSegment("personal")
    else if (segment === "family") setSegment("contact")
    else if (segment === "education") setSegment("family")
    else if (segment === "employment") setSegment("education")
  }

  // Handle adding a new education entry
  const handleAddEducation = () => {
    setFormData((prev) => ({
      ...prev,
      additionalEducation: [
        ...(prev.additionalEducation || []),
        {
          degree: "",
          school: "",
          course: "",
          year: ""
        }
      ]
    }));
  };

  // Handle updating an education entry
  const handleEducationChange = (index: number, field: string, value: string) => {
    setFormData((prev) => {
      const updatedEducation = [...(prev.additionalEducation || [])];
      updatedEducation[index] = {
        ...updatedEducation[index],
        [field]: value
      };
      return {
        ...prev,
        additionalEducation: updatedEducation
      };
    });
  };

  // Handle removing an education entry
  const handleRemoveEducation = (index: number) => {
    setFormData((prev) => {
      const updatedEducation = [...(prev.additionalEducation || [])];
      updatedEducation.splice(index, 1);
      return {
        ...prev,
        additionalEducation: updatedEducation
      };
    });
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/employee-directory" />
          </IonButtons>
          <IonTitle>Add New Employee</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleSubmit} disabled={isLoading}>
              <IonIcon slot="icon-only" icon={save} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
        <IonToolbar>
          <IonSegment value={segment} onIonChange={(e) => setSegment(e.detail.value as any)}>
            <IonSegmentButton value="personal">
              <IonLabel>Personal</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="contact">
              <IonLabel>Contact</IonLabel>
            </IonSegmentButton>            <IonSegmentButton value="family">
              <IonLabel>Family</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="education">
              <IonLabel>Education</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="employment">
              <IonLabel>Employment</IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </IonToolbar>
      </IonHeader>      <IonContent className="form-container">
        {segment === "personal" && (
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Personal Information</IonCardTitle>
            </IonCardHeader>
            <IonCardContent><IonList>
                <FormItem label="Employee ID" required>
                  <IonInput
                    value={formData.employeeId}
                    onIonChange={(e) => handleInputChange(e, "employeeId")}
                    placeholder="Enter employee ID"
                    required
                  />
                </FormItem>
                
                <FormItem label="First Name" required>                  <IonInput
                    value={formData.firstName}
                    onIonChange={(e) => handleInputChange(e, "firstName")}
                    placeholder="Enter first name"
                    required
                  />
                </FormItem>
                
                <FormItem label="Middle Name">
                  <IonInput
                    value={formData.middleName}
                    onIonChange={(e) => handleInputChange(e, "middleName")}
                    placeholder="Enter middle name"
                  />
                </FormItem>                <FormItem label="Last Name" required>
                  <IonInput
                    value={formData.lastName}
                    onIonChange={(e) => handleInputChange(e, "lastName")}                    placeholder="Enter last name"
                    required
                  />
                </FormItem>                <FormItem label="Suffix">
                  <IonInput
                    value={formData.suffix}
                    onIonChange={(e) => handleInputChange(e, "suffix")}
                    placeholder="E.g., Jr., Sr., PhD"
                  />
                </FormItem>

                <FormItem label="Nickname">
                  <IonInput
                    value={formData.nickname}
                    onIonChange={(e) => handleInputChange(e, "nickname")}
                    placeholder="Enter nickname"
                  />
                </FormItem>                <FormItem label="Date of Birth" required>                  <IonDatetime
                    value={formData.birthDate}
                    onIonChange={(e) => handleDateChange(e, "birthDate")}
                    presentation="date"
                    max={new Date().toISOString()}
                  />
                </FormItem>

                <FormItem label="Place of Birth">                  <IonInput
                    value={formData.birthPlace}
                    onIonChange={(e) => handleInputChange(e, "birthPlace")}
                    placeholder="Enter place of birth"
                  />
                </FormItem>

                <FormItem label="Age">                  <IonInput value={formData.age} readonly />
                </FormItem>

                <FormItem label="Gender" required>                  <IonSelect value={formData.gender} onIonChange={(e) => handleSelectChange(e, "gender")}>
                    <IonSelectOption value="Male">Male</IonSelectOption>
                    <IonSelectOption value="Female">Female</IonSelectOption>
                    <IonSelectOption value="Other">Other</IonSelectOption>
                  </IonSelect>
                </FormItem>

                <FormItem label="Citizenship">                  <IonInput
                    value={formData.citizenship}
                    onIonChange={(e) => handleInputChange(e, "citizenship")}
                    placeholder="Enter citizenship"
                  />
                </FormItem>

                <FormItem label="Civil Status" required>                  <IonSelect value={formData.civilStatus} onIonChange={(e) => handleSelectChange(e, "civilStatus")}>
                    <IonSelectOption value="Single">Single</IonSelectOption>
                    <IonSelectOption value="Married">Married</IonSelectOption>
                    <IonSelectOption value="Widowed">Widowed</IonSelectOption>
                    <IonSelectOption value="Separated">Separated</IonSelectOption>
                    <IonSelectOption value="Divorced">Divorced</IonSelectOption>
                  </IonSelect>
                </FormItem>

                <FormItem label="Height (cm)">                  <IonInput
                    value={formData.height}
                    onIonChange={(e) => handleInputChange(e, "height")}
                    placeholder="Enter height"
                  />
                </FormItem>                <FormItem label="Weight (kg)">
                  <IonInput
                    value={formData.weight}
                    onIonChange={(e) => handleInputChange(e, "weight")}
                    placeholder="Enter weight"
                  />
                </FormItem>
              </IonList>
            </IonCardContent>
          </IonCard>
        )}

        {segment === "contact" && (
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Contact Information</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonList>                <FormItem label="Present Address" required>
                  <IonTextarea
                    value={formData.presentAddress}
                    onIonChange={(e) => handleInputChange(e, "presentAddress")}
                    placeholder="Enter present address"
                    rows={3}
                    required
                  />
                </FormItem>                <FormItem label="Provincial Address">
                  <IonTextarea
                    value={formData.provincialAddress}
                    onIonChange={(e) => handleInputChange(e, "provincialAddress")}
                    placeholder="Enter provincial address"
                    rows={3}
                  />
                </FormItem>

                <IonItem>
                  <IonLabel position="stacked">Telephone Number</IonLabel>
                  <IonInput
                    value={formData.telephoneNo}
                    onIonChange={(e) => handleInputChange(e, "telephoneNo")}
                    placeholder="Enter telephone number"
                  />
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked">
                    Mobile Number <IonText color="danger">*</IonText>
                  </IonLabel>
                  <IonInput
                    value={formData.mobileNo}
                    onIonChange={(e) => handleInputChange(e, "mobileNo")}
                    placeholder="Enter mobile number"
                    required
                  />
                </IonItem>

                <FormItem label="Email Address" required>
                  <IonInput
                    type="email"
                    value={formData.email}
                    onIonChange={(e) => handleInputChange(e, "email")}
                    placeholder="Enter email address"
                    required
                  />
                </FormItem>

                <FormItem label="Password" required>
                  <IonInput
                    type="password"
                    value={formData.password}
                    onIonChange={(e) => handleInputChange(e, "password")}
                    placeholder="Enter password (min. 6 characters)"
                    minlength={6}
                    required
                  />
                </FormItem>

                <IonItem lines="none">
                  <IonLabel position="stacked">Government IDs</IonLabel>
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked">SSS Number</IonLabel>
                  <IonInput
                    value={formData.ssNo}
                    onIonChange={(e) => handleInputChange(e, "ssNo")}
                    placeholder="Enter SSS number"
                  />
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked">TIN</IonLabel>
                  <IonInput
                    value={formData.tinNo}
                    onIonChange={(e) => handleInputChange(e, "tinNo")}
                    placeholder="Enter TIN"
                  />
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked">PhilHealth Number</IonLabel>
                  <IonInput
                    value={formData.philHealthNo}
                    onIonChange={(e) => handleInputChange(e, "philHealthNo")}
                    placeholder="Enter PhilHealth number"
                  />
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked">Pag-IBIG Number</IonLabel>
                  <IonInput
                    value={formData.pagIbigNo}
                    onIonChange={(e) => handleInputChange(e, "pagIbigNo")}
                    placeholder="Enter Pag-IBIG number"
                  />
                </IonItem>
              </IonList>
            </IonCardContent>
          </IonCard>
        )}

        {segment === "family" && (
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Family Information</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonList>
                <IonItem lines="none">
                  <IonLabel>
                    <h2>Spouse Information</h2>
                  </IonLabel>
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked">Spouse Name</IonLabel>
                  <IonInput
                    value={formData.spouseName}
                    onIonChange={(e) => handleInputChange(e, "spouseName")}
                    placeholder="Enter spouse name"
                  />
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked">Spouse Occupation</IonLabel>
                  <IonInput
                    value={formData.spouseOccupation}
                    onIonChange={(e) => handleInputChange(e, "spouseOccupation")}
                    placeholder="Enter spouse occupation"
                  />
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked">Spouse Company</IonLabel>
                  <IonInput
                    value={formData.spouseCompany}
                    onIonChange={(e) => handleInputChange(e, "spouseCompany")}
                    placeholder="Enter spouse company"
                  />
                </IonItem>

                <IonItem lines="none" className="ion-margin-top">
                  <IonLabel>
                    <h2>Father's Information</h2>
                  </IonLabel>
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked">Father's Name</IonLabel>
                  <IonInput
                    value={formData.fatherName}
                    onIonChange={(e) => handleInputChange(e, "fatherName")}
                    placeholder="Enter father's name"
                  />
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked">Father's Occupation</IonLabel>
                  <IonInput
                    value={formData.fatherOccupation}
                    onIonChange={(e) => handleInputChange(e, "fatherOccupation")}
                    placeholder="Enter father's occupation"
                  />
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked">Father's Company</IonLabel>
                  <IonInput
                    value={formData.fatherCompany}
                    onIonChange={(e) => handleInputChange(e, "fatherCompany")}
                    placeholder="Enter father's company"
                  />
                </IonItem>

                <IonItem lines="none" className="ion-margin-top">
                  <IonLabel>
                    <h2>Mother's Information</h2>
                  </IonLabel>
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked">Mother's Name</IonLabel>
                  <IonInput
                    value={formData.motherName}
                    onIonChange={(e) => handleInputChange(e, "motherName")}
                    placeholder="Enter mother's name"
                  />
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked">Mother's Occupation</IonLabel>
                  <IonInput
                    value={formData.motherOccupation}
                    onIonChange={(e) => handleInputChange(e, "motherOccupation")}
                    placeholder="Enter mother's occupation"
                  />
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked">Mother's Company</IonLabel>
                  <IonInput
                    value={formData.motherCompany}
                    onIonChange={(e) => handleInputChange(e, "motherCompany")}
                    placeholder="Enter mother's company"
                  />
                </IonItem>
              </IonList>
            </IonCardContent>
          </IonCard>
        )}

        {segment === "education" && (
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Education Information</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonList>
                <IonItem>
                  <IonLabel position="floating">Highest Degree</IonLabel>
                  <IonSelect
                    value={formData.highestDegree}
                    onIonChange={(e) => handleSelectChange(e, "highestDegree")}
                  >
                    <IonSelectOption value="High School Diploma">High School Diploma</IonSelectOption>
                    <IonSelectOption value="Associate's Degree">Associate's Degree</IonSelectOption>
                    <IonSelectOption value="Bachelor's Degree">Bachelor's Degree</IonSelectOption>
                    <IonSelectOption value="Master's Degree">Master's Degree</IonSelectOption>
                    <IonSelectOption value="Doctorate Degree">Doctorate Degree</IonSelectOption>
                  </IonSelect>
                </IonItem>

                <IonItem>
                  <IonLabel position="floating">School/University Name</IonLabel>
                  <IonInput
                    value={formData.schoolName}
                    onIonChange={(e) => handleInputChange(e, "schoolName")}
                    placeholder="Enter school or university name"
                  />
                </IonItem>

                <IonItem>
                  <IonLabel position="floating">Course/Program</IonLabel>
                  <IonInput
                    value={formData.courseOrProgram}
                    onIonChange={(e) => handleInputChange(e, "courseOrProgram")}
                    placeholder="Enter course or program"
                  />
                </IonItem>

                <IonItem>
                  <IonLabel position="floating">Year Graduated</IonLabel>
                  <IonInput
                    type="number"
                    value={formData.yearGraduated}
                    onIonChange={(e) => handleInputChange(e, "yearGraduated")}
                    placeholder="Enter year graduated"
                    min="1900"
                    max={new Date().getFullYear()}
                  />
                </IonItem>

                <IonItem lines="none">
                  <IonLabel position="stacked">Additional Education</IonLabel>
                </IonItem>

                {formData.additionalEducation && formData.additionalEducation.length > 0 ? (
                  formData.additionalEducation.map((education, index) => (
                    <IonCard key={index} className="ion-margin-bottom">
                      <IonCardContent>
                        <IonItem>
                          <IonLabel position="floating">Degree</IonLabel>
                          <IonInput
                            value={education.degree}
                            onIonChange={(e) => handleEducationChange(index, "degree", e.detail.value!)}
                            placeholder="Enter degree"
                          />
                        </IonItem>

                        <IonItem>
                          <IonLabel position="floating">School</IonLabel>
                          <IonInput
                            value={education.school}
                            onIonChange={(e) => handleEducationChange(index, "school", e.detail.value!)}
                            placeholder="Enter school"
                          />
                        </IonItem>

                        <IonItem>
                          <IonLabel position="floating">Course</IonLabel>
                          <IonInput
                            value={education.course}
                            onIonChange={(e) => handleEducationChange(index, "course", e.detail.value!)}
                            placeholder="Enter course"
                          />
                        </IonItem>

                        <IonItem>
                          <IonLabel position="floating">Year</IonLabel>
                          <IonInput
                            type="number"
                            value={education.year}
                            onIonChange={(e) => handleEducationChange(index, "year", e.detail.value!)}
                            placeholder="Enter year graduated"
                            min="1900"
                            max={new Date().getFullYear()}
                          />
                        </IonItem>

                        <IonButton fill="clear" color="danger" onClick={() => handleRemoveEducation(index)}>
                          Remove
                        </IonButton>
                      </IonCardContent>
                    </IonCard>
                  ))
                ) : (
                  <IonText color="medium" className="ion-padding">
                    No additional education entries. Click "Add" to include more.
                  </IonText>
                )}

                <IonButton expand="full" onClick={handleAddEducation}>
                  Add Additional Education
                </IonButton>
              </IonList>
            </IonCardContent>
          </IonCard>
        )}

        {segment === "employment" && (
          <>
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Employment Information</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonList>
                <IonItem>
                  <IonLabel position="stacked">                    Date Hired <IonText color="danger">*</IonText>
                  </IonLabel>
                  <IonDatetime
                    value={formData.dateHired}
                    onIonChange={(e) => handleDateChange(e, "dateHired")}
                    presentation="date"
                    max={new Date().toISOString()}
                  />
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked">
                    Position <IonText color="danger">*</IonText>
                  </IonLabel>
                  <IonSelect
                    value={formData.positionId}
                    onIonChange={(e) => handleSelectChange(e, "positionId")}
                    placeholder="Select position"
                  >
                    {positions.map((position) => (
                      <IonSelectOption key={position.id} value={position.id}>
                        {position.title} ({position.type})
                      </IonSelectOption>
                    ))}
                  </IonSelect>
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked">
                    Department <IonText color="danger">*</IonText>
                  </IonLabel>
                  <IonSelect
                    value={formData.departmentId}
                    onIonChange={(e) => handleSelectChange(e, "departmentId")}
                    placeholder="Select department"
                  >
                    {departments.map((department) => (
                      <IonSelectOption key={department.id} value={department.id}>
                        {department.name}
                      </IonSelectOption>
                    ))}
                  </IonSelect>
                </IonItem>

                <IonItem>
                  <IonLabel position="stacked">
                    Office <IonText color="danger">*</IonText>
                  </IonLabel>
                  <IonSelect
                    value={formData.officeId}
                    onIonChange={(e) => handleSelectChange(e, "officeId")}
                    placeholder="Select office"
                    disabled={!formData.departmentId}
                  >
                    {filteredOffices.map((office) => (
                      <IonSelectOption key={office.id} value={office.id}>
                        {office.name} - {office.location}
                      </IonSelectOption>
                    ))}
                  </IonSelect>
                </IonItem>

                {isAcademicPosition() && (
                  <IonItem>
                    <IonLabel position="stacked">
                      Program <IonText color="danger">*</IonText>
                    </IonLabel>
                    <IonSelect
                      value={formData.programId}
                      onIonChange={(e) => handleSelectChange(e, "programId")}
                      placeholder="Select program"
                      disabled={!formData.departmentId}
                    >
                      {filteredPrograms.map((program) => (
                        <IonSelectOption key={program.id} value={program.id}>
                          {program.name}
                        </IonSelectOption>
                      ))}
                    </IonSelect>
                  </IonItem>
                )}
              </IonList>
            </IonCardContent>
          </IonCard>
      
          {/* Leave Package Section */}
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Leave Package</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonList>
                <IonItem>
                  <IonLabel position="stacked">Package Type</IonLabel>
                  <IonSelect
                    value={packageMode}
                    onIonChange={(e) => {
                      setPackageMode(e.detail.value as PackageMode)
                      setSelectedPackageId(null)
                      setCustomLeaveItems([])
                    }}
                  >
                    <IonSelectOption value="predefined">Predefined Package</IonSelectOption>
                    <IonSelectOption value="custom">Custom Package</IonSelectOption>
                    <IonSelectOption value="none">No Package</IonSelectOption>
                  </IonSelect>
                </IonItem>

                {/* Predefined package selector */}
                {packageMode === "predefined" && (
                  <>
                    <IonItem>
                      <IonLabel position="stacked">Select Leave Package</IonLabel>
                      <IonSelect
                        value={selectedPackageId}
                        onIonChange={(e) => setSelectedPackageId(e.detail.value)}
                        placeholder="Choose a package"
                      >
                        {leavePackages.map((pkg) => (
                          <IonSelectOption key={pkg.id} value={pkg.id}>
                            {pkg.name}
                          </IonSelectOption>
                        ))}
                      </IonSelect>
                    </IonItem>

                    {/* Show selected package details */}
                    {selectedPackageId && (() => {
                      const pkg = leavePackages.find(p => p.id === selectedPackageId)
                      if (!pkg) return null
                      return (
                        <div className="ion-padding-start ion-padding-end ion-padding-bottom">
                          {pkg.description && (
                            <IonText color="medium">
                              <p style={{ fontSize: '0.85rem', marginBottom: '8px' }}>{pkg.description}</p>
                            </IonText>
                          )}
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {pkg.items.map((item, idx) => (
                              <IonChip key={idx} color="primary" outline>
                                <IonLabel>{item.leave_type_display}: {item.quantity} days</IonLabel>
                              </IonChip>
                            ))}
                          </div>
                        </div>
                      )
                    })()}
                  </>
                )}

                {/* Custom package builder */}
                {packageMode === "custom" && (
                  <>
                    {customLeaveItems.map((item, index) => (
                      <IonCard key={index} style={{ margin: '8px 0' }}>
                        <IonCardContent style={{ padding: '8px 16px' }}>
                          <IonItem lines="none">
                            <IonLabel position="stacked">Leave Type</IonLabel>
                            <IonSelect
                              value={item.leave_type}
                              placeholder="Select leave type"
                              onIonChange={(e) => {
                                const updated = [...customLeaveItems]
                                updated[index] = { ...updated[index], leave_type: e.detail.value }
                                setCustomLeaveItems(updated)
                              }}
                            >
                              {leaveTypes
                                .filter(lt => !customLeaveItems.some((ci, ci_idx) => ci_idx !== index && ci.leave_type === lt.value))
                                .map((lt) => (
                                  <IonSelectOption key={lt.value} value={lt.value}>
                                    {lt.label}
                                  </IonSelectOption>
                                ))}
                            </IonSelect>
                          </IonItem>
                          <IonItem lines="none">
                            <IonLabel position="stacked">Days</IonLabel>
                            <IonInput
                              type="number"
                              min="0"
                              value={item.quantity}
                              onIonChange={(e) => {
                                const updated = [...customLeaveItems]
                                updated[index] = { ...updated[index], quantity: Number(e.detail.value) || 0 }
                                setCustomLeaveItems(updated)
                              }}
                              placeholder="Number of days"
                            />
                          </IonItem>
                          <IonButton
                            fill="clear"
                            color="danger"
                            size="small"
                            onClick={() => {
                              const updated = customLeaveItems.filter((_, i) => i !== index)
                              setCustomLeaveItems(updated)
                            }}
                          >
                            Remove
                          </IonButton>
                        </IonCardContent>
                      </IonCard>
                    ))}

                    <IonButton
                      expand="full"
                      fill="outline"
                      onClick={() => setCustomLeaveItems([...customLeaveItems, { leave_type: '', quantity: 0 }])}
                      disabled={customLeaveItems.length >= leaveTypes.length}
                    >
                      Add Leave Type
                    </IonButton>
                  </>
                )}

                {packageMode === "none" && (
                  <div className="ion-padding">
                    <IonText color="medium">
                      <p style={{ fontSize: '0.85rem' }}>No leave credits will be assigned to this employee on creation.</p>
                    </IonText>
                  </div>
                )}
              </IonList>
            </IonCardContent>
          </IonCard>
          </>
        )}

        <IonGrid>
          <IonRow>
            <IonCol>
              {segment !== "personal" && (
                <IonButton expand="block" onClick={handlePrevious} disabled={isLoading}>
                  Previous
                </IonButton>
              )}
            </IonCol>
            <IonCol>
              {segment !== "employment" ? (
                <IonButton expand="block" onClick={handleNext} disabled={isLoading}>
                  Next
                </IonButton>
              ) : (
                <IonButton expand="block" onClick={handleSubmit} color="success" disabled={isLoading}>
                  Save Employee
                </IonButton>
              )}
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>

      <IonToast
        isOpen={showToast}
        onDidDismiss={() => setShowToast(false)}
        message={toastMessage}
        duration={2000}
        color={toastColor}
      />

      <IonLoading isOpen={isLoading} message="Saving employee data..." spinner="circles" />

      <IonAlert
        isOpen={showAlert}
        onDidDismiss={() => setShowAlert(false)}
        header="Error"
        message={alertMessage}
        buttons={["OK"]}
      />
    </IonPage>
  )
}

export default EmployeeAdd
