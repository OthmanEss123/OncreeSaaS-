"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { PlusIcon, ClockIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline"
import { useState } from "react"

const mockTimeEntries = [
  {
    id: 1,
    consultant: "Alice Johnson",
    mission: "E-commerce Platform",
    hours: "8.0",
    date: "2024-01-25",
    notes: "Frontend development - product catalog implementation",
  },
  {
    id: 2,
    consultant: "Bob Smith",
    mission: "CRM Integration",
    hours: "6.5",
    date: "2024-01-25",
    notes: "API integration and testing",
  },
  {
    id: 3,
    consultant: "Carol Davis",
    mission: "Mobile App Design",
    hours: "7.0",
    date: "2024-01-24",
    notes: "UI/UX design for user onboarding flow",
  },
  {
    id: 4,
    consultant: "David Wilson",
    mission: "Infrastructure Setup",
    hours: "5.5",
    date: "2024-01-24",
    notes: "Docker containerization and CI/CD pipeline setup",
  },
  {
    id: 5,
    consultant: "Eva Brown",
    mission: "E-commerce Platform",
    hours: "7.5",
    date: "2024-01-23",
    notes: "Payment gateway integration and testing",
  },
  {
    id: 6,
    consultant: "Alice Johnson",
    mission: "CRM Integration",
    hours: "4.0",
    date: "2024-01-23",
    notes: "Database schema optimization",
  },
]

export default function TimeTracking() {
  const [searchTerm, setSearchTerm] = useState("")
  const [isModalOpen, setIsModalOpen] = useState(false)

  const filteredEntries = mockTimeEntries.filter(
    (entry) =>
      entry.consultant.toLowerCase().includes(searchTerm.toLowerCase()) ||
      entry.mission.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const totalHours = filteredEntries.reduce((sum, entry) => sum + Number.parseFloat(entry.hours), 0)

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Time Tracking</h1>
            <p className="text-muted-foreground">Track consultant hours and project time</p>
          </div>

          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90">
                <PlusIcon className="h-4 w-4 mr-2" />
                Log Time
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Log Time Entry</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="consultant">Consultant</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select consultant" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="alice">Alice Johnson</SelectItem>
                      <SelectItem value="bob">Bob Smith</SelectItem>
                      <SelectItem value="carol">Carol Davis</SelectItem>
                      <SelectItem value="david">David Wilson</SelectItem>
                      <SelectItem value="eva">Eva Brown</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="mission">Mission</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select mission" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ecommerce">E-commerce Platform</SelectItem>
                      <SelectItem value="crm">CRM Integration</SelectItem>
                      <SelectItem value="mobile">Mobile App Design</SelectItem>
                      <SelectItem value="infrastructure">Infrastructure Setup</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="hours">Hours</Label>
                  <Input id="hours" placeholder="8.0" type="number" step="0.5" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="date">Date</Label>
                  <Input id="date" type="date" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea id="notes" placeholder="Describe the work performed..." />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsModalOpen(false)}>Log Time</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex gap-4 items-center justify-between flex-wrap">
          <div className="relative flex-1 max-w-sm">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search entries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button variant="outline">Today</Button>
            <Button variant="outline">This Week</Button>
            <Button variant="outline">Export</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="flex items-center gap-2">
              <ClockIcon className="h-5 w-5 text-primary" />
              <div className="text-sm text-muted-foreground">Total Hours</div>
            </div>
            <div className="text-2xl font-bold text-foreground">{totalHours.toFixed(1)}</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-sm text-muted-foreground">Active Consultants</div>
            <div className="text-2xl font-bold text-foreground">5</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-sm text-muted-foreground">Active Missions</div>
            <div className="text-2xl font-bold text-foreground">4</div>
          </div>
          <div className="bg-card border border-border rounded-lg p-4">
            <div className="text-sm text-muted-foreground">Avg Hours/Day</div>
            <div className="text-2xl font-bold text-foreground">6.3</div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-4 font-medium text-foreground">Consultant</th>
                  <th className="text-left p-4 font-medium text-foreground">Mission</th>
                  <th className="text-left p-4 font-medium text-foreground">Hours</th>
                  <th className="text-left p-4 font-medium text-foreground">Date</th>
                  <th className="text-left p-4 font-medium text-foreground">Notes</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.map((entry, index) => (
                  <tr key={entry.id} className={index % 2 === 0 ? "bg-background" : "bg-muted/20"}>
                    <td className="p-4">
                      <div className="font-medium text-foreground">{entry.consultant}</div>
                    </td>
                    <td className="p-4 text-muted-foreground">{entry.mission}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <ClockIcon className="h-4 w-4 text-primary" />
                        <span className="font-medium text-foreground">{entry.hours}h</span>
                      </div>
                    </td>
                    <td className="p-4 text-muted-foreground">{entry.date}</td>
                    <td className="p-4 text-muted-foreground max-w-xs truncate">{entry.notes}</td>
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
