"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative py-20 lg:py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight text-balance">
              SaaS & CRM multi-platform for <span className="text-primary">missions, time & billing</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-muted-foreground leading-relaxed text-pretty">
              Manage projects, track time, plan appointments, handle invoicing & clients in one place. Streamline your
              business operations with our comprehensive solution.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground group">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button variant="outline" size="lg" className="border-border hover:bg-muted bg-transparent">
                Watch Demo
              </Button>
            </div>
          </div>

          {/* Dashboard Mockup */}
          <div className="relative">
            <div className="bg-card rounded-xl shadow-2xl border border-border p-6">
              <div className="bg-muted rounded-lg h-64 sm:h-80 flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 bg-primary/20 rounded-lg mx-auto mb-4 flex items-center justify-center">
                    <div className="w-8 h-8 bg-primary rounded"></div>
                  </div>
                  <p className="text-muted-foreground font-medium">Dashboard Preview</p>
                  <p className="text-sm text-muted-foreground mt-1">Coming Soon</p>
                </div>
              </div>
              {/* Mock dashboard elements */}
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="h-2 bg-muted rounded w-1/3"></div>
                  <div className="h-2 bg-primary/30 rounded w-1/4"></div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="h-2 bg-muted rounded w-1/2"></div>
                  <div className="h-2 bg-secondary/30 rounded w-1/5"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
