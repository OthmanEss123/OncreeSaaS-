import { SharedLayout } from "@/components/shared-layout"
import { Button } from "@/components/ui/button"
import {
  Users,
  Clock,
  Calendar,
  FileText,
  CreditCard,
  CheckCircle,
  BarChart3,
  Shield,
  Zap,
  ArrowRight,
} from "lucide-react"

export default function Features() {
  return (
    <SharedLayout>
      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight text-balance">
            Powerful Features for <span className="text-primary">Modern Businesses</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground leading-relaxed text-pretty max-w-3xl mx-auto">
            Everything you need to manage your business operations efficiently. From project management to client
            relationships, we've got you covered.
          </p>
        </div>
      </section>

      {/* Main Features Grid */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Missions/Project Management */}
            <div className="bg-card p-8 rounded-xl border border-border hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold text-card-foreground mb-4">Mission Management</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Organize and track your projects from conception to completion. Set milestones, assign tasks, and
                monitor progress in real-time.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Project timeline management
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Task assignment and tracking
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Progress monitoring
                </li>
              </ul>
            </div>

            {/* Time Tracking */}
            <div className="bg-card p-8 rounded-xl border border-border hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold text-card-foreground mb-4">Time Tracking</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Track time spent on projects and tasks with precision. Generate detailed reports and optimize your
                team's productivity.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Automatic time tracking
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Detailed time reports
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Productivity analytics
                </li>
              </ul>
            </div>

            {/* Appointments */}
            <div className="bg-card p-8 rounded-xl border border-border hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <Calendar className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold text-card-foreground mb-4">Appointments</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Schedule and manage appointments with clients seamlessly. Send automated reminders and sync with your
                calendar.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Online booking system
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Automated reminders
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Calendar integration
                </li>
              </ul>
            </div>

            {/* Invoicing */}
            <div className="bg-card p-8 rounded-xl border border-border hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <CreditCard className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold text-card-foreground mb-4">Invoicing</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Create and send professional invoices with automated billing features. Track payments and manage your
                finances effortlessly.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Professional invoice templates
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Automated billing
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Payment tracking
                </li>
              </ul>
            </div>

            {/* CRM */}
            <div className="bg-card p-8 rounded-xl border border-border hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold text-card-foreground mb-4">CRM</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Manage your client relationships effectively with our powerful CRM tools. Track interactions and nurture
                leads.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Contact management
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Lead tracking
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Communication history
                </li>
              </ul>
            </div>

            {/* Analytics */}
            <div className="bg-card p-8 rounded-xl border border-border hover:shadow-lg transition-all duration-300">
              <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mb-6">
                <BarChart3 className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold text-card-foreground mb-4">Analytics & Reports</h3>
              <p className="text-muted-foreground mb-6 leading-relaxed">
                Get insights into your business performance with comprehensive analytics and customizable reports.
              </p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Performance dashboards
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Custom reports
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Data visualization
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Additional Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Built for Modern Teams</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Additional features that make OncreeSaaS the perfect choice for your business
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Enterprise Security</h3>
              <p className="text-muted-foreground">
                Bank-level security with end-to-end encryption and compliance with industry standards.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Lightning Fast</h3>
              <p className="text-muted-foreground">
                Optimized for speed and performance, ensuring your team stays productive.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Team Collaboration</h3>
              <p className="text-muted-foreground">
                Built-in collaboration tools to keep your team connected and aligned.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Ready to experience these features?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Start your free trial today and see how OncreeSaaS can transform your business operations.
          </p>
          <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground group">
            Start Free Trial
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </section>
    </SharedLayout>
  )
}
