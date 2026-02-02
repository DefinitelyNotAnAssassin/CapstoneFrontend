"use client"

import React from "react"
import {
  IonMenu,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonIcon,
  IonLabel,
  IonListHeader,
  IonBadge,
  IonMenuToggle,
  IonFooter,
  IonButton,
  IonAvatar,
} from "@ionic/react"
import { logOutOutline, chevronForwardOutline } from "ionicons/icons"
import { useLocation } from "react-router-dom"
import { useRole } from "@/contexts/RoleContext"
import { navigationConfig, isNavItemVisible, type NavItem, type NavSection } from "./navigation.config"
import "./Sidebar.css"

interface SidebarProps {
  contentId: string
  pendingApprovals?: number
  onLogout: () => void
  userName?: string
  userRole?: string
  userAvatar?: string
}

export const Sidebar: React.FC<SidebarProps> = ({
  contentId,
  pendingApprovals = 0,
  onLogout,
  userName = "User",
  userRole = "Employee",
  userAvatar,
}) => {
  const location = useLocation()
  const { userRole: roleData, hasPermission, employee } = useRole()

  const isHRUser = employee?.isHR || roleData?.level === -1 || roleData?.title === "HR Administrator"
  const canApprove = roleData?.canApprove || false

  // Check if a permission exists
  const checkPermission = (permission: string): boolean => {
    return hasPermission(permission as any)
  }

  // Get badge for an item
  const getBadge = (item: NavItem): number | undefined => {
    if (item.id === "leave-approval" && pendingApprovals > 0) {
      return pendingApprovals
    }
    return undefined
  }

  // Check if current path matches item path
  const isActive = (path: string): boolean => {
    return location.pathname === path
  }

  // Filter visible sections and items
  const getVisibleSections = (): NavSection[] => {
    return navigationConfig
      .map((section) => ({
        ...section,
        items: section.items.filter((item) =>
          isNavItemVisible(item, checkPermission, isHRUser, canApprove)
        ),
      }))
      .filter((section) => section.items.length > 0)
  }

  const visibleSections = getVisibleSections()

  return (
    <IonMenu contentId={contentId} type="overlay" className="sidebar-menu shadow " swipeGesture={true}>
      <IonHeader className="sidebar-header">
        <IonToolbar color="white">
        <img src="sdca-logo.png" alt="SDCA Logo"  />
          <IonTitle className="flex flex-col items-center text-center ">
              <h1 className="text-3xl ">SDCA HRIS</h1>
              <h1 className="logo-subtitle">Leave Management</h1>
          </IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="sidebar-content">
        {/* User Profile Section */}
        <div className="sidebar-profile">
          <IonAvatar className="profile-avatar">
            {userAvatar ? (
              <img src={userAvatar} alt={userName} />
            ) : (
              <div className="avatar-placeholder">
                {userName.charAt(0).toUpperCase()}
              </div>
            )}
          </IonAvatar>
          <div className="profile-info">
            <h3 className="profile-name">{userName}</h3>
            <p className="profile-role">{userRole}</p>
          </div>
        </div>

        {/* Navigation Items */}
        <div className="sidebar-nav">
          {visibleSections.map((section, sectionIndex) => (
            <div key={section.title} className="nav-section">
              <IonListHeader className="nav-section-header">
                <IonLabel>{section.title}</IonLabel>
              </IonListHeader>
              <IonList className="nav-list" lines="none">
                {section.items.map((item) => {
                  const badge = getBadge(item)
                  const active = isActive(item.path)
                  
                  return (
                    <IonMenuToggle key={item.id} autoHide={false}>
                      <IonItem
                        routerLink={item.path}
                        routerDirection="none"
                        className={`nav-item ${active ? "nav-item-active" : ""}`}
                        detail={false}
                      >
                        <IonIcon
                          icon={item.icon}
                          slot="start"
                          className="nav-icon"
                        />
                        <IonLabel className="nav-label">{item.title}</IonLabel>
                        {badge && badge > 0 && (
                          <IonBadge color="danger" className="nav-badge">
                            {badge}
                          </IonBadge>
                        )}
                        <IonIcon
                          icon={chevronForwardOutline}
                          slot="end"
                          className="nav-arrow"
                        />
                      </IonItem>
                    </IonMenuToggle>
                  )
                })}
              </IonList>
              {sectionIndex < visibleSections.length - 1 && (
                <div className="nav-divider" />
              )}
            </div>
          ))}
        </div>
      </IonContent>

      <IonFooter className="sidebar-footer">
        <IonToolbar>
          <IonButton
            expand="block"
            fill="clear"
            className="logout-button"
            onClick={onLogout}
          >
            <IonIcon icon={logOutOutline} slot="start" />
            <IonLabel>Sign Out</IonLabel>
          </IonButton>
        </IonToolbar>
      </IonFooter>
    </IonMenu>
  )
}

export default Sidebar
