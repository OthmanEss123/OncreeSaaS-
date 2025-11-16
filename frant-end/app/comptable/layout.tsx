"use client"

import type React from "react"
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { RoleLayout } from '@/components/role-layout'
import { ComptableAPI } from '@/lib/api'
import type { Comptable } from '@/lib/type'
import { LayoutDashboard, Calendar, Receipt } from 'lucide-react'

export default function ComptableLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [comptable, setComptable] = useState<Comptable | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadComptable = async () => {
      try {
        const comptableData = await ComptableAPI.me()
        setComptable(comptableData)
      } catch (error) {
        console.error('Erreur lors du chargement des données du comptable:', error)
      } finally {
        setLoading(false)
      }
    }

    loadComptable()
  }, [])

  const sidebarItems = [
    {
      icon: <LayoutDashboard className="h-4 w-4" />,
      label: "Tableau de Bord",
      href: "/comptable",
      active: pathname === "/comptable"
    },
    {
      icon: <Calendar className="h-4 w-4" />,
      label: "Travaux",
      href: "/comptable/travaux",
      active: pathname === "/comptable/travaux"
    },
    {
      icon: <Receipt className="h-4 w-4" />,
      label: "Factures",
      href: "/comptable/factures",
      active: pathname?.startsWith("/comptable/factures")
    }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Chargement...</p>
      </div>
    )
  }

  return (
    <RoleLayout
      sidebarItems={sidebarItems}
      userRole="comptable"
      userName={comptable?.name || "Comptable"}
      userEmail={comptable?.email || ""}
    >
      {children}
    </RoleLayout>
  )
}

