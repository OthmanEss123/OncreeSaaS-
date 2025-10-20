"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  InformationCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XCircleIcon,
  BellIcon,
} from "@heroicons/react/24/outline"
import { useState } from "react"

const mockNotifications = [
  {
    id: 1,
    type: "success",
    message: "Paiement reçu pour Facture INV-001 d'Acme Corp",
    timestamp: "2024-01-25 14:30",
    read: false,
  },
  {
    id: 2,
    type: "warning",
    message: "Facture INV-003 en retard de 15 jours",
    timestamp: "2024-01-25 10:15",
    read: false,
  },
  {
    id: 3,
    type: "info",
    message: "New consultant Alice Johnson has been added to the system",
    timestamp: "2024-01-24 16:45",
    read: true,
  },
  {
    id: 4,
    type: "error",
    message: "Failed to send invoice INV-005 to client email",
    timestamp: "2024-01-24 09:20",
    read: false,
  },
  {
    id: 5,
    type: "success",
    message: "Mission 'E-commerce Platform' has been completed successfully",
    timestamp: "2024-01-23 18:00",
    read: true,
  },
  {
    id: 6,
    type: "info",
    message: "Weekly time tracking report is ready for review",
    timestamp: "2024-01-23 12:00",
    read: true,
  },
  {
    id: 7,
    type: "warning",
    message: "Consultant David Wilson has exceeded 40 hours this week",
    timestamp: "2024-01-22 17:30",
    read: false,
  },
  {
    id: 8,
    type: "success",
    message: "New client 'Innovation Labs' has been successfully onboarded",
    timestamp: "2024-01-22 11:15",
    read: true,
  },
]

export default function Notifications() {
  const [notifications, setNotifications] = useState(mockNotifications)
  const [filter, setFilter] = useState("all")

  const unreadCount = notifications.filter((n) => !n.read).length

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })))
  }

  const markAsRead = (id: number) => {
    setNotifications(notifications.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "unread") return !notification.read
    if (filter === "read") return notification.read
    if (filter !== "all") return notification.type === filter
    return true
  })

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircleIcon className="h-5 w-5 text-green-600" />
      case "warning":
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-600" />
      case "error":
        return <XCircleIcon className="h-5 w-5 text-red-600" />
      case "info":
      default:
        return <InformationCircleIcon className="h-5 w-5 text-blue-600" />
    }
  }

  const getNotificationColor = (type: string) => {
    switch (type) {
      case "success":
        return "border-l-green-500 bg-green-50"
      case "warning":
        return "border-l-yellow-500 bg-yellow-50"
      case "error":
        return "border-l-red-500 bg-red-50"
      case "info":
      default:
        return "border-l-blue-500 bg-blue-50"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "success":
        return "bg-green-100 text-green-800"
      case "warning":
        return "bg-yellow-100 text-yellow-800"
      case "error":
        return "bg-red-100 text-red-800"
      case "info":
      default:
        return "bg-blue-100 text-blue-800"
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
              <BellIcon className="h-6 w-6" />
              Notifications
              {unreadCount > 0 && <Badge className="bg-red-500 text-white">{unreadCount}</Badge>}
            </h1>
            <p className="text-muted-foreground">Stay updated with system notifications</p>
          </div>

          {unreadCount > 0 && (
            <Button onClick={markAllAsRead} variant="outline">
              Mark all as read
            </Button>
          )}
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>
            All ({notifications.length})
          </Button>
          <Button variant={filter === "unread" ? "default" : "outline"} size="sm" onClick={() => setFilter("unread")}>
            Unread ({unreadCount})
          </Button>
          <Button variant={filter === "success" ? "default" : "outline"} size="sm" onClick={() => setFilter("success")}>
            Success
          </Button>
          <Button variant={filter === "warning" ? "default" : "outline"} size="sm" onClick={() => setFilter("warning")}>
            Warning
          </Button>
          <Button variant={filter === "error" ? "default" : "outline"} size="sm" onClick={() => setFilter("error")}>
            Error
          </Button>
          <Button variant={filter === "info" ? "default" : "outline"} size="sm" onClick={() => setFilter("info")}>
            Info
          </Button>
        </div>

        <div className="space-y-3">
          {filteredNotifications.length === 0 ? (
            <div className="bg-card border border-border rounded-lg p-8 text-center">
              <p className="text-muted-foreground">No notifications found</p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`bg-card border border-border rounded-lg p-4 border-l-4 ${getNotificationColor(notification.type)} ${
                  !notification.read ? "shadow-sm" : "opacity-75"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">{getNotificationIcon(notification.type)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={`text-sm ${!notification.read ? "font-medium text-foreground" : "text-muted-foreground"}`}
                      >
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <Badge className={getTypeColor(notification.type)}>{notification.type}</Badge>
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                            className="text-xs"
                          >
                            Mark as read
                          </Button>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{notification.timestamp}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-sm text-muted-foreground">Total Notifications</div>
            <div className="text-2xl font-bold text-foreground">{notifications.length}</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-sm text-muted-foreground">Unread</div>
            <div className="text-2xl font-bold text-red-600">{unreadCount}</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-sm text-muted-foreground">Success</div>
            <div className="text-2xl font-bold text-green-600">
              {notifications.filter((n) => n.type === "success").length}
            </div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-sm text-muted-foreground">Warnings</div>
            <div className="text-2xl font-bold text-yellow-600">
              {notifications.filter((n) => n.type === "warning").length}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
