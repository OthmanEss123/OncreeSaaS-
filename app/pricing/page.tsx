import { SharedLayout } from "@/components/shared-layout"
import { Button } from "@/components/ui/button"
import { CheckCircle, Star } from "lucide-react"

export default function Pricing() {
  return (
    <SharedLayout>
      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight text-balance">
            Simple, Transparent <span className="text-primary">Pricing</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground leading-relaxed text-pretty max-w-3xl mx-auto">
            Choose the perfect plan for your business. Start with our free trial and upgrade as you grow.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {/* Starter Plan */}
            <div className="bg-card p-8 rounded-2xl border border-border hover:shadow-lg transition-all duration-300">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-card-foreground mb-2">Starter</h3>
                <p className="text-muted-foreground mb-6">Perfect for small teams getting started</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-card-foreground">$29</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <Button variant="outline" className="w-full border-border hover:bg-muted bg-transparent">
                  Start Free Trial
                </Button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-card-foreground">Up to 5 team members</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-card-foreground">Basic project management</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-card-foreground">Time tracking</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-card-foreground">Basic invoicing</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-card-foreground">Email support</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-card-foreground">5GB storage</span>
                </div>
              </div>
            </div>

            {/* Pro Plan - Highlighted */}
            <div className="bg-primary p-8 rounded-2xl border-2 border-primary hover:shadow-xl transition-all duration-300 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-secondary text-secondary-foreground px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1">
                  <Star className="h-4 w-4" />
                  Most Popular
                </div>
              </div>

              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-primary-foreground mb-2">Pro</h3>
                <p className="text-primary-foreground/80 mb-6">Best for growing businesses</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-primary-foreground">$79</span>
                  <span className="text-primary-foreground/80">/month</span>
                </div>
                <Button variant="secondary" className="w-full bg-white text-primary hover:bg-gray-100">
                  Start Free Trial
                </Button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary-foreground flex-shrink-0" />
                  <span className="text-primary-foreground">Up to 25 team members</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary-foreground flex-shrink-0" />
                  <span className="text-primary-foreground">Advanced project management</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary-foreground flex-shrink-0" />
                  <span className="text-primary-foreground">Advanced time tracking & reports</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary-foreground flex-shrink-0" />
                  <span className="text-primary-foreground">Professional invoicing</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary-foreground flex-shrink-0" />
                  <span className="text-primary-foreground">Full CRM features</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary-foreground flex-shrink-0" />
                  <span className="text-primary-foreground">Appointment scheduling</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary-foreground flex-shrink-0" />
                  <span className="text-primary-foreground">Priority support</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary-foreground flex-shrink-0" />
                  <span className="text-primary-foreground">100GB storage</span>
                </div>
              </div>
            </div>

            {/* Enterprise Plan */}
            <div className="bg-card p-8 rounded-2xl border border-border hover:shadow-lg transition-all duration-300">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-card-foreground mb-2">Enterprise</h3>
                <p className="text-muted-foreground mb-6">For large organizations with custom needs</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-card-foreground">$199</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <Button variant="outline" className="w-full border-border hover:bg-muted bg-transparent">
                  Contact Sales
                </Button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-card-foreground">Unlimited team members</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-card-foreground">Enterprise project management</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-card-foreground">Advanced analytics & reporting</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-card-foreground">Custom invoicing & billing</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-card-foreground">Advanced CRM & automation</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-card-foreground">API access & integrations</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-card-foreground">24/7 dedicated support</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-primary flex-shrink-0" />
                  <span className="text-card-foreground">Unlimited storage</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Frequently Asked Questions</h2>
            <p className="text-lg text-muted-foreground">Everything you need to know about our pricing</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Can I change plans anytime?</h3>
              <p className="text-muted-foreground">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Is there a free trial?</h3>
              <p className="text-muted-foreground">
                Yes, we offer a 14-day free trial for all plans. No credit card required to get started.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2">What payment methods do you accept?</h3>
              <p className="text-muted-foreground">
                We accept all major credit cards, PayPal, and bank transfers for Enterprise plans.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Do you offer discounts for annual billing?</h3>
              <p className="text-muted-foreground">
                Yes, save 20% when you choose annual billing on any plan. Contact us for custom Enterprise pricing.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Ready to get started?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of businesses that trust OncreeSaaS to streamline their operations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
              Start Free Trial
            </Button>
            <Button variant="outline" size="lg" className="border-border hover:bg-muted bg-transparent">
              Schedule a Demo
            </Button>
          </div>
        </div>
      </section>
    </SharedLayout>
  )
}
