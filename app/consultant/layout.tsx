"use client"

import type React from "react"

import { RoleLayout } from "@/components/role-layout"
import { LayoutDashboard, Briefcase, Clock, Calendar, Bell } from "lucide-react"

const consultantSidebarItems = [
  {
    icon: <LayoutDashboard className="h-5 w-5" />,
    label: "Dashboard",
    href: "/consultant",
    active: true,
  },
  {
    icon: <Briefcase className="h-5 w-5" />,
    label: "Missions",
    href: "/consultant/missions",
  },
  {
    icon: <Clock className="h-5 w-5" />,
    label: "Time Tracking",
    href: "/consultant/time-tracking",
  },
  {
    icon: <Calendar className="h-5 w-5" />,
    label: "Absences",
    href: "/consultant/absences",
  },
  {
    icon: <Bell className="h-5 w-5" />,
    label: "Notifications",
    href: "/consultant/notifications",
  },
]

export default function ConsultantLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RoleLayout
      sidebarItems={consultantSidebarItems}
      userRole="consultant"
      userName="Sarah Johnson"
      userEmail="sarah@oncreesaas.com"
    >
      {children}
    </RoleLayout>
  )
}
