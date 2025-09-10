import { Card, CardContent } from "@/components/ui/card"
import { Target, Clock, Calendar, FileText, Users, BarChart3 } from "lucide-react"

const features = [
  {
    icon: Target,
    title: "Missions & Projects",
    description:
      "Organize and track your projects with powerful mission management tools. Set goals, assign tasks, and monitor progress in real-time.",
  },
  {
    icon: Clock,
    title: "Time Tracking",
    description:
      "Accurate time tracking with automated timers, manual entries, and detailed reporting. Never lose billable hours again.",
  },
  {
    icon: Calendar,
    title: "Appointments",
    description:
      "Schedule and manage appointments with integrated calendar functionality. Send reminders and sync across devices.",
  },
  {
    icon: FileText,
    title: "Invoicing",
    description:
      "Generate professional invoices automatically from tracked time and project milestones. Accept payments online.",
  },
  {
    icon: Users,
    title: "CRM",
    description:
      "Manage client relationships with comprehensive contact management, communication history, and deal tracking.",
  },
  {
    icon: BarChart3,
    title: "Analytics",
    description:
      "Gain insights with detailed reports and analytics. Track performance, profitability, and business growth metrics.",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground text-balance">
            Everything you need to run your business
          </h2>
          <p className="mt-4 text-lg text-muted-foreground text-pretty">
            Powerful features designed to streamline your workflow and boost productivity
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="bg-card border-border hover:shadow-lg transition-shadow duration-300">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-card-foreground mb-2">{feature.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
