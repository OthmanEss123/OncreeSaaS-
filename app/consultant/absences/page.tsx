"use client"

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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Calendar, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react"

const mockAbsences = [
  {
    id: "A001",
    type: "Vacation",
    startDate: "2024-02-15",
    endDate: "2024-02-19",
    days: 5,
    status: "Approved",
    reason: "Family vacation",
    submittedDate: "2024-01-20",
  },
  {
    id: "A002",
    type: "Sick Leave",
    startDate: "2024-01-25",
    endDate: "2024-01-25",
    days: 1,
    status: "Approved",
    reason: "Medical appointment",
    submittedDate: "2024-01-24",
  },
  {
    id: "A003",
    type: "Personal",
    startDate: "2024-03-01",
    endDate: "2024-03-01",
    days: 1,
    status: "Pending",
    reason: "Personal matters",
    submittedDate: "2024-02-01",
  },
]

export default function ConsultantAbsences() {
  const [absences] = useState(mockAbsences)
  const [isRequestOpen, setIsRequestOpen] = useState(false)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Approved":
        return "default"
      case "Pending":
        return "secondary"
      case "Rejected":
        return "destructive"
      default:
        return "outline"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Approved":
        return <CheckCircle className="h-4 w-4" />
      case "Pending":
        return <AlertCircle className="h-4 w-4" />
      case "Rejected":
        return <XCircle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const totalDaysUsed = absences
    .filter((absence) => absence.status === "Approved")
    .reduce((sum, absence) => sum + absence.days, 0)

  const pendingRequests = absences.filter((absence) => absence.status === "Pending").length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Absences</h1>
          <p className="text-muted-foreground">Manage your time off requests and absence history</p>
        </div>
        <Dialog open={isRequestOpen} onOpenChange={setIsRequestOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Request Time Off
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Request Time Off</DialogTitle>
              <DialogDescription>Submit a new absence request for approval.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="type">Absence Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select absence type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vacation">Vacation</SelectItem>
                    <SelectItem value="sick">Sick Leave</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input id="startDate" type="date" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input id="endDate" type="date" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="reason">Reason</Label>
                <Textarea id="reason" placeholder="Provide a brief reason for your absence" />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsRequestOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setIsRequestOpen(false)}>Submit Request</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Days Used</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDaysUsed}</div>
            <p className="text-xs text-muted-foreground">This year</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{25 - totalDaysUsed}</div>
            <p className="text-xs text-muted-foreground">Days available</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingRequests}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{absences.length}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>
      </div>

      {/* Absences Table */}
      <Card>
        <CardHeader>
          <CardTitle>Absence History</CardTitle>
          <CardDescription>Your time off requests and their current status</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Request ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Start Date</TableHead>
                <TableHead>End Date</TableHead>
                <TableHead>Days</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Submitted</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {absences.map((absence) => (
                <TableRow key={absence.id}>
                  <TableCell className="font-medium">{absence.id}</TableCell>
                  <TableCell>{absence.type}</TableCell>
                  <TableCell>{new Date(absence.startDate).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(absence.endDate).toLocaleDateString()}</TableCell>
                  <TableCell>{absence.days}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(absence.status)}
                      <Badge variant={getStatusColor(absence.status)}>{absence.status}</Badge>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{absence.reason}</TableCell>
                  <TableCell>{new Date(absence.submittedDate).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
