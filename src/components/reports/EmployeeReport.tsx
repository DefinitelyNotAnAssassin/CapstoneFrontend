"use client"

import type React from "react"
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonGrid, IonRow, IonCol } from "@ionic/react"
import { Pie } from "react-chartjs-2"

interface EmployeeReportProps {
  employeeData: any[]
  startDate: string
  endDate: string
}

const EmployeeReport: React.FC<EmployeeReportProps> = ({ employeeData, startDate, endDate }) => {
  // Calculate department distribution
  const departments = [...new Set(employeeData.map((emp) => emp.department))]
  const departmentCounts = departments.map((dept) => employeeData.filter((emp) => emp.department === dept).length)

  // Calculate status distribution
  const statuses = [...new Set(employeeData.map((emp) => emp.status))]
  const statusCounts = statuses.map((status) => employeeData.filter((emp) => emp.status === status).length)

  // Department distribution chart data
  const departmentChartData = {
    labels: departments,
    datasets: [
      {
        label: "Employees by Department",
        data: departmentCounts,
        backgroundColor: [
          "rgba(54, 162, 235, 0.6)",
          "rgba(255, 99, 132, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(75, 192, 192, 0.6)",
          "rgba(153, 102, 255, 0.6)",
        ],
        borderColor: [
          "rgba(54, 162, 235, 1)",
          "rgba(255, 99, 132, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
          "rgba(153, 102, 255, 1)",
        ],
        borderWidth: 1,
      },
    ],
  }

  // Status distribution chart data
  const statusChartData = {
    labels: statuses,
    datasets: [
      {
        label: "Employees by Status",
        data: statusCounts,
        backgroundColor: ["rgba(75, 192, 192, 0.6)", "rgba(255, 99, 132, 0.6)"],
        borderColor: ["rgba(75, 192, 192, 1)", "rgba(255, 99, 132, 1)"],
        borderWidth: 1,
      },
    ],
  }

  return (
    <div className="employee-report">
      <IonCard>
        <IonCardHeader>
          <IonCardTitle>Employee Status Report</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <p>
            This report shows the distribution of employees by department and status for the period from {startDate} to{" "}
            {endDate}.
          </p>
        </IonCardContent>
      </IonCard>

      <IonGrid>
        <IonRow>
          <IonCol size="12" sizeMd="6">
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Department Distribution</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <div style={{ height: "300px" }}>
                  <Pie
                    data={departmentChartData}
                    options={{
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: "bottom",
                        },
                      },
                    }}
                  />
                </div>
              </IonCardContent>
            </IonCard>
          </IonCol>

          <IonCol size="12" sizeMd="6">
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Status Distribution</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <div style={{ height: "300px" }}>
                  <Pie
                    data={statusChartData}
                    options={{
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          position: "bottom",
                        },
                      },
                    }}
                  />
                </div>
              </IonCardContent>
            </IonCard>
          </IonCol>
        </IonRow>

        <IonRow>
          <IonCol>
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Employee List</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <div className="table-container">
                  <table className="employee-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Department</th>
                        <th>Position</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employeeData.map((employee) => (
                        <tr key={employee.id}>
                          <td>{employee.id}</td>
                          <td>{employee.name}</td>
                          <td>{employee.department}</td>
                          <td>{employee.position}</td>
                          <td>
                            <span className={`status-badge ${employee.status.toLowerCase()}`}>{employee.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </IonCardContent>
            </IonCard>
          </IonCol>
        </IonRow>
      </IonGrid>
    </div>
  )
}

export default EmployeeReport
