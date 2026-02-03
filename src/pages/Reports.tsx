"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import {
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonToast,
  IonSegment,
  IonSegmentButton,
  IonLabel,
  IonLoading,
} from "@ionic/react"
import { Chart, registerables } from "chart.js"
import "./Reports.css"

// Import components
import EmployeeReport from "../components/reports/EmployeeReport"
import LeaveReport from "../components/reports/LeaveReport"
import DepartmentReport from "../components/reports/DepartmentReport"
import ReportFilters from "../components/reports/ReportFilters"
import ReportExport from "../components/reports/ReportExport"

// Import utilities
import { generatePDF } from "../utils/PDFGenerator"
import { MainLayout } from "@components/layout"

// Register Chart.js components
Chart.register(...registerables)

const Reports: React.FC = () => {
  // State for report type
  const [reportType, setReportType] = useState<"employee" | "leave" | "department">("employee")

  // Common state for filters
  const [departments, setDepartments] = useState<string[]>([
    "Human Resources",
    "Information Technology",
    "Finance",
    "Marketing",
    "Operations",
  ])
  const [selectedDepartment, setSelectedDepartment] = useState<string>("All")
  const [startDate, setStartDate] = useState<string>("2023-01-01")
  const [endDate, setEndDate] = useState<string>("2023-12-31")
  const [orientation, setOrientation] = useState<"portrait" | "landscape">("portrait")

  // PDF generation state
  const [isGeneratingPDF, setIsGeneratingPDF] = useState<boolean>(false)
  const [showToast, setShowToast] = useState<boolean>(false)
  const [toastMessage, setToastMessage] = useState<string>("")
  const [toastColor, setToastColor] = useState<"success" | "danger">("success")

  // Sample data for reports
  const [employeeData, setEmployeeData] = useState<any[]>([])
  const [leaveData, setLeaveData] = useState<any[]>([])
  const [departmentData, setDepartmentData] = useState<any[]>([])

  // Refs for report content
  const employeeReportRef = useRef<HTMLDivElement>(null)
  const leaveReportRef = useRef<HTMLDivElement>(null)
  const departmentReportRef = useRef<HTMLDivElement>(null)

  // Load sample data
  useEffect(() => {
    // This would typically be an API call
    setEmployeeData([
      { id: 1, name: "John Doe", department: "Human Resources", position: "HR Manager", status: "Active" },
      {
        id: 2,
        name: "Jane Smith",
        department: "Information Technology",
        position: "Software Developer",
        status: "Active",
      },
      { id: 3, name: "Robert Johnson", department: "Finance", position: "Financial Analyst", status: "Active" },
      { id: 4, name: "Emily Davis", department: "Marketing", position: "Marketing Specialist", status: "On Leave" },
      { id: 5, name: "Michael Wilson", department: "Operations", position: "Operations Manager", status: "Active" },
    ])

    setLeaveData([
      {
        id: 1,
        employee: "John Doe",
        department: "Human Resources",
        type: "Vacation",
        startDate: "2023-03-15",
        endDate: "2023-03-20",
        status: "Approved",
      },
      {
        id: 2,
        employee: "Jane Smith",
        department: "Information Technology",
        type: "Sick Leave",
        startDate: "2023-02-10",
        endDate: "2023-02-12",
        status: "Approved",
      },
      {
        id: 3,
        employee: "Robert Johnson",
        department: "Finance",
        type: "Personal Leave",
        startDate: "2023-04-05",
        endDate: "2023-04-07",
        status: "Pending",
      },
      {
        id: 4,
        employee: "Emily Davis",
        department: "Marketing",
        type: "Maternity Leave",
        startDate: "2023-01-15",
        endDate: "2023-04-15",
        status: "Approved",
      },
      {
        id: 5,
        employee: "Michael Wilson",
        department: "Operations",
        type: "Vacation",
        startDate: "2023-05-20",
        endDate: "2023-05-27",
        status: "Approved",
      },
    ])

    setDepartmentData([
      { name: "Human Resources", employeeCount: 12, budget: 500000, leaveUtilization: 0.75 },
      { name: "Information Technology", employeeCount: 25, budget: 1200000, leaveUtilization: 0.62 },
      { name: "Finance", employeeCount: 15, budget: 800000, leaveUtilization: 0.58 },
      { name: "Marketing", employeeCount: 18, budget: 950000, leaveUtilization: 0.8 },
      { name: "Operations", employeeCount: 30, budget: 1500000, leaveUtilization: 0.7 },
    ])
  }, [])

  // Filter data based on selected department
  const filteredEmployeeData =
    selectedDepartment === "All" ? employeeData : employeeData.filter((emp) => emp.department === selectedDepartment)

  const filteredLeaveData =
    selectedDepartment === "All" ? leaveData : leaveData.filter((leave) => leave.department === selectedDepartment)

  const filteredDepartmentData =
    selectedDepartment === "All" ? departmentData : departmentData.filter((dept) => dept.name === selectedDepartment)

  // Handle PDF export
  const handleExportPDF = async () => {
    setIsGeneratingPDF(true)

    try {
      let title = ""
      let content: HTMLElement | null = null

      // Get the appropriate report element based on report type
      if (reportType === "employee") {
        title = "Employee Status Report"
        content = employeeReportRef.current
      } else if (reportType === "leave") {
        title = "Leave Management Report"
        content = leaveReportRef.current
      } else {
        title = "Department Analysis Report"
        content = departmentReportRef.current
      }

      await generatePDF({
        title,
        content,
        orientation,
        startDate,
        endDate,
        department: selectedDepartment,
      })

      setToastMessage("PDF generated successfully!")
      setToastColor("success")
    } catch (error) {
      console.error("PDF generation error:", error)
      setToastMessage("Error generating PDF. Please try again.")
      setToastColor("danger")
    } finally {
      setIsGeneratingPDF(false)
      setShowToast(true)
    }
  }

  return (
    <MainLayout title="Reports">
        <IonGrid>
          <IonRow>
            <IonCol size="12">
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>Report Type</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <IonSegment value={reportType} onIonChange={(e) => setReportType(e.detail.value as any)}>
                    <IonSegmentButton value="employee">
                      <IonLabel>Employee</IonLabel>
                    </IonSegmentButton>
                    <IonSegmentButton value="leave">
                      <IonLabel>Leave</IonLabel>
                    </IonSegmentButton>
                    <IonSegmentButton value="department">
                      <IonLabel>Department</IonLabel>
                    </IonSegmentButton>
                  </IonSegment>
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>

          <IonRow>
            <IonCol size="12" sizeMd="4">
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle>Report Filters</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  <ReportFilters
                    departments={departments}
                    selectedDepartment={selectedDepartment}
                    startDate={startDate}
                    endDate={endDate}
                    orientation={orientation}
                    onDepartmentChange={setSelectedDepartment}
                    onStartDateChange={setStartDate}
                    onEndDateChange={setEndDate}
                    onOrientationChange={setOrientation}
                  />

                  <div className="ion-padding-top">
                    <ReportExport isGenerating={isGeneratingPDF} onExport={handleExportPDF} />
                  </div>
                </IonCardContent>
              </IonCard>
            </IonCol>

            <IonCol size="12" sizeMd="8">
              {reportType === "employee" && (
                <div id="employee-report" ref={employeeReportRef}>
                  <EmployeeReport employeeData={filteredEmployeeData} startDate={startDate} endDate={endDate} />
                </div>
              )}

              {reportType === "leave" && (
                <div id="leave-report" ref={leaveReportRef}>
                  <LeaveReport leaveData={filteredLeaveData} startDate={startDate} endDate={endDate} />
                </div>
              )}

              {reportType === "department" && (
                <div id="department-report" ref={departmentReportRef}>
                  <DepartmentReport departmentData={filteredDepartmentData} startDate={startDate} endDate={endDate} />
                </div>
              )}
            </IonCol>
          </IonRow>
        </IonGrid>

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
          color={toastColor}
          position="bottom"
        />

        <IonLoading isOpen={isGeneratingPDF} message={"Generating PDF..."} duration={10000} />
    </MainLayout>
  )
}

export default Reports
