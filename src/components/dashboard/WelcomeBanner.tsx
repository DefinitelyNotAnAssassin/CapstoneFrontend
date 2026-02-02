"use client"

import React from "react"

interface WelcomeBannerProps {
  userName: string
  position: string
  department: string
  employeeId: string
  profileImage?: string
  isHRUser: boolean
  isOnline: boolean
}

export const WelcomeBanner: React.FC<WelcomeBannerProps> = ({
  userName,
  position,
  department,
  employeeId,
  profileImage,
  isHRUser,
  isOnline,
}) => {
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good Morning"
    if (hour < 18) return "Good Afternoon"
    return "Good Evening"
  }

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 rounded-2xl p-6 mb-6 shadow-lg">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* User Info Section */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <img
              src={profileImage || "/placeholder.svg"}
              alt="User avatar"
              className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-white/30 object-cover shadow-md"
            />
            <span 
              className={`absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-white ${
                isOnline ? 'bg-green-400' : 'bg-gray-400'
              }`}
            />
          </div>
          <div className="text-white">
            <p className="text-sm text-blue-100 mb-1">{currentDate}</p>
            <h1 className="text-2xl md:text-3xl font-bold mb-1">
              {getGreeting()}, <span className="text-yellow-300">{userName}!</span>
            </h1>
            <p className="text-blue-100 text-sm md:text-base">{position}</p>
            <p className="text-blue-200 text-xs md:text-sm">{department}</p>
          </div>
        </div>

        {/* Status Badges */}
        <div className="flex flex-wrap items-center gap-2 md:flex-col md:items-end">
          {isHRUser && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-yellow-400 text-yellow-900 shadow-sm">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              HR Admin
            </span>
          )}
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold shadow-sm ${
            isOnline 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            <span className={`w-2 h-2 rounded-full mr-1.5 ${isOnline ? 'bg-green-500' : 'bg-gray-500'}`} />
            {isOnline ? "Online" : "Offline"}
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white backdrop-blur-sm">
            ID: {employeeId}
          </span>
        </div>
      </div>
    </div>
  )
}
