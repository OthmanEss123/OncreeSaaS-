"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Calendar, Clock, Users, Timer, CheckCircle } from "lucide-react"
import { mockConsultantData } from "@/lib/mock-data"

export default function ConsultantMissions() {
  const [missions] = useState([
    ...mockConsultantData.missions,
    {
      id: "M003",
      title: "Database Migration",
      client: "DataFlow Systems",
      status: "Completed",
      deadline: "2024-01-15",
      hoursLogged: 40,
      totalHours: 40,
    },
    {
      id: "M004",
      title: "API Integration",
      client: "ConnectApp",
      status: "In Progress",
      deadline: "2024-02-28",
      hoursLogged: 18,
      totalHours: 60,
    },
  ])

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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed":
        return <CheckCircle className="h-4 w-4" />
      case "In Progress":
        return <Timer className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Missions</h1>
          <p className="text-muted-foreground">Manage your assigned projects and track progress</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Missions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{missions.length}</div>
            <p className="text-xs text-muted-foreground">All assignments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{missions.filter((m) => m.status === "In Progress").length}</div>
            <p className="text-xs text-muted-foreground">Active projects</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{missions.filter((m) => m.status === "Completed").length}</div>
            <p className="text-xs text-muted-foreground">Finished projects</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{missions.reduce((sum, m) => sum + m.hoursLogged, 0)}</div>
            <p className="text-xs text-muted-foreground">Hours logged</p>
          </CardContent>
        </Card>
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
                <div className="flex items-center gap-1">
                  {getStatusIcon(mission.status)}
                  <Badge variant={getStatusColor(mission.status)}>{mission.status}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{mission.client}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Due: {new Date(mission.deadline).toLocaleDateString()}</span>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Hours Progress</span>
                  <span className="font-medium">
                    {mission.hoursLogged}/{mission.totalHours}h
                  </span>
                </div>
                <Progress value={(mission.hoursLogged / mission.totalHours) * 100} />
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="flex-1 bg-transparent">
                  View Details
                </Button>
                {mission.status !== "Completed" && (
                  <Button className="flex-1">
                    <Timer className="mr-2 h-4 w-4" />
                    Log Time
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
