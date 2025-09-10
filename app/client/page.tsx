"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Briefcase, FileText, CreditCard, TrendingUp, Calendar, Clock } from "lucide-react"
import { mockClientData } from "@/lib/mock-data"

export default function ClientDashboard() {
  const { overview, missions } = mockClientData

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's an overview of your projects.</p>
        </div>
        <Button>
          <Briefcase className="mr-2 h-4 w-4" />
          New Mission Request
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
            <p className="text-xs text-muted-foreground">Currently in progress</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Missions</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.completedMissions}</div>
            <p className="text-xs text-muted-foreground">Successfully delivered</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overview.pendingInvoices}</div>
            <p className="text-xs text-muted-foreground">Awaiting payment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Investment</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${overview.totalSpent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All-time spending</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Missions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Missions</CardTitle>
          <CardDescription>Your latest project activities and progress</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {missions.slice(0, 3).map((mission) => (
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
                      <Clock className="h-3 w-3" />
                      Consultant: {mission.consultant}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Due: {new Date(mission.endDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Progress value={mission.progress} className="flex-1" />
                    <span className="text-sm font-medium">{mission.progress}%</span>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <div className="font-semibold">${mission.budget.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Budget</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
