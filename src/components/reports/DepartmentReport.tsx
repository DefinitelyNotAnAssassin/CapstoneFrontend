"use client"

import type React from "react"
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonGrid, IonRow, IonCol } from "@ionic/react"
import { Bar } from "react-chartjs-2"

interface DepartmentReportProps {
  departmentData: any[]
  startDate: string
  endDate: string
}

const DepartmentReport: React.FC<DepartmentReportProps> = ({ departmentData, startDate, endDate }) => {
  // Employee count chart data
  const employeeCountChartData = {
    labels: departmentData.map((dept) => dept.name),
    datasets: [
      {
        label: "Number of Employees",
        data: departmentData.map((dept) => dept.employeeCount),
        backgroundColor: "rgba(54, 162, 235, 0.6)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
    ],
  }

  // Budget allocation chart data
  const budgetChartData = {
    labels: departmentData.map((dept) => dept.name),
    datasets: [
      {
        label: "Budget Allocation ($)",
        data: departmentData.map((dept) => dept.budget),
        backgroundColor: "rgba(255, 99, 132, 0.6)",
        borderColor: "rgba(255, 99, 132, 1)",
        borderWidth: 1,
      },
    ],
  }

  // Leave utilization chart data
  const leaveUtilizationChartData = {
    labels: departmentData.map((dept) => dept.name),
    datasets: [
      {
        label: "Leave Utilization Rate",
        data: departmentData.map((dept) => dept.leaveUtilization * 100), // Convert to percentage
        backgroundColor: departmentData.map((dept) => {
          // Color based on utilization rate
          if (dept.leaveUtilization < 0.6) return "rgba(75, 192, 192, 0.6)" // Green for low
          if (dept.leaveUtilization < 0.8) return "rgba(255, 206, 86, 0.6)" // Yellow for medium
          return "rgba(255, 99, 132, 0.6)" // Red for high
        }),
        borderColor: departmentData.map((dept) => {
          if (dept.leaveUtilization < 0.6) return "rgba(75, 192, 192, 1)"
          if (dept.leaveUtilization < 0.8) return "rgba(255, 206, 86, 1)"
          return "rgba(255, 99, 132, 1)"
        }),
        borderWidth: 1,
      },
    ],
  }

  // Calculate total employees and budget
  const totalEmployees = departmentData.reduce((sum, dept) => sum + dept.employeeCount, 0)
  const totalBudget = departmentData.reduce((sum, dept) => sum + dept.budget, 0)
  const avgLeaveUtilization =
    departmentData.reduce((sum, dept) => sum + dept.leaveUtilization, 0) / departmentData.length

  return (
    <div className="department-report">
      <IonCard>
        <IonCardHeader>
          <IonCardTitle>Department Analysis Report</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <p>
            This report provides an analysis of departments, including employee counts, budget allocation, and leave
            utilization for the period from {startDate} to {endDate}.
          </p>
        </IonCardContent>
      </IonCard>

      <IonGrid>
        <IonRow>
          <IonCol size="12">
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Department Summary</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <div className="summary-stats">
                  <div className="stat-item">
                    <div className="stat-value">{departmentData.length}</div>
                    <div className="stat-label">Total Departments</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value">{totalEmployees}</div>
                    <div className="stat-label">Total Employees</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value">${(totalBudget / 1000000).toFixed(2)}M</div>
                    <div className="stat-label">Total Budget</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-value">{(avgLeaveUtilization * 100).toFixed(1)}%</div>
                    <div className="stat-label">Avg. Leave Utilization</div>
                  </div>
                </div>
              </IonCardContent>
            </IonCard>
          </IonCol>
        </IonRow>

        <IonRow>
          <IonCol size="12" sizeMd="6">
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Employee Distribution</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <div style={{ height: "300px" }}>
                  <Bar
                    data={employeeCountChartData}
                    options={{
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false,
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          title: {
                            display: true,
                            text: "Number of Employees",
                          },
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
                <IonCardTitle>Budget Allocation</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <div style={{ height: "300px" }}>
                  <Bar
                    data={budgetChartData}
                    options={{
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false,
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          title: {
                            display: true,
                            text: "Budget ($)",
                          },
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
                <IonCardTitle>Leave Utilization by Department</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <div style={{ height: "300px" }}>
                  <Bar
                    data={leaveUtilizationChartData}
                    options={{
                      maintainAspectRatio: false,
                      plugins: {
                        legend: {
                          display: false,
                        },
                      },
                      scales: {
                        y: {
                          beginAtZero: true,
                          max: 100,
                          title: {
                            display: true,
                            text: "Utilization Rate (%)",
                          },
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
                <IonCardTitle>Department Details</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <div className="table-container">
                  <table className="department-table">
                    <thead>
                      <tr>
                        <th>Department</th>
                        <th>Employees</th>
                        <th>Budget</th>
                        <th>Budget per Employee</th>
                        <th>Leave Utilization</th>
                      </tr>
                    </thead>
                    <tbody>
                      {departmentData.map((dept) => (
                        <tr key={dept.name}>
                          <td>{dept.name}</td>
                          <td>{dept.employeeCount}</td>
                          <td>${dept.budget.toLocaleString()}</td>
                          <td>${Math.round(dept.budget / dept.employeeCount).toLocaleString()}</td>
                          <td>
                            <div className="utilization-bar">
                              <div
                                className="utilization-fill"
                                style={{
                                  width: `${dept.leaveUtilization * 100}%`,
                                  backgroundColor:
                                    dept.leaveUtilization < 0.6
                                      ? "#4dc9c9"
                                      : dept.leaveUtilization < 0.8
                                        ? "#ffce56"
                                        : "#ff6384",
                                }}
                              ></div>
                              <span className="utilization-text">{(dept.leaveUtilization * 100).toFixed(1)}%</span>
                            </div>
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

export default DepartmentReport
