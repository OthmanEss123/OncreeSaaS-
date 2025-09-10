"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Clock, Calendar, Timer, Play, Pause, Square } from "lucide-react"
import { mockConsultantData } from "@/lib/mock-data"

export default function ConsultantTimeTracking() {
  const [timeEntries, setTimeEntries] = useState([
    ...mockConsultantData.timeEntries,
    {
      id: "T003",
      missionId: "M005",
      missionTitle: "E-commerce Platform",
      date: "2024-01-30",
      hours: 4,
      description: "Database schema design and API planning",
    },
    {
      id: "T004",
      missionId: "M001",
      missionTitle: "Website Redesign Project",
      date: "2024-01-29",
      hours: 7,
      description: "Component development and testing",
    },
  ])
  const [isLogTimeOpen, setIsLogTimeOpen] = useState(false)
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [currentTimer, setCurrentTimer] = useState(0)

  const totalHoursThisWeek = timeEntries
    .filter((entry) => {
      const entryDate = new Date(entry.date)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      return entryDate >= weekAgo
    })
    .reduce((sum, entry) => sum + entry.hours, 0)

  const totalHoursThisMonth = timeEntries
    .filter((entry) => {
      const entryDate = new Date(entry.date)
      const monthAgo = new Date()
      monthAgo.setMonth(monthAgo.getMonth() - 1)
      return entryDate >= monthAgo
    })
    .reduce((sum, entry) => sum + entry.hours, 0)

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Time Tracking</h1>
          <p className="text-muted-foreground">Track your work hours and manage time entries</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isLogTimeOpen} onOpenChange={setIsLogTimeOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Log Time
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Log Time Entry</DialogTitle>
                <DialogDescription>Record time spent on a mission or task.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="mission">Mission</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select mission" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M001">Website Redesign Project</SelectItem>
                      <SelectItem value="M005">E-commerce Platform</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="date">Date</Label>
                  <Input id="date" type="date" defaultValue={new Date().toISOString().split("T")[0]} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="hours">Hours</Label>
                  <Input id="hours" type="number" step="0.5" placeholder="8.0" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" placeholder="Describe the work performed" />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsLogTimeOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setIsLogTimeOpen(false)}>Save Entry</Button>
              </div>
            </DialogContent>
          </Dialog>
          <Button>
            <Timer className="mr-2 h-4 w-4" />
            Start Timer
          </Button>
        </div>
      </div>

      {/* Timer Card */}
      <Card>
        <CardHeader>
          <CardTitle>Active Timer</CardTitle>
          <CardDescription>Track time in real-time for your current task</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-3xl font-mono font-bold">{formatTime(currentTimer)}</div>
              <div className="text-sm text-muted-foreground">
                {isTimerRunning ? "Timer running..." : "Timer stopped"}
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={isTimerRunning ? "secondary" : "default"}
                onClick={() => setIsTimerRunning(!isTimerRunning)}
              >
                {isTimerRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button variant="outline" onClick={() => setCurrentTimer(0)}>
                <Square className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHoursThisWeek}h</div>
            <p className="text-xs text-muted-foreground">Hours logged</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalHoursThisMonth}h</div>
            <p className="text-xs text-muted-foreground">Total hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entries</CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{timeEntries.length}</div>
            <p className="text-xs text-muted-foreground">Time entries</p>
          </CardContent>
        </Card>
      </div>

      {/* Time Entries Table */}
      <Card>
        <CardHeader>
          <CardTitle>Time Entries</CardTitle>
          <CardDescription>Your recorded work sessions and time logs</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Mission</TableHead>
                <TableHead>Hours</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {timeEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{new Date(entry.date).toLocaleDateString()}</TableCell>
                  <TableCell className="font-medium">{entry.missionTitle}</TableCell>
                  <TableCell>{entry.hours}h</TableCell>
                  <TableCell className="max-w-xs truncate">{entry.description}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      Edit
                    </Button>
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
