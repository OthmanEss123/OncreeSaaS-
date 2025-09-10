"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Briefcase, Clock, Calendar, TrendingUp, Users, Timer } from "lucide-react"
import { mockConsultantData } from "@/lib/mock-data"

export default function ConsultantDashboard() {
  const { overview, missions, timeEntries } = mockConsultantData

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your work overview.</p>
        </div>
        <Button>
          <Timer className="mr-2 h-4 w-4" />
          Start Timer
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Missions</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.activeMissions}</div>
            <p className="text-xs text-muted-foreground">Currently assigned</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.totalHours}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.thisWeekHours}h</div>
            <p className="text-xs text-muted-foreground">Hours logged</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Deadlines</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.upcomingDeadlines}</div>
            <p className="text-xs text-muted-foreground">Next 7 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Missions */}
      <Card>
        <CardHeader>
          <CardTitle>Active Missions</CardTitle>
          <CardDescription>Your current project assignments and progress</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {missions.map((mission) => (
              <div key={mission.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold">{mission.title}</h3>
                    <Badge
                      variant={
                        mission.status === "Completed"
                          ? "default"
                          : mission.status === "In Progress"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {mission.status}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      Client: {mission.client}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Due: {new Date(mission.deadline).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">
                      Hours: {mission.hoursLogged}/{mission.totalHours}
                    </span>
                    <Progress value={(mission.hoursLogged / mission.totalHours) * 100} className="flex-1" />
                    <span className="text-sm font-medium">
                      {Math.round((mission.hoursLogged / mission.totalHours) * 100)}%
                    </span>
                  </div>
                </div>
                <Button variant="outline" className="ml-4 bg-transparent">
                  Log Time
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Time Entries */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Time Entries</CardTitle>
          <CardDescription>Your latest logged work sessions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {timeEntries.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">{entry.missionTitle}</h4>
                  <p className="text-sm text-muted-foreground">{entry.description}</p>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{entry.hours}h</div>
                  <div className="text-sm text-muted-foreground">{new Date(entry.date).toLocaleDateString()}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
