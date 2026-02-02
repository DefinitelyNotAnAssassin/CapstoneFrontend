"use client"

import React from "react"
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PointElement,
  LineElement,
  Filler,
} from "chart.js"
import { Doughnut, Bar, Line } from "react-chartjs-2"

// Register ChartJS components
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  PointElement,
  LineElement,
  Filler
)

interface LeaveCredit {
  leave_type_name: string
  total_credits: number
  used_credits: number
  remaining_credits: number
}

interface LeaveChartsProps {
  leaveCreditsBreakdown: LeaveCredit[]
  totalCredits: number
  usedCredits: number
  remainingBalance: number
  approvedRequests: number
  rejectedRequests: number
  pendingRequests?: number
}

export const LeaveBalanceChart: React.FC<{
  leaveCreditsBreakdown: LeaveCredit[]
  totalCredits: number
  usedCredits: number
}> = ({ leaveCreditsBreakdown, totalCredits, usedCredits }) => {
  const data = {
    labels: ["Used", "Remaining"],
    datasets: [
      {
        data: [usedCredits, totalCredits - usedCredits],
        backgroundColor: ["#EF4444", "#10B981"],
        borderColor: ["#DC2626", "#059669"],
        borderWidth: 2,
        hoverOffset: 4,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: "70%",
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.raw
            const percentage = ((value / totalCredits) * 100).toFixed(1)
            return `${context.label}: ${value} days (${percentage}%)`
          },
        },
      },
    },
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
        Leave Balance Overview
      </h3>
      <div className="h-64 relative">
        <Doughnut data={data} options={options} />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-800">{Math.round((totalCredits - usedCredits) * 10) / 10}</p>
            <p className="text-sm text-gray-500">Days Left</p>
          </div>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="text-center p-3 bg-green-50 rounded-lg">
          <p className="text-2xl font-bold text-green-600">{totalCredits}</p>
          <p className="text-xs text-gray-600">Total Credits</p>
        </div>
        <div className="text-center p-3 bg-red-50 rounded-lg">
          <p className="text-2xl font-bold text-red-600">{usedCredits}</p>
          <p className="text-xs text-gray-600">Used Credits</p>
        </div>
      </div>
    </div>
  )
}

export const LeaveTypeBreakdownChart: React.FC<{
  leaveCreditsBreakdown: LeaveCredit[]
}> = ({ leaveCreditsBreakdown }) => {
  const colors = [
    { bg: "rgba(59, 130, 246, 0.8)", border: "rgb(59, 130, 246)" },
    { bg: "rgba(16, 185, 129, 0.8)", border: "rgb(16, 185, 129)" },
    { bg: "rgba(245, 158, 11, 0.8)", border: "rgb(245, 158, 11)" },
    { bg: "rgba(239, 68, 68, 0.8)", border: "rgb(239, 68, 68)" },
    { bg: "rgba(139, 92, 246, 0.8)", border: "rgb(139, 92, 246)" },
    { bg: "rgba(236, 72, 153, 0.8)", border: "rgb(236, 72, 153)" },
  ]

  const data = {
    labels: leaveCreditsBreakdown.map((credit) => credit.leave_type_name),
    datasets: [
      {
        label: "Used",
        data: leaveCreditsBreakdown.map((credit) => credit.used_credits),
        backgroundColor: "rgba(239, 68, 68, 0.8)",
        borderColor: "rgb(239, 68, 68)",
        borderWidth: 1,
        borderRadius: 4,
      },
      {
        label: "Remaining",
        data: leaveCreditsBreakdown.map((credit) => credit.remaining_credits),
        backgroundColor: "rgba(16, 185, 129, 0.8)",
        borderColor: "rgb(16, 185, 129)",
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        stacked: true,
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
          },
        },
      },
      y: {
        stacked: true,
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          font: {
            size: 11,
          },
        },
      },
    },
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
      },
    },
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <span className="w-3 h-3 bg-green-500 rounded-full"></span>
        Leave Credits by Type
      </h3>
      <div className="h-64">
        <Bar data={data} options={options} />
      </div>
    </div>
  )
}

export const RequestStatusChart: React.FC<{
  approvedRequests: number
  rejectedRequests: number
  pendingRequests?: number
}> = ({ approvedRequests, rejectedRequests, pendingRequests = 0 }) => {
  const total = approvedRequests + rejectedRequests + pendingRequests

  const data = {
    labels: ["Approved", "Rejected", "Pending"],
    datasets: [
      {
        data: [approvedRequests, rejectedRequests, pendingRequests],
        backgroundColor: [
          "rgba(16, 185, 129, 0.8)",
          "rgba(239, 68, 68, 0.8)",
          "rgba(245, 158, 11, 0.8)",
        ],
        borderColor: [
          "rgb(16, 185, 129)",
          "rgb(239, 68, 68)",
          "rgb(245, 158, 11)",
        ],
        borderWidth: 2,
        hoverOffset: 4,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom" as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const value = context.raw
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0
            return `${context.label}: ${value} (${percentage}%)`
          },
        },
      },
    },
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <span className="w-3 h-3 bg-amber-500 rounded-full"></span>
        Request Status Distribution
      </h3>
      <div className="h-64">
        <Doughnut data={data} options={options} />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="p-2 bg-green-50 rounded-lg">
          <p className="text-lg font-bold text-green-600">{approvedRequests}</p>
          <p className="text-xs text-gray-600">Approved</p>
        </div>
        <div className="p-2 bg-red-50 rounded-lg">
          <p className="text-lg font-bold text-red-600">{rejectedRequests}</p>
          <p className="text-xs text-gray-600">Rejected</p>
        </div>
        <div className="p-2 bg-amber-50 rounded-lg">
          <p className="text-lg font-bold text-amber-600">{pendingRequests}</p>
          <p className="text-xs text-gray-600">Pending</p>
        </div>
      </div>
    </div>
  )
}

// Monthly trend line chart (mock data for now)
export const MonthlyTrendChart: React.FC = () => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
  
  const data = {
    labels: months,
    datasets: [
      {
        label: "Leave Days Taken",
        data: [2, 1, 3, 0, 2, 1],
        fill: true,
        backgroundColor: "rgba(59, 130, 246, 0.1)",
        borderColor: "rgb(59, 130, 246)",
        tension: 0.4,
        pointBackgroundColor: "rgb(59, 130, 246)",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 7,
      },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          stepSize: 1,
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
      },
    },
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-shadow">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
        Leave Trend (Last 6 Months)
      </h3>
      <div className="h-48">
        <Line data={data} options={options} />
      </div>
    </div>
  )
}
