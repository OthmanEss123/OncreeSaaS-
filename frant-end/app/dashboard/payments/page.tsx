"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusIcon, CreditCardIcon, BanknotesIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline"
import { useState } from "react"

const mockPayments = [
  { id: "PAY-001", invoiceId: "INV-001", client: "Acme Corp", amount: "€5,250", date: "2024-01-15", method: "Card" },
  {
    id: "PAY-002",
    invoiceId: "INV-004",
    client: "Innovation Labs",
    amount: "€4,500",
    date: "2024-01-18",
    method: "Bank Transfer",
  },
  {
    id: "PAY-003",
    invoiceId: "INV-007",
    client: "TechStart Inc",
    amount: "€2,100",
    date: "2024-01-12",
    method: "Cash",
  },
  {
    id: "PAY-004",
    invoiceId: "INV-009",
    client: "Global Solutions",
    amount: "€7,200",
    date: "2024-01-20",
    method: "Bank Transfer",
  },
  {
    id: "PAY-005",
    invoiceId: "INV-011",
    client: "Digital Agency",
    amount: "€3,800",
    date: "2024-01-22",
    method: "Card",
  },
  { id: "PAY-006", invoiceId: "INV-013", client: "StartupXYZ", amount: "€1,950", date: "2024-01-25", method: "Cash" },
]

export default function Payments() {
  const [searchTerm, setSearchTerm] = useState("")
  const [methodFilter, setMethodFilter] = useState("all")
  const [isModalOpen, setIsModalOpen] = useState(false)

  const filteredPayments = mockPayments.filter((payment) => {
    const matchesSearch =
      payment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.invoiceId.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesMethod = methodFilter === "all" || payment.method.toLowerCase().replace(" ", "-") === methodFilter
    return matchesSearch && matchesMethod
  })

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "Card":
        return <CreditCardIcon className="h-4 w-4" />
      case "Bank Transfer":
        return <BanknotesIcon className="h-4 w-4" />
      case "Cash":
        return <BanknotesIcon className="h-4 w-4" />
      default:
        return <CreditCardIcon className="h-4 w-4" />
    }
  }

  const getMethodColor = (method: string) => {
    switch (method) {
      case "Card":
        return "bg-blue-100 text-blue-800"
      case "Bank Transfer":
        return "bg-green-100 text-green-800"
      case "Cash":
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Payments</h1>
            <p className="text-muted-foreground">Track and manage payment records</p>
          </div>

          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <PlusIcon className="h-4 w-4 mr-2" />
                Register Payment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Register New Payment</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="invoice">Facture</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner facture" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="inv-001">INV-001 - Acme Corp (€5,250)</SelectItem>
                      <SelectItem value="inv-002">INV-002 - TechStart Inc (€3,800)</SelectItem>
                      <SelectItem value="inv-003">INV-003 - Global Solutions (€7,200)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input id="amount" placeholder="€0.00" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="method">Payment Method</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="card">Card</SelectItem>
                      <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                      <SelectItem value="cash">Cash</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="date">Payment Date</Label>
                  <Input id="date" type="date" />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsModalOpen(false)}>Register Payment</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex gap-4 items-center flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search payments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={methodFilter} onValueChange={setMethodFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Methods</SelectItem>
              <SelectItem value="card">Card</SelectItem>
              <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
              <SelectItem value="cash">Cash</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">This Month</Button>
          <Button variant="outline">Export</Button>
        </div>

        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-medium text-foreground">Payment ID</th>
                  <th className="text-left p-4 font-medium text-foreground">Facture #</th>
                  <th className="text-left p-4 font-medium text-foreground">Client</th>
                  <th className="text-left p-4 font-medium text-foreground">Amount</th>
                  <th className="text-left p-4 font-medium text-foreground">Date</th>
                  <th className="text-left p-4 font-medium text-foreground">Method</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map((payment, index) => (
                  <tr key={payment.id} className={index % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                    <td className="p-4">
                      <div className="font-medium text-foreground">{payment.id}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-primary">{payment.invoiceId}</div>
                    </td>
                    <td className="p-4 text-muted-foreground">{payment.client}</td>
                    <td className="p-4 font-medium text-foreground">{payment.amount}</td>
                    <td className="p-4 text-muted-foreground">{payment.date}</td>
                    <td className="p-4">
                      <Badge className={`${getMethodColor(payment.method)} flex items-center gap-1 w-fit`}>
                        {getMethodIcon(payment.method)}
                        {payment.method}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-sm text-muted-foreground">Total Received</div>
            <div className="text-2xl font-bold text-green-600">€24,800</div>
            <div className="text-xs text-muted-foreground">This month</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-sm text-muted-foreground">Pending Payments</div>
            <div className="text-2xl font-bold text-orange-600">€8,900</div>
            <div className="text-xs text-muted-foreground">Awaiting confirmation</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-sm text-muted-foreground">Average Payment</div>
            <div className="text-2xl font-bold text-foreground">€4,133</div>
            <div className="text-xs text-muted-foreground">Per transaction</div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
