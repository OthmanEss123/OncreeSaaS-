import { DashboardLayout } from "@/components/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Search } from "lucide-react"

export default function Missions() {
  const missions = [
    {
      id: 1,
      name: "Website Redesign",
      client: "Acme Corp",
      consultant: "John Doe",
      status: "In Progress",
      startDate: "2024-01-15",
      endDate: "2024-03-15",
    },
    {
      id: 2,
      name: "Mobile App Development",
      client: "TechStart Inc",
      consultant: "Jane Smith",
      status: "Planning",
      startDate: "2024-02-01",
      endDate: "2024-06-01",
    },
    {
      id: 3,
      name: "Database Migration",
      client: "DataFlow Ltd",
      consultant: "Mike Johnson",
      status: "Completed",
      startDate: "2023-12-01",
      endDate: "2024-01-31",
    },
    {
      id: 4,
      name: "Security Audit",
      client: "SecureBank",
      consultant: "Sarah Wilson",
      status: "In Progress",
      startDate: "2024-01-20",
      endDate: "2024-02-20",
    },
    {
      id: 5,
      name: "Cloud Infrastructure",
      client: "CloudTech",
      consultant: "David Brown",
      status: "Planning",
      startDate: "2024-03-01",
      endDate: "2024-05-01",
    },
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800 border-green-200"
      case "In Progress":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "Planning":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Missions</h1>
            <p className="text-muted-foreground">Manage and track all your missions</p>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Mission
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search missions..."
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-md bg-background"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  All
                </Button>
                <Button variant="outline" size="sm">
                  In Progress
                </Button>
                <Button variant="outline" size="sm">
                  Planning
                </Button>
                <Button variant="outline" size="sm">
                  Completed
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Mission Name</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Client</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Consultant</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Start Date</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">End Date</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {missions.map((mission) => (
                    <tr key={mission.id} className="border-b border-border hover:bg-muted/50">
                      <td className="py-3 px-4 font-medium">{mission.name}</td>
                      <td className="py-3 px-4 text-muted-foreground">{mission.client}</td>
                      <td className="py-3 px-4 text-muted-foreground">{mission.consultant}</td>
                      <td className="py-3 px-4">
                        <Badge className={getStatusColor(mission.status)}>{mission.status}</Badge>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground">{mission.startDate}</td>
                      <td className="py-3 px-4 text-muted-foreground">{mission.endDate}</td>
                      <td className="py-3 px-4">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                          <Button variant="outline" size="sm">
                            View
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
