"use client"

import { useState, useEffect, useCallback } from "react"
import auditService from "../services/AuditService"
import type { AuditLog, AuditModule, AuditAction } from "../data/audit-data"

interface AuditFilters {
  startDate?: string
  endDate?: string
  userId?: string
  username?: string
  action?: AuditAction
  module?: AuditModule
  status?: "success" | "failure"
}

export const useAudit = () => {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<AuditFilters>({})

  // Fetch logs based on current filters
  const fetchLogs = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const fetchedLogs = await auditService.getFilteredLogs(filters)
      setLogs(fetchedLogs)
    } catch (err) {
      setError("Failed to fetch audit logs")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [filters])

  // Log a new audit event
  const logEvent = useCallback(
    async (
      userId: string,
      username: string,
      action: AuditAction,
      module: AuditModule,
      details: string,
      ipAddress = "127.0.0.1",
      status: "success" | "failure" = "success",
    ) => {
      try {
        await auditService.logEvent({
          userId,
          username,
          action,
          module,
          details,
          ipAddress,
          status,
        })

        // Refresh logs if we're viewing the latest
        if (Object.keys(filters).length === 0) {
          fetchLogs()
        }
      } catch (err) {
        console.error("Failed to log audit event:", err)
      }
    },
    [filters, fetchLogs],
  )

  // Update filters and refetch logs
  const updateFilters = useCallback((newFilters: AuditFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
    }))
  }, [])

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters({})
  }, [])

  // Export current logs to CSV
  const exportToCSV = useCallback(() => {
    const csvContent = auditService.exportToCSV(logs)
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")

    link.setAttribute("href", url)
    link.setAttribute("download", `audit_logs_${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"

    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }, [logs])

  // Load logs on initial render and when filters change
  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  return {
    logs,
    loading,
    error,
    filters,
    updateFilters,
    clearFilters,
    logEvent,
    exportToCSV,
    refetch: fetchLogs,
  }
}
