"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusIcon, EyeIcon, ArrowDownTrayIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline"
import { useState } from "react"

const mockInvoices = [
  { id: "INV-001", client: "Acme Corp", amount: "€5,250", status: "Payé", dueDate: "2024-01-15" },
  { id: "INV-002", client: "TechStart Inc", amount: "€3,800", status: "En Attente", dueDate: "2024-01-20" },
  { id: "INV-003", client: "Global Solutions", amount: "€7,200", status: "En Retard", dueDate: "2024-01-10" },
  { id: "INV-004", client: "Innovation Labs", amount: "€4,500", status: "Payé", dueDate: "2024-01-18" },
  { id: "INV-005", client: "Digital Agency", amount: "€6,100", status: "En Attente", dueDate: "2024-01-25" },
  { id: "INV-006", client: "StartupXYZ", amount: "€2,900", status: "En Retard", dueDate: "2024-01-08" },
]

export default function Invoices() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredInvoices = mockInvoices.filter((invoice) => {
    const matchesSearch =
      invoice.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.client.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || 
      (statusFilter === "paid" && invoice.status === "Payé") ||
      (statusFilter === "pending" && invoice.status === "En Attente") ||
      (statusFilter === "overdue" && invoice.status === "En Retard")
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Payé":
        return "bg-green-100 text-green-800"
      case "En Attente":
        return "bg-yellow-100 text-yellow-800"
      case "En Retard":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Factures</h1>
            <p className="text-muted-foreground">Gérer et suivre vos factures</p>
          </div>

          <Button className="bg-primary hover:bg-primary/90">
            <PlusIcon className="h-4 w-4 mr-2" />
            Créer Facture
          </Button>
        </div>

        <div className="flex gap-4 items-center flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher factures..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous Statuts</SelectItem>
              <SelectItem value="paid">Payé</SelectItem>
              <SelectItem value="pending">En Attente</SelectItem>
              <SelectItem value="overdue">En Retard</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">Ce Mois</Button>
          <Button variant="outline">Exporter</Button>
        </div>

        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-medium text-foreground">Facture #</th>
                  <th className="text-left p-4 font-medium text-foreground">Client</th>
                  <th className="text-left p-4 font-medium text-foreground">Montant</th>
                  <th className="text-left p-4 font-medium text-foreground">Statut</th>
                  <th className="text-left p-4 font-medium text-foreground">Date d'Échéance</th>
                  <th className="text-left p-4 font-medium text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvoices.map((invoice, index) => (
                  <tr key={invoice.id} className={index % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                    <td className="p-4">
                      <div className="font-medium text-foreground">{invoice.id}</div>
                    </td>
                    <td className="p-4 text-muted-foreground">{invoice.client}</td>
                    <td className="p-4 font-medium text-foreground">{invoice.amount}</td>
                    <td className="p-4">
                      <Badge className={getStatusColor(invoice.status)}>{invoice.status}</Badge>
                    </td>
                    <td className="p-4 text-muted-foreground">{invoice.dueDate}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <EyeIcon className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <ArrowDownTrayIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-sm text-muted-foreground">Total En Attente</div>
            <div className="text-2xl font-bold text-foreground">€12,800</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-sm text-muted-foreground">Payé Ce Mois</div>
            <div className="text-2xl font-bold text-green-600">€9,750</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-sm text-muted-foreground">En Retard</div>
            <div className="text-2xl font-bold text-red-600">€10,100</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-sm text-muted-foreground">Factures Brouillon</div>
            <div className="text-2xl font-bold text-foreground">3</div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
