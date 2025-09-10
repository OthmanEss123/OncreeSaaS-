import { SharedLayout } from "@/components/shared-layout"
import { HeroSection } from "@/components/hero-section"
import { Button } from "@/components/ui/button"
import { RoleSwitcher } from "@/components/shared/role-switcher"
import { ArrowRight, CheckCircle, Users, Clock, Calendar, FileText, CreditCard } from "lucide-react"

export default function Home() {
  return (
    <SharedLayout>
      <HeroSection />

      {/* Demo Navigation Section */}
      <section className="py-12 bg-primary/5 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-foreground mb-4">Explore Different User Roles</h2>
            <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
              Experience our platform from different perspectives. Switch between Client, Consultant, and Admin
              dashboards to see all features in action.
            </p>
            <RoleSwitcher />
          </div>
        </div>
      </section>

      {/* Features Overview Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
              Everything you need to run your business
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Streamline your operations with our comprehensive suite of business management tools
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-card p-6 rounded-xl border border-border hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground mb-2">CRM Management</h3>
              <p className="text-muted-foreground">
                Manage your clients and relationships effectively with our powerful CRM tools.
              </p>
            </div>

            <div className="bg-card p-6 rounded-xl border border-border hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground mb-2">Time Tracking</h3>
              <p className="text-muted-foreground">Track time spent on projects and tasks with precision and ease.</p>
            </div>

            <div className="bg-card p-6 rounded-xl border border-border hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground mb-2">Appointments</h3>
              <p className="text-muted-foreground">Schedule and manage appointments with clients seamlessly.</p>
            </div>

            <div className="bg-card p-6 rounded-xl border border-border hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <FileText className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground mb-2">Project Management</h3>
              <p className="text-muted-foreground">
                Organize and track your missions and projects from start to finish.
              </p>
            </div>

            <div className="bg-card p-6 rounded-xl border border-border hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground mb-2">Invoicing</h3>
              <p className="text-muted-foreground">
                Create and send professional invoices with automated billing features.
              </p>
            </div>

            <div className="bg-card p-6 rounded-xl border border-border hover:shadow-lg transition-shadow">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-card-foreground mb-2">Task Management</h3>
              <p className="text-muted-foreground">Stay organized with comprehensive task and workflow management.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Ready to transform your business?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of businesses that trust OncreeSaaS to streamline their operations and boost productivity.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground group">
              Start Your Free Trial
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button variant="outline" size="lg" className="border-border hover:bg-muted bg-transparent">
              Schedule a Demo
            </Button>
          </div>
          <p className="text-sm text-muted-foreground mt-4">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </section>
    </SharedLayout>
  )
}
