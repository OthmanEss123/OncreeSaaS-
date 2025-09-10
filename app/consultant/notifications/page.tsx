"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Bell, Briefcase, Clock, Calendar, Check, Trash2, AlertCircle } from "lucide-react"

const mockConsultantNotifications = [
  {
    id: "N001",
    title: "New Mission Assignment",
    message: "You have been assigned to the 'API Integration' project for ConnectApp.",
    type: "mission",
    date: "2024-02-01T10:30:00",
    read: false,
    priority: "high",
  },
  {
    id: "N002",
    title: "Time Entry Reminder",
    message: "Don't forget to log your hours for yesterday's work on Website Redesign Project.",
    type: "time",
    date: "2024-01-31T09:00:00",
    read: false,
    priority: "medium",
  },
  {
    id: "N003",
    title: "Absence Request Approved",
    message: "Your vacation request for February 15-19 has been approved.",
    type: "absence",
    date: "2024-01-30T14:15:00",
    read: true,
    priority: "low",
  },
  {
    id: "N004",
    title: "Mission Deadline Approaching",
    message: "The 'E-commerce Platform' project deadline is in 3 days.",
    type: "deadline",
    date: "2024-01-29T16:45:00",
    read: true,
    priority: "high",
  },
]

export default function ConsultantNotifications() {
  const [notifications, setNotifications] = useState(mockConsultantNotifications)

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "mission":
        return <Briefcase className="h-4 w-4" />
      case "time":
        return <Clock className="h-4 w-4" />
      case "absence":
        return <Calendar className="h-4 w-4" />
      case "deadline":
        return <AlertCircle className="h-4 w-4" />
      default:
        return <Bell className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "mission":
        return "bg-blue-50 text-blue-700 border-blue-200"
      case "time":
        return "bg-green-50 text-green-700 border-green-200"
      case "absence":
        return "bg-purple-50 text-purple-700 border-purple-200"
      case "deadline":
        return "bg-red-50 text-red-700 border-red-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "destructive"
      case "medium":
        return "secondary"
      case "low":
        return "outline"
      default:
        return "outline"
    }
  }

  const markAsRead = (id: string) => {
    setNotifications(notifications.map((notif) => (notif.id === id ? { ...notif, read: true } : notif)))
  }

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter((notif) => notif.id !== id))
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map((notif) => ({ ...notif, read: true })))
  }

  const unreadCount = notifications.filter((notif) => !notif.read).length
  const highPriorityCount = notifications.filter((notif) => notif.priority === "high" && !notif.read).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Notifications</h1>
          <p className="text-muted-foreground">Stay updated with your work activities and assignments</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={markAllAsRead}>
            <Check className="mr-2 h-4 w-4" />
            Mark All as Read
          </Button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Unread</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unreadCount}</div>
            <p className="text-xs text-muted-foreground">Require attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Priority</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{highPriorityCount}</div>
            <p className="text-xs text-muted-foreground">Urgent items</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notifications.length}</div>
            <p className="text-xs text-muted-foreground">All notifications</p>
          </CardContent>
        </Card>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Bell className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No notifications</h3>
              <p className="text-muted-foreground text-center">
                You're all caught up! New notifications will appear here.
              </p>
            </CardContent>
          </Card>
        ) : (
          notifications.map((notification) => (
            <Card key={notification.id} className={`${!notification.read ? "border-primary/50 bg-primary/5" : ""}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`p-2 rounded-lg border ${getTypeColor(notification.type)}`}>
                      {getTypeIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold">{notification.title}</h3>
                        {!notification.read && <Badge variant="secondary">New</Badge>}
                        <Badge variant={getPriorityColor(notification.priority)} className="text-xs">
                          {notification.priority}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground mb-2">{notification.message}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(notification.date).toLocaleDateString()} at{" "}
                        {new Date(notification.date).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!notification.read && (
                      <Button variant="ghost" size="sm" onClick={() => markAsRead(notification.id)}>
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => deleteNotification(notification.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
