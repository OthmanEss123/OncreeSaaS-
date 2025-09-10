"use client"

import type React from "react"

import { RoleLayout } from "@/components/role-layout"
import { LayoutDashboard, FileText, CreditCard, Bell, Briefcase } from "lucide-react"

const clientSidebarItems = [
  {
    icon: <LayoutDashboard className="h-5 w-5" />,
    label: "Dashboard",
    href: "/client",
    active: true,
  },
  {
    icon: <Briefcase className="h-5 w-5" />,
    label: "Missions",
    href: "/client/missions",
  },
  {
    icon: <FileText className="h-5 w-5" />,
    label: "Invoices",
    href: "/client/invoices",
  },
  {
    icon: <CreditCard className="h-5 w-5" />,
    label: "Payments",
    href: "/client/payments",
  },
  {
    icon: <Bell className="h-5 w-5" />,
    label: "Notifications",
    href: "/client/notifications",
  },
]

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <RoleLayout sidebarItems={clientSidebarItems} userRole="client" userName="John Smith" userEmail="john@company.com">
      {children}
    </RoleLayout>
  )
}
