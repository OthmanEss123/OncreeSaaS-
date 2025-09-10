import { SharedLayout } from "@/components/shared-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Phone, MapPin, Clock } from "lucide-react"

export default function Contact() {
  return (
    <SharedLayout>
      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight text-balance">
            Get in <span className="text-primary">Touch</span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-muted-foreground leading-relaxed text-pretty max-w-3xl mx-auto">
            Have questions about OncreeSaaS? We'd love to hear from you. Send us a message and we'll respond as soon as
            possible.
          </p>
        </div>
      </section>

      {/* Contact Form & Info */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16">
            {/* Contact Form */}
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-8">Send us a message</h2>
              <form className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-foreground mb-2">
                      First Name
                    </label>
                    <Input id="firstName" type="text" placeholder="Enter your first name" className="w-full" required />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-foreground mb-2">
                      Last Name
                    </label>
                    <Input id="lastName" type="text" placeholder="Enter your last name" className="w-full" required />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                    Email Address
                  </label>
                  <Input id="email" type="email" placeholder="Enter your email address" className="w-full" required />
                </div>

                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-foreground mb-2">
                    Company (Optional)
                  </label>
                  <Input id="company" type="text" placeholder="Enter your company name" className="w-full" />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-foreground mb-2">
                    Subject
                  </label>
                  <Input id="subject" type="text" placeholder="What's this about?" className="w-full" required />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                    Message
                  </label>
                  <Textarea
                    id="message"
                    placeholder="Tell us more about your inquiry..."
                    className="w-full min-h-32"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Send Message
                </Button>
              </form>
            </div>

            {/* Contact Information */}
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-8">Contact Information</h2>
              <div className="space-y-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">Email Us</h3>
                    <p className="text-muted-foreground mb-2">Our team is here to help</p>
                    <a href="mailto:hello@oncreesaas.com" className="text-primary hover:underline">
                      hello@oncreesaas.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">Call Us</h3>
                    <p className="text-muted-foreground mb-2">Mon-Fri from 8am to 5pm</p>
                    <a href="tel:+1234567890" className="text-primary hover:underline">
                      +1 (234) 567-890
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">Visit Us</h3>
                    <p className="text-muted-foreground mb-2">Come say hello at our office</p>
                    <address className="text-primary not-italic">
                      123 Business Street
                      <br />
                      Suite 100
                      <br />
                      San Francisco, CA 94105
                    </address>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground mb-1">Business Hours</h3>
                    <div className="text-muted-foreground space-y-1">
                      <p>Monday - Friday: 8:00 AM - 6:00 PM</p>
                      <p>Saturday: 9:00 AM - 4:00 PM</p>
                      <p>Sunday: Closed</p>
                    </div>
                  </div>
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
            <p className="text-lg text-muted-foreground">Quick answers to common questions</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-card p-6 rounded-xl border border-border">
              <h3 className="text-lg font-semibold text-card-foreground mb-2">How quickly will you respond?</h3>
              <p className="text-muted-foreground">
                We typically respond to all inquiries within 24 hours during business days. For urgent matters, please
                call us directly.
              </p>
            </div>

            <div className="bg-card p-6 rounded-xl border border-border">
              <h3 className="text-lg font-semibold text-card-foreground mb-2">Do you offer phone support?</h3>
              <p className="text-muted-foreground">
                Yes, we offer phone support for all our customers. Pro and Enterprise customers get priority phone
                support.
              </p>
            </div>

            <div className="bg-card p-6 rounded-xl border border-border">
              <h3 className="text-lg font-semibold text-card-foreground mb-2">Can I schedule a demo?</h3>
              <p className="text-muted-foreground">
                We'd be happy to show you how OncreeSaaS can help your business. Contact us to schedule a personalized
                demo.
              </p>
            </div>

            <div className="bg-card p-6 rounded-xl border border-border">
              <h3 className="text-lg font-semibold text-card-foreground mb-2">Do you offer custom solutions?</h3>
              <p className="text-muted-foreground">
                Yes, we work with Enterprise customers to create custom solutions that fit their specific business
                needs.
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
            Don't wait to transform your business operations. Start your free trial today.
          </p>
          <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
            Start Free Trial
          </Button>
        </div>
      </section>
    </SharedLayout>
  )
}
