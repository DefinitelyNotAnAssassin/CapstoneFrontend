"use client"

import type React from "react"
import { IonCard, IonCardHeader, IonCardTitle, IonCardContent, IonGrid, IonRow, IonCol } from "@ionic/react"
import { Pie, Bar } from "react-chartjs-2"

interface LeaveReportProps {
  leaveData: any[]
  startDate: string
  endDate: string
}

const LeaveReport: React.FC<LeaveReportProps> = ({ leaveData, startDate, endDate }) => {
  // Calculate leave type distribution
  const leaveTypes = [...new Set(leaveData.map((leave) => leave.type))]
  const leaveTypeCounts = leaveTypes.map((type) => leaveData.filter((leave) => leave.type === type).length)

  // Calculate leave status distribution
  const leaveStatuses = [...new Set(leaveData.map((leave) => leave.status))]
  const leaveStatusCounts = leaveStatuses.map((status) => leaveData.filter((leave) => leave.status === status).length)

  // Leave type chart data
  const leaveTypeChartData = {
    labels: leaveTypes,
    datasets: [
      {
        label: "Leave Requests by Type",
        data: leaveTypeCounts,
        backgroundColor: [
          "rgba(54, 162, 235, 0.6)",
          "rgba(255, 99, 132, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(75, 192, 192, 0.6)",
        ],
        borderColor: [
          "rgba(54, 162, 235, 1)",
          "rgba(255, 99, 132, 1)",
          "rgba(255, 206, 86, 1)",
          "rgba(75, 192, 192, 1)",
        ],
        borderWidth: 1,
      },
    ],
  }

  // Leave status chart data
  const leaveStatusChartData = {
    labels: leaveStatuses,
    datasets: [
      {
        label: "Leave Requests by Status",
        data: leaveStatusCounts,
        backgroundColor: ["rgba(255, 206, 86, 0.6)", "rgba(75, 192, 192, 0.6)", "rgba(255, 99, 132, 0.6)"],
        borderColor: ["rgba(255, 206, 86, 1)", "rgba(75, 192, 192, 1)", "rgba(255, 99, 132, 1)"],
        borderWidth: 1,
      },
    ],
  }

  // Calculate department leave distribution
  const departments = [...new Set(leaveData.map((leave) => leave.department))]
  const departmentLeaveCounts = departments.map((dept) => leaveData.filter((leave) => leave.department === dept).length)

  // Department leave chart data
  const departmentLeaveChartData = {
    labels: departments,
    datasets: [
      {
        label: "Leave Requests by Department",
        data: departmentLeaveCounts,
        backgroundColor: "rgba(54, 162, 235, 0.6)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
    ],
  }

  return (
    <div className="leave-report">
      <IonCard>
        <IonCardHeader>
          <IonCardTitle>Leave Management Report</IonCardTitle>
        </IonCardHeader>
        <IonCardContent>
          <p>
            This report shows the distribution of leave requests by type, status, and department for the period from{" "}
            {startDate} to {endDate}.
          </p>
        </IonCardContent>
      </IonCard>

      <IonGrid>
        <IonRow>
          <IonCol size="12" sizeMd="6">
            <IonCard>
              <IonCardHeader>
                <IonCardTitle>Leave Type Distribution</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <div style={{ height: "300px" }}>
                  <Pie
                    data={leaveTypeChartData}
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
                <IonCardTitle>Leave Status Distribution</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <div style={{ height: "300px" }}>
                  <Pie
                    data={leaveStatusChartData}
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
                <IonCardTitle>Department Leave Distribution</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <div style={{ height: "300px" }}>
                  <Bar
                    data={departmentLeaveChartData}
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
                <IonCardTitle>Leave Request List</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <div className="table-container">
                  <table className="leave-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Employee</th>
                        <th>Department</th>
                        <th>Type</th>
                        <th>Start Date</th>
                        <th>End Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaveData.map((leave) => (
                        <tr key={leave.id}>
                          <td>{leave.id}</td>
                          <td>{leave.employee}</td>
                          <td>{leave.department}</td>
                          <td>{leave.type}</td>
                          <td>{leave.startDate}</td>
                          <td>{leave.endDate}</td>
                          <td>
                            <span className={`status-badge ${leave.status.toLowerCase()}`}>{leave.status}</span>
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

export default LeaveReport
