import { DashboardLayout } from "@/components/dashboard-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Target, Users, FileText, TrendingUp, Clock, CreditCard } from "lucide-react"

export default function Dashboard() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome section */}
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Welcome back!</h1>
          <p className="text-muted-foreground">Here's what's happening with your business today.</p>
        </div>

        {/* Stats cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Missions</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-primary">+12%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Clients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-primary">+8%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-secondary">-4%</span> from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$45,231</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-primary">+20%</span> from last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent activity */}
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 bg-primary rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">New client onboarded</p>
                  <p className="text-xs text-muted-foreground">2 hours ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 bg-secondary rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Invoice #1234 paid</p>
                  <p className="text-xs text-muted-foreground">4 hours ago</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 bg-primary rounded-full"></div>
                <div className="flex-1">
                  <p className="text-sm font-medium">Mission completed</p>
                  <p className="text-xs text-muted-foreground">1 day ago</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Chart placeholder section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Revenue Chart
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-muted rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <TrendingUp className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Chart placeholder</p>
                  <p className="text-xs text-muted-foreground">Revenue analytics will appear here</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <button className="w-full text-left p-3 rounded-lg border border-border hover:bg-muted transition-colors">
                <p className="font-medium text-sm">Create New Mission</p>
                <p className="text-xs text-muted-foreground">Start a new project or task</p>
              </button>
              <button className="w-full text-left p-3 rounded-lg border border-border hover:bg-muted transition-colors">
                <p className="font-medium text-sm">Add New Client</p>
                <p className="text-xs text-muted-foreground">Onboard a new client</p>
              </button>
              <button className="w-full text-left p-3 rounded-lg border border-border hover:bg-muted transition-colors">
                <p className="font-medium text-sm">Generate Invoice</p>
                <p className="text-xs text-muted-foreground">Create and send invoice</p>
              </button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
