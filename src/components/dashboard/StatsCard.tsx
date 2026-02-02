"use client"

import React from "react"
import { IonIcon } from "@ionic/react"

interface StatCard {
  title: string
  value: number | string
  icon: string
  color: string
  description?: string
}

interface StatsCardsProps {
  stats: StatCard[]
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  const getColorClasses = (color: string): { bg: string; iconBg: string; text: string; border: string } => {
    const colorMap: Record<string, { bg: string; iconBg: string; text: string; border: string }> = {
      primary: {
        bg: "bg-blue-50",
        iconBg: "bg-blue-500",
        text: "text-blue-600",
        border: "border-blue-200"
      },
      success: {
        bg: "bg-green-50",
        iconBg: "bg-green-500",
        text: "text-green-600",
        border: "border-green-200"
      },
      danger: {
        bg: "bg-red-50",
        iconBg: "bg-red-500",
        text: "text-red-600",
        border: "border-red-200"
      },
      warning: {
        bg: "bg-amber-50",
        iconBg: "bg-amber-500",
        text: "text-amber-600",
        border: "border-amber-200"
      },
      secondary: {
        bg: "bg-purple-50",
        iconBg: "bg-purple-500",
        text: "text-purple-600",
        border: "border-purple-200"
      },
    }
    return colorMap[color] || colorMap.primary
  }

  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
        <span className="w-1 h-6 bg-blue-500 rounded-full"></span>
        Leave Summary
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {stats.map((stat, index) => {
          const colors = getColorClasses(stat.color)
          return (
            <div
              key={index}
              className={`${colors.bg} ${colors.border} border rounded-xl p-5 transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`${colors.iconBg} p-3 rounded-lg shadow-sm`}>
                  <IonIcon icon={stat.icon} className="text-white text-xl" />
                </div>
                <span className={`${colors.text} text-xs font-medium px-2 py-1 rounded-full ${colors.bg}`}>
                  {stat.description}
                </span>
              </div>
              <div className="mt-2">
                <h3 className={`text-3xl font-bold ${colors.text} mb-1`}>
                  {stat.value}
                </h3>
                <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
