import { Card, CardContent } from "@/components/ui/card"

export function AboutSection() {
  return (
    <section id="about" className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-8 text-balance">About OncreeSaaS</h2>

          <Card className="bg-card border-border">
            <CardContent className="p-8 sm:p-12">
              <p className="text-lg text-card-foreground leading-relaxed mb-6 text-pretty">
                OncreeSaaS was born from the frustration of juggling multiple tools to manage business operations. We
                believe that running a business should be simple, not complicated by scattered software solutions.
              </p>

              <p className="text-lg text-card-foreground leading-relaxed mb-6 text-pretty">
                Our comprehensive platform combines project management, time tracking, appointment scheduling,
                invoicing, and CRM functionality into one seamless experience. Whether you're a freelancer, small
                business, or growing enterprise, OncreeSaaS adapts to your needs.
              </p>

              <p className="text-lg text-card-foreground leading-relaxed text-pretty">
                Join thousands of businesses who have streamlined their operations and boosted their productivity with
                OncreeSaaS. Focus on what you do best – we'll handle the rest.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
