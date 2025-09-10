"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline"
import { useState } from "react"

const mockConsultants = [
  {
    id: 1,
    name: "Alice Johnson",
    role: "Senior Developer",
    availability: "Available",
    tjm: "€650",
    email: "alice@example.com",
  },
  { id: 2, name: "Bob Smith", role: "Project Manager", availability: "Busy", tjm: "€550", email: "bob@example.com" },
  {
    id: 3,
    name: "Carol Davis",
    role: "UX Designer",
    availability: "Available",
    tjm: "€450",
    email: "carol@example.com",
  },
  {
    id: 4,
    name: "David Wilson",
    role: "DevOps Engineer",
    availability: "Partially Available",
    tjm: "€600",
    email: "david@example.com",
  },
  {
    id: 5,
    name: "Eva Brown",
    role: "Frontend Developer",
    availability: "Available",
    tjm: "€500",
    email: "eva@example.com",
  },
]

export default function Consultants() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)

  const filteredConsultants = mockConsultants.filter(
    (consultant) =>
      consultant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      consultant.role.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case "Available":
        return "bg-green-100 text-green-800"
      case "Busy":
        return "bg-red-100 text-red-800"
      case "Partially Available":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Consultants</h1>
            <p className="text-muted-foreground">Manage your consultant team</p>
          </div>

          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Consultant
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Consultant</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Enter consultant name" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="role">Role</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="senior-developer">Senior Developer</SelectItem>
                      <SelectItem value="project-manager">Project Manager</SelectItem>
                      <SelectItem value="ux-designer">UX Designer</SelectItem>
                      <SelectItem value="devops-engineer">DevOps Engineer</SelectItem>
                      <SelectItem value="frontend-developer">Frontend Developer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="availability">Availability</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select availability" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="available">Available</SelectItem>
                      <SelectItem value="busy">Busy</SelectItem>
                      <SelectItem value="partially-available">Partially Available</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="tjm">Daily Rate (TJM)</Label>
                  <Input id="tjm" placeholder="€500" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="consultant@example.com" />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsModalOpen(false)}>Add Consultant</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex gap-4 items-center">
          <div className="relative flex-1 max-w-sm">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search consultants..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button variant="outline">All</Button>
          <Button variant="outline">Available</Button>
          <Button variant="outline">Busy</Button>
        </div>

        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-medium text-foreground">Consultant Name</th>
                  <th className="text-left p-4 font-medium text-foreground">Role</th>
                  <th className="text-left p-4 font-medium text-foreground">Availability</th>
                  <th className="text-left p-4 font-medium text-foreground">TJM</th>
                  <th className="text-left p-4 font-medium text-foreground">Email</th>
                  <th className="text-left p-4 font-medium text-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredConsultants.map((consultant, index) => (
                  <tr key={consultant.id} className={index % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                    <td className="p-4">
                      <div className="font-medium text-foreground">{consultant.name}</div>
                    </td>
                    <td className="p-4 text-muted-foreground">{consultant.role}</td>
                    <td className="p-4">
                      <Badge className={getAvailabilityColor(consultant.availability)}>{consultant.availability}</Badge>
                    </td>
                    <td className="p-4 font-medium text-foreground">{consultant.tjm}</td>
                    <td className="p-4 text-muted-foreground">{consultant.email}</td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
