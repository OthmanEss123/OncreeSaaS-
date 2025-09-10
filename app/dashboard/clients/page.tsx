"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Plus, Search, Mail, Phone, Building } from "lucide-react"
import { useState } from "react"

export default function Clients() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const clients = [
    {
      id: 1,
      name: "John Smith",
      email: "john.smith@acmecorp.com",
      company: "Acme Corp",
      phone: "+1 (555) 123-4567",
    },
    {
      id: 2,
      name: "Sarah Johnson",
      email: "sarah.j@techstart.com",
      company: "TechStart Inc",
      phone: "+1 (555) 234-5678",
    },
    {
      id: 3,
      name: "Michael Brown",
      email: "m.brown@dataflow.com",
      company: "DataFlow Ltd",
      phone: "+1 (555) 345-6789",
    },
    {
      id: 4,
      name: "Emily Davis",
      email: "emily.davis@securebank.com",
      company: "SecureBank",
      phone: "+1 (555) 456-7890",
    },
    {
      id: 5,
      name: "Robert Wilson",
      email: "r.wilson@cloudtech.com",
      company: "CloudTech",
      phone: "+1 (555) 567-8901",
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Clients</h1>
            <p className="text-muted-foreground">Manage your client relationships</p>
          </div>
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Client
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Client</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="clientName">Client Name</Label>
                  <Input id="clientName" placeholder="Enter client name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientEmail">Email</Label>
                  <Input id="clientEmail" type="email" placeholder="Enter email address" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientCompany">Company</Label>
                  <Input id="clientCompany" placeholder="Enter company name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientPhone">Phone</Label>
                  <Input id="clientPhone" placeholder="Enter phone number" />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button className="flex-1">Add Client</Button>
                  <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setIsModalOpen(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search clients..."
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-md bg-background"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  All Clients
                </Button>
                <Button variant="outline" size="sm">
                  Active
                </Button>
                <Button variant="outline" size="sm">
                  Inactive
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Client Name</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Email</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Company</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Phone</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client) => (
                    <tr key={client.id} className="border-b border-border hover:bg-muted/50">
                      <td className="py-3 px-4 font-medium">{client.name}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          {client.email}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Building className="h-4 w-4" />
                          {client.company}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          {client.phone}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                          <Button variant="outline" size="sm">
                            View
                          </Button>
                          <Button variant="outline" size="sm">
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
