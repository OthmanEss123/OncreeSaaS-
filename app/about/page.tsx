import { SharedLayout } from "@/components/shared-layout"
import { Button } from "@/components/ui/button"
import { Users, Target, Heart, Zap, ArrowRight } from "lucide-react"

export default function About() {
  return (
    <SharedLayout>
      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight text-balance">
                About <span className="text-primary">OncreeSaaS</span>
              </h1>
              <p className="mt-6 text-lg sm:text-xl text-muted-foreground leading-relaxed text-pretty">
                We're on a mission to simplify business operations for teams worldwide. Founded with the vision of
                creating an all-in-one platform that grows with your business.
              </p>
            </div>
            <div className="relative">
              <div className="bg-card rounded-xl shadow-2xl border border-border p-8">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-primary/10 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-primary">10K+</div>
                    <div className="text-sm text-muted-foreground">Active Users</div>
                  </div>
                  <div className="bg-primary/10 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-primary">50+</div>
                    <div className="text-sm text-muted-foreground">Countries</div>
                  </div>
                  <div className="bg-primary/10 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-primary">99.9%</div>
                    <div className="text-sm text-muted-foreground">Uptime</div>
                  </div>
                  <div className="bg-primary/10 rounded-lg p-4 text-center">
                    <div className="text-2xl font-bold text-primary">24/7</div>
                    <div className="text-sm text-muted-foreground">Support</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-8">Our Mission</h2>
          <p className="text-xl text-muted-foreground leading-relaxed mb-8">
            "To empower businesses of all sizes with intuitive, powerful tools that streamline operations, enhance
            productivity, and drive growth. We believe that great software should be accessible, reliable, and designed
            with the user in mind."
          </p>
          <div className="w-24 h-1 bg-primary mx-auto rounded-full"></div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Our Values</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The principles that guide everything we do at OncreeSaaS
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Customer First</h3>
              <p className="text-muted-foreground">
                Every decision we make is guided by what's best for our customers and their success.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Innovation</h3>
              <p className="text-muted-foreground">
                We continuously innovate to stay ahead of the curve and provide cutting-edge solutions.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Integrity</h3>
              <p className="text-muted-foreground">
                We build trust through transparency, honesty, and ethical business practices.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Zap className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Excellence</h3>
              <p className="text-muted-foreground">
                We strive for excellence in everything we do, from product quality to customer service.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Our Story</h2>
          </div>

          <div className="space-y-8">
            <div className="bg-card p-8 rounded-xl border border-border">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-bold">2020</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-card-foreground mb-2">The Beginning</h3>
                  <p className="text-muted-foreground">
                    OncreeSaaS was founded by a team of entrepreneurs who experienced firsthand the challenges of
                    managing multiple business tools. We set out to create a unified platform that would eliminate the
                    need for dozens of separate applications.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card p-8 rounded-xl border border-border">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-bold">2022</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-card-foreground mb-2">Growth & Expansion</h3>
                  <p className="text-muted-foreground">
                    We reached our first 1,000 customers and expanded our team globally. Our platform evolved to include
                    advanced CRM features, automated invoicing, and comprehensive project management tools.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card p-8 rounded-xl border border-border">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-bold">2024</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-card-foreground mb-2">Innovation Continues</h3>
                  <p className="text-muted-foreground">
                    Today, we serve over 10,000 businesses worldwide with our comprehensive SaaS platform. We continue
                    to innovate with AI-powered features, advanced analytics, and seamless integrations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Meet Our Team</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The passionate individuals behind OncreeSaaS who work tirelessly to make your business operations seamless
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-32 h-32 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Users className="h-16 w-16 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-1">Sarah Johnson</h3>
              <p className="text-primary mb-2">CEO & Founder</p>
              <p className="text-muted-foreground text-sm">
                Former McKinsey consultant with 15+ years in business operations and strategy.
              </p>
            </div>

            <div className="text-center">
              <div className="w-32 h-32 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Users className="h-16 w-16 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-1">Michael Chen</h3>
              <p className="text-primary mb-2">CTO & Co-Founder</p>
              <p className="text-muted-foreground text-sm">
                Former Google engineer specializing in scalable systems and user experience design.
              </p>
            </div>

            <div className="text-center">
              <div className="w-32 h-32 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
                <Users className="h-16 w-16 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-1">Emily Rodriguez</h3>
              <p className="text-primary mb-2">Head of Product</p>
              <p className="text-muted-foreground text-sm">
                Product management expert with a passion for creating intuitive user experiences.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Join Our Journey</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Be part of the thousands of businesses that have transformed their operations with OncreeSaaS.
          </p>
          <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground group">
            Start Your Free Trial
            <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>
      </section>
    </SharedLayout>
  )
}
