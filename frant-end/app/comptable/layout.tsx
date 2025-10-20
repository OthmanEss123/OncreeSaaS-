import type React from "react"
import { RoleLayout } from "@/components/role-layout"
import { 
  Calculator, 
  BarChart3, 
  Receipt, 
  CreditCard
} from "lucide-react"

export default function ComptableLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const sidebarItems = [
    {
      icon: <Calculator className="h-4 w-4" />,
      label: "Tableau de bord",
      href: "/comptable",
      active: true
    },
    {
      icon: <Receipt className="h-4 w-4" />,
      label: "Factures",
      href: "/comptable/factures"
    },
    {
      icon: <CreditCard className="h-4 w-4" />,
      label: "Paiements",
      href: "/comptable/paiements"
    },
    {
      icon: <BarChart3 className="h-4 w-4" />,
      label: "Rapports",
      href: "/comptable/rapports"
    }
  ]

  return (
    <RoleLayout 
      sidebarItems={sidebarItems}
      userRole="comptable"
      userName="Comptable"
      userEmail="comptable@oncree.com"
    >
      {children}
    </RoleLayout>
  )
}

