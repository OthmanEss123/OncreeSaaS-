"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Calendar, Clock, DollarSign, User } from "lucide-react"
import { mockClientData } from "@/lib/mock-data"

export default function ClientMissions() {
  const [missions] = useState(mockClientData.missions)
  const [isNewMissionOpen, setIsNewMissionOpen] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "default"
      case "In Progress":
        return "secondary"
      case "Planning":
        return "outline"
      default:
        return "outline"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Missions</h1>
          <p className="text-muted-foreground">Manage and track your project missions</p>
        </div>
        <Dialog open={isNewMissionOpen} onOpenChange={setIsNewMissionOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Request New Mission
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Request New Mission</DialogTitle>
              <DialogDescription>Submit a new mission request to our consultants.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Mission Title</Label>
                <Input id="title" placeholder="Enter mission title" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" placeholder="Describe your mission requirements" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="budget">Budget Range</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select budget range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5000">$5,000 - $10,000</SelectItem>
                    <SelectItem value="10000">$10,000 - $25,000</SelectItem>
                    <SelectItem value="25000">$25,000 - $50,000</SelectItem>
                    <SelectItem value="50000">$50,000+</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="timeline">Expected Timeline</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select timeline" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1-2 weeks</SelectItem>
                    <SelectItem value="4">1 month</SelectItem>
                    <SelectItem value="12">3 months</SelectItem>
                    <SelectItem value="24">6+ months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsNewMissionOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsNewMissionOpen(false)}>Submit Request</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Missions Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {missions.map((mission) => (
          <Card key={mission.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{mission.title}</CardTitle>
                  <CardDescription className="mt-1">ID: {mission.id}</CardDescription>
                </div>
                <Badge variant={getStatusColor(mission.status)}>{mission.status}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>{mission.consultant}</span>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Start: {new Date(mission.startDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>End: {new Date(mission.endDate).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Progress</span>
                  <span className="font-medium">{mission.progress}%</span>
                </div>
                <Progress value={mission.progress} />
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <DollarSign className="h-4 w-4" />
                  <span>Budget</span>
                </div>
                <span className="font-semibold">${mission.budget.toLocaleString()}</span>
              </div>

              <Button variant="outline" className="w-full bg-transparent">
                View Details
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
