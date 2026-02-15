"use client"

import React from "react"
import { IonSpinner } from "@ionic/react"

interface LoadingStateProps {
  message?: string
  submessage?: string
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = "Loading dashboard...",
  submessage = "Initializing your session...",
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh]">
      <div className="bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center max-w-sm w-full">
        {/* Animated spinner container */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-blue-200 rounded-full animate-ping opacity-20"></div>
          <div className="relative bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full p-4">
            <IonSpinner name="crescent" className="text-white w-8 h-8" />
          </div>
        </div>
        
        {/* Loading text */}
        <h2 className="text-xl font-semibold text-gray-800 mb-2 text-center">
          {message}
        </h2>
        {submessage && (
          <p className="text-sm text-gray-500 text-center">
            {submessage}
          </p>
        )}

        {/* Loading bar */}
        <div className="w-full mt-6 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full animate-pulse" 
               style={{ width: '60%', animation: 'loading 1.5s ease-in-out infinite' }}>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes loading {
          0% { width: 0%; }
          50% { width: 80%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  )
}
