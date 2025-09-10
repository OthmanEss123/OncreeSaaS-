"use client"

import { Label } from "@/components/ui/label"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Download, Eye, CreditCard, Calendar } from "lucide-react"
import { mockClientData } from "@/lib/mock-data"

export default function ClientInvoices() {
  const [invoices] = useState(mockClientData.invoices)
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Paid":
        return "default"
      case "Pending":
        return "secondary"
      case "Overdue":
        return "destructive"
      default:
        return "outline"
    }
  }

  const totalPending = invoices
    .filter((inv) => inv.status === "Pending" || inv.status === "Overdue")
    .reduce((sum, inv) => sum + inv.amount, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Invoices</h1>
          <p className="text-muted-foreground">View and manage your project invoices</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoices.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Amount</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalPending.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Awaiting payment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Paid This Month</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$7,500</div>
            <p className="text-xs text-muted-foreground">February 2024</p>
          </CardContent>
        </Card>
      </div>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice History</CardTitle>
          <CardDescription>All your project invoices and payment status</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice ID</TableHead>
                <TableHead>Mission</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Issue Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.id}</TableCell>
                  <TableCell>{invoice.missionTitle}</TableCell>
                  <TableCell>${invoice.amount.toLocaleString()}</TableCell>
                  <TableCell>{new Date(invoice.issueDate).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(invoice.dueDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusColor(invoice.status)}>{invoice.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedInvoice(invoice)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Invoice Details - {invoice.id}</DialogTitle>
                            <DialogDescription>Complete invoice information</DialogDescription>
                          </DialogHeader>
                          {selectedInvoice && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-sm font-medium">Mission</Label>
                                  <p className="text-sm text-muted-foreground">{selectedInvoice.missionTitle}</p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Amount</Label>
                                  <p className="text-sm text-muted-foreground">
                                    ${selectedInvoice.amount.toLocaleString()}
                                  </p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Issue Date</Label>
                                  <p className="text-sm text-muted-foreground">
                                    {new Date(selectedInvoice.issueDate).toLocaleDateString()}
                                  </p>
                                </div>
                                <div>
                                  <Label className="text-sm font-medium">Due Date</Label>
                                  <p className="text-sm text-muted-foreground">
                                    {new Date(selectedInvoice.dueDate).toLocaleDateString()}
                                  </p>
                                </div>
                              </div>
                              {selectedInvoice.status !== "Paid" && (
                                <Button className="w-full">
                                  <CreditCard className="mr-2 h-4 w-4" />
                                  Pay Now
                                </Button>
                              )}
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                      {invoice.status !== "Paid" && (
                        <Button size="sm">
                          <CreditCard className="mr-2 h-4 w-4" />
                          Pay
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
