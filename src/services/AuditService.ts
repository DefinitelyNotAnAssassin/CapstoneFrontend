import { 
  collection, 
  doc, 
  getDocs, 
  addDoc, 
  query, 
  where, 
  orderBy,
  serverTimestamp,
  Timestamp
} from "firebase/firestore";
import { db } from "../config/firebase";
import { type AuditLog, type AuditModule, type AuditAction } from "../data/audit-data";

class AuditService {
  private collectionName = "audit_logs";

  // Get all audit logs
  async getAllLogs(): Promise<AuditLog[]> {
    try {
      const querySnapshot = await getDocs(
        query(collection(db, this.collectionName), orderBy("timestamp", "desc"))
      );
      
      const logs: AuditLog[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        logs.push({
          id: doc.id,
          ...data,
          // Convert Firestore Timestamp to ISO string
          timestamp: data.timestamp?.toDate?.()?.toISOString() || data.timestamp,
        } as AuditLog);
      });
      
      return logs;
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      throw new Error("Failed to fetch audit logs");
    }
  }

  // Get logs filtered by various criteria
  async getFilteredLogs(filters: {
    startDate?: string
    endDate?: string
    userId?: string
    username?: string
    action?: AuditAction
    module?: AuditModule
    status?: "success" | "failure"
  }): Promise<AuditLog[]> {
    try {
      let q = query(collection(db, this.collectionName));

      // Apply filters
      if (filters.userId) {
        q = query(q, where("userId", "==", filters.userId));
      }
      
      if (filters.username) {
        q = query(q, where("username", "==", filters.username));
      }
      
      if (filters.action) {
        q = query(q, where("action", "==", filters.action));
      }
      
      if (filters.module) {
        q = query(q, where("module", "==", filters.module));
      }
      
      if (filters.status) {
        q = query(q, where("status", "==", filters.status));
      }

      // Add ordering
      q = query(q, orderBy("timestamp", "desc"));

      const querySnapshot = await getDocs(q);
      const logs: AuditLog[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const log: AuditLog = {
          id: doc.id,
          ...data,
          // Convert Firestore Timestamp to ISO string
          timestamp: data.timestamp?.toDate?.()?.toISOString() || data.timestamp,
        } as AuditLog;
        
        // Apply date filters client-side since Firestore has limitations with complex queries
        if (filters.startDate && new Date(log.timestamp) < new Date(filters.startDate)) {
          return;
        }
        
        if (filters.endDate && new Date(log.timestamp) > new Date(filters.endDate)) {
          return;
        }
        
        logs.push(log);
      });
      
      return logs;
    } catch (error) {
      console.error("Error fetching filtered audit logs:", error);
      throw new Error("Failed to fetch filtered audit logs");
    }
  }

  // Log a new audit event
  async logEvent(event: Omit<AuditLog, "id" | "timestamp">): Promise<AuditLog> {
    try {
      const auditData = {
        ...event,
        timestamp: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, this.collectionName), auditData);
      
      // Return the created log with the generated ID
      const newLog: AuditLog = {
        id: docRef.id,
        timestamp: new Date().toISOString(), // Use current time for immediate return
        ...event,
      };

      return newLog;
    } catch (error) {
      console.error("Error logging audit event:", error);
      // Don't throw error for audit logging to avoid breaking main functionality
      return {
        id: this.generateId(),
        timestamp: new Date().toISOString(),
        ...event,
      } as AuditLog;
    }
  }

  // Generate a unique ID for fallback cases
  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
  }

  // Export logs to CSV
  exportToCSV(logs: AuditLog[]): string {
    const headers = ["ID", "Timestamp", "User ID", "Username", "Action", "Module", "Details", "IP Address", "Status"];
    const csvRows = [
      headers.join(","),
      ...logs.map((log) =>
        [
          log.id,
          log.timestamp,
          log.userId,
          log.username,
          log.action,
          log.module,
          `"${log.details.replace(/"/g, '""')}"`, // Escape quotes in CSV
          log.ipAddress,
          log.status,
        ].join(","),
      ),
    ];

    return csvRows.join("\n");
  }

  // Clear logs older than a certain date (for maintenance)
  async clearOldLogs(olderThan: Date): Promise<number> {
    try {
      // In a real implementation, you would delete documents from Firestore
      // For now, just return 0 as this would require batch operations
      console.log("Clear old logs feature not implemented for Firestore");
      return 0;
    } catch (error) {
      console.error("Error clearing old logs:", error);
      throw new Error("Failed to clear old logs");
    }
  }

  // Get log counts by time period (for dashboard metrics)
  async getLogCounts(period: "day" | "week" | "month"): Promise<{ [key: string]: number }> {
    try {
      const logs = await this.getAllLogs();
      const counts: { [key: string]: number } = {};
      
      const now = new Date();
      const periodStart = new Date();
      
      switch (period) {
        case "day":
          periodStart.setDate(now.getDate() - 7); // Last 7 days
          break;
        case "week":
          periodStart.setDate(now.getDate() - 28); // Last 4 weeks
          break;
        case "month":
          periodStart.setMonth(now.getMonth() - 12); // Last 12 months
          break;
      }
      
      logs.forEach((log) => {
        const logDate = new Date(log.timestamp);
        if (logDate >= periodStart) {
          let key: string;
          
          switch (period) {
            case "day":
              key = logDate.toISOString().split('T')[0]; // YYYY-MM-DD
              break;
            case "week":
              const weekStart = new Date(logDate);
              weekStart.setDate(logDate.getDate() - logDate.getDay());
              key = weekStart.toISOString().split('T')[0];
              break;
            case "month":
              key = `${logDate.getFullYear()}-${String(logDate.getMonth() + 1).padStart(2, '0')}`;
              break;
            default:
              key = logDate.toISOString().split('T')[0];
          }
          
          counts[key] = (counts[key] || 0) + 1;
        }
      });
      
      return counts;
    } catch (error) {
      console.error("Error getting log counts:", error);
      throw new Error("Failed to get log counts");
    }
  }
}

// Create a singleton instance
const auditService = new AuditService();
export default auditService;
